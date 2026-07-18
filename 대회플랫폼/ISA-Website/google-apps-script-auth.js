// ============================================================
// ISA 회원관리 - Google Apps Script (전용 스프레드시트)
// ============================================================
//
// ★★★ 설정 방법 (처음부터 차근차근 따라하세요) ★★★
//
// 1. Google Sheets(https://sheets.google.com)에서 새 스프레드시트를 만드세요.
//    - 제목: "ISA 회원관리"
//
// 2. 기본 시트(Sheet1)의 이름을 "회원"으로 변경하세요.
//    (시트 탭을 더블클릭하면 이름을 바꿀 수 있어요)
//
// 3. "회원" 시트 첫 번째 행(헤더)에 아래 내용을 입력하세요:
//    A1: 이름
//    B1: 이메일
//    C1: 연락처
//    D1: 생년월일
//    E1: 성별
//    F1: 비밀번호
//    G1: 가입일시
//
// 4. 상단 메뉴에서 [확장 프로그램] > [Apps Script] 클릭
//
// 5. 기존 코드를 모두 지우고, 아래 코드를 복사+붙여넣기 하세요
//    (=== 코드 시작 === 부터 === 코드 끝 === 까지)
//
// 6. 저장 (Ctrl+S)
//
// 7. 배포: [배포] > [새 배포] 클릭
//    - 유형: "웹 앱" 선택
//    - 설명: "ISA 회원관리"
//    - 실행 사용자: "나" 선택
//    - 액세스 권한: "모든 사용자" 선택
//    - [배포] 클릭
//
// 8. "액세스 승인" 클릭 → 본인 Google 계정 선택 → "허용" 클릭
//    (경고가 나오면 "고급" → "안전하지 않은 페이지로 이동" 클릭)
//
// 9. 배포된 URL을 복사하세요!
//    예: https://script.google.com/macros/s/AKfycb.../exec
//
// 10. 복사한 URL을 app.js 파일의 GOOGLE_AUTH_URL에 붙여넣기
//     (GOOGLE_SCRIPT_URL이 아니라 GOOGLE_AUTH_URL 입니다!)
//
// ============================================================

// === 코드 시작 ===

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'login') {
    return loginUser(e.parameter);
  } else if (action === 'getUsers') {
    return getAllUsers();
  } else if (action === 'checkEmail') {
    return checkEmailExists(e.parameter);
  }
  
  return respond({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === 'register') {
    return registerUser(data);
  }
  
  return respond({ status: 'error', message: 'Unknown action' });
}

// ===========================
// 회원가입
// ===========================
function registerUser(data) {
  var sheet = getSheet();
  
  // 이메일 중복 체크
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === data.email) {
      return respond({ 
        status: 'error', 
        message: '이미 등록된 이메일입니다.' 
      });
    }
  }
  
  // 새 회원 추가
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
  
  // 열 너비 자동 조정 (깔끔하게)
  try { sheet.autoResizeColumns(1, 7); } catch(e) {}
  
  return respond({ 
    status: 'success', 
    message: '회원가입 완료',
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      birth: data.birth,
      gender: data.gender,
      joined: new Date().toISOString().slice(0, 10)
    }
  });
}

// ===========================
// 로그인
// ===========================
function loginUser(params) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var email = params.email || '';
  var password = params.password || '';
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      // 이메일 찾음 → 비밀번호 확인
      if (String(data[i][5]) === String(password)) {
        return respond({ 
          status: 'success', 
          message: '로그인 성공',
          data: {
            name: data[i][0],
            email: data[i][1],
            phone: data[i][2],
            birth: String(data[i][3]),
            gender: data[i][4] === '남성' ? 'M' : 'F',
            joined: String(data[i][6])
          }
        });
      } else {
        return respond({ 
          status: 'error', 
          message: '비밀번호가 일치하지 않습니다.' 
        });
      }
    }
  }
  
  return respond({ 
    status: 'error', 
    message: '등록되지 않은 이메일입니다.' 
  });
}

// ===========================
// 이메일 중복 확인
// ===========================
function checkEmailExists(params) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var email = params.email || '';
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return respond({ status: 'success', exists: true });
    }
  }
  
  return respond({ status: 'success', exists: false });
}

// ===========================
// 전체 회원 목록 (관리자용)
// ===========================
function getAllUsers() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return respond({ status: 'success', data: [], count: 0 });
  }
  
  var users = [];
  for (var i = 1; i < data.length; i++) {
    users.push({
      name: data[i][0],
      email: data[i][1],
      phone: data[i][2],
      birth: String(data[i][3]),
      gender: data[i][4],
      joined: String(data[i][6])
    });
  }
  
  return respond({ status: 'success', data: users, count: users.length });
}

// ===========================
// 공통 유틸
// ===========================
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('회원');
  
  // 시트가 없으면 자동 생성
  if (!sheet) {
    sheet = ss.insertSheet('회원');
    sheet.appendRow(['이름', '이메일', '연락처', '생년월일', '성별', '비밀번호', '가입일시']);
    var headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0f172a');
    headerRange.setFontColor('#06b6d4');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 7);
  }
  
  return sheet;
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// === 코드 끝 ===
