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
let eduView = 'menu';
let activeShopCategory = 'all'; // 장비 스토어 카테고리 상태 추가

// ===== CONFIG =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNnUhGtxCc9hxaJDU71N0zO2Fv4R10j6Uxl9fAvLRoOeBezXqCI5zZZE_2l8w2caAyYg/exec';

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

// Global Skill Map (Technique Requirements)
const SKILL_MAP = {
    KO: {
        'Standing/Flow Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '정지 균형 10초↑', '좌우/상하 슬라럼 (각 5회)'], details: '' },
            { level: 3, skills: ['측면 점프/후방 입수 (택1)', '(남) 기술 3개↑', '(여) 기술 2개↑', '핸드플립 가산점', '콤보 가산점'], details: '* 지정 기술: 알리, 셔빗, 쓰리 셔빗, 원에이티, 본래스(패스트플랜트) 이상' },
            { level: 2, skills: ['후방 입수 (필수)', '(남) 기술 3개 (택3)', '(여) 기술 2개 (택2)', '핸드플립 가산점', '콤보 가산점'], details: '* 지정 기술: 알리, 쓰리셔빗, 능숙한 알리, 원에이티' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 3개↑', '(여) 지정 기술 3개↑', '기술 영상 (1~2분)', '강습 영상 (3~5분)'], details: '[1. 기술 영상] 1분~2분 원테이크 (입/퇴수 전후 5초 포함)<br>(남) 쓰리셔빗 이상, 킥플립 이상 기술 중 1개 필수 포함 (총 3개 이상)<br>(여) 팝셔빗, 쓰리셔빗, 원에이티, 킥플립 이상 기술 중 3개 이상<br><br>[2. 강습 영상] 3분~5분 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['전/측/후방 입수 (택1)', '원드롭니 균형 (10초↑)', '원드롭니 슬라럼 (좌우/상하 각 5회)', '원/투드롭니 360° 턴'], details: '' },
            { level: 3, skills: ['지정 기술 중 3개 포함', '콤보 가산점'], details: '* 지정 기술: 원/투드롭니 540° 스핀 이상, 바디 헬리콥터 이상(YoYo, Umbrella 등), 바디 롤 이상, 바디 로데오 이상' },
            { level: 2, skills: ['(남) 지정 기술 5개↑', '(여) 지정 기술 4개↑', '콤보 가산점'], details: '* 지정 기술: 360° 바디턴 이상, 360° 바디로데오 이상, 허브, 허브캡, 180° 셔빗 이상, 드롭니 롤 이상, 디테이 이상, 드롭니 로데오 이상' },
            { level: 1, skills: ['<span style="color:#ef4444;font-weight:700;">[필수] 영상 2개 제출</span>', '(남) 지정 기술 5개↑', '(여) 지정 기술 4개↑', '콤보 가산점', '기술 영상 (1~2분)', '강습 영상 (3~5분)'], details: '[1. 기술 영상] 1분~2분 원테이크 (입/퇴수 전후 5초 포함)<br>지정 기술: 540° 바디턴 이상, 540° 바디로데오 이상, 디테이 이상(오버로드), 디테이 프론 이상, 드롭니 로데오 이상, 드롭니 로데오 프론 이상, 180° 셔빗 이상, 허브캡(멀티) 이상<br><br>[2. 강습 영상] 3분~5분 코칭 시범 (코칭 능력, 심사, 강사 자격 실기 평가용)' }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['밸런스 탑승', '웨이크 파도 유지', '기본 자세'], details: '' },
            { level: 3, skills: ['웨이크 투 웨이크', '올리 시도', '스위치 탑승'], details: '' },
            { level: 2, skills: ['360° 스핀', '에어 시도', '래일 턴 완성'], details: '' },
            { level: 1, skills: ['에어 트릭 완성', '콤보 라이딩', '기술 시연 (1~2분)', '강습 영상 (3~5분)'], details: '[1. 기술 영상] 1분~2분 라이딩 시연<br>[2. 강습 영상] 3분~5분 코칭 가이드' }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['파도 탑승 기초', '트림 라이딩', '폼위에서 균형'], details: '' },
            { level: 3, skills: ['커팅백', '탑턴', '파도 읽기'], details: '' },
            { level: 2, skills: ['에어리얼', '튜브 라이딩 시도', '고난이도 턴'], details: '' },
            { level: 1, skills: ['에어리얼 완성', '채점 기준 이해', '심판·강사 자격', '기술 시연 (1~2분)', '강습 영상 (3~5분)'], details: '[1. 기술 영상] 1분~2분 실전 라이딩<br>[2. 강습 영상] 3분~5분 강습 시범' }
        ]
    },
    EN: {
        'Standing/Flow Board': [
            { level: 4, skills: ['Maintain basic stance', 'Straight riding', 'Ride 10sec without fall'] },
            { level: 3, skills: ['Frontside/Backside turns', 'Switch stance', 'Basic pumping'] },
            { level: 2, skills: ['Aerial attempts', '360° spin', 'Nose riding'] },
            { level: 1, skills: ['[Required] 2 Videos', 'Full aerials', 'Combo tricks', 'Tech Video (1~2 min)', 'Coaching Video (3~5 min)'] }
        ],
        'Body/Boogie Board': [
            { level: 4, skills: ['Prone position', 'Wave entry', 'Basic direction change'] },
            { level: 3, skills: ['El Rollo turns', 'Spin attempts', 'Fade ride'] },
            { level: 2, skills: ['Aerial roll attempts', '360° roll', 'High-speed control'] },
            { level: 1, skills: ['[Required] 2 Videos', 'Full aerial rolls', 'Backflip attempts', 'Tech Video (1~2 min)', 'Coaching Video (3~5 min)'] }
        ],
        'Wake Surfing': [
            { level: 4, skills: ['Balance riding', 'Wake wave sustain', 'Basic stance'] },
            { level: 3, skills: ['Wake-to-wake', 'Ollie attempts', 'Switch riding'] },
            { level: 2, skills: ['360° spin', 'Air attempts', 'Rail turn mastery'] },
            { level: 1, skills: ['Air tricks mastery', 'Combo riding', 'Tech Video (1~2 min)', 'Coaching ability (3~5 min)'] }
        ],
        'Wave Surfing': [
            { level: 4, skills: ['Basic wave riding', 'Trim riding', 'Balance on foam'] },
            { level: 3, skills: ['Cutback', 'Top turn', 'Wave reading'] },
            { level: 2, skills: ['Aerial', 'Tube riding attempt', 'Advanced turns'] },
            { level: 1, skills: ['Full aerials', 'Scoring criteria', 'Judge & instructor (1~2 min / 3~5 min)'] }
        ]
    }
};

