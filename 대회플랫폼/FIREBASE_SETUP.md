# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. "프로젝트 추가" → 프로젝트 이름: `isa-competition`
3. Google Analytics: 사용 안 함 → 프로젝트 생성

## 2. Realtime Database 활성화

1. 왼쪽 메뉴 → "빌드" → "Realtime Database"
2. "데이터베이스 만들기" 클릭
3. 위치: **아시아-동남아시아1 (싱가포르)** 또는 **asia-northeast3 (서울)** 선택
4. 보안 규칙: **잠금 모드**로 시작

## 3. 보안 규칙 설정

Realtime Database → 규칙 탭에 아래 내용 붙여넣기:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

→ "게시" 클릭

(해석: 읽기는 누구나 가능 / 쓰기는 로그인된 관리자만 가능)

## 4. Authentication 설정

1. 왼쪽 메뉴 → "빌드" → "Authentication"
2. "시작하기" → "이메일/비밀번호" → 사용 설정 ON → 저장
3. "사용자" 탭 → "사용자 추가"
   - 이메일: 운영진 이메일 (예: admin@isa-surf.com)
   - 비밀번호: 강력한 비밀번호 설정

## 5. 앱 구성 정보 (Config) 확인

1. 프로젝트 설정 (톱니바퀴) → "일반" → 맨 아래 "내 앱" → 웹 앱 추가 (</>)
2. 앱 닉네임: `isa-admin` → 앱 등록
3. 아래 형식의 코드가 표시됨:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "isa-competition.firebaseapp.com",
  databaseURL: "https://isa-competition-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "isa-competition",
  storageBucket: "isa-competition.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 6. HTML 파일에 Config 입력

위 값들을 아래 두 파일의 `/* ▼ FIREBASE CONFIG ▼ */` 섹션에 붙여넣기:

- `isa-admin/index.html`
- `isa-platform/index.html`

## 7. 초기 대회 데이터 입력

Firebase 콘솔 → Realtime Database → 데이터 탭 → + 버튼으로 아래 구조 생성:

```
competition/
  stats/
    totalAthletes: 0
    liveCount: 0
    doneCount: 0
    waitCount: 0
    totalMatches: 0
    progress: 0
  ticker: "2026 ISA 전국 인공서핑 선수권 대회 — 오늘 경기 시작"
  status: "live"
```

매치 예시 (`matches/M-001` 경로):
```
matches/
  M-001/
    id: "M-001"
    type: "Standing · 오픈"
    round: "예선"
    playerA/
      name: "홍길동"
      seed: 1
    playerB/
      name: "김철수"
      seed: 8
    water: "A"
    status: "wait"
    scoreA: null
    scoreB: null
    winner: null
```

status 값: `wait` (대기) / `live` (진행중) / `done` (완료)

## 8. Vercel 환경변수 (선택)

Vercel에 Firebase Config를 환경변수로 관리하고 싶다면:
- 현재 구현은 HTML 인라인 방식 → 별도 설정 불필요
- Firebase Realtime DB config는 공개 정보 (보안은 DB Rules로 처리)
