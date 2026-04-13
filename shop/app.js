// ISA Shop - Application Logic
let currentLang = 'KO';
let activeCategory = 'all';
let isLoginMode = true;

// 요소 선택 유틸리티
const $ = id => document.getElementById(id);

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log("ISA 독립 스토어 로드 완료");
    updateUI();
    initAuth();
});

// 언어 토글
function toggleLang() {
    currentLang = currentLang === 'KO' ? 'EN' : 'KO';
    updateUI();
}

// UI 전체 언어 업데이트
function updateUI() {
    const t = LANG[currentLang];
    
    // 버튼 및 헤더 텍스트
    $('lang-label').textContent = currentLang;
    $('hero-title').textContent = t.hero.title;
    $('hero-desc').textContent = t.hero.desc;
    
    // 배너 텍스트
    $('banner-title').textContent = t.banner.title;
    $('banner-desc').innerHTML = `${t.banner.desc1}<b>${t.banner.bold1}</b>${t.banner.desc2}<b>${t.banner.bold2}</b>${t.banner.desc3}<span style="color:white; text-decoration:underline;">${t.banner.link}</span>`;
    
    // 모달 텍스트 (안전하게 참조)
    if($('modal-title')) $('modal-title').textContent = t.modal.title;
    if($('modal-btn')) $('modal-btn').textContent = t.btn.confirm;
    
    // 결제 폼 텍스트
    $('checkout-title').textContent = t.checkout.title;
    $('lbl-name').textContent = t.checkout.name;
    $('lbl-phone').textContent = t.checkout.phone;
    $('lbl-zip').textContent = t.checkout.zip;
    $('lbl-addr').textContent = t.checkout.addr;
    $('lbl-detail').textContent = t.checkout.detail;
    $('lbl-request').textContent = t.checkout.request;
    $('lbl-agree').textContent = t.checkout.agree;
    $('btn-submit-order').textContent = t.checkout.submit;

    // 로그인 모달 텍스트
    $('login-modal-title').textContent = isLoginMode ? t.auth.titleLogin : t.auth.titleSignup;
    $('lbl-auth-email').textContent = t.auth.email;
    $('lbl-auth-pw').textContent = t.auth.pw;
    $('btn-auth-submit').textContent = isLoginMode ? t.auth.titleLogin : t.auth.titleSignup;
    $('auth-toggle-text').textContent = isLoginMode ? t.auth.toSignup : t.auth.toLogin;
    
    if($('lbl-auth-name')) $('lbl-auth-name').textContent = t.auth.name;

    // 배송 요청사항 옵션 초기화
    const reqSelect = $('order-request');
    reqSelect.innerHTML = t.checkout.reqOptions.map(opt => `<option value="${opt.val}">${opt.text}</option>`).join('');
    
    // 장바구니 텍스트
    $('cart-btn').innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ${t.header.cart} (0)`;

    // 인증 버튼 업데이트
    updateNavbarAuth(getSession());

    // 다시 렌더링
    renderTabs();
    renderProducts();
}

// 탭 렌더링
function renderTabs() {
    const container = $('category-container');
    const categories = LANG[currentLang].categories;
    
    container.innerHTML = categories.map(cat => `
        <button class="tab-btn ${activeCategory === cat.id ? 'active' : ''}" 
                onclick="setCategory('${cat.id}')">
            ${cat.icon ? cat.icon + ' ' : ''}${cat.name}
        </button>
    `).join('');
}

// 카테고리 설정
function setCategory(catId) {
    activeCategory = catId;
    renderTabs();
    renderProducts();
}

// 상품 렌더링
function renderProducts() {
    const container = $('product-container');
    const t = LANG[currentLang];
    
    let filtered = SHOP_DATA;
    if (activeCategory !== 'all') {
        filtered = SHOP_DATA.filter(p => p.cat === activeCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-dim);">${t.empty}</div>`;
        return;
    }

    container.innerHTML = filtered.map((p, index) => {
        const animationDelay = index * 0.1;
        const isPartner = ['coupang', 'olive'].includes(p.cat);
        const tagText = p.tag ? p.tag[currentLang] : '';
        const descText = p.desc[currentLang];
        
        // 제휴 상품의 경우 별도의 UI 스타일 적용
        const btnHTML = isPartner 
            ? `<a href="${p.link}" target="_blank" class="btn-buy partner">${t.btn.partner}</a>`
            : `<button class="btn-buy native" onclick="openCheckout()">${t.btn.native}</button>`;

        const tagHTML = tagText ? `<div class="product-tag ${p.cat}">${tagText}</div>` : '';

        return `
        <div class="product-card glass-panel fade-in" style="animation-delay: ${animationDelay}s">
            <div class="product-img" style="background-image: url('${p.img}')">
                ${tagHTML}
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${descText}</p>
                <div class="product-footer">
                    <span class="product-price">₩${p.price.toLocaleString()}</span>
                    <span class="product-rating">★ ${p.rating}</span>
                </div>
                ${btnHTML}
            </div>
        </div>
        `;
    }).join('');
}

