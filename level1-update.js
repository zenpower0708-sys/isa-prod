const fs = require('fs');

const originalFile = 'app.js';
let content = fs.readFileSync(originalFile, 'utf8');

// 1. Update skillMap for Standing/Flow Board level 1
const standingL1Old = `{ level: 1, skills: ['(남) 지정 기술 3개↑', '(여) 지정 기술 3개↑', '핸드플립 가산점', '콤보 가산점'], details: '* (남) 쓰리셔빗 이상, 킥플립 이상 기술 필수로 한 3개 이상<br>* (여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상의 기술 중 3개 이상' }`;
const standingL1New = `{ level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 3개↑', '(여) 지정 기술 3개↑', '강습 영상 (5분 이내)'], details: '[1. 기술 영상] 1분~1분 30초 원테이크 (입/퇴수 전후 5초 포함)<br>(남) 쓰리셔빗 이상, 킥플립 이상 기술 중 1개 필수 포함 (총 3개 이상)<br>(여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상 기술 중 3개 이상<br><br>[2. 강습 영상] 5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }`;

// 2. Update skillMap for Body/Boogie Board level 1
const bodyL1Old = `{ level: 1, skills: ['(남) 지정 기술 5개↑', '(여) 지정 기술 4개↑', '콤보 가산점'], details: '* 지정 기술: 540° 바디턴 이상, 540° 바디로데오 이상, 디테이 이상(오버로드), 디테이 프론 이상, 드롭니 로데오 이상, 드롭니 로데오 프론 이상, 180° 셔빗 이상, 허브캡(멀티) 이상' }`;
const bodyL1New = `{ level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 5개↑', '(여) 지정 기술 4개↑', '콤보 가산점', '강습 영상 (5분 이내)'], details: '[1. 기술 영상] 1분~1분 30초 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 540° 바디턴 이상, 540° 바디로데오 이상, 디테이 이상(오버로드), 디테이 프론 이상, 드롭니 로데오 이상, 드롭니 로데오 프론 이상, 180° 셔빗 이상, 허브캡(멀티) 이상<br><br>[2. 강습 영상] 5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }`;

content = content.replace(standingL1Old, standingL1New);
content = content.replace(bodyL1Old, bodyL1New);

// 3. Update input fields in renderCertDetail
const inputOld = `<input type="text" id="youtube-url" placeholder="YouTube 링크 (URL) 입력" 
                               style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px">`;
const inputNew = `\${selectedLevel === 1 ? \`
                            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:12px;margin-bottom:8px;">
                                <p style="color:#f87171;font-size:12px;margin:0;font-weight:700;line-height:1.5;">🚨 1급 필수 안내<br>1급은 심사 및 강사 자격 부여를 위해 본인의 기술 시연 영상과 실제 코칭 영상 총 2개가 필요합니다.</p>
                            </div>
                            <label style="color:white;font-size:12px;margin-bottom:-4px;">📁 1. 기술 영상 업로드 (1분 30초 이내 원테이크)</label>
                            <input type="text" id="youtube-url-tech" placeholder="기술 영상 YouTube 링크 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                            <br>
                            <label style="color:white;font-size:12px;margin-top:8px;margin-bottom:-4px;display:block;">📁 2. 강습 영상 업로드 (5분 이내 코칭 시범)</label>
                            <input type="text" id="youtube-url-coach" placeholder="강습 영상 YouTube 링크 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                        \` : \`
                            <input type="text" id="youtube-url" placeholder="YouTube 링크 (URL) 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px">
                        \`}`;
content = content.replace(inputOld, inputNew);

// 4. Update submitPracticalEval validation logic
const submitOld = `const ytUrl = $('youtube-url').value.trim();
    
    const ytRegex = /^(https?:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.be)\\/.+$/;
    if (!ytRegex.test(ytUrl)) {
        alert(currentLang === 'KO' ? "유효한 YouTube 링크를 입력해주세요." : "Please enter a valid YouTube URL.");
        return false;
    }`;

const submitNew = `let ytUrl = '';
    
    if (selectedLevel === 1) {
        const techUrl = $('youtube-url-tech').value.trim();
        const coachUrl = $('youtube-url-coach').value.trim();
        const ytRegex = /^(https?:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.be)\\/.+$/;
        if (!ytRegex.test(techUrl) || !ytRegex.test(coachUrl)) {
            alert(currentLang === 'KO' ? "2개의 유효한 YouTube 링크를 모두 입력해주세요." : "Please enter 2 valid YouTube URLs.");
            return false;
        }
        ytUrl = '[기술] ' + techUrl + '\\n[강습] ' + coachUrl;
    } else {
        ytUrl = $('youtube-url').value.trim();
        const ytRegex = /^(https?:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.be)\\/.+$/;
        if (!ytRegex.test(ytUrl)) {
            alert(currentLang === 'KO' ? "유효한 YouTube 링크를 입력해주세요." : "Please enter a valid YouTube URL.");
            return false;
        }
    }`;
content = content.replace(submitOld, submitNew);

fs.writeFileSync(originalFile, content, 'utf8');
console.log("App.js Level 1 requirements updated!");
