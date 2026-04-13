// ========================================================
// ISA 필기시험 시스템 - 메인 애플리케이션 로직
// ========================================================

(function() {
  'use strict';

  // === State ===
  // === Toss Payments Config ===
  // ★ 테스트 모드 키입니다. 실서비스 시 라이브 키로 교체하세요! ★
  const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
  const EXAM_PRICE = 300000; // 응시료 (4급/3급: 30만원)
  const EXAM_TICKET_KEY = 'isa_exam_ticket';
  const TICKET_VALIDITY_HOURS = 48; // 응시권 유효시간
  const GOOGLE_SCRIPT_URL = ''; // 구글 앱스 스크립트 배포 URL을 여기에 넣으세요.


  const state = {
    currentScreen: 'landing',
    selectedDiscipline: null,
    selectedLevel: null,
    userName: '',
    userPhone: '',
    userBirth: '',
    userEmail: '',
    examQuestions: [],
    answers: {},
    currentQuestion: 0,
    timeRemaining: 0,
    timerInterval: null,
    examStartTime: null,
    examEndTime: null,
    isReviewMode: false,
    showSubmitModal: false,
    showTimeUpModal: false,
    paymentProcessing: false
  };

  // === Utility Functions ===
  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getTimerClass() {
    if (state.timeRemaining <= 60) return 'danger';
    if (state.timeRemaining <= 300) return 'warning';
    return '';
  }

  // Telegram Notification via GAS
  async function notifyTelegram(message) {
    if (!GOOGLE_SCRIPT_URL) return;
    try {
      // POST 요청으로 알림 데이터 전송
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // GAS CORS 이슈 회피를 위해 no-cors 사용 (성공 여부 상관없이 발송)
        body: JSON.stringify({
          action: 'addMember', // 기존 addMember 핸들러 재활용 (또는 별도 추가 가능)
          name: state.userName || '미입력',
          plan: '자격증 시험 신청: ' + message,
          certNumber: 'PAYMENT_ALERT',
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Telegram notification error:', e);
    }
  }


  // === Render Functions ===
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="bg-grid"></div>
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      ${renderHeader()}
      <div class="container">
        ${renderScreen()}
      </div>
      ${state.showSubmitModal ? renderSubmitModal() : ''}
      ${state.showTimeUpModal ? renderTimeUpModal() : ''}
    `;
    attachEvents();
  }

  function renderHeader() {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="logo-area">
            <div class="logo-icon">ISA</div>
            <div class="logo-text">
              <h1>국제인공서핑협회</h1>
              <p>WRITTEN EXAMINATION SYSTEM</p>
            </div>
          </div>
          <div class="header-badge">📋 필기시험</div>
        </div>
      </header>
    `;
  }

  function renderScreen() {
    switch(state.currentScreen) {
      case 'landing': return renderLanding();
      case 'userinfo': return renderUserInfo();
      case 'payment': return renderPayment();
      case 'exam': return renderExam();
      case 'result': return renderResult();
      default: return '';
    }
  }

  // === Landing Screen ===
  function renderLanding() {
    return `
      <div class="screen active" id="screen-landing">
        <div class="landing-hero">
          <div class="icon-wrap">📝</div>
          <h2>ISA 자격증 필기시험</h2>
          <p>국제인공서핑협회 공인 자격증 취득을 위한 필기시험입니다. 종목과 등급을 선택하세요.</p>
        </div>

        <div class="section-title"><div class="bar"></div>종목 선택</div>
        <div class="card-grid">
          ${EXAM_CONFIG.disciplines.map(d => `
            <div class="card ${state.selectedDiscipline === d.id ? 'selected' : ''}" data-action="select-discipline" data-id="${d.id}">
              <span class="card-icon">${d.icon}</span>
              <div class="card-title">${d.nameKR}</div>
              <div class="card-desc">${d.name}</div>
            </div>
          `).join('')}
        </div>

        <div class="section-title"><div class="bar"></div>등급 선택</div>
        <div class="card-grid">
          ${EXAM_CONFIG.levels.map(l => `
            <div class="card ${state.selectedLevel === l.id ? 'selected' : ''} ${!l.available ? 'disabled' : ''}" 
                 data-action="select-level" data-id="${l.id}" ${!l.available ? '' : ''}>
              <span class="card-icon">${l.id}급</span>
              <div class="card-title">${l.name} · ${l.desc}</div>
              ${l.available 
                ? '<span class="card-badge ready">응시 가능</span>' 
                : '<span class="card-badge">준비 중</span>'}
            </div>
          `).join('')}
        </div>

        <div class="info-box">
          <h4>ℹ️ 시험 안내</h4>
          <ul>
            <li>총 50문항 중 <strong>15문항</strong>이 랜덤으로 출제됩니다.</li>
            <li>시험 시간은 <strong>30분</strong>입니다.</li>
            <li>합격 기준: <strong>70% 이상</strong> (15문항 중 11문항 이상 정답)</li>
            <li>4지선다 객관식 문제입니다.</li>
            <li>시험 중 뒤로가기 및 문항 이동이 자유롭습니다.</li>
          </ul>
        </div>

        <button class="btn btn-primary btn-full btn-lg" data-action="go-userinfo"
                ${!state.selectedDiscipline || !state.selectedLevel ? 'disabled' : ''}>
          다음 단계 →
        </button>
      </div>
    `;
  }

  // === User Info Screen ===
  function renderUserInfo() {
    const disc = EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline);
    const level = EXAM_CONFIG.levels.find(l => l.id === state.selectedLevel);

    return `
      <div class="screen active" id="screen-userinfo">
        <div class="landing-hero" style="padding: 40px 0 30px;">
          <h2>응시자 정보 입력</h2>
          <p>시험 결과의 정확한 기록을 위해 아래 정보를 입력해주세요.</p>
        </div>

        <div class="info-box" style="margin-bottom: 24px;">
          <h4>📋 시험 정보</h4>
          <ul>
            <li>종목: <strong>${disc ? disc.nameKR : ''}</strong> (${disc ? disc.name : ''})</li>
            <li>등급: <strong>${level ? level.name : ''}</strong> - ${level ? level.desc : ''}</li>
            <li>문항 수: <strong>${EXAM_CONFIG.questionsPerExam}문항</strong> (50문항 중 랜덤 출제)</li>
            <li>제한 시간: <strong>${EXAM_CONFIG.timeLimitMinutes}분</strong></li>
          </ul>
        </div>

        <div class="form-group">
          <label class="form-label">이름 (실명) *</label>
          <input type="text" class="form-input" id="input-name" placeholder="홍길동" 
                 value="${state.userName}" data-field="userName" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">연락처 *</label>
            <input type="tel" class="form-input" id="input-phone" placeholder="010-1234-5678"
                   value="${state.userPhone}" data-field="userPhone" />
          </div>
          <div class="form-group">
            <label class="form-label">생년월일 (6자리) *</label>
            <input type="text" class="form-input" id="input-birth" placeholder="990101" maxlength="6"
                   value="${state.userBirth}" data-field="userBirth" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">이메일 * (결제 영수증 발송용)</label>
          <input type="email" class="form-input" id="input-email" placeholder="surfer@isa.world"
                 value="${state.userEmail}" data-field="userEmail" />
        </div>

        <div style="display:flex; gap:12px; margin-top:20px;">
          <button class="btn btn-secondary" data-action="go-landing" style="flex:1;">
            ← 이전
          </button>
          <button class="btn btn-primary btn-lg" data-action="go-payment" style="flex:2;">
            💳 결제 및 응시 →
          </button>
        </div>
      </div>
    `;
  }

  // === Exam Screen ===
  function renderExam() {
    const q = state.examQuestions[state.currentQuestion];
    if (!q) return '';
    const answered = Object.keys(state.answers).length;
    const total = state.examQuestions.length;
    const progress = ((state.currentQuestion + 1) / total) * 100;
    const disc = EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline);

    return `
      <div class="screen active" id="screen-exam">
        <div class="exam-header">
          <div class="exam-header-inner">
            <div class="exam-meta">
              <span class="badge badge-discipline">${disc ? disc.icon : ''} ${disc ? disc.nameKR : ''}</span>
              <span class="badge badge-level">🏅 ${state.selectedLevel}급</span>
            </div>
            <div class="timer ${getTimerClass()}">
              <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              ${formatTime(state.timeRemaining)}
            </div>
          </div>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-info">
            <span class="label">진행률</span>
            <span class="value">${answered}/${total} 답변 완료</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(answered / total) * 100}%"></div>
          </div>
        </div>

        <div class="question-card">
          <div class="question-number">
            문항 ${state.currentQuestion + 1} / ${total}
          </div>
          <div class="question-text">${q.question}</div>
          <div class="options-list">
            ${q.options.map((opt, i) => {
              const isSelected = state.answers[q.id] === i;
              let extraClass = isSelected ? 'selected' : '';
              
              if (state.isReviewMode) {
                extraClass = '';
                if (i === q.answer) extraClass = 'correct';
                else if (state.answers[q.id] === i && i !== q.answer) extraClass = 'wrong';
              }

              const markers = ['①', '②', '③', '④'];
              return `
                <div class="option ${extraClass}" data-action="${state.isReviewMode ? '' : 'select-answer'}" data-qid="${q.id}" data-idx="${i}">
                  <div class="option-marker">${state.isReviewMode ? (i === q.answer ? '✓' : (state.answers[q.id] === i ? '✗' : markers[i])) : markers[i]}</div>
                  <div class="option-text">${opt}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="question-dots">
          ${state.examQuestions.map((eq, i) => {
            let dotClass = '';
            if (state.isReviewMode) {
              const isCorrect = state.answers[eq.id] === eq.answer;
              dotClass = state.answers[eq.id] !== undefined ? (isCorrect ? 'review-correct' : 'review-wrong') : '';
            } else {
              if (i === state.currentQuestion) dotClass = 'current';
              else if (state.answers[eq.id] !== undefined) dotClass = 'answered';
            }
            return `<div class="dot ${dotClass}" data-action="jump-question" data-idx="${i}">${i + 1}</div>`;
          }).join('')}
        </div>

        <div class="exam-nav">
          <button class="btn btn-secondary" data-action="prev-question" ${state.currentQuestion === 0 ? 'disabled' : ''}>
            ← 이전 문항
          </button>
          ${state.currentQuestion === total - 1 ? `
            ${state.isReviewMode ? `
              <button class="btn btn-primary" data-action="go-landing">
                🏠 처음으로
              </button>
            ` : `
              <button class="btn btn-primary" data-action="show-submit">
                📤 제출하기
              </button>
            `}
          ` : `
            <button class="btn btn-primary" data-action="next-question">
              다음 문항 →
            </button>
          `}
        </div>

        ${!state.isReviewMode && answered === total ? `
          <div class="submit-wrap">
            <button class="btn btn-primary btn-lg" data-action="show-submit">
              ✅ 모든 문항 답변 완료 - 제출하기
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // === Result Screen ===
  function renderResult() {
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach(q => {
      if (state.answers[q.id] === q.answer) correct++;
    });
    const wrong = total - correct;
    const scorePercent = Math.round((correct / total) * 100);
    const passed = scorePercent >= EXAM_CONFIG.passingScore;

    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (circumference * scorePercent / 100);

    const disc = EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline);
    const elapsed = state.examEndTime && state.examStartTime 
      ? Math.round((state.examEndTime - state.examStartTime) / 1000) 
      : 0;

    return `
      <div class="screen active" id="screen-result">
        ${passed ? renderConfetti() : ''}
        
        <div class="result-hero">
          <div class="result-circle">
            <svg width="180" height="180">
              <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
              <circle cx="90" cy="90" r="70" fill="none" 
                      stroke="${passed ? 'var(--green-400)' : 'var(--red-400)'}" 
                      stroke-width="8" stroke-linecap="round"
                      stroke-dasharray="${circumference}" 
                      stroke-dashoffset="${offset}"
                      style="transition: stroke-dashoffset 1.5s ease;"/>
            </svg>
            <div>
              <div class="score-text" style="color: ${passed ? 'var(--green-400)' : 'var(--red-400)'}">
                ${scorePercent}
              </div>
              <div class="score-unit">점</div>
            </div>
          </div>

          <div class="result-pass ${passed ? 'pass' : 'fail'}">
            ${passed ? '🎉 합격' : '😔 불합격'}
          </div>

          <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; max-width: 400px; margin: 0 auto;">
            ${state.userName}님의 <strong>${disc ? disc.nameKR : ''} ${state.selectedLevel}급</strong> 필기시험 결과입니다.
            ${passed ? '축하합니다! 실기시험을 준비하세요.' : '70% 이상 득점 시 합격입니다. 다시 도전해보세요!'}
          </p>
        </div>

        <div class="result-stats">
          <div class="stat-card correct">
            <div class="stat-value">${correct}</div>
            <div class="stat-label">정답</div>
          </div>
          <div class="stat-card wrong">
            <div class="stat-value">${wrong}</div>
            <div class="stat-label">오답</div>
          </div>
          <div class="stat-card total">
            <div class="stat-value">${formatTime(elapsed)}</div>
            <div class="stat-label">소요시간</div>
          </div>
        </div>

        <div class="info-box">
          <h4>📊 시험 상세</h4>
          <ul>
            <li>응시자: ${state.userName} (${state.userPhone})</li>
            <li>종목: ${disc ? disc.nameKR : ''} (${disc ? disc.name : ''})</li>
            <li>등급: ${state.selectedLevel}급</li>
            <li>합격 기준: ${EXAM_CONFIG.passingScore}% (${Math.ceil(total * EXAM_CONFIG.passingScore / 100)}문항 이상)</li>
            <li>응시 일시: ${new Date().toLocaleString('ko-KR')}</li>
          </ul>
        </div>

        <div class="result-actions">
          <button class="btn btn-secondary" data-action="review-exam">
            📖 오답 확인
          </button>
          <button class="btn btn-primary" data-action="restart-exam">
            🔄 다시 응시
          </button>
          <button class="btn btn-secondary" data-action="go-landing">
            🏠 처음으로
          </button>
        </div>
      </div>
    `;
  }

  // === Confetti ===
  function renderConfetti() {
    const colors = ['#22d3ee', '#4ade80', '#fbbf24', '#a855f7', '#f43f5e', '#fff'];
    let confettiHTML = '';
    for (let i = 0; i < 60; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 3;
      const size = 6 + Math.random() * 8;
      const shape = Math.random() > 0.5 ? '50%' : '2px';
      confettiHTML += `<div class="confetti" style="
        left:${left}%; 
        background:${color}; 
        width:${size}px; height:${size}px; 
        border-radius:${shape};
        animation-duration:${duration}s; 
        animation-delay:${delay}s;
      "></div>`;
    }
    return `<div class="confetti-wrap">${confettiHTML}</div>`;
  }

  // === Modals ===
  function renderSubmitModal() {
    const answered = Object.keys(state.answers).length;
    const total = state.examQuestions.length;
    const unanswered = total - answered;

    return `
      <div class="modal-overlay" data-action="close-modal">
        <div class="modal" onclick="event.stopPropagation()">
          <h3>시험을 제출하시겠습니까?</h3>
          <p>
            ${unanswered > 0 
              ? `⚠️ <strong>${unanswered}개 문항</strong>이 아직 답변되지 않았습니다.<br>미답변 문항은 오답 처리됩니다.`
              : `✅ 모든 ${total}개 문항에 답변하셨습니다.<br>제출 후에는 수정할 수 없습니다.`}
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" data-action="close-modal">돌아가기</button>
            <button class="btn btn-primary" data-action="submit-exam">제출하기</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderTimeUpModal() {
    return `
      <div class="modal-overlay">
        <div class="modal">
          <h3>⏰ 시험 시간 종료</h3>
          <p>30분의 시험 시간이 모두 경과하였습니다.<br>답변한 내용을 기준으로 자동 채점됩니다.</p>
          <div class="modal-actions">
            <button class="btn btn-primary" data-action="submit-exam">결과 확인</button>
          </div>
        </div>
      </div>
    `;
  }

  // === Event Handling ===
  function attachEvents() {
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', handleAction);
    });

    // Form input listeners
    document.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', (e) => {
        state[e.target.dataset.field] = e.target.value;
      });
    });
  }

  function handleAction(e) {
    const action = e.currentTarget.dataset.action;
    if (!action) return;

    switch(action) {
      case 'select-discipline': {
        const id = e.currentTarget.dataset.id;
        state.selectedDiscipline = id;
        render();
        break;
      }
      case 'select-level': {
        const id = parseInt(e.currentTarget.dataset.id);
        const level = EXAM_CONFIG.levels.find(l => l.id === id);
        if (level && level.available) {
          state.selectedLevel = id;
          render();
        }
        break;
      }
      case 'go-landing': {
        resetState();
        render();
        break;
      }
      case 'go-userinfo': {
        if (state.selectedDiscipline && state.selectedLevel) {
          state.currentScreen = 'userinfo';
          render();
          window.scrollTo(0, 0);
        }
        break;
      }
      case 'go-payment': {
        goToPayment();
        break;
      }
      case 'start-exam': {
        startExam();
        break;
      }
      case 'do-payment': {
        processPayment();
        break;
      }
      case 'select-answer': {
        const qid = parseInt(e.currentTarget.dataset.qid);
        const idx = parseInt(e.currentTarget.dataset.idx);
        state.answers[qid] = idx;
        render();
        break;
      }
      case 'prev-question': {
        if (state.currentQuestion > 0) {
          state.currentQuestion--;
          render();
          scrollToQuestion();
        }
        break;
      }
      case 'next-question': {
        if (state.currentQuestion < state.examQuestions.length - 1) {
          state.currentQuestion++;
          render();
          scrollToQuestion();
        }
        break;
      }
      case 'jump-question': {
        const idx = parseInt(e.currentTarget.dataset.idx);
        state.currentQuestion = idx;
        render();
        scrollToQuestion();
        break;
      }
      case 'show-submit': {
        state.showSubmitModal = true;
        render();
        break;
      }
      case 'close-modal': {
        state.showSubmitModal = false;
        state.showTimeUpModal = false;
        render();
        break;
      }
      case 'submit-exam': {
        submitExam();
        break;
      }
      case 'review-exam': {
        state.isReviewMode = true;
        state.currentScreen = 'exam';
        state.currentQuestion = 0;
        render();
        window.scrollTo(0, 0);
        break;
      }
      case 'restart-exam': {
        state.currentScreen = 'userinfo';
        state.answers = {};
        state.currentQuestion = 0;
        state.isReviewMode = false;
        state.showSubmitModal = false;
        state.showTimeUpModal = false;
        render();
        window.scrollTo(0, 0);
        break;
      }
    }
  }

  function scrollToQuestion() {
    const card = document.querySelector('.question-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // === Payment & Ticket System ===

  function getExamPrice() {
    // 4급/3급: 30만원, 2급/1급: 50만원
    return (state.selectedLevel >= 3) ? 300000 : 500000;
  }

  function getValidTicket() {
    try {
      const ticketStr = localStorage.getItem(EXAM_TICKET_KEY);
      if (!ticketStr) return null;
      const ticket = JSON.parse(ticketStr);
      const now = Date.now();
      const expiry = new Date(ticket.expiresAt).getTime();
      if (now > expiry) {
        localStorage.removeItem(EXAM_TICKET_KEY);
        return null; // 만료
      }
      return ticket;
    } catch (e) {
      return null;
    }
  }

  function saveTicket(paymentData) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TICKET_VALIDITY_HOURS * 60 * 60 * 1000);
    const ticket = {
      paymentKey: paymentData.paymentKey || 'PAID_' + Date.now(),
      orderId: paymentData.orderId || 'ORD_' + Date.now(),
      amount: paymentData.amount || getExamPrice(),
      userName: state.userName,
      userPhone: state.userPhone,
      userEmail: state.userEmail,
      discipline: state.selectedDiscipline,
      level: state.selectedLevel,
      paidAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false
    };
    localStorage.setItem(EXAM_TICKET_KEY, JSON.stringify(ticket));
    return ticket;
  }

  function formatRemaining(ticket) {
    const now = Date.now();
    const exp = new Date(ticket.expiresAt).getTime();
    const diff = exp - now;
    if (diff <= 0) return '만료됨';
    const h = Math.floor(diff / (1000*60*60));
    const m = Math.floor((diff % (1000*60*60)) / (1000*60));
    return `${h}시간 ${m}분 남음`;
  }

  function goToPayment() {
    // Validate user info
    const name = state.userName.trim();
    const phone = state.userPhone.trim();
    const birth = state.userBirth.trim();
    const email = state.userEmail.trim();

    if (!name) { alert('이름을 입력해주세요.'); return; }
    if (!phone) { alert('연락처를 입력해주세요.'); return; }
    if (!birth || birth.length < 6) { alert('생년월일 6자리를 입력해주세요.'); return; }
    if (!email) { alert('이메일을 입력해주세요.'); return; }

    state.currentScreen = 'payment';
    render();
    window.scrollTo(0, 0);
  }

  function renderPayment() {
    const disc = EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline);
    const level = EXAM_CONFIG.levels.find(l => l.id === state.selectedLevel);
    const price = getExamPrice();
    const ticket = getValidTicket();

    // 이미 유효한 응시권이 있으면 바로 시험 시작 가능
    if (ticket && ticket.discipline === state.selectedDiscipline && ticket.level === state.selectedLevel) {
      return `
        <div class="screen active" id="screen-payment">
          <div class="landing-hero" style="padding: 40px 0 30px;">
            <div class="icon-wrap" style="background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4);">✅</div>
            <h2>결제 완료 · 응시권 유효</h2>
            <p>이미 결제가 완료되었습니다. 응시권 유효 시간 내에 시험을 시작하세요.</p>
          </div>

          <div class="info-box" style="border-color: rgba(34,197,94,0.3); margin-bottom: 24px;">
            <h4>🎫 응시권 정보</h4>
            <ul>
              <li>응시자: <strong>${ticket.userName}</strong></li>
              <li>종목: <strong>${disc ? disc.nameKR : ''}</strong></li>
              <li>등급: <strong>${ticket.level}급</strong></li>
              <li>결제 금액: <strong>₩${ticket.amount.toLocaleString()}</strong></li>
              <li>결제 일시: <strong>${new Date(ticket.paidAt).toLocaleString('ko-KR')}</strong></li>
              <li style="color: #22d3ee; font-weight: 700;">⏰ 남은 시간: <strong>${formatRemaining(ticket)}</strong></li>
            </ul>
          </div>

          <div style="display:flex; gap:12px;">
            <button class="btn btn-secondary" data-action="go-userinfo" style="flex:1;">← 이전</button>
            <button class="btn btn-primary btn-lg" data-action="start-exam" style="flex:2;">🚀 시험 시작하기</button>
          </div>
        </div>
      `;
    }

    // 결제 화면
    return `
      <div class="screen active" id="screen-payment">
        <div class="landing-hero" style="padding: 40px 0 30px;">
          <div class="icon-wrap">💳</div>
          <h2>응시료 결제</h2>
          <p>시험 응시를 위해 아래 금액을 결제해주세요.<br>결제 완료 후 <strong>48시간 이내</strong>에 응시 가능합니다.</p>
        </div>

        <div class="info-box" style="margin-bottom: 24px;">
          <h4>📋 결제 정보</h4>
          <ul>
            <li>응시자: <strong>${state.userName}</strong> (${state.userPhone})</li>
            <li>종목: <strong>${disc ? disc.nameKR : ''}</strong> (${disc ? disc.name : ''})</li>
            <li>등급: <strong>${level ? level.name : ''}</strong></li>
            <li>문항 수: <strong>${EXAM_CONFIG.questionsPerExam}문항</strong></li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(37,99,235,0.1)); border: 1px solid rgba(6,182,212,0.3); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">응시료</div>
          <div style="font-size: 42px; font-weight: 900; color: #22d3ee; font-family: 'Inter',sans-serif; letter-spacing: -1px;">₩${price.toLocaleString()}</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 8px;">결제 완료 후 48시간 이내 응시 가능</div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px; font-weight: 600;">💡 결제 안내</div>
          <ul style="font-size: 13px; color: #64748b; list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;">
            <li>• 신용카드, 간편결제(토스페이, 카카오페이 등) 사용 가능</li>
            <li>• 결제 완료 즉시 시험 응시가 가능합니다</li>
            <li>• 응시권은 결제 시점으로부터 48시간 유효합니다</li>
            <li>• 시험 불합격 시 재결제 후 재응시 가능합니다</li>
          </ul>
        </div>

        <div style="display:flex; gap:12px;">
          <button class="btn btn-secondary" data-action="go-userinfo" style="flex:1;">← 이전</button>
          <button class="btn btn-primary btn-lg" data-action="do-payment" style="flex:2;" ${state.paymentProcessing ? 'disabled' : ''}>
            ${state.paymentProcessing ? '⏳ 결제 처리 중...' : '💳 토스페이먼츠로 결제하기'}
          </button>
        </div>
      </div>
    `;
  }

  async function processPayment() {
    if (state.paymentProcessing) return;
    state.paymentProcessing = true;
    render();

    const price = getExamPrice();
    const orderId = 'ISA-EXAM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const disc = EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline);
    const orderName = `ISA ${disc ? disc.nameKR : ''} ${state.selectedLevel}급 필기시험 응시료`;

    try {
      // 토스페이먼츠 SDK 초기화
      const tossPayments = TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: 'ISA_' + state.userPhone.replace(/\D/g, '') });

      // 카드 결제 요청
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: price },
        orderId: orderId,
        orderName: orderName,
        customerName: state.userName,
        customerEmail: state.userEmail,
        customerMobilePhone: state.userPhone.replace(/\D/g, ''),
        successUrl: window.location.origin + window.location.pathname + '?payment=success',
        failUrl: window.location.origin + window.location.pathname + '?payment=fail',
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false
        }
      });

    } catch (error) {
      // 사용자가 결제를 취소했거나 오류 발생
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.');
      } else if (error.code === 'INVALID_CARD_COMPANY') {
        alert('유효하지 않은 카드입니다.');
      } else {
        // 테스트 모드: 결제 SDK 오류 시에도 테스트 결제 성공 처리
        console.warn('결제 SDK 오류 (테스트 모드에서 성공 처리):', error);
        const ticket = saveTicket({ paymentKey: 'TEST_' + Date.now(), orderId, amount: price });
        alert('✅ 테스트 결제가 완료되었습니다!\n48시간 이내에 시험을 시작하세요.');
        state.currentScreen = 'payment';
      }
      state.paymentProcessing = false;
      render();
    }
  }

  // 결제 성공 리다이렉트 처리
  function checkPaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const paymentKey = params.get('paymentKey') || 'PK_' + Date.now();
      const orderId = params.get('orderId') || 'ORD_' + Date.now();
      const amount = parseInt(params.get('amount')) || getExamPrice();

      saveTicket({ paymentKey, orderId, amount });

      // URL 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);

      alert('✅ 결제가 완료되었습니다!\n48시간 이내에 시험을 시작하세요.');
      
      // 텔레그램 알림 발송
      notifyTelegram(`[결제완료] ${state.selectedDiscipline} ${state.selectedLevel}급 (₩${amount.toLocaleString()})`);
      
      state.currentScreen = 'payment';
      render();

    } else if (params.get('payment') === 'fail') {
      const message = params.get('message') || '결제가 실패했습니다.';
      alert('❌ ' + message);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // === Exam Logic ===
  function startExam() {
    // 응시권 확인
    const ticket = getValidTicket();
    if (!ticket) {
      alert('유효한 응시권이 없습니다. 결제를 먼저 완료해주세요.');
      state.currentScreen = 'payment';
      render();
      return;
    }

    // Validate form
    const name = state.userName.trim() || ticket.userName;
    const phone = state.userPhone.trim() || ticket.userPhone;

    if (!name) { alert('이름을 입력해주세요.'); return; }
    if (!phone) { alert('연락처를 입력해주세요.'); return; }

    // Select random questions based on discipline and level
    const level = state.selectedLevel || 4;
    const discipline = state.selectedDiscipline || 'body';
    const allQuestions = (typeof getQuestionBank === 'function')
      ? getQuestionBank(discipline, level)
      : [...QUESTIONS_LEVEL4];
    const shuffled = shuffleArray(allQuestions);
    state.examQuestions = shuffled.slice(0, EXAM_CONFIG.questionsPerExam);

    // Reset exam state
    state.answers = {};
    state.currentQuestion = 0;
    state.isReviewMode = false;
    state.showSubmitModal = false;
    state.showTimeUpModal = false;
    state.examStartTime = Date.now();
    state.examEndTime = null;

    // Start timer
    state.timeRemaining = EXAM_CONFIG.timeLimitMinutes * 60;
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeRemaining--;
      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        state.timeRemaining = 0;
        state.showTimeUpModal = true;
        render();
      } else {
        const timerEl = document.querySelector('.timer');
        if (timerEl) {
          timerEl.innerHTML = `
            <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${formatTime(state.timeRemaining)}
          `;
          timerEl.className = 'timer ' + getTimerClass();
        }
      }
    }, 1000);

    // 응시권 사용 처리
    ticket.used = true;
    localStorage.setItem(EXAM_TICKET_KEY, JSON.stringify(ticket));

    state.currentScreen = 'exam';
    render();
    window.scrollTo(0, 0);
  }

  function submitExam() {
    // Stop timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    state.examEndTime = Date.now();
    state.showSubmitModal = false;
    state.showTimeUpModal = false;
    state.currentScreen = 'result';
    render();
    window.scrollTo(0, 0);

    // Save result to localStorage
    saveResult();
  }

  function saveResult() {
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach(q => {
      if (state.answers[q.id] === q.answer) correct++;
    });

    const result = {
      timestamp: new Date().toISOString(),
      userName: state.userName,
      userPhone: state.userPhone,
      discipline: state.selectedDiscipline,
      level: state.selectedLevel,
      totalQuestions: total,
      correctAnswers: correct,
      scorePercent: Math.round((correct / total) * 100),
      passed: Math.round((correct / total) * 100) >= EXAM_CONFIG.passingScore,
      elapsedSeconds: state.examEndTime ? Math.round((state.examEndTime - state.examStartTime) / 1000) : 0
    };

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('isa_exam_history') || '[]');
    history.push(result);
    localStorage.setItem('isa_exam_history', JSON.stringify(history));

    console.log('시험 결과 저장:', result);
    
    // 텔레그램 알림 발송
    const status = result.passed ? '🎉 합격' : '😔 불합격';
    notifyTelegram(`[시험종료] ${result.discipline} ${result.level}급 - 결과: ${status} (${result.scorePercent}점)`);
  }


  function resetState() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.currentScreen = 'landing';
    state.selectedDiscipline = null;
    state.selectedLevel = null;
    state.userName = '';
    state.userPhone = '';
    state.userBirth = '';
    state.examQuestions = [];
    state.answers = {};
    state.currentQuestion = 0;
    state.timeRemaining = 0;
    state.examStartTime = null;
    state.examEndTime = null;
    state.isReviewMode = false;
    state.showSubmitModal = false;
    state.showTimeUpModal = false;
  }

  // === Initialize ===
  checkPaymentReturn();
  render();

})();
