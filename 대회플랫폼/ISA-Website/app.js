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
            case 'insurance': window.location.href = 'http://localhost:8081'; break;
            case 'map': content.innerHTML = renderMapPage(); break;
            case 'edu': content.innerHTML = renderEduPage(); break;
            case 'intro': content.innerHTML = renderIntroPage(); break;
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
            <div class="hero-stat-label">${t.hero.waveHeight}</div>
            <div class="hero-stat-value game-font">1.8 M</div>
        </div>
        <div class="hero-stat temp glass-panel animate-pulse">
            <div class="hero-stat-label">${t.hero.waterTemp}</div>
            <div class="hero-stat-value game-font">26°C</div>
        </div>
    </section>`;
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
    const steps = [
        { title: t.cert.step1, desc: t.cert.step1Desc, status: 'completed', icon: '✔' },
        { title: t.cert.step2, desc: t.cert.step2Desc, status: 'current', icon: '📝' },
        { title: t.cert.step3, desc: t.cert.step3Desc, status: 'locked', icon: '🏄' },
        { title: t.cert.step4, desc: t.cert.step4Desc, status: 'locked', icon: '🏆' }
    ];

    const stepsHTML = steps.map(s => `
        <div class="process-step ${s.status}">
            <div class="step-icon">${s.icon}</div>
            <div class="step-content">
                <h4>${s.title}</h4>
                <p>${s.desc}</p>
            </div>
        </div>
    `).join('');

    return `
    <section class="page-section page-enter">
        <div class="content-container">
            <button class="back-btn" onclick="selectedLevel=null;renderPage('cert')">← Back to List</button>
            <div class="cert-detail-grid">
                <div class="glass-panel" style="padding:24px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
                        <div>
                            <h3 class="game-font" style="color:white; font-size:20px">${selectedDiscipline}</h3>
                            <p style="color:var(--cyan);font-weight:700">Level ${selectedLevel} ${t.cert.processTitle}</p>
                        </div>
                        <span style="padding:4px 12px;background:rgba(234,179,8,0.2);color:#facc15;border-radius:4px">${currentLang === 'KO' ? '진행 중' : 'In Progress'}</span>
                    </div>
                    <div class="process-steps">${stepsHTML}</div>
                </div>
                
                <div class="fee-panel glass-panel">
                    <h3 style="color:white;margin-bottom:16px">${t.cert.examFee}</h3>

                    <!-- 강사 선택 동적 폼 -->
                    <div style="margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; border: 1px solid rgba(6,182,212,0.2);">
                        <h4 style="color: white; font-size: 14px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                            ${currentLang === 'KO' ? '강습 방식 선택' : 'Instruction Type'}
                            <span style="font-size: 11px; color: var(--cyan); background: rgba(6,182,212,0.1); padding: 2px 6px; border-radius: 4px; font-weight: normal;">
                                ${currentLang === 'KO' ? '강사 지원금 환급 대상' : 'Eligible for Rebate'}
                            </span>
                        </h4>
                        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="self" checked onchange="document.getElementById('instructor-fields').style.display='none'" style="accent-color: var(--cyan);">
                                ${currentLang === 'KO' ? '독학' : 'Self-taught'}
                            </label>
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="instructor" onchange="document.getElementById('instructor-fields').style.display='flex'" style="accent-color: var(--cyan);">
                                ${currentLang === 'KO' ? '전담 강사 있음' : 'With Instructor'}
                            </label>
                        </div>
                        
                        <!-- 강사 정보 필드 (기본 숨김) -->
                        <div id="instructor-fields" style="display: none; flex-direction: column; gap: 10px;">
                            <p style="font-size: 11px; color: var(--text-dim); margin-bottom: 4px;">${currentLang === 'KO' ? '※ 정식 자격증 보유 강사에게 강습을 받은 경우, 해당 강사에게 협회 차원의 강습료가 별도 지급됩니다.' : '※ If trained by a certified instructor, they will receive an instruction fee from the association.'}</p>
                            <input type="text" id="inst-name" placeholder="${currentLang === 'KO' ? '강사 이름 (Name)' : 'Instructor Name'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <input type="text" id="inst-cert" placeholder="${currentLang === 'KO' ? '강사 자격증 번호 (Cert No.)' : 'Certification No.'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                            <input type="tel" id="inst-phone" placeholder="${currentLang === 'KO' ? '강사 연락처 (Phone)' : 'Contact Number'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white;">
                        </div>
                    </div>

                    <div class="row" style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--text-dim);"><span>${currentLang === 'KO' ? '인적사항 및 서류 심사' : 'Document Review'}</span><span style="color:white;">Included</span></div>
                    <div class="row" style="display:flex; justify-content:space-between; margin-bottom:16px; color:var(--text-dim);"><span>${currentLang === 'KO' ? '발급 수수료' : 'Issuance Fee'}</span><span style="color:white;">Included</span></div>
                    <div style="height:1px; background:var(--border); margin-bottom:16px;"></div>

                    <div class="fee-total" style="display:flex; justify-content:space-between; align-items:center; font-size:20px; font-weight:bold; color:var(--cyan);">
                        <span>Total</span>
                        <span>₩${feePrice.toLocaleString()}</span>
                    </div>
                    <p style="font-size:11px; color:var(--text-dim); margin-top:8px;">${currentLang === 'KO' ? '* 실기 이수시간(이용료) 별도' : '* Practice fee not included'}</p>
                    
                    <button class="btn-primary" style="width:100%;margin-top:20px; padding:14px; font-size:16px; font-weight:bold;" onclick="certApplyCheck()">${t.cert.applyExam}</button>
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
            <div style="font-size: 60px; margin-bottom: 20px;">🏄‍♂️</div>
            <h2 class="game-font " style="font-size:32px; color:white; margin-bottom:16px; letter-spacing:1px;">ISA Official Store</h2>
            <p style="color:var(--text-dim); font-size:16px; margin-bottom: 40px; line-height:1.8;">
                ${currentLang === 'KO' ? 
                '국제인공서핑협회 장비스토어가 <b>새로운 프리미엄 플랫폼</b>으로 단장했습니다.<br>지금 접속하여 쿠팡 및 올리브영 제휴 혜택을 만나보세요!' : 
                'The ISA equipment store has been revamped into a <b>new premium platform.</b><br>Visit now to explore exclusive partner benefits and gear!'}
            </p>
            <a href="http://localhost:8083" target="_blank" style="display:inline-block; padding: 16px 40px; background: var(--cyan); color: #000; font-weight: 800; border-radius: 999px; font-size: 18px; text-decoration: none; box-shadow: 0 0 20px rgba(6,182,212,0.4); border: 2px solid var(--cyan);">
                ${currentLang === 'KO' ? '장비스토어 입장하기 →' : 'Enter Official Store →'}
            </a>
        </div>
    </section>`;
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
    return `
    <section class="page-section page-enter">
        <div class="content-container text-center" style="padding: 100px 20px">
            <h2 class="game-font" style="font-size:32px; color:var(--cyan)">Education</h2>
            <p style="color:white; margin-top:20px;">${currentLang === 'KO' ? '교육 매칭 및 아카데미 시스템 준비 중입니다.' : 'Education and matching system coming soon.'}</p>
        </div>
    </section>`;
}

function renderIntroPage() {
    return `
    <section class="page-section page-enter">
        <div class="content-container text-center" style="padding: 100px 20px">
            <h2 class="game-font" style="font-size:32px; color:white;">ISA Overview</h2>
            <p style="color:var(--text-dim); margin-top:20px;">Welcome to International Artificial Surfing Association.</p>
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
    openPracticalModal();
}

