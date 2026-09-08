// ============================================================
// ISA 자산관리 현황 - 메인 앱
// ============================================================

const SESSION_KEY = 'isa_session_v1';

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user.expiresAt && Date.now() > user.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return user;
    }
    const raw2 = sessionStorage.getItem(SESSION_KEY);
    if (raw2) return JSON.parse(raw2);
    return null;
  } catch(e) { return null; }
}

// 숫자 → ₩1,000,000 형식
function fmt(n) {
  return '₩' + Number(n).toLocaleString('ko-KR');
}

// ── 헤더 HTML ──
function headerHTML() {
  return `
  <div class="gov-bar">
    <div class="gov-badge">
      <svg viewBox="0 0 100 100" style="width:18px;height:18px;">
        <circle cx="50" cy="50" r="48" fill="white"/>
        <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="#c1272d"/>
        <path d="M50 98 A48 48 0 0 1 50 2 A24 24 0 0 0 50 50 A24 24 0 0 1 50 98" fill="#0047a0"/>
      </svg>
      <span>문화체육관광부</span>
    </div>
    <div class="gov-badge">
      <svg viewBox="0 0 100 100" style="width:18px;height:18px;">
        <circle cx="50" cy="50" r="48" fill="#1a3a5c" stroke="#c5a23c" stroke-width="3"/>
        <text x="50" y="62" text-anchor="middle" fill="#c5a23c" font-size="40">⚓</text>
      </svg>
      <span>해양경찰청</span>
    </div>
  </div>
  <header class="header">
    <div class="header-inner">
      <a class="logo-area" href="/">
        <div class="logo-emblem">
          <img src="/images/isa-emblem.png" alt="ISA" onerror="this.style.display='none'">
        </div>
        <div>
          <div class="logo-name">국제인공서핑협회</div>
          <div class="logo-sub-text">INTL ARTIFICIAL SURFING ASSOC.</div>
        </div>
      </a>
      <a class="back-btn" href="/">← 메인으로</a>
    </div>
  </header>`;
}

// ── 잠금 화면 ──
function lockHTML() {
  return `
  <div class="lock-screen">
    <div class="lock-icon">🔒</div>
    <div class="lock-title">로그인이 필요합니다</div>
    <div class="lock-desc">자산관리 현황은 로그인한 회원에게만 공개됩니다.<br>ISA 계정으로 로그인 후 이용해주세요.</div>
    <a class="lock-btn" href="/?openLogin=1&redirect=/assets/">로그인하러 가기</a>
  </div>`;
}

// ── 메인 대시보드 ──
function dashboardHTML(user) {
  const cfg = ASSET_CONFIG;
  const total = cfg.total;

  // 항목별 카드
  const cardsHTML = cfg.items.map(item => {
    const hasAmount = item.amount !== null;
    const ratio = hasAmount ? ((item.amount / total) * 100).toFixed(1) : 0;

    // 금액 표시 영역
    const amountDisplay = hasAmount
      ? `<div class="asset-amount" style="color:${item.color};">${fmt(item.amount)}</div>`
      : item.statusText
        ? `<div class="asset-status">${item.statusText}</div>`
        : `<div class="asset-status-empty">—</div>`;

    // 비율 바 (금액 있는 항목만)
    const barHTML = hasAmount
      ? `<div class="asset-bar-wrap">
           <div class="asset-bar" style="width:${ratio}%;background:${item.color};box-shadow:0 0 8px ${item.glowColor};"></div>
         </div>
         <div class="asset-ratio">${ratio}%</div>`
      : `<div class="asset-bar-wrap"><div class="asset-bar" style="width:0%;background:${item.color};"></div></div>
         <div class="asset-ratio" style="color:var(--text-muted);">-</div>`;

    return `
    <div class="asset-card">
      <div class="asset-icon">${item.icon}</div>
      <div class="asset-label">${item.label}</div>
      ${amountDisplay}
      ${item.desc ? `<div class="asset-desc">${item.desc}</div>` : '<div class="asset-desc"></div>'}
      ${barHTML}
    </div>`;
  }).join('');

  // 비율 통합 바 (금액 있는 항목만)
  const ratioSegments = cfg.items
    .filter(i => i.amount !== null)
    .map(item => {
      const ratio = ((item.amount / total) * 100).toFixed(1);
      return `<div class="ratio-segment" style="width:${ratio}%;background:${item.color};"></div>`;
    }).join('');

  // 범례
  const legendHTML = cfg.items.map(item => {
    const ratio = item.amount !== null ? ((item.amount / total) * 100).toFixed(1) + '%' : '-';
    return `
    <div class="ratio-legend-item">
      <div class="legend-dot" style="background:${item.color};"></div>
      <span>${item.label} ${ratio}</span>
    </div>`;
  }).join('');

  // 변동 내역 테이블
  const historyRows = cfg.history.map(h => `
    <tr>
      <td>${h.date}</td>
      <td>${h.category}</td>
      <td>${h.desc}</td>
      <td class="${h.type === 'in' ? 'amount-in' : 'amount-out'}">${h.type === 'in' ? '+' : '-'}${fmt(h.amount)}</td>
      <td class="balance-val">${fmt(h.balance)}</td>
    </tr>
  `).join('');

  return `
  <div class="page-header">
    <div class="page-tag">🏛️ ASSET MANAGEMENT</div>
    <div class="page-title">자산관리 현황</div>
    <div class="page-subtitle">${user.name}님 안녕하세요 &nbsp;·&nbsp; 기준일: ${cfg.baseDate}</div>
  </div>

  <!-- ① 총 자산 요약 -->
  <div class="total-card">
    <div class="total-left">
      <div class="total-label">💰 총 자산</div>
      <div class="total-amount">${fmt(total)}</div>
      <div class="total-won">오억 원 (₩500,000,000)</div>
    </div>
    <div class="total-right">
      <div class="total-date-label">기준일</div>
      <div class="total-date">${cfg.baseDate}</div>
      <div class="total-badge">✅ 정상</div>
    </div>
  </div>

  <!-- ② 항목별 자산 카드 -->
  <div class="section-title"><div class="section-bar"></div>항목별 자산</div>
  <div class="assets-grid">${cardsHTML}</div>

  <!-- ③ 비율 바 -->
  <div class="ratio-section">
    <div class="section-title"><div class="section-bar"></div>자산 구성 비율</div>
    <div class="ratio-bar-wrap">${ratioSegments}</div>
    <div class="ratio-legend">${legendHTML}</div>
  </div>

  <!-- ④ 변동 내역 -->
  <div class="history-section">
    <div class="section-title"><div class="section-bar"></div>자산 변동 내역</div>
    <div class="history-table-wrap">
      <table class="history-table">
        <thead>
          <tr>
            <th>날짜</th><th>항목</th><th>내용</th><th>금액</th><th>잔액</th>
          </tr>
        </thead>
        <tbody>${historyRows}</tbody>
      </table>
    </div>
  </div>

  <!-- ⑤ 안내 -->
  <div class="notice-box">
    ※ 본 자산 현황은 협회 내부 관리 자료이며, 실제 자산과 일부 차이가 있을 수 있습니다.<br>
    ※ 자산 변동 사항은 관리자가 config.js 파일을 수정하여 업데이트합니다.<br>
    ※ 문의: info@isa-surfing.org
  </div>`;
}

// ── 렌더 ──
function render() {
  const app = document.getElementById('app');
  const user = getSession();
  app.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    ${headerHTML()}
    <div class="container">
      ${user ? dashboardHTML(user) : lockHTML()}
    </div>`;
}

render();
