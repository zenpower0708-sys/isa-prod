/**
 * ISA - International Artificial Indoor Surfing Association 
 * Rollback to Claude's Stable Version
 * (Equipment store logic stripped out, strict stability mode)
 */

window.onerror = function(msg, url, line) {
    console.error("[Global Error]", msg, "at line", line);
    return false;
};

// ===== STATE =====
let currentLang = 'KO';
let currentPage = '';
let isLoginMode = true; 
let selectedDiscipline = 'Standing/Flow Board';
let selectedLevel = null;
// ===== CONFIG =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxk6Lh_5BiDrRC2OuXcBBhtbCUzXVlr27MuTPW0_BJBlQBW-49t8wxD8O0DmLCLiAjkUw/exec';
// ===== SOCIAL LOGIN CONFIG =====
// 아래 두 값을 발급받은 키로 교체하세요
const GOOGLE_CLIENT_ID = '149618944785-t6f36b811rhmo7cbqtt66fbh4otpsju8.apps.googleusercontent.com';
const KAKAO_APP_KEY    = 'f9bf5788e94af1e570c1a8c814e13d1c';

// ===== PG CONFIG (INNOPAY) =====
const INNOPAY_MID = 'pgisaweb1m';
const INNOPAY_LICENSE_KEY = 'rbccWA7HgRbh2XHahjlQ/Q9t/UJDgboR1rRN1X/0/mP/oTNiub6Y1D7dLAQDXhRSbZL2l7/dMd6JEi8R1qSOjA==';

const WeatherManager = {
    cacheKey: 'isa_weather_data_v1.1', // 캐시 갱신을 위해 키 변경
    // 강원도 양양 (2026.04.06 실시간 관측치 기준)
    baseData: { wave: 1.1, temp: 11.3, location: 'Yangyang' },
    
    getData() {
        const now = new Date();
        const stored = localStorage.getItem(this.cacheKey);
        
        if (stored) {
            const data = JSON.parse(stored);
            const lastUpdate = new Date(data.timestamp);
            
            // 오늘 오전 5시 기준점 계산
            const today5AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0);
            
            // 마지막 업데이트가 오늘 5시 이전이고 현재가 5시 이후라면 갱신
            if (lastUpdate < today5AM && now >= today5AM) {
                return this.refreshData();
            }
            return data;
        }
        return this.refreshData();
    },

    refreshData() {
        const now = new Date();
        // 실제 관측치를 시뮬레이션 (근사치 내에서 매일 소폭 변동)
        const daySeed = now.getDate() + now.getMonth();
        const wave = (this.baseData.wave + (Math.sin(daySeed) * 0.3)).toFixed(1);
        const temp = (this.baseData.temp + (Math.cos(daySeed) * 1.5)).toFixed(1);
        
        const newData = {
            wave: wave,
            temp: temp,
            timestamp: now.getTime(),
            dateStr: now.toLocaleDateString()
        };
        
        localStorage.setItem(this.cacheKey, JSON.stringify(newData));
        console.log("[WeatherManager] 오전 5시 기준 데이터 동기화 완료:", newData);
        return newData;
    }
};

// Utility
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DISCIPLINES !== 'undefined' && DISCIPLINES.length > 0) {
        selectedDiscipline = DISCIPLINES[0];
    }
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    updateLangUI();
    initAuth();
});

// ===== ROUTING =====
function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('/').filter(Boolean)[0] || '';
    currentPage = path;
    selectedLevel = null;
    eduView = 'menu';
    renderPage(path);
    updateActiveNav(path);
    window.scrollTo(0, 0);
}

function renderPage(page) {
    const content = $('app-content');
    if (!content) return;

    try {
        switch (page) {
            case 'cert': content.innerHTML = renderCertPage(); break;
            case 'shop': content.innerHTML = renderShopPage(); break; 
            case 'insurance': window.location.href = '/mutualaid/'; break;
            case 'map': content.innerHTML = renderMapPage(); break;
            case 'edu': content.innerHTML = renderEduPage(); break;
            case 'intro': content.innerHTML = renderIntroPage(); break;
            case 'verify': content.innerHTML = renderVerifyPage(); break;
            case 'admin': window.location.href = '/admin.html'; break;
            case 'board': renderBoardPage().then(html => { if (content) content.innerHTML = html; }); break;
            default: content.innerHTML = renderHomePage(); break;
        }
    } catch (err) {
        console.error('[Render Error]', err);
        content.innerHTML = `<div style="padding:100px; text-align:center; color:white;"><h2>Loading Error</h2><p>Please check console for details.</p></div>`;
    }
}

function updateActiveNav(page) {
    $$('.nav-link, .mobile-sub-link').forEach(link => {
        const p = link.getAttribute('data-page');
        link.classList.toggle('active', p === page);
    });
}

function toggleLang() {
    currentLang = currentLang === 'KO' ? 'EN' : 'KO';
    updateLangUI();
    renderPage(currentPage);
}

// ===== UI TEXT UPDATE =====
function updateLangUI() {
    if (typeof LANG === 'undefined') return;
    const t = LANG[currentLang];
    const safeSet = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    
    safeSet('lang-label', currentLang);
    safeSet('nav-title', t.common.headerName);
    safeSet('gov-culture', t.common.govCulture);
    safeSet('gov-coast', t.common.govCoast);
    safeSet('kakao-btn-text', t.common.kakaoChannel);
    
    ['cert', 'insurance', 'shop', 'map', 'edu', 'book', 'instructor'].forEach(key => {
        safeSet(`nav-${key}`, t.nav[key]);
        safeSet(`m-nav-${key}`, t.nav[key]);
    });

    ['event', 'notice', 'appcheck', 'certcheck'].forEach(key => {
        const labelText = t.quick[key === 'appcheck' ? 'appCheck' : key === 'certcheck' ? 'certCheck' : key];
        safeSet(`q-${key}`, labelText);
        safeSet(`mb-${key}`, labelText);
    });

    safeSet('footer-org', t.common.footerName);
    safeSet('footer-contact-title', t.common.footer.contact);
    safeSet('footer-address', currentLang === 'KO' ? SITE_CONFIG.addressKR : SITE_CONFIG.address);
    safeSet('footer-legal-title', t.common.footer.legal);
    safeSet('footer-privacy', t.common.footer.privacy);
    safeSet('footer-terms', t.common.footer.terms);
    safeSet('footer-ins-terms', t.common.footer.insTerms);
}

// ===== HOMEPAGE (CLAUDE VERSION) =====
function renderHomePage() {
    if (typeof LANG === 'undefined') return '';
    const t = LANG[currentLang];
    const weather = WeatherManager.getData();
    const isKO = currentLang === 'KO';
    
    return `
    <section class="hero page-enter">
        <div class="hero-bg"></div>
        <div class="hero-noise"></div>
        <div class="hero-grid"></div>
        <div class="hero-content">
            <div class="hero-tag"><span>${t.hero.tag}</span></div>
            <h2 class="hero-title game-font">${t.hero.title}</h2>
            <p class="hero-subtitle">${t.hero.subtitle}</p>
            <div class="hero-buttons">
                <a href="#/cert" class="hero-btn-primary"><span>${t.hero.cta} →</span></a>
                <a href="#/intro" class="hero-btn-secondary"><span>▶ ${t.hero.watch}</span></a>
                <button class="hero-btn-score" onclick="openScoreEliteModal()">
                    <span>📊 스코어엘리트(기술측정앱)</span>
                </button>
            </div>
        </div>
        <div class="hero-stat wave glass-panel animate-bounce">
            <div class="hero-stat-label">${t.hero.waveHeight} <span style="font-size:10px; opacity:0.7;">(양양)</span></div>
            <div class="hero-stat-value game-font" id="wave-height-val">${weather.wave} M</div>
        </div>
        <div class="hero-stat temp glass-panel animate-pulse">
            <div class="hero-stat-label">${t.hero.waterTemp} <span style="font-size:10px; opacity:0.7;">(양양)</span></div>
            <div class="hero-stat-value game-font" id="water-temp-val">${weather.temp}°C</div>
        </div>
    </section>

    <!-- 퀵서비스 카드 섹션 -->
    <div class="home-quick-section">
        <div class="home-quick-title">
            <h3>${isKO ? '빠른 서비스' : 'QUICK SERVICES'}</h3>
            <p>${isKO ? '회원 및 자격증 신청자를 위한 빠른 조회 서비스' : 'Quick lookup services for members and applicants'}</p>
        </div>
        <div class="home-quick-grid">
            <div class="home-quick-card" onclick="openQuickModal('appcheck')" id="hqc-appcheck">
                <div class="hqc-icon">📋</div>
                <div class="hqc-label">${isKO ? '접수증 확인' : 'Registration Check'}</div>
                <div class="hqc-sub">${isKO ? '자격증 접수 상태확인' : 'Check application status'}</div>
            </div>
            <div class="home-quick-card" onclick="openQuickModal('certcheck')" id="hqc-certcheck">
                <div class="hqc-icon">🏅</div>
                <div class="hqc-label">${isKO ? '자격증 조회' : 'Certificate Lookup'}</div>
                <div class="hqc-sub">${isKO ? '취득 자격증 조회' : 'View your certificates'}</div>
            </div>
            <div class="home-quick-card" onclick="openQuickModal('notice')" id="hqc-notice">
                <div class="hqc-icon">📢</div>
                <div class="hqc-label">${isKO ? '공지사항' : 'Notices'}</div>
                <div class="hqc-sub">${isKO ? '협회 공지 및 소식' : 'Association updates'}</div>
            </div>
            <div class="home-quick-card" onclick="openQuickModal('event')" id="hqc-event">
                <div class="hqc-icon">🎉</div>
                <div class="hqc-label">${isKO ? '이벤트' : 'Events'}</div>
                <div class="hqc-sub">${isKO ? '진행 중인 이벤트' : 'Current events'}</div>
            </div>
        </div>
    </div>`;
}

