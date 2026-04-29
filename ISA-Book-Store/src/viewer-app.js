const urlParams = new URLSearchParams(window.location.search);
const vol = urlParams.get('vol') || 'standing';
const level = parseInt(urlParams.get('level') || '4');

const bookTitles = {
    'standing': 'Standing/Flow Board',
    'body': 'Body/Boogie Board',
    'wake': 'Wake Surfing',
    'wave': 'Wave Surfing'
};

document.getElementById('header-title').innerText = `${bookTitles[vol]} 문제은행`;
document.getElementById('header-level').innerText = `${level}급`;

let allData = [];
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = []; // stores user's selected option (1-4)
let currentMode = ''; // 'practice', 'exam', 'review'

// Exam configuration
const getExamCount = (lv) => {
    if (lv === 4) return 30;
    if (lv === 3) return 40;
    if (lv === 2) return 50;
    if (lv === 1) return 60;
    return 30;
};
const examCount = getExamCount(level);

// Fetch Data
async function loadData() {
    try {
        const res = await fetch(`/data/${vol}_${level}.json`);
        if (!res.ok) throw new Error('Data not found');
        allData = await res.json();
    } catch (e) {
        console.error(e);
        alert('데이터를 불러오는데 실패했습니다. 관리자에게 문의하세요.');
    }
}
loadData();

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

window.startMode = (mode) => {
    currentMode = mode;
    document.getElementById('screen-select').style.display = 'none';
    document.getElementById('screen-question').style.display = 'block';
    document.getElementById('screen-controls').style.display = 'flex';
    document.getElementById('header-mode').innerText = mode === 'practice' ? '학습 모드' : '실전 모의고사';

    if (mode === 'practice') {
        currentQuestions = [...allData]; // or shuffle(allData)
    } else if (mode === 'exam') {
        let shuffled = shuffle([...allData]);
        currentQuestions = shuffled.slice(0, examCount);
    }
    
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentIndex = 0;
    renderQuestion();
};

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    document.getElementById('q-progress').innerText = `문제 ${currentIndex + 1} / ${currentQuestions.length}`;
    document.getElementById('q-mode-badge').innerText = currentMode === 'practice' ? '학습 모드' : (currentMode === 'review' ? '오답 노트' : '모의고사');
    
    document.getElementById('q-text').innerText = `Q${currentIndex + 1}. ${q.question}`;
    
    const optsContainer = document.getElementById('q-options');
    optsContainer.innerHTML = '';
    
    const nums = ['①', '②', '③', '④'];
    q.options.forEach((optText, i) => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        btn.innerHTML = `<div class="opt-num">${nums[i]}</div><div>${optText}</div>`;
        
        // Handle UI states based on mode
        if (currentMode === 'practice' || currentMode === 'review') {
            const isSelected = userAnswers[currentIndex] === i + 1;
            const isCorrect = q.answer === i + 1;
            
            if (userAnswers[currentIndex] !== null) {
                if (isCorrect) btn.classList.add('correct');
                else if (isSelected) btn.classList.add('incorrect');
                btn.style.pointerEvents = 'none';
            } else {
                btn.onclick = () => selectOption(i + 1);
            }
        } else if (currentMode === 'exam') {
            if (userAnswers[currentIndex] === i + 1) btn.classList.add('selected');
            btn.onclick = () => selectOption(i + 1);
        }
        
        optsContainer.appendChild(btn);
    });

    const expBox = document.getElementById('q-explanation');
    if (currentMode === 'practice' && userAnswers[currentIndex] !== null) {
        expBox.classList.add('show');
        document.getElementById('exp-text').innerText = q.explanation;
    } else if (currentMode === 'review') {
        expBox.classList.add('show');
        document.getElementById('exp-text').innerText = q.explanation;
    } else {
        expBox.classList.remove('show');
    }

    updateControls();
}

window.selectOption = (optNum) => {
    userAnswers[currentIndex] = optNum;
    renderQuestion();
};

window.prevQuestion = () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
};

window.nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
};

function updateControls() {
    document.getElementById('btn-prev').disabled = currentIndex === 0;
    
    if (currentIndex === currentQuestions.length - 1) {
        document.getElementById('btn-next').style.display = 'none';
        if (currentMode === 'exam') {
            document.getElementById('btn-submit').style.display = 'block';
        } else if (currentMode === 'practice' || currentMode === 'review') {
            document.getElementById('btn-submit').style.display = 'block';
            document.getElementById('btn-submit').innerText = '학습 종료';
            document.getElementById('btn-submit').onclick = () => location.reload();
        }
    } else {
        document.getElementById('btn-next').style.display = 'block';
        document.getElementById('btn-submit').style.display = 'none';
    }
}

window.submitExam = () => {
    const unansCount = userAnswers.filter(a => a === null).length;
    if (unansCount > 0) {
        if (!confirm(`아직 풀지 않은 문제가 ${unansCount}개 있습니다. 정말 제출하시겠습니까?`)) {
            return;
        }
    }

    let correctCount = 0;
    currentQuestions.forEach((q, i) => {
        if (q.answer === userAnswers[i]) correctCount++;
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const passed = score >= 60;

    document.getElementById('screen-question').style.display = 'none';
    document.getElementById('screen-controls').style.display = 'none';
    
    const resScreen = document.getElementById('screen-result');
    resScreen.style.display = 'block';
    
    document.getElementById('result-wrapper').className = passed ? 'pass' : 'fail';
    document.getElementById('res-score').innerText = `${score}점`;
    document.getElementById('res-status').innerText = passed ? '합격입니다! 🎉' : '불합격입니다 😢';
    document.getElementById('res-detail').innerText = `총 ${currentQuestions.length}문제 중 ${correctCount}문제 정답`;
};

window.reviewIncorrect = () => {
    const wrongQs = [];
    const wrongAs = [];
    currentQuestions.forEach((q, i) => {
        if (q.answer !== userAnswers[i]) {
            wrongQs.push(q);
            wrongAs.push(userAnswers[i]);
        }
    });

    if (wrongQs.length === 0) {
        alert('틀린 문제가 없습니다! 완벽합니다.');
        return;
    }

    currentMode = 'review';
    currentQuestions = wrongQs;
    userAnswers = wrongAs; // preserve what the user chose
    currentIndex = 0;

    document.getElementById('screen-result').style.display = 'none';
    document.getElementById('screen-question').style.display = 'block';
    document.getElementById('screen-controls').style.display = 'flex';
    document.getElementById('header-mode').innerText = '오답 노트';

    renderQuestion();
};
