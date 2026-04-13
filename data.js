// ===== DISCIPLINES =====
const DISCIPLINES = [
    'Standing/Flow Board',
    'Body/Boogie Board',
    'Wake Surfing',
    'Wave Surfing'
];

// ===== SITE CONFIG =====
const SITE_CONFIG = {
    regNumber: '2025-000001',
    phone: '02-554-2212',
    email: 'info@isa-surfing.org',
    addressKR: '서울특별시 강남구 테헤란로 123',
    address: '123 Teheran-ro, Gangnam-gu, Seoul',
    storeUrl: 'https://isa-international-artificial-indoor-surfing-149618944785.us-west1.run.app'
};

// ===== INSURANCE PLANS =====
const INSURANCE_PLANS = [
    { id: 1, name: 'Basic', durationLabel: '1개월', price: 9900, coverage: '최대 10만원 지원' },
    { id: 2, name: 'Standard', durationLabel: '6개월', price: 29900, coverage: '최대 30만원 지원' },
    { id: 3, name: 'Premium', durationLabel: '12개월', price: 49900, coverage: '최대 30만원 지원' }
];

// ===== SURFING LOCATIONS =====
const SURF_LOCATIONS = [
    { id: 1, name: 'Wave Park Siheung', country: 'South Korea', status: 'OPEN', phone: '031-000-0000', lat: 37.38, lng: 126.74 },
    { id: 2, name: 'Surf Poel', country: 'Belgium', status: 'OPEN', phone: '+32-000-000', lat: 51.12, lng: 4.39 },
    { id: 3, name: 'UNIT Surf Pool', country: 'Germany', status: 'OPEN', phone: '+49-000-000', lat: 48.13, lng: 11.58 },
    { id: 4, name: 'Citywave Munich', country: 'Germany', status: 'OPEN', phone: '+49-000-000', lat: 48.14, lng: 11.55 },
    { id: 5, name: "Surf's Up New Hampshire", country: 'USA', status: 'OPEN', phone: '+1-000-000', lat: 42.99, lng: -71.45 },
    { id: 6, name: 'FlowRider Sentosa', country: 'Singapore', status: 'OPEN', phone: '+65-000-000', lat: 1.25, lng: 103.82 },
    { id: 7, name: 'Surf House Phuket', country: 'Thailand', status: 'OPEN', phone: '+66-000-000', lat: 7.88, lng: 98.38 },
    { id: 8, name: 'Aloha Surfhouse', country: 'Australia', status: 'OPEN', phone: '+61-000-000', lat: -31.95, lng: 115.86 }
];

// ===== INSTRUCTORS =====
const INSTRUCTORS = [
    { id: 1, name: '김서준', region: 'Seoul, Korea', level: 1, rating: 4.9, rate: 80000, image: 'https://picsum.photos/400/300?random=10' },
    { id: 2, name: 'Alex Wave', region: 'Sydney, AU', level: 2, rating: 4.8, rate: 120000, image: 'https://picsum.photos/400/300?random=11' },
    { id: 3, name: '박플로우', region: 'Busan, Korea', level: 1, rating: 5.0, rate: 90000, image: 'https://picsum.photos/400/300?random=12' },
    { id: 4, name: 'Mike Flow', region: 'LA, USA', level: 2, rating: 4.7, rate: 150000, image: 'https://picsum.photos/400/300?random=13' },
    { id: 5, name: '이유이브', region: 'Jeju, Korea', level: 1, rating: 4.9, rate: 85000, image: 'https://picsum.photos/400/300?random=14' },
    { id: 6, name: 'Sarah Surf', region: 'Bali, ID', level: 3, rating: 4.6, rate: 70000, image: 'https://picsum.photos/400/300?random=15' }
];

// ===== EVENTS & NOTICES =====
const EVENTS = {
    KO: [
        { date: '2026.06.15', title: '제1회 ISA 인공서핑 챔피언십 개최' },
        { date: '2026.07.20', title: '여름 특별 이벤트 (공제회 보험 50% 할인)' },
        { date: '2026.08.10', title: 'ISA x Wave Park 콜라보 페스티벌' },
        { date: '2026.09.01', title: '가을 자격증 시험 일정 공고' }
    ],
    EN: [
        { date: '2026.06.15', title: '1st ISA Artificial Surfing Championship' },
        { date: '2026.07.20', title: 'Summer Special Discount (50% off Insurance)' },
        { date: '2026.08.10', title: 'ISA x Wave Park Collaboration Festival' },
        { date: '2026.09.01', title: 'Fall Certification Exam Schedule' }
    ]
};

const NOTICES = {
    KO: [
        { date: '2026.04.10', title: '2026년 2분기 자격검정 일정 공고' },
        { date: '2026.03.25', title: '실기평가 업로드 시스템 개선 안내' },
        { date: '2026.03.15', title: '필기시험 재응시 제도 시행 안내' },
        { date: '2026.02.28', title: '국제인공서핑협회 공식 인증 강사 목록 공개' }
    ],
    EN: [
        { date: '2026.04.10', title: '2026 Q2 Certification Exam Schedule' },
        { date: '2026.03.25', title: 'Practical Evaluation Upload System Improvement' },
        { date: '2026.03.15', title: 'Written Exam Retake Policy Notice' },
        { date: '2026.02.28', title: 'Official Certified Instructor List Released' }
    ]
};

