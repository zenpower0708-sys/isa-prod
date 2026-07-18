// ============================================================
// ISA 회원관리 + 포인트 시스템 - Google Apps Script (통합본)
// ============================================================
//
// ★★★ 설정 방법 ★★★
//
// 1. 이 코드를 현재 사용 중인 "ISA 회원" 스프레드시트의
//    Apps Script 에디터에 붙여넣기 하세요.
//
// 2. 아래 TELEGRAM_CONFIG 의 TOKEN, CHAT_ID 를
//    기존 값으로 채워넣으세요.
//
// 3. 저장(Ctrl+S) 후 [배포] → [배포 관리] → 버전 업데이트
//    (기존 URL 유지 — app.js 의 GOOGLE_AUTH_URL 변경 불필요)
//
// ★ Google Sheets 탭 구성:
//   - "회원"      : 이름/이메일/연락처/생년월일/성별/비밀번호/가입일시
//   - "포인트내역" : 자동 생성 (이메일/일시/사유/포인트/잔액/상태/이름)
//   - "홍보게시글" : 자동 생성 (이메일/이름/링크/제출일시/상태/포인트지급/플랫폼)
//
// ============================================================

// === 텔레그램 설정 ===
var TELEGRAM_CONFIG = {
  TOKEN:   '여기에_기존_TOKEN_붙여넣기',   // 예: '8117127499:AAHyn...'
  CHAT_ID: '여기에_기존_CHAT_ID_붙여넣기'  // 예: '-5170338263'
};

// === 코드 시작 ===

// ──────────────────────────────────────────
// 라우팅
// ──────────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action;

  // 회원 기능
  if (action === 'login')        return loginUser(e.parameter);
  if (action === 'getUsers')     return getAllUsers();
  if (action === 'checkEmail')   return checkEmailExists(e.parameter);

  // 포인트 기능
  if (action === 'getPoints')            return getUserPoints(e.parameter);
  if (action === 'getPointHistory')      return getPointHistory(e.parameter);
  if (action === 'adminGetAllPoints')    return adminGetAllPoints();
  if (action === 'getPendingPromoPosts') return getPendingPromoPosts();

  return respond({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;

  // 회원 기능
  if (action === 'register') return registerUser(data);

  // 포인트 기능
  if (action === 'addPoints')        return adminAddPoints(data);
  if (action === 'submitPromoPost')  return submitPromoPost(data);
  if (action === 'approvePromoPost') return approvePromoPost(data);
  if (action === 'submitReview')     return submitReview(data);

  return respond({ status: 'error', message: 'Unknown action' });
}

// ──────────────────────────────────────────
// 회원가입 (가입 포인트 500P 자동 지급 + 텔레그램 알림)
// ──────────────────────────────────────────
function registerUser(data) {
  var sheet    = getSheet('회원');
  var allData  = sheet.getDataRange().getValues();

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === data.email) {
      return respond({ status: 'error', message: '이미 등록된 이메일입니다.' });
    }
  }

  var now = new Date().toLocaleString('ko-KR');
  sheet.appendRow([
    data.name     || '',
    data.email    || '',
    data.phone    || '',
    data.birth    || '',
    data.gender === 'M' ? '남성' : '여성',
    data.password || '',
    now
  ]);
  try { sheet.autoResizeColumns(1, 7); } catch(e) {}

  // 🎉 가입 축하 포인트 500P 자동 지급
  addPointRecord(data.email, data.name || '', 500, '가입 축하 포인트', '완료');

  // 📲 텔레그램 알림
  sendTelegram([
    '🆕 *신규 회원 가입*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: ' + (data.name || '-'),
    '📧 이메일: ' + (data.email || '-'),
    '📱 연락처: ' + (data.phone || '-'),
    '⚧ 성별: ' + (data.gender === 'M' ? '남성' : '여성'),
    '🎁 가입 포인트 500P 지급 완료',
    '🕐 가입일시: ' + now
  ].join('\n'));

  return respond({
    status: 'success',
    message: '회원가입 완료',
    data: {
      name:   data.name,
      email:  data.email,
      phone:  data.phone,
      birth:  data.birth,
      gender: data.gender,
      joined: new Date().toISOString().slice(0, 10),
      points: 500
    }
  });
}