// Utility
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log("[ISA] App Initializing...");
    
    // 기본 선택 상태 설정
    if (typeof DISCIPLINES !== 'undefined' && DISCIPLINES.length > 0) {
        selectedDiscipline = DISCIPLINES[0];
    }
    
    // 푸터 연도
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();

    // 초기 실행 순서 조정: 언어 UI 업데이트 후 라우팅
    updateLangUI(); 
    handleRoute();
    
    window.addEventListener('hashchange', handleRoute);
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
    safeSet('nav-title', t.common.appName);
    safeSet('gov-culture', t.common.govCulture);
    safeSet('gov-coast', t.common.govCoast);
    
    ['cert', 'insurance', 'shop', 'map', 'edu'].forEach(key => {
        safeSet(`nav-${key}`, t.nav[key]);
        safeSet(`m-nav-${key}`, t.nav[key]);
    });

    ['event', 'notice', 'appcheck', 'certcheck'].forEach(key => {
        const labelText = t.quick[key === 'appcheck' ? 'appCheck' : key === 'certcheck' ? 'certCheck' : key];
        safeSet(`q-${key}`, labelText);
        safeSet(`mb-${key}`, labelText);
    });

    safeSet('footer-org', t.common.appName);
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
        { title: t.cert.step1, desc: t.cert.step1Desc, status: 'completed', icon: '✔' },
        { title: t.cert.step2, desc: t.cert.step2Desc, status: 'current', icon: '📝' },
        { title: t.cert.step3, desc: t.cert.step3Desc, status: 'active-form', icon: '🎥' },
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
                        
                        <!-- 종목별 기술 요구사항 알림판 -->
                        <div style="background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.3); border-radius:8px; padding:12px; margin-bottom:4px;">
                            <h5 style="color:var(--cyan); font-size:12px; margin:0 0 8px; font-weight:800;">📋 ${selectedDiscipline} Level ${selectedLevel} 기술 요구사항</h5>
                            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                                ${(SKILL_MAP[currentLang][selectedDiscipline]?.find(sk => sk.level === selectedLevel)?.skills || []).map(sk => 
                                    `<span style="font-size:11px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:2px 8px; color:#cbd5e1;">${sk}</span>`
                                ).join('')}
                            </div>
                            <p style="font-size:11px; color:#94a3b8; line-height:1.5; margin:0;">
                                ${SKILL_MAP[currentLang][selectedDiscipline]?.find(sk => sk.level === selectedLevel)?.details || ''}
                            </p>
                        </div>

                        ${selectedLevel === 1 ? `
                            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:12px;margin-bottom:8px;">
                                <p style="color:#f87171;font-size:12px;margin:0;font-weight:700;line-height:1.5;">🚨 1급 필수 안내<br>1급은 심사 및 강사 자격 부여를 위해 본인의 기술 시연 영상(1~2분)과 실제 코칭 영상(3~5분) 총 2개가 필요합니다.</p>
                            </div>
                            <label style="color:white;font-size:12px;margin-bottom:-4px;">📁 1. 기술 영상 업로드 (1분~2분 원테이크)</label>
                            <input type="text" id="youtube-url-tech" placeholder="기술 영상 YouTube 링크 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                            <br>
                            <label style="color:white;font-size:12px;margin-top:8px;margin-bottom:-4px;display:block;">📁 2. 강습 영상 업로드 (3분~5분 코칭 시범)</label>
                            <input type="text" id="youtube-url-coach" placeholder="강습 영상 YouTube 링크 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px;margin-top:4px;">
                        ` : `
                            <input type="text" id="youtube-url" placeholder="YouTube 링크 (URL) 입력" 
                                   style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:4px;color:white;font-size:13px">
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
                    <p style="font-size:11px; color:var(--text-dim); margin-top:8px;">${isKO ? '* 실기 이수시간(이용료) 별도' : '* Practice fee not included'}</p>

                    <!-- 결제 전 동의 체크박스 -->
                    <div class="cert-agree-box" style="margin-top:16px">
                        <p style="font-size:12px;color:var(--text-dark);margin-bottom:10px;font-weight:700">${isKO ? '📌 결제 전 필수 동의사항' : '📌 Required Agreements Before Payment'}</p>
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
// ===== SHOP PAGE (Integrated Full Version) =====
function renderShopPage() {
    if (typeof LANG === 'undefined' || typeof SHOP_DATA === 'undefined') return '';
    const t = LANG[currentLang].shop;

    // 카테고리 탭 생성
    const categoriesHTML = t.categories.map(cat => `
        <button class="discipline-tab ${activeShopCategory === cat.id ? 'active' : ''}" 
                style="padding: 10px 20px; font-size: 13px;"
                onclick="setShopCategory('${cat.id}')">
            ${cat.icon ? cat.icon + ' ' : ''}${cat.name}
        </button>
    `).join('');

    // 상품 필터링
    let filtered = SHOP_DATA;
    if (activeShopCategory !== 'all') {
        filtered = SHOP_DATA.filter(p => p.cat === activeShopCategory);
    }

    // 상품 카드 생성
    const productsHTML = filtered.length === 0 
        ? `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-dark);">${t.empty}</div>`
        : filtered.map((p, index) => {
            const isPartner = ['coupang', 'olive'].includes(p.cat);
            const tagText = p.tag ? p.tag[currentLang] : '';
            const descText = p.desc[currentLang];
            
            const btnHTML = isPartner 
                ? `<a href="${p.link}" target="_blank" class="hero-btn-primary" style="width:100%; justify-content:center; transform:none; margin-top:16px; font-size:13px; padding:10px;"><span>${t.btnPartner}</span></a>`
                : `<button class="hero-btn-secondary" style="width:100%; justify-content:center; transform:none; margin-top:16px; font-size:13px; padding:10px;" onclick="alert('${currentLang === 'KO' ? '구매 시스템 준비 중입니다.' : 'Payment system coming soon.'}')"><span>${t.btnBuy}</span></button>`;

            const tagHTML = tagText ? `<div style="position:absolute; top:12px; right:12px; padding:4px 8px; background:var(--cyan); color:black; font-size:10px; font-weight:900; border-radius:4px; z-index:2;">${tagText}</div>` : '';

            return `
            <div class="level-card glass-panel page-enter" style="padding:0; overflow:hidden; animation-delay: ${index * 0.05}s">
                <div style="position:relative; aspect-ratio:4/3; background:url('${p.img}') center/cover no-repeat;">
                    <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
                    ${tagHTML}
                </div>
                <div style="padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <h3 style="font-size:16px; color:white;">${p.name}</h3>
                        <span style="color:var(--cyan); font-weight:700;">★ ${p.rating}</span>
                    </div>
                    <p style="font-size:13px; color:var(--text-dark); line-height:1.5; height:40px; overflow:hidden;">${descText}</p>
                    <div style="margin-top:16px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:18px; font-weight:900; color:white;">₩${p.price.toLocaleString()}</span>
                    </div>
                    ${btnHTML}
                </div>
            </div>`;
        }).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-dark)">
        <div class="hero-bg" style="opacity: 0.3;"></div>
        <div class="content-container" style="position:relative; z-index:1;">
            <div style="text-align:center; margin-bottom:48px;">
                <h2 class="section-title game-font">${currentLang === 'KO' ? '장비 스토어' : 'Equipment Store'}</h2>
                <p class="section-subtitle">${t.heroDesc}</p>
            </div>
            
            <div class="discipline-tabs" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));">
                ${categoriesHTML}
            </div>

            <div class="level-grid" style="margin-top:32px;">
                ${productsHTML}
            </div>
        </div>
    </section>`;
}

function setShopCategory(catId) {
    activeShopCategory = catId;
    renderPage('shop');
}

// ===== MAP & EDU & INTRO (CLAUDE STATIC FALLBACKS) =====
function renderMapPage() {
    return `
    <section class="page-section page-enter">
        <div class="content-container text-center" style="padding: 100px 20px">
            <h2 class="game-font" style="font-size:32px; color:var(--cyan)">Map</h2>
            <p style="color:white; margin-top:20px;">${currentLang === 'KO' ? '인공서핑장 위치정보 준비 중입니다.' : 'Locations map is coming soon.'}</p>
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
    const t = LANG[currentLang];
    const isKO = currentLang === 'KO';
    const di = DISCIPLINE_INFO[currentLang];
    const skillMap = SKILL_MAP[currentLang];

    // YouTube 영상 ID 매핑 (각 종목별 대표 공식 영상)
    const videoIds = {
        'Standing/Flow Board': 'tKqkAvRosjU',
        'Body/Boogie Board':   'GApyFj5HdDA',
        'Wake Surfing':        'qgM5jWGOrSE',
        'Wave Surfing':        'KDrMcJfB-eU'
    };

    // 등급별 기술 요구사항은 전역 SKILL_MAP을 사용합니다.

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
                        <li><strong>영상 촬영:</strong> 1분 ~ 1분 30초 원테이크 (입수 전 5초, 퇴수 후 5초 반드시 포함)</li>
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
    // 동의 체크박스 확인
    const agreeNoRefund = document.getElementById('agree-no-refund');
    const agree48hr = document.getElementById('agree-48hr');
    const agree1year = document.getElementById('agree-1year');
    
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
    const msg = currentLang === 'KO' 
        ? `✅ 결제 금액: ₩${feePrice.toLocaleString()}\n\n⚠️ 결제 후 환불이 절대 불가합니다.\n⏰ 결제 후 48시간 이내 필기시험을 응시해야 합니다.\n\n결제를 진행하시겠습니까?`
        : `✅ Payment: ₩${feePrice.toLocaleString()}\n\n⚠️ No refunds after payment.\n⏰ You must take the exam within 48 hours.\n\nProceed with payment?`;
    
    if (confirm(msg)) {
        // 결제 완료 처리 (실제 PG사 연동 전 임시 저장)
        localStorage.setItem(`isa_exam_paid_${user.email}_lv${selectedLevel}`, JSON.stringify({
            level: selectedLevel,
            discipline: selectedDiscipline,
            paidAt: new Date().toISOString(),
            fee: feePrice
        }));
        alert(currentLang === 'KO' 
            ? `✅ 결제가 완료되었습니다!\n\n📌 필기시험 응시 가능 시간: ${new Date(Date.now() + 48*3600000).toLocaleString()} 까지\n\n아래 링크에서 바로 응시하실 수 있습니다:\nhttps://isa-web-portal.vercel.app/exam`
            : `✅ Payment successful!\n\n📌 You can take the exam until: ${new Date(Date.now() + 48*3600000).toLocaleString()}\n\nYou can take the exam at:\nhttps://isa-web-portal.vercel.app/exam`);
        renderPage('cert');
    }
}