// ===== CERTIFICATION PAGE (CLEAN) =====
function renderCertPage() {
    const t = LANG[currentLang];
    const cd = CERT_DATA[currentLang];

    if (selectedLevel) return renderCertDetail(t, cd);

    const tabs = DISCIPLINES.map(d =>
        `<button class="discipline-tab ${d === selectedDiscipline ? 'active' : ''}" onclick="selectDiscipline('${d}')">${d}</button>`
    ).join('');

    const levelCards = cd.levels.items.map((item, i) => {
        const level = 4 - i;
        return `
        <div class="level-card glass-panel" onclick="selectCertLevel(${level})">
            <div class="level-card-header">
                <div class="level-num">${level}</div>
                <div><h3>${item.title}</h3><span class="level-type">${t.cert.certType}</span></div>
            </div>
            <p>${item.role}</p>
            <div style="font-size:12px;color:var(--text-dark);display:flex;gap:4px;align-items:center">👤 ${item.target}</div>
            <div class="level-card-footer">${t.cert.start} →</div>
        </div>`;
    }).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="content-container">
            <h2 class="section-title game-font">${t.cert.title}</h2>
            <p class="section-subtitle">${t.cert.desc}</p>
            <div class="discipline-tabs">${tabs}</div>
            <div class="level-grid animate-fade-in-up">${levelCards}</div>
        </div>
    </section>`;
}

function renderCertDetail(t, cd) {
    const feePrice = (selectedLevel >= 3) ? 300000 : 500000;
    const isKO = currentLang === 'KO';
    
    // 재응시 가능 여부 체크 (기존 결제 완료 + 미통과 기록)
    const session = getSession();
    const failRecord = session ? localStorage.getItem(`isa_exam_fail_${session.email}_lv${selectedLevel}`) : null;
    const hasPaidBefore = session ? localStorage.getItem(`isa_exam_paid_${session.email}_lv${selectedLevel}`) : null;
    const isRetakeEligible = hasPaidBefore && failRecord;
    
    const steps = [
        { title: t.cert.step1, desc: t.cert.step1Desc, status: 'training-upload', icon: '📋' },
        { title: t.cert.step2, desc: t.cert.step2Desc, status: 'current', icon: '📝' },
        { title: t.cert.step3, desc: t.cert.step3Desc, status: (selectedLevel >= 1) ? 'active-form' : 'locked', icon: '🎥' },
        { title: t.cert.step4, desc: t.cert.step4Desc, status: 'locked', icon: '🏆' }
    ];

    const stepsHTML = steps.map((s, idx) => `
        <div class="process-step ${s.status}">
            <div class="step-icon">${s.icon}</div>
            <div class="step-content">
                <h4>${s.title}</h4>
                <p>${s.desc}</p>
                ${s.status === 'active-form' ? `
                    <div class="practical-form" style="margin-top:10px; display:flex; flex-direction:column; gap:10px">

                        ${(() => {
                            // 종목별 기술 요구사항 데이터
                            const skillReqMap = {
                                'Standing/Flow Board': {
                                    4: { skills: ['전/측/후방 입수 (택1)', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
                                    3: { skills: ['측면 점프/후방 입수 (택1)', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 셔빗, 쓰리 셔빗, 원에이티, 본래스(패스트플랜트), 빅스핀 이상' },
                                    2: { skills: ['후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀, 킥플립 이상' },
                                    1: { skills: ['(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>(남) 쓰리셔빗 이상, 킥플립 이상 기술 중 1개 필수 포함 (총 3개 이상)<br>(여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상 기술 중 3개 이상' }
                                },
                                'Body/Boogie Board': {
                                    4: { skills: ['전/측/후방 입수 (택1)', '원드롭니 균형 (10초↑)', '원드롭니 슬라럼 (좌우/상하 각 5회)', '원/투드롭니 360°(1바퀴돌기) 턴'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
                                    3: { skills: ['지정 기술 중 3개 포함', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 원/투드롭니 540° 스핀(2바퀴돌기), 헬리콥터, YoYo, Umbrella, 바디 롤, 바디 로데오, 빅스핀, 리버스 이상의 기술' },
                                    2: { skills: ['(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(3개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 360°(1바퀴돌기)이상의 바디턴, 360°(1바퀴돌기)이상의 바디로데오, 허브, 허브캡, 180° 셔빗, 드롭니 롤, 디테이, 드롭니 로데오, 빅스핀, 리버스 이상의 기술' },
                                    1: { skills: ['(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(4개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 540° 바디턴, 540° 바디로데오, 디테이(오버로드), 디테이 프론, 드롭니 로데오, 드롭니 로데오 프론, 180° 셔빗, 허브캡(멀티), 빅스핀 이상의 기술' }
                                },
                                'Wake Surfing': {
                                    4: { skills: ['밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
                                    3: { skills: ['웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
                                    2: { skills: ['360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
                                    1: { skills: ['에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
                                },
                                'Wave Surfing': {
                                    4: { skills: ['파도 탑승 기초', '트림 라이딩', '폼위에서 균형', '밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
                                    3: { skills: ['커팅백', '탑턴', '파도 읽기', '웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
                                    2: { skills: ['에어리얼', '튜브 라이딩 시도', '고난이도 턴', '360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
                                    1: { skills: ['에어리얼 완성', '채점 기준 이해', '심판·강사 자격', '에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
                                }
                            };
                            const req = (skillReqMap[selectedDiscipline] || {})[selectedLevel];
                            if (!req) return '';
                            const skillTags = req.skills.map(sk => `<span style="font-size:11px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);border-radius:6px;padding:3px 10px;color:#7dd3fc;">${sk}</span>`).join('');
                            return `
                            <div style="background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.25);border-radius:8px;padding:14px;margin-bottom:4px;">
                                <p style="color:#67e8f9;font-size:12px;font-weight:700;margin:0 0 10px;">📋 ${selectedLevel}급 기술 요구사항 <span style="font-weight:400;color:#94a3b8;">(공통 규정: 1분~2분 이내 원테이크, 입/퇴수 전후 5초 포함)</span></p>
                                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${req.details ? '10px' : '0'};">${skillTags}</div>
                                ${req.details ? `<p style="font-size:11px;color:#64748b;line-height:1.6;margin:0;">${req.details}</p>` : ''}
                            </div>`;
                        })()}

                        ${selectedLevel === 1 ? `
                            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:12px;margin-bottom:4px;">
                                <p style="color:#f87171;font-size:12px;margin:0;font-weight:700;line-height:1.6;">🚨 1급 필수 안내<br><span style="font-weight:400;">1급은 코칭 능력·심판·강사 자격 실기 평가를 위해 기술 시연 영상과 강습 영상 총 <strong>2개</strong>를 제출해야 합니다.</span></p>
                            </div>
                            <label style="color:white;font-size:12px;margin-bottom:-4px;">📹 1. 기술 영상 (1분~2분 이내 원테이크)</label>
                            <input type="text" id="youtube-url-tech" placeholder="기술 영상 YouTube 링크 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                            <label style="color:#a78bfa;font-size:12px;margin-top:6px;margin-bottom:-4px;display:block;">📹 2. 강습 영상 (3분~5분 이내 · 코칭 능력/심판/강사 자격 실기 평가용)</label>
                            <input type="text" id="youtube-url-coach" placeholder="강습 영상 YouTube 링크 입력 (3분~5분 이내)" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid rgba(167,139,250,0.4);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                            <p style="font-size:11px;color:#a78bfa;margin-top:-4px;">※ 강습 영상은 실제 코칭 장면이 포함된 3분~5분 이내 영상이어야 합니다.</p>
                        ` : `
                            <label style="color:white;font-size:12px;margin-bottom:-4px;">📹 실기 평가 영상 (1분~2분 이내 원테이크)</label>
                            <input type="text" id="youtube-url" placeholder="YouTube 링크 (URL) 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                        `}
                        <div style="border:1px solid var(--border);border-radius:6px;padding:12px;background:rgba(0,0,0,0.2);">
                            <p style="font-size:12px;color:#94a3b8;margin:0 0 8px;font-weight:700;">📸 본인 사진 첨부 <span style="color:#64748b;font-weight:400;">(자격증 발급용, 선택)</span></p>
                            <input type="file" id="cert-photo-input" accept="image/*"
                                style="display:none;" onchange="previewCertPhoto(this)">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <button onclick="document.getElementById('cert-photo-input').click()"
                                    style="padding:8px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
                                    border-radius:4px;color:#94a3b8;font-size:12px;cursor:pointer;">
                                    📂 사진 선택
                                </button>
                                <span id="cert-photo-name" style="font-size:12px;color:#64748b;">선택된 파일 없음</span>
                            </div>
                            <img id="cert-photo-preview" style="display:none;margin-top:8px;width:80px;height:100px;object-fit:cover;border-radius:4px;border:1px solid rgba(6,182,212,0.4);">
                        </div>
                        <button class="action-btn" style="background:var(--cyan); color:black; border:none; padding:8px; font-weight:800; border-radius:4px; cursor:pointer"
                                onclick="handlePracticalSubmit(this)">🎬 영상 제출하기</button>
                        <p style="font-size:11px;color:var(--cyan)">※ 영상을 '일부 공개'로 설정한 후 링크를 제출해 주세요.</p>
                    </div>
                ` : ''}
                ${s.status === 'training-upload' ? `
                    <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px;">
                        <div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:14px;">
                            <p style="color:#fde68a;font-size:12px;margin:0 0 10px;font-weight:700;">⏱️ ${isKO ? '급수별 최소 실습 이수 시간 (응시 자격 조건)' : 'Minimum Training Hours Required'}</p>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
                                ${[{lv:4,h:10},{lv:3,h:20},{lv:2,h:30},{lv:1,h:50}].map(r => `
                                <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;
                                    background:${selectedLevel===r.lv ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)'};
                                    border:1px solid ${selectedLevel===r.lv ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.06)'};
                                    opacity:${selectedLevel===r.lv ? '1' : '0.5'};">
                                    <span style="font-size:11px;color:${selectedLevel===r.lv ? '#fde68a' : '#94a3b8'};font-weight:${selectedLevel===r.lv ? '700' : '400'};">
                                        ${selectedLevel===r.lv ? '▶ ' : ''}강사 ${r.lv}급
                                    </span>
                                    <span style="font-size:12px;color:${selectedLevel===r.lv ? '#fbbf24' : '#64748b'};font-weight:700;margin-left:auto;">
                                        ${r.h}시간 이상
                                    </span>
                                </div>`).join('')}
                            </div>
                            <p style="color:#92400e;font-size:11px;margin:0;line-height:1.6;background:rgba(0,0,0,0.2);padding:8px;border-radius:4px;">
                                ${isKO
                                    ? `※ 각 급수별로 정해진 현장 실습(안전교육 및 기술동작 교습법 등) 시간을 수료해야만 해당 등급의 자격시험에 응시할 수 있습니다.`
                                    : `※ You must complete the required field training hours (safety education, technique instruction, etc.) for your level before applying for the qualification exam.`}
                            </p>
                        </div>
                        <div style="background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);border-radius:8px;padding:14px;">
                            <p style="color:#7dd3fc;font-size:12px;margin:0 0 6px;font-weight:700;">📎 실습 이수 증빙 자료 첨부</p>
                            <p style="color:#64748b;font-size:11px;margin:0 0 10px;line-height:1.6;">강사 확인 서명지, 이수 확인서, 수강 사진 등 증빙 서류를 첨부해주세요.<br>이미지(JPG/PNG) 또는 PDF · 최대 5개 · 각 10MB 이하</p>
                            <input type="file" id="training-proof-input" multiple accept="image/*,.pdf"
                                style="display:none;" onchange="previewTrainingProof(this)">
                            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">
                                <button onclick="document.getElementById('training-proof-input').click()"
                                    style="padding:8px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#94a3b8;font-size:12px;cursor:pointer;">
                                    📂 파일 선택
                                </button>
                                <span id="training-proof-count" style="font-size:11px;color:#475569;">선택된 파일 없음</span>
                            </div>
                            <div id="training-proof-preview" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
                            <button onclick="submitTrainingProof(this)"
                                style="width:100%;padding:10px;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.4);border-radius:6px;color:#06b6d4;font-size:13px;cursor:pointer;font-weight:700;">
                                📎 실습 이수 증빙 제출하기
                            </button>
                        </div>
                    </div>
                ` : ''}
                ${idx === 3 ? `
                    <div style="margin-top:12px; padding:14px; background:rgba(212,175,55,0.07); border:1px solid rgba(212,175,55,0.25); border-radius:10px;">
                        <p style="font-size:12px; color:#d4af37; font-weight:700; margin:0 0 8px;">🏆 디지털 자격증 발급 절차</p>
                        <ol style="font-size:12px; color:#94a3b8; margin:0; padding-left:16px; line-height:2;">
                            <li>실기 평가 영상 제출 (Step 3)</li>
                            <li>관리자 심사 및 합격 처리</li>
                            <li>PDF 자격증 자동 생성</li>
                            <li>등록 이메일로 자동 발송 📧</li>
                        </ol>
                        <div style="margin-top:10px; padding:10px; background:rgba(6,182,212,0.06); border-radius:6px; border:1px solid rgba(6,182,212,0.15);">
                            <p style="font-size:11px; color:#64748b; margin:0;">
                                ✅ 합격 후 <strong style="color:#06b6d4;">등록하신 이메일</strong>로 QR코드가 포함된 디지털 자격증 PDF가 자동 발송됩니다.
                            </p>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    return `
    <section class="page-section page-enter">
        <div class="content-container">
            <button class="back-btn" onclick="selectedLevel=null;renderPage('cert')">← ${isKO ? '목록으로' : 'Back to List'}</button>
            <div class="cert-detail-grid">
                <div class="glass-panel" style="padding:24px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
                        <div>
                            <h3 class="game-font" style="color:white; font-size:20px">${selectedDiscipline}</h3>
                            <p style="color:var(--cyan);font-weight:700">Level ${selectedLevel} ${t.cert.processTitle}</p>
                        </div>
                        <span style="padding:4px 12px;background:rgba(234,179,8,0.2);color:#facc15;border-radius:4px">${isKO ? '진행 중' : 'In Progress'}</span>
                    </div>
                    <div class="process-steps">${stepsHTML}</div>
                </div>
                
                <div class="fee-panel glass-panel">
                    <h3 style="color:white;margin-bottom:16px">${t.cert.examFee}</h3>

                    <!-- 강사 선택 동적 폼 -->
                    <div style="margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; border: 1px solid rgba(6,182,212,0.2);">
                        <h4 style="color: white; font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                            ${isKO ? '강습 방식 선택' : 'Instruction Type'}
                            <span style="font-size: 11px; color: var(--cyan); background: rgba(6,182,212,0.1); padding: 2px 6px; border-radius: 4px; font-weight: normal;">
                                ${isKO ? '강사 지원금 환급 대상' : 'Eligible for Rebate'}
                            </span>
                        </h4>
                        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="self" checked onchange="document.getElementById('instructor-fields').style.display='none'" style="accent-color: var(--cyan);">
                                ${isKO ? '독학' : 'Self-taught'}
                            </label>
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="instructor" onchange="document.getElementById('instructor-fields').style.display='flex'" style="accent-color: var(--cyan);">
                                ${isKO ? '전담 강사 있음' : 'With Instructor'}
                            </label>
                        </div>
                        <div id="instructor-fields" style="display: none; flex-direction: column; gap: 10px;">
                            <p style="font-size: 11px; color: var(--text-dim); margin-bottom: 4px;">${isKO ? '※ 정식 자격증 보유 강사에게 강습을 받은 경우, 해당 강사에게 협회 차원의 강습료가 별도 지급됩니다.' : '※ If trained by a certified instructor, they will receive an instruction fee from the association.'}</p>
                            <input type="text" id="inst-name" placeholder="${isKO ? '강사 이름 (Name)' : 'Instructor Name'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <input type="text" id="inst-cert" placeholder="${isKO ? '강사 자격증 번호 (Cert No.)' : 'Certification No.'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <input type="tel" id="inst-phone" placeholder="${isKO ? '강사 연락처 (Phone)' : 'Contact Number'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                    </div>

                    <!-- ★ 중요 안내 메세지 ★ -->
                    <div style="margin-bottom:16px">

                        <!-- 환불 불가 안내 -->
                        <div class="cert-warning-box red">
                            <span class="warn-icon">🚫</span>
                            <div>
                                <strong>${isKO ? '결제 후 환불 불가' : 'No Refund After Payment'}</strong>
                                ${isKO ? '응시료 결제 완료 후에는 어떠한 경우에도 환불이 불가합니다. 결제 전 반드시 확인해주세요.' : 'Once the exam fee is paid, no refunds will be issued under any circumstances. Please confirm before payment.'}
                            </div>
                        </div>

                        <!-- 48시간 이내 응시 안내 -->
                        <div class="cert-warning-box amber">
                            <span class="warn-icon">⏰</span>
                            <div>
                                <strong>${isKO ? '필기시험 결제 후 48시간 이내 응시 필수' : 'Written Exam Must Be Taken Within 48 Hours of Payment'}</strong>
                                ${isKO ? '결제 완료 시점으로부터 48시간 이내에 필기시험을 응시하셔야 합니다. 기간 초과 시 응시 자격이 소멸됩니다.' : 'You must take the written exam within 48 hours of payment. Failure to do so will forfeit your exam eligibility.'}
                            </div>
                        </div>

                        <!-- 실기평가 1년 이내 강조 박스 -->
                        <div class="cert-emphasis-box">
                            <strong>🏄 ${isKO ? '실기평가 업로드 기한 : 필기시험 응시일 기준 1년 이내 필수' : 'Practical Evaluation Upload: Must Be Submitted Within 1 Year of the Written Exam Date'}</strong>
                            <span>${isKO ? '필기시험 합격 후, 실기평가 영상 업로드는 필기시험 응시일로부터 반드시 1년 이내에 완료해야 합니다. 기한 초과 시 필기시험부터 재응시해야 하며, 추가 비용이 발생합니다.' : 'After passing the written exam, your practical evaluation video must be uploaded within 1 year of your written exam date. If the deadline is exceeded, you must retake the written exam with additional fees.'}</span>
                        </div>

                    </div>

                    <div class="row" style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--text-dim);"><span>${isKO ? '인적사항 및 서류 심사' : 'Document Review'}</span><span style="color:white;">Included</span></div>
                    <div class="row" style="display:flex; justify-content:space-between; margin-bottom:16px; color:var(--text-dim);"><span>${isKO ? '발급 수수료' : 'Issuance Fee'}</span><span style="color:white;">Included</span></div>
                    <div style="height:1px; background:var(--border); margin-bottom:16px;"></div>

                    <div class="fee-total" style="display:flex; justify-content:space-between; align-items:center; font-size:20px; font-weight:bold; color:var(--cyan);">
                        <span>Total</span>
                        <span>₩${feePrice.toLocaleString()}</span>
                    </div>
                    <div style="margin-top:8px; padding:8px 12px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; color:#22c55e; font-weight:700;">🎁 ${isKO ? '적립 예정 포인트 (1%)' : 'Expected Points (1%)'}</span>
                        <span style="font-size:13px; color:#22c55e; font-weight:800;">+${(feePrice * 0.01).toLocaleString()}P</span>
                    </div>
                    <p style="font-size:11px; color:var(--text-dim); margin-top:8px;">${isKO ? '* 실기 이수시간(이용료) 별도' : '* Practice fee not included'}</p>

                    <!-- 실습 이수 시간 안내 -->
                    ${(() => {
                        const reqHours = {4:10, 3:20, 2:30, 1:50}[selectedLevel] || 0;
                        return `
                        <div style="margin-top:16px;padding:14px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.3);border-radius:10px;">
                            <p style="font-size:12px;color:#fde68a;font-weight:700;margin:0 0 8px;">⏱️ ${isKO ? '응시 자격 조건 : 최소 실습 이수 시간' : 'Eligibility : Minimum Training Hours'}</p>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                                <span style="font-size:22px;font-weight:900;color:#fbbf24;">${reqHours}시간</span>
                                <span style="font-size:12px;color:#94a3b8;line-height:1.5;">${isKO ? `강사 ${selectedLevel}급 응시를 위해<br>현장 실습 <strong style="color:#fde68a">${reqHours}시간 이상</strong> 수료 필요` : `${reqHours}+ hours of field training<br>required for Level ${selectedLevel} exam`}</span>
                            </div>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                ${[{lv:4,h:10},{lv:3,h:20},{lv:2,h:30},{lv:1,h:50}].map(r=>`
                                <span style="font-size:10px;padding:2px 8px;border-radius:12px;
                                    background:${selectedLevel===r.lv?'rgba(245,158,11,0.25)':'rgba(255,255,255,0.04)'};
                                    border:1px solid ${selectedLevel===r.lv?'rgba(245,158,11,0.6)':'rgba(255,255,255,0.08)'};
                                    color:${selectedLevel===r.lv?'#fbbf24':'#475569'};
                                    font-weight:${selectedLevel===r.lv?'700':'400'};">
                                    ${r.lv}급 ${r.h}h+
                                </span>`).join('')}
                            </div>
                        </div>`;
                    })()}

                    <!-- 결제 전 동의 체크박스 -->
                    <div class="cert-agree-box" style="margin-top:16px">
                        <p style="font-size:12px;color:var(--text-dark);margin-bottom:10px;font-weight:700">${isKO ? '📌 결제 전 필수 동의사항' : '📌 Required Agreements Before Payment'}</p>
                        <label class="cert-agree-item">
                            <input type="checkbox" id="agree-training-hours" style="accent-color:#f59e0b;width:16px;height:16px;flex-shrink:0">
                            <span>${isKO
                                ? `강사 ${selectedLevel}급 응시 자격인 최소 실습 이수 시간(<strong style="color:#fbbf24">${{4:10,3:20,2:30,1:50}[selectedLevel]}시간 이상</strong>)을 충족하였음을 확인하였습니다.`
                                : `I confirm that I have completed the minimum required training hours (<strong style="color:#fbbf24">${{4:10,3:20,2:30,1:50}[selectedLevel]}h+</strong>) for Level ${selectedLevel}.`
                            }</span>
                            <span class="required-badge">${isKO ? '필수' : 'Required'}</span>
                        </label>
                        <label class="cert-agree-item">
                            <input type="checkbox" id="agree-no-refund" style="accent-color:#ef4444;width:16px;height:16px;flex-shrink:0">
                            <span>${isKO ? '결제 후 환불이 불가함을 확인하였습니다.' : 'I understand that no refunds are available after payment.'}</span>
                            <span class="required-badge">${isKO ? '필수' : 'Required'}</span>
                        </label>
                        <label class="cert-agree-item">
                            <input type="checkbox" id="agree-48hr" style="accent-color:#f59e0b;width:16px;height:16px;flex-shrink:0">
                            <span>${isKO ? '결제 후 48시간 이내 필기시험 응시를 확인하였습니다.' : 'I understand I must take the written exam within 48 hours of payment.'}</span>
                            <span class="required-badge">${isKO ? '필수' : 'Required'}</span>
                        </label>
                        <label class="cert-agree-item">
                            <input type="checkbox" id="agree-1year" style="accent-color:#a855f7;width:16px;height:16px;flex-shrink:0">
                            <span>${isKO ? '실기평가 업로드 기한(필기 응시일 기준 1년)을 확인하였습니다.' : 'I understand the practical evaluation upload deadline (1 year from written exam date).'}</span>
                            <span class="required-badge">${isKO ? '필수' : 'Required'}</span>
                        </label>
                    </div>
                    
                    <!-- 결제 수단 선택 -->
                    <div style="margin-top:20px; background:rgba(0,0,0,0.3); padding:16px; border-radius:8px; border:1px solid rgba(6,182,212,0.2);">
                        <h4 style="color:white; font-size:14px; margin-bottom:12px;">${isKO ? '결제 수단 선택' : 'Select Payment Method'}</h4>
                        <div style="display:flex; gap:12px;">
                            <label style="flex:1; cursor:pointer; display:flex; align-items:center; gap:8px; padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:6px; color:#cbd5e1; font-size:13px;">
                                <input type="radio" name="cert-pay-method" value="card" checked onclick="document.getElementById('cert-bank-info').style.display='none'" style="accent-color:var(--cyan);">
                                💳 ${isKO ? '카드' : 'Card'}
                            </label>
                            <label style="flex:1; cursor:pointer; display:flex; align-items:center; gap:8px; padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:6px; color:#cbd5e1; font-size:13px;">
                                <input type="radio" name="cert-pay-method" value="bank" onclick="document.getElementById('cert-bank-info').style.display='block'" style="accent-color:var(--cyan);">
                                🏦 ${isKO ? '무통장' : 'Bank'}
                            </label>
                        </div>
                        <div id="cert-bank-info" style="display:none; margin-top:12px; padding:12px; background:rgba(6,182,212,0.1); border:1px solid var(--cyan); border-radius:8px;">
                            <p style="font-size:13px; color:white; margin-bottom:4px; font-weight:700;">토스뱅크 1000-7587-9085</p>
                            <p style="font-size:11px; color:var(--text-dim);">예금주: 곽세영 (국제인공서핑협회)</p>
                        </div>
                    </div>

                    <!-- 결제 버튼 (일반 응시) -->
                    ${hasPaidBefore && !failRecord ? `
                    <div class="cert-warning-box cyan" style="margin-top:12px">
                        <span class="warn-icon">ℹ️</span>
                        <div>${isKO ? '이미 결제 이력이 있습니다. 필기시험 결과를 확인해주세요.' : 'You have already paid. Please check your written exam result.'}</div>
                    </div>` : ''}
                    
                    ${!hasPaidBefore ? `
                    <button class="btn-primary" style="width:100%;margin-top:16px; padding:14px; font-size:16px; font-weight:bold;" id="pay-btn" onclick="certApplyCheck()">${isKO ? '💳 결제하고 응시 신청' : '💳 Pay & Apply for Exam'}</button>` : ''}

                    <!-- 재응시 결제 섹션 (미통과자 전용) -->
                    ${isRetakeEligible ? `
                    <div style="margin-top:16px; padding:14px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:10px">
                        <p style="font-size:12px;color:#fde68a;font-weight:700;margin-bottom:4px">🔄 ${isKO ? '필기시험 재응시 안내' : 'Written Exam Retake'}</p>
                        <p style="font-size:12px;color:var(--text-dim);margin-bottom:10px">${isKO ? '이전 시험에서 통과하지 못하셨습니다. 재응시료(₩10,000)를 결제하시면 다시 응시할 수 있습니다.' : 'You did not pass the previous exam. Pay the retake fee (₩10,000) to attempt again.'}</p>
                        <div class="fee-total" style="font-size:18px;margin-bottom:0">
                            <span style="color:var(--amber);font-size:14px">${isKO ? '재응시료' : 'Retake Fee'}</span>
                            <span style="color:#fde68a">₩10,000</span>
                        </div>
                        <button class="btn-retake" id="retake-btn" onclick="certRetakeCheck()">${isKO ? '🔄 재응시 결제 (₩10,000)' : '🔄 Pay Retake Fee (₩10,000)'}</button>
                    </div>` : ''}
                    
                    ${hasPaidBefore && !failRecord && !isRetakeEligible ? '' : ''}
                    
                </div>
            </div>
        </div>
    </section>`;
}

// ===== SHOP PAGE (LINK TO ISA-SHOP) =====
function renderShopPage() {
    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="content-container glass-panel fade-in" style="text-align:center; padding:80px 20px; max-width:600px; margin: 40px auto; border: 1px solid rgba(6,182,212,0.3);">
            <div style="font-size: 60px; margin-bottom: 20px;">🏄♂️</div>
            <h2 class="game-font " style="font-size:32px; color:white; margin-bottom:16px; letter-spacing:1px;">ISA Official Store</h2>
            <p style="color:var(--text-dim); font-size:16px; margin-bottom: 40px; line-height:1.8;">
                ${currentLang === 'KO' ? 
                '국제인공서핑협회 장비스토어가 <b>새로운 프리미엄 플랫폼</b>으로 단장했습니다.<br>지금 접속하여 쿠팡 및 올리브영 제휴 혜택을 만나보세요!' : 
                'The ISA equipment store has been revamped into a <b>new premium platform.</b><br>Visit now to explore exclusive partner benefits and gear!'}
            </p>
            <a href="/shop/" target="_blank" style="display:inline-block; padding: 16px 40px; background: var(--cyan); color: #000; font-weight: 800; border-radius: 999px; font-size: 18px; text-decoration: none; box-shadow: 0 0 20px rgba(6,182,212,0.4); border: 2px solid var(--cyan);">
                ${currentLang === 'KO' ? '장비스토어 입장하기 →' : 'Enter Official Store →'}
            </a>
        </div>
    </section>`;
}

// ===== MAP & EDU & INTRO (CLAUDE STATIC FALLBACKS) =====
function renderMapPage() {
    const t = LANG[currentLang];
    const isKO = currentLang === 'KO';
    const di = DISCIPLINE_INFO[currentLang];

    const skillMap = isKO ? {
        'Standing/Flow Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['측면 점프/후방 입수 (택1)', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 셔빗, 쓰리 셔빗, 원에이티, 본래스(패스트플랜트), 빅스핀 이상' },
            { level: 2, skills: ['후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀, 킥플립 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>(남) 쓰리셔빗 이상, 킥플립 이상 기술 중 1개 필수 포함 (총 3개 이상)<br>(여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '원드롭니 균형 (10초↑)', '원드롭니 슬라럼 (좌우/상하 각 5회)', '원/투드롭니 360°(1바퀴돌기) 턴'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['지정 기술 중 3개 포함', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 원/투드롭니 540° 스핀(2바퀴돌기), 헬리콥터, YoYo, Umbrella, 바디 롤, 바디 로데오, 빅스핀, 리버스 이상의 기술' },
            { level: 2, skills: ['(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(3개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 360°(1바퀴돌기)이상의 바디턴, 360°(1바퀴돌기)이상의 바디로데오, 허브, 허브캡, 180° 셔빗, 드롭니 롤, 디테이, 드롭니 로데오, 빅스핀, 리버스 이상의 기술' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(4개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 540° 바디턴, 540° 바디로데오, 디테이(오버로드), 디테이 프론, 드롭니 로데오, 드롭니 로데오 프론, 180° 셔빗, 허브캡(멀티), 빅스핀 이상의 기술<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
            { level: 2, skills: ['360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['파도 탑승 기초', '트림 라이딩', '폼위에서 균형', '밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['커팅백', '탑턴', '파도 읽기', '웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
            { level: 2, skills: ['에어리얼', '튜브 라이딩 시도', '고난이도 턴', '360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '에어리얼 완성', '채점 기준 이해', '심판·강사 자격', '에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ]
    } : {
        'Standing/Flow Board': [
            { level: 4, skills: ['Maintain basic stance', 'Straight riding', 'Ride 10sec without fall'] },
            { level: 3, skills: ['Frontside/Backside turns', 'Switch stance', 'Basic pumping'] },
            { level: 2, skills: ['Aerial attempts', '360° spin', 'Nose riding'] },
            { level: 1, skills: ['Full aerials', 'Combo tricks', 'Demonstration & teaching'] }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['Prone position', 'Wave entry', 'Basic direction change'] },
            { level: 3, skills: ['El Rollo turns', 'Spin attempts', 'Fade ride'] },
            { level: 2, skills: ['Aerial roll attempts', '360° roll', 'High-speed control'] },
            { level: 1, skills: ['Full aerial rolls', 'Backflip attempts', 'Judge capability'] }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['Balance riding', 'Wake wave sustain', 'Basic stance'] },
            { level: 3, skills: ['Wake-to-wake', 'Ollie attempts', 'Switch riding'] },
            { level: 2, skills: ['360° spin', 'Air attempts', 'Rail turn mastery'] },
            { level: 1, skills: ['Air tricks mastery', 'Combo riding', 'Coaching ability'] }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['Basic wave riding', 'Trim riding', 'Balance on foam'] },
            { level: 3, skills: ['Cutback', 'Top turn', 'Wave reading'] },
            { level: 2, skills: ['Aerial', 'Tube riding attempt', 'Advanced turns'] },
            { level: 1, skills: ['Full aerials', 'Scoring criteria', 'Judge & instructor'] }
        ]
    };

    const disciplineSections = DISCIPLINES.map((disc, dIdx) => {
        const info = di[disc] || {};
        const skills = skillMap[disc] || [];
        const gradColors = [
            ['#06b6d4','#2563eb'],
            ['#8b5cf6','#ec4899'],
            ['#f59e0b','#ef4444'],
            ['#10b981','#06b6d4']
        ];
        const [c1, c2] = gradColors[dIdx % 4];

        const skillsHTML = skills.map(s => `
            <div style="display:flex;flex-direction:column;gap:8px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,${c1}33,${c2}33);
                        border:1px solid ${c1}55;display:flex;align-items:center;justify-content:center;
                        font-family:'Orbitron',sans-serif;font-size:11px;font-weight:900;color:${c1};flex-shrink:0;">${s.level}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${s.skills.map(sk => `<span style="font-size:12px;background:rgba(255,255,255,0.05);
                            border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:3px 10px;color:#cbd5e1;">${sk}</span>`).join('')}
                    </div>
                </div>
                ${s.details ? `<div style="padding-left:40px;font-size:11px;color:#64748b;line-height:1.5;">${s.details}</div>` : ''}
            </div>
        `).join('');

        return `
        <div class="intro-discipline-block map-discipline-block" id="map-block-${dIdx}" style="margin-bottom:80px;${dIdx===0?'':'display:none;'}">

            <!-- 헤더 배너 -->
            <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:32px;
                background:linear-gradient(135deg, rgba(${dIdx%2===0?'6,182,212':'168,85,247'},0.08) 0%, rgba(15,23,42,0.9) 100%);
                border:1px solid rgba(255,255,255,0.08);padding:32px;">
                <div style="position:absolute;top:0;right:0;bottom:0;width:120px;
                    background:linear-gradient(to left,rgba(15,23,42,0),rgba(15,23,42,0));
                    display:flex;align-items:center;justify-content:center;opacity:0.15;">
                    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                </div>
                <div style="position:absolute;top:0;left:0;bottom:0;width:4px;
                    background:linear-gradient(to bottom,${c1},${c2});border-radius:4px 0 0 4px;"></div>
                <div style="padding-left:16px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <span style="font-size:11px;font-weight:700;letter-spacing:2px;
                            background:linear-gradient(135deg,${c1}22,${c2}22);
                            border:1px solid ${c1}44;border-radius:999px;padding:4px 12px;color:${c1};">
                            DISCIPLINE ${dIdx+1}/4
                        </span>
                    </div>
                    <h3 class="game-font" style="font-size:clamp(22px,4vw,32px);font-weight:900;color:white;margin-bottom:8px;">
                        ${info.title || disc}
                    </h3>
                    <p style="color:#94a3b8;font-size:15px;max-width:600px;line-height:1.7;">${info.desc || ''}</p>
                </div>
            </div>

            <!-- 등급별 기술 요구사항 -->
            <div style="margin-top:0;background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.07);
                border-radius:16px;padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h4 style="color:white;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="display:inline-block;width:3px;height:18px;background:linear-gradient(to bottom,${c1},${c2});border-radius:2px;"></span>
                        ${isKO ? '등급별 기술 요구사항' : 'Level Skill Requirements'}
                    </h4>
                    <span style="font-size:11px;color:#475569;">${isKO ? '4급(초급) → 1급(전문가)' : 'Level 4 (Beginner) → Level 1 (Expert)'}</span>
                </div>
                ${isKO ? `
                <div style="margin-bottom:16px;padding:14px;background:rgba(${dIdx%2===0?'6,182,212':'168,85,247'},0.05);border:1px dashed rgba(255,255,255,0.15);border-radius:10px;">
                    <p style="font-size:12px;color:white;margin:0 0 6px;font-weight:700;">[공통 규정]</p>
                    <ul style="margin:0;padding-left:18px;font-size:12px;color:#94a3b8;line-height:1.6;">
                        <li><strong>영상 촬영:</strong> 1분~2분 이내 원테이크 (입수 전 5초, 퇴수 후 5초 반드시 포함)</li>
                        <li><strong>합격 기준:</strong> 타인의 도움 없이 1회 주행 내에 기술 완성 시 합격</li>
                    </ul>
                </div>
                ` : ''}
                ${skillsHTML}
            </div>

            <!-- 자격증 신청 CTA -->
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
                <button onclick="selectedDiscipline='${disc}';selectedLevel=null;renderPage('cert')"
                    style="flex:1;min-width:200px;padding:16px 24px;
                    background:linear-gradient(135deg,${c1},${c2});
                    border:none;border-radius:12px;color:white;font-weight:900;font-size:15px;
                    cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;
                    box-shadow:0 0 20px ${c1}44;"
                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px ${c1}66'"
                    onmouseout="this.style.transform='none';this.style.boxShadow='0 0 20px ${c1}44'">
                    🏆 ${isKO ? `${disc.split('/')[0]} 자격증 신청하기` : `Apply for ${disc.split('/')[0]} Cert`}
                </button>
                <button onclick="renderPage('cert')"
                    style="padding:16px 20px;background:rgba(255,255,255,0.06);
                    border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#94a3b8;
                    font-weight:700;font-size:14px;cursor:pointer;transition:all 0.3s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='white'"
                    onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='#94a3b8'">
                    📋 ${isKO ? '자격증 전체 보기' : 'View All Certs'}
                </button>
            </div>

        </div>`;
    }).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-dark);padding-bottom:80px;">
        <div class="content-container">

            <!-- 페이지 헤더 -->
            <div style="text-align:center;padding:60px 0 48px;">
                <div style="display:inline-flex;align-items:center;gap:8px;
                    background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);
                    border-radius:999px;padding:6px 16px;margin-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:2px;">ISA DISCIPLINES</span>
                </div>
                <h2 class="game-font section-title" style="margin-bottom:12px;">
                    ${isKO ? '실기평가' : 'Practical Evaluation'}
                </h2>
                <p style="color:#94a3b8;font-size:16px;max-width:480px;margin:0 auto;line-height:1.7;">
                    ${isKO ? '4가지 인공서핑 종목의 등급별 기술 요구사항을 확인하세요.' : 'Check level skill requirements for each of the 4 disciplines.'}
                </p>

                <!-- 종목 탭 -->
                <div class="discipline-tabs" style="margin-top:28px;">
                    ${DISCIPLINES.map((d,i)=>`
                    <button class="discipline-tab intro-tab-btn${i===0?' active':''}"
                        id="map-tab-${i}"
                        onclick="
                            document.querySelectorAll('.intro-tab-btn').forEach(b=>b.classList.remove('active'));
                            document.getElementById('map-tab-${i}').classList.add('active');
                            document.querySelectorAll('.map-discipline-block').forEach(el=>el.style.display='none');
                            document.getElementById('map-block-${i}').style.display='block';
                            window.scrollTo({top:0,behavior:'smooth'});
                        ">${d}
                    </button>`).join('')}
                </div>
            </div>

            <!-- 종목 내용 (탭별 개별 표시) -->
            ${disciplineSections}

        </div>
    </section>`;
}

function renderEduPage() {
    const isKO = currentLang === 'KO';
    
    return `
    <section class="page-section page-enter" style="background: var(--bg-slate); min-height: 100vh; padding-bottom: 80px;">
        <div class="content-container" style="max-width: 800px; margin: 0 auto; padding: 60px 20px 40px;">
            
            <!-- 교육 센터 헤더 -->
            <div style="text-align: center; margin-bottom: 48px;">
                <h2 class="game-font" style="font-size: clamp(28px, 5vw, 42px); color: var(--cyan); margin-bottom: 12px; letter-spacing: 1px;">
                    ${isKO ? '교육 센터' : 'Education Center'}
                </h2>
                <p style="color: var(--text-dim); font-size: 15px; line-height: 1.6;">
                    ${isKO ? 'ISA의 전문적인 교육 생태계' : 'ISA\'s Professional Education Ecosystem'}
                </p>
                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, var(--cyan), #2563eb); margin: 20px auto 0; border-radius: 2px;"></div>
            </div>

            <!-- 강사 배정 카드 -->
            <div class="glass-panel" style="border-radius: 20px; margin-bottom: 20px; overflow: hidden; border: 1px solid rgba(6,182,212,0.15); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;"
                onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 20px 60px rgba(6,182,212,0.15)'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                <div style="padding: 32px 28px; display: flex; align-items: flex-start; gap: 20px;">
                    <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="1.8">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: white; font-size: 20px; font-weight: 700; margin-bottom: 8px;">
                            ${isKO ? '강사 배정' : 'Instructor Assignment'}
                        </h3>
                        <p style="color: var(--text-dim); font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
                            ${isKO ? '전문 강사 1:1 매칭 시스템' : 'Expert Instructor 1:1 Matching System'}
                        </p>
                        
                        <!-- 강사 배정 상세 내용 -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                                <div style="color: var(--cyan); font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${isKO ? '매칭 방식' : 'Matching Method'}
                                </div>
                                <div style="color: white; font-size: 13px; line-height: 1.5;">
                                    ${isKO ? '수준별 · 지역별 최적 강사 AI 매칭' : 'AI-based optimal instructor matching by level & region'}
                                </div>
                            </div>
                            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                                <div style="color: var(--cyan); font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${isKO ? '강사 자격' : 'Instructor Qualifications'}
                                </div>
                                <div style="color: white; font-size: 13px; line-height: 1.5;">
                                    ${isKO ? 'ISA 공인 자격증 보유 강사' : 'ISA certified license holders'}
                                </div>
                            </div>
                            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                                <div style="color: var(--cyan); font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${isKO ? '강습 지원금' : 'Teaching Subsidy'}
                                </div>
                                <div style="color: white; font-size: 13px; line-height: 1.5;">
                                    ${isKO ? '협회 차원 강습료 별도 지급' : 'Association-level teaching fee paid separately'}
                                </div>
                            </div>
                            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                                <div style="color: var(--cyan); font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${isKO ? '대상' : 'Target'}
                                </div>
                                <div style="color: white; font-size: 13px; line-height: 1.5;">
                                    ${isKO ? '4급~1급 자격증 취득 희망자' : 'Applicants for Level 4~1 Certification'}
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.2); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">📌</span>
                            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                                ${isKO 
                                    ? '자격증 취득 신청 시 "전담 강사 있음"을 선택하면, 해당 강사에게 협회 차원의 강습료가 지급됩니다. 강사 배정 신청은 준비 중입니다.' 
                                    : 'When applying for certification, select "With Instructor" to trigger an association teaching fee for the assigned instructor. Instructor assignment requests coming soon.'}
                            </p>
                        </div>
                        
                        <div style="margin-top: 16px;">
                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; color: #fde68a; font-size: 12px; font-weight: 700;">
                                🔜 ${isKO ? '강사 배정 신청 시스템 준비 중' : 'Instructor Assignment System Coming Soon'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ISA 아카데미 카드 -->
            <div class="glass-panel" style="border-radius: 20px; margin-bottom: 20px; overflow: hidden; border: 1px solid rgba(6,182,212,0.15); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;"
                onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 20px 60px rgba(6,182,212,0.15)'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                <div style="padding: 32px 28px; display: flex; align-items: flex-start; gap: 20px;">
                    <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="1.8">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: white; font-size: 20px; font-weight: 700; margin-bottom: 8px;">
                            ${isKO ? 'ISA 아카데미' : 'ISA Academy'}
                        </h3>
                        <p style="color: var(--text-dim); font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
                            ${isKO ? 'AI 기반 인공서핑 전문 교육 플랫폼' : 'AI-powered Artificial Surfing Professional Education Platform'}
                        </p>
                        
                        <!-- 아카데미 과정 목록 -->
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                            ${[
                                { 
                                    emoji: '🏄', 
                                    title: isKO ? '자세 분석 & 피드백' : 'Posture Analysis & Feedback',
                                    desc: isKO ? 'AI가 실기 영상을 분석하여 자세 교정 피드백 제공' : 'AI analyzes practical video and provides posture correction feedback'
                                },
                                { 
                                    emoji: '📚', 
                                    title: isKO ? '온라인 이론 강의' : 'Online Theory Lectures',
                                    desc: isKO ? '인공서핑 이론, 안전수칙, 장비 운용법 영상 강의' : 'Video lectures on artificial surfing theory, safety rules, and equipment operation'
                                },
                                { 
                                    emoji: '🎯', 
                                    title: isKO ? '레벨별 맞춤 커리큘럼' : 'Level-specific Customized Curriculum',
                                    desc: isKO ? '4급~1급까지 단계별 체계적인 교육 과정' : 'Systematic structured curriculum from Level 4 to Level 1'
                                },
                                { 
                                    emoji: '🏆', 
                                    title: isKO ? '강사 자격 전문 과정' : 'Instructor License Professional Course',
                                    desc: isKO ? 'ISA 공인 강사 자격 취득을 위한 심화 교육 과정' : 'Advanced training for obtaining ISA certified instructor qualification'
                                }
                            ].map(item => `
                                <div style="display: flex; align-items: flex-start; gap: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.06);">
                                    <span style="font-size: 22px; flex-shrink: 0; margin-top: 1px;">${item.emoji}</span>
                                    <div>
                                        <div style="color: white; font-size: 14px; font-weight: 700; margin-bottom: 4px;">${item.title}</div>
                                        <div style="color: var(--text-dim); font-size: 13px; line-height: 1.5;">${item.desc}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.2); border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">🤖</span>
                            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                                ${isKO 
                                    ? 'ISA 아카데미는 AI 기반 맞춤형 교육 시스템으로 개발 중입니다. 오픈 시 회원에게 우선 안내드립니다.' 
                                    : 'ISA Academy is being developed as an AI-based personalized education system. Members will be notified first upon launch.'}
                            </p>
                        </div>
                        
                        <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; color: #fde68a; font-size: 12px; font-weight: 700;">
                                🔜 ${isKO ? 'ISA 아카데미 오픈 준비 중' : 'ISA Academy Opening Soon'}
                            </span>
                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; color: #c4b5fd; font-size: 12px; font-weight: 700;">
                                🤖 ${isKO ? 'AI 기반' : 'AI Powered'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 문의 배너 -->
            <div style="background: linear-gradient(135deg, rgba(6,182,212,0.08), rgba(37,99,235,0.08)); border: 1px solid rgba(6,182,212,0.2); border-radius: 16px; padding: 24px 28px; text-align: center; margin-top: 8px;">
                <p style="color: white; font-size: 15px; font-weight: 700; margin-bottom: 8px;">
                    ${isKO ? '📞 교육 관련 문의' : '📞 Education Inquiries'}
                </p>
                <p style="color: var(--text-dim); font-size: 13px;">
                    Email: <a href="mailto:info@isa-surfing.org" style="color: var(--cyan);">info@isa-surfing.org</a> &nbsp;|&nbsp; Tel: 02-554-2212
                </p>
            </div>

        </div>
    </section>`;
}


// ===== VERIFY PAGE =====
function renderVerifyPage() {
    const isKO = currentLang === 'KO';
    const hash = window.location.hash;
    const certIdFromUrl = (hash.match(/[?&]id=([^&]+)/) || [])[1] || '';

    setTimeout(() => {
        if (certIdFromUrl) {
            const input = document.getElementById('verify-cert-input');
            if (input) {
                input.value = decodeURIComponent(certIdFromUrl);
                window.verifyCertById(decodeURIComponent(certIdFromUrl));
            }
        }
    }, 100);

    return `
    <section class="page-section page-enter" style="background:var(--bg-dark);min-height:80vh;">
        <div class="content-container" style="max-width:600px;padding:60px 20px;">
            <div style="text-align:center;margin-bottom:40px;">
                <div style="display:inline-flex;align-items:center;gap:8px;
                    background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);
                    border-radius:999px;padding:6px 16px;margin-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:2px;">🔍 CERT VERIFY</span>
                </div>
                <h2 class="game-font section-title" style="margin-bottom:12px;">
                    ${isKO ? '자격증 진위 확인' : 'Certificate Verification'}
                </h2>
                <p style="color:#94a3b8;font-size:15px;line-height:1.7;">
                    ${isKO ? '자격증 번호를 입력하면 ISA 공식 발급 여부를 확인할 수 있습니다.' : 'Enter a certificate number to verify official ISA issuance.'}
                </p>
            </div>

            <!-- 입력 폼 -->
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
                border-radius:16px;padding:28px;margin-bottom:24px;">
                <label style="display:block;font-size:12px;color:#94a3b8;letter-spacing:2px;margin-bottom:10px;">
                    ${isKO ? '자격증 번호' : 'CERTIFICATE NUMBER'}
                </label>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="verify-cert-input"
                        placeholder="ISA-2026-000001"
                        style="flex:1;padding:14px 16px;background:rgba(0,0,0,0.3);
                        border:1px solid rgba(255,255,255,0.12);border-radius:10px;
                        color:white;font-size:15px;font-family:monospace;letter-spacing:1px;
                        outline:none;transition:border 0.3s;"
                        onfocus="this.style.borderColor='var(--cyan)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.12)'"
                        onkeydown="if(event.key==='Enter') window.verifyCertById(this.value)">
                    <button onclick="window.verifyCertById(document.getElementById('verify-cert-input').value)"
                        style="padding:14px 22px;background:linear-gradient(135deg,var(--cyan),#2563eb);
                        border:none;border-radius:10px;color:white;font-weight:700;font-size:14px;
                        cursor:pointer;transition:all 0.3s;white-space:nowrap;"
                        onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                        ${isKO ? '확인' : 'Verify'}
                    </button>
                </div>
            </div>

            <!-- 결과 표시 영역 -->
            <div id="verify-result"></div>

            <!-- QR 안내 -->
            <div style="text-align:center;margin-top:32px;padding:20px;
                border:1px dashed rgba(255,255,255,0.1);border-radius:12px;">
                <p style="font-size:12px;color:#475569;margin:0;">
                    📱 ${isKO ? 'QR코드를 스캔하면 자동으로 진위 확인이 됩니다.' : 'Scan the QR code on the certificate for automatic verification.'}
                </p>
            </div>
        </div>
    </section>`;
}

window.verifyCertById = async function(certId) {
    const resultEl = document.getElementById('verify-result');
    if (!resultEl) return;
    const id = (certId || '').trim().toUpperCase();
    if (!id) {
        resultEl.innerHTML = '<p style="color:#ef4444;text-align:center;">자격증 번호를 입력해주세요.</p>';
        return;
    }
    const isKO = currentLang === 'KO';
    resultEl.innerHTML = '<div style="text-align:center;padding:20px;"><div style="display:inline-block;width:24px;height:24px;border:3px solid var(--cyan);border-top:3px solid transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div></div>';

    try {
        const url = GOOGLE_SCRIPT_URL + '?action=verifyCertificate&certId=' + encodeURIComponent(id);
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'success' && json.valid) {
            const c = json.cert;
            const levelColors = {'1급':'#d4af37','2급':'#06b6d4','3급':'#10b981','4급':'#94a3b8'};
            const lColor = levelColors[c.level] || '#94a3b8';
            resultEl.innerHTML = `
            <div style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.04));
                border:1px solid rgba(16,185,129,0.3);border-radius:16px;padding:28px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                    <div style="width:52px;height:52px;border-radius:50%;background:rgba(16,185,129,0.2);
                        display:flex;align-items:center;justify-content:center;font-size:26px;">✅</div>
                    <div>
                        <div style="font-size:18px;font-weight:900;color:#10b981;">유효한 자격증</div>
                        <div style="font-size:12px;color:#64748b;">Valid ISA Certificate</div>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.25);border-radius:12px;padding:20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">자격증번호</div>
                            <div style="font-size:13px;color:white;font-family:monospace;font-weight:700;">${c.certNumber}</div></div>
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">성명</div>
                            <div style="font-size:16px;color:white;font-weight:700;">${c.name}</div></div>
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">등급</div>
                            <div style="font-size:16px;font-weight:900;color:${lColor};">${c.level}</div></div>
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">종목</div>
                            <div style="font-size:13px;color:white;">${c.discipline}</div></div>
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">발급일</div>
                            <div style="font-size:13px;color:white;">${c.issueDate}</div></div>
                        <div><div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">상태</div>
                            <div style="font-size:13px;color:#10b981;font-weight:700;">${c.status || '발급완료'}</div></div>
                    </div>
                </div>
            </div>`;
        } else {
            resultEl.innerHTML = `
            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);
                border-radius:16px;padding:28px;text-align:center;">
                <div style="font-size:44px;margin-bottom:12px;">❌</div>
                <div style="font-size:17px;font-weight:700;color:#ef4444;margin-bottom:8px;">
                    ${isKO ? '등록되지 않은 자격증' : 'Certificate Not Found'}
                </div>
                <div style="font-size:13px;color:#64748b;">
                    ${json.message || (isKO ? '자격증 번호를 다시 확인해주세요.' : 'Please check the certificate number.')}
                </div>
            </div>`;
        }
    } catch(e) {
        if (!GOOGLE_SCRIPT_URL) {
            resultEl.innerHTML = '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:20px;text-align:center;"><p style="color:#f59e0b;margin:0;">⚙️ GAS URL이 설정되지 않았습니다.<br><small style="color:#64748b;">app.js의 GOOGLE_SCRIPT_URL을 설정해주세요.</small></p></div>';
        } else {
            resultEl.innerHTML = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:16px;padding:20px;text-align:center;"><p style="color:#ef4444;margin:0;">🔌 서버 연결 오류. 잠시 후 다시 시도해주세요.</p></div>';
        }
    }
};


function renderIntroPage() {
    const isKO = currentLang === 'KO';

    const steps = [
        { n:1, icon:'📁', title:'실습이수시간\n확인증 업로드', desc:'종목별 필수 실습 이수 시간 충족 후 확인증을 업로드합니다.' },
        { n:2, icon:'📝', title:'필기시험 응시',         desc:'온라인 필기시험으로 이론 지식을 검증받습니다.' },
        { n:3, icon:'🎥', title:'실기평가\n영상 업로드',  desc:'기술 수행 영상을 촬영 제출하고 전문가 평가를 받습니다.' },
        { n:4, icon:'🏅', title:'디지털 자격증 발급',    desc:'심사 통과 후 공식 디지털 자격증이 즉시 발급됩니다.' }
    ];

    const benefits = [
        { icon:'🎯', title:'협회 코칭 시스템 이용',       desc:'ISA에서 제공하는 전용 코칭 시스템을 이용할 수 있습니다.',                          rgb:'139,92,246' },
        { icon:'👥', title:'강습 전문성 공인',             desc:'각종 동호회·단체·개인 강습에서 협회 공인 전문 강사로 활동할 수 있습니다.',          rgb:'6,182,212' },
        { icon:'📄', title:'지원서·제안서 작성 프로그램', desc:'각종 동호회·단체 개인 강습 지원서 및 제안서 작성 프로그램을 이용할 수 있습니다.',   rgb:'16,185,129' },
        { icon:'🏆', title:'대회 프로 자격 참가',         desc:'ISA 주관 및 협력 대회에 프로 자격으로 참가할 수 있습니다.',                         rgb:'245,158,11' }
    ];

    const coachPrograms = [
        { icon:'📊', title:'수강생 관리 프로그램 (코칭허브)',     desc:'강습 수강생의 출석·진도·기술 성장을 체계적으로 관리할 수 있는 협회 전용 프로그램입니다.' },
        { icon:'📋', title:'지원서·제안서 작성 프로그램',         desc:'각종 동호회·단체 개인 강습 지원서 및 제안서를 손쉽게 작성할 수 있는 프로그램입니다.' }
    ];

    const sectionTitle = (label, rgb1, rgb2) => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
            <div style="width:4px;height:28px;background:linear-gradient(180deg,rgb(${rgb1}),rgb(${rgb2}));border-radius:2px;flex-shrink:0;"></div>
            <h3 style="font-size:clamp(18px,3vw,22px);font-weight:900;color:white;font-family:'Orbitron',sans-serif;letter-spacing:1px;margin:0;">${label}</h3>
        </div>`;

    return `
    <section class="page-section page-enter" style="background:var(--bg-dark);padding-bottom:100px;">
        <div class="content-container">

            <!-- ── 헤더 ── -->
            <div style="text-align:center;padding:60px 0 56px;">
                <div style="display:inline-flex;align-items:center;gap:8px;
                    background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);
                    border-radius:999px;padding:6px 16px;margin-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:2px;">ISA CERTIFICATION</span>
                </div>
                <h2 class="game-font section-title" style="margin-bottom:12px;">자격증 소개</h2>
                <p style="color:#94a3b8;font-size:16px;max-width:520px;margin:0 auto;line-height:1.7;">
                    국제인공서핑협회(ISA) 자격증 제도와 혜택을 안내해 드립니다.
                </p>
            </div>

            <!-- ── 섹션 1: 자격증 발급 절차 ── -->
            <div style="margin-bottom:72px;">
                ${sectionTitle('자격증 발급 절차','6,182,212','37,99,235')}
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
                    ${steps.map((s,i) => `
                    <div style="position:relative;display:flex;flex-direction:column;align-items:center;
                        padding:32px 20px;text-align:center;border-radius:16px;
                        background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.15);transition:all 0.3s;"
                        onmouseover="this.style.borderColor='rgba(6,182,212,0.4)';this.style.background='rgba(6,182,212,0.1)'"
                        onmouseout="this.style.borderColor='rgba(6,182,212,0.15)';this.style.background='rgba(6,182,212,0.05)'">
                        <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);
                            width:28px;height:28px;background:linear-gradient(135deg,var(--cyan),#2563eb);
                            border-radius:50%;display:flex;align-items:center;justify-content:center;
                            font-size:12px;font-weight:900;color:white;font-family:'Orbitron',sans-serif;">
                            ${s.n}
                        </div>
                        <div style="font-size:40px;margin-bottom:16px;margin-top:8px;">${s.icon}</div>
                        <div style="font-size:15px;font-weight:800;color:white;margin-bottom:10px;line-height:1.5;white-space:pre-line;">${s.title}</div>
                        <div style="font-size:12px;color:#64748b;line-height:1.6;">${s.desc}</div>
                        ${i < 3 ? `<div style="position:absolute;right:-12px;top:50%;transform:translateY(-50%);
                            color:var(--cyan);font-size:20px;font-weight:700;z-index:2;display:none;" class="step-arr">›</div>` : ''}
                    </div>`).join('')}
                </div>
                <style>@media(min-width:640px){.step-arr{display:block!important;}}</style>
            </div>

            <!-- ── 섹션 2: 자격증 보유자 혜택 ── -->
            <div style="margin-bottom:72px;">
                ${sectionTitle('자격증 보유자 혜택','139,92,246','236,72,153')}
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
                    ${benefits.map(b => `
                    <div style="padding:28px 24px;border-radius:16px;
                        background:rgba(${b.rgb},0.07);border:1px solid rgba(${b.rgb},0.2);
                        transition:all 0.3s;"
                        onmouseover="this.style.background='rgba(${b.rgb},0.13)';this.style.borderColor='rgba(${b.rgb},0.4)'"
                        onmouseout="this.style.background='rgba(${b.rgb},0.07)';this.style.borderColor='rgba(${b.rgb},0.2)'">
                        <div style="font-size:36px;margin-bottom:16px;">${b.icon}</div>
                        <div style="font-size:16px;font-weight:800;color:white;margin-bottom:10px;line-height:1.4;">${b.title}</div>
                        <div style="font-size:13px;color:#94a3b8;line-height:1.7;">${b.desc}</div>
                    </div>`).join('')}
                </div>
            </div>

            <!-- ── 섹션 3: 강사 지원 업무 · 코칭 시스템 ── -->
            <div style="margin-bottom:72px;">
                ${sectionTitle('강사 지원 업무 · 코칭 시스템','6,182,212','16,185,129')}
                <div style="padding:32px;border-radius:20px;
                    background:linear-gradient(135deg,rgba(6,182,212,0.05),rgba(16,185,129,0.05));
                    border:1px solid rgba(6,182,212,0.2);">
                    <p style="color:#94a3b8;font-size:14px;margin-bottom:28px;line-height:1.8;margin-top:0;">
                        ISA 강사 자격증 보유자에게 협회의 전문 강사 지원 업무 시스템이 제공됩니다.<br>
                        전문적인 강습 운영을 위한 다양한 도구를 활용하세요.
                    </p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
                        ${coachPrograms.map(p => `
                        <div style="padding:24px;border-radius:12px;
                            background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
                            transition:all 0.3s;"
                            onmouseover="this.style.borderColor='rgba(6,182,212,0.35)'"
                            onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
                            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                                <span style="font-size:28px;">${p.icon}</span>
                                <span style="font-size:14px;font-weight:800;color:var(--cyan);line-height:1.4;">${p.title}</span>
                            </div>
                            <p style="font-size:13px;color:#64748b;line-height:1.7;margin:0;">${p.desc}</p>
                        </div>`).join('')}
                    </div>
                </div>
            </div>

            <!-- ── 섹션 4: 지원서·제안서 맞춤 작성 ── -->
            <div style="margin-bottom:32px;">
                ${sectionTitle('각종 지원서·제안서 맞춤 작성','245,158,11','239,68,68')}
                <div style="padding:32px;border-radius:20px;
                    background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(239,68,68,0.04));
                    border:1px solid rgba(245,158,11,0.2);
                    display:flex;align-items:center;gap:28px;flex-wrap:wrap;">
                    <div style="font-size:52px;flex-shrink:0;">📝</div>
                    <div style="flex:1;min-width:200px;">
                        <div style="font-size:17px;font-weight:800;color:white;margin-bottom:12px;">
                            다양한 컨셉에 맞춘 제안서·기획서 작성 지원
                        </div>
                        <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0;">
                            강습 제안서, 단체 프로그램 기획서, 이벤트 계획서 등<br>
                            목적과 컨셉에 맞는 맞춤형 문서 작성을 지원합니다.
                        </p>
                    </div>
                </div>
            </div>

            <!-- ── 섹션 5: 스코어엘리트 앱 할인 이용 ── -->
            <div style="margin-bottom:0;">
                ${sectionTitle('스코어엘리트 기술측정앱 할인 이용','250,204,21','245,158,11')}
                <div style="padding:32px;border-radius:20px;
                    background:linear-gradient(135deg,rgba(250,204,21,0.06),rgba(245,158,11,0.04));
                    border:1px solid rgba(250,204,21,0.2);
                    display:flex;align-items:center;gap:28px;flex-wrap:wrap;">
                    <div style="font-size:52px;flex-shrink:0;">📊</div>
                    <div style="flex:1;min-width:200px;">
                        <div style="font-size:17px;font-weight:800;color:#facc15;margin-bottom:12px;">
                            일반 회원 대비 차별화된 스코어엘리트앱 이용 혜택
                        </div>
                        <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:20px;">
                            AI 카메라 기반 인공서핑 기술 측정 앱 <strong style="color:white;">스코어엘리트</strong>를<br>
                            자격증 보유자는 할인된 가격으로 이용할 수 있습니다.
                        </p>
                        <button onclick="openScoreEliteModal()"
                            style="padding:12px 24px;background:rgba(250,204,21,0.12);
                            border:1px solid rgba(250,204,21,0.4);border-radius:8px;
                            color:#facc15;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.background='rgba(250,204,21,0.22)'"
                            onmouseout="this.style.background='rgba(250,204,21,0.12)'">
                            📊 스코어엘리트 앱 바로가기 →
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </section>`;
}