// ===== CERTIFICATION DATA =====
const CERT_DATA = {
    KO: {
        levels: {
            items: [
                { title: '4급 자격', role: '인공서핑 기초 이론과 안전 수칙을 이해하고, 기본 자세로 파도를 탈 수 있는 초급 수준.', target: '초보자 / 입문' },
                { title: '3급 자격', role: '기본기를 넘어 턴과 간단한 기술을 구사할 수 있으며, 안전 관리 능력을 갖춘 중급 수준.', target: '일반 / 동호인' },
                { title: '2급 자격', role: '고급 기술(에어리얼, 360 스핀 등)을 안정적으로 수행하며, 초급 지도가 가능한 상급 수준.', target: '상급 / 준선수' },
                { title: '1급 자격', role: '모든 기술의 완벽한 숙련과 함께 전문 강사 및 심판 자격을 포함하는 최고 등급.', target: '전문가 / 강사' }
            ]
        },
        curriculum: {
            title: '종합 교육 과정표',
            headers: ['등급', '필기시험', '실기평가', '실습시간', '발급비용'],
            rows: [
                ['4급', '20문항/30분', '기본 자세 & 직진', '4시간 이상', '₩300,000'],
                ['3급', '25문항/40분', '턴 & 기본 기술', '8시간 이상', '₩300,000'],
                ['2급', '30문항/50분', '고급 기술 영상', '20시간 이상', '₩500,000'],
                ['1급', '40문항/60분', '시범 & 면접', '50시간 이상', '₩500,000']
            ]
        }
    },
    EN: {
        levels: {
            items: [
                { title: 'Level 4', role: 'Beginner level understanding basic theory, safety rules, and can ride waves with basic posture.', target: 'Beginners' },
                { title: 'Level 3', role: 'Intermediate level capable of turns and simple tricks with safety management ability.', target: 'General / Enthusiasts' },
                { title: 'Level 2', role: 'Advanced level performing aerial, 360 spins and able to instruct beginners.', target: 'Advanced / Semi-pro' },
                { title: 'Level 1', role: 'Expert level with mastery of all techniques, including professional instructor and judge qualifications.', target: 'Expert / Instructor' }
            ]
        },
        curriculum: {
            title: 'Comprehensive Curriculum',
            headers: ['Level', 'Written Exam', 'Practical', 'Practice Hours', 'Fee'],
            rows: [
                ['Level 4', '20Q / 30min', 'Basic Stance & Straight', '4+ hours', '₩300,000'],
                ['Level 3', '25Q / 40min', 'Turns & Basic Tricks', '8+ hours', '₩300,000'],
                ['Level 2', '30Q / 50min', 'Advanced Trick Video', '20+ hours', '₩500,000'],
                ['Level 1', '40Q / 60min', 'Demo & Interview', '50+ hours', '₩500,000']
            ]
        }
    }
};

