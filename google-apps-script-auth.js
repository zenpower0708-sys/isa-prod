// ============================================================
// ISA ?뚯썝愿由?+ ?붿????먭꺽利?諛쒓툒 - Google Apps Script
// ============================================================
//
// ?끸쁾???ㅼ젙 諛⑸쾿 ?끸쁾??//
// 1. Google Sheets?먯꽌 "ISA ?뚯썝愿由? ?ㅽ봽?덈뱶?쒗듃瑜??쎈땲??
// 2. 湲곗〈 肄붾뱶瑜???肄붾뱶 ?꾩껜濡?援먯껜?섏뿬 ??ν빀?덈떎.
// 3. [諛고룷] > [??諛고룷]濡??뱀빋 諛고룷?⑸땲??
//
// [?쒗듃 紐⑸줉]
//   - ?뚯썝: ?대쫫/?대찓???곕씫泥??앸뀈?붿씪/?깅퀎/鍮꾨?踰덊샇/媛?낆씪??//   - ?먭꺽利? ?먭꺽利앸쾲???대쫫/?대찓???깃툒/醫낅ぉ/諛쒓툒??DriveURL/?ъ쭊URL/?곹깭
//   - 濡쒓렇遺? ?대찓???좎쭨/?μ냼/?덈젴?쒓컙/?대?吏留곹겕/?곹깭/?깅줉?쇱떆
//   - ?ㅺ린?묒닔: ?대찓???대쫫/醫낅ぉ/?덈꺼/?좏뒠釉뚮쭅???ъ쭊URL/?곹깭/?묒닔?쇱떆
//   - 怨듭젣??媛?? 怨듭젣??泥?뎄 (湲곗〈)
//
// ============================================================

// === ?꾩뿭 ?ㅼ젙 ===
var TELEGRAM_CONFIG = {
  TOKEN: '8117127499:AAHynJfWvN7gJLPtQ699eQQRlXeLqQ4ha_0',
  CHAT_ID: '-5170338263'
};

// ?먭꺽利??뚯씪 ??μ슜 Google Drive ?대뜑 ID (?쒕씪?대툕?먯꽌 ?대뜑 留뚮뱺 ??URL?먯꽌 蹂듭궗)
// ?? https://drive.google.com/drive/folders/[??ID_蹂듭궗]
var CERT_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID'; // ???ш린???대뜑 ID ?낅젰!



// === 肄붾뱶 ?쒖옉 ===

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'login') {
    return loginUser(e.parameter);
  } else if (action === 'getUsers') {
    return getAllUsers();
  } else if (action === 'checkEmail') {
    return checkEmailExists(e.parameter);
  } else if (action === 'verifyCertificate') {
    // ?먭꺽利?吏꾩쐞 ?뺤씤 (怨듦컻 API - ?꾧뎄??媛??
    return verifyCertificate(e.parameter.certId);
  } else if (action === 'getUserCerts') {
    // 蹂몄씤 ?먭꺽利?紐⑸줉 議고쉶
    return getUserCerts(e.parameter.email);
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
  } else if (action === 'addLogbook') {
    return addLogbookEntry(data);
  } else if (action === 'getLogbook') {
    return getLogbookEntries(data.email);
  } else if (action === 'approveLogbook') {
    return approveLogbookEntry(data);
  } else if (action === 'submitPractical') {
    return submitPracticalEval(data);
  } else if (action === 'issueCertificate') {
    // 愿由ъ옄媛 ?⑷꺽?먯뿉寃??먭꺽利?諛쒓툒
    return issueCertificate(data);
  } else if (action === 'saveCertPhoto') {
    // ?ъ쭊 ?낅줈????Drive ?????URL 諛섑솚
    return saveCertPhoto(data);
  }
  
  return respond({ status: 'error', message: 'Unknown action' });
}


// ===========================
// ?뚯썝媛??// ===========================
function registerUser(data) {
  var sheet = getSheet();
  
  // ?대찓??以묐났 泥댄겕
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][1] === data.email) {
      return respond({ 
        status: 'error', 
        message: '?대? ?깅줉???대찓?쇱엯?덈떎.' 
      });
    }
  }
  
  // ???뚯썝 異붽?
  var now = new Date().toLocaleString('ko-KR');
  sheet.appendRow([
    data.name || '',
    data.email || '',
    data.phone || '',
    data.birth || '',
    data.gender === 'M' ? '?⑥꽦' : '?ъ꽦',
    data.password || '',
    now
  ]);
  
  // ???덈퉬 ?먮룞 議곗젙 (源붾걫?섍쾶)
  try { sheet.autoResizeColumns(1, 7); } catch(e) {}
  
  // ?붾젅洹몃옩 ?뚮┝ 諛쒖넚
  var msg = "?넅 [?좉퇋 ?뚯썝媛??\n" +
            "?대쫫: " + (data.name || '?????놁쓬') + "\n" +
            "?대찓?? " + (data.email || '-') + "\n" +
            "?곕씫泥? " + (data.phone || '-');
  sendTelegramNotification(msg);
  
  return respond({ 
    status: 'success', 
    message: '?뚯썝媛???꾨즺',
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
// 濡쒓렇??// ===========================
function loginUser(params) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var email = params.email || '';
  var password = params.password || '';
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      // ?대찓??李얠쓬 ??鍮꾨?踰덊샇 ?뺤씤
      if (String(data[i][5]) === String(password)) {
        return respond({ 
          status: 'success', 
          message: '濡쒓렇???깃났',
          data: {
            name: data[i][0],
            email: data[i][1],
            phone: data[i][2],
            birth: String(data[i][3]),
            gender: data[i][4] === '?⑥꽦' ? 'M' : 'F',
            joined: String(data[i][6])
          }
        });
      } else {
        return respond({ 
          status: 'error', 
          message: '鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.' 
        });
      }
    }
  }
  
  return respond({ 
    status: 'error', 
    message: '?깅줉?섏? ?딆? ?대찓?쇱엯?덈떎.' 
  });
}

