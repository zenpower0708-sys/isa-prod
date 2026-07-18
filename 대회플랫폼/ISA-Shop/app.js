// ISA Shop - Application Logic
let currentLang = 'KO';
let activeCategory = 'all';

// 요소 선택 유틸리티
const $ = id => document.getElementById(id);

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log("ISA 독립 스토어 로드 완료");
    updateUI();
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
    
    // 모달 텍스트
    $('modal-title').textContent = t.modal.title;
    $('modal-btn').textContent = t.btn.confirm;
    
    // 장바구니 텍스트
    $('cart-btn').innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ${t.header.cart} (0)`;

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
            : `<button class="btn-buy native" onclick="openModal('${t.modal.readyMsg}')">${t.btn.native}</button>`;

        const tagHTML = tagText ? `<div class="product-tag">${tagText}</div>` : '';

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
