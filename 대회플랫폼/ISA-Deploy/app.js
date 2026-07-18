// ===== STATE =====
let currentLang = 'KO';
let currentPage = '';
let isLoginMode = true; // true = login, false = signup
let selectedDiscipline = DISCIPLINES[0];
let selectedLevel = null;
let eduView = 'menu'; // menu, matching, academy
let selectedShopCategory = 'all'; 

// ===== GOOGLE SHEETS API =====
// ???뚯썝愿由??꾩슜 ?쒗듃 (怨듭젣?뚯? 蹂꾨룄) ??// ?꾨옒 URL???덈줈 留뚮뱺 "ISA ?뚯썝愿由? Apps Script 諛고룷 URL濡?諛붽퓭二쇱꽭??
const GOOGLE_AUTH_URL = 'https://script.google.com/macros/s/AKfycbwwamlSbrY7nLUBeGrJFOzt5d2K1oruOEYOIBwl5Cgv-bsKp1xEydZPIuGjmL5O6xq9DQ/exec';

// Google Sheets???뚯썝媛???곗씠???꾩넚
async function syncSignupToSheet(userData) {
    if (GOOGLE_AUTH_URL === 'YOUR_NEW_APPS_SCRIPT_URL_HERE') {
        console.warn('?좑툘 GOOGLE_AUTH_URL???ㅼ젙?섏? ?딆븯?듬땲?? 濡쒖뺄 ??λ쭔 ?⑸땲??');
        return null;
    }
    try {
        const response = await fetch(GOOGLE_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'register',
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                birth: userData.birth,
                gender: userData.gender,
                password: userData.password
            })
        });
        const result = await response.json();
        console.log('??援ш? ?쒗듃 ?뚯썝媛???숆린???꾨즺:', result);
        return result;
    } catch (error) {
        console.warn('?좑툘 援ш? ?쒗듃 ?곕룞 ?ㅽ뙣 (?ㅽ봽?쇱씤 紐⑤뱶):', error);
        return null;
    }
}

