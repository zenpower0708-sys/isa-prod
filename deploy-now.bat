@echo off
cd /d H:\ISA-Prod
echo === ISA 배포 시작 ===
git add index.html styles.css app.js data.js
git commit -m "feat: 카카오채널 문의 버튼 추가 + 회원가입 비밀번호 필드 수정"
git push origin main
echo === 배포 완료 - Vercel 자동 배포 시작됩니다 ===
pause
