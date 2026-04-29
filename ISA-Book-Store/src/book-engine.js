/**
 * ISA E-PASS 올인원 디지털 교재 엔진
 * 이론, 문제은행, 모의고사를 통합 관리합니다.
 */

class BookEngine {
    constructor() {
        this.currentVol = this.getQueryParam('vol') || 'standing';
        this.currentSection = 's1';
        this.questions = [];
        this.examState = {
            isActive: false,
            timeLeft: 0,
            answers: [],
            currentQuestions: []
        };
        
        this.init();
    }

    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    init() {
        // 데이터 로드 확인 및 사이드바 렌더링
        this.loadVolumeData();
        this.setupEventListeners();
        this.renderSidebar();
        this.renderContent();
    }

    loadVolumeData() {
        const data = THEORY_DATA[this.currentVol];
        if (!data) {
            console.error('해당 볼륨 데이터를 찾을 수 없습니다:', this.currentVol);
            return;
        }
        document.querySelector('.sidebar-header h2').innerText = data.title;
        
        // 문제은행 데이터 필터링 (questions.js가 전역에 로드되어 있다고 가정)
        if (window.QUESTIONS_BODY_L4) { // 샘플로 바디보드 데이터 체크
            // 실제 서비스 시 종목별 변수명 매핑 필요
            this.questions = this.getQuestionsForVolume(this.currentVol);
        }
    }

    getQuestionsForVolume(vol) {
        // questions.js의 변수들과 매핑
        switch(vol) {
            case 'standing': return window.QUESTIONS_STANDING_L4 || [];
            case 'body': return window.QUESTIONS_BODY_L4 || [];
            case 'wake': return window.QUESTIONS_WAKE_L4 || [];
            case 'wave': return window.QUESTIONS_WAVE_L3 || [];
            default: return [];
        }
    }

    setupEventListeners() {
        // 모의고사 시작 버튼
        const startExamBtn = document.querySelector('.btn-primary');
        if (startExamBtn) {
            startExamBtn.addEventListener('click', () => this.startMockExam());
        }
    }

