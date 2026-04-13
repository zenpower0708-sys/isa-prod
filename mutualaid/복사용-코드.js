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

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