// ──────────────────────────────────────────
// 로그인 (포인트 잔액 포함 반환)
// ──────────────────────────────────────────
function loginUser(params) {
  var sheet    = getSheet('회원');
  var data     = sheet.getDataRange().getValues();
  var email    = params.email    || '';
  var password = params.password || '';

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      if (String(data[i][5]) === String(password)) {
        var points = getTotalPoints(email);
        return respond({
          status: 'success',
          message: '로그인 성공',
          data: {
            name:   data[i][0],
            email:  data[i][1],
            phone:  data[i][2],
            birth:  String(data[i][3]),
            gender: data[i][4] === '남성' ? 'M' : 'F',
            joined: String(data[i][6]),
            points: points
          }
        });
      } else {
        return respond({ status: 'error', message: '비밀번호가 일치하지 않습니다.' });
      }
    }
  }
  return respond({ status: 'error', message: '등록되지 않은 이메일입니다.' });
}

// ──────────────────────────────────────────
// 이메일 중복 확인
// ──────────────────────────────────────────
function checkEmailExists(params) {
  var sheet = getSheet('회원');
  var data  = sheet.getDataRange().getValues();
  var email = params.email || '';

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) return respond({ status: 'success', exists: true });
  }
  return respond({ status: 'success', exists: false });
}

// ──────────────────────────────────────────
// 전체 회원 목록 (관리자용)
// ──────────────────────────────────────────
function getAllUsers() {
  var sheet = getSheet('회원');
  var data  = sheet.getDataRange().getValues();

  if (data.length <= 1) return respond({ status: 'success', data: [], count: 0 });

  var users = [];
  for (var i = 1; i < data.length; i++) {
    users.push({
      name:   data[i][0],
      email:  data[i][1],
      phone:  data[i][2],
      birth:  String(data[i][3]),
      gender: data[i][4],
      joined: String(data[i][6])
    });
  }
  return respond({ status: 'success', data: users, count: users.length });
}

// ──────────────────────────────────────────
// [포인트] 회원 포인트 잔액 조회
// ──────────────────────────────────────────
function getUserPoints(params) {
  var email = params.email || '';
  if (!email) return respond({ status: 'error', message: '이메일이 필요합니다.' });

  return respond({ status: 'success', email: email, points: getTotalPoints(email) });
}

// ──────────────────────────────────────────
// [포인트] 포인트 내역 조회
// ──────────────────────────────────────────
function getPointHistory(params) {
  var email = params.email || '';
  if (!email) return respond({ status: 'error', message: '이메일이 필요합니다.' });

  var sheet   = getSheet('포인트내역');
  var data    = sheet.getDataRange().getValues();
  var history = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      history.push({
        date:    String(data[i][1]),
        reason:  String(data[i][2]),
        points:  Number(data[i][3]),
        balance: Number(data[i][4]),
        status:  String(data[i][5])
      });
    }
  }

  history.reverse(); // 최신순
  return respond({ status: 'success', data: history, total: getTotalPoints(email) });
}

// ──────────────────────────────────────────
// [포인트] 합계 계산 (내부용)
// ──────────────────────────────────────────
function getTotalPoints(email) {
  var sheet = getSheet('포인트내역');
  var data  = sheet.getDataRange().getValues();
  var total = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][5] === '완료') {
      total += Number(data[i][3]);
    }
  }
  return Math.max(0, total);
}

// ──────────────────────────────────────────
// [포인트] 내역 기록 (내부용)
// ──────────────────────────────────────────
function addPointRecord(email, name, amount, reason, status) {
  var sheet      = getSheet('포인트내역');
  var current    = getTotalPoints(email);
  var newBalance = Math.max(0, current + amount);
  var now        = new Date().toLocaleString('ko-KR');

  sheet.appendRow([email, now, reason, amount, newBalance, status, name]);
  try { sheet.autoResizeColumns(1, 7); } catch(e) {}

  return newBalance;
}

// ──────────────────────────────────────────
// [포인트] 관리자 수동 지급/차감 + 텔레그램 알림
// ──────────────────────────────────────────
function adminAddPoints(data) {
  var email  = data.email  || '';
  var amount = Number(data.amount) || 0;
  var reason = data.reason || '관리자 지급';

  if (!email || amount === 0) {
    return respond({ status: 'error', message: '이메일과 포인트를 입력하세요.' });
  }

  var newBalance = addPointRecord(email, '', amount, reason, '완료');

  sendTelegram([
    '🏆 *포인트 수동 지급*',
    '━━━━━━━━━━━━━━━━',
    '📧 이메일: ' + email,
    '💰 지급량: ' + (amount > 0 ? '+' : '') + amount + 'P',
    '📋 사유: ' + reason,
    '💳 잔액: ' + newBalance + 'P'
  ].join('\n'));

  return respond({ status: 'success', message: '포인트 지급 완료', balance: newBalance });
}