// ===== 실기 평가 접수 모달 =====
function openPracticalModal() {
    const existing = document.getElementById('practical-modal');
    if (existing) existing.remove();

    const user = getSession();
    const logbook = getLogbook();
    const approvedHours = logbook.filter(e => e.status === 'approved').reduce((s, e) => s + e.hours, 0);
    const requiredHours = selectedLevel >= 3 ? (selectedLevel === 4 ? 4 : 8) : (selectedLevel === 2 ? 20 : 50);

    const modal = document.createElement('div');
    modal.id = 'practical-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
    <div class="modal-box" style="max-width:520px;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">
        <div class="modal-header">
            <h3 class="modal-title game-font">🏄 실기 평가 접수</h3>
            <button class="modal-close" onclick="closePracticalModal()">✕</button>
        </div>
        <div style="padding:24px">
            <!-- 훈련 시간 현황 -->
            <div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.25);border-radius:12px;padding:16px;margin-bottom:20px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <span style="color:#94a3b8;font-size:13px">누적 승인 훈련 시간</span>
                    <span style="font-size:13px;color:${approvedHours >= requiredHours ? '#4ade80' : '#fbbf24'}">
                        ${approvedHours >= requiredHours ? '✅ 응시 가능' : '⚠️ 시간 부족'}
                    </span>
                </div>
                <div style="font-size:28px;font-weight:900;color:var(--cyan)">${approvedHours}시간 <span style="font-size:14px;color:#94a3b8;font-weight:400">/ 필요 ${requiredHours}시간</span></div>
                <div style="margin-top:10px;background:rgba(0,0,0,0.3);border-radius:99px;height:6px;overflow:hidden">
                    <div style="height:100%;width:${Math.min(100, (approvedHours/requiredHours)*100)}%;background:linear-gradient(90deg,var(--cyan),#2563eb);border-radius:99px;transition:width 0.5s"></div>
                </div>
                ${approvedHours < requiredHours ? `<p style="font-size:11px;color:#fbbf24;margin-top:8px">⚠️ 훈련 시간이 부족합니다. 로그북에 기록을 추가하고 관리자 승인을 받으세요.</p>` : ''}
            </div>

            <div style="display:flex;flex-direction:column;gap:16px">
                <!-- 응시 종목 -->
                <div>
                    <label style="display:block;color:#94a3b8;font-size:13px;margin-bottom:6px">응시 종목</label>
                    <input type="text" value="${selectedDiscipline} — Level ${selectedLevel}" readonly style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:8px;color:#64748b;font-size:14px">
                </div>

                <!-- 응시자 이름 -->
                <div>
                    <label style="display:block;color:#94a3b8;font-size:13px;margin-bottom:6px">응시자 이름</label>
                    <input type="text" id="pa-name" value="${user?.name || ''}" placeholder="이름을 입력하세요" style="width:100%;padding:10px 14px;background:rgba(30,41,59,0.6);border:1px solid var(--border);border-radius:8px;color:white;font-size:14px;outline:none">
                </div>

                <!-- YouTube 링크 (필수) -->
                <div>
                    <label style="display:block;color:#94a3b8;font-size:13px;margin-bottom:6px">
                        실기 영상 YouTube 링크 <span style="color:#ef4444">*필수</span>
                    </label>
                    <div style="position:relative">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:18px">▶️</span>
                        <input type="url" id="pa-youtube" placeholder="https://youtube.com/watch?v=..." 
                            style="width:100%;padding:10px 14px 10px 40px;background:rgba(30,41,59,0.6);border:1px solid var(--border);border-radius:8px;color:white;font-size:14px;outline:none"
                            oninput="validateYouTubeInput(this)">
                    </div>
                    <p id="pa-yt-error" style="font-size:11px;color:#ef4444;margin-top:4px;display:none">유효한 YouTube URL을 입력해주세요. (youtube.com 또는 youtu.be)</p>
                    <p style="font-size:11px;color:#fbbf24;margin-top:5px">📢 영상의 공개 설정은 반드시 <b style="color:white">'일부 공개'</b>로 설정한 후 링크를 제출해 주세요.</p>
                </div>

                <!-- 추가 메모 -->
                <div>
                    <label style="display:block;color:#94a3b8;font-size:13px;margin-bottom:6px">추가 메모 (선택)</label>
                    <textarea id="pa-memo" rows="2" placeholder="심사관에게 전달할 내용을 입력하세요" style="width:100%;padding:10px 14px;background:rgba(30,41,59,0.6);border:1px solid var(--border);border-radius:8px;color:white;font-size:14px;outline:none;resize:vertical"></textarea>
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-top:24px">
                <button onclick="closePracticalModal()" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:10px;color:#94a3b8;font-weight:700;cursor:pointer">취소</button>
                <button onclick="submitPracticalApply()" style="flex:1;padding:12px;background:linear-gradient(135deg,var(--cyan),#2563eb);border:none;border-radius:10px;color:white;font-weight:900;cursor:pointer;font-size:15px">접수 완료 →</button>
            </div>
        </div>
    </div>`;

    modal.addEventListener('click', closePracticalModal);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closePracticalModal() {
    const m = document.getElementById('practical-modal');
    if (m) m.remove();
}

function validateYouTubeInput(input) {
    const val = input.value.trim();
    const isValid = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(val);
    const errEl = document.getElementById('pa-yt-error');
    if (errEl) errEl.style.display = (val.length > 5 && !isValid) ? 'block' : 'none';
    input.style.borderColor = (val.length > 5 && !isValid) ? '#ef4444' : 'rgba(255,255,255,0.1)';
}

async function submitPracticalApply() {
    const user = getSession();
    const name = document.getElementById('pa-name')?.value.trim();
    const ytUrl = document.getElementById('pa-youtube')?.value.trim();
    const memo = document.getElementById('pa-memo')?.value.trim();

    if (!name) { alert('이름을 입력해주세요.'); return; }
    if (!ytUrl) { alert('YouTube 영상 링크는 필수입니다.'); return; }

    const isValidYT = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(ytUrl);
    if (!isValidYT) { alert('유효한 YouTube URL을 입력해주세요.'); return; }

    const logbook = getLogbook();
    const approvedHours = logbook.filter(e => e.status === 'approved').reduce((s, e) => s + e.hours, 0);

    const applyData = {
        id: 'PA-' + Date.now().toString(36).toUpperCase(),
        name, email: user?.email || '',
        discipline: selectedDiscipline,
        level: selectedLevel,
        youtubeUrl: ytUrl,
        memo,
        approvedHours,
        appliedAt: new Date().toISOString()
    };

    // 로컬 저장
    const history = JSON.parse(localStorage.getItem('isa_practical_applies') || '[]');
    history.push(applyData);
    localStorage.setItem('isa_practical_applies', JSON.stringify(history));

    // 텔레그램 알림 발송
    await sendTelegramNotification(applyData);

    closePracticalModal();
    showApplySuccess(applyData);
}

function showApplySuccess(data) {
    const m = document.createElement('div');
    m.className = 'modal-overlay open';
    m.style.zIndex = '1001';
    m.innerHTML = `
    <div class="modal-box" style="max-width:420px;text-align:center;padding:40px 32px" onclick="event.stopPropagation()">
        <div style="font-size:64px;margin-bottom:16px">🎉</div>
        <h3 class="game-font" style="color:white;font-size:22px;margin-bottom:8px">접수 완료!</h3>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:20px">실기 평가 접수가 완료되었습니다.<br>심사 결과는 이메일로 안내드립니다.</p>
        <div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:10px;padding:14px;margin-bottom:24px;text-align:left">
            <div style="font-size:12px;color:#64748b;margin-bottom:4px">접수 번호</div>
            <div style="font-family:monospace;color:var(--cyan);font-weight:700">${data.id}</div>
        </div>
        <button onclick="this.closest('.modal-overlay').remove()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--cyan),#2563eb);border:none;border-radius:10px;color:white;font-weight:900;cursor:pointer;font-size:15px">확인</button>
    </div>`;
    m.addEventListener('click', () => m.remove());
    document.body.appendChild(m);
}

// ===== 텔레그램 알림 =====
async function sendTelegramNotification(data) {
    // ⚠️ 아래 값을 실제 Bot Token과 Chat ID로 변경하세요
    const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
    const CHAT_ID = 'YOUR_CHAT_ID_HERE';

    if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') return; // 미설정 시 스킵

    const logbook = getLogbook();
    const adminUrl = `https://isa-web-portal.vercel.app/admin.html?user=${encodeURIComponent(data.email)}`;

    const msg = `
🏄 *실기 평가 접수 알림*

👤 *응시자:* ${data.name}
📧 *이메일:* ${data.email}
🎯 *종목:* ${data.discipline} — Level ${data.level}
⏱️ *누적 훈련시간:* ${data.approvedHours}시간 (승인 완료 기준)
📅 *접수일시:* ${new Date(data.appliedAt).toLocaleString('ko-KR')}
${data.memo ? `📝 *메모:* ${data.memo}` : ''}

▶️ *실기 영상:*
${data.youtubeUrl}

📋 *관리자 유저 상세 보기:*
${adminUrl}
    `.trim();

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
        });
    } catch (e) {
        console.warn('텔레그램 알림 실패:', e);
    }
}