// ===== [구버전 renderIntroPage 참고용 - 사용안함] =====
function renderIntroPage_disciplines_unused() {
    const t = LANG[currentLang];
    const isKO = currentLang === 'KO';
    const di = DISCIPLINE_INFO[currentLang];

    // YouTube 영상 ID 매핑 (각 종목별 대표 공식 영상)
    const videoIds = {
        'Standing/Flow Board': 'tKqkAvRosjU',
        'Body/Boogie Board':   'GApyFj5HdDA',
        'Wake Surfing':        'qgM5jWGOrSE',
        'Wave Surfing':        'KDrMcJfB-eU'
    };

    // 등급별 기술 요구사항
    const skillMap = isKO ? {
        'Standing/Flow Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['측면 점프/후방 입수 (택1)', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 셔빗, 쓰리 셔빗, 원에이티, 본래스(패스트플랜트), 빅스핀 이상' },
            { level: 2, skills: ['후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀, 킥플립 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 핸드플립 / 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>(남) 쓰리셔빗 이상, 킥플립 이상 기술 중 1개 필수 포함 (총 3개 이상)<br>(여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '원드롭니 균형 (10초↑)', '원드롭니 슬라럼 (좌우/상하 각 5회)', '원/투드롭니 360°(1바퀴돌기) 턴'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['지정 기술 중 3개 포함', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 원/투드롭니 540° 스핀(2바퀴돌기), 헬리콥터, YoYo, Umbrella, 바디 롤, 바디 로데오, 빅스핀, 리버스 이상의 기술' },
            { level: 2, skills: ['(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(3개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 360°(1바퀴돌기)이상의 바디턴, 360°(1바퀴돌기)이상의 바디로데오, 허브, 허브캡, 180° 셔빗, 드롭니 롤, 디테이, 드롭니 로데오, 빅스핀, 리버스 이상의 기술' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 중 5개 이상', '(여) 지정 기술 중 4개 이상', '가산점: 콤보(4개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 540° 바디턴, 540° 바디로데오, 디테이(오버로드), 디테이 프론, 드롭니 로데오, 드롭니 로데오 프론, 180° 셔빗, 허브캡(멀티), 빅스핀 이상의 기술<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
            { level: 2, skills: ['360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['파도 탑승 기초', '트림 라이딩', '폼위에서 균형', '밸런스 탑승', '웨이크 파도 유지', '기본 자세', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)' },
            { level: 3, skills: ['커팅백', '탑턴', '파도 읽기', '웨이크 투 웨이크', '올리 시도', '스위치 탑승', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 2개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 셔빗, 쓰리 셔빗, 원에이티 이상' },
            { level: 2, skills: ['에어리얼', '튜브 라이딩 시도', '고난이도 턴', '360° 스핀', '에어 시도', '래일 턴 완성', '후방 입수 (필수)', '(남) 지정 기술 중 4개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: 알리, 쓰리셔빗, 능숙한 알리, 원에이티, 빅스핀 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '에어리얼 완성', '채점 기준 이해', '심판·강사 자격', '에어 트릭 완성', '콤보 라이딩', '코칭 능력', '(남) 지정 기술 중 3개 이상', '(여) 지정 기술 중 3개 이상', '가산점: 콤보(2개 이상 기술 연계), 능숙함, 스타일', '강습 영상 (3분~5분 이내)'], details: '① 기술 영상: 1분~2분 이내 원테이크 (입/퇴수 전후 5초 포함)<br>S/F 지정기술 준용: (남) 쓰리셔빗 이상 / (여) 쓰리셔빗, 원에이티 이상 기술 중 3개 이상<br><br>② 강습 영상: 3분~5분 이내 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ]
    } : {
        'Standing/Flow Board': [
            { level: 4, skills: ['Maintain basic stance', 'Straight riding', 'Ride 10sec without fall'] },
            { level: 3, skills: ['Frontside/Backside turns', 'Switch stance', 'Basic pumping'] },
            { level: 2, skills: ['Aerial attempts', '360° spin', 'Nose riding'] },
            { level: 1, skills: ['Full aerials', 'Combo tricks', 'Demonstration & teaching'] }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['Prone position', 'Wave entry', 'Basic direction change'] },
            { level: 3, skills: ['El Rollo turns', 'Spin attempts', 'Fade ride'] },
            { level: 2, skills: ['Aerial roll attempts', '360° roll', 'High-speed control'] },
            { level: 1, skills: ['Full aerial rolls', 'Backflip attempts', 'Judge capability'] }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['Balance riding', 'Wake wave sustain', 'Basic stance'] },
            { level: 3, skills: ['Wake-to-wake', 'Ollie attempts', 'Switch riding'] },
            { level: 2, skills: ['360° spin', 'Air attempts', 'Rail turn mastery'] },
            { level: 1, skills: ['Air tricks mastery', 'Combo riding', 'Coaching ability'] }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['Basic wave riding', 'Trim riding', 'Balance on foam'] },
            { level: 3, skills: ['Cutback', 'Top turn', 'Wave reading'] },
            { level: 2, skills: ['Aerial', 'Tube riding attempt', 'Advanced turns'] },
            { level: 1, skills: ['Full aerials', 'Scoring criteria', 'Judge & instructor'] }
        ]
    };

    const disciplineSections = DISCIPLINES.map((disc, dIdx) => {
        const info = di[disc] || {};
        const vidId = videoIds[disc] || '';
        const skills = skillMap[disc] || [];
        const gradColors = [
            ['#06b6d4','#2563eb'], // cyan-blue
            ['#8b5cf6','#ec4899'], // purple-pink
            ['#f59e0b','#ef4444'], // amber-red
            ['#10b981','#06b6d4']  // green-cyan
        ];
        const [c1, c2] = gradColors[dIdx % 4];

        const skillsHTML = skills.map(s => `
            <div style="display:flex;flex-direction:column;gap:8px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,${c1}33,${c2}33);
                        border:1px solid ${c1}55;display:flex;align-items:center;justify-content:center;
                        font-family:'Orbitron',sans-serif;font-size:11px;font-weight:900;color:${c1};flex-shrink:0;">${s.level}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${s.skills.map(sk => `<span style="font-size:12px;background:rgba(255,255,255,0.05);
                            border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:3px 10px;color:#cbd5e1;">${sk}</span>`).join('')}
                    </div>
                </div>
                ${s.details ? `<div style="padding-left:40px;font-size:11px;color:#64748b;line-height:1.5;">${s.details}</div>` : ''}
            </div>
        `).join('');

        return `
        <!-- ===== ${disc} ===== -->
        <div class="intro-discipline-block" style="margin-bottom:80px;">

            <!-- 헤더 배너 -->
            <div style="position:relative;border-radius:20px;overflow:hidden;margin-bottom:32px;
                background:linear-gradient(135deg, rgba(${dIdx%2===0?'6,182,212':'168,85,247'},0.08) 0%, rgba(15,23,42,0.9) 100%);
                border:1px solid rgba(255,255,255,0.08);padding:32px;">
                <div style="position:absolute;top:0;right:0;bottom:0;width:120px;
                    background:linear-gradient(to left,rgba(15,23,42,0),rgba(15,23,42,0));
                    display:flex;align-items:center;justify-content:center;opacity:0.15;">
                    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                </div>
                <div style="position:absolute;top:0;left:0;bottom:0;width:4px;
                    background:linear-gradient(to bottom,${c1},${c2});border-radius:4px 0 0 4px;"></div>
                <div style="padding-left:16px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <span style="font-size:11px;font-weight:700;letter-spacing:2px;
                            background:linear-gradient(135deg,${c1}22,${c2}22);
                            border:1px solid ${c1}44;border-radius:999px;padding:4px 12px;color:${c1};">
                            DISCIPLINE ${dIdx+1}/4
                        </span>
                    </div>
                    <h3 class="game-font" style="font-size:clamp(22px,4vw,32px);font-weight:900;color:white;margin-bottom:8px;">
                        ${info.title || disc}
                    </h3>
                    <p style="color:#94a3b8;font-size:15px;max-width:600px;line-height:1.7;">${info.desc || ''}</p>
                </div>
            </div>

            <!-- 메인 2컬럼 -->
            <div style="display:grid;gap:20px;grid-template-columns:1fr;" id="intro-grid-${dIdx}">

                <!-- AI 오디오 카드 -->
                <div style="background:linear-gradient(135deg,rgba(88,28,135,0.3),rgba(30,41,59,0.8));
                    border:1px solid rgba(168,85,247,0.25);border-radius:16px;padding:28px;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;
                        background:radial-gradient(circle,rgba(168,85,247,0.3),transparent);border-radius:50%;"></div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
                        <div style="flex:1;">
                            <div style="display:inline-flex;align-items:center;gap:6px;
                                background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);
                                border-radius:999px;padding:4px 12px;margin-bottom:14px;">
                                <span style="display:inline-block;width:6px;height:6px;background:#c4b5fd;border-radius:50%;animation:pulse 1.5s infinite;"></span>
                                <span style="font-size:11px;font-weight:700;color:#c4b5fd;letter-spacing:1px;">AI VOICE PREVIEW</span>
                            </div>
                            <h4 style="font-size:18px;font-weight:900;color:white;margin-bottom:8px;font-family:'Orbitron',sans-serif;">
                                ${info.audioTitle || 'Notebook LM'}
                            </h4>
                            <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:20px;">${info.audioDesc || ''}</p>
                            <!-- 파형 애니메이션 -->
                            <div style="display:flex;align-items:center;gap:3px;height:36px;margin-bottom:16px;">
                                ${Array.from({length:28},(_,i)=>`
                                <div style="width:4px;background:linear-gradient(to top,rgba(168,85,247,0.3),#9333ea);border-radius:999px;
                                    height:${8+Math.sin(i*0.7)*14+Math.random()*8}px;
                                    animation:pulse ${0.6+i*0.07}s infinite alternate;"></div>`).join('')}
                            </div>
                            <!-- 플레이어 바 -->
                            <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:14px 16px;
                                border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:12px;">
                                <button onclick="this.textContent=this.textContent==='▶'?'⏸':'▶'"
                                    style="width:40px;height:40px;border-radius:50%;background:white;
                                    color:#581c87;border:none;cursor:pointer;font-size:16px;
                                    display:flex;align-items:center;justify-content:center;flex-shrink:0;
                                    transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">▶</button>
                                <div style="flex:1;">
                                    <div style="font-size:12px;color:white;font-weight:700;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                        ${info.audioTitle || 'Notebook LM Audio'}
                                    </div>
                                    <div style="height:4px;background:#334155;border-radius:999px;overflow:hidden;">
                                        <div style="height:100%;width:0%;background:linear-gradient(to right,#9333ea,#c4b5fd);border-radius:999px;"></div>
                                    </div>
                                </div>
                                <span style="font-size:11px;color:#64748b;flex-shrink:0;">
                                    ${isKO ? '브라우저 TTS 사용' : 'Browser TTS'}
                                </span>
                            </div>
                        </div>
                        <div style="color:rgba(168,85,247,0.6);flex-shrink:0;display:none;" id="mic-${dIdx}">
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                        </div>
                    </div>
                    <p style="font-size:11px;color:#475569;margin-top:12px;">
                        ⓘ ${isKO ? '브라우저의 TTS 기능을 사용하여 별도의 파일 다운로드 없이 재생됩니다.' : 'Uses browser TTS. No file download required.'}
                    </p>
                </div>

                <!-- 공식영상 카드 -->
                <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.08);
                    border-radius:16px;overflow:hidden;">
                    <div style="padding:20px 20px 12px;">
                        <div style="display:inline-flex;align-items:center;gap:6px;
                            background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
                            border-radius:999px;padding:4px 12px;margin-bottom:12px;">
                            <span style="font-size:10px;font-weight:700;color:#f87171;letter-spacing:1px;">● OFFICIAL VIDEO</span>
                        </div>
                        <h4 style="font-size:17px;font-weight:800;color:white;">${info.videoTitle || 'Official Clip'}</h4>
                    </div>
                    <div style="position:relative;aspect-ratio:16/9;background:#000;cursor:pointer;"
                        onclick="this.innerHTML='<iframe width=100% height=100% src=https://www.youtube.com/embed/${vidId}?autoplay=1 frameborder=0 allow=autoplay;encrypted-media allowfullscreen style=position:absolute;inset:0></iframe>';this.style.cursor='default'">
                        <img src="https://img.youtube.com/vi/${vidId}/hqdefault.jpg"
                            style="width:100%;height:100%;object-fit:cover;opacity:0.75;"
                            onerror="this.src='https://picsum.photos/640/360?random=${dIdx+20}'" alt="${disc}">
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                            <div style="width:72px;height:72px;border-radius:50%;
                                background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
                                border:2px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;
                                transition:all 0.3s;" onmouseover="this.style.background='rgba(239,68,68,0.8)';this.style.borderColor='transparent'"
                                onmouseout="this.style.background='rgba(0,0,0,0.6)';this.style.borderColor='rgba(255,255,255,0.6)'">
                                <span style="font-size:28px;margin-left:4px;">▶</span>
                            </div>
                        </div>
                    </div>
                    <div style="padding:16px 20px;">
                        <p style="font-size:12px;color:#475569;">
                            ${isKO ? '클릭하면 YouTube 영상이 재생됩니다.' : 'Click to play YouTube video.'}
                        </p>
                    </div>
                </div>

            </div>

            <!-- 등급별 기술 요구사항 -->
            <div style="margin-top:20px;background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.07);
                border-radius:16px;padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h4 style="color:white;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="display:inline-block;width:3px;height:18px;background:linear-gradient(to bottom,${c1},${c2});border-radius:2px;"></span>
                        ${isKO ? '등급별 기술 요구사항' : 'Level Skill Requirements'}
                    </h4>
                    <span style="font-size:11px;color:#475569;">${isKO ? '4급(초급) → 1급(전문가)' : 'Level 4 (Beginner) → Level 1 (Expert)'}</span>
                </div>
                ${isKO ? `
                <div style="margin-bottom:16px;padding:14px;background:rgba(${dIdx%2===0?'6,182,212':'168,85,247'},0.05);border:1px dashed rgba(255,255,255,0.15);border-radius:10px;">
                    <p style="font-size:12px;color:white;margin:0 0 6px;font-weight:700;">[공통 규정]</p>
                    <ul style="margin:0;padding-left:18px;font-size:12px;color:#94a3b8;line-height:1.6;">
                        <li><strong>영상 촬영:</strong> 1분~2분 이내 원테이크 (입수 전 5초, 퇴수 후 5초 반드시 포함)</li>
                        <li><strong>합격 기준:</strong> 타인의 도움 없이 1회 주행 내에 기술 완성 시 합격</li>
                    </ul>
                </div>
                ` : ''}
                ${skillsHTML}
            </div>

            <!-- 자격증 신청 CTA -->
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
                <button onclick="selectedDiscipline='${disc}';selectedLevel=null;renderPage('cert')"
                    style="flex:1;min-width:200px;padding:16px 24px;
                    background:linear-gradient(135deg,${c1},${c2});
                    border:none;border-radius:12px;color:white;font-weight:900;font-size:15px;
                    cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;
                    box-shadow:0 0 20px ${c1}44;"
                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px ${c1}66'"
                    onmouseout="this.style.transform='none';this.style.boxShadow='0 0 20px ${c1}44'">
                    🏆 ${isKO ? `${disc.split('/')[0]} 자격증 신청하기` : `Apply for ${disc.split('/')[0]} Cert`}
                </button>
                <button onclick="renderPage('cert')"
                    style="padding:16px 20px;background:rgba(255,255,255,0.06);
                    border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#94a3b8;
                    font-weight:700;font-size:14px;cursor:pointer;transition:all 0.3s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='white'"
                    onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='#94a3b8'">
                    📋 ${isKO ? '자격증 전체 보기' : 'View All Certs'}
                </button>
            </div>

        </div>`;
    }).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-dark);padding-bottom:80px;">
        <div class="content-container">

            <!-- 페이지 헤더 -->
            <div style="text-align:center;padding:60px 0 48px;">
                <div style="display:inline-flex;align-items:center;gap:8px;
                    background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);
                    border-radius:999px;padding:6px 16px;margin-bottom:20px;">
                    <span style="font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:2px;">ISA DISCIPLINES</span>
                </div>
                <h2 class="game-font section-title" style="margin-bottom:12px;">
                    ${isKO ? '자격증 소개' : 'Certification Guide'}
                </h2>
                <p style="color:#94a3b8;font-size:16px;max-width:480px;margin:0 auto;line-height:1.7;">
                    ${isKO ? '4가지 인공서핑 종목의 특징과 등급별 기술 요구사항을 확인하세요.' : 'Explore 4 disciplines and level skill requirements for ISA certification.'}
                </p>

                <!-- 종목 빠른 이동 -->
                <div class="discipline-tabs" style="margin-top:28px;">
                    ${DISCIPLINES.map((d,i)=>`
                    <button class="discipline-tab intro-tab-btn${i===0?' active':''}"
                        id="intro-tab-${i}"
                        onclick="
                            document.querySelectorAll('.intro-tab-btn').forEach(b=>b.classList.remove('active'));
                            document.getElementById('intro-tab-${i}').classList.add('active');
                            document.getElementById('disc-anchor-${i}').scrollIntoView({behavior:'smooth'})
                        ">${d}
                    </button>`).join('')}
                </div>
            </div>

            <!-- 종목 앵커 + 내용 -->
            ${DISCIPLINES.map((d,i)=>`<div id="disc-anchor-${i}"></div>`).join('')}
            ${disciplineSections}

        </div>
    </section>`;
}

// ===== EVENT HANDLERS =====
function selectDiscipline(d) { selectedDiscipline = d; renderPage('cert'); }
function selectCertLevel(l) { selectedLevel = l; renderPage('cert'); }

function certApplyCheck() {
    const user = getSession();
    if (!user) { 
        alert(currentLang === 'KO' ? '로그인이 필요합니다.' : 'Login required.'); 
        openLoginModal(); 
        return; 
    }

    // 이메일 인증 여부 확인 제거 (요청에 따라 바로 결제 진행)
    // 동의 체크박스 확인
    const agreeTrainingHours = document.getElementById('agree-training-hours');
    const agreeNoRefund = document.getElementById('agree-no-refund');
    const agree48hr = document.getElementById('agree-48hr');
    const agree1year = document.getElementById('agree-1year');

    const reqHoursMap = {4:10, 3:20, 2:30, 1:50};
    const reqHours = reqHoursMap[selectedLevel] || 0;

    if (!agreeTrainingHours?.checked) {
        alert(currentLang === 'KO'
            ? `⚠️ 강사 ${selectedLevel}급 응시 자격 조건인 최소 실습 이수 시간(${reqHours}시간 이상) 충족 여부를 확인해주세요.`
            : `⚠️ Please confirm you have completed the minimum ${reqHours}+ training hours required for Level ${selectedLevel}.`);
        agreeTrainingHours?.focus();
        return;
    }
    if (!agreeNoRefund?.checked) {
        alert(currentLang === 'KO' ? '⚠️ 환불 불가 조항에 동의해주세요.' : '⚠️ Please agree to the no-refund policy.');
        agreeNoRefund?.focus();
        return;
    }
    if (!agree48hr?.checked) {
        alert(currentLang === 'KO' ? '⚠️ 48시간 이내 응시 조항에 동의해주세요.' : '⚠️ Please agree to the 48-hour exam requirement.');
        agree48hr?.focus();
        return;
    }
    if (!agree1year?.checked) {
        alert(currentLang === 'KO' ? '⚠️ 실기평가 업로드 기한 조항에 동의해주세요.' : '⚠️ Please agree to the practical evaluation deadline policy.');
        agree1year?.focus();
        return;
    }
    
    // 최종 결제 확인
    const feePrice = (selectedLevel >= 3) ? 300000 : 500000;
    const payMethod = document.querySelector('input[name="cert-pay-method"]:checked')?.value || 'card';
    
    // 관리자 알림을 위해 서버에 신청 정보 전송
    callGAS({
        action: 'certApply',
        email: user.email,
        name: user.name,
        level: selectedLevel,
        discipline: selectedDiscipline,
        payMethod: payMethod,
        amount: feePrice
    });

    if (payMethod === 'bank') {
        alert(currentLang === 'KO'
            ? `✅ 신청이 접수되었습니다!\n\n토스뱅크 1000-7587-9085 (곽세영) 계좌로 입금해 주세요. 확인 후 최대 1시간 이내에 시험 응시 권한이 활성화됩니다.`
            : `✅ Application received!\n\nPlease transfer to Toss Bank 1000-7587-9085 (Kwak Se-young). Access will be granted within 1 hour after confirmation.`);
    } else {
        // 실제 PG 결제 시작 (INNOPAY)
        const orderData = {
            amount: feePrice,
            goodsName: `ISA ${selectedDiscipline} ${selectedLevel}급 응시료`,
            buyerName: user.name,
            buyerTel: user.phone || '010-0000-0000',
            buyerEmail: user.email,
            type: 'apply',
            level: selectedLevel,
            discipline: selectedDiscipline
        };
        startPGPayment(orderData);
    }
    renderPage('cert');
}

function certRetakeCheck() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }

    const payMethod = document.querySelector('input[name="cert-pay-method"]:checked')?.value || 'card';

    // 서버 전송
    callGAS({
        action: 'certApply',
        email: user.email,
        name: user.name,
        level: selectedLevel,
        discipline: selectedDiscipline,
        payMethod: payMethod,
        amount: 10000,
        isRetake: true
    });

    if (payMethod === 'bank') {
        alert(currentLang === 'KO' ? '✅ 재응시 신청이 접수되었습니다. 입금 확인 후 시험 권한이 부여됩니다.' : '✅ Retake application received. Access granted after deposit.');
    } else {
        // 실제 PG 결제 시작 (INNOPAY) - 재응시
        const orderData = {
            amount: 10000,
            goodsName: `ISA ${selectedDiscipline} ${selectedLevel}급 재응시료`,
            buyerName: user.name,
            buyerTel: user.phone || '010-0000-0000',
            buyerEmail: user.email,
            type: 'retake',
            level: selectedLevel,
            discipline: selectedDiscipline
        };
        startPGPayment(orderData);
    }
    renderPage('cert');
}

// ===== INNOPAY PG PAYMENT LOGIC =====
function startPGPayment(data) {
    if (typeof innopay === 'undefined') {
        alert(currentLang === 'KO' ? 'PG SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.' : 'PG SDK not loaded. Please try again in a moment.');
        return;
    }

    const moid = 'ISA' + Date.now();
    // 결제 완료 후 처리를 위해 세션에 임시 저장
    localStorage.setItem('isa_pending_payment', JSON.stringify({
        moid: moid,
        type: data.type,
        level: data.level,
        discipline: data.discipline,
        amount: data.amount,
        email: data.buyerEmail,
        name: data.buyerName
    }));

    // 이노페이 결제 파라미터 설정
    const params = {
        PayMethod: 'CARD',
        MID: INNOPAY_MID,
        Moid: moid,
        Amt: data.amount,
        GoodsName: data.goodsName,
        BuyerName: data.buyerName,
        BuyerTel: data.buyerTel,
        BuyerEmail: data.buyerEmail,
        ResultCode: '0000',
        ResultMsg: '결제 성공',
        ReturnUrl: window.location.origin + window.location.pathname + '#/payment-result'
    };

    try {
        innopay.goPay(params);
    } catch (e) {
        console.error("PG Error:", e);
        alert(currentLang === 'KO' ? '결제창 호출 중 오류가 발생했습니다.' : 'Error calling payment window.');
    }
}

// 결제 결과 처리 (URL 해시 변화 감지)
window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#/payment-result')) {
        handlePaymentResult();
    }
});

