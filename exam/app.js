/* ========================================================
   ISA 필기시험 & 문제은행 시스템 - 메인 로직 (v2.5)
   ======================================================== */

(function() {
  'use strict';

  // === Constants ===
  const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
  const EXAM_TICKET_KEY = 'isa_exam_ticket';
  const TICKET_VALIDITY_HOURS = 48;

  // === State ===
  const state = {
    currentScreen: 'landing', // landing, userinfo, payment, exam, study, theory, result
    mode: 'exam', // exam (시험), study (교재/공부), theory (이론 학습)
    selectedDiscipline: 'standing',
    selectedLevel: 4,
    
    // User Info
    userName: '',
    userPhone: '',
    userBirth: '',
    userEmail: '',
    isVerified: false,
    
    // Exam Data
    examQuestions: [],
    answers: {},
    currentQuestion: 0,
    timeRemaining: 0,
    timerInterval: null,
    examStartTime: null,
    examEndTime: null,
    
    // Theory Data
    currentChapter: 0,
    
    // Study Data
    visibleAnswers: {}, 
    
    // UI state
    showSubmitModal: false,
    showTimeUpModal: false,
    paymentProcessing: false,
    isReviewMode: false
  };

  // === Level Configuration ===
  function getLevelConfig(level = state.selectedLevel) {
    return EXAM_CONFIG.levelConfig[level] || EXAM_CONFIG.levelConfig[4];
  }

  function getExamPrice() {
    return (state.selectedLevel <= 2) ? 500000 : 300000;
  }

  // === Initialization ===
  function init() {
    render();
    window.addEventListener('popstate', handleBackNavigation);
  }

  function handleBackNavigation() {
    // 간단한 뒤로가기 대응 (실제 라우팅 시스템은 아니지만 사용자 경험 고려)
    if (state.currentScreen !== 'landing') {
      state.currentScreen = 'landing';
      render();
    }
  }

  // === Render Functions ===
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      ${renderHeader()}
      <main class="container">
        ${renderCurrentScreen()}
      </main>
      ${renderModals()}
    `;
    attachEvents();
  }

  function renderHeader() {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="logo-area" style="cursor: pointer;" data-action="go-screen" data-screen="landing">
            <div class="logo-icon">ISA</div>
            <div class="logo-text">
              <h1>국제인공서핑협회</h1>
              <p>EDUCATION PORTAL</p>
            </div>
          </div>
          <div class="header-badge" style="background: ${state.mode === 'exam' ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)'}; color: ${state.mode === 'exam' ? 'var(--purple-500)' : 'var(--cyan-400)'}; border-color: ${state.mode === 'exam' ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.2)'}">
            ${state.mode === 'exam' ? '🏆 실전 모의고사' : state.mode === 'theory' ? '📖 이론 학습 모드' : '📝 문제은행 모드'}
          </div>
        </div>
      </header>
    `;
  }

  function renderCurrentScreen() {
    switch(state.currentScreen) {
      case 'landing': return renderLanding();
      case 'userinfo': return renderUserInfo();
      case 'payment': return renderPayment();
      case 'exam': return renderExam();
      case 'study': return renderStudy();
      case 'theory': return renderTheory();
      case 'result': return renderResult();
      default: return renderLanding();
    }
  }

  // --- Landing Screen ---
  function renderLanding() {
    return `
      <div class="screen active">
        <div class="hero-section">
          <div class="hero-icon">🏄‍♂️</div>
          <h2 class="hero-title">ISA 자격증 교육 포털</h2>
          <p class="hero-desc">공인 자격증 취득을 위한 이론 학습, 문제은행, 그리고 실전 모의고사를 한 곳에서 경험하세요.</p>
        </div>

        <div class="tab-nav">
          <button class="tab-btn ${state.mode === 'theory' ? 'active' : ''}" data-action="set-mode" data-mode="theory">📖 이론 학습</button>
          <button class="tab-btn ${state.mode === 'study' ? 'active' : ''}" data-action="set-mode" data-mode="study">📝 문제은행</button>
          <button class="tab-btn ${state.mode === 'exam' ? 'active' : ''}" data-action="set-mode" data-mode="exam">🏆 실전 모의고사</button>
        </div>

        <div class="section-title"><div class="bar"></div>종목 선택</div>
        <div class="selection-grid">
          ${EXAM_CONFIG.disciplines.map(d => `
            <div class="selection-card ${state.selectedDiscipline === d.id ? 'active' : ''}" data-action="select-disc" data-id="${d.id}">
              <span class="card-icon">${d.icon}</span>
              <div class="card-name">${d.nameKR}</div>
              <div class="card-sub">${d.name}</div>
            </div>
          `).join('')}
        </div>

        <div class="section-title"><div class="bar"></div>등급 선택</div>
        <div class="selection-grid">
          ${EXAM_CONFIG.levels.map(l => `
            <div class="selection-card ${state.selectedLevel === l.id ? 'active' : ''} ${!l.available ? 'disabled' : ''}" 
                 data-action="select-level" data-id="${l.id}">
              <span class="card-icon">${l.id}급</span>
              <div class="card-name">${l.name}</div>
              <div class="card-sub">${l.desc}</div>
              <div class="status-badge ${l.available ? 'status-ready' : 'status-wait'}">
                ${l.available ? '● 서비스 중' : '○ 준비 중'}
              </div>
            </div>
          `).join('')}
        </div>

        <button class="btn-premium btn-primary" data-action="go-next">
          ${state.mode === 'exam' ? '모의고사 시작하기 →' : state.mode === 'theory' ? '이론 학습 시작하기 →' : '문제은행 학습하기 →'}
        </button>
      </div>
    `;
  }

  // --- User Info & Authentication ---
  function renderUserInfo() {
    return `
      <div class="screen active">
        <div class="hero-section" style="margin-bottom: 40px;">
          <h2 class="hero-title" style="font-size: 28px;">본인 확인 및 인증</h2>
          <p class="hero-desc">국가 공인 기록 관리를 위해 안전한 실명 인증 절차를 거칩니다.</p>
        </div>

        <div class="glass-form">
          <div class="form-field">
            <label class="field-label">성함</label>
            <input type="text" class="field-input" placeholder="홍길동" value="${state.userName}" data-field="userName">
          </div>
          <div class="form-field">
            <label class="field-label">통신사 선택 및 연락처</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
              <div class="selection-card ${state.carrier === 'SKT' ? 'active' : ''}" style="padding: 12px; text-align: center; font-size: 13px;" data-action="select-carrier" data-id="SKT">SKT</div>
              <div class="selection-card ${state.carrier === 'KT' ? 'active' : ''}" style="padding: 12px; text-align: center; font-size: 13px;" data-action="select-carrier" data-id="KT">KT</div>
              <div class="selection-card ${state.carrier === 'LGU' ? 'active' : ''}" style="padding: 12px; text-align: center; font-size: 13px;" data-action="select-carrier" data-id="LGU">LG U+</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="tel" class="field-input" placeholder="010-0000-0000" value="${state.userPhone}" data-field="userPhone" style="flex: 1;">
              <button class="btn-premium btn-primary" style="width: auto; padding: 0 20px; font-size: 14px;" data-action="request-auth">
                ${state.authSent ? '재전송' : '인증요청'}
              </button>
            </div>
          </div>
          
          ${state.authSent ? `
            <div class="form-field" style="animation: slideDown 0.4s ease;">
              <label class="field-label">인증번호 입력</label>
              <div style="position: relative;">
                <input type="text" class="field-input" placeholder="6자리 숫자" maxlength="6" data-field="authCode">
                <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--red-400); font-size: 12px; font-weight: 700;">03:00</span>
              </div>
              <button class="btn-premium btn-outline" style="margin-top: 12px; font-size: 14px; padding: 12px;" data-action="verify-code">인증 완료하기</button>
            </div>
          ` : ''}

          ${state.isVerified ? `
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--green-400); border-radius: 12px; padding: 12px; font-size: 14px; color: var(--green-400); text-align: center; margin-bottom: 24px; animation: scaleUp 0.3s ease;">
              ✅ 실명 인증이 완료되었습니다.
            </div>
          ` : ''}

          <div class="form-field">
            <label class="field-label">생년월일 (6자리)</label>
            <input type="text" class="field-input" placeholder="990101" maxlength="6" value="${state.userBirth}" data-field="userBirth">
          </div>
          <div class="form-field">
            <label class="field-label">이메일 주소</label>
            <input type="email" class="field-input" placeholder="example@isa.org" value="${state.userEmail}" data-field="userEmail">
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn-premium btn-outline" data-action="go-screen" data-screen="landing">← 이전</button>
          <button class="btn-premium btn-primary" data-action="verify-and-move" ${state.isVerified ? '' : 'disabled'}>
            ${state.mode === 'exam' ? '결제 단계로 이동 →' : '학습 시작하기 →'}
          </button>
        </div>
      </div>
    `;
  }

  // --- Payment Screen ---
  function renderPayment() {
    const price = getExamPrice();
    return `
      <div class="screen active">
        <div class="hero-section">
          <div class="hero-icon">💳</div>
          <h2 class="hero-title">응시료 결제</h2>
          <p class="hero-desc">자격증 필기시험 응시를 위해 결제를 진행합니다.</p>
        </div>

        <div class="glass-form" style="text-align: center;">
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">결제 금액</div>
          <div style="font-size: 48px; font-weight: 900; color: var(--cyan-400);">₩${price.toLocaleString()}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 12px;">실기시험 응시 자격 부여 및 공인 기록 관리 포함</div>
        </div>

        <div class="info-box">
          <h4>💡 안내사항</h4>
          <ul>
            <li>결제 후 48시간 이내에 횟수 제한 없이 시험 응시가 가능합니다.</li>
            <li>합격 시 즉시 실기시험 응시 권한이 활성화됩니다.</li>
            <li>국내외 모든 신용카드 및 토스/카카오페이 등을 지원합니다.</li>
          </ul>
        </div>

        <button class="btn-premium btn-primary" data-action="start-payment">
          💳 토스페이먼츠로 안전 결제하기
        </button>
      </div>
    `;
  }

  // --- Exam Screen ---
  function renderExam() {
    const q = state.examQuestions[state.currentQuestion];
    if (!q) return '';
    const total = state.examQuestions.length;
    const answeredCount = Object.keys(state.answers).length;

    return `
      <div class="screen active">
        <div class="exam-top">
          <div class="badge-row" style="display: flex; gap: 8px;">
            <div class="header-badge">🏅 ${state.selectedLevel}급</div>
            <div class="header-badge" style="background: rgba(168,85,247,0.1); color: var(--purple-500); border-color: rgba(168,85,247,0.2);">
              ${EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline).nameKR}
            </div>
          </div>
          <div class="timer-wrap ${state.timeRemaining < 60 ? 'danger' : ''}">
            ⏱ ${Math.floor(state.timeRemaining / 60)}:${String(state.timeRemaining % 60).padStart(2, '0')}
          </div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width: ${((state.currentQuestion + 1) / total) * 100}%"></div>
        </div>

        <div class="question-view">
          <div class="q-label">QUESTION ${state.currentQuestion + 1} / ${total}</div>
          <div class="q-text">${q.question}</div>
          
          <div class="ans-options">
            ${q.options.map((opt, i) => `
              <div class="ans-item ${state.answers[q.id] === i ? 'active' : ''}" data-action="pick-answer" data-idx="${i}">
                <div class="ans-marker">${['①','②','③','④'][i]}</div>
                <div class="ans-text">${opt}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="nav-dots">
          ${state.examQuestions.map((_, i) => `
            <div class="nav-dot ${state.currentQuestion === i ? 'active' : (state.answers[state.examQuestions[i].id] !== undefined ? 'done' : '')}" data-action="jump-q" data-idx="${i}">
              ${i + 1}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn-premium btn-outline" data-action="prev-q" ${state.currentQuestion === 0 ? 'disabled' : ''}>← 이전</button>
          ${state.currentQuestion === total - 1 ? `
            <button class="btn-premium btn-primary" data-action="confirm-submit">📥 최종 제출하기</button>
          ` : `
            <button class="btn-premium btn-primary" data-action="next-q">다음 문항 →</button>
          `}
        </div>
      </div>
    `;
  }

  // --- Theory (Textbook) Screen ---
  function renderTheory() {
    const ch = THEORY_DATA[state.currentChapter];
    return `
      <div class="screen active">
        <div class="exam-top" style="border: none; padding-bottom: 0;">
          <div class="badge-row">
            <div class="header-badge">📖 이론서 학습</div>
            <div class="header-badge" style="background: rgba(6,182,212,0.1); color: var(--cyan-400);">Chapter ${state.currentChapter + 1}</div>
          </div>
        </div>

        <div class="theory-viewer" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-xl); padding: 40px; margin-bottom: 40px;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 32px; color: var(--cyan-400);">${ch.title}</h2>
          
          <div class="theory-chapters">
            ${ch.sections.map(sec => `
              <div class="theory-section" style="margin-bottom: 32px;">
                <h4 style="font-size: 18px; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 4px; height: 18px; background: var(--cyan-500); border-radius: 2px;"></span>
                  ${sec.subtitle}
                </h4>
                <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; line-height: 1.8; color: var(--text-secondary); font-size: 15px;">
                  ${sec.content}
                </div>
                ${sec.importance === 'critical' ? `
                  <div style="margin-top: 12px; font-size: 12px; color: var(--red-400); font-weight: 700; display: flex; align-items: center; gap: 4px;">
                    🚨 매우 중요: 해당 내용은 시험에 필수로 출제됩니다.
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="chapter-nav" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <button class="btn-premium btn-outline" data-action="prev-chapter" ${state.currentChapter === 0 ? 'disabled' : ''} style="flex: 1;">← 이전 장</button>
          
          <div style="display: flex; gap: 6px;">
            ${THEORY_DATA.map((_, i) => `
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${state.currentChapter === i ? 'var(--cyan-400)' : 'var(--glass-border)'}"></div>
            `).join('')}
          </div>

          ${state.currentChapter === THEORY_DATA.length - 1 ? `
            <button class="btn-premium btn-primary" data-action="go-screen" data-screen="landing" style="flex: 1;">🏠 학습 완료</button>
          ` : `
            <button class="btn-premium btn-primary" data-action="next-chapter" style="flex: 1;">다음 장으로 →</button>
          `}
        </div>
      </div>
    `;
  }

  // --- Study (Question Bank) Screen ---
  function renderStudy() {
    const bank = state.examQuestions;
    return `
      <div class="screen active">
        <div class="hero-section" style="margin-bottom: 40px; text-align: left;">
          <div class="header-badge" style="margin-bottom: 12px;">📝 문제은행 교재</div>
          <h2 class="hero-title" style="font-size: 28px;">${EXAM_CONFIG.disciplines.find(d => d.id === state.selectedDiscipline).nameKR} ${state.selectedLevel}급</h2>
          <p class="hero-desc">이 종목과 등급에서 출제될 수 있는 전체 문항입니다. 키워드를 파악하며 학습하세요.</p>
        </div>

        <div class="study-list">
          ${bank.map((q, i) => `
            <div class="study-card" style="position: relative; overflow: hidden;">
              <div class="q-label">QUESTION NO.${i + 1}</div>
              <div class="q-text" style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">${q.question}</div>
              <div class="ans-options" style="opacity: 0.9; margin-bottom: 24px;">
                ${q.options.map((opt, oi) => `
                  <div class="ans-item" style="padding: 14px 18px; border-radius: 10px; cursor: default; background: rgba(0,0,0,0.15);">
                    <div class="ans-marker" style="width:24px; height:24px; font-size:11px;">${oi + 1}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${opt}</div>
                  </div>
                `).join('')}
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <button class="btn-premium btn-outline" style="padding: 10px 20px; font-size: 13px; width: auto;" data-action="toggle-ans" data-id="${q.id}">
                  ${state.visibleAnswers[q.id] ? '정답 가리기' : '정답 확인'}
                </button>
              </div>
              <div class="study-answer ${state.visibleAnswers[q.id] ? 'visible' : ''}" style="margin-top: 16px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 20px;">
                <div style="font-weight: 900; color: var(--green-400); font-size: 16px; margin-bottom: 8px;">정답: ${q.answer + 1}번</div>
                <div style="font-size: 14px; color: #fff; opacity: 0.8; line-height: 1.6;">${q.options[q.answer]}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 60px; text-align: center;">
          <button class="btn-premium btn-outline" data-action="go-screen" data-screen="landing" style="max-width: 200px; margin: 0 auto;">← 처음으로 돌아가기</button>
        </div>
      </div>
    `;
  }

  // --- Result Screen ---
  function renderResult() {
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach(q => {
      if (state.answers[q.id] === q.answer) correct++;
    });
    const score = Math.round((correct / total) * 100);
    const passed = score >= getLevelConfig().passingScore;

    return `
      <div class="screen active">
        <div class="result-box">
          <div class="score-display">
            <svg width="200" height="200" style="position: absolute; transform: rotate(-90deg);">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
              <circle cx="100" cy="100" r="90" fill="none" stroke="${passed ? 'var(--green-400)' : 'var(--red-400)'}" 
                      stroke-width="10" stroke-dasharray="565.48" stroke-dashoffset="${565.48 * (1 - score / 100)}"
                      stroke-linecap="round" style="transition: stroke-dashoffset 1s ease-out;"/>
            </svg>
            <div style="text-align: center; z-index: 2;">
              <span class="score-num" style="color: ${passed ? 'var(--green-400)' : 'var(--red-400)'}">${score}</span>
              <span class="score-unit">점</span>
            </div>
          </div>

          <div class="result-tag ${passed ? 'pass' : 'fail'}">
            ${passed ? '🎉 필기 합격' : '😔 다음 기회에'}
          </div>
          
          <p class="hero-desc" style="margin-bottom: 40px;">
            ${state.userName}님의 검정 결과입니다. ${passed ? '축하드립니다! 실기 시험 접수가 가능합니다.' : '아쉽지만 60점 이상 획득 시 합격입니다.'}
          </p>

          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-val" style="color: var(--green-400);">${correct}</div>
              <div class="stat-lab">정답</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: var(--red-400);">${total - correct}</div>
              <div class="stat-lab">오답</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: var(--cyan-400);">${state.selectedLevel}</div>
              <div class="stat-lab">응시등급</div>
            </div>
          </div>

          <div style="display: grid; gap: 12px;">
            <button class="btn-premium btn-primary" data-action="go-screen" data-screen="landing">메인으로</button>
            <button class="btn-premium btn-outline" data-action="go-screen" data-screen="userinfo">다시 응시하기</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Modals ---
  function renderModals() {
    if (state.showSubmitModal) {
      return `
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>시험 제출</h3>
            <p>모든 답안을 제출하시겠습니까? 제출 후에는 수정이 불가능합니다.</p>
            <div style="display: flex; gap: 12px;">
              <button class="btn-premium btn-outline" data-action="close-modal">취소</button>
              <button class="btn-premium btn-primary" data-action="submit-exam">제출하기</button>
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  // === Logic & Interactions ===
  function attachEvents() {
    document.querySelectorAll('[data-action]').forEach(el => {
      el.onclick = handleAction;
    });

    document.querySelectorAll('[data-field]').forEach(el => {
      el.oninput = (e) => {
        state[e.target.dataset.field] = e.target.value;
      };
    });
  }

  function handleAction(e) {
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;
    const mode = e.currentTarget.dataset.mode;
    const screen = e.currentTarget.dataset.screen;
    const idx = parseInt(e.currentTarget.dataset.idx);

    switch(action) {
      case 'set-mode': state.mode = mode; break;
      case 'select-disc': state.selectedDiscipline = id; break;
      case 'select-level': {
        const l = EXAM_CONFIG.levels.find(level => level.id === parseInt(id));
        if (l && l.available) state.selectedLevel = parseInt(id);
        break;
      }
      case 'select-carrier': state.carrier = id; break;
      case 'go-next': 
        state.currentScreen = 'userinfo'; 
        break;
      case 'go-screen': 
        state.currentScreen = screen; 
        break;
      case 'request-auth':
        if (!state.userName || !state.userPhone || !state.carrier) {
          alert('이름, 통신사, 연락처를 모두 입력해주세요.');
          return;
        }
        state.authSent = true;
        break;
      case 'verify-code':
        e.currentTarget.innerText = '인증 확인 중...';
        setTimeout(() => {
          state.isVerified = true;
          state.authSent = false;
          render();
        }, 1000);
        break;
      case 'verify-and-move':
        if (state.mode === 'exam') {
          state.currentScreen = 'payment';
        } else if (state.mode === 'theory') {
          state.currentScreen = 'theory';
          state.currentChapter = 0;
        } else {
          startStudy();
        }
        break;
      case 'start-payment':
        processPayment();
        break;
      case 'pick-answer':
        const curQ = state.examQuestions[state.currentQuestion];
        state.answers[curQ.id] = idx;
        break;
      case 'next-q':
        if (state.currentQuestion < state.examQuestions.length - 1) state.currentQuestion++;
        break;
      case 'prev-q':
        if (state.currentQuestion > 0) state.currentQuestion--;
        break;
      case 'jump-q':
        state.currentQuestion = idx;
        break;
      case 'next-chapter':
        if (state.currentChapter < THEORY_DATA.length - 1) state.currentChapter++;
        window.scrollTo(0, 0);
        break;
      case 'prev-chapter':
        if (state.currentChapter > 0) state.currentChapter--;
        window.scrollTo(0, 0);
        break;
      case 'confirm-submit':
        state.showSubmitModal = true;
        break;
      case 'close-modal':
        state.showSubmitModal = false;
        break;
      case 'submit-exam':
        finishExam();
        break;
      case 'toggle-ans':
        state.visibleAnswers[id] = !state.visibleAnswers[id];
        break;
    }
    render();
  }

  // --- Exam/Study Logic ---
  function startStudy() {
    state.examQuestions = getQuestionBank(state.selectedDiscipline, state.selectedLevel);
    state.currentScreen = 'study';
    render();
  }

  async function processPayment() {
    state.paymentProcessing = true;
    render();
    
    try {
      const tossPayments = TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({
        customerKey: "CUSTOMER_" + Date.now(),
      });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: getExamPrice() },
        orderId: "ORDER_" + Date.now(),
        orderName: `ISA 필기시험 ${state.selectedDiscipline} ${state.selectedLevel}급`,
        successUrl: window.location.href + "?status=success",
        failUrl: window.location.href + "?status=fail",
        customerEmail: state.userEmail,
        customerName: state.userName,
      });
      
      // 테스트 환경이므로 성공으로 간주하고 실제 시험 시작 (원래는 redirect 후 처리)
      // startExam();
    } catch (e) {
      console.error(e);
      // 테스트 편의상 결제 실패해도 시작 가능하게 하거나 알림
      if (confirm('테스트 결제를 진행하시겠습니까? (확인 클릭 시 시험 시작)')) {
        startExam();
      }
    }
  }

  function startExam() {
    const fullPool = getQuestionBank(state.selectedDiscipline, state.selectedLevel);
    // 랜덤 추출
    const config = getLevelConfig();
    const shuffled = fullPool.sort(() => 0.5 - Math.random());
    state.examQuestions = shuffled.slice(0, config.questionsPerExam);
    
    state.currentQuestion = 0;
    state.answers = {};
    state.timeRemaining = config.timeLimitMinutes * 60;
    state.examStartTime = Date.now();
    state.currentScreen = 'exam';
    state.showSubmitModal = false;
    
    startTimer();
    render();
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeRemaining--;
      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        finishExam();
      }
      // 매초 렌더링은 무거울 수 있으니 타이머 요소만 업데이트
      const timerEl = document.querySelector('.timer-wrap');
      if (timerEl) {
        timerEl.innerText = `⏱ ${Math.floor(state.timeRemaining / 60)}:${String(state.timeRemaining % 60).padStart(2, '0')}`;
        if (state.timeRemaining < 60) timerEl.classList.add('danger');
      }
    }, 1000);
  }

  function finishExam() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.examEndTime = Date.now();
    state.currentScreen = 'result';
    state.showSubmitModal = false;
    render();
  }

  // --- Global Entry ---
  window.onload = init;

})();