// ===== 디지털 로그북 =====
function getLogbook() {
    try { return JSON.parse(localStorage.getItem('isa_logbook_v1') || '[]'); }
    catch(e) { return []; }
}
function saveLogbook(data) {
    localStorage.setItem('isa_logbook_v1', JSON.stringify(data));
}

function openLogbookModal() {
    const user = getSession();
    if (!user) { alert('로그인이 필요합니다.'); openLoginModal(); return; }

    const existing = document.getElementById('logbook-modal');
    if (existing) existing.remove();

    renderLogbookModal();
}

function renderLogbookModal(view = 'list') {
    const logbook = getLogbook();
    const approvedHours = logbook.filter(e => e.status === 'approved').reduce((s, e) => s + e.hours, 0);
    const pendingHours = logbook.filter(e => e.status === 'pending').reduce((s, e) => s + e.hours, 0);

    const HEIC_WARNING = `<div id="heic-warn" style="display:none;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);border-radius:8px;padding:12px;margin-top:8px">
        <p style="color:#fbbf24;font-size:12px">⚠️ HEIC 파일은 지원되지 않습니다. iPhone 설정 → 카메라 → 포맷 → '가장 호환성 높은 형식'으로 변경하거나 JPG/PNG로 변환 후 업로드해주세요.</p>
    </div>`;

    const addForm = `
    <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:20px">
        <h4 style="color:white;font-size:14px;margin-bottom:16px">➕ 훈련 기록 추가</h4>
        <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">훈련 일자 *</label>
                    <input type="date" id="lb-date" style="width:100%;padding:8px 10px;background:rgba(30,41,59,0.8);border:1px solid var(--border);border-radius:8px;color:white;font-size:13px;outline:none">
                </div>
                <div>
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">훈련 시간 *</label>
                    <select id="lb-hours" style="width:100%;padding:8px 10px;background:rgba(30,41,59,0.8);border:1px solid var(--border);border-radius:8px;color:white;font-size:13px;outline:none">
                        ${[1,2,3,4,5,6,7,8].map(h => `<option value="${h}">${h}시간</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">훈련 장소 *</label>
                <input type="text" id="lb-place" placeholder="예: Wave Park 시흥" style="width:100%;padding:8px 10px;background:rgba(30,41,59,0.8);border:1px solid var(--border);border-radius:8px;color:white;font-size:13px;outline:none">
            </div>
            <div>
                <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">증빙 자료 첨부 (최대 3장, JPG/PNG/PDF, 각 10MB 이하)</label>
                <input type="file" id="lb-files" accept=".jpg,.jpeg,.png,.pdf,.heic,.heif" multiple 
                    style="width:100%;padding:8px;background:rgba(30,41,59,0.8);border:1px solid var(--border);border-radius:8px;color:#94a3b8;font-size:12px"
                    onchange="validateLogbookFiles(this)">
                ${HEIC_WARNING}
                <p id="lb-file-error" style="font-size:11px;color:#ef4444;margin-top:4px;display:none"></p>
            </div>
            <button onclick="addLogbookEntry()" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--cyan),#2563eb);border:none;border-radius:8px;color:white;font-weight:700;cursor:pointer;font-size:14px">기록 저장</button>
        </div>
    </div>`;

    const statusBadge = (s) => s === 'approved' 
        ? `<span style="padding:2px 8px;background:rgba(74,222,128,0.15);color:#4ade80;border-radius:99px;font-size:11px;font-weight:700;border:1px solid rgba(74,222,128,0.3)">✅ 승인 완료</span>`
        : `<span style="padding:2px 8px;background:rgba(251,191,36,0.15);color:#fbbf24;border-radius:99px;font-size:11px;font-weight:700;border:1px solid rgba(251,191,36,0.3)">⏳ 승인 대기</span>`;

    const entries = logbook.length === 0 
        ? `<div style="text-align:center;padding:32px;color:#475569"><p style="font-size:32px">📋</p><p style="margin-top:8px;font-size:14px">아직 훈련 기록이 없습니다.</p></div>`
        : logbook.slice().reverse().map((e, i) => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div style="color:white;font-weight:600;font-size:14px">${e.date} · ${e.place}</div>
                        <div style="color:var(--cyan);font-size:13px;margin-top:2px">${e.hours}시간 ${e.fileCount > 0 ? `· 📎 ${e.fileCount}개 첨부` : ''}</div>
                    </div>
                    ${statusBadge(e.status)}
                </div>
            </div>`).join('');

    const modal = document.createElement('div');
    modal.id = 'logbook-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
    <div class="modal-box" style="max-width:540px;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">
        <div class="modal-header">
            <h3 class="modal-title game-font">📒 디지털 로그북</h3>
            <button class="modal-close" onclick="closeLogbookModal()">✕</button>
        </div>
        <div style="padding:24px">
            <!-- 누적 시간 요약 -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
                <div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px;text-align:center">
                    <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">✅ 승인된 훈련 시간</div>
                    <div style="font-size:28px;font-weight:900;color:#4ade80">${approvedHours}h</div>
                </div>
                <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px;text-align:center">
                    <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">⏳ 승인 대기 시간</div>
                    <div style="font-size:28px;font-weight:900;color:#fbbf24">${pendingHours}h</div>
                </div>
            </div>
            ${addForm}
            <h4 style="color:white;font-size:14px;margin-bottom:12px">훈련 기록 내역</h4>
            ${entries}
        </div>
    </div>`;

    modal.addEventListener('click', closeLogbookModal);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeLogbookModal() {
    const m = document.getElementById('logbook-modal');
    if (m) m.remove();
}

function validateLogbookFiles(input) {
    const files = Array.from(input.files);
    const errEl = document.getElementById('lb-file-error');
    const heicWarn = document.getElementById('heic-warn');
    
    const hasHEIC = files.some(f => /\.(heic|heif)$/i.test(f.name));
    if (heicWarn) heicWarn.style.display = hasHEIC ? 'block' : 'none';

    if (files.length > 3) {
        if (errEl) { errEl.textContent = '최대 3개 파일만 첨부 가능합니다.'; errEl.style.display = 'block'; }
        input.value = ''; return;
    }
    const oversize = files.find(f => f.size > 10 * 1024 * 1024);
    if (oversize) {
        if (errEl) { errEl.textContent = `${oversize.name} 파일이 10MB를 초과합니다.`; errEl.style.display = 'block'; }
        input.value = ''; return;
    }
    const invalidExt = files.find(f => !/\.(jpg|jpeg|png|pdf)$/i.test(f.name));
    if (invalidExt && !hasHEIC) {
        if (errEl) { errEl.textContent = 'JPG, PNG, PDF 파일만 허용됩니다.'; errEl.style.display = 'block'; }
        input.value = ''; return;
    }
    if (errEl) errEl.style.display = 'none';
}

function addLogbookEntry() {
    const date = document.getElementById('lb-date')?.value;
    const hours = parseInt(document.getElementById('lb-hours')?.value || '1');
    const place = document.getElementById('lb-place')?.value.trim();
    const filesInput = document.getElementById('lb-files');
    const files = filesInput ? Array.from(filesInput.files) : [];

    if (!date) { alert('훈련 일자를 선택해주세요.'); return; }
    if (!place) { alert('훈련 장소를 입력해주세요.'); return; }

    // HEIC 차단
    const hasHEIC = files.some(f => /\.(heic|heif)$/i.test(f.name));
    if (hasHEIC) { alert('HEIC 파일은 지원되지 않습니다. JPG 또는 PNG로 변환 후 업로드해주세요.'); return; }

    const entry = {
        id: 'LB-' + Date.now().toString(36).toUpperCase(),
        date, hours, place,
        fileCount: files.filter(f => /\.(jpg|jpeg|png|pdf)$/i.test(f.name)).length,
        fileNames: files.map(f => f.name),
        status: 'pending', // 기본: 승인 대기
        createdAt: new Date().toISOString()
    };

    const logbook = getLogbook();
    logbook.push(entry);
    saveLogbook(logbook);

    closeLogbookModal();
    setTimeout(() => openLogbookModal(), 100);
}

// ===== AUTH & MODALS =====
function openLoginModal() { isLoginMode = true; const m = $('login-modal'); if(m) m.classList.add('open'); }
function closeLoginModal() { const m = $('login-modal'); if(m) m.classList.remove('open'); }

function openProfileModal() {
    const user = getSession();
    if (!user) { openLoginModal(); return; }
    const pm = $('profile-modal');
    if (!pm) return;
    const setT = (id, v) => { const el = $(id); if(el) el.textContent = v || '-'; };
    setT('profile-name', user.name);
    setT('profile-email', user.email);
    setT('profile-phone', user.phone);
    setT('profile-birth', user.birth);
    setT('profile-gender', user.gender === 'M' ? '남성' : user.gender === 'F' ? '여성' : user.gender || '-');
    setT('profile-joined', user.joined || user.joinedAt || '-');
    pm.classList.add('open');
}
function closeProfileModal(e) { 
    if (e && e.target !== e.currentTarget) return;
    const m = $('profile-modal'); if(m) m.classList.remove('open'); 
}
window.handleLogout = function() {
    localStorage.removeItem('isa_session_v1');
    closeProfileModal();
    initAuth();
    alert(currentLang === 'KO' ? '로그아웃 되었습니다.' : 'Logged out.');
};
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
function openQuickModal(type) { 
    const m = $('quick-modal'); if(m) m.classList.add('open'); 
    const t = $('quick-modal-title'); if(t) t.textContent = type.toUpperCase(); 
}
function closeQuickModal() { const m = $('quick-modal'); if(m) m.classList.remove('open'); }

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
        btn.onclick = openProfileModal;
    } else {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${currentLang === 'KO' ? '로그인' : 'Login'}`;
        btn.onclick = openLoginModal;
    }
}

