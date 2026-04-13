const fs = require('fs');

const originalFile = 'google-apps-script-auth.js';
let content = fs.readFileSync(originalFile, 'utf8');

// Replace "사진 없음" -> "사진 없음 / No Photo"
content = content.replace(
  '<span class="photo-label">사진 없음</span>',
  '<span class="photo-label" style="text-align:center;">사진 없음<br><span style="font-size:9px;color:#cbd5e1;margin-top:2px;display:block;">No Photo</span></span>'
);

// Replace "발급일: " -> "발급일 / DATE: "
content = content.replace(
  '<div class="issue-date-label">발급일: ${certData.issueDate}</div>',
  '<div class="issue-date-label">발급일 / DATE: <br><span style="font-weight:400;font-family:monospace;font-size:11px;">${certData.issueDate}</span></div>'
);

fs.writeFileSync(originalFile, content, 'utf8');

// Update cert-preview.html as well
let previewContent = fs.readFileSync('cert-preview.html', 'utf8');
previewContent = previewContent.replace(
  '<span class="photo-label">사진 없음</span>',
  '<span class="photo-label" style="text-align:center;">사진 없음<br><span style="font-size:9px;color:#cbd5e1;margin-top:2px;display:block;">No Photo</span></span>'
);
previewContent = previewContent.replace(
  '<div class="issue-date-label">발급일: 2026년 4월 12일</div>',
  '<div class="issue-date-label">발급일 / DATE: <br><span style="font-weight:400;font-family:monospace;font-size:11px;">2026-04-12</span></div>'
);

fs.writeFileSync('cert-preview.html', previewContent, 'utf8');
console.log("Bilingual labels updated");