// ===== TRANSLATIONS =====
const LANG = {
    KO: {
        common: {
            appName: '국제인공서핑협회',
            govCulture: '문화체육관광부',
            govCoast: '해양경찰청',
            login: '로그인',
            signup: '회원가입',
            footer: { contact: '연락처', legal: '법적 고지', privacy: '개인정보처리방침', terms: '이용약관', insTerms: '공제회 약관', rights: 'ISA. All rights reserved.' }
        },
        quick: { event: '이벤트', notice: '공지사항', appCheck: '접수확인', certCheck: '자격증조회', inputApp: '접수번호를 입력하세요', inputCert: '이름 (Name)', inputPhone: '연락처 (Phone)', checkBtn: '조회하기' },
        nav: { cert: '자격증', shop: '장비스토어', insurance: '공제회', map: '인공서핑장현황', edu: '교육' },
        hero: { tag: '미래의 서핑을 경험하라', title: '디지털 파도를 넘어', subtitle: '국제인공서핑협회 공식 플랫폼', cta: '자격증 신청하기', watch: '자격증 소개', waveHeight: '현재 파도 높이', waterTemp: '수온' },
        cert: {
            title: '자격증 센터', desc: '1급부터 4급까지, 당신의 실력을 증명하세요.',
            processTitle: '급 자격 심사 과정',
            step1: '실습 이수', step1Desc: '강사 확인 필요',
            step2: '필기 시험', step2Desc: '20문항 / 30분',
            step3: '실기 평가', step3Desc: '3분 1080p 영상 업로드',
            step4: '디지털 자격증 발급', step4Desc: 'PDF 자격증 발급 · 이메일 자동 발송',
            start: '시작하기', examFee: '응시료', total: '합계',
            creditCard: '신용카드 (해외 겸용)', payUnlock: '결제 및 시험 잠금 해제',
            guideBtn: '공식 자격증 안내', applyExam: '자격시험 접수하기',
            certType: '자격 심사과정'
        },
        ins: {
            title: 'ISA 안전 공제회', desc: '안전한 서핑을 위한 필수 선택. 실비 지급 및 부상 케어.',
            subscribe: '가입하기', claim: '청구하기', mostPopular: '인기', perPeriod: '/ 기간',
            feature1: '부상 치료비 실비 지원', featureGlobal: '전 세계 보장',
            claimTitle: '청구가 필요하신가요?', claimDesc: '진단서와 영수증을 업로드하세요. 24시간 내 승인됩니다.'
        },
        map: { title: '인공서핑장현황', subtitle: '전 세계 공인 인공 서핑장을 찾아보세요.', searchPlaceholder: '국가 또는 도시 검색...', navigate: '길찾기', website: '웹사이트' },
        edu: {
            mainTitle: '교육 센터', mainSubtitle: 'ISA의 전문적인 교육 생태계',
            menuAcademy: 'ISA 아카데미', menuAcademyDesc: 'AI 기반 교육 자료와 영상 학습',
            menuMatch: '강사 배정', menuMatchDesc: '전문 강사 1:1 매칭 시스템',
            academyTitle: 'ISA 아카데미', poweredBy: 'Google Notebook LM 제공',
            aiAudioLabel: 'AI 오디오 개요', audioTitle: '안전 수칙 및 플로우 역학',
            audioDesc: '플로우보딩의 핵심 물리학과 비상 절차에 대한 AI 생성 대화 요약입니다.',
            sourceTitle: '교육 자료', viewBtn: '보기', videoTitle: '기술 영상',
            sampleVideo: '고급 360 스핀 튜토리얼',
            matchTitle: '강사 매칭', filterRegion: '지역', filterDate: '날짜',
            searchBtn: '강사 검색', perHour: '/ 시간', bookBtn: '예약하기'
        },
        intro: {
            title: 'ISA 소개 영상', subtitle: '각 종목별 매력을 AI 오디오 가이드와 공식 영상으로 만나보세요.',
            officialVideo: '공식 영상', aiVoicePreview: 'AI 보이스 프리뷰', playBtn: '재생하기'
        },
        shop: {
            heroTitle: '당신의 파도를 준비하세요',
            heroDesc: '국제인공서핑협회 검증을 거친 최상의 장비와 제휴 할인 혜택을 만나보세요.',
            empty: '해당 카테고리에 상품이 없습니다.',
            btnPartner: '입점몰 혜택받고 구경하기',
            btnBuy: '구매하기',
            categories: [
                { id: 'all', name: '전체' },
                { id: 'boards', name: '서핑보드' },
                { id: 'clothes', name: '의류' },
                { id: 'acc', name: '악세사리' },
                { id: 'coupang', name: '쿠팡', icon: '📦' },
                { id: 'olive', name: '올리브영', icon: '🌿' }
            ]
        },
        login: {
            title: '로그인', signupTitle: '회원가입', sub: '국제인공서핑협회 공식 플랫폼',
            name: '이름', email: '이메일', password: '비밀번호',
            namePh: '이름을 입력하세요', submitLogin: '로그인', submitSignup: '가입하기',
            toggleToSignup: '계정이 없으신가요? 회원가입', toggleToLogin: '이미 계정이 있으신가요? 로그인'
        }
    },
    EN: {
        common: {
            appName: 'ISA World',
            govCulture: 'Ministry of Culture',
            govCoast: 'Coast Guard',
            login: 'Login',
            signup: 'Sign Up',
            footer: { contact: 'Contact', legal: 'Legal', privacy: 'Privacy Policy', terms: 'Terms of Service', insTerms: 'Insurance Terms', rights: 'ISA. All rights reserved.' }
        },
        quick: { event: 'Events', notice: 'Notices', appCheck: 'App. Check', certCheck: 'Cert. Check', inputApp: 'Enter Application No.', inputCert: 'Name', inputPhone: 'Phone', checkBtn: 'Check' },
        nav: { cert: 'Certification', shop: 'Store', insurance: 'Insurance', map: 'Locations', edu: 'Education' },
        hero: { tag: 'Experience the Future of Surfing', title: 'Beyond Digital Waves', subtitle: "Official Platform of the Int'l Artificial Indoor Surfing Association", cta: 'Apply for Cert', watch: 'Cert Intro', waveHeight: 'Wave Height', waterTemp: 'Water Temp' },
        cert: {
            title: 'Certification Center', desc: 'From Level 4 to Level 1, Prove your skills.',
            processTitle: 'Qualification Process',
            step1: 'Training', step1Desc: 'Instructor Check Required',
            step2: 'Written Exam', step2Desc: '20 Questions / 30 Min',
            step3: 'Practical', step3Desc: 'Upload 3min 1080p Video',
            step4: 'Digital Certificate', step4Desc: 'PDF Certificate · Auto Email Delivery',
            start: 'Start', examFee: 'Exam Fee', total: 'Total',
            creditCard: 'Credit Card', payUnlock: 'Pay & Unlock',
            guideBtn: 'Certification Guide', applyExam: 'Apply for Exam',
            certType: 'Certification Process'
        },
        ins: {
            title: 'ISA Safety Mutual Aid', desc: 'Essential choice for safe surfing. Actual expense coverage & injury care.',
            subscribe: 'Subscribe', claim: 'File Claim', mostPopular: 'Popular', perPeriod: '/ period',
            feature1: 'Injury Medical Expense Support', featureGlobal: 'Global Coverage',
            claimTitle: 'Need to File a Claim?', claimDesc: 'Upload diagnosis and receipts. Approved within 24 hours.'
        },
        map: { title: 'Locations', subtitle: 'Find official artificial surfing spots worldwide.', searchPlaceholder: 'Search country or city...', navigate: 'Navigate', website: 'Website' },
        edu: {
            mainTitle: 'Education Center', mainSubtitle: 'ISA Professional Education Ecosystem',
            menuAcademy: 'ISA Academy', menuAcademyDesc: 'AI-based Materials & Video Learning',
            menuMatch: 'Find Instructor', menuMatchDesc: 'Professional Instructor 1:1 Matching',
            academyTitle: 'ISA Academy', poweredBy: 'Google Notebook LM',
            aiAudioLabel: 'AI Audio Overview', audioTitle: 'Safety Rules & Flow Dynamics',
            audioDesc: 'AI-generated conversational summary of core flowboarding physics.',
            sourceTitle: 'Materials', viewBtn: 'View', videoTitle: 'Skill Videos',
            sampleVideo: 'Advanced 360 Spin Tutorial',
            matchTitle: 'Instructor Matching', filterRegion: 'Region', filterDate: 'Date',
            searchBtn: 'Search', perHour: '/ hour', bookBtn: 'Book Now'
        },
        intro: {
            title: 'ISA Intro Video', subtitle: 'Experience each discipline with AI audio guides and official videos.',
            officialVideo: 'Official Video', aiVoicePreview: 'AI Voice Preview', playBtn: 'Play'
        },
        shop: {
            heroTitle: 'GEAR UP FOR THE WAVES',
            heroDesc: 'Discover top-tier equipment approved by the ISA and enjoy exclusive partner discounts.',
            empty: 'No items found in this category.',
            btnPartner: 'View Partner Benefits',
            btnBuy: 'Buy Now',
            categories: [
                { id: 'all', name: 'All' },
                { id: 'boards', name: 'Surfboards' },
                { id: 'clothes', name: 'Apparel' },
                { id: 'acc', name: 'Accessories' },
                { id: 'coupang', name: 'Coupang', icon: '📦' },
                { id: 'olive', name: 'OliveYoung', icon: '🌿' }
            ]
        },
        login: {
            title: 'LOGIN', signupTitle: 'SIGN UP', sub: 'ISA Official Platform',
            name: 'Name', email: 'Email', password: 'Password',
            namePh: 'Enter your name', submitLogin: 'Login', submitSignup: 'Sign Up',
            toggleToSignup: 'Need an account? Sign up', toggleToLogin: 'Already have an account? Login'
        }
    }
};

