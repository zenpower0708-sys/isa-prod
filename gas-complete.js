// ============================================================
// ISA 회원관리 + 포인트 시스템 - Google Apps Script (통합본)
// ============================================================
//
// ★★★ 설정 방법 ★★★
//
// 1. Google Sheets에서 "ISA 회원" 스프레드시트를 엽니다.
// 2. 기존 코드를 이 코드 전체로 교체하여 붙여넣기 합니다.
// 3. [배포] → [배포 관리] → 버전 업데이트 후 새 URL 배포
//
// ★ Google Sheets 탭 구성:
//   - "회원"        : 이름/이메일/연락처/생년월일/성별/비밀번호/가입일시
//   - "포인트내역"  : 자동 생성 (이메일/일시/사유/포인트/잔액/상태/이름)
//   - "홍보게시글"  : 자동 생성 (이메일/이름/링크/제출일시/상태/포인트지급/플랫폼)
//   - "EmailCodes"  : 자동 생성 (이메일인증코드 저장용)
//
// ============================================================

// === 텔레그램 설정 (실제 자격증명) ===
var TELEGRAM_CONFIG = {
  TOKEN:   '8117127499:AAHynJfWvN7gJLPtQ699eQQRlXeLqQ4ha_0',
  CHAT_ID: '-5170338263'
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

  // 자격증 기능
  if (action === 'verifyCertificate') return verifyCertificate(e.parameter.certId);
  if (action === 'getUserCerts')      return getUserCerts(e.parameter.email);

  // 포인트 기능
  if (action === 'getPoints')            return getUserPoints(e.parameter);
  if (action === 'getPointHistory')      return getPointHistory(e.parameter);
  if (action === 'adminGetAllPoints')    return adminGetAllPoints();
  if (action === 'getPendingPromoPosts') return getPendingPromoPosts();

  // 게시판 기능
  if (action === 'getBoardPosts')    return getBoardPosts();
  if (action === 'getBoardComments') return getBoardComments(e.parameter.postId);

  return respond({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  var data   = JSON.parse(e.postData.contents);
  var action = data.action;

  // 회원 기능
  if (action === 'register')       return registerUser(data);
  if (action === 'socialLogin')    return socialLogin(data);
  if (action === 'addMember')      return addMutualAidMember(data);
  if (action === 'addClaim')       return addMutualAidClaim(data);
  if (action === 'addLogbook')     return addLogbookEntry(data);
  if (action === 'getLogbook')     return getLogbookEntries(data.email);
  if (action === 'approveLogbook') return approveLogbookEntry(data);
  if (action === 'submitPractical') return submitPracticalEval(data);
  if (action === 'submitOrder')    return submitShopOrder(data);
  if (action === 'certApply')      return handleCertApply(data);
  if (action === 'issueCertificate') return issueCertificate(data);
  if (action === 'saveCertPhoto')  return saveCertPhoto(data);

  // 이메일 인증
  if (action === 'sendEmailCode')   return sendEmailCode(data);
  if (action === 'verifyEmailCode') return verifyEmailCode(data);

  // 포인트 기능
  if (action === 'addPoints')        return adminAddPoints(data);
  if (action === 'submitPromoPost')  return submitPromoPost(data);
  if (action === 'approvePromoPost') return approvePromoPost(data);
  if (action === 'submitReview')     return submitReview(data);

  // 게시판 기능
  if (action === 'submitBoardPost')    return submitBoardPost(data);
  if (action === 'submitBoardComment') return submitBoardComment(data);
  if (action === 'awardBoardPoints')   return awardBoardPoints(data);

  // 결제 기능
  if (action === 'chargePoints')   return chargePoints(data);
  if (action === 'recordCertPay')  return recordCertPay(data);

  return respond({ status: 'error', message: 'Unknown action' });
}

// ──────────────────────────────────────────
// 회원가입 (가입 포인트 500P 자동 지급 + 텔레그램 알림)
// ──────────────────────────────────────────
function registerUser(data) {
  var sheet   = getSheet('회원');
  var allData = sheet.getDataRange().getValues();

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

  // 가입 축하 포인트 500P 자동 지급
  addPointRecord(data.email, data.name || '', 500, '가입 축하 포인트', '완료');

  // 텔레그램 알림
  sendTelegram([
    '🆕 *신규 회원 가입*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: '   + (data.name  || '-'),
    '📧 이메일: ' + (data.email || '-'),
    '📱 연락처: ' + (data.phone || '-'),
    '⚧ 성별: '   + (data.gender === 'M' ? '남성' : '여성'),
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
// 소셜 로그인
// ──────────────────────────────────────────
function socialLogin(data) {
  var sheet    = getSheet('회원');
  var allData  = sheet.getDataRange().getValues();
  var email    = data.email    || '';
  var provider = data.provider || 'unknown';

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === email) {
      return respond({
        status: 'success',
        message: '로그인 성공 (' + provider + ')',
        data: {
          name:   allData[i][0],
          email:  allData[i][1],
          phone:  allData[i][2],
          birth:  String(allData[i][3]),
          gender: allData[i][4] === '남성' ? 'M' : 'F',
          joined: String(allData[i][6]),
          points: getTotalPoints(email)
        }
      });
    }
  }
  // 신규 소셜 회원 자동 가입
  return registerUser({ name: data.name, email: email, phone: '', birth: '', gender: '', password: '', provider: provider });
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
// 자격증 관련
// ──────────────────────────────────────────
function verifyCertificate(certId) {
  return respond({ status: 'success', valid: false, message: '자격증 정보 없음' });
}

function getUserCerts(email) {
  return respond({ status: 'success', data: [] });
}

function handleCertApply(data) {
  var now = new Date().toLocaleString('ko-KR');
  sendTelegram([
    '📋 *자격증 신청*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: '      + (data.name        || '-'),
    '📧 이메일: '    + (data.email       || '-'),
    '🏅 등급: '      + (data.level       || '-') + '급',
    '🎯 종목: '      + (data.discipline  || '-'),
    '💳 결제방식: '  + (data.payMethod   || '-'),
    '💰 금액: ₩'    + (data.amount      || 0).toLocaleString(),
    '🕐 신청일시: '  + now
  ].join('\n'));
  return respond({ status: 'success', message: '신청 완료' });
}

function issueCertificate(data) {
  var email = data.email || '';
  var grade = Number(data.grade) || 0;
  var name  = data.name  || '';

  if (grade >= 1 && grade <= 4) {
    var pointMap = { 1: 5000, 2: 4000, 3: 3000, 4: 2000 };
    var amount   = pointMap[grade];
    addPointRecord(email, name, amount, grade + '급 자격증 발급 축하 포인트', '완료');

    sendTelegram([
      '🎓 *자격증 발급*',
      '━━━━━━━━━━━━━━━━',
      '👤 이름: '    + name,
      '📧 이메일: '  + email,
      '🏅 등급: '    + grade + '급',
      '🎁 포인트: +' + amount + 'P 지급 완료'
    ].join('\n'));
  }

  return respond({ status: 'success', message: '자격증 발급 완료' });
}

function saveCertPhoto(data)       { return respond({ status: 'success', url: '' }); }
function addMutualAidMember(data)  { return respond({ status: 'success', message: '완료' }); }
function addMutualAidClaim(data)   { return respond({ status: 'success', message: '완료' }); }
function submitPracticalEval(data) { return respond({ status: 'success', message: '완료' }); }
function submitShopOrder(data)     { return respond({ status: 'success', message: '완료' }); }

// ──────────────────────────────────────────
// 로그북
// ──────────────────────────────────────────
function addLogbookEntry(data) {
  var sheet = getSheet('로그북');
  var now   = new Date().toLocaleString('ko-KR');
  sheet.appendRow([data.email||'', data.name||'', data.date||'', data.place||'', data.hours||0, data.imageLinks||'', '대기', now]);
  return respond({ status: 'success', message: '로그 등록 완료' });
}

function getLogbookEntries(email) {
  var sheet = getSheet('로그북');
  var data  = sheet.getDataRange().getValues();
  var logs  = [];
  var total = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      var h = Number(data[i][4]) || 0;
      if (data[i][6] === '승인완료') total += h;
      logs.push({ date: String(data[i][2]), place: String(data[i][3]), hours: h, status: data[i][6] });
    }
  }
  return respond({ status: 'success', data: logs, totalHours: total });
}

function approveLogbookEntry(data) {
  return respond({ status: 'success', message: '승인 완료' });
}

// ──────────────────────────────────────────
// 이메일 인증코드 발송
// ──────────────────────────────────────────
function sendEmailCode(data) {
  var email = data.email || '';
  if (!email) return respond({ status: 'error', message: '이메일을 입력하세요.' });

  // 6자리 숫자 인증코드 생성
  var code    = String(Math.floor(100000 + Math.random() * 900000));
  var expires = new Date(Date.now() + 10 * 60 * 1000); // 10분 유효
  var sheet   = getSheet('EmailCodes');

  // 기존 코드 무효화 (같은 이메일 이전 코드 삭제)
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === email) sheet.deleteRow(i + 1);
  }

  sheet.appendRow([email, code, expires.toISOString(), 'N']);
  try { sheet.autoResizeColumns(1, 4); } catch(e) {}

  // 이메일 발송
  try {
    MailApp.sendEmail({
      to:      email,
      subject: '[ISA] 이메일 인증코드',
      htmlBody: [
        '<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">',
        '<h2 style="color:#0f172a;margin:0 0 8px;">ISA 이메일 인증</h2>',
        '<p style="color:#475569;margin:0 0 24px;">아래 인증코드를 입력해주세요. 유효시간은 <strong>10분</strong>입니다.</p>',
        '<div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0ea5e9;text-align:center;',
        'background:#f0f9ff;padding:20px;border-radius:8px;margin-bottom:24px;">' + code + '</div>',
        '<p style="color:#94a3b8;font-size:13px;">본인이 요청하지 않은 경우 이 메일을 무시하세요.</p>',
        '<p style="color:#94a3b8;font-size:13px;">— 국제인공서핑협회(ISA)</p>',
        '</div>'
      ].join('')
    });
  } catch(err) {
    Logger.log('이메일 발송 오류: ' + err.toString());
    return respond({ status: 'error', message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }

  return respond({ status: 'success', message: '인증코드가 발송되었습니다.' });
}

// ──────────────────────────────────────────
// 이메일 인증코드 확인
// ──────────────────────────────────────────
function verifyEmailCode(data) {
  var email = data.email || '';
  var code  = String(data.code || '').trim();

  if (!email || !code) return respond({ status: 'error', message: '이메일과 인증코드를 입력하세요.' });

  var sheet = getSheet('EmailCodes');
  var rows  = sheet.getDataRange().getValues();
  var now   = new Date();

  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] !== email) continue;
    if (rows[i][3] === 'Y')   continue; // 이미 사용된 코드

    var expires = new Date(rows[i][2]);
    if (now > expires) {
      return respond({ status: 'error', message: '인증코드가 만료되었습니다. 다시 요청해주세요.' });
    }
    if (String(rows[i][1]) !== code) {
      return respond({ status: 'error', message: '인증코드가 일치하지 않습니다.' });
    }

    // 인증 성공 — 사용 처리
    sheet.getRange(i + 1, 4).setValue('Y');
    return respond({ status: 'success', message: '이메일 인증이 완료되었습니다.' });
  }

  return respond({ status: 'error', message: '인증코드를 찾을 수 없습니다. 다시 요청해주세요.' });
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
// [포인트] 관리자 수동 지급/차감
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
    '📋 사유: '   + reason,
    '💳 잔액: '   + newBalance + 'P'
  ].join('\n'));

  return respond({ status: 'success', message: '포인트 지급 완료', balance: newBalance });
}