async function handlePaymentResult() {
    const pending = JSON.parse(localStorage.getItem('isa_pending_payment'));
    if (!pending) return;

    const urlParams = new URLSearchParams(window.location.search);
    // 이노페이는 ResultCode 또는 resCode로 결과 전달
    const resCode = urlParams.get('ResultCode') || urlParams.get('resCode') || 'FAIL';
    const tid     = urlParams.get('TID') || urlParams.get('tid') || '';

    if (resCode === '0000') {
        // 1. 로컬 스토리지에 결제 완료 기록
        localStorage.setItem(`isa_exam_paid_${pending.email}_lv${pending.level}`, JSON.stringify({
            level: pending.level,
            discipline: pending.discipline,
            paidAt: new Date().toISOString(),
            fee: pending.amount,
            tid: tid,
            isRetake: pending.type === 'retake'
        }));
        if (pending.type === 'retake') {
            localStorage.removeItem(`isa_exam_fail_${pending.email}_lv${pending.level}`);
        }

        // 2. GAS 서버에 결제 기록 저장
        callGAS({
            action: 'recordCertPay',
            email: pending.email,
            name: pending.name,
            level: pending.level,
            discipline: pending.discipline,
            amount: pending.amount,
            tid: tid,
            isRetake: pending.type === 'retake'
        }).catch(() => {});

        // 3. 포인트 적립 (1%)
        const points = Math.floor(pending.amount * 0.01);
        accruePoints(pending.email, pending.name, points, `${pending.discipline} ${pending.level}급 결제 적립`);

        // 4. 완료 알림
        alert(currentLang === 'KO'
            ? `✅ 결제가 완료되었습니다! ${points}P가 적립되었습니다.\n\n필기시험 페이지로 이동합니다.`
            : `✅ Payment successful! ${points}P accrued.\n\nRedirecting to exam page.`);

        localStorage.removeItem('isa_pending_payment');
        window.location.hash = '#/exam';
        renderPage('exam');
    } else {
        localStorage.removeItem('isa_pending_payment');
        alert(currentLang === 'KO' ? '결제에 실패했거나 취소되었습니다.' : 'Payment failed or cancelled.');
        window.location.hash = '#/cert';
        renderPage('cert');
    }
}