// ===== DISCIPLINE INFO FOR INTRO PAGE =====
const DISCIPLINE_INFO = {
    KO: {
        'Standing/Flow Board': {
            title: '스탠딩/플로우 보드',
            desc: '서핑과 스노우보드, 스케이트보드가 결합된 하이브리드 스포츠. 빠른 속도감과 화려한 트릭이 특징입니다.',
            audioTitle: 'Notebook LM: 플로우보딩의 역학',
            audioDesc: '물살을 가르는 엣지 컨트롤과 펌핑 기술에 대한 심층 오디오 가이드입니다.',
            videoTitle: '프로 플로우 라이딩 시범'
        },
        'Body/Boogie Board': {
            title: '보디/부기 보드',
            desc: '파도 위에 엎드려 타는 보디보딩의 인공서핑 버전. 접근성이 높고 역동적인 움직임이 매력적입니다.',
            audioTitle: 'Notebook LM: 보디보딩 기초',
            audioDesc: '올바른 자세와 핀킥 기술로 파도를 극복하는 방법을 안내합니다.',
            videoTitle: '보디보드 고급 기술 시범'
        },
        'Wake Surfing': {
            title: '웨이크 서핑',
            desc: '보트 없이 인공 파도 위에서 즐기는 웨이크서핑. 자연스러운 파도 라이딩의 묘미를 느낄 수 있습니다.',
            audioTitle: 'Notebook LM: 웨이크서핑 입문',
            audioDesc: '웨이크서핑의 기본 원리와 안전 수칙에 대한 전문 오디오 가이드입니다.',
            videoTitle: '웨이크서핑 트릭 모음'
        },
        'Wave Surfing': {
            title: '웨이브 서핑',
            desc: '실제 파도와 가장 유사한 형태의 인공서핑. 스탠딩 자세로 파도를 타며 서핑의 참맛을 느낍니다.',
            audioTitle: 'Notebook LM: 파도 읽는 법',
            audioDesc: '인공 파도의 생성 원리와 최적의 서핑 타이밍에 대한 오디오 가이드입니다.',
            videoTitle: '웨이브서핑 실전 라이딩'
        }
    },
    EN: {
        'Standing/Flow Board': {
            title: 'Standing/Flow Board',
            desc: 'A hybrid sport combining surfing, snowboarding, and skateboarding. Known for speed and spectacular tricks.',
            audioTitle: 'Notebook LM: Flowboarding Dynamics',
            audioDesc: 'An in-depth audio guide on edge control and pumping techniques.',
            videoTitle: 'Pro Flow Riding Demo'
        },
        'Body/Boogie Board': {
            title: 'Body/Boogie Board',
            desc: 'The artificial surfing version of bodyboarding. Highly accessible with dynamic movement.',
            audioTitle: 'Notebook LM: Bodyboarding Basics',
            audioDesc: 'Learn proper posture and fin kick techniques to conquer waves.',
            videoTitle: 'Advanced Bodyboard Tricks'
        },
        'Wake Surfing': {
            title: 'Wake Surfing',
            desc: 'Wake surfing on artificial waves without a boat. Experience natural wave riding sensations.',
            audioTitle: 'Notebook LM: Wake Surf Intro',
            audioDesc: 'Expert audio guide on wake surfing basics and safety rules.',
            videoTitle: 'Wake Surf Tricks Compilation'
        },
        'Wave Surfing': {
            title: 'Wave Surfing',
            desc: 'The most realistic form of artificial surfing. Stand and ride waves to experience true surfing.',
            audioTitle: 'Notebook LM: Reading the Wave',
            audioDesc: 'Audio guide on artificial wave generation and optimal surfing timing.',
            videoTitle: 'Wave Surfing Live Riding'
        }
    }
};

