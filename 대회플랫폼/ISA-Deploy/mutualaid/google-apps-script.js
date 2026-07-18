// ============================================================
// ISA 공제회 - Google Apps Script (구글 시트 연동용)
// ============================================================
// 
// ★★★ 설정 방법 (아래 순서대로 따라하세요) ★★★
//
// 1. Google Sheets에서 새 스프레드시트를 만드세요.
//    - 제목: "ISA 공제회 관리"
//
// 2. 시트 2개를 만드세요:
//    - 시트1 이름: "가입자"
//    - 시트2 이름: "청구"
//
// 3. "가입자" 시트 첫 번째 행(헤더)에 아래 내용을 입력하세요:
//    A1: 증권번호 | B1: 이름 | C1: 연락처 | D1: 생년월일 
//    E1: 성별 | F1: 이메일 | G1: 플랜 | H1: 회비 | I1: 가입일시
//
// 4. "청구" 시트 첫 번째 행(헤더)에 아래 내용을 입력하세요:
//    A1: 접수번호 | B1: 증권번호 | C1: 청구자 | D1: 사고일 
//    E1: 사고장소 | F1: 사고경위 | G1: 부상부위 | H1: 병원명
//    I1: 치료일 | J1: 치료내용 | K1: 총진료비 | L1: 본인부담금
//    M1: 상태 | N1: 접수일시 | O1: 업데이트일시
//
// 5. 상단 메뉴에서 [확장 프로그램] > [Apps Script] 클릭
//
// 6. 기존 코드를 모두 지우고, 아래 코드를 복사+붙여넣기 하세요
//    (이 파일의 === 코드 시작 === 부터 === 코드 끝 === 까지)
//
// 7. 저장 (Ctrl+S)
//
// 8. 배포: [배포] > [새 배포] 클릭
//    - 유형: "웹 앱" 선택
//    - 실행 사용자: "나" 선택
//    - 액세스 권한: "모든 사용자" 선택
//    - [배포] 클릭
//
// 9. "액세스 승인" 클릭 → 본인 Google 계정 선택 → "허용" 클릭
//    (경고가 나오면 "고급" → "안전하지 않은 페이지로 이동" 클릭)
//
// 10. 배포된 URL을 복사하세요!
//     예: https://script.google.com/macros/s/AKfycbx.../exec
//
// 11. 복사한 URL을 config.js 파일의 GOOGLE_SCRIPT_URL에 붙여넣기
//
// ============================================================

// === 코드 시작 ===

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'getMembers') {
    return getMembers();
  } else if (action === 'getClaims') {
    return getClaims();
  } else if (action === 'verifyMember') {
    return verifyMember(e.parameter);
  }
  
  return jsonResponse({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === 'addMember') {
    return addMember(data);
  } else if (action === 'addClaim') {
    return addClaim(data);
  } else if (action === 'updateClaimStatus') {
    return updateClaimStatus(data);
  }
  
  return jsonResponse({ status: 'error', message: 'Unknown action' });
}

// === 가입자 관리 ===

function addMember(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('가입자');
  
  sheet.appendRow([
    data.certNumber || '',
    data.name || '',
    data.phone || '',
    data.birth || '',
    data.gender === 'M' ? '남성' : '여성',
    data.email || '',
    data.plan || '',
    data.amount || 0,
    new Date().toLocaleString('ko-KR')
  ]);
  
  return jsonResponse({ status: 'success', message: '가입 완료' });
}

function getMembers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('가입자');
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return jsonResponse({ status: 'success', data: [] });
  }
  
  var headers = data[0];
  var members = [];
  
  for (var i = 1; i < data.length; i++) {
    members.push({
      certNumber: data[i][0],
      name: data[i][1],
      phone: data[i][2],
      birth: data[i][3],
      gender: data[i][4],
      email: data[i][5],
      plan: data[i][6],
      amount: data[i][7],
      timestamp: data[i][8]
    });
  }
  
  return jsonResponse({ status: 'success', data: members });
}

function verifyMember(params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('가입자');
  var data = sheet.getDataRange().getValues();
  
  var certNumber = params.certNumber || '';
  var name = params.name || '';
  var phone = params.phone || '';
  
  for (var i = 1; i < data.length; i++) {
    if (certNumber && data[i][0] === certNumber) {
      return jsonResponse({ status: 'success', found: true, data: {
        certNumber: data[i][0], name: data[i][1], phone: data[i][2],
        plan: data[i][6], amount: data[i][7]
      }});
    }
    if (name && phone && data[i][1] === name && data[i][2] === phone) {
      return jsonResponse({ status: 'success', found: true, data: {
        certNumber: data[i][0], name: data[i][1], phone: data[i][2],
        plan: data[i][6], amount: data[i][7]
      }});
    }
  }
  
  return jsonResponse({ status: 'success', found: false });
}

// === 청구 관리 ===

function addClaim(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('청구');
  
  sheet.appendRow([
    data.claimNumber || '',
    data.certNumber || '',
    data.name || '',
    data.accidentDate || '',
    data.accidentLocation || '',
    data.accidentDesc || '',
    data.injuryPart || '',
    data.hospitalName || '',
    data.treatmentDate || '',
    data.treatmentDesc || '',
    data.totalMedical || 0,
    data.selfPay || 0,
    '접수완료',
    new Date().toLocaleString('ko-KR'),
    ''
  ]);
  
  return jsonResponse({ status: 'success', message: '청구 접수 완료' });
}

function getClaims() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('청구');
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return jsonResponse({ status: 'success', data: [] });
  }
  
  var claims = [];
  for (var i = 1; i < data.length; i++) {
    claims.push({
      claimNumber: data[i][0],
      certNumber: data[i][1],
      name: data[i][2],
      accidentDate: data[i][3],
      accidentLocation: data[i][4],
      accidentDesc: data[i][5],
      injuryPart: data[i][6],
      hospitalName: data[i][7],
      treatmentDate: data[i][8],
      treatmentDesc: data[i][9],
      totalMedical: data[i][10],
      selfPay: data[i][11],
      status: data[i][12],
      submittedAt: data[i][13],
      updatedAt: data[i][14]
    });
  }
  
  return jsonResponse({ status: 'success', data: claims });
}

function updateClaimStatus(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('청구');
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.claimNumber) {
      sheet.getRange(i + 1, 13).setValue(data.status);
      sheet.getRange(i + 1, 15).setValue(new Date().toLocaleString('ko-KR'));
      return jsonResponse({ status: 'success', message: '상태 업데이트 완료' });
    }
  }
  
  return jsonResponse({ status: 'error', message: '해당 청구를 찾을 수 없습니다' });
}

// === 유틸 ===

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// === 코드 끝 ===