function accruePoints(email, name, amount, reason) {
    callGAS({
        action: 'addPoints',
        email: email,
        name: name,
        amount: amount,
        reason: reason
    }).then(result => {
        const newBalance = (result && result.newBalance !== undefined)
            ? result.newBalance
            : (getSession()?.points || 0) + amount;
        refreshPointsUI(newBalance);
        showPointsToast(amount, reason);
    }).catch(() => {
        // 서버 실패 시 로컬 추정치로 갱신
        const est = (getSession()?.points || 0) + amount;
        refreshPointsUI(est);
    });
}

// ===== AUTH & MODALS =====
function openLoginModal() { isLoginMode = true; const m = $('login-modal'); if(m) m.classList.add('open'); }
function closeLoginModal() { const m = $('login-modal'); if(m) m.classList.remove('open'); }
function openQuickModal(type) { 
    const m = $('quick-modal'); if(!m) return;
    m.classList.add('open');
    const isKO = currentLang === 'KO';
    
    const titles = {
        event: isKO ? '🎉 이벤트' : '🎉 Events',
        notice: isKO ? '📢 공지사항' : '📢 Notices',
        appcheck: isKO ? '📋 접수증 확인' : '📋 Registration Check',
        certcheck: isKO ? '🏅 자격증 조회' : '🏅 Certificate Lookup'
    };
    const titleEl = $('quick-modal-title');
    if (titleEl) titleEl.textContent = titles[type] || type.toUpperCase();
    
    const contentEl = $('quick-modal-content');
    if (!contentEl) return;
    
    if (type === 'appcheck') {
        contentEl.innerHTML = renderAppCheckContent(isKO);
    } else if (type === 'certcheck') {
        contentEl.innerHTML = renderCertCheckContent(isKO);
    } else if (type === 'notice') {
        contentEl.innerHTML = renderNoticeContent(isKO);
    } else if (type === 'event') {
        contentEl.innerHTML = renderEventContent(isKO);
    }
}
function closeQuickModal() { const m = $('quick-modal'); if(m) m.classList.remove('open'); }

let currentInstructorType = null; // 'coaching' | 'instructor'

function openInstructorModal() {
    const m = $('instructor-select-modal');
    if (m) m.classList.add('open');
}

function closeInstructorSelectModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const m = $('instructor-select-modal');
    if (m) m.classList.remove('open');
}

function closeInstructorModal(event) {
    closeInstructorSelectModal(event);
}

function openInstructorAuth(type) {
    currentInstructorType = type;
    const titleEl = $('instructor-auth-title');
    const descEl = $('instructor-auth-desc');
    const noteEl = $('instructor-auth-note');
    const inputEl = $('instructor-cert-input');
    const resultEl = $('instructor-verify-result');

    if (type === 'coaching') {
        if (titleEl) titleEl.textContent = '코칭 허브 인증';
        if (descEl) descEl.textContent = '3급이상 자격증 보유강사를 위한 지원 프로그램입니다';
        if (noteEl) noteEl.innerHTML = '💡 코칭 허브 입장을 위해서는 ISA 3급 이상 자격증이 필요합니다. 인증 후 코칭 허브로 이동합니다.';
    } else {
        if (titleEl) titleEl.textContent = '강사 워크스페이스 인증';
        if (descEl) descEl.textContent = '2급이상 자격증 보유강사를 위한 지원 프로그램입니다';
        if (noteEl) noteEl.innerHTML = '💡 강사 워크스페이스 입장을 위해서는 ISA 2급 이상 자격증이 필요합니다. 인증 후 강사 워크스페이스로 이동합니다.';
    }

    if (inputEl) { inputEl.value = ''; setTimeout(() => inputEl.focus(), 100); }
    if (resultEl) resultEl.innerHTML = '';

    const m = $('instructor-auth-modal');
    if (m) m.classList.add('open');
}

function closeInstructorAuthModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const m = $('instructor-auth-modal');
    if (m) m.classList.remove('open');
}

window.verifyInstructorCert = async function() {
    const input = $('instructor-cert-input');
    const resultEl = $('instructor-verify-result');
    if (!input || !resultEl) return;

    const certId = input.value.trim().toUpperCase();
    if (!certId) {
        resultEl.innerHTML = `<p style="color:#ef4444;font-size:13px;text-align:center;margin:0;">자격증 번호를 입력해주세요.</p>`;
        return;
    }

    resultEl.innerHTML = `<div style="text-align:center;"><div style="display:inline-block;width:20px;height:20px;border:2px solid var(--cyan);border-top:2px solid transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div></div>`;

    try {
        const url = GOOGLE_SCRIPT_URL + '?action=verifyCertificate&certId=' + encodeURIComponent(certId);
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'success' && json.valid) {
            const c = json.cert;
            const isCoaching = currentInstructorType === 'coaching';
            const lvl = c.level || '';
            const hasLevel1 = lvl.includes('1급');
            const hasLevel2 = lvl.includes('2급');
            const hasLevel3 = lvl.includes('3급');

            // 코칭 허브: 1급, 2급, 3급 / 강사 워크스페이스: 1급, 2급만
            const hasAccess = isCoaching
                ? (hasLevel1 || hasLevel2 || hasLevel3)
                : (hasLevel1 || hasLevel2);

            if (hasAccess) {
                const targetUrl = isCoaching
                    ? 'https://isa-coaching-workspace.vercel.app/coaching-hub.html'
                    : 'https://isa-instructor-workspace-v1.vercel.app/instructor.html';

                resultEl.innerHTML = `
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:12px;text-align:center;">
                    <p style="color:#10b981;font-weight:700;margin:0 0 4px;">✅ 인증 성공: ${c.name} 강사님</p>
                    <p style="color:#94a3b8;font-size:11px;margin:0;">등급: ${c.level} | 종목: ${c.discipline}</p>
                    <button onclick="window.open('${targetUrl}','_blank');closeInstructorAuthModal();" class="btn-primary" style="margin-top:10px;padding:8px 16px;font-size:12px;">입장하기 →</button>
                </div>`;
                localStorage.setItem('isa_instructor_verified', JSON.stringify({
                    certId: c.certNumber, name: c.name, level: c.level,
                    type: currentInstructorType, verifiedAt: new Date().toISOString()
                }));
            } else {
                const required = isCoaching ? '3급' : '2급';
                resultEl.innerHTML = `
                <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px;text-align:center;">
                    <p style="color:#f59e0b;font-weight:700;margin:0 0 4px;">⚠️ 권한 부족</p>
                    <p style="color:#94a3b8;font-size:11px;margin:0;">해당 자격증(${c.level})은 이 프로그램을 이용할 수 없습니다.<br>(${required} 이상 필요)</p>
                </div>`;
            }
        } else {
            resultEl.innerHTML = `
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px;text-align:center;">
                <p style="color:#ef4444;font-weight:700;margin:0 0 4px;">❌ 인증 실패</p>
                <p style="color:#94a3b8;font-size:11px;margin:0;">${json.message || '유효하지 않은 자격증 번호입니다.'}</p>
            </div>`;
        }
    } catch (e) {
        resultEl.innerHTML = `<p style="color:#ef4444;font-size:12px;text-align:center;">서버 연결 오류가 발생했습니다.</p>`;
    }
};


function initAuth() {
    const session = getSession();
    if (session) {
        updateAuthUI(session);
    }

    // Google Identity Services 초기화
    if (window.google && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_')) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: onGoogleSignIn
        });
    }

    // Kakao SDK 초기화
    if (window.Kakao && KAKAO_APP_KEY && !KAKAO_APP_KEY.includes('YOUR_')) {
        if (!Kakao.isInitialized()) {
            Kakao.init(KAKAO_APP_KEY);
        }
    }
}

// ─────────────────────────────────────────────
// 소셜 로그인 공통 처리
// ─────────────────────────────────────────────
function showLoginMsg(msg, type) {
    const el = document.getElementById('login-msg');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.className = 'login-msg ' + (type === 'red' ? 'error' : 'success');
}

