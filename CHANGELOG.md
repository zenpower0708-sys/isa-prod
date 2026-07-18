# 변경 이력

## 2026-07-18 — 스코어엘리트 앱 2종 회원 전용화 (로그인 필수)

**요청**: 스코어엘리트 기본/프리미엄 앱을 회원가입(로그인)해야만 사용할 수 있도록 변경.

**변경 내용**:
1. **메인 사이트 진입 게이트** (`app.js`): `openScoreEliteModal()` 시작 부분에 `requireLogin()` 가드 추가. 히어로 버튼과 회원 혜택 섹션 버튼 모두 이 함수를 사용하므로 비로그인 시 로그인 모달이 대신 열림.
2. **앱 자체 접근 차단** (`surfing-score/index.html`, `surfing-score-premium/index.html`): `<head>`에 인라인 세션 가드 스크립트 추가. 메인 사이트와 같은 도메인이라 localStorage/sessionStorage의 `isa_session_v1` 세션을 공유 — 유효한 세션(만료 `expiresAt` 검사 포함)이 없으면 안내 alert 후 `/?login=1`로 리다이렉트. URL 직접 접근도 차단됨.
3. **로그인 모달 자동 오픈** (`app.js`): `initAuth()`에서 `?login=1` 파라미터를 감지하면 URL을 정리하고 비로그인 상태일 때 로그인 모달을 자동으로 열도록 추가.

**파일**: `app.js`, `surfing-score/index.html`, `surfing-score-premium/index.html`

## 2026-07-18 — 로그인 후 로그인 창이 자동으로 닫히지 않는 문제 수정

**증상**: 카카오/구글/이메일 로그인이 정상적으로 성공해도 로그인 모달 창이 닫히지 않고, X 버튼을 눌러야만 사라짐.

**원인**: `app.js`의 `initAuth()` 함수 안에서 실제로 존재하지 않는 함수를 호출하고 있었음.
- `updateAuthUI(session)` — 정의되어 있지 않은 함수 (예전 리팩터링 과정에서 남은 잔재, `updateNavbarAuth(session)`으로 이미 대체됨)
- `google.accounts.id.initialize({ ..., callback: onGoogleSignIn })` — `onGoogleSignIn`도 정의되어 있지 않음 (예전 구글 One Tap 로그인 방식의 잔재, 현재는 `handleGoogleLogin` + `processSocialLogin` 방식으로 대체됨)

로그인 성공 후 `saveSession() → initAuth() → closeLoginModal()` 순서로 실행되는데, `initAuth()` 안에서 위 두 참조 중 하나가 `ReferenceError`를 던지면서 그 다음 줄인 `closeLoginModal()`이 아예 실행되지 못했음.

**수정**:
- `initAuth()`에서 존재하지 않는 `updateAuthUI(session)` 호출 제거 (`updateNavbarAuth(session)`이 이미 동일한 역할 수행 중)
- `initAuth()`에서 죽은 코드였던 Google Identity Services `accounts.id.initialize(...)` 블록 제거
- `checkKakaoRedirect()` 로그인 성공 분기에도 `closeLoginModal()` 호출 추가 (안전장치)

**파일**: `app.js`