    renderSidebar() {
        const navList = document.querySelector('.nav-list');
        navList.innerHTML = '';
        
        const data = THEORY_DATA[this.currentVol];
        
        // 이론 섹션 추가
        data.sections.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = `nav-item ${this.currentSection === section.id ? 'active' : ''}`;
            item.innerHTML = `<span>${section.title}</span>`;
            item.onclick = () => this.switchToSection(section.id);
            navList.appendChild(item);
        });

        // 문제은행 및 모의고사 추가
        const quizItem = document.createElement('div');
        quizItem.className = 'nav-item';
        quizItem.innerHTML = '<span>문제은행 (학습용)</span>';
        quizItem.onclick = () => this.switchToSection('quiz');
        navList.appendChild(quizItem);

        const examItem = document.createElement('div');
        examItem.className = 'nav-item';
        examItem.innerHTML = '<span>실전 모의고사</span>';
        examItem.onclick = () => this.switchToSection('exam');
        navList.appendChild(examItem);
    }

    switchToSection(id) {
        this.currentSection = id;
        this.renderContent();
        
        // 사이드바 활성 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.innerText.includes(id) || 
                (id === 'quiz' && btn.innerText.includes('문제은행')) ||
                (id === 'exam' && btn.innerText.includes('모의고사')));
        });
        
        window.scrollTo(0, 0);
    }

    renderContent() {
        const theoryContainer = document.getElementById('content-theory');
        const quizContainer = document.getElementById('content-quiz');
        const examContainer = document.getElementById('content-exam');

        // 전체 숨김
        theoryContainer.style.display = 'none';
        quizContainer.style.display = 'none';
        examContainer.style.display = 'none';

        if (this.currentSection === 'quiz') {
            quizContainer.style.display = 'block';
            this.renderQuizList();
        } else if (this.currentSection === 'exam') {
            examContainer.style.display = 'block';
        } else {
            theoryContainer.style.display = 'block';
            const data = THEORY_DATA[this.currentVol];
            const section = data.sections.find(s => s.id === this.currentSection);
            if (section) {
                theoryContainer.querySelector('h1').innerText = section.title;
                theoryContainer.querySelector('p').innerText = section.content;
            }
        }
    }

    renderQuizList() {
        const container = document.getElementById('quiz-list-area');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.questions.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px; color:#64748b;">이 종목에 대한 문제은행 데이터가 아직 준비되지 않았습니다.</p>';
            return;
        }

        this.questions.forEach((q, idx) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'quiz-item-box';
            qDiv.style = "background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0;";
            qDiv.innerHTML = `
                <p style="font-weight: 700; color: #1e293b; margin-bottom: 16px;">Q${idx + 1}. ${q.question}</p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${q.options.map((opt, oIdx) => `
                        <button class="opt-btn" onclick="checkAnswer(this, ${oIdx}, ${q.answer})">${oIdx + 1}. ${opt}</button>
                    `).join('')}
                </div>
                <div class="ans-box" style="display:none; margin-top: 15px; color: #0891b2; font-weight: 700; padding: 10px; background: #ecfeff; border-radius: 8px;">
                    정답: ${q.answer + 1}번 / 해설: ISA 공식 가이드를 참조하세요.
                </div>
                <button onclick="toggleAns(this)" style="margin-top: 15px; font-size: 13px; cursor: pointer; background: none; border: none; color: #64748b; text-decoration: underline;">정답 및 해설 확인</button>
            `;
            container.appendChild(qDiv);
        });
    }

    startMockExam() {
        if (this.questions.length === 0) {
            alert('이 종목의 문제 데이터가 준비되지 않았습니다.');
            return;
        }

        if (!confirm('실전 모의고사를 시작하시겠습니까? 20문항이 무작위로 출제됩니다.')) return;

        this.examState = {
            isActive: true,
            currentQuestions: this.shuffleArray([...this.questions]).slice(0, 20),
            currentIndex: 0,
            answers: new Array(20).fill(null),
            startTime: Date.now(),
            timer: null
        };

        this.renderExamUI();
        this.startTimer();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startTimer() {
        let timeLeft = 20 * 60; // 20분
        const timerUpdate = () => {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            const timerEl = document.getElementById('exam-timer');
            if (timerEl) {
                timerEl.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
            
            if (timeLeft <= 0) {
                this.finishExam();
                return;
            }
            timeLeft--;
            this.examState.timer = setTimeout(timerUpdate, 1000);
        };
        timerUpdate();
    }

    renderExamUI() {
        const container = document.getElementById('content-exam');
        container.innerHTML = `
            <div class="theory-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h1 style="border:none; margin:0; padding:0;">실전 모의고사 진행 중</h1>
                    <div id="exam-timer" style="font-size:24px; font-weight:800; color:#ef4444; background:#fee2e2; padding:10px 20px; border-radius:12px;">20:00</div>
                </div>
                <div id="exam-question-area" style="min-height:400px;"></div>
                <div style="display:flex; justify-content:space-between; margin-top:40px;">
                    <button class="opt-btn" onclick="engine.prevExamQuestion()" id="prev-btn" style="width:120px; text-align:center;">이전</button>
                    <div id="exam-progress" style="color:#64748b; font-weight:600;">1 / 20</div>
                    <button class="opt-btn" onclick="engine.nextExamQuestion()" id="next-btn" style="width:120px; text-align:center; background:var(--accent); color:white; border:none;">다음</button>
                </div>
            </div>
        `;
        this.renderExamQuestion();
    }

    renderExamQuestion() {
        const qArea = document.getElementById('exam-question-area');
        const q = this.examState.currentQuestions[this.examState.currentIndex];
        const selected = this.examState.answers[this.examState.currentIndex];

        qArea.innerHTML = `
            <div style="font-size:20px; font-weight:700; color:#1e293b; margin-bottom:24px;">Q${this.examState.currentIndex + 1}. ${q.question}</div>
            <div style="display:flex; flex-direction:column; gap:12px;">
                ${q.options.map((opt, i) => `
                    <button class="opt-btn ${selected === i ? 'active' : ''}" 
                        style="${selected === i ? 'border-color:var(--accent); background:#f0f9ff;' : ''}"
                        onclick="engine.selectExamAnswer(${i})">${i + 1}. ${opt}</button>
                `).join('')}
            </div>
        `;

        document.getElementById('exam-progress').innerText = `${this.examState.currentIndex + 1} / 20`;
        document.getElementById('prev-btn').style.visibility = this.examState.currentIndex === 0 ? 'hidden' : 'visible';
        document.getElementById('next-btn').innerText = this.examState.currentIndex === 19 ? '제출하기' : '다음';
    }

    selectExamAnswer(idx) {
        this.examState.answers[this.examState.currentIndex] = idx;
        this.renderExamQuestion();
    }

    nextExamQuestion() {
        if (this.examState.currentIndex < 19) {
            this.examState.currentIndex++;
            this.renderExamQuestion();
        } else {
            this.finishExam();
        }
    }

    prevExamQuestion() {
        if (this.examState.currentIndex > 0) {
            this.examState.currentIndex--;
            this.renderExamQuestion();
        }
    }

    finishExam() {
        clearTimeout(this.examState.timer);
        this.examState.isActive = false;
        
        let score = 0;
        this.examState.currentQuestions.forEach((q, i) => {
            if (q.answer === this.examState.answers[i]) score += 5;
        });

        const container = document.getElementById('content-exam');
        container.innerHTML = `
            <div class="theory-content" style="text-align:center;">
                <h1>시험 결과 리포트</h1>
                <div style="margin:40px 0; padding:60px 20px; background:#f8fafc; border-radius:24px; border:1px solid #e2e8f0;">
                    <div style="font-size:64px; font-weight:900; color:${score >= 60 ? '#22c55e' : '#ef4444'}; margin-bottom:20px;">${score}점</div>
                    <p style="font-size:24px; font-weight:700; color:#1e293b;">${score >= 60 ? '축하합니다! 합격권입니다.' : '아쉽습니다. 조금 더 학습해 보세요.'}</p>
                    <p style="color:#64748b; margin-top:10px;">총 20문항 중 ${score / 5}문항 정답</p>
                </div>
                <button class="btn-primary" onclick="engine.switchToSection('exam')">다시 응시하기</button>
            </div>
        `;
    }
}

// 전역 헬퍼 함수
window.checkAnswer = (btn, selected, correct) => {
    if (selected === correct) {
        btn.style.background = '#dcfce7';
        btn.style.borderColor = '#22c55e';
    } else {
        btn.style.background = '#fee2e2';
        btn.style.borderColor = '#ef4444';
    }
};

window.toggleAns = (btn) => {
    const box = btn.previousElementSibling;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
};

// 엔진 실행
document.addEventListener('DOMContentLoaded', () => {
    window.engine = new BookEngine();
});