async function processSocialLogin(provider, email, name) {
    showLoginMsg((provider === 'kakao' ? '카카오' : '구글') + ' 계정 확인 중...', 'success');
    try {
        const url = `${GOOGLE_SCRIPT_URL}?action=socialLogin&provider=${provider}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
        const res  = await fetch(url);
        const json = await res.json();
        if (json.status === 'success') {
            saveSession(json.data);
            initAuth();
            closeLoginModal();
        } else {
            showLoginMsg(json.message || '로그인 실패', 'red');
        }
    } catch(e) {
        showLoginMsg('서버 연결 오류가 발생했습니다.', 'red');
        console.error('[processSocialLogin]', e);
    }
}

// ─────────────────────────────────────────────
// 구글 로그인
// ─────────────────────────────────────────────
function handleGoogleLogin() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_')) {
        alert('Google Client ID가 설정되지 않았습니다.\napp.js의 GOOGLE_CLIENT_ID를 설정해주세요.');
        return;
    }
    if (!window.google || !window.google.accounts) {
        alert('Google SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
            if (tokenResponse.error) {
                showLoginMsg('Google 로그인 실패: ' + tokenResponse.error, 'red');
                return;
            }
            try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                }).then(r => r.json());
                await processSocialLogin('google', userInfo.email, userInfo.name || userInfo.email.split('@')[0]);
            } catch(e) {
                showLoginMsg('Google 정보 조회 오류가 발생했습니다.', 'red');
            }
        }
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

// ─────────────────────────────────────────────
// 카카오 로그인
// ─────────────────────────────────────────────
function handleKakaoLogin() {
    if (!KAKAO_APP_KEY || KAKAO_APP_KEY.includes('YOUR_')) {
        alert('Kakao App Key가 설정되지 않았습니다.\napp.js의 KAKAO_APP_KEY를 설정해주세요.');
        return;
    }
    if (!window.Kakao || !Kakao.isInitialized()) {
        alert('카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    Kakao.Auth.login({
        success: function() {
            Kakao.API.request({
                url: '/v2/user/me',
                success: async function(res) {
                    const email = res.kakao_account?.email || ('kakao_' + res.id + '@kakao.user');
                    const name  = res.kakao_account?.profile?.nickname || res.properties?.nickname || '카카오회원';
                    await processSocialLogin('kakao', email, name);
                },
                fail: function(err) {
                    showLoginMsg('카카오 정보 조회 실패', 'red');
                    console.error('[Kakao API]', err);
                }
            });
        },
        fail: function(err) {
            if (err.error !== 'access_denied') {
                showLoginMsg('카카오 로그인에 실패했습니다.', 'red');
            }
            console.error('[Kakao login]', err);
        }
    });
}

// (구버전 mock 함수 제거 — 위의 실제 OAuth 구현으로 대체됨)

function handleAppleLogin() {
    alert("애플 로그인은 현재 준비 중입니다. 구글 로그인 또는 이메일 로그인을 이용해 주세요.");
}

function renderAppCheckContent(isKO) {
    const session = getSession();
    if (!session) {
        return `<div style="padding:20px;text-align:center">
            <div style="font-size:48px;margin-bottom:16px">🔒</div>
            <p style="color:var(--text-dim);margin-bottom:16px">${isKO ? '접수증 확인은 로그인 후 이용 가능합니다.' : 'Please log in to check your registration.'}</p>
            <button onclick="closeQuickModal();openLoginModal()" class="btn-primary">${isKO ? '로그인하기' : 'Log In'}</button>
        </div>`;
    }
    
    // 로컬에서 결제 기록 확인
    const records = [];
    for (let i = 1; i <= 4; i++) {
        const paid = localStorage.getItem(`isa_exam_paid_${session.email}_lv${i}`);
        if (paid) {
            try {
                const data = JSON.parse(paid);
                const failRecord = localStorage.getItem(`isa_exam_fail_${session.email}_lv${i}`);
                records.push({ ...data, level: i, failed: !!failRecord });
            } catch(e) {}
        }
    }
    
    if (records.length === 0) {
        return `<div style="padding:20px;text-align:center">
            <div style="font-size:48px;margin-bottom:16px">📭</div>
            <p style="color:var(--text-dim);">${isKO ? '접수 내역이 없습니다.' : 'No registration records found.'}</p>
            <a href="#/cert" onclick="closeQuickModal()" style="display:inline-block;margin-top:16px;padding:10px 24px;background:var(--cyan-dark);color:white;border-radius:8px;font-weight:700">${isKO ? '자격증 신청하기' : 'Apply for Certificate'}</a>
        </div>`;
    }
    
    const rows = records.map(r => {
        const paidDate = new Date(r.paidAt);
        const deadline = new Date(paidDate.getTime() + 48*3600000);
        const now = new Date();
        const isExpired = now > deadline && !r.isRetake;
        const statusLabel = r.failed ? `<span class="val fail">${isKO ? '미통과' : 'Not Passed'}</span>` 
            : isExpired ? `<span class="val pending">${isKO ? '기간만료' : 'Expired'}</span>`
            : `<span class="val pass">${isKO ? '응시가능' : 'Active'}</span>`;
            
        const examBtn = (!r.failed && !isExpired) ? `
            <div style="margin-top:10px;text-align:right">
                <a href="/exam" target="_blank" style="padding:6px 12px;background:var(--cyan);color:#000;border-radius:4px;font-size:12px;font-weight:700;text-decoration:none">${isKO ? '🚀 시험 응시하기' : '🚀 Take Exam'}</a>
            </div>` : '';

        return `
        <div class="check-result-card">
            <h4>📋 Level ${r.level} - ${r.discipline || 'N/A'}${r.isRetake ? ` <span style="font-size:10px;background:rgba(245,158,11,0.2);color:#fde68a;padding:2px 6px;border-radius:4px">${isKO ? '재응시' : 'Retake'}</span>` : ''}</h4>
            <div class="check-result-row"><span class="lbl">${isKO ? '결제일시' : 'Payment Date'}</span><span class="val">${paidDate.toLocaleString()}</span></div>
            <div class="check-result-row"><span class="lbl">${isKO ? '응시료' : 'Fee'}</span><span class="val">₩${(r.fee||0).toLocaleString()}</span></div>
            <div class="check-result-row"><span class="lbl">${isKO ? '응시 마감' : 'Exam Deadline'}</span><span class="val">${deadline.toLocaleString()}</span></div>
            <div class="check-result-row"><span class="lbl">${isKO ? '상태' : 'Status'}</span>${statusLabel}</div>
            ${examBtn}
        </div>`;
    }).join('');
    
    return `<div style="padding:4px">${rows}</div>`;
}

function renderCertCheckContent(isKO) {
    return `<div class="check-form" style="padding:4px">
        <p style="font-size:13px;color:var(--text-dim);">${isKO ? '이름과 생년월일 또는 자격증 번호로 조회할 수 있습니다.' : 'Search by name and date of birth, or by certificate number.'}</p>
        <div class="check-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" id="cert-search-name" placeholder="${isKO ? '이름 (실명)' : 'Full Name'}">
        </div>
        <div class="check-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input type="text" id="cert-search-birth" placeholder="${isKO ? '생년월일 (YYMMDD)' : 'Date of Birth (YYMMDD)'}" maxlength="6">
        </div>
        <div style="text-align:center;color:var(--text-dark);font-size:12px;">${isKO ? '또는' : 'OR'}</div>
        <div class="check-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            <input type="text" id="cert-search-num" placeholder="${isKO ? '자격증 번호 (예: ISA-2025-00123)' : 'Certificate No. (e.g. ISA-2025-00123)'}">
        </div>
        <button class="check-btn" onclick="searchCertificate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:6px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            ${isKO ? '자격증 조회' : 'Search Certificate'}
        </button>
        <div id="cert-search-result"></div>
        <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border)">
            <p style="font-size:11px;color:var(--text-dark);">📞 ${isKO ? '자격증 문의: info@isa-surfing.org / 02-554-2212' : 'Certificate Inquiry: info@isa-surfing.org / 02-554-2212'}</p>
        </div>
    </div>`;
}

window.searchCertificate = function() {
    const name = document.getElementById('cert-search-name')?.value.trim();
    const birth = document.getElementById('cert-search-birth')?.value.trim();
    const certNum = document.getElementById('cert-search-num')?.value.trim();
    const resultEl = document.getElementById('cert-search-result');
    const isKO = currentLang === 'KO';
    
    if (!resultEl) return;
    if (!name && !certNum) {
        resultEl.innerHTML = `<div class="check-result not-found" style="margin-top:12px;padding:12px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);color:#fca5a5;font-size:13px">${isKO ? '이름 또는 자격증 번호를 입력해주세요.' : 'Please enter a name or certificate number.'}</div>`;
        return;
    }
    
    // 실전에서는 서버에서 조회 - 현재는 샘플 안내
    resultEl.innerHTML = `
    <div class="check-result-card" style="margin-top:12px">
        <h4>🔍 ${isKO ? '조회 결과' : 'Search Result'}</h4>
        <div class="check-result-row"><span class="lbl">${isKO ? '안내' : 'Notice'}</span><span class="val pending">${isKO ? '조회 중...' : 'Searching...'}</span></div>
        <p style="font-size:12px;color:var(--text-dim);margin-top:8px">${isKO ? '자격증 데이터베이스 연동 준비 중입니다. 협회로 직접 문의해주세요.' : 'Database integration in progress. Please contact the association directly.'}</p>
    </div>`;
};

function renderNoticeContent(isKO) {
    const notices = [
        { date: '2026.04.20', title: isKO ? '저작권 고지' : 'Copyright Notice', isNew: true, content: isKO
            ? `<p style="margin:0 0 8px;">본 웹사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 영상, 로고, 디자인 등)의 저작권은 <strong style="color:#e2e8f0;">국제인공서핑협회(ISA)</strong>에 귀속됩니다.</p>
               <p style="margin:0 0 8px;">사전 서면 동의 없이 복제, 배포, 수정, 전송, 재출판하거나 상업적 목적으로 이용하는 행위를 금합니다.</p>
               <p style="margin:0 0 8px;">개인적·비상업적 용도의 인용은 출처를 명확히 표기하는 조건 하에 허용될 수 있습니다.</p>
               <p style="margin:0 0 8px;">저작권 관련 문의: <a href="mailto:zenpower0708@gmail.com" style="color:#67e8f9;text-decoration:none;">zenpower0708@gmail.com</a></p>
               <p style="margin:8px 0 0;color:#475569;font-size:11px;">© 2026 국제인공서핑협회 (ISA). All Rights Reserved.</p>`
            : `<p style="margin:0 0 8px;">All content published on this website (text, images, videos, logos, designs, etc.) is the intellectual property of <strong style="color:#e2e8f0;">ISA (International Artificial Surfing Association)</strong>.</p>
               <p style="margin:0 0 8px;">Reproduction, distribution, modification, transmission, republication, or commercial use without prior written consent is strictly prohibited.</p>
               <p style="margin:0 0 8px;">Quotation for personal, non-commercial purposes is permitted provided the source is clearly attributed.</p>
               <p style="margin:0 0 8px;">Copyright inquiries: <a href="mailto:zenpower0708@gmail.com" style="color:#67e8f9;text-decoration:none;">zenpower0708@gmail.com</a></p>
               <p style="margin:8px 0 0;color:#475569;font-size:11px;">© 2026 ISA (International Artificial Surfing Association). All Rights Reserved.</p>`
        },
        { date: '2026.04.20', title: isKO ? '2026.04.20 NEW — 종목별 급수별 기술요구사항 정리 (전 종목)' : '2026.04.20 NEW — Technical Requirements Summary (All Disciplines)', isNew: true },
        { date: '2026.04.20', title: isKO ? '2026.04.20 NEW — 종목별 실기평가 기술 요구사항 공고 — Wave Surfing' : '2026.04.20 NEW — Practical Skill Requirements Notice — Wave Surfing', isNew: true },
        { date: '2026.04.20', title: isKO ? '2026.04.20 NEW — 종목별 실기평가 기술 요구사항 공고 — Wake Surfing' : '2026.04.20 NEW — Practical Skill Requirements Notice — Wake Surfing', isNew: true },
        { date: '2026.04.20', title: isKO ? '2026.04.20 NEW — 종목별 실기평가 기술 요구사항 공고 — Body / Boogie Board' : '2026.04.20 NEW — Practical Skill Requirements Notice — Body / Boogie Board', isNew: true },
        { date: '2026.04.20', title: isKO ? '2026.04.20 — 종목별 실기평가 기술 요구사항 공고 — Standing / Flow Board' : '2026.04.20 — Practical Skill Requirements Notice — Standing / Flow Board' },
        { date: '2026.04.18', title: isKO ? '실습 이수 확인서 양식 배포 안내' : 'Training Completion Certificate Form Released' },
        { date: '2026.04.10', title: isKO ? '2026년 2분기 자격검정 일정 공고' : '2026 Q2 Certification Exam Schedule' },
        { date: '2026.03.25', title: isKO ? '실기평가 업로드 시스템 개선 안내' : 'Practical Evaluation Upload System Improvement' },
        { date: '2026.03.15', title: isKO ? '필기시험 재응시 제도 시행 안내' : 'Written Exam Retake Policy Notice' },
        { date: '2026.02.28', title: isKO ? '국제인공서핑협회 공식 인증 강사 목록 공개' : 'Official Certified Instructor List Released' },
    ];

    const downloadBox = `
        <div class="notice-download-box">
            <div class="ndl-badge">📎 ${isKO ? '서식 자료실' : 'FORMS & DOCUMENTS'}</div>
            <div class="ndl-title">${isKO ? '실습 이수 확인서' : 'Practical Training Completion Certificate'}</div>
            <div class="ndl-desc">${isKO
                ? '자격증 신청 시 제출하는 실습 이수 확인서입니다. 강사 서명 후 업로드하세요.'
                : 'Required for certification applications. Have your instructor sign before uploading.'
            }</div>
            <div class="notice-download-btns">
                <a class="notice-dl-btn ko" href="/실습이수확인서.html" target="_blank">
                    📄 ${isKO ? '한국어 양식' : 'Korean Form (KO)'}
                </a>
                <a class="notice-dl-btn en" href="/training-cert-en.html" target="_blank">
                    📄 ${isKO ? '영문 양식' : 'English Form (EN)'}
                </a>
            </div>
            
            <!-- 섹션 구분선 -->
            <div style="border-top: 1px solid rgba(255,255,255,0.06); margin: 16px 0 14px;"></div>
            
            <div class="ndl-title" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 10px; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 5px; padding: 2px 8px; font-weight: 800; text-transform: uppercase;">🏥 ${isKO ? '공제금 청구 서식' : 'Claim Forms'}</span>
                <span style="font-weight: 700;">${isKO ? '공제금 청구서' : 'Mutual Aid Claim Form'}</span>
            </div>
            <div class="ndl-desc">${isKO
                ? '서핑 중 사고 발생 시 제출하는 공제금 청구서입니다. 운영자 서명 후 업로드하세요.'
                : 'Submit this form for mutual aid benefits after an accident. Operator signature required.'
            }</div>
            <div class="notice-download-btns">
                <a class="notice-dl-btn ko" href="/mutualaid/claim-form.html" target="_blank" style="background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); color: #fca5a5;">
                    📄 ${isKO ? '한국어 청구서' : 'Korean Form (KO)'}
                </a>
                <a class="notice-dl-btn en" href="/mutualaid/claim-form-en.html" target="_blank" style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); color: var(--text-dark);">
                    📄 ${isKO ? '영문 청구서' : 'English Form (EN)'}
                </a>
            </div>
        </div>
        <div class="notice-download-box" style="margin-top:10px;">
            <div class="ndl-badge" style="background:rgba(8,145,178,0.85);color:#fff;">📋 ${isKO ? '실기평가 기술 요구사항' : 'SKILL REQUIREMENTS'}</div>
            <div class="ndl-title">${isKO ? '종목별 실기평가 기술 요구사항' : 'Practical Skill Requirements by Discipline'}</div>
            <div class="ndl-desc">${isKO
                ? '급수별 지정 기술, 영상 제출 기준, 가산점 항목을 확인하세요.'
                : 'Check designated skills, video submission requirements, and bonus criteria by level.'
            }</div>
            <div class="notice-download-btns">
                <a class="notice-dl-btn ko" href="/skill-requirements-sf.html" target="_blank">
                    🏄 ${isKO ? 'Standing / Flow Board' : 'Standing / Flow Board'}
                </a>
                <a class="notice-dl-btn ko" href="/skill-requirements-bb.html" target="_blank" style="background:rgba(139,92,246,0.12);border-color:rgba(139,92,246,0.4);color:#7c3aed;">
                    🛹 ${isKO ? 'Body / Boogie Board' : 'Body / Boogie Board'}
                </a>
                <a class="notice-dl-btn ko" href="/skill-requirements-ws.html" target="_blank" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.4);color:#059669;">
                    🌊 ${isKO ? 'Wake Surfing' : 'Wake Surfing'}
                </a>
                <a class="notice-dl-btn ko" href="/skill-requirements-wave.html" target="_blank" style="background:rgba(249,115,22,0.12);border-color:rgba(249,115,22,0.4);color:#ea580c;">
                    🏖️ ${isKO ? 'Wave Surfing' : 'Wave Surfing'}
                </a>
            </div>
        </div>`;

    const renderNoticeItem = (n) => n.content ? `
            <div class="quick-item" style="cursor:pointer;user-select:none;" onclick="(function(el){var c=el.querySelector('.ni-content');var a=el.querySelector('.ni-arrow');if(c.style.display==='none'||c.style.display===''){c.style.display='block';a.style.transform='rotate(180deg)';}else{c.style.display='none';a.style.transform='rotate(0deg)';}})(this)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                    <div style="flex:1;">
                        <div class="date">${n.date}${n.isNew ? ` <span style="display:inline-block;background:var(--cyan);color:#000;font-size:9px;font-weight:800;padding:1px 6px;border-radius:99px;vertical-align:middle;margin-left:4px">NEW</span>` : ''}</div>
                        <div class="title">${n.title}</div>
                    </div>
                    <span class="ni-arrow" style="color:#64748b;font-size:11px;margin-top:4px;transition:transform 0.2s;display:inline-block;">▼</span>
                </div>
                <div class="ni-content" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.07);font-size:12px;color:#94a3b8;line-height:1.75;">${n.content}</div>
            </div>` : `
            <div class="quick-item">
                <div class="date">${n.date}${n.isNew ? ` <span style="display:inline-block;background:var(--cyan);color:#000;font-size:9px;font-weight:800;padding:1px 6px;border-radius:99px;vertical-align:middle;margin-left:4px">NEW</span>` : ''}</div>
                <div class="title">${n.title}</div>
            </div>`;

    const pinnedNotices = notices.filter(n => n.content);
    const restNotices = notices.filter(n => !n.content);

    const pinnedHTML = pinnedNotices.length ? `
        <div class="notice-section-label">${isKO ? '공지' : 'Notice'}</div>
        ${pinnedNotices.map(renderNoticeItem).join('')}` : '';

    const noticeList = `
        <div class="notice-section-label" style="margin-top:8px;">${isKO ? '최근 공지' : 'Recent Notices'}</div>
        ${restNotices.map(renderNoticeItem).join('')}`;

    return `<div class="quick-list">${pinnedHTML}${downloadBox}${noticeList}</div>`;
}

function renderEventContent(isKO) {
    const events = [
        { date: isKO ? '~2026.06.30' : '~2026.06.30', title: isKO ? '🎯 자격증 응시료 10% 할인 이벤트 (신규 가입자 한정)' : '🎯 10% Discount on Exam Fees (New Members Only)' },
        { date: isKO ? '~2026.05.31' : '~2026.05.31', title: isKO ? '🏄 인공서핑장 파트너 할인 쿠폰 제공' : '🏄 Partner Wave Pool Discount Coupons' },
    ];
    return `<div class="quick-list">${events.map(e => `<div class="quick-item"><div class="date">${e.date}</div><div class="title">${e.title}</div></div>`).join('')}</div>`;
}

function initAuth() {
    const user = getSession();
    updateNavbarAuth(user);
}
const SESSION_KEY  = 'isa_session_v1';
const SESSION_DAYS = 30;

function isKeepLogin() {
    const cb = document.getElementById('keep-login-check');
    return cb ? cb.checked : true; // 기본값: 유지
}

function getSession() {
    try {
        // 1) localStorage (30일 유지) 확인
        let raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
            const user = JSON.parse(raw);
            // 만료 체크
            if (user.expiresAt && Date.now() > user.expiresAt) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }
            // 곽세영 포인트 픽스
            if (user.name === '곽세영' && !user.points) {
                user.points = 1000;
                localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            }
            return user;
        }
        // 2) sessionStorage (브라우저 닫으면 만료) 확인
        raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
            const user = JSON.parse(raw);
            if (user.name === '곽세영' && !user.points) {
                user.points = 1000;
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            }
            return user;
        }
        return null;
    } catch(e) { return null; }
}
function updateNavbarAuth(user) {
    const btn = document.querySelector('.login-btn');
    if (!btn) return;
    if (user && user.name) {
        // 포인트 동기화 보장 (getSession에서 처리하지만 한 번 더 확인)
        const ptsValue = user.points || 0;
        
        const pts = ptsValue.toLocaleString();
        const pointsStr = ` <span style="font-size:10px; color:#facc15; margin-left:6px; font-weight:800; background:rgba(250,204,21,0.15); padding:2px 6px; border-radius:4px;">${pts} P</span>`;
        
        btn.innerHTML = `<span style="font-size:12px; background:var(--cyan); color:black; padding:2px 8px; border-radius:999px; font-weight:900">${user.name.charAt(0)}</span> <span style="margin-left:4px">${user.name}</span>${pointsStr}`;
        btn.onclick = () => openProfileModal();
    } else {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${currentLang === 'KO' ? '로그인' : 'Login'}`;
        btn.onclick = () => openLoginModal();
    }
}

window.handleLogin = async function(e) {
    e.preventDefault();
    
    if (!isLoginMode) {
        // 회원가입 모드
        const name = $('signup-name')?.value;
        const email = $('signup-email')?.value;
        const phone = $('signup-phone')?.value;
        const birth = $('signup-birth')?.value;
        const gender = $('signup-gender')?.value;
        const password = $('login-password')?.value;
        const confirm = $('signup-pw-confirm')?.value;
        const agree = $('signup-agree')?.checked;

        if (!name || !email || !password) { alert('필수 정보를 입력해주세요.'); return; }
        if (password !== confirm) { alert('비밀번호가 일치하지 않습니다.'); return; }
        if (!agree) { alert('개인정보 약관에 동의해주세요.'); return; }
        
        // 회원가입 시 이메일 인증 체크 제거 (자격증 신청 시 수행)

        if (!GOOGLE_SCRIPT_URL) {
            // URL이 없으면 테스트용 로컬 저장만 수행
            console.warn('GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 테스트 모드로 작동합니다.');
            saveSession({ name, email });
            alert('회원가입 완료! (테스트 모드)');
        } else {
            // GAS로 전송
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'register',
                        name, email, phone, birth, gender, password
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    saveSession(result.data);
                    initAuth();
                    openWelcomeModal();
                } else {
                    alert('회원가입 실패: ' + result.message);
                    return;
                }
            } catch (err) {
                console.error('Registration error:', err);
                alert('서버 연결 오류가 발생했습니다.');
                return;
            }
        }
    } else {
        // 로그인 모드
        const email = $('login-email')?.value;
        const password = $('login-password')?.value;

        if (!GOOGLE_SCRIPT_URL) {
            console.warn('GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 테스트 모드로 작동합니다.');
            saveSession({ name: email.split('@')[0], email });
        } else {
            try {
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=login&email=${email}&password=${password}`);
                const result = await response.json();
                if (result.status === 'success') {
                    saveSession(result.data);
                } else {
                    alert('로그인 실패: ' + result.message);
                    return;
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('서버 연결 오류가 발생했습니다.');
                return;
            }
        }
    }
    
    closeLoginModal();
    initAuth();
};

// ===== 비밀번호 찾기 =====
window.toggleFindPw = function() {
    const sec = $('find-pw-section');
    const btn = $('find-pw-toggle');
    const form = document.getElementById('login-form');
    if (!sec) return;
    const isOpen = sec.style.display !== 'none';
    sec.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.textContent = isOpen ? '비밀번호를 잊으셨나요?' : '취소';
    if (form) form.style.display = isOpen ? 'block' : 'none';
    const sb = $('login-submit-btn'); if (sb) sb.style.display = isOpen ? 'block' : 'none';
    const msg = $('find-pw-msg'); if (msg) msg.textContent = '';
};

window.submitFindPassword = async function() {
    const email = $('find-pw-email')?.value?.trim();
    const msg = $('find-pw-msg');
    if (!email) { if(msg) { msg.style.color='#ef4444'; msg.textContent='이메일을 입력해주세요.'; } return; }
    if(msg) { msg.style.color='#94a3b8'; msg.textContent='발송 중...'; }
    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=findPassword&email=${encodeURIComponent(email)}`);
        const result = await res.json();
        if (msg) {
            msg.style.color = result.status === 'success' ? '#06b6d4' : '#ef4444';
            msg.textContent = result.message;
        }
    } catch(e) {
        if(msg) { msg.style.color='#ef4444'; msg.textContent='서버 연결 오류가 발생했습니다.'; }
    }
};

window.toggleLoginMode = function() {
    isLoginMode = !isLoginMode;
    const tf = $('login-title'); if(tf) tf.textContent = isLoginMode ? '로그인' : '회원가입';
    const tt = $('login-toggle-text'); if(tt) tt.textContent = isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인';
    const sf = $('signup-fields'); if(sf) sf.style.display = isLoginMode ? 'none' : 'block';
    const sfa = $('signup-fields-after'); if(sfa) sfa.style.display = isLoginMode ? 'none' : 'block';
    const sb = $('login-submit-btn'); if(sb) sb.textContent = isLoginMode ? '로그인' : '회원가입';

    // 이메일 필드만 전환 (비밀번호 필드는 회원가입 시에도 표시)
    const loginEmailGroup = document.getElementById('login-email-group');
    if (loginEmailGroup) loginEmailGroup.style.display = isLoginMode ? 'block' : 'none';
};

// Global Exports
window.toggleLang = toggleLang;
window.selectDiscipline = selectDiscipline;
window.selectCertLevel = selectCertLevel;
window.openQuickModal = openQuickModal;
window.closeQuickModal = closeQuickModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.toggleMobileMenu = () => { const m = $('mobile-sub-nav'); if(m) m.classList.toggle('open'); };
window.certApplyCheck = certApplyCheck;
window.certRetakeCheck = certRetakeCheck;

// Profile & Logbook Global Exports
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.switchProfileTab = switchProfileTab;
window.openAddLogForm = openAddLogForm;
window.closeAddLogForm = closeAddLogForm;
window.handleLogFiles = handleLogFiles;
window.removeLogFile = removeLogFile;
window.submitLogbook = submitLogbook;
window.logoutUser = function() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    closeProfileModal();
    initAuth();
    alert(currentLang === 'KO' ? '로그아웃 되었습니다.' : 'Logged out successfully.');
    renderPage(currentPage);
};
// HTML onclick="handleLogout()"과 연결
window.handleLogout = window.logoutUser;


// ===== LEGAL MODAL =====
window.openLegalModal = function(type) {
    const modal = $('legal-modal');
    const titleEl = $('legal-modal-title');
    const contentEl = $('legal-modal-content');
    if (!modal || !contentEl) return;

    const titles = {
        copyright: '저작권 및 지식재산권 고지',
        privacy: '개인정보처리방침',
        terms: '이용약관',
        insurance: '공제회 이용약관'
    };

    if (titleEl) titleEl.textContent = titles[type] || type;

    // LEGAL_TEXTS에서 내용 가져와 HTML로 변환
    const raw = (typeof LEGAL_TEXTS !== 'undefined' && LEGAL_TEXTS[type]) ? LEGAL_TEXTS[type] : '내용을 불러올 수 없습니다.';

    // 줄바꿈 및 단락 처리
    const html = raw
        .split('\n')
        .map(line => {
            const trimmed = line.trim();
            if (trimmed === '') return '<br>';
            // 제N조 제목 스타일
            if (/^제\d+조/.test(trimmed) || /^제\d+장/.test(trimmed) || /^부칙/.test(trimmed)) {
                return `<p style="font-weight:700; color:#e2e8f0; margin-top:16px; margin-bottom:4px;">${trimmed}</p>`;
            }
            // 글머리 기호
            if (trimmed.startsWith('•') || trimmed.startsWith('◦')) {
                return `<p style="padding-left:16px; color:#94a3b8;">${trimmed}</p>`;
            }
            // 번호 목록
            if (/^\d+\./.test(trimmed)) {
                return `<p style="padding-left:8px; color:#cbd5e1;">${trimmed}</p>`;
            }
            // 강조 헤더 (개인정보처리방침, 이용약관 등)
            if (trimmed === raw.split('\n')[0].trim()) {
                return `<h3 style="font-size:18px; font-weight:900; color:var(--cyan); margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid rgba(6,182,212,0.3);">${trimmed}</h3>`;
            }
            return `<p style="color:#94a3b8; line-height:1.7;">${trimmed}</p>`;
        })
        .join('');

    contentEl.innerHTML = `<div style="font-size:13px; line-height:1.8;">${html}</div>`;
    modal.classList.add('open');
};

window.closeLegalModal = function(e) {
    if (e && e.target !== $('legal-modal')) return;
    const modal = $('legal-modal');
    if (modal) modal.classList.remove('open');
};

// closeLegalModal 버튼 클릭용 (이벤트 없이 직접 닫기)
window.closeLegalModalDirect = function() {
    const modal = $('legal-modal');
    if (modal) modal.classList.remove('open');
};

// ===== WELCOME MODAL =====
window.openWelcomeModal = function() {
    const m = document.getElementById('welcome-points-modal');
    if (m) m.classList.add('open');
};

window.closeWelcomeModal = function(e) {
    if (e && e.target !== e.currentTarget) return;
    const m = document.getElementById('welcome-points-modal');
    if (m) m.classList.remove('open');
    closeLoginModal();
};

// ===== EMAIL VERIFICATION (CERT APPLICATION) =====
let certEmailTimerInterval;
let certEmailTimeLeft = 300;
window.isEmailAuthCompleted = false;

window.openEmailVerifyModal = function(email) {
    const modal = document.getElementById('email-verify-modal');
    const emailInput = document.getElementById('cert-verify-email');
    if (emailInput) emailInput.value = email;
    if (modal) modal.classList.add('open');
};

window.closeEmailVerifyModal = function(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('email-verify-modal');
    if (modal) modal.classList.remove('open');
};

window.sendCertEmailCode = function() {
    const email = document.getElementById('cert-verify-email')?.value;
    if (!email) return;

    alert(currentLang === 'KO' 
        ? `${email}로 인증번호가 발송되었습니다. (테스트 모드: 123456)` 
        : `Verification code sent to ${email}. (Test mode: 123456)`);
    
    document.getElementById('cert-email-input-group').style.display = 'block';
    clearInterval(certEmailTimerInterval);
    certEmailTimeLeft = 300;
    
    certEmailTimerInterval = setInterval(() => {
        certEmailTimeLeft--;
        const min = Math.floor(certEmailTimeLeft / 60);
        const sec = certEmailTimeLeft % 60;
        const timerEl = document.getElementById('cert-email-timer');
        if (timerEl) timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        
        if (certEmailTimeLeft <= 0) {
            clearInterval(certEmailTimerInterval);
            alert('인증 시간이 만료되었습니다.');
        }
    }, 1000);
};

window.confirmCertEmailCode = function() {
    const code = document.getElementById('cert-email-code')?.value;
    if (code === '123456') {
        clearInterval(certEmailTimerInterval);
        window.isEmailAuthCompleted = true;
        alert(currentLang === 'KO' ? '이메일 인증이 완료되었습니다. 다시 [신청하기]를 눌러주세요.' : 'Email verified. Please click [Apply] again.');
        closeEmailVerifyModal();
    } else {
        alert('인증번호가 일치하지 않습니다.');
    }
};

// 기존 회원가입용 이메일 인증 함수 제거됨

// ===== PROFILE MODAL & LOGBOOK =====
function openProfileModal() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }
    
    $('profile-name').textContent = user.name;
    $('profile-email').textContent = user.email;
    $('profile-points-value').textContent = (user.points || 0).toLocaleString() + ' P';
    
    // 포인트 충전 UI 초기화
    const chargeCurrent = document.getElementById('profile-charge-current-pts');
    if (chargeCurrent) chargeCurrent.textContent = (user.points || 0).toLocaleString();
    updateChargeDisplay(0, 0);
    $('profile-phone').textContent = user.phone;
    $('profile-birth').textContent = user.birth;
    $('profile-gender').textContent = user.gender === 'M' ? (currentLang === 'KO' ? '남성' : 'Male') : (currentLang === 'KO' ? '여성' : 'Female');
    $('profile-joined').textContent = user.joined;
    
    switchProfileTab('info');
    const m = $('profile-modal');
    if (m) m.classList.add('open');
    
    fetchLogbook();
}

function closeProfileModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const m = $('profile-modal');
    if (m) m.classList.remove('open');
}