// Google Sheets?먯꽌 濡쒓렇???뺤씤
async function syncLoginFromSheet(email, password) {
    if (GOOGLE_AUTH_URL === 'YOUR_NEW_APPS_SCRIPT_URL_HERE') {
        console.warn('?좑툘 GOOGLE_AUTH_URL???ㅼ젙?섏? ?딆븯?듬땲?? 濡쒖뺄 ?몄쬆留??⑸땲??');
        return null;
    }
    try {
        const url = `${GOOGLE_AUTH_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        const response = await fetch(url);
        const result = await response.json();
        console.log('??援ш? ?쒗듃 濡쒓렇???뺤씤:', result);
        return result;
    } catch (error) {
        console.warn('?좑툘 援ш? ?쒗듃 ?곕룞 ?ㅽ뙣 (濡쒖뺄 紐⑤뱶):', error);
        return null;
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('footer-year').textContent = new Date().getFullYear();
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
    const content = document.getElementById('app-content');
    switch (page) {
        case 'cert': content.innerHTML = renderCertDetail ? (selectedLevel ? renderCertDetail(T('cert')) : renderCertPage()) : 'Error'; break;
        case 'shop': content.innerHTML = renderShopPage(); break;
        case 'insurance': window.location.href = '/mutualaid/'; break;
        case 'map': content.innerHTML = renderMapPage(); break;
        case 'edu': content.innerHTML = renderEduPage(); break;
        case 'intro': content.innerHTML = renderIntroPage(); break;
        default: content.innerHTML = renderHomePage();
    }
    content.querySelector('.page-enter')?.classList.add('page-enter');
}

function updateActiveNav(page) {
    document.querySelectorAll('.nav-link, .mobile-sub-link').forEach(link => {
        const p = link.getAttribute('data-page');
        link.classList.toggle('active', p === page);
    });
}

// ===== LANGUAGE =====
function toggleLang() {
    currentLang = currentLang === 'KO' ? 'EN' : 'KO';
    updateLangUI();
    renderPage(currentPage);
}

function T(path) {
    const keys = path.split('.');
    let val = LANG[currentLang];
    for (const k of keys) { val = val?.[k]; }
    return val || path;
}

function updateLangUI() {
    const t = LANG[currentLang];
    document.getElementById('lang-label').textContent = currentLang;
    document.getElementById('nav-title').textContent = t.common.appName;
    document.getElementById('gov-culture').textContent = t.common.govCulture;
    document.getElementById('gov-coast').textContent = t.common.govCoast;
    document.getElementById('login-text').textContent = t.common.login;

    // Nav links
    document.getElementById('nav-cert').textContent = t.nav.cert;
    document.getElementById('nav-insurance').textContent = t.nav.insurance;
    document.getElementById('nav-shop').textContent = t.nav.shop;
    document.getElementById('nav-map').textContent = t.nav.map;
    document.getElementById('nav-edu').textContent = t.nav.edu;
    // Mobile nav
    document.getElementById('m-nav-cert').textContent = t.nav.cert;
    document.getElementById('m-nav-insurance').textContent = t.nav.insurance;
    document.getElementById('m-nav-shop').textContent = t.nav.shop;
    document.getElementById('m-nav-map').textContent = t.nav.map;
    document.getElementById('m-nav-edu').textContent = t.nav.edu;

    // Quick buttons
    document.getElementById('q-event').textContent = t.quick.event;
    document.getElementById('q-notice').textContent = t.quick.notice;
    document.getElementById('q-appcheck').textContent = t.quick.appCheck;
    document.getElementById('q-certcheck').textContent = t.quick.certCheck;
    document.getElementById('mb-event').textContent = t.quick.event;
    document.getElementById('mb-notice').textContent = t.quick.notice;
    document.getElementById('mb-appcheck').textContent = t.quick.appCheck;
    document.getElementById('mb-certcheck').textContent = t.quick.certCheck;

    // Footer
    document.getElementById('footer-org').textContent = t.common.appName;
    document.getElementById('footer-contact-title').textContent = t.common.footer.contact;
    document.getElementById('footer-address').textContent = currentLang === 'KO' ? SITE_CONFIG.addressKR : SITE_CONFIG.address;
    document.getElementById('footer-legal-title').textContent = t.common.footer.legal;
    document.getElementById('footer-privacy').textContent = t.common.footer.privacy;
    document.getElementById('footer-terms').textContent = t.common.footer.terms;
    document.getElementById('footer-ins-terms').textContent = t.common.footer.insTerms;
}

// ===== HOME PAGE =====
function renderHomePage() {
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
                <a href="#/cert" class="hero-btn-primary">
                    <span>${t.hero.cta} ??/span>
                </a>
                <a href="#/intro" class="hero-btn-secondary">
                    <span>??${t.hero.watch}</span>
                </a>
            </div>
        </div>
        <div class="hero-stat wave glass-panel animate-bounce">
            <div class="hero-stat-label">${t.hero.waveHeight}</div>
            <div class="hero-stat-value game-font">1.8 M</div>
        </div>
        <div class="hero-stat temp glass-panel animate-pulse">
            <div class="hero-stat-label">${t.hero.waterTemp}</div>
            <div class="hero-stat-value game-font">26째C</div>
        </div>
    </section>`;
}

// ===== CERT PAGE =====
function renderCertPage() {
    const t = LANG[currentLang];
    const cd = CERT_DATA[currentLang];

    if (selectedLevel) return renderCertDetail(t, cd);

    const disciplineTabs = DISCIPLINES.map(d =>
        `<button class="discipline-tab ${d === selectedDiscipline ? 'active' : ''}" onclick="selectDiscipline('${d}')">${d}</button>`
    ).join('');

    const levelCards = cd.levels.items.map((item, i) => {
        const level = 4 - i;
        return `
        <div class="level-card glass-panel" onclick="selectCertLevel(${level})">
            <div class="level-card-header">
                <div class="level-num">${level}</div>
                <div>
                    <h3>${item.title}</h3>
                    <span class="level-type">${t.cert.certType}</span>
                </div>
            </div>
            <p>${item.role}</p>
            <div style="font-size:12px;color:var(--text-dark);display:flex;gap:4px;align-items:center">?뱥 ${item.target}</div>
            <div class="level-card-footer">${t.cert.start} ??/div>
        </div>`;
    }).join('');

    const currRows = cd.curriculum.rows.map(row =>
        `<tr>${row.map((cell, i) => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="bg-orb" style="top:0;right:0;background:rgba(6,182,212,0.1)"></div>
        <div class="bg-orb" style="bottom:0;left:0;background:rgba(37,99,235,0.1)"></div>
        <div class="content-container" style="position:relative;z-index:10">
            ${renderCouponBanner()}
            <h2 class="section-title game-font">${t.cert.title}</h2>
            <p class="section-subtitle">${t.cert.desc}</p>
            <div class="discipline-tabs">${disciplineTabs}</div>
            <div class="level-grid animate-fade-in-up">${levelCards}</div>
            <div class="curriculum-table" style="margin-top:64px">
                <div style="display:flex;align-items:center;gap:8px;padding:16px;color:white;font-weight:700">?뱴 ${cd.curriculum.title}</div>
                <table>
                    <thead><tr>${cd.curriculum.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${currRows}</tbody>
                </table>
            </div>
        </div>
    </section>`;
}

function renderCertDetail(t) {
    const feePrice = (selectedLevel >= 3) ? 300000 : 500000;
    const feeNote = currentLang === 'KO' ? '* ?ㅺ린 ?댁닔?쒓컙(?곗뒿?쒓컙=?쒗븨???댁슜猷? 蹂꾨룄' : '* Practice time (facility fee) not included';
    const steps = [
        { title: t.cert.step1, desc: t.cert.step1Desc, status: 'completed', icon: '?? },
        { title: t.cert.step2, desc: t.cert.step2Desc, status: 'current', icon: '?뱷' },
        { title: t.cert.step3, desc: t.cert.step3Desc, status: 'locked', icon: '?렗' },
        { title: t.cert.step4, desc: t.cert.step4Desc, status: 'locked', icon: '?룇' }
    ];
    const stepsHTML = steps.map(s => `
        <div class="process-step ${s.status}">
            <div class="step-icon">${s.icon}</div>
            <div class="step-content">
                <h4>${s.title}</h4>
                <p>${s.desc}</p>
            </div>
            ${s.status === 'current' ? `<button class="btn-primary" onclick="window.open('/exam/','_blank')">${t.cert.start}</button>` : ''}
            ${s.status === 'locked' ? '<span style="color:var(--text-dark);font-size:20px">?뵏</span>' : ''}
        </div>
    `).join('');

    return `
    <section class="page-section page-enter" style="background:var(--bg-slate)">
        <div class="content-container" style="position:relative;z-index:10">
            <button class="back-btn" onclick="selectedLevel=null;renderPage('cert')">
                <div class="back-icon">??/div>
                <span>Back to Level List</span>
            </button>
            <div style="display:grid;gap:32px;grid-template-columns:1fr" class="cert-detail-grid">
                <div class="glass-panel" style="padding:24px;border-radius:16px;border:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:16px">
                        <div>
                            <h3 style="font-size:20px;font-weight:700;color:white">${selectedDiscipline}</h3>
                            <p style="color:var(--cyan);font-weight:700;font-size:16px;margin-top:4px">Level ${selectedLevel} ${t.cert.processTitle}</p>
                        </div>
                        <span style="padding:4px 12px;background:rgba(234,179,8,0.2);color:#facc15;font-size:12px;border-radius:4px;border:1px solid rgba(234,179,8,0.3)">${currentLang === 'KO' ? '吏꾪뻾 以? : 'In Progress'}</span>
                    </div>
                    <div class="process-steps">${stepsHTML}</div>
                </div>
                <div class="fee-panel glass-panel">
                    <h3 style="font-size:16px;font-weight:700;color:white;margin-bottom:16px">${t.cert.examFee}</h3>
                    
                    <!-- Coupon Event Banner -->
                    <div style="margin-bottom: 20px; padding: 12px; background: linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(239, 68, 68, 0.15)); border: 1px dashed #eab308; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">?럞</span>
                        <div style="flex: 1;">
                            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #facc15;">${currentLang === 'KO' ? '?대깽?? ?먭꺽利??좎껌 ???쒗깮' : 'Event: Cert Benefit'}</p>
                            <p style="margin: 0; font-size: 11px; color: #cbd5e1;">${currentLang === 'KO' ? '荑좏뙜 & ?щ━釉뚯쁺 ?좎씤 荑좏룿???쒕┰?덈떎!' : 'Coupang & Olive Young coupons included!'}</p>
                        </div>
                    </div>
                    <div class="fee-row"><span>${t.cert.step2} (Written)</span><span style="color:rgba(6,182,212,0.5)">Included</span></div>
                    <div class="fee-row"><span>${t.cert.step3} (Practical)</span><span style="color:rgba(6,182,212,0.5)">Included</span></div>
                    <div class="fee-row"><span>${t.cert.step4} (Issuance)</span><span style="color:rgba(6,182,212,0.5)">Included</span></div>
                    <div style="height:1px;background:var(--border);margin:16px 0"></div>
                    <div class="fee-total"><span style="color:var(--text-dark)">${t.cert.total}</span><span>??${feePrice.toLocaleString()}</span></div>
                    <div class="fee-note">${feeNote}</div>

                    <!-- Instructor Info Form -->
                    <div style="margin: 20px 0; background: rgba(0,0,0,0.25); padding: 16px; border-radius: 8px; border: 1px solid rgba(6,182,212,0.2);">
                        <h4 style="font-size: 14px; font-weight: 700; color: white; margin-bottom: 12px;">${currentLang === 'KO' ? '媛뺤뒿 ?좊Т ?좏깮' : 'Instructor Status'}</h4>
                        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="self" checked onchange="document.getElementById('instructor-fields').style.display='none'">
                                ${currentLang === 'KO' ? '?낇븰 (Self-taught)' : 'Self-taught'}
                            </label>
                            <label style="color: #cbd5e1; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="radio" name="instructorType" value="instructor" onchange="document.getElementById('instructor-fields').style.display='flex'">
                                ${currentLang === 'KO' ? '?꾨떞 媛뺤궗 (Instructor)' : 'With Instructor'}
                            </label>
                        </div>
                        <div id="instructor-fields" style="display: none; flex-direction: column; gap: 10px;">
                            <input type="text" id="inst-name" placeholder="${currentLang === 'KO' ? '媛뺤궗 ?대쫫 (Instructor Name)' : 'Instructor Name'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white; outline: none; font-size: 13px;">
                            <input type="text" id="inst-cert" placeholder="${currentLang === 'KO' ? '?먭꺽利?踰덊샇 (Certification No.)' : 'Certification No.'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white; outline: none; font-size: 13px;">
                            <input type="tel" id="inst-phone" placeholder="${currentLang === 'KO' ? '媛뺤궗 ?곕씫泥?(Contact Number)' : 'Contact Number'}" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 6px; color: white; outline: none; font-size: 13px;">
                        </div>
                    </div>

                    <button class="btn-primary" style="width:100%;padding:12px;display:flex;align-items:center;justify-content:center;gap:8px" onclick="certApplyCheck()">${t.cert.applyExam} ??/button>
                </div>
            </div>
        </div>
    </section>`;
}

function selectDiscipline(d) {
    selectedDiscipline = d;
    renderPage('cert');
}

function selectCertLevel(level) {
    selectedLevel = level;
    renderPage('cert');
}

// ===== INSURANCE PAGE =====
function renderInsurancePage() {
    const t = LANG[currentLang];
    const planCards = INSURANCE_PLANS.map((plan, i) => {
        const isPopular = i === 1;
        return `
        <div class="plan-card glass-panel ${isPopular ? 'popular' : ''}">
            ${isPopular ? `<div class="plan-badge">${t.ins.mostPopular}</div>` : ''}
            <div class="plan-name game-font">${plan.name}</div>
            <div class="plan-duration">${plan.durationLabel} Coverage</div>
            <div class="plan-price">
                <span class="plan-price-amount">??{plan.price.toLocaleString()}</span>
                <span class="plan-price-period">${t.ins.perPeriod}</span>
            </div>
            <div class="plan-features">
                <div class="plan-feature"><span style="color:var(--red)">?ㅿ툘</span> ${t.ins.feature1}</div>
                <div class="plan-feature"><span style="color:var(--red)">?썳截?/span> ${plan.coverage}</div>
                <div class="plan-feature"><span style="color:var(--green)">?뙇</span> ${t.ins.featureGlobal}</div>
            </div>
            <button class="plan-btn ${isPopular ? 'primary' : 'secondary'}">${t.ins.subscribe}</button>
        </div>`;
    }).join('');

    return `
    <section class="page-section page-enter" style="background:#020617">
        <div class="content-container">
            <div style="text-align:center;margin-bottom:64px">
                <div style="display:inline-flex;align-items:center;justify-content:center;padding:12px;background:rgba(239,68,68,0.1);border-radius:50%;margin-bottom:16px">
                    <span style="font-size:32px">?썳截?/span>
                </div>
                <h2 class="section-title game-font">${t.ins.title}</h2>
                <p class="section-subtitle" style="max-width:640px;margin:0 auto">${t.ins.desc}</p>
            </div>
            <div class="insurance-plans">${planCards}</div>
            <div class="claim-banner glass-panel">
                <div>
                    <h3>${t.ins.claimTitle}</h3>
                    <p>${t.ins.claimDesc}</p>
                </div>
                <button class="claim-btn">${t.ins.claim}</button>
            </div>
        </div>
    </section>`;
}

// ===== MAP PAGE =====
function renderMapPage() {
    const t = LANG[currentLang];
    const locationItems = SURF_LOCATIONS.map(loc => `
        <div class="map-item">
            <div class="map-item-header">
                <h4>${loc.name}</h4>
                <span class="map-item-status ${loc.status.toLowerCase()}">${loc.status}</span>
            </div>
            <p class="country">${loc.country}</p>
            <div style="margin-top:8px;font-size:12px;color:var(--text-dark)">?뱸 ${loc.phone}</div>
            <div class="map-item-actions">
                <a href="https://maps.google.com/?q=${loc.lat},${loc.lng}" target="_blank" class="map-action-btn navigate">${t.map.navigate}</a>
                <button class="map-action-btn website">${t.map.website}</button>
            </div>
        </div>
    `).join('');

    return `
    <div class="map-page page-enter">
        <div class="map-header">
            <h2 class="game-font">${t.map.title}</h2>
            <p>${t.map.subtitle}</p>
        </div>
        <div class="map-container">
            <div class="map-bg"></div>
            <div class="map-pins">
                <div class="map-pin" style="top:38%;left:82%"><svg viewBox="0 0 24 24" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="map-pin" style="top:40%;left:18%;animation-delay:0.5s"><svg viewBox="0 0 24 24" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="map-pin" style="top:35%;left:48%;animation-delay:1s"><svg viewBox="0 0 24 24" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="map-pin" style="top:80%;left:85%;animation-delay:1.5s"><svg viewBox="0 0 24 24" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            </div>
            <div class="map-sidebar glass-panel">
                <div class="map-search">
                    <input type="text" placeholder="${t.map.searchPlaceholder}">
                </div>
                <div class="map-list">${locationItems}</div>
            </div>
        </div>
    </div>`;
}

// ===== EDUCATION PAGE =====
function renderEduPage() {
    const t = LANG[currentLang];
    if (eduView === 'matching') return renderMatchingView(t);
    if (eduView === 'academy') return renderAcademyView(t);
    return renderEduMenu(t);
}

function renderEduMenu(t) {
    return `
    <section class="page-section page-enter" style="background:black">
        <div class="content-container">
            <div style="text-align:center;margin-bottom:64px">
                <h2 class="section-title game-font">${t.edu.mainTitle}</h2>
                <p class="section-subtitle">${t.edu.mainSubtitle}</p>
            </div>
            <div class="edu-menu">
                <div class="edu-menu-card glass-panel" onclick="eduView='matching';renderPage('edu')">
                    <div class="edu-icon" style="background:rgba(8,145,178,0.2);color:var(--cyan)">?뫅?랅윆?/div>
                    <h3>${t.edu.menuMatch}</h3>
                    <p>${t.edu.menuMatchDesc}</p>
                </div>
                <div class="edu-menu-card glass-panel" onclick="eduView='academy';renderPage('edu')">
                    <div class="edu-icon" style="background:rgba(168,85,247,0.2);color:var(--purple)">?럳</div>
                    <h3>${t.edu.menuAcademy}</h3>
                    <p>${t.edu.menuAcademyDesc}</p>
                </div>
            </div>
        </div>
    </section>`;
}

function renderMatchingView(t) {
    const cards = INSTRUCTORS.map(inst => `
        <div class="instructor-card glass-panel">
            <div class="instructor-img">
                <img src="${inst.image}" alt="${inst.name}" loading="lazy">
                <div class="instructor-level">Level ${inst.level}</div>
            </div>
            <div class="instructor-info">
                <div class="instructor-header">
                    <h3>${inst.name}</h3>
                    <div class="instructor-rating">狩?${inst.rating}</div>
                </div>
                <div class="instructor-region">?뱧 ${inst.region}</div>
                <div class="instructor-footer">
                    <div class="instructor-rate">??{inst.rate.toLocaleString()}<small>${t.edu.perHour}</small></div>
                    <button class="book-btn">${t.edu.bookBtn}</button>
                </div>
            </div>
        </div>
    `).join('');

    return `
    <section class="page-section page-enter" style="background:black">
        <div class="content-container">
            <button class="back-btn" onclick="eduView='menu';renderPage('edu')">
                <div class="back-icon">??/div><span>Back to Menu</span>
            </button>
            <h2 style="font-size:28px;font-weight:700;color:white;margin-bottom:32px" class="game-font">${t.edu.matchTitle}</h2>
            <div class="filter-bar glass-panel">
                <div class="filter-input">
                    <span>?뱧</span>
                    <select><option>${t.edu.filterRegion}</option><option>Seoul</option><option>Busan</option><option>Jeju</option></select>
                </div>
                <div class="filter-input">
                    <span>?뱟</span>
                    <input type="date" placeholder="${t.edu.filterDate}">
                </div>
                <button class="filter-btn">?뵇 ${t.edu.searchBtn}</button>
            </div>
            <div class="instructor-grid">${cards}</div>
        </div>
    </section>`;
}

function renderAcademyView(t) {
    const audioBars = Array.from({length: 20}, (_, i) =>
        `<div class="audio-bar" style="height:${Math.random()*100}%;animation-delay:${i*0.1}s"></div>`
    ).join('');

    const sources = [
        { title: 'ISA Standard Safety Manual 2024.pdf', type: 'PDF', size: '2.4 MB' },
        { title: 'Flowrider Technical Terms Glossary.txt', type: 'TXT', size: '15 KB' },
        { title: 'Practical Exam Evaluation Criteria.pdf', type: 'PDF', size: '1.1 MB' }
    ];
    const sourceItems = sources.map(s => `
        <div class="source-item">
            <div class="source-item-info">
                <span class="source-item-icon">?뱞</span>
                <div>
                    <h4>${s.title}</h4>
                    <span class="source-meta">${s.type} ??${s.size}</span>
                </div>
            </div>
            <button class="view-btn">${t.edu.viewBtn}</button>
        </div>
    `).join('');

    const videoCards = [1,2,3].map(i => `
        <div class="video-card">
            <div class="video-thumb">
                <img src="https://picsum.photos/400/225?random=${20+i}" alt="Video" loading="lazy">
                <div class="video-play-overlay">
                    <div class="video-play-circle">??/div>
                </div>
            </div>
            <div class="video-info">
                <div class="tag">${currentLang === 'KO' ? '湲곗닠' : 'Skill'}</div>
                <h4>${t.edu.sampleVideo}</h4>
            </div>
        </div>
    `).join('');

    return `
    <section class="page-section page-enter" style="background:black">
        <div class="content-container">
            <button class="back-btn" onclick="eduView='menu';renderPage('edu')">
                <div class="back-icon">??/div><span>Back to Menu</span>
            </button>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
                <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(to right,#3b82f6,#9333ea);display:flex;align-items:center;justify-content:center;font-size:20px">?럳</div>
                <div>
                    <h2 style="font-size:28px;font-weight:700;color:white" class="game-font">${t.edu.academyTitle}</h2>
                    <p style="color:var(--text-dark);font-size:14px">${t.edu.poweredBy}</p>
                </div>
            </div>
            <div class="academy-grid">
                <div class="audio-panel glass-panel">
                    <div class="audio-badge">?렦 ${t.edu.aiAudioLabel}</div>
                    <h3 style="font-size:20px;font-weight:700;color:white;margin-bottom:8px">${t.edu.audioTitle}</h3>
                    <p style="color:var(--text-dark);font-size:14px;margin-bottom:32px">${t.edu.audioDesc}</p>
                    <div class="audio-wave">${audioBars}</div>
                    <div class="audio-controls">
                        <button class="play-btn" onclick="playTTS()">??/button>
                        <div class="audio-progress">
                            <div style="display:flex;justify-content:space-between;font-size:12px;color:white;font-weight:700;margin-bottom:4px">
                                <span>${t.edu.audioTitle}</span><span id="audio-status">Ready</span>
                            </div>
                            <div class="audio-progress-bar"><div class="audio-progress-fill" id="audio-fill"></div></div>
                            <div class="audio-time"><span>04:20</span><span>12:45</span></div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 style="font-size:18px;font-weight:700;color:white;margin-bottom:16px">${t.edu.sourceTitle}</h3>
                    <div class="source-list">${sourceItems}</div>
                </div>
            </div>
            <div style="margin-top:64px">
                <h3 style="font-size:18px;font-weight:700;color:white;margin-bottom:24px">${t.edu.videoTitle}</h3>
                <div class="video-grid">${videoCards}</div>
            </div>
        </div>
    </section>`;
}

// ===== INTRO PAGE =====
function renderIntroPage() {
    const t = LANG[currentLang];
    const disciplineTabs = DISCIPLINES.map(d =>
        `<button class="discipline-tab ${d === selectedDiscipline ? 'active' : ''}" onclick="selectedDiscipline='${d}';renderPage('intro')">${d}</button>`
    ).join('');

    const info = DISCIPLINE_INFO[currentLang][selectedDiscipline];
    const audioBars = Array.from({length: 25}, (_, i) =>
        `<div class="audio-bar" style="height:${Math.random()*100}%;animation-delay:${i*0.05}s;background:var(--purple)"></div>`
    ).join('');

    return `
    <section class="page-section page-enter" style="background:black">
        <div class="bg-orb" style="top:0;left:25%;background:rgba(8,145,178,0.15)"></div>
        <div class="bg-orb" style="bottom:0;right:25%;background:rgba(37,99,235,0.15)"></div>
        <div class="content-container" style="position:relative;z-index:10">
            <div style="text-align:center;margin-bottom:64px">
                <h2 class="section-title game-font">${t.intro.title}</h2>
                <p class="section-subtitle" style="max-width:640px;margin:0 auto">${t.intro.subtitle}</p>
            </div>
            <div class="discipline-tabs">${disciplineTabs}</div>
            <div class="animate-fade-in-up">
                <div class="intro-discipline-info glass-panel">
                    <h3 class="game-font">${info.title}</h3>
                    <p>${info.desc}</p>
                </div>
                <div class="intro-grid">
                    <div class="audio-panel glass-panel" style="border-color:rgba(168,85,247,0.3)">
                        <div class="audio-badge">?렦 ${t.intro.aiVoicePreview}</div>
                        <h3 style="font-size:20px;font-weight:700;color:white;margin-bottom:8px">${info.audioTitle}</h3>
                        <p style="color:var(--text-dark);font-size:14px;margin-bottom:32px">${info.audioDesc}</p>
                        <div class="audio-wave">${audioBars}</div>
                        <div class="audio-controls">
                            <button class="play-btn" onclick="playTTS('${info.audioDesc.replace(/'/g, "\\'")}')" style="background:var(--purple);color:white">??/button>
                            <div class="audio-progress">
                                <div class="audio-progress-bar"><div class="audio-progress-fill" style="background:var(--purple);width:0%" id="intro-audio-fill"></div></div>
                                <div class="audio-time"><span>00:00</span><span>~</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="glass-panel" style="padding:32px;border-radius:16px;border:1px solid var(--border);display:flex;flex-direction:column">
                        <div style="margin-bottom:24px">
                            <span style="padding:4px 12px;background:rgba(255,255,255,0.1);color:#d1d5db;font-size:12px;font-weight:700;border-radius:999px;border:1px solid rgba(255,255,255,0.2);display:inline-block;margin-bottom:16px">${t.intro.officialVideo}</span>
                            <h4 style="font-size:20px;font-weight:700;color:white">${info.videoTitle}</h4>
                        </div>
                        <div style="flex:1;background:black;border-radius:12px;overflow:hidden;border:1px solid var(--border);position:relative;cursor:pointer;aspect-ratio:16/9">
                            <img src="https://picsum.photos/800/450?random=${selectedDiscipline.length}" alt="Video" style="width:100%;height:100%;object-fit:cover;opacity:0.5">
                            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                                <div class="video-play-circle" style="width:64px;height:64px;font-size:20px">??/div>
                                <span style="margin-top:16px;font-size:14px;font-weight:700;color:white;letter-spacing:3px;text-transform:uppercase">${t.intro.playBtn}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

// ===== TTS =====
function playTTS(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const info = DISCIPLINE_INFO[currentLang][selectedDiscipline];
    const utterance = new SpeechSynthesisUtterance(text || info.audioDesc);
    utterance.lang = currentLang === 'KO' ? 'ko-KR' : 'en-US';
    utterance.rate = 1;
    utterance.onend = () => {
        const fill = document.getElementById('audio-fill') || document.getElementById('intro-audio-fill');
        if (fill) fill.style.width = '100%';
        const status = document.getElementById('audio-status');
        if (status) status.textContent = 'Done';
    };
    window.speechSynthesis.speak(utterance);
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        const fill = document.getElementById('audio-fill') || document.getElementById('intro-audio-fill');
        if (fill) fill.style.width = Math.min(progress, 95) + '%';
        const status = document.getElementById('audio-status');
        if (status) status.textContent = 'Playing';
        if (progress >= 100) clearInterval(interval);
    }, 100);
}

// ===== AUTH SYSTEM =====
const AUTH_KEY = 'isa_users_v1';
const SESSION_KEY = 'isa_session_v1';

function getUsers() {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
}
function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}
function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}
function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Init auth state on page load
function initAuth() {
    const session = getSession();
    updateNavbarAuth(session);
}

function updateNavbarAuth(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (user) {
        loginBtn.onclick = () => openProfileModal();
        loginBtn.innerHTML = `
            <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#2563eb);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:900">${user.name.charAt(0)}</div>
            <span id="login-text" style="display:none">${user.name}</span>
        `;
        // Show name on desktop
        const nameSpan = loginBtn.querySelector('span');
        if (window.innerWidth >= 768 && nameSpan) nameSpan.style.display = 'inline';
    } else {
        loginBtn.onclick = () => openLoginModal();
        const t = LANG[currentLang];
        loginBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span id="login-text">${t.common.login}</span>
        `;
    }
}

// ===== LOGIN MODAL =====
function openLoginModal() {
    isLoginMode = true;
    document.getElementById('login-modal').classList.add('open');
    updateLoginUI();
    clearLoginForm();
}
function closeLoginModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('login-modal').classList.remove('open');
    clearLoginForm();
}
function clearLoginForm() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    const name = document.getElementById('signup-name');
    const phone = document.getElementById('signup-phone');
    const birth = document.getElementById('signup-birth');
    const pwConfirm = document.getElementById('signup-pw-confirm');
    const agree = document.getElementById('signup-agree');
    if (name) name.value = '';
    if (phone) phone.value = '';
    if (birth) birth.value = '';
    if (pwConfirm) pwConfirm.value = '';
    if (agree) agree.checked = false;
    // ?몄쬆 ?곹깭 珥덇린??    phoneVerified = false;
    verifyCode = '';
    if (verifyTimerInterval) { clearInterval(verifyTimerInterval); verifyTimerInterval = null; }
    const codeGroup = document.getElementById('verify-code-group');
    if (codeGroup) codeGroup.style.display = 'none';
    const badge = document.getElementById('verify-success-badge');
    if (badge) badge.style.display = 'none';
    const codeInput = document.getElementById('verify-code-input');
    if (codeInput) codeInput.value = '';
    const sendBtn = document.getElementById('send-code-btn');
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = currentLang === 'KO' ? '?몄쬆踰덊샇 諛쒖넚' : 'Send Code'; }
    const msg = document.getElementById('login-msg');
    msg.className = 'login-msg';
    msg.textContent = '';
}