// ===========================
// ?대찓??以묐났 ?뺤씤
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
// ?꾩껜 ?뚯썝 紐⑸줉 (愿由ъ옄??
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
// 怨듭젣??媛??諛??ш퀬 泥?뎄 泥섎━
// ===========================

function addMutualAidMember(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('怨듭젣??媛??) || ss.insertSheet('怨듭젣??媛??);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['利앷텒踰덊샇', '?대쫫', '?곕씫泥?, '?앸뀈?붿씪', '?깅퀎', '?대찓??, '?뚮옖', '湲덉븸', '媛?낆씪??]);
  }
  
  sheet.appendRow([
    data.certNumber, data.name, data.phone, data.birth,
    data.gender, data.email, data.plan, data.amount, data.timestamp
  ]);
  
  // ?뚮┝ 諛쒖넚
  var msg = "?썳截?[?먭꺽利?怨듭젣???좎껌]\n" +
            "?대쫫: " + data.name + "\n" +
            "?뚮옖: " + data.plan + "\n" +
            "踰덊샇: " + data.certNumber;
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}

function addMutualAidClaim(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('怨듭젣??泥?뎄') || ss.insertSheet('怨듭젣??泥?뎄');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['泥?뎄踰덊샇', '利앷텒踰덊샇', '?대쫫', '?ш퀬??, '?μ냼', '寃쎌쐞', '遺?곷???, '蹂묒썝', '移섎즺??, '移섎즺?댁슜', '吏꾨즺鍮?, '蹂몄씤遺??, '?곹깭', '?묒닔?쇱떆']);
  }
  
  sheet.appendRow([
    data.claimNumber, data.certNumber, data.name, data.accidentDate,
    data.accidentLocation, data.accidentDesc, data.injuryPart, data.hospitalName,
    data.treatmentDate, data.treatmentDesc, data.totalMedical, data.selfPay,
    data.status, data.submittedAt
  ]);
  
  // ?뚮┝ 諛쒖넚 (?뚯씪 ?낅줈???ы븿 ?뚮┝)
  var msg = "?슚 [?ш퀬 泥?뎄/?쒕쪟 ?묒닔]\n" +
            "?대쫫: " + data.name + "\n" +
            "利앷텒: " + data.certNumber + "\n" +
            "?ш퀬?? " + data.accidentDate + "\n" +
            "湲덉븸: ?? + Number(data.selfPay).toLocaleString();
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}

// ===========================
// ?붿???濡쒓렇遺?& ?ㅺ린 ?됯?
// ===========================

function addLogbookEntry(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('濡쒓렇遺?) || ss.insertSheet('濡쒓렇遺?);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['?대찓??, '?좎쭨', '?μ냼', '?덈젴?쒓컙', '?대?吏留곹겕', '?곹깭', '?깅줉?쇱떆']);
  }
  
  sheet.appendRow([
    data.email, data.date, data.place, data.hours,
    data.imageLinks, '?뱀씤?湲?, new Date().toLocaleString('ko-KR')
  ]);
  
  var msg = "?뱷 [濡쒓렇遺??좉퇋 ?깅줉]\n" +
            "?대쫫: " + (data.name || '?ъ슜??) + "\n" +
            "?μ냼: " + data.place + "\n" +
            "?쒓컙: " + data.hours + "?쒓컙\n" +
            "?곹깭: ?뱀씤 ?湲?以?;
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}

function getLogbookEntries(email) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('濡쒓렇遺?);
  if (!sheet) return respond({ status: 'success', data: [], totalHours: 0 });
  
  var data = sheet.getDataRange().getValues();
  var userEntries = [];
  var totalHours = 0;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      userEntries.push({
        date: data[i][1],
        place: data[i][2],
        hours: data[i][3],
        images: data[i][4],
        status: data[i][5],
        timestamp: data[i][6],
        rowIndex: i + 1
      });
      if (data[i][5] === '?뱀씤?꾨즺') {
        totalHours += Number(data[i][3]);
      }
    }
  }
  
  return respond({ status: 'success', data: userEntries, totalHours: totalHours });
}