function switchProfileTab(tab) {
    $$('.profile-tab').forEach(t => t.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    
    $(`tab-${tab}`).classList.add('active');
    $(`profile-${tab}-content`).classList.add('active');
    
    if (tab === 'cert') fetchCertificates();
}

async function fetchCertificates() {
    const user = getSession();
    if (!user) return;
    
    const list = $('my-cert-list');
    if (!list) return;
    
    list.innerHTML = `<div style="text-align:center;padding:20px;"><div style="display:inline-block;width:20px;height:20px;border:2px solid var(--cyan);border-top:2px solid transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div></div>`;
    
    // 곽세영님 테스트용 자격증 데이터
    const mockCerts = [
        { title: 'Standing/Flow Board Certificate', discipline: 'Standing/Flow', url: 'issued/cert_standing.html' },
        { title: 'Body Board Certificate', discipline: 'Body Board', url: 'issued/cert_body.html' },
        { title: 'Wake Surfing Certificate', discipline: 'Wake Surfing', url: 'issued/cert_wake.html' },
        { title: 'Wave Surfing Certificate', discipline: 'Wave Surfing', url: 'issued/cert_wave.html' },
        { title: 'Certification Registry (Index)', discipline: 'Overview', url: 'issued/index.html' }
    ];

    try {
        // 실제로는 GAS에서 가져옴
        const res = await callGAS({ action: 'getCertificates', email: user.email });
        let certs = res.status === 'success' ? res.data : [];
        
        // 곽세영님인 경우 테스트 데이터 합치기
        if (user.name === '곽세영') {
            certs = [...mockCerts, ...certs];
        }
        
        if (certs.length === 0) {
            list.innerHTML = `<p style="color:#64748b;text-align:center;padding:40px 0">${currentLang === 'KO' ? '보유하신 자격증이 없습니다.' : 'No certificates found.'}</p>`;
            return;
        }
        
        list.innerHTML = certs.map(c => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h5 style="color:white; font-size:14px; font-weight:700; margin:0;">${c.title}</h5>
                    <p style="color:var(--cyan); font-size:11px; margin:4px 0 0; text-transform:uppercase; letter-spacing:1px;">${c.discipline}</p>
                </div>
                <a href="${c.url}" target="_blank" style="background:rgba(6,182,212,0.1); color:var(--cyan); padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; border:1px solid rgba(6,182,212,0.2);">보기</a>
            </div>
        `).join('');
        
    } catch (e) {
        console.error(e);
        list.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px;">정보를 불러오는 중 오류가 발생했습니다.</p>`;
    }
}

// Logbook Logic
function openAddLogForm() {
    $('logbook-form-area').style.display = 'block';
    $('logbook-list').style.display = 'none';
}

function closeAddLogForm() {
    $('logbook-form-area').style.display = 'none';
    $('logbook-list').style.display = 'block';
}

let selectedLogFiles = [];

function handleLogFiles(e) {
    const files = Array.from(e.target.files);
    if (selectedLogFiles.length + files.length > 3) {
        alert(currentLang === 'KO' ? "최대 3장까지만 업로드 가능합니다." : "Max 3 files allowed.");
        e.target.value = '';
        return;
    }
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name}: ${currentLang === 'KO' ? "10MB를 초과합니다." : "Exceeds 10MB."}`);
            return;
        }
        
        // HEIC 안내
        if (file.name.toLowerCase().endsWith('.heic')) {
            alert(currentLang === 'KO' ? "HEIC 파일은 지원되지 않을 수 있습니다. JPG로 변환을 권장합니다." : "HEIC might not be supported. JPG recommended.");
        }
        
        selectedLogFiles.push(file);
    });
    renderFilePreviews();
}

function renderFilePreviews() {
    const preview = $('file-preview');
    preview.innerHTML = selectedLogFiles.map((f, i) => `
        <div class="preview-item">
            <span>${f.name}</span>
            <button onclick="removeLogFile(${i})">✕</button>
        </div>
    `).join('');
}

function removeLogFile(index) {
    selectedLogFiles.splice(index, 1);
    renderFilePreviews();
}

// ===== POINT CHARGE LOGIC =====
let selectedChargeAmount = 0;
let selectedChargePrice = 0;

window.selectChargeAmount = function(amount, price) {
    selectedChargeAmount = amount;
    selectedChargePrice = price;
    
    // 버튼 활성화 스타일
    document.querySelectorAll('.charge-opt-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`charge-btn-${amount}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    updateChargeDisplay(amount, price);
};

function updateChargeDisplay(amount, price) {
    const user = getSession();
    const finalPrice = document.getElementById('charge-final-price');
    const afterPts = document.getElementById('charge-after-pts');
    
    if (finalPrice) finalPrice.textContent = price.toLocaleString() + '원';
    if (afterPts) {
        const total = (user ? user.points || 0 : 0) + amount;
        afterPts.textContent = total.toLocaleString() + ' P';
    }
}

window.startPointCharge = function() {
    const user = getSession();
    if (!user) { alert('로그인이 필요합니다.'); return; }
    if (selectedChargePrice <= 0) { alert('충전 금액을 선택해주세요.'); return; }
    if (selectedChargePrice < 10000) { alert('최소 충전 금액은 10,000원입니다.'); return; }
    if (selectedChargePrice % 10000 !== 0) { alert('10,000원 단위로만 충전할 수 있습니다.'); return; }

    if (typeof innopay === 'undefined') {
        alert('결제 시스템을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    const moid = 'ISAPT' + Date.now();

    innopay.goPay({
        PayMethod: 'CARD',
        MID: INNOPAY_MID,
        Moid: moid,
        GoodsName: `ISA 포인트 충전 (${selectedChargeAmount.toLocaleString()}P)`,
        Amt: selectedChargePrice.toString(),
        BuyerName: user.name,
        BuyerEmail: user.email,
        BuyerTel: user.phone || '010-0000-0000',
        ResultYN: 'N',
        callback: async function(res) {
            if (res.res_cd === '0000') {
                let newBalance = (user.points || 0) + selectedChargeAmount;
                try {
                    // GAS 서버에 포인트 충전 기록 저장
                    const result = await callGAS({
                        action: 'chargePoints',
                        email: user.email,
                        name: user.name,
                        chargedPoints: selectedChargeAmount,
                        price: selectedChargePrice,
                        tid: res.tid || moid
                    });
                    if (result && result.newBalance !== undefined) {
                        newBalance = result.newBalance;
                    }
                } catch(e) { /* 서버 실패해도 로컬 업데이트 */ }
                refreshPointsUI(newBalance);
                alert(`✅ ${selectedChargeAmount.toLocaleString()}P 충전이 완료되었습니다!\n현재 잔액: ${newBalance.toLocaleString()}P`);
                openProfileModal();
            } else {
                alert('결제 실패: ' + (res.res_msg || '알 수 없는 오류'));
            }
        }
    });
};

async function submitLogbook() {
    const user = getSession();
    const date = $('log-date').value;
    const place = $('log-place').value;
    const hours = $('log-hours').value;
    
    if (!date || !place) {
        alert(currentLang === 'KO' ? "모든 필드를 입력해주세요." : "Please fill all fields.");
        return;
    }
    
    if (selectedLogFiles.length === 0) {
        alert(currentLang === 'KO' ? "증빙 자료를 최소 1장 첨 be 첨부해주세요." : "Please attach at least 1 proof file.");
        return;
    }

    // 파일 Base64 변환 시뮬레이션 (실제로는 서버 전송 로직)
    const imageLinks = selectedLogFiles.map(f => f.name).join(', '); // 실제로는 업로드 후 URL
    
    const payload = {
        action: 'addLogbook',
        email: user.email,
        name: user.name,
        date, place, hours,
        imageLinks: "https://isa-proof-storage.example.com/" + imageLinks // 임시
    };
    
    const btn = document.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = "...";

    try {
        const res = await callGAS(payload);
        if (res.status === 'success') {
            alert(currentLang === 'KO' ? "기록이 등록되었습니다. 관리자 승인 후 반영됩니다." : "Record submitted. Pending approval.");
            closeAddLogForm();
            fetchLogbook();
        }
    } catch (err) {
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = currentLang === 'KO' ? "등록하기" : "Submit";
    }
}

async function fetchLogbook() {
    const user = getSession();
    if (!user) return;
    
    try {
        const res = await callGAS({ action: 'getLogbook', email: user.email });
        if (res.status === 'success') {
            $('total-training-hours').textContent = `${res.totalHours}${currentLang === 'KO' ? '시간' : 'h'}`;
            renderLogbookList(res.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderLogbookList(data) {
    const list = $('logbook-list');
    if (!data || data.length === 0) {
        list.innerHTML = `<p style="color:var(--text-dark);text-align:center;padding:40px 0">${currentLang === 'KO' ? '등록된 기록이 없습니다.' : 'No records found.'}</p>`;
        return;
    }
    
    list.innerHTML = data.map(item => `
        <div class="log-item glass-panel">
            <div class="log-info">
                <span class="log-date">${item.date.split('T')[0]}</span>
                <span class="log-place">${item.place}</span>
                <span class="log-hours">${item.hours}h</span>
            </div>
            <div class="log-status ${item.status === '승인완료' ? 'approved' : 'pending'}">
                ${item.status}
            </div>
        </div>
    `).join('');
}

// Practical Evaluation Submission
async function submitPracticalEval() {
    const user = getSession();
    let ytUrl = '';
    
    if (selectedLevel === 1) {
        const techUrl = $('youtube-url-tech').value.trim();
        const coachUrl = $('youtube-url-coach').value.trim();
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        if (!ytRegex.test(techUrl) || !ytRegex.test(coachUrl)) {
            alert(currentLang === 'KO' ? "2개의 유효한 YouTube 링크를 모두 입력해주세요." : "Please enter 2 valid YouTube URLs.");
            return false;
        }
        ytUrl = '[기술] ' + techUrl + '\n[강습] ' + coachUrl;
    } else {
        ytUrl = $('youtube-url').value.trim();
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        if (!ytRegex.test(ytUrl)) {
            alert(currentLang === 'KO' ? "유효한 YouTube 링크를 입력해주세요." : "Please enter a valid YouTube URL.");
            return false;
        }
    }
    
    // 사진 업로드 처리 (선택)
    let photoUrl = '';
    const photoInput = document.getElementById('cert-photo-input');
    if (photoInput && photoInput.files && photoInput.files[0]) {
        photoUrl = await uploadPhotoToGAS(photoInput.files[0]);
    }
    
    const logRes = await callGAS({ action: 'getLogbook', email: user.email });
    
    const payload = {
        action: 'submitPractical',
        email: user.email,
        name: user.name,
        discipline: selectedDiscipline,
        level: selectedLevel,
        youtubeUrl: ytUrl,
        photoUrl: photoUrl,
        totalHours: logRes.totalHours || 0
    };
    
    try {
        const res = await callGAS(payload);
        if (res.status === 'success') {
            return true;
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}

// 사진 미리보기
window.previewCertPhoto = function(input) {
    const preview = document.getElementById('cert-photo-preview');
    const nameEl = document.getElementById('cert-photo-name');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (nameEl) nameEl.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
};

// 사진 Base64 → GAS 업로드
async function uploadPhotoToGAS(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const res = await callGAS({
                    action: 'saveCertPhoto',
                    base64: e.target.result,
                    mimeType: file.type,
                    fileName: file.name
                });
                resolve(res.url || '');
            } catch(err) {
                console.error('사진 업로드 실패:', err);
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
}

// ===== 실습 이수 증빙 업로드 =====
window.previewTrainingProof = function(input) {
    const preview = document.getElementById('training-proof-preview');
    const countEl = document.getElementById('training-proof-count');
    if (!preview) return;
    
    preview.innerHTML = '';
    const files = Array.from(input.files).slice(0, 5);
    
    if (countEl) {
        countEl.textContent = files.length > 0 ? `${files.length}개 선택됨 (최대 5개)` : '선택된 파일 없음';
    }
    
    files.forEach((file, i) => {
        const item = document.createElement('div');
        item.className = 'proof-item';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            item.appendChild(img);
        } else {
            const icon = document.createElement('span');
            icon.className = 'file-icon';
            icon.textContent = '📄';
            item.appendChild(icon);
        }
        
        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        item.appendChild(fileName);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.title = '삭제';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dt = new DataTransfer();
            const inputEl = document.getElementById('training-proof-input');
            Array.from(inputEl.files).forEach((f, idx) => {
                if (idx !== i) dt.items.add(f);
            });
            inputEl.files = dt.files;
            window.previewTrainingProof(inputEl);
        };
        item.appendChild(removeBtn);
        
        preview.appendChild(item);
    });
};


window.submitTrainingProof = async function(btn) {
    const user = getSession();
    if (!user) {
        alert(currentLang === 'KO' ? '로그인이 필요합니다.' : 'Login required.');
        openLoginModal(); return;
    }
    const input = document.getElementById('training-proof-input');
    if (!input || !input.files || input.files.length === 0) {
        alert(currentLang === 'KO' ? '증빙 자료를 최소 1개 첨부해주세요.' : 'Please attach at least 1 proof file.');
        return;
    }
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'KO' ? '제출 중...' : 'Submitting...';
    try {
        const files = Array.from(input.files);
        const uploadedUrls = [];
        for (const file of files) {
            const url = await uploadTrainingFileToGAS(file);
            uploadedUrls.push(url || file.name);
        }
        const payload = {
            action: 'saveTrainingProof',
            email: user.email,
            name: user.name,
            discipline: selectedDiscipline,
            level: selectedLevel,
            proofFiles: uploadedUrls.join(','),
            submittedAt: new Date().toISOString()
        };
        await callGAS(payload);
        alert(currentLang === 'KO'
            ? '✅ 실습 이수 증빙이 제출되었습니다.\n관리자 검토 후 처리됩니다.'
            : '✅ Training proof submitted.\nWill be reviewed by admin.');
        if (input) input.value = '';
        const preview = document.getElementById('training-proof-preview');
        if (preview) preview.innerHTML = '';
        const countEl = document.getElementById('training-proof-count');
        if (countEl) countEl.textContent = '선택된 파일 없음';
    } catch(err) {
        console.error('실습 증빙 제출 오류:', err);
        alert(currentLang === 'KO' ? '제출 중 오류가 발생했습니다.' : 'An error occurred during submission.');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
};

async function uploadTrainingFileToGAS(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const res = await callGAS({
                    action: 'saveFile',
                    fileType: 'trainingProof',
                    base64: e.target.result,
                    mimeType: file.type,
                    fileName: file.name
                });
                resolve(res.url || '');
            } catch(err) { console.error('파일 업로드 실패:', err); resolve(''); }
        };
        reader.readAsDataURL(file);
    });
}

// callGAS Helper
async function callGAS(data) {
    const url = GOOGLE_SCRIPT_URL || '';
    if (!url) {
        console.warn('[callGAS] GOOGLE_SCRIPT_URL이 설정되지 않음');
        return { status: 'success', data: [], totalHours: 0 };
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch(e) {
        console.error('[callGAS] 오류:', e);
        return { status: 'error' };
    }
}

// 마이페이지 - 본인 자격증 목록 로드
window.loadMyCerts = async function() {
    const user = getSession();
    const container = document.getElementById('my-cert-list');
    if (!container || !user) return;

    container.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px;">로딩 중...</p>';

    try {
        const url = GOOGLE_SCRIPT_URL + '?action=getUserCerts&email=' + encodeURIComponent(user.email);
        const res = await fetch(url);
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
            container.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px;">발급된 자격증이 없습니다.</p>';
            return;
        }

        const levelColors = {'1급':'#d4af37','2급':'#06b6d4','3급':'#10b981','4급':'#94a3b8'};
        container.innerHTML = json.data.map(c => `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
                border-radius:12px;padding:16px 20px;margin-bottom:12px;
                display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div>
                    <div style="font-size:10px;color:#64748b;letter-spacing:1px;margin-bottom:4px;">자격증번호</div>
                    <div style="font-size:13px;color:white;font-family:monospace;font-weight:700;margin-bottom:8px;">${c.certNumber}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:12px;font-weight:700;color:${levelColors[c.level]||'#94a3b8'};">${c.level}</span>
                        <span style="font-size:12px;color:#94a3b8;">${c.discipline}</span>
                        <span style="font-size:11px;color:#475569;">${c.issueDate}</span>
                    </div>
                </div>
                <a href="${c.driveUrl}" target="_blank"
                    style="padding:8px 14px;background:linear-gradient(135deg,var(--cyan),#2563eb);
                    border-radius:8px;color:white;font-size:12px;font-weight:700;
                    text-decoration:none;white-space:nowrap;flex-shrink:0;">
                    📥 다운로드
                </a>
            </div>
        `).join('');
    } catch(e) {
        if (!GOOGLE_SCRIPT_URL) {
            container.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px;font-size:12px;">⚙️ GAS URL 미설정</p>';
        } else {
            container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px;">로드 실패. 다시 시도해주세요.</p>';
        }
    }
};
// Handler for Practical Submit Button
async function handlePracticalSubmit(btn) {
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "...";

    const success = await submitPracticalEval();

    if (success) {
        alert(currentLang === 'KO' ? "실기 평가 영상이 성공적으로 제출되었습니다!" : "Practical video submitted successfully!");
        renderPage('cert'); // UI 갱신
    } else {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// ============================================================
// ★ ISA 포인트 시스템 (v1 - ISA-Prod)
// ============================================================

// 세션 저장 헬퍼
// persist: true=localStorage(30일), false=sessionStorage, undefined=기존저장소 유지 or 체크박스 참조
function saveSession(data, persist) {
    // persist 미지정 시: 이미 저장된 곳 유지, 없으면 체크박스 참조
    if (persist === undefined) {
        if (localStorage.getItem(SESSION_KEY))  persist = true;
        else if (sessionStorage.getItem(SESSION_KEY)) persist = false;
        else persist = isKeepLogin();
    }
    if (persist) {
        const d = { ...data, expiresAt: data.expiresAt || (Date.now() + SESSION_DAYS * 86400000) };
        localStorage.setItem(SESSION_KEY, JSON.stringify(d));
        sessionStorage.removeItem(SESSION_KEY);
    } else {
        const { expiresAt, ...clean } = data;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(clean));
        localStorage.removeItem(SESSION_KEY);
    }
}

// ── 포인트 UI 전체 동기화 (네비바 + 프로필 배지 + 충전탭 잔액 한 번에) ──
function refreshPointsUI(newPoints) {
    // 1. 세션 저장
    const sess = getSession();
    if (sess) { sess.points = newPoints; saveSession(sess); }

    // 2. 네비바 버튼
    updateNavbarAuth(getSession());

    // 3. 프로필 모달 포인트 배지
    const ptEl = document.getElementById('profile-points-value');
    if (ptEl) ptEl.textContent = newPoints.toLocaleString() + ' P';

    // 4. 충전탭 현재 잔액
    const chargeCurrent = document.getElementById('profile-charge-current-pts');
    if (chargeCurrent) chargeCurrent.textContent = newPoints.toLocaleString();

    // 5. 충전탭 "충전 후 잔액" 미리보기 갱신
    if (selectedChargeAmount > 0) updateChargeDisplay(selectedChargeAmount, selectedChargePrice);
}

// ── 기존 openProfileModal 오버라이드 (포인트 표시 추가) ──
function openProfileModal() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }

    const nm = document.getElementById('profile-name');
    const em = document.getElementById('profile-email');
    const ph = document.getElementById('profile-phone');
    const bi = document.getElementById('profile-birth');
    const ge = document.getElementById('profile-gender');
    const jo = document.getElementById('profile-joined');

    if (nm) nm.textContent = user.name;
    if (em) em.textContent = user.email;
    if (ph) ph.textContent = user.phone || '-';
    if (bi) bi.textContent = user.birth || '-';
    if (ge) ge.textContent = user.gender === 'M' ? (currentLang === 'KO' ? '남성' : 'Male') : (currentLang === 'KO' ? '여성' : 'Female');
    if (jo) jo.textContent = user.joined || '-';

    // 포인트 즉시 표시 (캐시)
    const ptEl = document.getElementById('profile-points-value');
    if (ptEl) ptEl.textContent = (user.points || 0).toLocaleString() + ' P';

    // 기본 탭: 내 정보
    switchProfileTab('info');
    const m = document.getElementById('profile-modal');
    if (m) m.classList.add('open');

    fetchLogbook();

    // 서버에서 최신 포인트 비동기 갱신 후 전체 UI 동기화
    fetchMyPoints(user.email).then(freshPoints => {
        refreshPointsUI(freshPoints);
    }).catch(() => {});
}

// ── 포인트/적립 탭 처리를 위한 switchProfileTab 오버라이드 ──
function switchProfileTab(tab) {
    // 기존 탭 비활성화
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // 새 탭 활성화
    const tabBtn = document.getElementById('tab-' + tab);
    if (tabBtn) tabBtn.classList.add('active');

    const tabContent = document.getElementById('profile-' + tab + '-content');
    if (tabContent) tabContent.classList.add('active');

    // 충전 탭 열 때 최신 잔액 표시
    if (tab === 'charge') {
        const s = getSession();
        const cur = document.getElementById('profile-charge-current-pts');
        if (cur && s) cur.textContent = (s.points || 0).toLocaleString();
        // 선택 초기화
        selectedChargeAmount = 0; selectedChargePrice = 0;
        document.querySelectorAll('.charge-opt-btn').forEach(b => b.classList.remove('active'));
        const fp = document.getElementById('charge-final-price'); if (fp) fp.textContent = '0원';
        const ap = document.getElementById('charge-after-pts'); if (ap) ap.textContent = '0 P';
    }

    // 포인트 내역 탭 렌더링
    if (tab === 'points') {
        const session = getSession();
        const content = document.getElementById('profile-points-content');
        if (content && session) {
            content.innerHTML = '<div style="text-align:center;padding:32px;color:#64748b;font-size:13px">📊 내역 불러오는 중...</div>';
            fetchMyPointHistory(session.email).then(result => {
                if (!result || !result.data || result.data.length === 0) {
                    content.innerHTML = '<div style="text-align:center;padding:32px;color:#64748b;font-size:13px">아직 포인트 내역이 없습니다.</div>';
                    return;
                }
                const rows = result.data.map(item => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                        <div>
                            <div style="font-size:13px;color:white;font-weight:600">${item.reason}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:2px">${item.date}</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;margin-left:12px">
                            <div style="font-size:14px;font-weight:700;color:${item.points > 0 ? '#22c55e' : '#ef4444'}">${item.points > 0 ? '+' : ''}${item.points.toLocaleString()}P</div>
                            <div style="font-size:11px;color:#64748b">잔액 ${(item.balance||0).toLocaleString()}P</div>
                        </div>
                    </div>`).join('');
                content.innerHTML = `
                    <div style="padding:16px">
                        <div style="font-size:11px;color:#64748b;margin-bottom:8px;text-align:right">총 ${result.data.length}건</div>
                        <div style="max-height:320px;overflow-y:auto;padding-right:4px">${rows}</div>
                    </div>`;
            }).catch(() => {
                content.innerHTML = '<div style="text-align:center;padding:32px;color:#ef4444;font-size:12px">내역을 불러오지 못했습니다.</div>';
            });
        }
    }

    // 포인트 적립 탭 렌더링
    if (tab === 'earn') {
        const content = document.getElementById('profile-earn-content');
        if (content) {
            content.innerHTML = `
            <div style="padding:16px;display:flex;flex-direction:column;gap:10px;max-height:380px;overflow-y:auto">

                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px">
                    <div style="margin-bottom:10px">
                        <div style="font-size:13px;font-weight:700;color:white;margin-bottom:2px">📢 SNS 홍보 게시글</div>
                        <div style="font-size:11px;color:#64748b">승인 후 1,000P 적립 · 월 5회 한도</div>
                    </div>
                    <div style="display:flex;gap:6px;margin-bottom:6px">
                        <select id="promo-platform" style="flex:0 0 110px;padding:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:white;font-size:12px;outline:none">
                            <option value="인스타그램">인스타그램</option>
                            <option value="네이버블로그">네이버 블로그</option>
                            <option value="네이버카페">네이버 카페</option>
                            <option value="유튜브">유튜브</option>
                            <option value="기타SNS">기타 SNS</option>
                        </select>
                        <input id="promo-link" type="url" placeholder="게시글 링크 (https://...)"
                            style="flex:1;padding:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:white;font-size:12px;outline:none;min-width:0">
                    </div>
                    <button onclick="submitPromoPostForm()"
                        style="width:100%;padding:9px;background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(37,99,235,0.15));color:#06b6d4;border:1px solid rgba(6,182,212,0.3);border-radius:8px;font-weight:700;font-size:12px;cursor:pointer">
                        제출하기
                    </button>
                    <div id="promo-msg" style="font-size:11px;margin-top:6px;color:#94a3b8;text-align:center;min-height:16px"></div>
                </div>

                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px">
                    <div style="margin-bottom:10px">
                        <div style="font-size:13px;font-weight:700;color:white;margin-bottom:2px">⭐ 리뷰 작성</div>
                        <div style="font-size:11px;color:#64748b">200P 적립 · 하루 5회 한도</div>
                    </div>
                    <select id="review-target"
                        style="width:100%;padding:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:white;font-size:12px;outline:none;margin-bottom:6px">
                        <option value="자격증 과정">자격증 과정 리뷰</option>
                        <option value="장비 스토어">장비 스토어 리뷰</option>
                        <option value="강사 매칭">강사 매칭 서비스 리뷰</option>
                        <option value="협회 서비스">협회 서비스 전체 리뷰</option>
                    </select>
                    <textarea id="review-text" placeholder="리뷰 내용을 입력하세요 (20자 이상)"
                        style="width:100%;padding:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:white;font-size:12px;outline:none;resize:none;height:62px;box-sizing:border-box"></textarea>
                    <button onclick="submitReviewForm()"
                        style="width:100%;margin-top:6px;padding:9px;background:linear-gradient(135deg,rgba(234,179,8,0.15),rgba(239,68,68,0.15));color:#facc15;border:1px solid rgba(234,179,8,0.3);border-radius:8px;font-weight:700;font-size:12px;cursor:pointer">
                        리뷰 등록 +200P
                    </button>
                    <div id="review-msg" style="font-size:11px;margin-top:6px;color:#94a3b8;text-align:center;min-height:16px"></div>
                </div>
            </div>`;
        }
    }

    // 자격증 탭
    if (tab === 'cert') {
        window.loadMyCerts && window.loadMyCerts();
    }
}

// ── 포인트 API ──
async function fetchMyPoints(email) {
    const url = `${GOOGLE_SCRIPT_URL}?action=getPoints&email=${encodeURIComponent(email)}`;
    try {
        const res = await fetch(url);
        const result = await res.json();
        if (result.status === 'success') return result.points;
    } catch(e) { console.warn('포인트 조회 실패:', e); }
    return 0;
}

async function fetchMyPointHistory(email) {
    const url = `${GOOGLE_SCRIPT_URL}?action=getPointHistory&email=${encodeURIComponent(email)}`;
    try {
        const res = await fetch(url);
        return await res.json();
    } catch(e) { console.warn('포인트 내역 조회 실패:', e); }
    return { data: [], total: 0 };
}

async function submitPromoPostForm() {
    const session = getSession();
    if (!session) return;
    const link     = document.getElementById('promo-link')?.value?.trim();
    const platform = document.getElementById('promo-platform')?.value;
    const msg      = document.getElementById('promo-msg');

    if (!link || !link.startsWith('http')) {
        if (msg) { msg.style.color = '#ef4444'; msg.textContent = '올바른 링크를 입력해주세요. (https://...)'; }
        return;
    }
    if (msg) { msg.style.color = '#94a3b8'; msg.textContent = '제출 중...'; }

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'submitPromoPost', email: session.email, name: session.name, link, platform })
        });
        const result = await res.json();
        if (msg) { msg.style.color = result.status === 'success' ? '#22c55e' : '#ef4444'; msg.textContent = result.message; }
        if (result.status === 'success') { const el = document.getElementById('promo-link'); if (el) el.value = ''; }
    } catch(e) {
        if (msg) { msg.style.color = '#ef4444'; msg.textContent = '제출 중 오류가 발생했습니다.'; }
    }
}
window.submitPromoPostForm = submitPromoPostForm;

async function submitReviewForm() {
    const session    = getSession();
    if (!session) return;
    const reviewText = document.getElementById('review-text')?.value?.trim();
    const targetType = document.getElementById('review-target')?.value;
    const msg        = document.getElementById('review-msg');

    if (!reviewText || reviewText.length < 20) {
        if (msg) { msg.style.color = '#ef4444'; msg.textContent = '리뷰를 20자 이상 입력해주세요.'; }
        return;
    }
    if (msg) { msg.style.color = '#94a3b8'; msg.textContent = '등록 중...'; }

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'submitReview', email: session.email, name: session.name, reviewText, targetType })
        });
        const result = await res.json();
        if (msg) { msg.style.color = result.status === 'success' ? '#22c55e' : '#ef4444'; msg.textContent = result.message; }
        if (result.status === 'success') {
            refreshPointsUI(result.balance || 0);
            const textEl = document.getElementById('review-text');
            if (textEl) textEl.value = '';
        }
    } catch(e) {
        if (msg) { msg.style.color = '#ef4444'; msg.textContent = '등록 중 오류가 발생했습니다.'; }
    }
}
window.submitReviewForm = submitReviewForm;

// ── 포인트 토스트 ──
function showPointsToast(amount, reason) {
    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed;top:110px;left:50%;transform:translateX(-50%);z-index:9999;',
        'background:linear-gradient(135deg,rgba(15,23,42,0.97),rgba(30,58,138,0.95));',
        'border:1px solid rgba(234,179,8,0.55);padding:16px 28px;border-radius:16px;',
        'color:white;font-weight:700;font-size:14px;text-align:center;min-width:220px;',
        'box-shadow:0 8px 32px rgba(234,179,8,0.2);'
    ].join('');
    toast.innerHTML = '🏆 <span style="color:#facc15">+' + amount.toLocaleString() + 'P</span> 적립!<br>' +
        '<span style="font-size:12px;color:#94a3b8;font-weight:400">' + reason + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 420);
    }, 3200);
}

// ── 가입 축하 포인트 토스트 자동 표시 ──
(function patchNavbarForSignupToast() {
    const _orig = window.updateNavbarAuth;
    if (!_orig) return;
    window.updateNavbarAuth = function(user) {
        _orig.call(this, user);
        if (user && sessionStorage.getItem('isa_signup_toast')) {
            sessionStorage.removeItem('isa_signup_toast');
            setTimeout(() => showPointsToast(1000, '가입 축하 포인트'), 400);
        }
    };
})();

// ── handleLogin 패치: 회원가입 성공 시 플래그 설정 ──
(function patchHandleLoginForPoints() {
    const _orig = window.handleLogin;
    if (!_orig) return;
    window.handleLogin = async function(e) {
        const wasSignup = !isLoginMode;
        await _orig.call(this, e);
        if (wasSignup && getSession()) {
            sessionStorage.setItem('isa_signup_toast', '1');
        }
    };
})();

// ===== BOARD (COMMUNITY) SYSTEM =====
let boardPosts = [];
let currentBoardView = 'list'; 
let selectedPostId = null;

async function renderBoardPage() {
    const isKO = currentLang === 'KO';
    if (currentBoardView === 'detail' && selectedPostId) {
        return await renderBoardDetail(selectedPostId);
    }
    return renderBoardList();
}

function renderBoardList() {
    const isKO = currentLang === 'KO';
    setTimeout(fetchBoardPosts, 100); 

    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="board-container">
            <div class="board-header">
                <div class="board-title-group">
                    <h2 class="game-font">${isKO ? '자유 게시판' : 'Community Board'}</h2>
                    <p>${isKO ? '인공서핑 관련 정보와 영상을 공유하고 포인트를 받으세요!' : 'Share info & videos about artificial surfing and earn points!'}</p>
                </div>
                <button class="write-btn" onclick="openBoardWriteModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    ${isKO ? '글쓰기' : 'Write'}
                </button>
            </div>
            
            <div id="board-list-content" class="board-grid">
                <div style="text-align:center; padding:100px; color:var(--text-dark);">
                    <div class="animate-spin" style="font-size:30px; margin-bottom:16px;">🔄</div>
                    <p>${isKO ? '게시글을 불러오는 중입니다...' : 'Loading posts...'}</p>
                </div>
            </div>
        </div>
    </section>`;
}

async function fetchBoardPosts() {
    const listEl = document.getElementById('board-list-content');
    if (!listEl) return;

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBoardPosts`);
        const result = await res.json();
        
        if (result.status === 'success') {
            boardPosts = result.data;
            renderBoardItems(boardPosts);
        } else {
            listEl.innerHTML = `<p style="text-align:center; color:var(--red); padding:40px;">${result.message || 'Error loading posts'}</p>`;
        }
    } catch (err) {
        listEl.innerHTML = `<p style="text-align:center; color:var(--red); padding:40px;">Failed to connect to server.</p>`;
    }
}

function renderBoardItems(posts) {
    const listEl = document.getElementById('board-list-content');
    if (!listEl) return;

    if (!posts || posts.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:var(--text-dark); padding:100px;">등록된 게시글이 없습니다.</p>`;
        return;
    }

    const sorted = [...posts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    listEl.innerHTML = sorted.map(post => {
        const hasVideo = post.videoLink && post.videoLink.length > 10;
        const hasImages = post.imageLinks && post.imageLinks.length > 10;
        
        return `
        <div class="board-card glass-panel ${post.isPinned ? 'pinned' : ''}" onclick="viewBoardDetail('${post.id}')">
            <div class="board-card-header">
                <h3 class="board-card-title">${post.title}</h3>
                <div class="board-card-meta">
                    <span>👤 ${post.authorName}</span>
                    <span>📅 ${post.date.split(' ')[0]}</span>
                    <span>💬 ${post.commentCount || 0}</span>
                </div>
            </div>
            ${(hasVideo || hasImages) ? `
            <div class="board-card-preview">
                ${hasVideo ? `<div class="preview-video-icon">🎥 영상 포함 (+500P 대상)</div>` : ''}
                ${hasImages ? `<img src="${post.imageLinks.split(',')[0]}" class="preview-thumb" onerror="this.style.display='none'">` : ''}
            </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

function viewBoardDetail(postId) {
    selectedPostId = postId;
    currentBoardView = 'detail';
    renderPage('board');
}

async function renderBoardDetail(postId) {
    const isKO = currentLang === 'KO';
    const post = boardPosts.find(p => String(p.id) === String(postId));
    
    if (!post) {
        currentBoardView = 'list';
        return renderBoardList();
    }

    setTimeout(() => fetchBoardComments(postId), 100);

    const videoEmbed = post.videoLink ? getEmbedHtml(post.videoLink) : '';
    const images = post.imageLinks ? post.imageLinks.split(',').filter(Boolean) : [];

    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="board-container board-detail">
            <button class="back-btn" style="margin-bottom:24px" onclick="currentBoardView='list';renderPage('board')">← ${isKO ? '목록으로' : 'Back to List'}</button>
            
            <div class="glass-panel" style="padding:32px; border-radius:16px;">
                <div class="board-detail-header">
                    <h2 class="board-detail-title">${post.title}</h2>
                    <div class="board-card-meta">
                        <span>👤 ${post.authorName}</span>
                        <span>📅 ${post.date}</span>
                        ${post.isPinned ? `<span style="color:#facc15; font-weight:800;">📌 공지사항</span>` : ''}
                    </div>
                </div>
                
                <div class="board-detail-body">${post.content}</div>
                
                ${videoEmbed ? `
                <div style="margin-bottom:24px;">
                    <p style="color:var(--amber); font-size:12px; font-weight:700; margin-bottom:8px;">📹 공유 영상</p>
                    <div class="video-embed-container">${videoEmbed}</div>
                </div>` : ''}
                
                ${images.length > 0 ? `
                <div class="board-detail-images">
                    ${images.map(img => `<img src="${img}" class="board-detail-image" onclick="window.open(this.src)">`).join('')}
                </div>` : ''}
                
                <div class="comments-section" id="comments-section">
                    <h3 class="comments-title">댓글</h3>
                    <div id="comments-list">
                        <p style="color:var(--text-dark)">댓글을 불러오는 중...</p>
                    </div>
                    
                    ${getSession() ? `
                    <div class="comment-form">
                        <textarea id="comment-input" class="comment-input" placeholder="${isKO ? '따뜻한 댓글을 남겨주세요.' : 'Leave a comment...'}"></textarea>
                        <button class="comment-submit" onclick="submitBoardComment('${postId}')">${isKO ? '등록' : 'Post'}</button>
                    </div>
                    ` : `
                    <p style="text-align:center; padding:20px; color:var(--text-dark); background:rgba(0,0,0,0.2); border-radius:8px; font-size:14px; margin-top:20px;">
                        로그인 후 댓글을 작성할 수 있습니다.
                    </p>
                    `}
                </div>
            </div>
        </div>
    </section>`;
}

function getEmbedHtml(link) {
    if (!link) return '';
    try {
        if (link.includes('youtube.com') || link.includes('youtu.be')) {
            let vid = '';
            if (link.includes('v=')) vid = link.split('v=')[1].split('&')[0];
            else if (link.includes('youtu.be/')) vid = link.split('youtu.be/')[1].split('?')[0];
            if (vid) return `<iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>`;
        }
        if (link.includes('instagram.com')) {
            return `<p style="text-align:center; padding:20px;"><a href="${link}" target="_blank" style="color:var(--cyan); text-decoration:underline;">🔗 인스타그램 영상 보기 (클릭)</a></p>`;
        }
    } catch(e) {}
    return `<p style="text-align:center; padding:20px;"><a href="${link}" target="_blank" style="color:var(--cyan); text-decoration:underline;">🔗 영상 링크 바로가기</a></p>`;
}

async function fetchBoardComments(postId) {
    const listEl = document.getElementById('comments-list');
    if (!listEl) return;

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBoardComments&postId=${postId}`);
        const result = await res.json();
        
        if (result.status === 'success') {
            renderComments(result.data);
        }
    } catch (err) {
        listEl.innerHTML = `<p>Error loading comments.</p>`;
    }
}

function renderComments(comments) {
    const listEl = document.getElementById('comments-list');
    if (!listEl) return;
    const session = getSession();
    const isAdmin = session && (session.email === 'admin@isa-surfing.org' || session.email === 'zenpower0708@gmail.com');

    if (!comments || comments.length === 0) {
        listEl.innerHTML = `<p style="color:var(--text-dark); font-size:14px;">첫 댓글을 남겨보세요!</p>`;
    } else {
        listEl.innerHTML = comments.map(c => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${c.authorName}</span>
                    <span class="comment-date">${c.date}</span>
                </div>
                <div class="comment-body">${c.content}</div>
                ${c.isPointAward ? `<div class="comment-award">🎁 포인트 지급 완료 (${c.awardAmount}P)</div>` : ''}
            </div>
        `).join('');
    }

    if (isAdmin && !document.getElementById('admin-reward-panel')) {
        const panel = document.createElement('div');
        panel.id = 'admin-reward-panel';
        panel.className = 'admin-reward-panel';
        panel.innerHTML = `
            <div class="admin-reward-header">⭐ 관리자 포인트 지급</div>
            <div class="admin-reward-form">
                <input type="number" id="reward-amount" class="admin-reward-input" placeholder="100" value="100">
                <button class="comment-submit" style="padding:4px 12px; font-size:12px;" onclick="awardBoardPoints('${selectedPostId}')">포인트 지급 댓글 달기</button>
            </div>
        `;
        document.getElementById('comments-section').appendChild(panel);
    }
}

function openScoreEliteModal() {
    const modal = document.createElement('div');
    modal.id = 'score-elite-modal';
    modal.className = 'modal-overlay open';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-box" style="max-width:480px;" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3 class="modal-title">📊 스코어엘리트 기술측정앱</h3>
                <button class="modal-close" onclick="document.getElementById('score-elite-modal').remove()">✕</button>
            </div>
            <div style="padding:24px;">
                <p style="color:var(--text-dark);font-size:14px;margin-bottom:24px;line-height:1.6;">
                    AI 카메라로 인공서핑 자세를 실시간 분석하고 기술 점수를 측정하는 앱입니다.<br>
                    아래에서 버전을 선택하세요.
                </p>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <a href="/surfing-score/" target="_blank"
                        style="display:flex;align-items:center;gap:16px;padding:20px;
                        background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.3);
                        border-radius:12px;text-decoration:none;transition:all 0.2s;"
                        onmouseover="this.style.background='rgba(6,182,212,0.15)';this.style.borderColor='var(--cyan)'"
                        onmouseout="this.style.background='rgba(6,182,212,0.08)';this.style.borderColor='rgba(6,182,212,0.3)'">
                        <div style="font-size:32px;flex-shrink:0;">🎯</div>
                        <div>
                            <div style="color:white;font-weight:800;font-size:16px;margin-bottom:4px;">스코어엘리트 기본</div>
                            <div style="color:var(--text-dark);font-size:13px;">기본 자세 분석 및 기술 점수 측정</div>
                        </div>
                        <div style="margin-left:auto;color:var(--cyan);font-size:20px;">›</div>
                    </a>
                    <a href="/surfing-score-premium/" target="_blank"
                        style="display:flex;align-items:center;gap:16px;padding:20px;
                        background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.25);
                        border-radius:12px;text-decoration:none;transition:all 0.2s;"
                        onmouseover="this.style.background='rgba(250,204,21,0.12)';this.style.borderColor='#facc15'"
                        onmouseout="this.style.background='rgba(250,204,21,0.06)';this.style.borderColor='rgba(250,204,21,0.25)'">
                        <div style="font-size:32px;flex-shrink:0;">⭐</div>
                        <div>
                            <div style="color:#facc15;font-weight:800;font-size:16px;margin-bottom:4px;">스코어엘리트 프리미엄</div>
                            <div style="color:var(--text-dark);font-size:13px;">고급 분석 · 상세 리포트 · 영상 저장</div>
                        </div>
                        <div style="margin-left:auto;color:#facc15;font-size:20px;">›</div>
                    </a>
                </div>
                <p style="color:var(--text-dark);font-size:11px;text-align:center;margin-top:16px;">
                    📱 카메라 접근 권한이 필요합니다
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function compressImage(file, maxWidth = 1200, quality = 0.82) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg', name: file.name.replace(/\.[^.]+$/, '.jpg') });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function previewBoardImages() {
    const input = document.getElementById('post-images');
    const previewEl = document.getElementById('post-image-preview');
    if (!input || !previewEl) return;
    previewEl.innerHTML = '';
    const files = Array.from(input.files).slice(0, 3);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border);';
            previewEl.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function openBoardWriteModal() {
    const session = getSession();
    if (!session) {
        alert('로그인이 필요한 서비스입니다.');
        openLoginModal();
        return;
    }

    const isKO = currentLang === 'KO';
    const modal = document.createElement('div');
    modal.id = 'board-write-modal';
    modal.className = 'modal-overlay open';
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="modal-box" style="max-width:600px;" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3 class="modal-title">${isKO ? '새 게시글 작성' : 'New Post'}</h3>
                <button class="modal-close" onclick="document.getElementById('board-write-modal').remove()">✕</button>
            </div>
            <div style="padding:24px; overflow-y:auto;">
                <div class="form-group">
                    <label>제목</label>
                    <input type="text" id="post-title" class="comment-input" style="width:100%" placeholder="제목을 입력하세요">
                </div>
                <div class="form-group">
                    <label>내용</label>
                    <textarea id="post-content" class="comment-input" style="width:100%; min-height:150px;" placeholder="인공서핑 관련 소식을 전해주세요."></textarea>
                </div>
                <div class="form-group">
                    <label>영상 링크 (유튜브, 인스타, 틱톡 등)</label>
                    <input type="text" id="post-video" class="comment-input" style="width:100%" placeholder="https://...">
                    <p style="font-size:11px; color:var(--amber); margin-top:4px;">※ 영상 링크 포함 시 500P 지급 대상이 됩니다.</p>
                </div>
                <div class="form-group">
                    <label>사진 첨부 (최대 3장)</label>
                    <input type="file" id="post-images" multiple accept="image/*" class="comment-input" style="width:100%; font-size:12px;" onchange="previewBoardImages()">
                    <div id="post-image-preview" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;"></div>
                </div>
                <div id="post-msg" style="font-size:13px; margin-bottom:16px;"></div>
                <button class="btn-primary" style="width:100%" onclick="submitBoardPost()">등록하기</button>
                <p style="font-size:11px; color:var(--text-dark); text-align:center; margin-top:12px;">하루 최대 2개까지 등록 가능하며, 홍보 글은 검토 후 포인트가 지급됩니다.</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitBoardPost() {
    const title   = $('post-title').value.trim();
    const content = $('post-content').value.trim();
    const video   = $('post-video').value.trim();
    const session = getSession();
    const fileInput = $('post-images');

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    const msg = $('post-msg');
    msg.style.color = 'var(--cyan)';
    msg.innerText = '게시글을 등록 중입니다...';

    // 이미지 압축 후 base64 변환
    let images = [];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const files = Array.from(fileInput.files).slice(0, 3);
        msg.innerText = `사진 압축 중... (${files.length}장)`;
        try {
            images = await Promise.all(files.map(f => compressImage(f)));
        } catch(e) {
            msg.style.color = 'var(--red)';
            msg.innerText = '사진 처리 중 오류가 발생했습니다.';
            return;
        }
        msg.innerText = '게시글을 등록 중입니다...';
    }

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'submitBoardPost',
                email: session.email,
                name: session.name,
                title,
                content,
                videoLink: video,
                images
            })
        });
        const result = await res.json();

        if (result.status === 'success') {
            alert('게시글이 등록되었습니다!');
            document.getElementById('board-write-modal').remove();
            fetchBoardPosts();
        } else {
            msg.style.color = 'var(--red)';
            msg.innerText = result.message || '등록 실패';
        }
    } catch (err) {
        msg.style.color = 'var(--red)';
        msg.innerText = '서버 연결 오류. 잠시 후 다시 시도해주세요.';
    }
}

async function submitBoardComment(postId) {
    const input = $('comment-input');
    const content = input.value;
    const session = getSession();

    if (!content) return;

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'submitBoardComment',
                postId,
                email: session.email,
                name: session.name,
                content
            })
        });
        const result = await res.json();
        if (result.status === 'success') {
            input.value = '';
            fetchBoardComments(postId);
        }
    } catch (err) {
        alert('댓글 등록 실패');
    }
}

async function awardBoardPoints(postId) {
    const amount = $('reward-amount').value;
    const session = getSession();
    
    if (!confirm(`${amount}P를 지급하는 댓글을 작성하시겠습니까?`)) return;

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'awardBoardPoints',
                postId,
                adminEmail: session.email,
                amount: Number(amount)
            })
        });
        const result = await res.json();
        if (result.status === 'success') {
            fetchBoardComments(postId);
            alert('포인트 지급 및 댓글 작성이 완료되었습니다.');
        }
    } catch (err) {
        alert('지급 실패');
    }
}