// ===== ?대???蹂몄씤?몄쬆 ?쒖뒪??=====
let phoneVerified = false;
let verifyCode = '';
let verifyTimerInterval = null;
let verifyTimeLeft = 0;

function sendVerifyCode() {
    const phone = document.getElementById('signup-phone').value.trim();
    const name = document.getElementById('signup-name').value.trim();
    const isKO = currentLang === 'KO';

    if (!name) {
        showLoginMsg(isKO ? '?대쫫??癒쇱? ?낅젰?댁＜?몄슂.' : 'Please enter your name first.', 'error');
        return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        showLoginMsg(isKO ? '?щ컮瑜??곕씫泥섎? ?낅젰?댁＜?몄슂.' : 'Please enter a valid phone number.', 'error');
        return;
    }

    // 6?먮━ ?몄쬆踰덊샇 ?앹꽦
    verifyCode = String(Math.floor(100000 + Math.random() * 900000));
    phoneVerified = false;

    // ?몄쬆踰덊샇 ?낅젰 ?곸뿭 ?쒖떆
    document.getElementById('verify-code-group').style.display = 'block';
    document.getElementById('verify-success-badge').style.display = 'none';
    document.getElementById('verify-code-input').value = '';

    // 諛쒖넚 踰꾪듉 鍮꾪솢?깊솕
    const sendBtn = document.getElementById('send-code-btn');
    sendBtn.disabled = true;
    sendBtn.textContent = isKO ? '?щ컻??(3:00)' : 'Resend (3:00)';

    // 3遺???대㉧ ?쒖옉
    verifyTimeLeft = 180;
    if (verifyTimerInterval) clearInterval(verifyTimerInterval);
    verifyTimerInterval = setInterval(() => {
        verifyTimeLeft--;
        const m = Math.floor(verifyTimeLeft / 60);
        const s = verifyTimeLeft % 60;
        const timerText = `${m}:${String(s).padStart(2, '0')}`;
        document.getElementById('verify-timer').textContent = timerText;
        sendBtn.textContent = (isKO ? '?щ컻??(' : 'Resend (') + timerText + ')';

        if (verifyTimeLeft <= 0) {
            clearInterval(verifyTimerInterval);
            verifyTimerInterval = null;
            sendBtn.disabled = false;
            sendBtn.textContent = isKO ? '?щ컻?? : 'Resend';
            document.getElementById('verify-timer').textContent = isKO ? '?쒓컙 留뚮즺' : 'Expired';
            verifyCode = '';
        }
    }, 1000);

    // ?몄쬆踰덊샇 ?덈궡 硫붿떆吏
    const verifyMsg = document.getElementById('verify-msg');
    verifyMsg.style.color = '#22d3ee';
    verifyMsg.textContent = isKO
        ? `?벑 ?몄쬆踰덊샇媛 諛쒖넚?섏뿀?듬땲?? (?뚯뒪?? ${verifyCode})`
        : `?벑 Code sent. (Test: ${verifyCode})`;

    showLoginMsg(isKO ? '?벑 ?몄쬆踰덊샇媛 諛쒖넚?섏뿀?듬땲??' : '?벑 Verification code sent.', 'success');
    console.log('?뵎 ?몄쬆踰덊샇:', verifyCode);
}