function approveLogbookEntry(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('濡쒓렇遺?);
  if (!sheet) return respond({ status: 'error', message: 'Sheet not found' });
  
  var rowIndex = data.rowIndex;
  var status = data.status; // '?뱀씤?꾨즺' ?먮뒗 '諛섎젮'
  
  sheet.getRange(rowIndex, 6).setValue(status);
  
  return respond({ status: 'success', message: '?곹깭媛 蹂寃쎈릺?덉뒿?덈떎: ' + status });
}

function submitPracticalEval(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('?ㅺ린?묒닔') || ss.insertSheet('?ㅺ린?묒닔');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['?대찓??, '?대쫫', '醫낅ぉ', '?덈꺼', '?좏뒠釉뚮쭅??, '?ъ쭊URL', '?곹깭', '?묒닔?쇱떆']);
  }
  
  sheet.appendRow([
    data.email, data.name, data.discipline, data.level,
    data.youtubeUrl, data.photoUrl || '', '?묒닔?꾨즺', new Date().toLocaleString('ko-KR')
  ]);
  
  var msg = "?룄 [?ㅺ린 ?됯? ?좉퇋 ?묒닔]\n" +
            "?대쫫: " + data.name + " (" + data.email + ")\n" +
            "醫낅ぉ: " + data.discipline + " / Level " + data.level + "\n" +
            "?렏 ?곸긽: " + data.youtubeUrl + "\n" +
            "?벝 ?ъ쭊: " + (data.photoUrl ? '泥⑤??? : '?놁쓬') + "\n" +
            "?깍툘 ?꾩쟻 ?덈젴?쒓컙: " + (data.totalHours || '0') + "?쒓컙\n" +
            "?뵕 愿由ъ옄 ?뺤씤: https://isa-web-portal.vercel.app/admin";
  sendTelegramNotification(msg);
  
  return respond({ status: 'success' });
}


// ============================================================
// ???붿????먭꺽利?諛쒓툒 ?쒖뒪??// ============================================================

// ---------------------------
// ?먭꺽利?踰덊샇 ?앹꽦
// ---------------------------
function generateCertNumber() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('?먭꺽利?) || ss.insertSheet('?먭꺽利?);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['?먭꺽利앸쾲??, '?대쫫', '?대찓??, '?깃툒', '醫낅ぉ', '諛쒓툒??, 'DriveURL', '?ъ쭊URL', '?곹깭']);
  }
  
  var year = new Date().getFullYear();
  var lastRow = sheet.getLastRow();
  var seq = String(lastRow).padStart(6, '0'); // 000001 ?뺤떇
  return 'ISA-' + year + '-' + seq;
}

