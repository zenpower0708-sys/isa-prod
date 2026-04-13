const fs = require('fs');

const originalFile = 'google-apps-script-auth.js';
let content = fs.readFileSync(originalFile, 'utf8');

const regexLogo = /<div class="logo-inner">[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const replacementLogoHtml = `<div class="logo-img-wrapper" style="width: 96px; height: 96px; margin-bottom: 5px; border-radius: 20%; background: linear-gradient(135deg, #111e30, #0a101a); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 20px rgba(184,146,42,0.15), inset 0 2px 4px rgba(255,255,255,0.05); overflow: hidden; border: 1.5px solid rgba(184,146,42,0.5);">
          <img src="https://isa-web-portal.vercel.app/images/isa-emblem.png" style="width: 80%; height: 80%; object-fit: contain; filter: drop-shadow(0 0 8px rgba(184,146,42,0.4));" alt="ISA Logo" onerror="this.src='images/isa-emblem.png'" />
        </div>`;

// Replace in the javascript string
// Wait, the javascript string output is multiline ` so we can just replace the raw text.
// We need to replace:
/*
        <div class="logo-inner">
          <div class="logo-text-inner">
            <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
              <path d="M2 10 C6 3, 10 3, 14 8 C18 13, 22 13, 26 8 C30 3, 34 3, 36 6" stroke="#d4a83a" stroke-width="2" fill="none" stroke-linecap="round"/>
              <path d="M2 13 C6 6, 10 6, 14 11 C18 16, 22 16, 26 11 C30 6, 34 6, 36 9" stroke="rgba(212,168,58,0.4)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
            <span class="logo-isa">ISA</span>
          </div>
        </div>
*/
const searchPattern = /<div class="logo-inner">[\s\S]*?<span class="logo-isa">ISA<\/span>\s*<\/div>\s*<\/div>/g;
content = content.replace(searchPattern, replacementLogoHtml);

fs.writeFileSync(originalFile, content, 'utf8');

// Now update `cert-preview.html` 
let previewContent = fs.readFileSync('cert-preview.html', 'utf8');

// Also remove the old .logo-inner css rule just to be clean, though it's not strictly necessary. 
// Just replace the HTML block in preview:
previewContent = previewContent.replace(searchPattern, replacementLogoHtml);

fs.writeFileSync('cert-preview.html', previewContent, 'utf8');
console.log("Replaced logo");
