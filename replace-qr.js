const fs = require('fs');

const originalFile = 'google-apps-script-auth.js';
let content = fs.readFileSync(originalFile, 'utf8');

// Replace Google Chart API with api.qrserver.com
content = content.replace(
  "var qrUrl = 'https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=' +",
  "var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +"
);
// Also remove the &choe=UTF-8 which qrserver doesn't need
content = content.replace(
  "    encodeURIComponent('https://isa-web-portal.vercel.app/#/verify?id=' + certData.certNumber) +\n    '&choe=UTF-8';",
  "    encodeURIComponent('https://isa-web-portal.vercel.app/#/verify?id=' + certData.certNumber);"
);

fs.writeFileSync(originalFile, content, 'utf8');

// Also update cert-preview.html
let previewContent = fs.readFileSync('cert-preview.html', 'utf8');
previewContent = previewContent.replace(
  "https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=isa-web-portal.vercel.app&choe=UTF-8",
  "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=isa-web-portal.vercel.app"
);

fs.writeFileSync('cert-preview.html', previewContent, 'utf8');
console.log("QR API Updated");