function confirmVerifyCode() {
    const input = document.getElementById('verify-code-input').value.trim();
    const isKO = currentLang === 'KO';
    const verifyMsg = document.getElementById('verify-msg');

    if (!input) {
        verifyMsg.style.color = '#ef4444';
        verifyMsg.textContent = isKO ? '?몄쬆踰덊샇瑜??낅젰?댁＜?몄슂.' : 'Please enter the code.';
        return;
    }

    if (input === verifyCode) {
        // ?몄쬆 ?깃났!
        phoneVerified = true;
        if (verifyTimerInterval) { clearInterval(verifyTimerInterval); verifyTimerInterval = null; }

        // ?몄쬆踰덊샇 ?낅젰 ?곸뿭 ?④린湲?        document.getElementById('verify-code-group').style.display = 'none';

        // ?몄쬆 ?꾨즺 諛곗? ?쒖떆
        const badge = document.getElementById('verify-success-badge');
        badge.style.display = 'flex';
        const name = document.getElementById('signup-name').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        document.getElementById('verify-success-text').textContent = isKO ? '??蹂몄씤?몄쬆 ?꾨즺' : '??Identity Verified';
        document.getElementById('verify-success-detail').textContent = `${name} 쨌 ${phone}`;

        // ?꾪솕踰덊샇 ?섏젙 遺덇? 泥섎━
        document.getElementById('signup-phone').readOnly = true;
        document.getElementById('signup-phone').style.opacity = '0.6';
        document.getElementById('send-code-btn').style.display = 'none';

        showLoginMsg(isKO ? '??蹂몄씤?몄쬆???꾨즺?섏뿀?듬땲??' : '??Identity verification complete!', 'success');
    } else {
        verifyMsg.style.color = '#ef4444';
        verifyMsg.textContent = isKO ? '???몄쬆踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.' : '??Incorrect code.';
    }
}