// ──────────────────────────────────────────
// [포인트] SNS 홍보 게시글 제출
// ──────────────────────────────────────────
function submitPromoPost(data) {
  var email    = data.email    || '';
  var name     = data.name     || '';
  var link     = data.link     || '';
  var platform = data.platform || 'SNS';

  if (!email || !link) {
    return respond({ status: 'error', message: '이메일과 링크를 입력하세요.' });
  }

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

  sendTelegram([
    '📢 *홍보 게시글 승인 요청*',
    '━━━━━━━━━━━━━━━━',
    '👤 이름: '      + name,
    '📧 이메일: '    + email,
    '📱 플랫폼: '    + platform,
    '🔗 링크: '      + link,
    '📅 제출일시: '  + now,
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
// [포인트] 홍보 게시글 승인/반려 (관리자용)
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
      '👤 이름: '   + name,
      '📧 이메일: ' + email,
      '🎁 1,000P 지급 완료',
      '💳 잔액: '   + newBalance + 'P'
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
    if (!TELEGRAM_CONFIG.TOKEN || TELEGRAM_CONFIG.TOKEN.length < 10) return;

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
// 결제 후처리 기능
// ──────────────────────────────────────────
function chargePoints(data) {
  var email  = data.email  || '';
  var name   = data.name   || '';
  var amount = Number(data.chargedPoints) || 0;
  var tid    = data.tid    || '';
  var price  = Number(data.price) || 0;

  if (!email || amount <= 0) {
    return respond({ status: 'error', message: '필수 정보가 누락되었습니다.' });
  }

  var newBalance = addPointRecord(email, name, amount, '포인트 충전 (결제금액: ' + price + '원, TID: ' + tid + ')', '완료');

  sendTelegram([
    '💳 *포인트 충전 완료*',
    '이름: '  + name,
    '충전: '  + amount + 'P (' + price + '원)',
    '잔액: '  + newBalance + 'P',
    'TID: '   + tid
  ].join('\n'));

  return respond({ status: 'success', newBalance: newBalance });
}

function recordCertPay(data) {
  var email      = data.email      || '';
  var name       = data.name       || '';
  var level      = data.level      || '';
  var discipline = data.discipline || '';
  var amount     = Number(data.amount) || 0;
  var tid        = data.tid        || '';
  var isRetake   = data.isRetake   || false;

  if (!email || !tid) {
    return respond({ status: 'error', message: '결제 정보가 누락되었습니다.' });
  }

  var reason = isRetake
    ? discipline + ' ' + level + '급 재응시료 (TID: ' + tid + ')'
    : discipline + ' ' + level + '급 응시료 (TID: ' + tid + ')';

  var sheet   = getSheet('포인트내역');
  var now     = new Date().toLocaleString('ko-KR');
  var current = getTotalPoints(email);
  sheet.appendRow([email, now, reason, 0, current, '결제완료', name]);

  sendTelegram([
    '✅ *자격증 응시료 결제 완료*',
    '이름: '  + name,
    discipline + ' ' + level + '급' + (isRetake ? ' (재응시)' : ''),
    '금액: '  + amount + '원',
    'TID: '   + tid
  ].join('\n'));

  return respond({ status: 'success' });
}

// ──────────────────────────────────────────
// 게시판 기능
// ──────────────────────────────────────────
var BOARD_ADMIN_EMAIL  = 'zenpower0708@gmail.com';
var BOARD_IMAGE_FOLDER = 'ISA 게시판 이미지';

function getBoardPosts() {
  var sheet = getSheet('게시판');
  var data  = sheet.getDataRange().getValues();
  var posts = [];

  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    posts.push({
      id:           String(data[i][0]),
      email:        data[i][1],
      authorName:   data[i][2],
      title:        data[i][3],
      content:      data[i][4],
      videoLink:    data[i][5] || '',
      imageLinks:   data[i][6] || '',
      date:         String(data[i][7]),
      isPinned:     data[i][8] === true || data[i][8] === 'TRUE',
      commentCount: data[i][9] || 0
    });
  }

  posts.sort(function(a, b) {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return respond({ status: 'success', data: posts });
}

function submitBoardPost(data) {
  if (!data.email || !data.name) {
    return respond({ status: 'error', message: '로그인이 필요합니다.' });
  }
  if (!data.title || !data.content) {
    return respond({ status: 'error', message: '제목과 내용을 입력해주세요.' });
  }

  var sheet   = getSheet('게시판');
  var allData = sheet.getDataRange().getValues();
  var today   = new Date().toLocaleDateString('ko-KR');
  var todayCount = 0;

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === data.email && !allData[i][8]) {
      var d = new Date(allData[i][7]).toLocaleDateString('ko-KR');
      if (d === today) todayCount++;
    }
  }

  if (todayCount >= 2) {
    return respond({ status: 'error', message: '오늘 게시글 등록 한도(하루 2개)를 초과했습니다.' });
  }

  var imageLinks = '';
  if (data.images && data.images.length > 0) {
    var urls = [];
    for (var j = 0; j < data.images.length && j < 3; j++) {
      var img = data.images[j];
      var url = uploadImageToDrive(img.base64, img.name, img.mimeType);
      if (url) urls.push(url);
    }
    imageLinks = urls.join(',');
  }

  var postId = String(new Date().getTime());
  var now    = new Date().toLocaleString('ko-KR');

  sheet.appendRow([
    postId,
    data.email,
    data.name,
    data.title,
    data.content,
    data.videoLink || '',
    imageLinks,
    now,
    false,
    0
  ]);

  sendTelegram([
    '📝 *새 게시글 등록*',
    '이름: '  + data.name,
    '제목: '  + data.title,
    data.videoLink ? '🎥 영상 포함' : '',
    imageLinks     ? '📸 사진 포함' : ''
  ].filter(Boolean).join('\n'));

  return respond({ status: 'success', message: '게시글이 등록되었습니다.' });
}

function uploadImageToDrive(base64Data, fileName, mimeType) {
  try {
    var folders = DriveApp.getFoldersByName(BOARD_IMAGE_FOLDER);
    var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder(BOARD_IMAGE_FOLDER);
    var bytes   = Utilities.base64Decode(base64Data);
    var blob    = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName || 'image.jpg');
    var file    = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/uc?id=' + file.getId();
  } catch(e) {
    Logger.log('이미지 업로드 오류: ' + e.toString());
    return null;
  }
}

function getBoardComments(postId) {
  if (!postId) return respond({ status: 'success', data: [] });

  var sheet    = getSheet('게시판댓글');
  var data     = sheet.getDataRange().getValues();
  var comments = [];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(postId)) {
      comments.push({
        id:           String(data[i][0]),
        postId:       String(data[i][1]),
        email:        data[i][2],
        authorName:   data[i][3],
        content:      data[i][4],
        date:         String(data[i][5]),
        isPointAward: data[i][6] === true || data[i][6] === 'TRUE',
        awardAmount:  data[i][7] || 0
      });
    }
  }

  return respond({ status: 'success', data: comments });
}