// ===== LEGAL TEXTS =====
const LEGAL_TEXTS = {
    privacy: `개인정보처리방침

국제인공서핑협회(이하 '협회')는 이용자의 개인정보를 소중히 여기며, 개인정보 보호법 등 관계 법령을 준수합니다.
처리하고 있는 개인정보의 이용 목적은 이용 계약의 이행, 이용 편의 제공이며, 동의 없이 제3자에게 제공하지 않습니다.

제1조 (개인정보의 처리 목적)
국제인공서핑협회(이하 '협회')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
1. 회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정 이용 방지, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.
2. 재화 또는 서비스 제공: 물품 배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤형 서비스 제공, 본인인증, 연령인증, 요금 결제·정산을 목적으로 개인정보를 처리합니다.
3. 고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.

제2조 (처리하는 개인정보의 항목)
협회는 다음의 개인정보 항목을 처리하고 있습니다.
• 필수 항목: 이름, 이메일 주소, 비밀번호, 연락처, 생년월일, 성별
• 자동 수집 항목: 서비스 이용 기록, 접속 로그, 쿠키

제3조 (개인정보의 처리 및 보유 기간)
1. 협회는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
• 회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관)
• 서비스 이용 기록: 3년
• 결제 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)

제4조 (개인정보의 제3자 제공)
협회는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.

제5조 (개인정보처리의 위탁)
협회는 원활한 개인정보 업무처리를 위하여 개인정보 처리업무를 위탁하는 경우, 위탁계약 시 개인정보보호 관련 처리 제한, 기술적·관리적 보호조치, 재위탁 제한 등을 규정하고 이행합니다.

제6조 (정보주체의 권리·의무 및 행사 방법)
이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
1. 개인정보 열람 요구
2. 오류 등이 있을 경우 정정 요구
3. 삭제 요구
4. 처리 정지 요구
위 권리 행사는 서면, 전화, 전자우편, 인터넷(홈페이지) 등을 통하여 하실 수 있으며, 협회는 이에 대해 지체 없이 조치하겠습니다.

제7조 (개인정보의 안전성 확보 조치)
협회는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육
2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
3. 물리적 조치: 전산실, 자료보관실 등의 접근통제

제8조 (개인정보 보호책임자)
• 개인정보 보호책임자: 협회 정보보호담당자
• 이메일: info@isa-surfing.org
• 연락처: 02-554-2212

제9조 (개인정보 처리방침 변경)
이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.

부칙: 이 개인정보처리방침은 2026년 5월 1일부터 시행합니다.`,

    terms: `이용약관

제1조 (목적)
이 약관은 국제인공서핑협회(이하 '협회')가 운영하는 인공서핑 자격증 취득 및 관련 서비스(이하 '서비스')의 이용 조건 및 절차, 회원과 협회의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"라 함은 단말기(PC, 모바일단말기 등)에 관계없이 회원이 이용할 수 있는 자격 신청, 취소, 조회 및 협회와 관련한 제반 서비스를 의미합니다.
2. "회원"이라 함은 협회 홈페이지에 접속하여 이 약관에 동의하고 협회와 이용 계약을 체결하여 협회의 서비스를 이용하는 자를 말합니다.
3. "아이디(ID)"란 회원의 식별 및 이용을 위하여 회원이 정하고 협회가 승인하는 자에 대한 문자와 숫자의 조합을 의미합니다.
4. "자격증"이라 함은 협회가 부여하는 인공서핑 관련 레벨 능력을 검증하고 발급하는 인공서핑 등급 레벨 자격을 의미합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.
2. 협회는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 협회가 약관을 변경할 경우에는 적용일자 7일 이전부터 공지합니다. 다만, 회원에게 불리한 약관의 변경인 경우에는 그 적용일자 30일 이상의 기간을 두고 공지합니다.

제4조 (이용 계약)
1. 이용 계약은 회원이 될 분이 회원가입 이용신청을 하면 협회가 이를 승낙함으로써 계약이 성립됩니다.
2. 자격증 신청 등 각종 신청 절차는 협회 이용 승낙 이후에 가능합니다.

제5조 (이용신청 및 제한)
1. 서비스를 이용하는 자는 협회가 요청하는 소정 양식(이름, 연락처 등)을 제공하여야 하며, 허위로 기재한 회원은 이용을 제한할 수 있습니다.
2. 협회는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 않거나 사후에 이용 계약을 해지할 수 있습니다.
  • 타인의 명의를 이용하여 신청한 경우
  • 이용신청 시 허위 내용을 기재한 경우
  • 협회의 안내 사항, 정보의 허가 없이 신청한 경우
  • 기타 협회가 정한 이용신청 이용 이력이 있는 경우

제6조 (제공 서비스)
협회는 회원에게 다음의 서비스를 제공합니다.
1. 인공서핑 자격증 신청 및 취득 안내
2. 자격증 발급(국내 및 국제 발급) 및 조회
3. 자격증 취득 여부 확인용 증빙 발급
4. 기타 협회가 정하는 서비스

제7조 (자격증 발급 및 제한)
1. 자격증 발급을 원하는 회원은 협회에 소정의 서류를 구비하고 심사를 받아야 합니다.
2. 각 등급 별 기준은 웨이브, 스케이트 등 협회가 정하는 기준에 의합니다.
3. 자격증 발급(최초 발급) 이후 갱신(재발급) 관련 내용은 협회가 정하는 취지에 의하여 발급받을 수 있습니다.

제8조 (환불 정책)
1. 회원이 자격증 신청 이후에 신청 취소 또는 환급을 요청하는 경우, 각 결제 수수료(운행 비용 제외)를 공제한 후 해당 금액을 환급합니다.
2. 협회의 책임 없는 사유로 서비스를 이용하지 못한 경우 환급합니다.

제9조 (서비스 중단)
협회는 천재지변, 시스템 고장, 정전 또는 천연 재해 등 불가항력적인 사유가 발생한 경우에는 서비스 제공을 일시적으로 중단할 수 있습니다.

제10조 (협회의 의무)
1. 협회는 지속적으로 안정적인 서비스를 제공하기 위한 노력을 다하겠습니다.
2. 협회는 회원의 개인정보를 보호하기 위해 최선을 다하며, 개인정보처리방침을 준수합니다.

제11조 (회원의 의무)
1. 회원은 자격증 신청 및 이용 시 본인의 정보에 맞게 작성하여야 하며, 허위 정보 입력으로 인한 불이익은 본인이 전적으로 책임집니다.
2. 회원은 자신의 ID와 비밀번호를 제3자에게 제공하거나 대여해서는 안 되며, 관련 모든 책임은 본인에게 있습니다.
3. 회원은 협회의 사전 승낙 없이 서비스를 이용하여 영리를 목적으로 하는 활동을 하지 않습니다.

제12조 (저작권 및 지식재산)
1. 협회가 작성한 저작물에 대한 저작권 및 기타 지식재산권은 협회에 귀속됩니다.
2. 회원은 서비스를 이용함으로써 얻은 협회의 사전 승낙 없이 서적, 방송, 신문, 인터넷 및 기타 방법으로 협회의 서비스 정보를 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.

제13조 (책임)
협회는 천재지변 또는 이에 준하는 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.

제14조 (재판관할)
이 약관에 의하여 발생한 분쟁에 관한 소송은 협회의 주소지를 관할하는 법원을 제1심 법원으로 합니다.

부칙: 이 약관은 2026년 5월 1일부터 시행합니다.`,

    insurance: `공제회 이용약관 (실기 훈련 공제 서비스 정책)

제1장 총칙

제1조 (목적)
이 약관은 국제인공서핑협회(이하 "협회"라 한다)가 운영하는 인공서핑 자격 취득을 위한 실기 훈련 시 발생하는 회원(이하 "회원"이라 한다)의 상해 피해를 경제적으로 지원하여 회원의 활동 안전 및 복리 증진을 도모함을 목적으로 합니다.

제2조 (정의)
"실기 훈련"이라 함은 협회의 인공서핑 시설에서 해당 자격증 취득 시 필수 이수하여야 하는 소정의 훈련 시간을 말합니다.
"사고"란 해당 회원의 실기 훈련 중 발생하고, 우연하고 외래적인 운동 사고로 인해 신체의 이상을 입은 경우를 말합니다.
"진료비"란 공제 사고 회원이 실제 치료비를 받고 그 대가로 의료 기관에 지불하는 의료비로서 건강보험이 적용되는 본인부담금과 비급여로 분리됩니다.

제3조 (약관의 효력 및 변경)
이 약관은 회원이 협회에 가입하고 협회에서 승인함으로써 효력이 발생합니다.
협회는 필요한 경우 약관을 변경할 수 있으며, 효력이 발생한 7일 이전에 회원에게 공시하여야 합니다.

제2장 공제 체계 및 의무

제4조 (회원의 자격)
이 약관의 적용을 받으려는 자가 실기 훈련 신청서를 제출하고 협회의 심사를 받습니다.
협회는 회원의 가입과 함께 회원 카드(자격 확인서)를 발급합니다.

제5조 (회원의 의무)
사고 통지 의무: 회원은 사고 발생 시 치료 내역, 청구서 및 관련 서류를 협회에 제출하거나 알려야 합니다.
안전 준수 의무: 회원은 실기 훈련 시 안전 규칙을 준수하여야 하며, 사고 발생 시 현장 확인을 위한 사진을 찍어야 합니다.

제3장 공제 지급 (상해 공제)

제6조 (지급하는 공제)
협회는 회원이 훈련 기간(실기 훈련 시간) 중에 발생한 사고에 의하여 의료 치료비를 지급하는 경우, 회원에게 의료비 일부를 지급합니다.
본인 건강보험이 적용되는 의료비에 대해 회원의 본인부담금 일부를 지원합니다.

제7조 (공제 제외 사항)
협회는 다음 각 호에 해당하는 경우 공제 보호를 제공하지 않습니다.
• 회원 본인이나 그 가족의 의료비 지급 사항 중 고의사고
• 실기 훈련 규정 위반의 활동으로 발생한 사고
• 전쟁, 외국침략, 내란, 반란, 혁명, 폭동, 폭발
• 의사의 처방에 의하지 않는 약 복용, 이용 이외의 치료비
• 음주 상태에서 행해진 실기 훈련 (단, 저의 음주량이 법정 이하로서 의학적 관계를 알 수 없는 경우)

제8조 (공제 한도액 및 자기부담금)
협회는 1회에 진행하여 지급된 본인 공제금액(한도)을 한도로 합니다.
회원의 실제 의료비 지급 청구 금액 중에서, 청구 공제 금액(예: 1만 원 이상) 또는 치료비 비율(예: 10~20%)을 자기부담금으로 하고 그 비용이 남는 금액을 지급합니다.

제9조 (중복 보험 처리)
회원이 치료를 받는 다른 의료보험 또는 방침에 포함되어 있는 경우, 협회는 지급 사후에 타 보험사와 별도 청구를 합니다 (이중 청구 방지 원칙).

제4장 공제 신청 및 처리

제10조 (사고 통지)
회원은 사고 발생 시 즉시 및 가능한 범위에서, 시간, 장소, 상황 및 상태 등을 협회에 알려야 합니다.

제11조 (공제 신청 서류)
회원은 공제 청구를 위하여 협회에 다음을 제출하여야 합니다.
• 공제 신청서 (협회 양식 별도)
• 진단서 사본
• 진료비, 처방 정보, 의료 등 공제 서류 (최초 발급)
• 훈련 기록 증빙 (실기 시간, 강사 확인서 등)
• 기타 이용료의 진료비

제12조 (공제 지급 기일)
협회는 청구 서류 수령 후 일반적으로 7일 이내 공제금을 지급합니다. 다만, 검사가 필요한 경우 그 이상의 기간이 걸릴 수도 있으며, 공제금 중 50%를 우선 지급할 수 있습니다.

제5장 기타 규정

제13조 (개인 정보)
협회는 이 약관 체결 시 회원 정보의 관련하여 필요한 최소한의 해당 회원 정보(개인 정보)를 이용하며, 회원 개인 정보를 제3자에게 제공하지 않습니다.

제14조 (분쟁해결 및 소송 관할)
이 약관의 해석 및 공제과정에서 한국법이 적용되며, 소송 시 협회 본사를 관할하는 법원을 제1심 법원으로 합니다.

// ===== SHOP DATA (Integrated) =====
const SHOP_DATA = [
    { 
        id: 1, 
        name: 'ISA Pro Flowboard 2025', 
        price: 850000, 
        img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600', 
        cat: 'boards',
        desc: {
            KO: '전문가용 하이엔드 인공서핑 플로우보드. 카본 파이버 적용으로 초경량화.',
            EN: 'High-end flowboard for pros. Ultra-lightweight with carbon fiber.'
        },
        rating: 4.9
    },
    { 
        id: 2, 
        name: 'Beginner Wave Board', 
        price: 250000, 
        img: 'https://images.unsplash.com/photo-1595166297371-29e28f359de6?w=600', 
        cat: 'boards',
        desc: {
            KO: '입문자를 위한 넓고 안정적인 소프트 폼 보드.',
            EN: 'Wide and stable soft foam board for beginners.'
        },
        rating: 4.7
    },
    { 
        id: 3, 
        name: 'ISA Pro Wetsuit 3/2mm', 
        price: 320000, 
        img: 'https://images.unsplash.com/photo-1563212882-7abac4005bc4?w=600', 
        cat: 'clothes',
        desc: {
            KO: '사계절용 최고급 네오프렌 웻슈트. 신축성과 보온성 탁월.',
            EN: 'Premium neoprene wetsuit for ALL seasons. Excellent stretch.'
        },
        rating: 4.9
    },
    { 
        id: 4, 
        name: 'ISA Aero Rashguard (Black)', 
        price: 59000, 
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 
        cat: 'clothes',
        desc: {
            KO: '강한 물살에도 피부를 완벽하게 보호하는 기능성 래쉬가드.',
            EN: 'Functional rashguard protecting your skin from strong currents.'
        },
        rating: 4.8
    },
    { 
        id: 5, 
        name: 'Pro Grip Tape 3M', 
        price: 25000, 
        img: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?w=600', 
        cat: 'acc',
        desc: {
            KO: '물속에서도 미끄러지지 않는 초강력 다이아몬드 그립 테이프.',
            EN: 'Ultra-strong diamond grip tape that prevents slipping in water.'
        },
        rating: 4.6
    },
    { 
        id: 6, 
        name: 'Surfing Earplugs (Waterproof)', 
        price: 15000, 
        img: 'https://images.unsplash.com/photo-1583394838336-acd977730f90?w=600', 
        cat: 'acc',
        desc: {
            KO: '물 유입을 완벽히 차단하고 소리는 투과하는 서핑 전용 귀마개.',
            EN: 'Surfing earplugs that block water while allowing sound.'
        },
        rating: 4.7
    },
    { 
        id: 7, 
        name: '[쿠팡특가] 프로 안전 헬멧', 
        price: 45000, 
        img: 'https://images.unsplash.com/photo-1454165833767-027508496b41?w=600', 
        cat: 'coupang', 
        link: 'https://www.coupang.com', 
        tag: { KO: '로켓배송', EN: 'Fast Ship' },
        desc: {
            KO: '인공서핑 중 머리를 보호하는 통기성 뛰어난 충격흡수 헬멧.',
            EN: 'Shock-absorbing helmet with high breathability.'
        },
        rating: 4.9
    },
    { 
        id: 8, 
        name: '[Olive] 워터프루프 선크림', 
        price: 18000, 
        img: 'https://images.unsplash.com/photo-1556228720-da3e21cb3549?w=600', 
        cat: 'olive', 
        link: 'https://www.oliveyoung.co.kr', 
        tag: { KO: '단독특가', EN: 'Sale' },
        desc: {
            KO: '산호초를 보호하는 리프세이프 인증, 안 지워지는 강력 썬가드.',
            EN: 'Reef-safe certified, strong waterproof sun guard.'
        },
        rating: 4.8
    }
];

// 이 약관은 2026년 5월 1일부터 시행합니다.`
    }
};