function toggleLoginMode() {
    isLoginMode = !isLoginMode;
    updateLoginUI();
}

function updateLoginUI() {
    const isKO = currentLang === 'KO';
    const t = LANG[currentLang].login;
    document.getElementById('login-title').textContent = isLoginMode ? t.title : t.signupTitle;
    document.getElementById('login-sub').textContent = t.sub;
    document.getElementById('label-email').textContent = t.email;
    document.getElementById('label-password').textContent = t.password;
    document.getElementById('login-email').placeholder = 'surfer@isa.world';
    document.getElementById('login-password').placeholder = '?™™™™™™™?;
    document.getElementById('login-submit-btn').textContent = isLoginMode ? t.submitLogin : t.submitSignup;
    document.getElementById('login-toggle-text').textContent = isLoginMode ? t.toggleToSignup : t.toggleToLogin;
    document.getElementById('signup-fields').style.display = isLoginMode ? 'none' : 'block';

    if (!isLoginMode) {
        document.getElementById('label-name').textContent = isKO ? '?대쫫 (?ㅻ챸)' : 'Full Name';
        document.getElementById('signup-name').placeholder = isKO ? '?대쫫???낅젰?섏꽭?? : 'Enter your full name';
        document.getElementById('label-phone').textContent = isKO ? '?곕씫泥? : 'Phone Number';
        document.getElementById('signup-phone').placeholder = isKO ? '010-0000-0000' : '+1-000-000-0000';
        const sendBtn = document.getElementById('send-code-btn');
        if (sendBtn && !sendBtn.disabled) sendBtn.textContent = isKO ? '?몄쬆踰덊샇 諛쒖넚' : 'Send Code';
        document.getElementById('label-birth').textContent = isKO ? '?앸뀈?붿씪' : 'Date of Birth';
        document.getElementById('signup-birth').placeholder = 'YYMMDD';
        document.getElementById('label-gender').textContent = isKO ? '?깅퀎' : 'Gender';
        // ?깅퀎 select ?듭뀡??踰덉뿭
        const genderSelect = document.getElementById('signup-gender');
        genderSelect.innerHTML = isKO
            ? '<option value="M">?⑥꽦 (Male)</option><option value="F">?ъ꽦 (Female)</option>'
            : '<option value="M">Male</option><option value="F">Female</option>';
        document.getElementById('label-pw-confirm').textContent = isKO ? '鍮꾨?踰덊샇 ?뺤씤' : 'Confirm Password';
        document.getElementById('signup-pw-confirm').placeholder = isKO ? '鍮꾨?踰덊샇瑜??ㅼ떆 ?낅젰?섏꽭?? : 'Re-enter your password';
        document.getElementById('label-agree').textContent = isKO ? '媛쒖씤?뺣낫 ?섏쭛 諛??댁슜???숈쓽?⑸땲?? : 'I agree to the collection and use of personal information';
        // ?몄쬆 愿??踰덉뿭
        const verifyLabel = document.getElementById('label-verify-code');
        if (verifyLabel) verifyLabel.childNodes[0].textContent = isKO ? '?몄쬆踰덊샇 ?낅젰 ' : 'Enter Code ';
        const verifyBtn = document.getElementById('verify-code-btn');
        if (verifyBtn) verifyBtn.textContent = isKO ? '?뺤씤' : 'Verify';
    }

    const msg = document.getElementById('login-msg');
    msg.className = 'login-msg';
    msg.textContent = '';
}