function submitBoardComment(data) {
  if (!data.email || !data.name || !data.content || !data.postId) {
    return respond({ status: 'error', message: '필수 항목이 누락되었습니다.' });
  }

  var sheet     = getSheet('게시판댓글');
  var commentId = String(new Date().getTime());
  var now       = new Date().toLocaleString('ko-KR');

  sheet.appendRow([commentId, String(data.postId), data.email, data.name, data.content, now, false, 0]);

  var boardSheet = getSheet('게시판');
  var boardData  = boardSheet.getDataRange().getValues();
  for (var i = 1; i < boardData.length; i++) {
    if (String(boardData[i][0]) === String(data.postId)) {
      boardSheet.getRange(i + 1, 10).setValue(Number(boardData[i][9] || 0) + 1);
      break;
    }
  }

  return respond({ status: 'success', message: '댓글이 등록되었습니다.' });
}

function awardBoardPoints(data) {
  if (data.adminEmail !== BOARD_ADMIN_EMAIL) {
    return respond({ status: 'error', message: '관리자 권한이 필요합니다.' });
  }

  var amount = Number(data.amount);
  if (!amount || amount < 100 || amount > 1000) {
    return respond({ status: 'error', message: '포인트는 100~1000P 사이로 입력하세요.' });
  }

  var boardSheet  = getSheet('게시판');
  var boardData   = boardSheet.getDataRange().getValues();
  var authorEmail = null, authorName = null;

  for (var i = 1; i < boardData.length; i++) {
    if (String(boardData[i][0]) === String(data.postId)) {
      authorEmail = boardData[i][1];
      authorName  = boardData[i][2];
      break;
    }
  }

  if (!authorEmail) {
    return respond({ status: 'error', message: '게시글을 찾을 수 없습니다.' });
  }

  var newBalance   = addPointRecord(authorEmail, authorName, amount, '게시판 우수 게시글 포인트', '완료');
  var commentSheet = getSheet('게시판댓글');
  var commentId    = String(new Date().getTime());
  var now          = new Date().toLocaleString('ko-KR');

  commentSheet.appendRow([
    commentId, String(data.postId), BOARD_ADMIN_EMAIL, '관리자',
    '🎁 ' + amount + 'P 포인트 지급 완료! 좋은 게시글 감사합니다 😊',
    now, true, amount
  ]);

  for (var i = 1; i < boardData.length; i++) {
    if (String(boardData[i][0]) === String(data.postId)) {
      boardSheet.getRange(i + 1, 10).setValue(Number(boardData[i][9] || 0) + 1);
      break;
    }
  }

  sendTelegram([
    '🎁 *게시판 포인트 지급*',
    '회원: ' + authorName,
    '지급: ' + amount + 'P',
    '잔액: ' + newBalance + 'P'
  ].join('\n'));

  return respond({ status: 'success', message: amount + 'P 포인트가 지급되었습니다.' });
}