window.handleLogin = function(e) {
    e.preventDefault();
    const emailInfo = $('login-email')?.value || 'User';
    localStorage.setItem('isa_session_v1', JSON.stringify({ name: emailInfo.split('@')[0], email: emailInfo }));
    alert('Logged in successfully.');
    closeLoginModal();
    initAuth();
};
window.toggleLoginMode = function() {
    isLoginMode = !isLoginMode;
    const tf = $('login-title'); if(tf) tf.textContent = isLoginMode ? '로그인' : '회원가입';
    const tt = $('login-toggle-text'); if(tt) tt.textContent = isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인';
    const sf = $('signup-fields'); if(sf) sf.style.display = isLoginMode ? 'none' : 'block';
};

// ===== 마이페이지: 로그북 버튼 프로필 모달에 주입 =====
function injectLogbookButton() {
    const profileBox = document.querySelector('#profile-modal .modal-box');
    if (!profileBox || document.getElementById('logbook-btn-injected')) return;
    
    const btnWrap = profileBox.querySelector('div[style*="display:flex;gap:12px"]');
    if (!btnWrap) return;

    const logbookBtn = document.createElement('button');
    logbookBtn.id = 'logbook-btn-injected';
    logbookBtn.innerHTML = '📒 훈련 로그북';
    logbookBtn.style.cssText = 'flex:1;padding:12px;background:rgba(6,182,212,0.15);color:var(--cyan);font-weight:700;border-radius:12px;border:1px solid rgba(6,182,212,0.3);cursor:pointer;font-size:13px';
    logbookBtn.onclick = () => { closeProfileModal(); setTimeout(openLogbookModal, 150); };
    btnWrap.insertBefore(logbookBtn, btnWrap.firstChild);
}