function certRetakeCheck() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }
    
    const hasPaid = localStorage.getItem(`isa_exam_paid_${user.email}_lv${selectedLevel}`);
    const hasFailed = localStorage.getItem(`isa_exam_fail_${user.email}_lv${selectedLevel}`);
    
    if (!hasPaid || !hasFailed) {
        alert(currentLang === 'KO' 
            ? '재응시는 기준 응시료를 결제하고 필기시험에 통과하지 못한 응시자만 가능합니다.'
            : 'Retake is only available for applicants who paid the standard fee but did not pass the written exam.');
        return;
    }
    
    const msg = currentLang === 'KO'
        ? '재응시료 ₩10,000을 결제하시겠습니까?\n\n⏰ 결제 후 48시간 이내 필기시험을 응시해야 합니다.'
        : 'Pay retake fee of ₩10,000?\n\n⏰ You must take the exam within 48 hours of payment.';
    
    if (confirm(msg)) {
        // 재응시 결제 완료 처리
        localStorage.setItem(`isa_exam_paid_${user.email}_lv${selectedLevel}`, JSON.stringify({
            level: selectedLevel,
            discipline: selectedDiscipline,
            paidAt: new Date().toISOString(),
            fee: 10000,
            isRetake: true
        }));
        localStorage.removeItem(`isa_exam_fail_${user.email}_lv${selectedLevel}`);
        alert(currentLang === 'KO'
            ? '✅ 재응시 결제가 완료되었습니다!\n\n아래 링크에서 바로 응시하실 수 있습니다:\nhttps://isa-web-portal.vercel.app/exam'
            : '✅ Retake payment successful!\n\nYou can take the exam at:\nhttps://isa-web-portal.vercel.app/exam');
        renderPage('cert');
    }
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
        { date: '2026.04.10', title: isKO ? '2026년 2분기 자격검정 일정 공고' : '2026 Q2 Certification Exam Schedule' },
        { date: '2026.03.25', title: isKO ? '실기평가 업로드 시스템 개선 안내' : 'Practical Evaluation Upload System Improvement' },
        { date: '2026.03.15', title: isKO ? '필기시험 재응시 제도 시행 안내' : 'Written Exam Retake Policy Notice' },
        { date: '2026.02.28', title: isKO ? '국제인공서핑협회 공식 인증 강사 목록 공개' : 'Official Certified Instructor List Released' },
    ];
    return `<div class="quick-list">${notices.map(n => `<div class="quick-item"><div class="date">${n.date}</div><div class="title">${n.title}</div></div>`).join('')}</div>`;
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
function getSession() { 
    try { return JSON.parse(localStorage.getItem('isa_session_v1')); } 
    catch(e) { return null; }
}
function updateNavbarAuth(user) {
    const btn = document.querySelector('.login-btn');
    if (!btn) return;
    if (user && user.name) {
        btn.innerHTML = `<span style="font-size:12px;background:var(--cyan);color:black;padding:2px 8px;border-radius:999px;font-weight:900">${user.name.charAt(0)}</span> ${user.name}`;
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
        const email = $('login-email')?.value;
        const phone = $('signup-phone')?.value;
        const birth = $('signup-birth')?.value;
        const gender = $('signup-gender')?.value;
        const password = $('login-password')?.value;
        const confirm = $('signup-pw-confirm')?.value;
        const agree = $('signup-agree')?.checked;

        if (!name || !email || !password) { alert('필수 정보를 입력해주세요.'); return; }
        if (password !== confirm) { alert('비밀번호가 일치하지 않습니다.'); return; }
        if (!agree) { alert('개인정보 약관에 동의해주세요.'); return; }

        if (!GOOGLE_SCRIPT_URL) {
            // URL이 없으면 테스트용 로컬 저장만 수행
            console.warn('GOOGLE_SCRIPT_URL이 설정되지 않았습니다. 테스트 모드로 작동합니다.');
            localStorage.setItem('isa_session_v1', JSON.stringify({ name, email }));
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
                    alert('회원가입이 완료되었습니다!');
                    localStorage.setItem('isa_session_v1', JSON.stringify(result.data));
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
            localStorage.setItem('isa_session_v1', JSON.stringify({ name: email.split('@')[0], email }));
        } else {
            try {
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=login&email=${email}&password=${password}`);
                const result = await response.json();
                if (result.status === 'success') {
                    localStorage.setItem('isa_session_v1', JSON.stringify(result.data));
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

window.toggleLoginMode = function() {
    isLoginMode = !isLoginMode;
    const tf = $('login-title'); if(tf) tf.textContent = isLoginMode ? '로그인' : '회원가입';
    const tt = $('login-toggle-text'); if(tt) tt.textContent = isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인';
    const sf = $('signup-fields'); if(sf) sf.style.display = isLoginMode ? 'none' : 'block';
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
    localStorage.removeItem('isa_session_v1');
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

// 실명인증 방식 선택
window.selectAuthMethod = function(method) {
    const methods = ['pass', 'kakao', 'naver', 'toss', 'sms'];
    methods.forEach(m => {
        const btn = document.getElementById(`auth-${m}`);
        if (btn) btn.classList.remove('selected');
    });
    const selected = document.getElementById(`auth-${method}`);
    if (selected) selected.classList.add('selected');
    
    const pgNotice = document.getElementById('auth-pg-notice');
    const smsSection = document.querySelector('.auth-divider');
    const phoneGroup = document.getElementById('label-phone')?.closest('.form-group');
    
    if (method !== 'sms') {
        // PG사 연동 필요 방식
        if (pgNotice) pgNotice.style.display = 'block';
        alert(currentLang === 'KO'
            ? `⚠️ ${method.toUpperCase()} 인증은 PG사(나이스페이먼츠 또는 KG이니시스) 계약 후 활성화됩니다.\n\n현재는 SMS 문자 인증을 이용해주세요.\n\nPG사 연동이 완료되면 해당 인증 방식을 사용하실 수 있습니다.`
            : `⚠️ ${method.toUpperCase()} authentication requires a PG provider contract (NicePayments or KG Inicis).\n\nPlease use SMS verification for now.`);
        // SMS로 자동 선택 유지
        document.getElementById('auth-sms')?.classList.add('selected');
        selected?.classList.remove('selected');
    } else {
        if (pgNotice) pgNotice.style.display = 'none';
    }
};

// ===== PROFILE MODAL & LOGBOOK =====
function openProfileModal() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }
    
    $('profile-name').textContent = user.name;
    $('profile-email').textContent = user.email;
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