// ★ GAS 편집기에서 한 번 실행하면 고정 공지글이 생성됩니다
function initBoardPinnedPost() {
  var sheet = getSheet('게시판');
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][8] === true || data[i][8] === 'TRUE') {
      Logger.log('고정글이 이미 존재합니다.');
      return;
    }
  }

  var now = new Date().toLocaleString('ko-KR');
  var content = '안녕하세요! 국제인공서핑협회(ISA) 커뮤니티 게시판입니다. 🏄\n\n'
    + '【 게시판 이용 안내 】\n\n'
    + '인공서핑에 관한 사진, 영상, 소식을 자유롭게 공유하는 공간입니다.\n\n'
    + '✅ 올릴 수 있는 내용\n'
    + '  • 인공서핑 체험 사진 및 후기\n'
    + '  • 연습 영상 링크 (유튜브, 인스타, 틱톡, 페이스북 등)\n'
    + '  • ISA 협회 홍보 게시글 링크\n'
    + '  • 인공서핑 관련 정보 및 소식\n\n'
    + '📸 사진: 게시글에 직접 첨부 (최대 3장)\n'
    + '🎥 영상: 링크로만 등록 (유튜브, 인스타, 틱톡, 페이스북, 네이버 등)\n\n'
    + '❌ 금지 사항\n'
    + '  • 욕설, 비방, 광고성 게시물\n'
    + '  • 인공서핑과 무관한 내용\n\n'
    + '【 포인트 지급 안내 🎁 】\n\n'
    + 'ISA 협회를 홍보하는 우수 게시글에 관리자가 직접 포인트를 지급합니다!\n\n'
    + '💰 지급 금액: 100P ~ 1,000P (내용과 퀄리티에 따라 차등 지급)\n'
    + '📅 하루 최대 2개 게시글까지 등록 가능\n\n'
    + '🏆 포인트 많이 받는 팁\n'
    + '  • 인스타·유튜브·틱톡 등 SNS에 ISA 홍보 게시글 올리고 링크 공유\n'
    + '  • 체험 후기를 생생하게 작성\n'
    + '  • 사진·영상 포함 시 우선 검토\n\n'
    + '포인트는 관리자 검토 후 댓글로 지급 확인을 드립니다.\n'
    + '열심히 활동해 주시면 많은 포인트 드릴게요! 😊\n\n'
    + '— 국제인공서핑협회(ISA) 운영팀';

  sheet.appendRow(['0001', BOARD_ADMIN_EMAIL, '관리자', '📌 게시판 이용 안내 및 포인트 지급 규정', content, '', '', now, true, 0]);
  Logger.log('고정 공지글이 생성되었습니다.');
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
    } else if (sheetName === '로그북') {
      sheet.appendRow(['이메일', '이름', '날짜', '장소', '시간', '증빙링크', '상태', '등록일시']);
    } else if (sheetName === '게시판') {
      sheet.appendRow(['ID', '이메일', '이름', '제목', '내용', '영상링크', '이미지링크', '작성일시', '고정여부', '댓글수']);
    } else if (sheetName === '게시판댓글') {
      sheet.appendRow(['ID', '게시글ID', '이메일', '이름', '내용', '작성일시', '포인트지급', '지급금액']);
    } else if (sheetName === 'EmailCodes') {
      sheet.appendRow(['이메일', '코드', '만료시각', '사용여부']);
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
