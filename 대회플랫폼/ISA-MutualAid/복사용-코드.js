// ============================================================
// ISA 통합 관리 시스템 - Google Apps Script (통합 버전)
// ============================================================

// === 전역 설정 ===
var TELEGRAM_CONFIG = {
  TOKEN: '8117127499:AAHynJfWvN7gJLPtQ699eQQRlXeLqQ4ha_0', // 텔레그램 @BotFather로부터 받은 토큰
  CHAT_ID: '-5170338263'   // 알림을 받을 그룹방 ID
};

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'login') {
    return loginUser(e.parameter);
  } else if (action === 'getUsers') {
    return getAllUsers();
  } else if (action === 'verifyMember') {
    return verifyMember(e.parameter);
  } else if (action === 'getClaims') {
    return getClaims();
  }
  
  return respond({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === 'register') {
    return registerUser(data);
  } else if (action === 'addMember') {
    return addMutualAidMember(data);
  } else if (action === 'addClaim') {
    return addMutualAidClaim(data);
  } else if (action === 'updateClaimStatus') {
    return updateClaimStatus(data);
  }
  
  return respond({ status: 'error', message: 'Unknown action' });
}

// 1. 일반 회원가입
function registerUser(data) {
  var sheet = getSheet('회원');
  
  // 이메일 중복 체크
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === data.email) {
      return respond({ status: 'error', message: '이미 등록된 이메일입니다.' });
    }
  }
  
  var now = new Date().toLocaleString('ko-KR');
  sheet.appendRow([
    data.name || '',
    data.email || '',
    data.phone || '',
    data.birth || '',
    data.gender === 'M' ? '남성' : '여성',
    data.password || '',
    now
  ]);
  
  // 텔레그램 알림 발송
  var msg = "🆕 [신규 회원가입]\n" +
            "이름: " + (data.name || '알 수 없음') + "\n" +
            "이메일: " + (data.email || '-') + "\n" +
            "연락처: " + (data.phone || '-');
  sendTelegramNotification(msg);
  
  return respond({ status: 'success', message: '회원가입 완료', data: data });
}

// 2. 공제회/자격증 신청
function addMutualAidMember(data) {
  var sheet = getSheet('공제회_가입');
  
  sheet.appendRow([
    data.certNumber, data.name, data.phone, data.birth,
    data.gender === 'M' ? '남성' : '여성', data.email, data.plan, data.amount, 
    new Date().toLocaleString('ko-KR')
  ]);
  
  // 텔레그램 알림 발송
  var msg = "🛡️ [자격증/공제회 신청]\n" +
            "이름: " + data.name + "\n" +
            "플랜: " + data.plan + "\n" +
            "번호: " + data.certNumber;
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}

// 3. 사고 청구 (파일 업로드 포함 알림)
function addMutualAidClaim(data) {
  var sheet = getSheet('공제회_청구');
  
  sheet.appendRow([
    data.claimNumber, data.certNumber, data.name, data.accidentDate,
    data.accidentLocation, data.accidentDesc, data.injuryPart, data.hospitalName,
    data.treatmentDate, data.treatmentDesc, data.totalMedical, data.selfPay,
    '접수완료', new Date().toLocaleString('ko-KR')
  ]);
  
  // 텔레그램 알림 발송
  var msg = "🚨 [사고 청구/서류 접수가 완료되었습니다.]\n" +
            "이름: " + data.name + "\n" +
            "증권: " + data.certNumber + "\n" +
            "사고일: " + data.accidentDate + "\n" +
            "청구액: ₩" + Number(data.selfPay).toLocaleString();
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}

// 텔레그램 메시지 전송 함수
function sendTelegramNotification(message) {
  if (!TELEGRAM_CONFIG.TOKEN || TELEGRAM_CONFIG.TOKEN === 'YOUR_BOT_TOKEN_HERE') return;
  
  var url = "https://api.telegram.org/bot" + TELEGRAM_CONFIG.TOKEN + "/sendMessage";
  var payload = {
    "chat_id": TELEGRAM_CONFIG.CHAT_ID,
    "text": message
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log("Telegram Error: " + e.message);
  }
}

// [공통] 시트 가져오기
function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === '회원') sheet.appendRow(['이름', '이메일', '연락처', '생년월일', '성별', '비밀번호', '가입일시']);
    else if (name === '공제회_가입') sheet.appendRow(['증권번호', '이름', '연락처', '생년월일', '성별', '이메일', '플랜', '금액', '가입일시']);
    else if (name === '공제회_청구') sheet.appendRow(['청구번호', '증권번호', '이름', '사고일', '장소', '경위', '부상부위', '병원', '치료일', '치료내용', '진료비', '본인부담', '상태', '접수일시']);
  }
  return sheet;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 로그인/조회 등 나머지 함수들은 google-apps-script-auth.js를 참조하세요.
