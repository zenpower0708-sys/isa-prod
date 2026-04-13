// ========================================================
// ISA 공제회 시스템 - 가입 + 실비 청구 (구글시트 연동)
// ========================================================
(function(){
'use strict';

// === Google Sheets API ===
const API = {
  url(){ return (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SCRIPT_URL) || ''; },
  enabled(){ return (typeof CONFIG !== 'undefined' && CONFIG.USE_GOOGLE_SHEETS && CONFIG.GOOGLE_SCRIPT_URL); },

  async post(data){
    if(!this.enabled()) return null;
    try {
      const r = await fetch(this.url(), {method:'POST', mode:'no-cors',
        headers:{'Content-Type':'text/plain'},
        body: JSON.stringify(data)});
      // no-cors returns opaque response, we just trust it worked
      return {status:'success'};
    } catch(e){ console.error('API POST error:', e); return null; }
  },

  async get(action, params={}){
    if(!this.enabled()) return null;
    try {
      const qs = new URLSearchParams({action, ...params}).toString();
      const r = await fetch(this.url() + '?' + qs);
      return await r.json();
    } catch(e){ console.error('API GET error:', e); return null; }
  }
};

// === Local Storage Fallback ===
const LOCAL = {
  getMembers(){ return JSON.parse(localStorage.getItem('isa_mutualaid_history')||'[]'); },
  saveMembers(d){ localStorage.setItem('isa_mutualaid_history', JSON.stringify(d)); },
  getClaims(){ return JSON.parse(localStorage.getItem('isa_claim_history')||'[]'); },
  saveClaims(d){ localStorage.setItem('isa_claim_history', JSON.stringify(d)); },
};

// === State ===
const S = {
  screen:'plans', selectedPlan:null,
  agreeTerms:false, agreePrivacy:false, agreeAll:false,
  termsOpen:false, privacyOpen:false,
  name:'', phone:'', birth:'', gender:'M', email:'',
  address:'', emergencyName:'', emergencyPhone:'',
  hasCondition:'no', conditionDetail:'', hasOtherInsurance:'no',
  payMethod:'card', certNumber:'', certDate:'',
  claimCertNumber:'', claimName:'', claimPhone:'',
  claimVerified:false, claimRecord:null,
  accidentDate:'', accidentTime:'', accidentLocation:'',
  accidentDesc:'', injuryPart:'', hospitalName:'',
  treatmentDate:'', treatmentDesc:'',
  totalMedical:0, nationalIns:0, selfPay:0,
  claimFiles:{diagnosis:null,receipt:null,detail:null,proof:null,id:null},
  claimAgree:false, claimNumber:'',
  loading:false
};

function render(){
  document.getElementById('app').innerHTML = `
    <div class="bg-grid"></div><div class="bg-glow-1"></div><div class="bg-glow-2"></div>
    ${headerHTML()}
    <div class="container">
      ${stepsHTML()}
      ${screenHTML()}
    </div>
    ${S.loading?loadingHTML():''}`;
  bindEvents();
}

function loadingHTML(){
  return `<div style="position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;">
    <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--red-400);border-radius:50%;animation:spin 1s linear infinite;"></div>
    <p style="color:var(--text-secondary);font-size:14px;">처리 중...</p>
    <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
  </div>`;
}

function headerHTML(){
  return `
    <div id="gov-bar" style="display: flex; justify-content: center; gap: 24px; padding: 10px 0; background-color: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; width: 100%;">
        <div class="gov-badge" style="display: flex; align-items: center; gap: 8px; opacity: 0.9;">
            <svg class="gov-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;">
                <circle cx="50" cy="50" r="48" fill="white"/>
                <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2" fill="#c1272d"/>
                <path d="M50 98 A48 48 0 0 1 50 2 A24 24 0 0 0 50 50 A24 24 0 0 1 50 98" fill="#0047a0"/>
            </svg>
            <span id="gov-culture" style="font-size: 13px; font-weight: 700; color: #f8fafc;">문화체육관광부</span>
        </div>
        <div class="gov-badge" style="display: flex; align-items: center; gap: 8px; opacity: 0.9;">
            <svg class="gov-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;">
                <circle cx="50" cy="50" r="48" fill="#1a3a5c" stroke="#c5a23c" stroke-width="3"/>
                <text x="50" y="42" text-anchor="middle" fill="#c5a23c" font-size="32" font-weight="bold">⚓</text>
                <text x="50" y="70" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">KOREA</text>
                <text x="50" y="84" text-anchor="middle" fill="#c5a23c" font-size="10" font-weight="bold" font-family="sans-serif">COAST GUARD</text>
            </svg>
            <span id="gov-coast" style="font-size: 13px; font-weight: 700; color: #f8fafc;">해양경찰청</span>
        </div>
    </div>
    <header class="header" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1);"><div class="header-inner">
    <div class="logo-area" onclick="window.location.href='/'" style="cursor:pointer; display: flex; align-items: center; gap: 14px; text-decoration: none;">
      <div class="logo-emblem-wrap" style="position: relative; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: linear-gradient(135deg, #0f172a, #1e3a8a); border: 1px solid rgba(6, 182, 212, 0.3);">
          <img src="/images/isa-emblem.png" alt="ISA" class="logo-emblem-img" onerror="this.src='https://antigravity.google/favicon.ico'; this.onerror=null;" style="width: 80%; height: 80%; object-fit: contain;">
      </div>
      <div class="logo-text">
        <h1 style="margin:0; font-size: 19px; font-weight: 900; letter-spacing: 1px; color: #fff; font-family: 'Noto Sans KR', sans-serif;">국제인공서핑협회</h1>
        <p style="margin:2px 0 0; font-size: 10px; color: rgba(6,182,212,0.9); letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">Intl Artificial Surfing Assoc.</p>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;">
      <button class="header-badge" data-action="home" style="cursor:pointer; padding: 6px 14px; border: 1px solid rgba(6,182,212,0.4);border-radius:6px; background:rgba(6,182,212,0.15);color:#22d3ee; font-weight:700; font-size:13px;">🛡️ 공제회 홈</button>
      <button class="header-badge" data-action="go-claim" style="cursor:pointer; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius:6px; background:rgba(255,255,255,0.05); color:#fff; font-weight:700; font-size:13px;">📋 사고청구</button>
    </div>
  </div></header>`;
}

function stepsHTML(){
  const joinSteps=['plans','terms','info','payment','complete'];
  const claimSteps=['claim-start','claim-form','claim-upload','claim-done'];
  if(S.screen==='plans') return '';
  if(joinSteps.includes(S.screen)){
    return stepBarHTML(['플랜','약관','정보','결제','완료'], joinSteps.indexOf(S.screen));
  }
  if(claimSteps.includes(S.screen)){
    return stepBarHTML(['본인확인','사고·치료','서류첨부','접수완료'], claimSteps.indexOf(S.screen));
  }
  return '';
}

function stepBarHTML(labels, ci){
  return `<div class="steps-bar">${labels.map((l,i)=>{
    const done=i<ci, active=i===ci;
    return `${i>0?`<div class="step-line ${done?'done':''}"></div>`:''}
    <div class="step-item">
      <div class="step-circle ${done?'done':''} ${active?'active':''}">${done?'✓':i+1}</div>
      <span class="step-label ${done?'done':''} ${active?'active':''}">${l}</span>
    </div>`;
  }).join('')}</div>`;
}

function screenHTML(){
  switch(S.screen){
    case 'plans': return plansHTML();
    case 'terms': return termsHTML();
    case 'info': return infoHTML();
    case 'payment': return paymentHTML();
    case 'complete': return completeHTML();
    case 'claim-start': return claimStartHTML();
    case 'claim-form': return claimFormHTML();
    case 'claim-upload': return claimUploadHTML();
    case 'claim-done': return claimDoneHTML();
    default: return '';
  }
}

// ===================== JOIN SCREENS =====================
function plansHTML(){
  return `<div class="screen active">
    <div class="plans-hero">
      <div class="shield">🛡️</div>
      <h2>ISA 안전 공제회</h2>
      <p>인공서핑 실습 중 발생하는 부상에 대한 실비 치료비를 보상합니다.</p>
    </div>
    <div class="plans-grid">${PLANS.map(p=>`
      <div class="plan-card ${p.popular?'popular':''}" data-action="choose-plan" data-id="${p.id}">
        ${p.popular?'<div class="plan-popular-badge">인기</div>':''}
        <div class="plan-name">${p.name}</div>
        <div class="plan-duration">${p.duration} Coverage</div>
        <div class="plan-price"><span class="currency">₩</span><span class="amount">${p.price.toLocaleString()}</span><span class="period">/ 기간</span></div>
        <ul class="plan-features">${p.features.map(f=>`<li><span class="icon">✓</span>${f}</li>`).join('')}</ul>
        <button class="plan-btn ${p.popular?'plan-btn-primary':'plan-btn-default'}">가입하기</button>
      </div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:40px;padding-top:40px;border-top:1px solid var(--border);">
      <h3 style="font-size:22px;font-weight:800;margin-bottom:10px;">이미 가입하셨나요?</h3>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;">실습 중 부상을 당하셨다면 공제금을 청구하세요.</p>
      <button class="btn btn-secondary btn-lg" data-action="go-claim" style="gap:10px;">📋 공제금 청구하기</button>
    </div>
  </div>`;
}

function termsHTML(){
  const plan=PLANS.find(p=>p.id===S.selectedPlan);
  return `<div class="screen active">
    <div class="section-title"><div class="bar"></div>약관 동의</div>
    <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px;line-height:1.6;">
      <strong>${plan?plan.nameKR:''}</strong> 가입을 위해 아래 약관에 동의해주세요.</p>
    <div class="agree-all" data-action="toggle-all"><div class="agree-row">
      <div class="checkbox ${S.agreeAll?'checked':''}">✓</div>
      <div class="agree-label"><strong>전체 동의</strong></div>
    </div></div>
    <div class="terms-box">
      <div class="terms-header" data-action="toggle-terms"><h4>📋 공제회 이용약관 (필수)</h4><span class="terms-toggle ${S.termsOpen?'open':''}">▼</span></div>
      <div class="terms-content ${S.termsOpen?'show':''}">${TERMS_MUTUAL_AID}</div>
      <div class="agree-row" data-action="agree-terms" style="border-top:1px solid var(--border);">
        <div class="checkbox ${S.agreeTerms?'checked':''}">✓</div>
        <div class="agree-label">공제회 이용약관에 <strong>동의합니다</strong></div>
      </div>
    </div>
    <div class="terms-box">
      <div class="terms-header" data-action="toggle-privacy"><h4>🔒 개인정보처리방침 (필수)</h4><span class="terms-toggle ${S.privacyOpen?'open':''}">▼</span></div>
      <div class="terms-content ${S.privacyOpen?'show':''}">${TERMS_PRIVACY}</div>
      <div class="agree-row" data-action="agree-privacy" style="border-top:1px solid var(--border);">
        <div class="checkbox ${S.agreePrivacy?'checked':''}">✓</div>
        <div class="agree-label">개인정보처리방침에 <strong>동의합니다</strong></div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="go" data-to="plans">← 이전</button>
      <button class="btn btn-primary btn-lg" data-action="go" data-to="info" ${!(S.agreeTerms&&S.agreePrivacy)?'disabled':''}>동의하고 계속 →</button>
    </div>
  </div>`;
}

function infoHTML(){
  const plan=PLANS.find(p=>p.id===S.selectedPlan);
  return `<div class="screen active">
    <div class="section-title"><div class="bar"></div>가입자 정보 입력</div>
    <div class="summary-card"><h4>📦 선택한 플랜</h4>
      <div class="summary-row"><span class="label">플랜</span><span class="value">${plan?plan.name:''} (${plan?plan.nameKR:''})</span></div>
      <div class="summary-row"><span class="label">보장 기간</span><span class="value">${plan?plan.duration:''}</span></div>
      <div class="summary-row"><span class="label">보상 한도</span><span class="value">${plan?plan.coverage:''}</span></div>
      <div class="summary-total"><span class="label">공제회비</span><span class="amount">₩${plan?plan.price.toLocaleString():''}</span></div>
    </div>
    <div class="form-card"><div class="form-card-title">👤 기본 정보</div>
      <div class="form-group"><label class="form-label">이름 (실명)<span class="required">*</span></label>
        <input type="text" class="form-input" data-field="name" value="${S.name}" placeholder="홍길동"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">연락처<span class="required">*</span></label>
          <input type="tel" class="form-input" data-field="phone" value="${S.phone}" placeholder="010-1234-5678"></div>
        <div class="form-group"><label class="form-label">생년월일 (6자리)<span class="required">*</span></label>
          <input type="text" class="form-input" data-field="birth" value="${S.birth}" placeholder="990101" maxlength="6"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">성별<span class="required">*</span></label>
          <select class="form-select" data-field="gender"><option value="M" ${S.gender==='M'?'selected':''}>남성</option><option value="F" ${S.gender==='F'?'selected':''}>여성</option></select></div>
        <div class="form-group"><label class="form-label">이메일</label>
          <input type="email" class="form-input" data-field="email" value="${S.email}" placeholder="example@email.com"></div>
      </div>
    </div>
    <div class="form-card"><div class="form-card-title">🏥 건강 고지</div>
      <div class="form-group"><label class="form-label">현재 치료 중이거나 과거 6개월 이내 치료받은 질환이 있습니까?<span class="required">*</span></label>
        <div class="health-question"><label><input type="radio" name="condition" value="no" ${S.hasCondition==='no'?'checked':''} data-field="hasCondition"> 아니오</label></div>
        <div class="health-question"><label><input type="radio" name="condition" value="yes" ${S.hasCondition==='yes'?'checked':''} data-field="hasCondition"> 예</label></div>
        ${S.hasCondition==='yes'?`<div class="form-group" style="margin-top:12px;"><input type="text" class="form-input" data-field="conditionDetail" value="${S.conditionDetail}" placeholder="질환명, 치료 기간 등"></div>`:''}
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="go" data-to="terms">← 이전</button>
      <button class="btn btn-primary btn-lg" data-action="go-payment">결제 진행 →</button>
    </div>
  </div>`;
}

function paymentHTML(){
  const plan=PLANS.find(p=>p.id===S.selectedPlan);
  return `<div class="screen active">
    <div class="section-title"><div class="bar"></div>결제</div>
    <div class="summary-card"><h4>📦 가입 요약</h4>
      <div class="summary-row"><span class="label">가입자</span><span class="value">${S.name}</span></div>
      <div class="summary-row"><span class="label">연락처</span><span class="value">${S.phone}</span></div>
      <div class="summary-row"><span class="label">플랜</span><span class="value">${plan?plan.name:''} (${plan?plan.duration:''})</span></div>
      <div class="summary-row"><span class="label">보상 한도</span><span class="value">${plan?plan.coverage:''}</span></div>
      <div class="summary-total"><span class="label">결제 금액</span><span class="amount">₩${plan?plan.price.toLocaleString():''}</span></div>
    </div>
    <div class="form-card"><div class="form-card-title">💳 결제 수단</div>
      <div class="payment-grid">
        ${['card','easy','bank','paypal'].map(m=>{
          const d={card:{i:'💳',n:'신용카드',d:'국내/해외'},easy:{i:'📱',n:'간편결제',d:'토스/카카오'},bank:{i:'🏦',n:'계좌이체',d:'실시간'},paypal:{i:'🌐',n:'PayPal',d:'해외'}}[m];
          return `<div class="payment-option ${S.payMethod===m?'selected':''}" data-action="pay-method" data-method="${m}">
            <div class="pay-icon">${d.i}</div><div class="pay-name">${d.n}</div><div class="pay-desc">${d.d}</div></div>`;
        }).join('')}
      </div>
      <div class="security-note">🔒 <span>PortOne / PG사 보안 결제</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="go" data-to="info">← 이전</button>
      <button class="btn btn-primary btn-lg" data-action="process-payment">🔐 ₩${plan?plan.price.toLocaleString():''} 결제하기</button>
    </div>
  </div>`;
}

function completeHTML(){
  const plan=PLANS.find(p=>p.id===S.selectedPlan);
  const today=new Date(), end=new Date(today);
  if(plan){if(plan.id==='day')end.setDate(end.getDate()+1);else if(plan.id==='week')end.setDate(end.getDate()+7);else end.setDate(end.getDate()+30);}
  const fmt=d=>`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  return `<div class="screen active">
    <div class="result-hero">
      <div class="result-check"><span class="icon">✅</span></div>
      <h2 style="font-size:30px;font-weight:900;margin-bottom:10px;">공제회 가입 완료!</h2>
      <p style="color:var(--text-secondary);font-size:15px;line-height:1.6;max-width:420px;margin:0 auto;">
        ${S.name}님의 ISA 안전 공제회 가입이 완료되었습니다.</p>
    </div>
    <div class="cert-card">
      <div class="cert-top"><div class="org">ISA Mutual Aid</div><h3>공제 증권 (가입 확인서)</h3></div>
      <div class="cert-body">
        <div class="cert-row"><span class="k">가입자</span><span class="v">${S.name}</span></div>
        <div class="cert-row"><span class="k">연락처</span><span class="v">${S.phone}</span></div>
        <div class="cert-row"><span class="k">공제 유형</span><span class="v">${plan?plan.name:''}</span></div>
        <div class="cert-row"><span class="k">보장 기간</span><span class="v">${fmt(today)} ~ ${fmt(end)}</span></div>
        <div class="cert-row"><span class="k">보상 한도</span><span class="v">${plan?plan.coverage:''}</span></div>
        <div class="cert-number"><div class="lbl">공제 증권 번호</div><div class="num">${S.certNumber}</div></div>
      </div>
    </div>
    <div style="text-align:center;font-size:13px;color:var(--text-muted);line-height:1.7;margin:20px 0;">※ 문의: contact@isa.world</div>
    <div class="result-actions">
      <button class="btn btn-secondary" onclick="window.print()">🖨️ 증권 인쇄</button>
      <button class="btn btn-primary" data-action="home">🏠 처음으로</button>
    </div>
  </div>`;
}

// ===================== CLAIM SCREENS =====================
function claimStartHTML(){
  return `<div class="screen active">
    <div class="plans-hero" style="padding:40px 0 30px;">
      <div class="shield" style="background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(239,68,68,0.15));border-color:rgba(251,191,36,0.3);">📋</div>
      <h2>공제금 청구</h2>
      <p>공제 증권 번호 또는 가입 정보로 본인 확인 후 청구합니다.</p>
    </div>
    <div class="form-card">
      <div class="form-card-title">🔍 가입 정보 확인</div>
      <div class="form-group"><label class="form-label">공제 증권 번호</label>
        <input type="text" class="form-input" data-field="claimCertNumber" value="${S.claimCertNumber}" placeholder="ISA-MA-XXXXXXXX-XXXX">
        <div class="form-hint">번호를 모르시면 아래 이름과 연락처로 조회하세요.</div></div>
      <div style="text-align:center;padding:12px 0;color:var(--text-muted);font-size:13px;">── 또는 ──</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">이름<span class="required">*</span></label>
          <input type="text" class="form-input" data-field="claimName" value="${S.claimName}" placeholder="홍길동"></div>
        <div class="form-group"><label class="form-label">연락처<span class="required">*</span></label>
          <input type="tel" class="form-input" data-field="claimPhone" value="${S.claimPhone}" placeholder="010-1234-5678"></div>
      </div>
      ${S.claimVerified===false && S.claimRecord==='NOT_FOUND'?`
        <div style="padding:14px 18px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:6px;margin-top:12px;color:var(--red-400);font-size:13px;">
          ❌ 일치하는 가입 내역이 없습니다.</div>`:''}
      ${S.claimVerified && S.claimRecord?`
        <div style="padding:18px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:10px;margin-top:16px;">
          <div style="color:var(--green-400);font-weight:700;margin-bottom:12px;">✅ 가입 확인 완료</div>
          <div class="summary-row"><span class="label">가입자</span><span class="value">${S.claimRecord.name}</span></div>
          <div class="summary-row"><span class="label">플랜</span><span class="value">${S.claimRecord.plan}</span></div>
          <div class="summary-row"><span class="label">증권번호</span><span class="value" style="font-family:monospace;color:var(--cyan-400);">${S.claimRecord.certNumber}</span></div>
        </div>`:''}
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="home">← 처음으로</button>
      ${S.claimVerified?`<button class="btn btn-primary btn-lg" data-action="go" data-to="claim-form">청구서 작성 →</button>`
        :`<button class="btn btn-primary btn-lg" data-action="verify-claim">🔍 조회하기</button>`}
    </div>
  </div>`;
}

function claimFormHTML(){
  return `<div class="screen active">
    <div class="section-title"><div class="bar"></div>사고 내용 및 치료 정보</div>
    <div class="form-card"><div class="form-card-title">🚨 사고 정보</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">사고 발생일<span class="required">*</span></label>
          <input type="date" class="form-input" data-field="accidentDate" value="${S.accidentDate}"></div>
        <div class="form-group"><label class="form-label">사고 발생 시각</label>
          <input type="time" class="form-input" data-field="accidentTime" value="${S.accidentTime}"></div></div>
      <div class="form-group"><label class="form-label">사고 장소<span class="required">*</span></label>
        <input type="text" class="form-input" data-field="accidentLocation" value="${S.accidentLocation}" placeholder="예: ISA HQ 서울웨이브"></div>
      <div class="form-group"><label class="form-label">사고 경위<span class="required">*</span></label>
        <textarea class="form-input" data-field="accidentDesc" rows="4" placeholder="사고 상황을 상세히 기술해주세요">${S.accidentDesc}</textarea></div>
      <div class="form-group"><label class="form-label">부상 부위<span class="required">*</span></label>
        <input type="text" class="form-input" data-field="injuryPart" value="${S.injuryPart}" placeholder="예: 왼쪽 손목"></div>
    </div>
    <div class="form-card"><div class="form-card-title">🏥 치료 정보</div>
      <div class="form-group"><label class="form-label">병원명<span class="required">*</span></label>
        <input type="text" class="form-input" data-field="hospitalName" value="${S.hospitalName}" placeholder="병원/의료기관명"></div>
      <div class="form-group"><label class="form-label">치료 일자<span class="required">*</span></label>
        <input type="date" class="form-input" data-field="treatmentDate" value="${S.treatmentDate}"></div>
      <div class="form-group"><label class="form-label">치료 내용</label>
        <textarea class="form-input" data-field="treatmentDesc" rows="3" placeholder="치료 내용을 기재해주세요">${S.treatmentDesc}</textarea></div>
    </div>
    <div class="form-card"><div class="form-card-title">💰 치료비</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">총 진료비 (원)<span class="required">*</span></label>
          <input type="number" class="form-input" data-field="totalMedical" value="${S.totalMedical||''}" placeholder="150000"></div>
        <div class="form-group"><label class="form-label">건보 본인부담금 (원)</label>
          <input type="number" class="form-input" data-field="nationalIns" value="${S.nationalIns||''}" placeholder="50000"></div></div>
      <div class="form-group"><label class="form-label">본인 실제 부담금 (원)<span class="required">*</span></label>
        <input type="number" class="form-input" data-field="selfPay" value="${S.selfPay||''}" placeholder="100000">
        <div class="form-hint">* 보상 한도(₩300,000) 이내에서 지급됩니다.</div></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="go" data-to="claim-start">← 이전</button>
      <button class="btn btn-primary btn-lg" data-action="go-claim-upload">서류 첨부 →</button>
    </div>
  </div>`;
}

function claimUploadHTML(){
  const files=[
    {key:'diagnosis',label:'진단서',desc:'병원 발급'},
    {key:'receipt',label:'진료비 계산서',desc:'영수증'},
    {key:'detail',label:'진료비 세부 내역서',desc:'급여/비급여'},
    {key:'proof',label:'사고 입증 서류',desc:'실습일지/강사확인서'},
    {key:'id',label:'신분증 사본',desc:'주민등록증 등'},
  ];
  return `<div class="screen active">
    <div class="section-title"><div class="bar"></div>서류 첨부</div>
    ${files.map(f=>`
      <div class="form-card" style="margin-bottom:14px;padding:20px 24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div><div style="font-size:15px;font-weight:700;">📎 ${f.label} <span style="color:var(--red-400);font-size:11px;">(필수)</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${f.desc}</div></div>
          <div>${S.claimFiles[f.key]?`<span style="color:var(--green-400);font-size:13px;font-weight:600;">✅ ${S.claimFiles[f.key]}</span>`
            :`<label style="padding:8px 16px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;font-size:13px;font-weight:600;color:var(--text-secondary);cursor:pointer;">파일 선택<input type="file" accept="image/*,.pdf" style="display:none;" data-action="upload-file" data-key="${f.key}"></label>`}</div>
        </div>
      </div>`).join('')}
    <div class="agree-row" data-action="toggle-claim-agree" style="margin:20px 0;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:6px;">
      <div class="checkbox ${S.claimAgree?'checked':''}">✓</div>
      <div class="agree-label">상기 내용이 사실임을 확인하며, <strong>개인정보 수집·이용에 동의합니다.</strong></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-secondary" data-action="go" data-to="claim-form">← 이전</button>
      <button class="btn btn-primary btn-lg" data-action="submit-claim" ${!S.claimAgree?'disabled':''}>📤 청구서 제출</button>
    </div>
  </div>`;
}

function claimDoneHTML(){
  return `<div class="screen active">
    <div class="result-hero">
      <div class="result-check"><span class="icon">📋</span></div>
      <h2 style="font-size:28px;font-weight:900;margin-bottom:10px;">공제금 청구 접수 완료</h2>
      <p style="color:var(--text-secondary);font-size:15px;line-height:1.7;max-width:450px;margin:0 auto;">
        접수일로부터 <strong>7일 이내</strong>에 심사 결과를 안내드립니다.</p>
    </div>
    <div class="cert-card" style="border-color:rgba(251,191,36,0.3);">
      <div class="cert-top"><div class="org" style="color:var(--amber-400);">ISA Claim Receipt</div><h3>공제금 청구 접수증</h3></div>
      <div class="cert-body">
        <div class="cert-row"><span class="k">청구자</span><span class="v">${S.claimRecord?S.claimRecord.name:''}</span></div>
        <div class="cert-row"><span class="k">증권번호</span><span class="v" style="font-family:monospace;color:var(--cyan-400);">${S.claimRecord?S.claimRecord.certNumber:''}</span></div>
        <div class="cert-row"><span class="k">사고일</span><span class="v">${S.accidentDate}</span></div>
        <div class="cert-row"><span class="k">사고장소</span><span class="v">${S.accidentLocation}</span></div>
        <div class="cert-row"><span class="k">부상부위</span><span class="v">${S.injuryPart}</span></div>
        <div class="cert-row"><span class="k">청구금액</span><span class="v">₩${Number(S.selfPay).toLocaleString()}</span></div>
        <div class="cert-number" style="border-color:rgba(251,191,36,0.3);background:rgba(251,191,36,0.08);">
          <div class="lbl">청구 접수 번호</div><div class="num" style="color:var(--amber-400);">${S.claimNumber}</div>
        </div>
      </div>
    </div>
    <div class="result-actions">
      <button class="btn btn-secondary" onclick="window.print()">🖨️ 접수증 인쇄</button>
      <button class="btn btn-primary" data-action="home">🏠 처음으로</button>
    </div>
  </div>`;
}

// ===================== EVENT HANDLING =====================
function bindEvents(){
  document.querySelectorAll('[data-action]').forEach(el=>{
    if(el.tagName==='INPUT'&&el.type==='file') el.addEventListener('change',handleFileUpload);
    else el.addEventListener('click',handleAction);
  });
  document.querySelectorAll('[data-field]').forEach(el=>{
    el.addEventListener(el.type==='radio'?'change':'input', e=>{
      S[e.target.dataset.field] = e.target.type==='number'?Number(e.target.value):e.target.value;
      if(e.target.dataset.field==='hasCondition') render();
    });
  });
}

function handleFileUpload(e){
  const key=e.target.dataset.key;
  if(e.target.files&&e.target.files[0]){ S.claimFiles[key]=e.target.files[0].name; render(); }
}

function handleAction(e){
  const a=e.currentTarget.dataset.action;
  switch(a){
    case 'home': resetState(); render(); window.scrollTo(0,0); break;
    case 'choose-plan':
      S.selectedPlan=e.currentTarget.dataset.id; S.screen='terms';
      S.agreeTerms=false;S.agreePrivacy=false;S.agreeAll=false;
      render(); window.scrollTo(0,0); break;
    case 'toggle-terms': S.termsOpen=!S.termsOpen; render(); break;
    case 'toggle-privacy': S.privacyOpen=!S.privacyOpen; render(); break;
    case 'agree-terms': S.agreeTerms=!S.agreeTerms; S.agreeAll=S.agreeTerms&&S.agreePrivacy; render(); break;
    case 'agree-privacy': S.agreePrivacy=!S.agreePrivacy; S.agreeAll=S.agreeTerms&&S.agreePrivacy; render(); break;
    case 'toggle-all': {const v=!S.agreeAll;S.agreeAll=v;S.agreeTerms=v;S.agreePrivacy=v;render();} break;
    case 'go': {
      const to=e.currentTarget.dataset.to;
      if(to==='info'&&!(S.agreeTerms&&S.agreePrivacy)){alert('약관에 모두 동의해주세요.');return;}
      S.screen=to; render(); window.scrollTo(0,0);} break;
    case 'go-payment':
      if(!S.name.trim()){alert('이름을 입력해주세요.');return;}
      if(!S.phone.trim()){alert('연락처를 입력해주세요.');return;}
      if(!S.birth.trim()||S.birth.length<6){alert('생년월일 6자리를 입력해주세요.');return;}
      S.screen='payment'; render(); window.scrollTo(0,0); break;
    case 'pay-method': S.payMethod=e.currentTarget.dataset.method; render(); break;
    case 'process-payment': processPayment(); break;
    case 'go-claim': S.screen='claim-start';S.claimVerified=false;S.claimRecord=null;render();window.scrollTo(0,0); break;
    case 'verify-claim': verifyClaim(); break;
    case 'go-claim-upload':
      if(!S.accidentDate){alert('사고 발생일을 입력해주세요.');return;}
      if(!S.accidentLocation.trim()){alert('사고 장소를 입력해주세요.');return;}
      if(!S.accidentDesc.trim()){alert('사고 경위를 입력해주세요.');return;}
      if(!S.injuryPart.trim()){alert('부상 부위를 입력해주세요.');return;}
      if(!S.hospitalName.trim()){alert('병원명을 입력해주세요.');return;}
      if(!S.selfPay){alert('본인 부담금을 입력해주세요.');return;}
      S.screen='claim-upload'; render(); window.scrollTo(0,0); break;
    case 'toggle-claim-agree': S.claimAgree=!S.claimAgree; render(); break;
    case 'submit-claim': submitClaim(); break;
  }
}

// ===================== DATA OPERATIONS (with Google Sheets) =====================
async function processPayment(){
  const ts=Date.now().toString(36).toUpperCase();
  const rand=Math.random().toString(36).substring(2,6).toUpperCase();
  S.certNumber=`ISA-MA-${ts}-${rand}`;
  const plan=PLANS.find(p=>p.id===S.selectedPlan);

  const record={
    certNumber:S.certNumber, name:S.name, phone:S.phone, birth:S.birth,
    gender:S.gender, email:S.email, plan:S.selectedPlan,
    amount:plan?plan.price:0, timestamp:new Date().toISOString()
  };

  // 로컬 저장 (항상)
  const h=LOCAL.getMembers(); h.push(record); LOCAL.saveMembers(h);

  // 구글 시트 저장 (연동 시)
  if(API.enabled()){
    S.loading=true; render();
    await API.post({action:'addMember', ...record});
    S.loading=false;
  }

  S.screen='complete'; render(); window.scrollTo(0,0);
}

async function verifyClaim(){
  // 구글 시트에서 조회
  if(API.enabled()){
    S.loading=true; render();
    const res = await API.get('verifyMember', {
      certNumber: S.claimCertNumber.trim(),
      name: S.claimName.trim(),
      phone: S.claimPhone.trim()
    });
    S.loading=false;
    if(res && res.found){
      S.claimVerified=true; S.claimRecord=res.data;
    } else {
      S.claimVerified=false; S.claimRecord='NOT_FOUND';
    }
    render();
    return;
  }

  // 로컬에서 조회 (fallback)
  const history=LOCAL.getMembers();
  let found=null;
  if(S.claimCertNumber.trim()) found=history.find(r=>r.certNumber===S.claimCertNumber.trim());
  if(!found&&S.claimName.trim()&&S.claimPhone.trim()) found=history.find(r=>r.name===S.claimName.trim()&&r.phone===S.claimPhone.trim());
  S.claimVerified=!!found;
  S.claimRecord=found||'NOT_FOUND';
  render();
}

async function submitClaim(){
  if(!S.claimAgree){alert('동의해주세요.');return;}
  const ts=Date.now().toString(36).toUpperCase();
  const rand=Math.random().toString(36).substring(2,6).toUpperCase();
  S.claimNumber=`CLM-${ts}-${rand}`;

  const claim={
    claimNumber:S.claimNumber, certNumber:S.claimRecord?.certNumber,
    name:S.claimRecord?.name, accidentDate:S.accidentDate,
    accidentLocation:S.accidentLocation, accidentDesc:S.accidentDesc,
    injuryPart:S.injuryPart, hospitalName:S.hospitalName,
    treatmentDate:S.treatmentDate, treatmentDesc:S.treatmentDesc,
    totalMedical:S.totalMedical, selfPay:S.selfPay,
    status:'접수완료', submittedAt:new Date().toISOString()
  };

  // 로컬 저장
  const h=LOCAL.getClaims(); h.push(claim); LOCAL.saveClaims(h);

  // 구글 시트 저장
  if(API.enabled()){
    S.loading=true; render();
    await API.post({action:'addClaim', ...claim});
    S.loading=false;
  }

  S.screen='claim-done'; render(); window.scrollTo(0,0);
}

function resetState(){
  Object.assign(S,{screen:'plans',selectedPlan:null,agreeTerms:false,agreePrivacy:false,agreeAll:false,termsOpen:false,privacyOpen:false,name:'',phone:'',birth:'',gender:'M',email:'',address:'',emergencyName:'',emergencyPhone:'',hasCondition:'no',conditionDetail:'',hasOtherInsurance:'no',payMethod:'card',certNumber:'',certDate:'',claimCertNumber:'',claimName:'',claimPhone:'',claimVerified:false,claimRecord:null,accidentDate:'',accidentTime:'',accidentLocation:'',accidentDesc:'',injuryPart:'',hospitalName:'',treatmentDate:'',treatmentDesc:'',totalMedical:0,nationalIns:0,selfPay:0,claimFiles:{diagnosis:null,receipt:null,detail:null,proof:null,id:null},claimAgree:false,claimNumber:'',loading:false});
}

render();
})();