function showLoginMsg(text, type) {
    const msg = document.getElementById('login-msg');
    msg.className = `login-msg ${type}`;
    msg.textContent = text;
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    if (isLoginMode) {
        // === LOGIN ===
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'KO' ? '濡쒓렇??以?..' : 'Logging in...';

        // 1) 援ш? ?쒗듃?먯꽌 ?뺤씤 ?쒕룄
        const sheetResult = await syncLoginFromSheet(email, password);
        
        if (sheetResult && sheetResult.status === 'success') {
            // 援ш? ?쒗듃 濡쒓렇???깃났
            const session = sheetResult.data;
            saveSession(session);
            // 濡쒖뺄?먮룄 ???(?ㅽ봽?쇱씤 ?鍮?
            const users = getUsers();
            if (!users.find(u => u.email === email)) {
                users.push({ ...session, password });
                saveUsers(users);
            }
            showLoginMsg(currentLang === 'KO' ? `${session.name}?? ?섏쁺?⑸땲?? ?럦` : `Welcome, ${session.name}! ?럦`, 'success');
            setTimeout(() => { closeLoginModal(); updateNavbarAuth(session); }, 1200);
            submitBtn.disabled = false;
            submitBtn.textContent = LANG[currentLang].login.submitLogin;
            return;
        } else if (sheetResult && sheetResult.status === 'error') {
            // 援ш? ?쒗듃?먯꽌 紐낇솗???먮윭 (鍮꾨쾲 遺덉씪移? 誘몃벑濡???
            showLoginMsg(sheetResult.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = LANG[currentLang].login.submitLogin;
            return;
        }

        // 2) 援ш? ?쒗듃 ?곌껐 ?ㅽ뙣 ??濡쒖뺄 ?뺤씤 (?대갚)
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            showLoginMsg(currentLang === 'KO' ? '?깅줉?섏? ?딆? ?대찓?쇱엯?덈떎.' : 'Email not found.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = LANG[currentLang].login.submitLogin;
            return;
        }
        if (user.password !== password) {
            showLoginMsg(currentLang === 'KO' ? '鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.' : 'Incorrect password.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = LANG[currentLang].login.submitLogin;
            return;
        }
        const session = { name: user.name, email: user.email, phone: user.phone, birth: user.birth, gender: user.gender, joined: user.joined };
        saveSession(session);
        showLoginMsg(currentLang === 'KO' ? `${user.name}?? ?섏쁺?⑸땲?? ?럦` : `Welcome, ${user.name}! ?럦`, 'success');
        setTimeout(() => { closeLoginModal(); updateNavbarAuth(session); }, 1200);
        submitBtn.disabled = false;
        submitBtn.textContent = LANG[currentLang].login.submitLogin;

    } else {
        // === SIGNUP ===
        const name = document.getElementById('signup-name').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        const birth = document.getElementById('signup-birth').value.trim();
        const gender = document.getElementById('signup-gender').value;
        const pwConfirm = document.getElementById('signup-pw-confirm').value;
        const agree = document.getElementById('signup-agree').checked;

        // Validation
        if (!name) { showLoginMsg(currentLang === 'KO' ? '?대쫫???낅젰?댁＜?몄슂.' : 'Please enter your name.', 'error'); return; }
        if (!phoneVerified) { showLoginMsg(currentLang === 'KO' ? '?벑 ?대???蹂몄씤?몄쬆???꾨즺?댁＜?몄슂.' : '?벑 Please complete phone verification.', 'error'); return; }
        if (!phone || phone.length < 10) { showLoginMsg(currentLang === 'KO' ? '?щ컮瑜??곕씫泥섎? ?낅젰?댁＜?몄슂.' : 'Please enter a valid phone number.', 'error'); return; }
        if (!birth || birth.length !== 6) { showLoginMsg(currentLang === 'KO' ? '?앸뀈?붿씪 6?먮━瑜??낅젰?댁＜?몄슂. (?? 900101)' : 'Enter 6-digit birth date (e.g., 900101)', 'error'); return; }
        if (password.length < 4) { showLoginMsg(currentLang === 'KO' ? '鍮꾨?踰덊샇??4???댁긽 ?낅젰?댁＜?몄슂.' : 'Password must be at least 4 characters.', 'error'); return; }
        if (password !== pwConfirm) { showLoginMsg(currentLang === 'KO' ? '鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.' : 'Passwords do not match.', 'error'); return; }
        if (!agree) { showLoginMsg(currentLang === 'KO' ? '媛쒖씤?뺣낫 ?섏쭛???숈쓽?댁＜?몄슂.' : 'Please agree to the terms.', 'error'); return; }

        // Check local duplicate
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            showLoginMsg(currentLang === 'KO' ? '?대? ?깅줉???대찓?쇱엯?덈떎.' : 'Email already registered.', 'error');
            return;
        }

        // 濡쒕뵫 ?쒖떆
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'KO' ? '媛??泥섎━ 以?..' : 'Processing...';
        showLoginMsg(currentLang === 'KO' ? '???깅줉 以?..' : '??Registering...', 'success');

        // 1) 援ш? ?쒗듃???뚯썝媛???곗씠???꾩넚
        const newUser = { name, email, password, phone, birth, gender, joined: new Date().toISOString().slice(0, 10) };
        const sheetResult = await syncSignupToSheet(newUser);

        if (sheetResult && sheetResult.status === 'error') {
            showLoginMsg(sheetResult.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = LANG[currentLang].login.submitSignup;
            return;
        }

        // 2) 濡쒖뺄?먮룄 ???        users.push(newUser);
        saveUsers(users);

        const session = { name, email, phone, birth, gender, joined: newUser.joined };
        saveSession(session);

        const successMsg = currentLang === 'KO' ? `${name}?? ?뚯썝媛???꾨즺!` : `Welcome, ${name}! Registered!`;

        showLoginMsg(successMsg, 'success');
        setTimeout(() => {
            closeLoginModal();
            updateNavbarAuth(session);
        }, 1500);

        submitBtn.disabled = false;
        submitBtn.textContent = LANG[currentLang].login.submitSignup;
    }
}

// ===== PROFILE MODAL =====
function openProfileModal() {
    const session = getSession();
    if (!session) return;

    document.getElementById('profile-name').textContent = session.name;
    document.getElementById('profile-email').textContent = session.email;
    document.getElementById('profile-phone').textContent = session.phone || '-';
    document.getElementById('profile-birth').textContent = session.birth || '-';
    document.getElementById('profile-gender').textContent = session.gender === 'M' ? (currentLang === 'KO' ? '?⑥꽦' : 'Male') : (currentLang === 'KO' ? '?ъ꽦' : 'Female');
    document.getElementById('profile-joined').textContent = session.joined || '-';

    // Labels
    document.getElementById('profile-label-phone').textContent = currentLang === 'KO' ? '?곕씫泥? : 'Phone';
    document.getElementById('profile-label-birth').textContent = currentLang === 'KO' ? '?앸뀈?붿씪' : 'Birth';
    document.getElementById('profile-label-gender').textContent = currentLang === 'KO' ? '?깅퀎' : 'Gender';
    document.getElementById('profile-label-joined').textContent = currentLang === 'KO' ? '媛?낆씪' : 'Joined';
    document.getElementById('profile-close-btn').textContent = currentLang === 'KO' ? '?リ린' : 'Close';
    document.getElementById('profile-logout-btn').textContent = currentLang === 'KO' ? '濡쒓렇?꾩썐' : 'Logout';

    document.getElementById('profile-modal').classList.add('open');
}
function closeProfileModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('profile-modal').classList.remove('open');
}
function handleLogout() {
    clearSession();
    updateNavbarAuth(null);
    closeProfileModal();
    showLogoutToast();
}
function showLogoutToast() {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);z-index:200;background:rgba(15,23,42,0.95);border:1px solid rgba(6,182,212,0.5);padding:12px 24px;border-radius:12px;color:white;font-weight:700;font-size:14px;box-shadow:0 0 20px rgba(6,182,212,0.3);animation:fadeInDown 0.3s ease-out';
    toast.textContent = currentLang === 'KO' ? '濡쒓렇?꾩썐?섏뿀?듬땲??' : 'Logged out successfully.';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeIn 0.3s ease-out reverse'; setTimeout(() => toast.remove(), 300); }, 2000);
}

// Quick Modal
function openQuickModal(type) {
    const modal = document.getElementById('quick-modal');
    const title = document.getElementById('quick-modal-title');
    const content = document.getElementById('quick-modal-content');
    const t = LANG[currentLang];
    let html = '';

    switch(type) {
        case 'event':
            title.textContent = t.quick.event;
            html = '<div class="quick-list">' + EVENTS[currentLang].map(e =>
                `<div class="quick-item"><div class="date">${e.date}</div><div class="title">${e.title}</div></div>`
            ).join('') + '</div>';
            html += `
            <div class="coupon-cards">
                <div class="coupon-card purple">
                    <h3>${currentLang === 'KO' ? '臾대즺 媛뺤뒿沅? : 'Free Coaching Ticket'}</h3>
                    <p>${currentLang === 'KO' ? '2湲??먭꺽利?痍⑤뱷 ??1?쒓컙 肄붿묶 ?몄뀡 臾대즺 ?쒓났.' : 'Free 1hr coaching upon Level 2.'}</p>
                    <a href="${SITE_CONFIG.storeUrl}" target="_blank" class="coupon-btn">${currentLang === 'KO' ? '?곹깭 ?뺤씤' : 'Check Status'}</a>
                </div>
                <div class="coupon-card orange">
                    <h3>${currentLang === 'KO' ? '?쒖쫵 ?ㅽ봽 ?몄씪' : 'Season Off Sale'}</h3>
                    <p>${currentLang === 'KO' ? '怨듭젣???뚯썝???꾪븳 ?뚮줈?곕낫??理쒕? 30% ?좎씤.' : 'Up to 30% off flowboards for members.'}</p>
                    <a href="${SITE_CONFIG.storeUrl}" target="_blank" class="coupon-btn">${currentLang === 'KO' ? '?곹뭹 蹂닿린' : 'View Items'}</a>
                </div>
            </div>`;
            break;
        case 'notice':
            title.textContent = t.quick.notice;
            html = '<div class="quick-list">' + NOTICES[currentLang].map(n =>
                `<div class="quick-item"><div class="date">${n.date}</div><div class="title">${n.title}</div></div>`
            ).join('') + '</div>';
            break;
        case 'appcheck':
            title.textContent = t.quick.appCheck;
            html = `
            <div class="check-form" id="app-check-form">
                <div class="check-input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="app-check-input" placeholder="${t.quick.inputApp} (or Phone)">
                </div>
                <button class="check-btn" onclick="checkApplication()">${t.quick.checkBtn}</button>
                <div id="app-check-result"></div>
            </div>`;
            break;
        case 'certcheck':
            title.textContent = t.quick.certCheck;
            html = `
            <div class="check-form" id="cert-check-form">
                <div class="check-input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" id="cert-name-input" placeholder="${t.quick.inputCert}">
                </div>
                <div class="check-input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                    <input type="text" id="cert-phone-input" placeholder="${t.quick.inputPhone}">
                </div>
                <button class="check-btn" onclick="checkCertificate()">${t.quick.checkBtn}</button>
                <div id="cert-check-result"></div>
            </div>`;
            break;
    }

    content.innerHTML = html;
    modal.classList.add('open');
}
function closeQuickModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('quick-modal').classList.remove('open');
}