// ---------------------------
// ?먭꺽利?HTML ?쒗뵆由??앹꽦
// ---------------------------
function getCertTemplate(certData) {
  var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
    encodeURIComponent('https://isa-web-portal.vercel.app/#/verify?id=' + certData.certNumber);
  
  var levelLabel = {
    '1': '1급 (Professional)', '2': '2급 (Advanced)',
    '3': '3급 (Intermediate)', '4': '4급 (Beginner)'
  }[String(certData.level)] || certData.level + '급';

  var activeTier = 'diamond';
  if (String(certData.level) === '1') activeTier = 'diamond';
  else if (String(certData.level) === '2') activeTier = 'gold';
  else if (String(certData.level) === '3') activeTier = 'silver';
  else if (String(certData.level) === '4') activeTier = 'bronze';
  
  var photoHtml = certData.photoUrl
    ? '<img src="' + certData.photoUrl + '" style="width:100%;height:100%;object-fit:cover;" />'
    : '<span class="photo-label" style="text-align:center;">사진 없음<br><span style="font-size:9px;color:#cbd5e1;margin-top:2px;display:block;">No Photo</span></span>';
  
  return \`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ISA 합격 자격증</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #060a12;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'Noto Sans KR', sans-serif;
  }

  .cert-wrap {
    width: 100%;
    min-height: 580px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .cert-card {
    width: 100%;
    max-width: 820px;
    background: linear-gradient(135deg, #0d1b2e 0%, #0a1520 50%, #0f1e30 100%);
    border-radius: 16px;
    border: 1.5px solid #b8922a;
    position: relative;
    overflow: hidden;
    padding: 32px;
    box-shadow: 0 0 60px rgba(184,146,42,0.15), inset 0 0 80px rgba(0,30,60,0.5);
    transition: transform 0.6s ease;
  }

  .corner-tl, .corner-tr, .corner-bl, .corner-br {
    position: absolute; width: 40px; height: 40px;
    border-color: #d4a83a; border-style: solid;
  }
  .corner-tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
  .corner-tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
  .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
  .corner-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

  .wave-canvas { position: absolute; bottom: 0; left: 0; width: 100%; height: 200px; opacity: 0.18; }

  .hologram-strip {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(100,200,255,0.015) 3px, rgba(100,200,255,0.015) 6px);
    pointer-events: none;
  }

  .glow-orb {
    position: absolute; width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(52,120,220,0.12) 0%, transparent 70%);
    top: -80px; right: -60px; pointer-events: none;
  }
  .glow-orb2 {
    position: absolute; width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(184,146,42,0.1) 0%, transparent 70%);
    bottom: -60px; left: 20px; pointer-events: none;
  }

  .cert-body {
    position: relative; z-index: 2;
    display: grid; grid-template-columns: 200px 1fr; gap: 32px;
  }

  .left-panel { display: flex; flex-direction: column; align-items: center; gap: 16px; }

  .logo-inner {
    width: 96px; height: 96px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #4a6fa5, #1a2d52 50%, #0a1020);
    border: 2px solid #b8922a;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 30px rgba(184,146,42,0.2), inset 0 2px 4px rgba(255,255,255,0.1);
  }

  .logo-text-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .logo-isa {
    font-size: 22px; font-weight: 900; color: #d4a83a; letter-spacing: 3px;
    text-shadow: 0 0 10px rgba(212,168,58,0.8), 0 0 20px rgba(212,168,58,0.4);
  }

  .org-name .en {
    font-size: 9px; color: #4a7ab5; letter-spacing: 1.5px;
    text-transform: uppercase; line-height: 1.4; text-align: center;
  }
  .org-name .kr { font-size: 13px; color: #c8a84e; font-weight: 700; margin-top: 4px; text-align: center; }

  .photo-box {
    width: 140px; height: 170px; border: 1.5px solid #b8922a; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.03); position: relative; overflow: hidden;
  }
  .photo-box::before {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(184,146,42,0.04) 4px, rgba(184,146,42,0.04) 8px);
  }
  .photo-label { font-size: 11px; color: #4a6080; letter-spacing: 1px; position: relative; z-index: 1; }
  .issue-date-label {
    font-size: 12px; color: #d4a83a; font-weight: 700; letter-spacing: 1px;
    background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 4px;
    border: 0.5px solid rgba(184,146,42,0.3); text-align: center; width: 100%;
  }

  .right-panel { display: flex; flex-direction: column; gap: 14px; }

  .cert-header { border-bottom: 0.5px solid rgba(184,146,42,0.4); padding-bottom: 12px; }
  .official-label { font-size: 10px; color: #4a7ab5; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
  .cert-title-kr {
    font-size: 32px; font-weight: 900; color: #ffffff; line-height: 1;
    text-shadow: 0 0 20px rgba(255,255,255,0.15); letter-spacing: -1px;
  }
  .cert-title-en { font-size: 12px; color: #4a7ab5; margin-top: 4px; letter-spacing: 1px; }

  .field-label { font-size: 10px; color: #4a6080; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }

  .name-value {
    font-size: 38px; font-weight: 900; color: #ffffff; letter-spacing: -1px; line-height: 1;
    text-shadow: 0 0 30px rgba(255,255,255,0.2);
  }
  .name-underline {
    height: 2px; width: 100%;
    background: linear-gradient(90deg, #d4a83a, transparent);
    margin-top: 6px;
  }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-box {
    background: rgba(255,255,255,0.04); border: 0.5px solid rgba(184,146,42,0.25);
    border-radius: 8px; padding: 12px 16px; position: relative; overflow: hidden;
  }
  .info-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(184,146,42,0.4), transparent);
  }
  .info-value { font-size: 16px; font-weight: 700; }
  .info-value.gold { color: #d4a83a; }
  .info-value.white { color: #ffffff; }

  /* TIER SECTION */
  .tier-section {
    background: rgba(255,255,255,0.03); border: 0.5px solid rgba(184,146,42,0.2);
    border-radius: 10px; padding: 14px 16px; position: relative; overflow: hidden;
  }
  .tier-section::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(184,146,42,0.4), transparent);
  }

  .tier-label { font-size: 10px; color: #4a6080; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }

  .tier-track { display: flex; align-items: center; gap: 0; position: relative; padding: 0 4px; }

  .tier-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
    position: relative;
  }

  .tier-connector { flex: 0 0 24px; height: 2px; position: relative; top: -10px; }

  .tier-badge {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; transition: transform 0.3s ease;
  }
  .tier-badge svg { width: 28px; height: 28px; }

  .tier-name { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .tier-bronze .tier-badge {
    background: radial-gradient(circle at 35% 30%, #c4784a, #7a3d1e);
    border: 1.5px solid #c4784a; box-shadow: 0 2px 10px rgba(196,120,74,0.3);
  }
  .tier-bronze .tier-name { color: #c4784a; }
  .tier-connector.bronze { background: linear-gradient(90deg, #7a3d1e, #8a8a8a); }

  .tier-silver .tier-badge {
    background: radial-gradient(circle at 35% 30%, #d0d0d0, #888);
    border: 1.5px solid #c0c0c0; box-shadow: 0 2px 10px rgba(192,192,192,0.3);
  }
  .tier-silver .tier-name { color: #c0c0c0; }
  .tier-connector.silver { background: linear-gradient(90deg, #888, #c8a820); }

  .tier-gold .tier-badge {
    background: radial-gradient(circle at 35% 30%, #f5d060, #b8820a);
    border: 1.5px solid #d4a83a; box-shadow: 0 2px 14px rgba(212,168,58,0.5);
  }
  .tier-gold .tier-name { color: #d4a83a; }
  .tier-connector.gold { background: linear-gradient(90deg, #c8a820, #5ab8e8); }

  .tier-diamond .tier-badge {
    background: radial-gradient(circle at 35% 30%, #a8e4ff, #2a7ab0);
    border: 1.5px solid #7dd4f8; box-shadow: 0 2px 16px rgba(100,210,255,0.5);
  }
  .tier-diamond .tier-name { color: #7dd4f8; }

  .tier-item.active .tier-badge::after {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    border: 2px solid currentColor;
  }
  .tier-bronze.active .tier-badge::after { border-color: #c4784a; }
  .tier-silver.active .tier-badge::after { border-color: #c0c0c0; }
  .tier-gold.active .tier-badge::after { border-color: #d4a83a; }
  .tier-diamond.active .tier-badge::after { border-color: #7dd4f8; }

  .cert-num-wrapper { display: flex; align-items: center; justify-content: space-between; }
  .cert-num { display: flex; align-items: center; gap: 8px; }
  .cert-num-label { font-size: 10px; color: #4a6080; letter-spacing: 1.5px; }
  .cert-num-value { font-size: 13px; color: #5a90c8; font-weight: 700; letter-spacing: 1px; font-family: monospace; }
  
  .qr-code img { width: 60px; height: 60px; border-radius: 4px; border: 1px solid rgba(184,146,42,0.4); }

  .watermark-3d {
    position: absolute; bottom: 30px; right: 40px;
    font-size: 72px; font-weight: 900; color: rgba(184,146,42,0.06);
    letter-spacing: 4px; pointer-events: none;
    transform: perspective(300px) rotateX(20deg); z-index: 1;
  }
</style>
</head>
<body>
<div class="cert-wrap">
  <div class="cert-card" id="card">
    <div class="corner-tl"></div><div class="corner-tr"></div>
    <div class="corner-bl"></div><div class="corner-br"></div>
    <div class="hologram-strip"></div>
    <div class="glow-orb"></div><div class="glow-orb2"></div>
    <canvas class="wave-canvas" id="waveCanvas"></canvas>
    <div class="watermark-3d">ISA</div>

    <div class="cert-body">
      <!-- LEFT -->
      <div class="left-panel">
        <div class="logo-img-wrapper" style="width: 96px; height: 96px; margin-bottom: 5px; border-radius: 20%; background: linear-gradient(135deg, #111e30, #0a101a); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 20px rgba(184,146,42,0.15), inset 0 2px 4px rgba(255,255,255,0.05); overflow: hidden; border: 1.5px solid rgba(184,146,42,0.5);">
          <img src="https://isa-web-portal.vercel.app/images/isa-emblem.png" style="width: 80%; height: 80%; object-fit: contain; filter: drop-shadow(0 0 8px rgba(184,146,42,0.4));" alt="ISA Logo" onerror="this.src='images/isa-emblem.png'" />
        </div>
        <div class="org-name">
          <div class="en">INTL. ARTIFICIAL<br>SURFING ASSOC.</div>
          <div class="kr">국제인공서핑협회</div>
        </div>
        <div class="photo-box">
          ${photoHtml}
        </div>
        <div class="issue-date-label">발급일 / DATE: <br><span style="font-weight:400;font-family:monospace;font-size:11px;">${certData.issueDate}</span></div>
      </div>

      <!-- RIGHT -->
      <div class="right-panel">
        <div class="cert-header">
          <div class="official-label">OFFICIAL CERTIFICATION</div>
          <div class="cert-title-kr">합격 자격증</div>
          <div class="cert-title-en">Certificate of Qualification</div>
        </div>

        <div>
          <div class="field-label">성명 / NAME</div>
          <div class="name-value">${certData.name}</div>
          <div class="name-underline"></div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="field-label">등급 / LEVEL</div>
            <div class="info-value gold">${levelLabel}</div>
          </div>
          <div class="info-box">
            <div class="field-label">종목 / DISCIPLINE</div>
            <div class="info-value white">${certData.discipline}</div>
          </div>
        </div>

        <!-- TIER -->
        <div class="tier-section">
          <div class="tier-label">티어 / TIER</div>
          <div class="tier-track">

            <div class="tier-item tier-bronze ${activeTier === 'bronze' ? 'active' : ''}">
              <div class="tier-badge">
                <svg viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" fill="url(#bronze-fill)" stroke="#c4784a" stroke-width="1"/>
                  <text x="14" y="19" text-anchor="middle" font-size="12" font-weight="900" fill="rgba(255,220,180,0.9)">B</text>
                  <defs><radialGradient id="bronze-fill" cx="35%" cy="30%">
                    <stop offset="0%" stop-color="#d4895a"/>
                    <stop offset="100%" stop-color="#7a3d1e"/>
                  </radialGradient></defs>
                </svg>
              </div>
              <span class="tier-name">Bronze</span>
            </div>

            <div class="tier-connector bronze"></div>

            <div class="tier-item tier-silver ${activeTier === 'silver' ? 'active' : ''}">
              <div class="tier-badge">
                <svg viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" fill="url(#silver-fill)" stroke="#c0c0c0" stroke-width="1"/>
                  <text x="14" y="19" text-anchor="middle" font-size="12" font-weight="900" fill="rgba(255,255,255,0.9)">S</text>
                  <defs><radialGradient id="silver-fill" cx="35%" cy="30%">
                    <stop offset="0%" stop-color="#d8d8d8"/>
                    <stop offset="100%" stop-color="#808080"/>
                  </radialGradient></defs>
                </svg>
              </div>
              <span class="tier-name">Silver</span>
            </div>

            <div class="tier-connector silver"></div>

            <div class="tier-item tier-gold ${activeTier === 'gold' ? 'active' : ''}">
              <div class="tier-badge">
                <svg viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" fill="url(#gold-fill)" stroke="#d4a83a" stroke-width="1"/>
                  <text x="14" y="19" text-anchor="middle" font-size="12" font-weight="900" fill="rgba(255,250,200,0.95)">G</text>
                  <defs><radialGradient id="gold-fill" cx="35%" cy="30%">
                    <stop offset="0%" stop-color="#f5d060"/>
                    <stop offset="100%" stop-color="#a07010"/>
                  </radialGradient></defs>
                </svg>
              </div>
              <span class="tier-name">Gold</span>
            </div>

            <div class="tier-connector gold"></div>

            <div class="tier-item tier-diamond ${activeTier === 'diamond' ? 'active' : ''}">
              <div class="tier-badge">
                <svg viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" fill="url(#diamond-fill)" stroke="#7dd4f8" stroke-width="1"/>
                  <polygon points="14,5 20,11 14,22 8,11" fill="rgba(200,240,255,0.85)" stroke="rgba(150,220,255,0.6)" stroke-width="0.5"/>
                  <defs><radialGradient id="diamond-fill" cx="35%" cy="30%">
                    <stop offset="0%" stop-color="#b8eaff"/>
                    <stop offset="100%" stop-color="#1a5a8a"/>
                  </radialGradient></defs>
                </svg>
              </div>
              <span class="tier-name">Diamond</span>
            </div>

          </div>
        </div>

        <div class="cert-num-wrapper">
          <div class="cert-num">
            <span class="cert-num-label">자격증 번호 / CERT No.</span>
            <span class="cert-num-value">${certData.certNumber}</span>
          </div>
          <div class="qr-code">
            <img src="${qrUrl}" alt="QR" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const canvas = document.getElementById('waveCanvas');
if(canvas) {
  const ctx = canvas.getContext('2d');
  let t = 0;
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  function drawWaves() {
    if(!canvas.offsetWidth) return;
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waves = [
      { amp: 22, freq: 0.012, speed: 0.018, y: 0.4, color: 'rgba(30,100,200,0.6)', width: 2 },
      { amp: 16, freq: 0.018, speed: 0.025, y: 0.55, color: 'rgba(50,130,220,0.45)', width: 1.5 },
      { amp: 28, freq: 0.008, speed: 0.012, y: 0.65, color: 'rgba(184,146,42,0.35)', width: 2.5 },
      { amp: 12, freq: 0.022, speed: 0.03, y: 0.75, color: 'rgba(80,160,240,0.35)', width: 1 },
    ];
    waves.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * w.y);
      for (let x = 0; x <= canvas.width; x += 3) {
        const y = canvas.height * w.y
          + Math.sin(x * w.freq + t * w.speed * 60) * w.amp
          + Math.sin(x * w.freq * 1.7 + t * w.speed * 40) * (w.amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = w.color; ctx.lineWidth = w.width; ctx.stroke();
    });
    t += 0.016;
    requestAnimationFrame(drawWaves);
  }
  drawWaves();
}

const card = document.getElementById('card');
if(card) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    p.style.animationDuration = (4 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    card.appendChild(p);
  }
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = \`perspective(1000px) rotateY(\${x * 6}deg) rotateX(\${-y * 4}deg)\`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    card.style.transition = 'transform 0.6s ease';
  });
}
</script>
</body>
</html>`;
}
// ---------------------------
// ?먭꺽利?諛쒓툒 硫붿씤 ?⑥닔
// ---------------------------
function issueCertificate(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var certSheet = ss.getSheetByName('?먭꺽利?) || ss.insertSheet('?먭꺽利?);
    
    if (certSheet.getLastRow() === 0) {
      certSheet.appendRow(['?먭꺽利앸쾲??, '?대쫫', '?대찓??, '?깃툒', '醫낅ぉ', '諛쒓툒??, 'DriveURL', '?ъ쭊URL', '?곹깭']);
    }
    
    // ?먭꺽利?踰덊샇 ?앹꽦
    var certNumber = generateCertNumber();
    var issueDate = new Date().toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric'});
    
    var certData = {
      certNumber: certNumber,
      name: data.name,
      email: data.email,
      level: data.level,
      discipline: data.discipline,
      issueDate: issueDate,
      photoUrl: data.photoUrl || ''
    };
    
    // HTML ??PDF 蹂??    var htmlContent = getCertTemplate(certData);
    var htmlOutput = HtmlService.createHtmlOutput(htmlContent);
    var pdfBlob = htmlOutput.getAs('application/pdf');
    pdfBlob.setName(certNumber + '_' + data.name + '_?먭꺽利?pdf');
    
    // Google Drive ???    var driveUrl = '';
    try {
      var folder = DriveApp.getFolderById(CERT_FOLDER_ID);
      var file = folder.createFile(pdfBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveUrl = file.getDownloadUrl();
    } catch(driveErr) {
      // ?대뜑 ID 誘몄꽕????猷⑦듃 ?쒕씪?대툕?????      var file = DriveApp.createFile(pdfBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveUrl = file.getDownloadUrl();
      Logger.log('Drive ?대뜑 誘몄꽕?? 猷⑦듃????? ' + driveUrl);
    }
    
    // ?쒗듃??湲곕줉
    certSheet.appendRow([
      certNumber, data.name, data.email, data.level + '湲?,
      data.discipline, issueDate, driveUrl, data.photoUrl || '', '諛쒓툒?꾨즺'
    ]);
    
    // ???대찓??諛쒖넚 (?꾩닔)
    sendCertEmail(data.email, data.name, certData, driveUrl, pdfBlob);
    
    // ???붾젅洹몃옩 ?뚮┝ (?좏깮 - ?ㅼ젙??寃쎌슦)
    var tgMsg = "?룇 [?먭꺽利?諛쒓툒 ?꾨즺]\n" +
                "?대쫫: " + data.name + " (" + data.email + ")\n" +
                "?깃툒: " + data.level + "湲?/ " + data.discipline + "\n" +
                "?먭꺽利앸쾲?? " + certNumber + "\n" +
                "?뱿 ?ㅼ슫濡쒕뱶: " + driveUrl + "\n" +
                "?뵇 吏꾩쐞?뺤씤: https://isa-web-portal.vercel.app/#/verify?id=" + certNumber;
    sendTelegramNotification(tgMsg);
    
    return respond({
      status: 'success',
      certNumber: certNumber,
      driveUrl: driveUrl,
      message: '?먭꺽利앹씠 諛쒓툒?섏뿀?듬땲?? ?대찓?쇱쓣 ?뺤씤?댁＜?몄슂.'
    });
    
  } catch(e) {
    Logger.log('?먭꺽利?諛쒓툒 ?ㅻ쪟: ' + e.message + ' / Stack: ' + e.stack);
    return respond({ status: 'error', message: '?먭꺽利?諛쒓툒 以??ㅻ쪟: ' + e.message });
  }
}

// ---------------------------
// ?대찓??諛쒖넚 (PDF 泥⑤?)
// ---------------------------
function sendCertEmail(email, name, certData, driveUrl, pdfBlob) {
  var subject = '[ISA] 援?젣?멸났?쒗븨?묓쉶 ?붿????먭꺽利?諛쒓툒 ?덈궡';
  var body = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px 30px;border-radius:12px;">'
    + '<div style="text-align:center;margin-bottom:32px;">'
    + '<h1 style="font-size:24px;color:#06b6d4;margin:0;">?룄 援?젣?멸났?쒗븨?묓쉶</h1>'
    + '<p style="color:#64748b;margin:8px 0 0;">INTL. ARTIFICIAL SURFING ASSOCIATION</p>'
    + '</div>'
    + '<div style="background:#1e293b;border-radius:12px;padding:28px;margin-bottom:24px;">'
    + '<p style="margin:0 0 8px;font-size:18px;font-weight:700;">?덈뀞?섏꽭?? <span style="color:#06b6d4;">' + name + '</span>??</p>'
    + '<p style="color:#94a3b8;margin:0;">ISA ?먭꺽?ъ궗???⑷꺽?섏뀲?듬땲?? ?럦</p>'
    + '</div>'
    + '<div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid #06b6d4;">'
    + '<h3 style="margin:0 0 16px;font-size:14px;color:#94a3b8;letter-spacing:2px;">?먭꺽利??뺣낫</h3>'
    + '<table style="width:100%;border-collapse:collapse;">'
    + '<tr><td style="padding:6px 0;color:#64748b;width:120px;">?먭꺽利앸쾲??/td><td style="color:#e2e8f0;font-weight:700;font-family:monospace;">' + certData.certNumber + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#64748b;">?깅챸</td><td style="color:#e2e8f0;">' + certData.name + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#64748b;">?깃툒</td><td style="color:#d4af37;font-weight:700;">' + certData.level + '湲?/td></tr>'
    + '<tr><td style="padding:6px 0;color:#64748b;">醫낅ぉ</td><td style="color:#e2e8f0;">' + certData.discipline + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#64748b;">諛쒓툒??/td><td style="color:#e2e8f0;">' + certData.issueDate + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<a href="' + driveUrl + '" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#2563eb);'
    + 'color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:12px;">'
    + '?뱿 ?먭꺽利?PDF ?ㅼ슫濡쒕뱶</a>'
    + '<br><a href="https://isa-web-portal.vercel.app/#/verify?id=' + certData.certNumber + '" '
    + 'style="font-size:12px;color:#64748b;">?뵇 吏꾩쐞 ?뺤씤?섍린</a>'
    + '</div>'
    + '<p style="font-size:11px;color:#475569;text-align:center;margin:0;">'
    + '蹂??먭꺽利앹? ISA 怨듭떇 諛쒓툒 臾몄꽌?대ŉ, ??QR肄붾뱶 ?먮뒗 留곹겕濡?吏꾩쐞瑜??뺤씤?????덉뒿?덈떎.<br>'
    + '臾몄쓽: info@isa-surfing.org | 02-554-2212</p>'
    + '</div>';
  
  try {
    GmailApp.sendEmail(email, subject, '?먭꺽利앹씠 諛쒓툒?섏뿀?듬땲?? HTML 硫붿씪???뺤씤?댁＜?몄슂.', {
      htmlBody: body,
      attachments: [pdfBlob],
      name: '援?젣?멸났?쒗븨?묓쉶 (ISA)'
    });
  } catch(e) {
    Logger.log('?대찓??諛쒖넚 ?ㅻ쪟: ' + e.message);
  }
}

// ---------------------------
// ?먭꺽利?吏꾩쐞 ?뺤씤 (怨듦컻)
// ---------------------------
function verifyCertificate(certId) {
  if (!certId) return respond({ status: 'error', message: '?먭꺽利?踰덊샇瑜??낅젰?댁＜?몄슂.' });
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('?먭꺽利?);
  if (!sheet) return respond({ status: 'error', valid: false, message: '?먭꺽利??곗씠?곌? ?놁뒿?덈떎.' });
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === certId) {
      return respond({
        status: 'success',
        valid: true,
        cert: {
          certNumber: data[i][0],
          name:       data[i][1],
          email:      data[i][2].replace(/(.{2}).*(@.*)/, '$1***$2'), // ?대찓??留덉뒪??          level:      data[i][3],
          discipline: data[i][4],
          issueDate:  data[i][5],
          status:     data[i][8]
        }
      });
    }
  }
  
  return respond({ status: 'success', valid: false, message: '?깅줉?섏? ?딆? ?먭꺽利?踰덊샇?낅땲??' });
}

// ---------------------------
// 蹂몄씤 ?먭꺽利?紐⑸줉 議고쉶
// ---------------------------
function getUserCerts(email) {
  if (!email) return respond({ status: 'error', message: '?대찓?쇱씠 ?꾩슂?⑸땲??' });
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('?먭꺽利?);
  if (!sheet) return respond({ status: 'success', data: [] });
  
  var data = sheet.getDataRange().getValues();
  var certs = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === email) {
      certs.push({
        certNumber:  data[i][0],
        name:        data[i][1],
        level:       data[i][3],
        discipline:  data[i][4],
        issueDate:   data[i][5],
        driveUrl:    data[i][6],
        status:      data[i][8]
      });
    }
  }
  
  return respond({ status: 'success', data: certs });
}

