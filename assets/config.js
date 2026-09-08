// ============================================================
// ISA 자산관리 현황 - 설정 & 데이터 파일
// ★ 자산 수치 변경 시 이 파일만 수정하면 됩니다.
// ============================================================

const ASSET_CONFIG = {
  // 기준일 (수동 업데이트)
  baseDate: '2026.09.08',

  // 총 자산 (원)
  total: 500000000,

  // 항목별 자산
  // amount: 숫자 입력 시 금액 표시 / null 이면 statusText 표시
  items: [
    {
      id: 'cash',
      label: '현금 / 예금',
      icon: '🏦',
      amount: 500000000,
      statusText: null,
      color: '#06b6d4',
      glowColor: 'rgba(6,182,212,0.3)',
      desc: '협회 운영 계좌 및 현금성 자산'
    },
    {
      id: 'equipment',
      label: '장비',
      icon: '🏄',
      amount: null,
      statusText: '예산 집행 결의 중',
      color: '#facc15',
      glowColor: 'rgba(250,204,21,0.3)',
      desc: '인공서핑 기자재 및 교육 장비'
    },
    {
      id: 'realestate',
      label: '부동산',
      icon: '🏢',
      amount: null,
      statusText: '예산 집행 결의 중',
      color: '#a855f7',
      glowColor: 'rgba(168,85,247,0.3)',
      desc: '협회 보유 부동산 및 시설'
    },
    {
      id: 'other',
      label: '기타 자산',
      icon: '📦',
      amount: null,
      statusText: '',
      color: '#94a3b8',
      glowColor: 'rgba(148,163,184,0.3)',
      desc: ''
    }
  ],

  // 자산 변동 내역 (최신순)
  history: [
    {
      date: '2026.09.08',
      category: '초기',
      desc: '협회 설립 자산 등록',
      amount: 500000000,
      balance: 500000000,
      type: 'in'
    }
  ]
};
