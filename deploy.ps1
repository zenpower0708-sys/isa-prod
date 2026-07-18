Set-Location "H:\ISA-Prod"
git add index.html styles.css app.js data.js
git commit -m "feat: 카카오채널 문의 버튼 추가 + 회원가입 비밀번호 필드 수정"
git push origin main
Write-Host "=== 배포 완료 ===" -ForegroundColor Green
Start-Sleep 3