// ---------------------------
// ?ъ쭊 ?낅줈????Drive ???// ---------------------------
function saveCertPhoto(data) {
  try {
    // Base64 ??Blob 蹂??    var base64 = data.base64.replace(/^data:image\/\w+;base64,/, '');
    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, data.mimeType || 'image/jpeg', data.fileName || 'photo.jpg');
    
    var file;
    try {
      var folder = DriveApp.getFolderById(CERT_FOLDER_ID);
      file = folder.createFile(blob);
    } catch(e) {
      file = DriveApp.createFile(blob);
    }
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 吏곸젒 留곹겕濡?蹂??(?대?吏 URL)
    var fileId = file.getId();
    var directUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    
    return respond({ status: 'success', url: directUrl, fileId: fileId });
  } catch(e) {
    Logger.log('?ъ쭊 ?낅줈???ㅻ쪟: ' + e.message);
    return respond({ status: 'error', message: '?ъ쭊 ?낅줈???ㅽ뙣: ' + e.message });
  }
}

// ===========================
// 怨듯넻 ?좏떥
// ===========================
function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('?뚯썝');
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ?붾젅洹몃옩 硫붿떆吏 ?꾩넚 ?⑥닔
function sendTelegramNotification(message) {
  if (!TELEGRAM_CONFIG.TOKEN || TELEGRAM_CONFIG.TOKEN === 'YOUR_BOT_TOKEN_HERE') return;
  
  var url = 'https://api.telegram.org/bot' + TELEGRAM_CONFIG.TOKEN + '/sendMessage';
  var payload = { chat_id: TELEGRAM_CONFIG.CHAT_ID, text: message };
  var options = {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };
  try { UrlFetchApp.fetch(url, options); } catch(e) { Logger.log('Telegram Error: ' + e.message); }
}

// === 肄붾뱶 ??===