// 프로필 모달 열릴 때 로그북 버튼 주입 (MutationObserver 활용)
const _observer = new MutationObserver(() => {
    const pm = document.getElementById('profile-modal');
    if (pm && pm.classList.contains('open')) injectLogbookButton();
});
document.addEventListener('DOMContentLoaded', () => {
    const pm = document.getElementById('profile-modal');
    if (pm) _observer.observe(pm, { attributes: true, attributeFilter: ['class'] });
});

// Global Exports
window.toggleLang = toggleLang;
window.selectDiscipline = selectDiscipline;
window.selectCertLevel = selectCertLevel;
window.openQuickModal = openQuickModal;
window.closeQuickModal = closeQuickModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.toggleMobileMenu = () => {
    const m = $('mobile-nav-overlay');
    if (m) m.classList.toggle('active');
};
window.certApplyCheck = certApplyCheck;
window.openLogbookModal = openLogbookModal;
window.closeLogbookModal = closeLogbookModal;
window.openPracticalModal = openPracticalModal;
window.closePracticalModal = closePracticalModal;
window.validateYouTubeInput = validateYouTubeInput;
window.submitPracticalApply = submitPracticalApply;
window.validateLogbookFiles = validateLogbookFiles;
window.addLogbookEntry = addLogbookEntry;