// Check functions (demo)
function checkApplication() {
    const input = document.getElementById('app-check-input').value.trim();
    const result = document.getElementById('app-check-result');
    if (!input) return;
    // Demo: always show a sample result
    if (input.startsWith('APP-')) {
        result.innerHTML = `<div class="check-result found"><h4>??Found</h4><p><span class="label">Name:</span> 源?쒗띁</p><p><span class="label">App No:</span> ${input}</p><p><span class="label">Status:</span> APPLIED</p></div>`;
    } else {
        result.innerHTML = `<div class="check-result not-found"><h4>??No application found.</h4></div>`;
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const subNav = document.getElementById('mobile-sub-nav');
    if(subNav) subNav.style.display = subNav.style.display === 'none' ? 'flex' : 'none';
}

function renderShopPage() {
    const t = LANG[currentLang];
    const categories = [
        { id: 'all', msg: currentLang === 'KO' ? '?꾩껜' : 'All' },
        { id: 'boards', msg: currentLang === 'KO' ? '蹂대뱶' : 'Boards' },
        { id: 'clothes', msg: currentLang === 'KO' ? '?섎쪟' : 'Clothes' },
        { id: 'acc', msg: currentLang === 'KO' ? '?낆꽭?쒕━' : 'Accessories' },
        { id: 'coupang', msg: 'Coupang', icon: '?벀' },
        { id: 'olive', msg: 'Olive Young', icon: '?㎢' },
        { id: 'others', msg: currentLang === 'KO' ? '湲고?' : 'Others' }
    ];

    const products = [
        { id: 1, cat: 'boards', name: 'ISA Pro Flowboard 2024', price: 850000, img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400', tag: 'Best' },
        { id: 2, cat: 'clothes', name: 'Performance Rashguard', price: 59000, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', tag: 'New' },
        { id: 3, cat: 'acc', name: 'Professional Grip Tape', price: 25000, img: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?w=400', tag: '' },
        { id: 4, cat: 'coupang', name: '[荑좏뙜異붿쿇] ?쒗븨 ?щĸ (?덉쟾?꾩닔)', price: 42000, img: 'https://images.unsplash.com/photo-1454165833767-027508496b41?w=400', link: 'https://www.coupang.com', tag: 'Affiliate' },
        { id: 5, cat: 'olive', name: '[?щ━釉뚯쁺] 媛뺣젰 ?뚰꽣?꾨（???ы겕由?, price: 18000, img: 'https://images.unsplash.com/photo-1556228720-da3e21cb3549?w=400', link: 'https://www.oliveyoung.co.kr', tag: 'Affiliate' },
        { id: 6, cat: 'others', name: 'ISA Official Keychain', price: 8000, img: 'https://images.unsplash.com/photo-1622323565551-03612f0fb845?w=400', tag: '' }
    ];

    const filtered = selectedShopCategory === 'all' ? products : products.filter(p => p.cat === selectedShopCategory);

    const categoryTabs = categories.map(c => `
        <button class="shop-tab ${selectedShopCategory === c.id ? 'active' : ''}" onclick="selectedShopCategory='${c.id}';renderPage('shop')">
            ${c.icon ? c.icon + ' ' : ''}${c.msg}
        </button>
    `).join('');

    const productCards = filtered.map(p => `
        <div class="shop-card glass-panel fade-in">
            <div class="shop-card-img" style="background-image: url('${p.img}')">
                ${p.tag ? `<span class="shop-tag">${p.tag}</span>` : ''}
            </div>
            <div class="shop-card-info">
                <h3>${p.name}</h3>
                <p class="shop-price">??{p.price.toLocaleString()}</p>
                ${p.link 
                    ? `<a href="${p.link}" target="_blank" class="buy-btn partners">${currentLang === 'KO' ? '?쒗쑕紐곗뿉???ш린' : 'Buy on Mall'}</a>`
                    : `<button class="buy-btn" onclick="alert('${currentLang === 'KO' ? '寃곗젣 紐⑤뱢 ?곕룞 以묒엯?덈떎.' : 'Payment gateway preparing.'}')">${currentLang === 'KO' ? '援щℓ?섍린' : 'Buy Now'}</button>`
                }
            </div>
        </div>
    `).join('');

    return `
    <section class="page-section page-enter shop-page" style="background:var(--bg-slate)">
        <div class="content-container">
            <div class="shop-header">
                <h2 class="game-font">${currentLang === 'KO' ? 'ISA ?λ퉬 ?ㅽ넗?? : 'ISA Equipment Store'}</h2>
                <p>${currentLang === 'KO' ? '?묓쉶 ?몄쬆 ?뺥뭹 諛?異붿쿇 ?쒗븨 湲곗뼱瑜?留뚮굹蹂댁꽭??' : 'Discover certified and recommended surfing gear.'}</p>
            </div>
            
            <div class="shop-banner glass-panel" style="margin-bottom: 40px; border: 1px dashed var(--amber);">
                <div class="banner-content">
                    <h3 style="color: var(--amber)">?럦 ${currentLang === 'KO' ? '?먭꺽利??좎껌???밸퀎 ?쒗깮' : 'Special Offer for Cert Applicants'}</h3>
                    <p>${currentLang === 'KO' ? '吏湲??먭꺽利앹쓣 ?좎껌?섏떆硫?荑좏뙜/?щ━釉뚯쁺 ?꾩슜 ?좎씤 荑좏룿???쒕┰?덈떎!' : 'Apply for cert now and get Coupang/OliveYoung discount coupons!'}</p>
                </div>
            </div>

            <div class="shop-tabs">
                ${categoryTabs}
            </div>

            <div class="shop-grid">
                ${productCards}
            </div>
        </div>
    </section>`;
}

function renderCouponBanner() {
    return `
    <div class="shop-banner glass-panel" style="margin-bottom: 30px; cursor: pointer; border: 1px dashed var(--amber);" onclick="window.location.hash='#/shop'">
        <div class="banner-content">
            <h3 style="color: var(--amber); font-size: 1.2rem; margin-bottom: 5px;">🎁 \</h3>
            <p style="font-size: 0.9rem;">\</p>
        </div>
    </div>`;
}

const style = document.createElement('style');
style.textContent = `
@media (min-width: 1024px) {
    .cert-detail-grid { grid-template-columns: 2fr 1fr !important; }
}`;
document.head.appendChild(style);

// ============================================================
// ★ ISA 포인트 시스템 - 프로필 모달 및 포인트 함수 (v2)
// ============================================================

// ── 프로필 탭 상태 ──
let currentProfileTab = 'info';

// ── 기존 openProfileModal 오버라이드 ──
function openProfileModal() {
    const session = getSession();
    if (!session) return;

    document.getElementById('profile-name').textContent  = session.name;
    document.getElementById('profile-email').textContent = session.email;
    const closeBtn  = document.getElementById('profile-close-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');
    if (closeBtn)  closeBtn.textContent  = currentLang === 'KO' ? '닫기'    : 'Close';
    if (logoutBtn) logoutBtn.textContent = currentLang === 'KO' ? '로그아웃' : 'Logout';

    // 캐시된 포인트 즉시 표시
    const pointsEl = document.getElementById('profile-points-value');
    if (pointsEl) pointsEl.textContent = (session.points || 0).toLocaleString() + ' P';

    // 기본 탭 렌더링
    currentProfileTab = 'info';
    _setTabActive('info');
    renderProfileTab('info', session);

    document.getElementById('profile-modal').classList.add('open');

    // 서버에서 최신 포인트 비동기 갱신
    fetchMyPoints(session.email).then(freshPoints => {
        const el = document.getElementById('profile-points-value');
        if (el) el.textContent = freshPoints.toLocaleString() + ' P';
        session.points = freshPoints;
        saveSession(session);
    }).catch(() => {});
}

function closeProfileModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('profile-modal').classList.remove('open');
}

function switchProfileTab(tab) {
    currentProfileTab = tab;
    _setTabActive(tab);
    renderProfileTab(tab, getSession());
}

function _setTabActive(tab) {
    ['info', 'points', 'earn'].forEach(t => {
        const btn = document.getElementById('tab-' + t + '-btn');
        if (!btn) return;
        btn.style.background = t === tab ? 'rgba(6,182,212,0.2)' : 'transparent';
        btn.style.color      = t === tab ? 'var(--cyan)'          : '#64748b';
        btn.style.fontWeight = t === tab ? '700'                  : '600';
    });
}

function renderProfileTab(tab, session) {
    const content = document.getElementById('profile-tab-content');
    if (!content || !session) return;
    const isKO = currentLang === 'KO';

    if (tab === 'info') {
        content.innerHTML = `
        <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;border:1px solid var(--border);text-align:left">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="color:var(--text-dark);font-size:12px">${isKO ? '연락처' : 'Phone'}</span>
                <span style="color:white;font-size:12px">${session.phone || '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="color:var(--text-dark);font-size:12px">${isKO ? '생년월일' : 'Birth'}</span>
                <span style="color:white;font-size:12px">${session.birth || '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="color:var(--text-dark);font-size:12px">${isKO ? '성별' : 'Gender'}</span>
                <span style="color:white;font-size:12px">${session.gender === 'M' ? (isKO ? '남성' : 'Male') : (isKO ? '여성' : 'Female')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0">
                <span style="color:var(--text-dark);font-size:12px">${isKO ? '가입일' : 'Joined'}</span>
                <span style="color:white;font-size:12px">${session.joined || '-'}</span>
            </div>
        </div>`;

    } else if (tab === 'points') {
        content.innerHTML = `<div style="text-align:center;padding:32px;color:#64748b;font-size:13px">📊 내역 불러오는 중...</div>`;
        fetchMyPointHistory(session.email).then(result => {
            if (!result || !result.data || result.data.length === 0) {
                content.innerHTML = `<div style="text-align:center;padding:32px;color:#64748b;font-size:13px">아직 포인트 내역이 없습니다.</div>`;
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
                        <div style="font-size:11px;color:#64748b">잔액 ${item.balance.toLocaleString()}P</div>
                    </div>
                </div>`).join('');
            content.innerHTML = `
                <div style="font-size:11px;color:#64748b;margin-bottom:8px;text-align:right">총 ${result.data.length}건</div>
                <div style="max-height:240px;overflow-y:auto;padding-right:4px">${rows}</div>`;
        }).catch(() => {
            content.innerHTML = `<div style="text-align:center;padding:32px;color:#ef4444;font-size:12px">내역을 불러오지 못했습니다.</div>`;
        });

    } else if (tab === 'earn') {
        content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;max-height:290px;overflow-y:auto;padding-right:4px">

            <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:14px">
                <div style="margin-bottom:10px">
                    <div style="font-size:13px;font-weight:700;color:white;margin-bottom:2px">📢 SNS 홍보 게시글</div>
                    <div style="font-size:11px;color:#64748b">승인 후 1,000P 적립 · 월 5회 한도</div>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px">
                    <select id="promo-platform" style="flex:0 0 110px;padding:8px;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:8px;color:white;font-size:12px;outline:none">
                        <option value="인스타그램">인스타그램</option>
                        <option value="네이버블로그">네이버 블로그</option>
                        <option value="네이버카페">네이버 카페</option>
                        <option value="유튜브">유튜브</option>
                        <option value="기타SNS">기타 SNS</option>
                    </select>
                    <input id="promo-link" type="url" placeholder="게시글 링크 (https://...)"
                        style="flex:1;padding:8px;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:8px;color:white;font-size:12px;outline:none;min-width:0">
                </div>
                <button onclick="submitPromoPostForm()"
                    style="width:100%;padding:9px;background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(37,99,235,0.15));color:var(--cyan);border:1px solid rgba(6,182,212,0.3);border-radius:8px;font-weight:700;font-size:12px;cursor:pointer">
                    제출하기
                </button>
                <div id="promo-msg" style="font-size:11px;margin-top:6px;color:#94a3b8;text-align:center;min-height:16px"></div>
            </div>

            <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:14px">
                <div style="margin-bottom:10px">
                    <div style="font-size:13px;font-weight:700;color:white;margin-bottom:2px">⭐ 리뷰 작성</div>
                    <div style="font-size:11px;color:#64748b">200P 적립 · 하루 5회 한도</div>
                </div>
                <select id="review-target"
                    style="width:100%;padding:8px;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:8px;color:white;font-size:12px;outline:none;margin-bottom:6px">
                    <option value="자격증 과정">자격증 과정 리뷰</option>
                    <option value="장비 스토어">장비 스토어 리뷰</option>
                    <option value="강사 매칭">강사 매칭 서비스 리뷰</option>
                    <option value="협회 서비스">협회 서비스 전체 리뷰</option>
                </select>
                <textarea id="review-text" placeholder="리뷰 내용을 입력하세요 (20자 이상)"
                    style="width:100%;padding:8px;background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:8px;color:white;font-size:12px;outline:none;resize:none;height:62px;box-sizing:border-box"></textarea>
                <button onclick="submitReviewForm()"
                    style="width:100%;margin-top:6px;padding:9px;background:linear-gradient(135deg,rgba(234,179,8,0.15),rgba(239,68,68,0.15));color:#facc15;border:1px solid rgba(234,179,8,0.3);border-radius:8px;font-weight:700;font-size:12px;cursor:pointer">
                    리뷰 등록 +200P
                </button>
                <div id="review-msg" style="font-size:11px;margin-top:6px;color:#94a3b8;text-align:center;min-height:16px"></div>
            </div>
        </div>`;
    }
}

// ── 포인트 API 함수 ──

async function fetchMyPoints(email) {
    const url = `${GOOGLE_AUTH_URL}?action=getPoints&email=${encodeURIComponent(email)}`;
    try {
        const res    = await fetch(url);
        const result = await res.json();
        if (result.status === 'success') return result.points;
    } catch(e) { console.warn('포인트 조회 실패:', e); }
    return 0;
}

async function fetchMyPointHistory(email) {
    const url = `${GOOGLE_AUTH_URL}?action=getPointHistory&email=${encodeURIComponent(email)}`;
    try {
        const res = await fetch(url);
        return await res.json();
    } catch(e) { console.warn('포인트 내역 조회 실패:', e); }
    return { data: [], total: 0 };
}

async function submitPromoPostForm() {
    const session  = getSession();
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
        const res = await fetch(GOOGLE_AUTH_URL, {
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
        const res = await fetch(GOOGLE_AUTH_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'submitReview', email: session.email, name: session.name, reviewText, targetType })
        });
        const result = await res.json();
        if (msg) { msg.style.color = result.status === 'success' ? '#22c55e' : '#ef4444'; msg.textContent = result.message; }
        if (result.status === 'success') {
            const newPoints = result.balance || 0;
            const pointEl   = document.getElementById('profile-points-value');
            if (pointEl) pointEl.textContent = newPoints.toLocaleString() + ' P';
            session.points = newPoints;
            saveSession(session);
            const textEl = document.getElementById('review-text');
            if (textEl) textEl.value = '';
        }
    } catch(e) {
        if (msg) { msg.style.color = '#ef4444'; msg.textContent = '등록 중 오류가 발생했습니다.'; }
    }
}

// ── 포인트 적립 토스트 알림 ──
function showPointsToast(amount, reason) {
    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed;top:110px;left:50%;transform:translateX(-50%);z-index:9999;',
        'background:linear-gradient(135deg,rgba(15,23,42,0.97),rgba(30,58,138,0.95));',
        'border:1px solid rgba(234,179,8,0.55);padding:16px 28px;border-radius:16px;',
        'color:white;font-weight:700;font-size:14px;text-align:center;min-width:220px;',
        'box-shadow:0 8px 32px rgba(234,179,8,0.2);'
    ].join('');
    toast.innerHTML = `🏆 <span style="color:#facc15">+${amount.toLocaleString()}P</span> 적립!<br>
        <span style="font-size:12px;color:#94a3b8;font-weight:400">${reason}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity    = '0';
        setTimeout(() => toast.remove(), 420);
    }, 3200);
}

// ── 회원가입 성공 시 포인트 토스트 자동 표시 패치 ──
// updateNavbarAuth가 처음 유저로 호출될 때 sessionStorage 플래그 확인
(function patchNavbarForSignupToast() {
    const _orig = window.updateNavbarAuth;
    if (!_orig) return;
    window.updateNavbarAuth = function(user) {
        _orig.call(this, user);
        if (user && sessionStorage.getItem('isa_signup_toast')) {
            sessionStorage.removeItem('isa_signup_toast');
            setTimeout(() => showPointsToast(500, '가입 축하 포인트'), 400);
        }
    };
})();

// ── handleLogin 패치: 회원가입 성공 시 sessionStorage 플래그 설정 ──
(function patchHandleLoginForPoints() {
    const _origHandleLogin = window.handleLogin;
    if (!_origHandleLogin) return;
    window.handleLogin = async function(e) {
        const wasSignup = !isLoginMode; // true면 회원가입 모드
        await _origHandleLogin.call(this, e);
        // 회원가입 완료 후 세션이 새로 생겼으면 토스트 플래그 설정
        if (wasSignup && getSession()) {
            sessionStorage.setItem('isa_signup_toast', '1');
        }
    };
})();