// ──────────────────────────────────────────
// [포인트] 자격증 발급 축하 포인트 (관리자용)
// ──────────────────────────────────────────
function grantCertPoint(data) {
  var email = data.email || '';
  var grade = Number(data.grade) || 0;
  var name  = data.name  || '';

  var pointMap = { 1: 5000, 2: 4000, 3: 3000, 4: 2000 };
  var amount   = pointMap[grade] || 0;

  if (!email || !amount) {
    return respond({ status: 'error', message: '이메일 또는 등급이 올바르지 않습니다.' });
  }

  var newBalance = addPointRecord(email, name, amount, grade + '급 자격증 발급 축하 포인트', '완료');

  sendTelegram([
    '🎓 *자격증 발급 포인트 지급*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: ' + name,
    '📧 이메일: ' + email,
    '🏅 등급: ' + grade + '급',
    '🎁 지급: +' + amount + 'P',
    '💳 잔액: ' + newBalance + 'P'
  ].join('\n'));

  return respond({ status: 'success', message: grade + '급 포인트 지급 완료', balance: newBalance, amount: amount });
}

// ──────────────────────────────────────────
// [포인트] SNS 홍보 게시글 제출 + 텔레그램 알림
// ──────────────────────────────────────────
function submitPromoPost(data) {
  var email    = data.email    || '';
  var name     = data.name     || '';
  var link     = data.link     || '';
  var platform = data.platform || 'SNS';

  if (!email || !link) {
    return respond({ status: 'error', message: '이메일과 링크를 입력하세요.' });
  }

  // 이번 달 제출 횟수 확인 (월 5회 제한)
  var sheet      = getSheet('홍보게시글');
  var sheetData  = sheet.getDataRange().getValues();
  var thisMonth  = new Date().toISOString().slice(0, 7);
  var monthCount = 0;

  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === email) {
      var rowDate = String(sheetData[i][3]).slice(0, 7);
      if (rowDate === thisMonth && sheetData[i][4] !== '반려') monthCount++;
    }
  }

  if (monthCount >= 5) {
    return respond({ status: 'error', message: '이번 달 홍보 게시글 제출 한도(5회)를 초과했습니다.' });
  }

  var now = new Date().toLocaleString('ko-KR');
  sheet.appendRow([email, name, link, now, '대기', 'N', platform]);
  try { sheet.autoResizeColumns(1, 7); } catch(e) {}

  // 📲 텔레그램 알림 (관리자 승인 필요)
  sendTelegram([
    '📢 *홍보 게시글 승인 요청*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: ' + name,
    '📧 이메일: ' + email,
    '📱 플랫폼: ' + platform,
    '🔗 링크: ' + link,
    '📅 제출일시: ' + now,
    '💰 승인 시 1,000P 지급 예정',
    '',
    '👉 스프레드시트에서 승인/반려 처리하세요.'
  ].join('\n'));

  return respond({
    status: 'success',
    message: '홍보 게시글이 제출되었습니다.\n운영자 검토 후 1,000P가 지급됩니다.',
    monthCount: monthCount + 1
  });
}

// ──────────────────────────────────────────
// [포인트] 홍보 게시글 승인/반려 (관리자용) + 텔레그램 알림
// ──────────────────────────────────────────
function approvePromoPost(data) {
  var rowIndex = Number(data.rowIndex);
  var approve  = data.approve;

  var sheet   = getSheet('홍보게시글');
  var allData = sheet.getDataRange().getValues();

  if (rowIndex < 1 || rowIndex >= allData.length) {
    return respond({ status: 'error', message: '잘못된 행 번호입니다.' });
  }

  var row   = allData[rowIndex];
  var email = row[0];
  var name  = row[1];

  if (approve) {
    sheet.getRange(rowIndex + 1, 5).setValue('승인');
    sheet.getRange(rowIndex + 1, 6).setValue('Y');
    var newBalance = addPointRecord(email, name, 1000, 'SNS 홍보 게시글 포인트', '완료');

    sendTelegram([
      '✅ *홍보 게시글 승인 완료*',
      '━━━━━━━━━━━━━━━━',
      '👤 이름: ' + name,
      '📧 이메일: ' + email,
      '🎁 1,000P 지급 완료',
      '💳 잔액: ' + newBalance + 'P'
    ].join('\n'));

    return respond({ status: 'success', message: '승인 완료. 1,000P 지급되었습니다.' });
  } else {
    sheet.getRange(rowIndex + 1, 5).setValue('반려');
    return respond({ status: 'success', message: '반려 처리되었습니다.' });
  }
}