// 공통 모달 조작 함수
function openModal(msg) {
    $('modal-msg').textContent = msg;
    $('sys-modal').classList.add('open');
}
function closeModal() {
    $('sys-modal').classList.remove('open');
}

// 결제 모달 제어
function openCheckout() {
    const user = getSession();
    if (!user) {
        alert(currentLang === 'KO' ? '구매를 위해 먼저 로그인해주세요.' : 'Please login first to purchase.');
        openLoginModal();
        return;
    }
    if(user && user.name) {
        $('order-name').value = user.name;
    }
    $('checkout-modal').classList.add('open');
}
function closeCheckout() {
    $('checkout-modal').classList.remove('open');
}

// 주문 제출
function submitOrder(e) {
    e.preventDefault();
    const t = LANG[currentLang];
    
    // 간단한 데이터 수집 시뮬레이션
    const orderData = {
        name: $('order-name').value,
        phone: $('order-phone').value,
        zip: $('order-zip').value,
        address: $('order-addr').value,
        detail: $('order-detail').value,
        request: $('order-request').value
    };

    console.log("주문 접수 데이터:", orderData);
    
    // 성공 피드백
    alert(t.checkout.success);
    closeCheckout();
    $('checkout-form').reset();
}

// ===== 인증 및 세션 관리 =====
function initAuth() {
    updateNavbarAuth(getSession());
}

function getSession() {
    try { return JSON.parse(localStorage.getItem('isa_session_v1')); }
    catch(e) { return null; }
}

function updateNavbarAuth(user) {
    const label = $('login-label');
    const t = LANG[currentLang];
    if (!label) return;
    
    if (user && user.name) {
        label.textContent = user.name;
    } else {
        label.textContent = t.header.login;
    }
}

function handleAuthClick() {
    const user = getSession();
    const t = LANG[currentLang];
    
    if (user) {
        if (confirm(t.auth.logoutConfirm)) {
            localStorage.removeItem('isa_session_v1');
            updateNavbarAuth(null);
            updateUI();
        }
    } else {
        openLoginModal();
    }
}

function openLoginModal() {
    $('login-modal').classList.add('open');
}

function closeLoginModal() {
    $('login-modal').classList.remove('open');
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    $('signup-fields').style.display = isLoginMode ? 'none' : 'block';
    updateUI();
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = $('auth-email').value;
    const name = isLoginMode ? email.split('@')[0] : ($('auth-name').value || email.split('@')[0]);
    
    const session = { name: name, email: email };
    localStorage.setItem('isa_session_v1', JSON.stringify(session));
    
    alert(LANG[currentLang].auth.welcome.replace('님', name + '님').replace('Welcome, ', 'Welcome, ' + name));
    closeLoginModal();
    updateUI();
}

// 전역 노출
window.toggleLang = toggleLang;
window.setCategory = setCategory;
window.openModal = openModal;
window.closeModal = closeModal;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.submitOrder = submitOrder;
window.handleAuthClick = handleAuthClick;
window.closeLoginModal = closeLoginModal;
window.toggleAuthMode = toggleAuthMode;
window.handleLoginSubmit = handleLoginSubmit;