// ===== SHOP DATA (Integrated) =====
const SHOP_DATA = [
    { 
        id: 1, 
        name: 'ISA Pro Flowboard 2025', 
        price: 850000, 
        img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600', 
        cat: 'boards',
        desc: {
            KO: '전문가용 하이엔드 인공서핑 플로우보드. 카본 파이버 적용으로 초경량화.',
            EN: 'High-end flowboard for pros. Ultra-lightweight with carbon fiber.'
        },
        rating: 4.9
    },
    { 
        id: 2, 
        name: 'Beginner Wave Board', 
        price: 250000, 
        img: 'https://images.unsplash.com/photo-1595166297371-29e28f359de6?w=600', 
        cat: 'boards',
        desc: {
            KO: '입문자를 위한 넓고 안정적인 소프트 폼 보드.',
            EN: 'Wide and stable soft foam board for beginners.'
        },
        rating: 4.7
    },
    { 
        id: 3, 
        name: 'ISA Pro Wetsuit 3/2mm', 
        price: 320000, 
        img: 'https://images.unsplash.com/photo-1563212882-7abac4005bc4?w=600', 
        cat: 'clothes',
        desc: {
            KO: '사계절용 최고급 네오프렌 웻슈트. 신축성과 보온성 탁월.',
            EN: 'Premium neoprene wetsuit for ALL seasons. Excellent stretch.'
        },
        rating: 4.9
    },
    { 
        id: 4, 
        name: 'ISA Aero Rashguard (Black)', 
        price: 59000, 
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 
        cat: 'clothes',
        desc: {
            KO: '강한 물살에도 피부를 완벽하게 보호하는 기능성 래쉬가드.',
            EN: 'Functional rashguard protecting your skin from strong currents.'
        },
        rating: 4.8
    },
    { 
        id: 5, 
        name: 'Pro Grip Tape 3M', 
        price: 25000, 
        img: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?w=600', 
        cat: 'acc',
        desc: {
            KO: '물속에서도 미끄러지지 않는 초강력 다이아몬드 그립 테이프.',
            EN: 'Ultra-strong diamond grip tape that prevents slipping in water.'
        },
        rating: 4.6
    },
    { 
        id: 6, 
        name: 'Surfing Earplugs (Waterproof)', 
        price: 15000, 
        img: 'https://images.unsplash.com/photo-1583394838336-acd977730f90?w=600', 
        cat: 'acc',
        desc: {
            KO: '물 유입을 완벽히 차단하고 소리는 투과하는 서핑 전용 귀마개.',
            EN: 'Surfing earplugs that block water while allowing sound.'
        },
        rating: 4.7
    },
    { 
        id: 7, 
        name: '[쿠팡특가] 프로 안전 헬멧', 
        price: 45000, 
        img: 'https://images.unsplash.com/photo-1454165833767-027508496b41?w=600', 
        cat: 'coupang', 
        link: 'https://www.coupang.com', 
        tag: { KO: '로켓배송', EN: 'Fast Ship' },
        desc: {
            KO: '인공서핑 중 머리를 보호하는 통기성 뛰어난 충격흡수 헬멧.',
            EN: 'Shock-absorbing helmet with high breathability.'
        },
        rating: 4.9
    },
    { 
        id: 8, 
        name: '[Olive] 워터프루프 선크림', 
        price: 18000, 
        img: 'https://images.unsplash.com/photo-1556228720-da3e21cb3549?w=600', 
        cat: 'olive', 
        link: 'https://www.oliveyoung.co.kr', 
        tag: { KO: '단독특가', EN: 'Sale' },
        desc: {
            KO: '산호초를 보호하는 리프세이프 인증, 안 지워지는 강력 썬가드.',
            EN: 'Reef-safe certified, strong waterproof sun guard.'
        },
        rating: 4.8
    }
];