// ──────────────────────────────────────────
// [포인트] 리뷰 작성 포인트 (하루 5회)
// ──────────────────────────────────────────
function submitReview(data) {
  var email      = data.email      || '';
  var name       = data.name       || '';
  var reviewText = data.reviewText || '';
  var targetType = data.targetType || '서비스';

  if (!email || !reviewText) {
    return respond({ status: 'error', message: '이메일과 리뷰 내용을 입력하세요.' });
  }

  var sheet      = getSheet('포인트내역');
  var sheetData  = sheet.getDataRange().getValues();
  var today      = new Date().toISOString().slice(0, 10);
  var todayCount = 0;

  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === email && String(sheetData[i][2]).indexOf('리뷰') !== -1) {
      if (String(sheetData[i][1]).slice(0, 10) === today) todayCount++;
    }
  }

  if (todayCount >= 5) {
    return respond({ status: 'error', message: '오늘 리뷰 포인트 한도(하루 5회)를 초과했습니다.' });
  }

  var newBalance = addPointRecord(email, name, 200, targetType + ' 리뷰 작성 포인트', '완료');

  return respond({
    status:     'success',
    message:    '리뷰 작성 포인트 200P가 적립되었습니다!',
    balance:    newBalance,
    todayCount: todayCount + 1
  });
}

// ──────────────────────────────────────────
// [관리자] 대기 중인 홍보 게시글 목록
// ──────────────────────────────────────────
function getPendingPromoPosts() {
  var sheet = getSheet('홍보게시글');
  var data  = sheet.getDataRange().getValues();
  var pending = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][4] === '대기') {
      pending.push({
        rowIndex: i,
        email:    data[i][0],
        name:     data[i][1],
        link:     data[i][2],
        date:     String(data[i][3]),
        platform: data[i][6] || 'SNS'
      });
    }
  }
  return respond({ status: 'success', data: pending });
}

// ──────────────────────────────────────────
// [관리자] 전체 회원 포인트 현황
// ──────────────────────────────────────────
function adminGetAllPoints() {
  var memberSheet = getSheet('회원');
  var members     = memberSheet.getDataRange().getValues();
  var result      = [];

  for (var i = 1; i < members.length; i++) {
    var email = members[i][1];
    result.push({
      name:   members[i][0],
      email:  email,
      points: getTotalPoints(email)
    });
  }
  return respond({ status: 'success', data: result });
}

// ──────────────────────────────────────────
// 텔레그램 메시지 발송
// ──────────────────────────────────────────
function sendTelegram(message) {
  try {
    if (!TELEGRAM_CONFIG.TOKEN || TELEGRAM_CONFIG.TOKEN.indexOf('여기에') !== -1) return;

    var url     = 'https://api.telegram.org/bot' + TELEGRAM_CONFIG.TOKEN + '/sendMessage';
    var payload = {
      chat_id:    TELEGRAM_CONFIG.CHAT_ID,
      text:       message,
      parse_mode: 'Markdown'
    };
    UrlFetchApp.fetch(url, {
      method:      'post',
      contentType: 'application/json',
      payload:     JSON.stringify(payload)
    });
  } catch(e) {
    Logger.log('텔레그램 발송 오류: ' + e.toString());
  }
}

// ──────────────────────────────────────────
// 공통 유틸 - 시트 가져오기 (없으면 자동 생성)
// ──────────────────────────────────────────
function getSheet(sheetName) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    if (sheetName === '회원') {
      sheet.appendRow(['이름', '이메일', '연락처', '생년월일', '성별', '비밀번호', '가입일시']);
    } else if (sheetName === '포인트내역') {
      sheet.appendRow(['이메일', '일시', '사유', '포인트', '잔액', '상태', '이름']);
    } else if (sheetName === '홍보게시글') {
      sheet.appendRow(['이메일', '이름', '링크', '제출일시', '상태', '포인트지급', '플랫폼']);
    }

    var cols = sheet.getLastColumn();
    var hdr  = sheet.getRange(1, 1, 1, cols);
    hdr.setFontWeight('bold');
    hdr.setBackground('#0f172a');
    hdr.setFontColor('#06b6d4');
    sheet.setFrozenRows(1);
    try { sheet.autoResizeColumns(1, cols); } catch(e) {}
  }

  return sheet;
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// === 코드 끝 ===
