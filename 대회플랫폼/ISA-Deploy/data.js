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
    { id: 1, name: 'Basic', durationLabel: '1개월', price: 9900, coverage: '최대 10만원 보상' },
    { id: 2, name: 'Standard', durationLabel: '6개월', price: 29900, coverage: '최대 30만원 보상' },
    { id: 3, name: 'Premium', durationLabel: '12개월', price: 49900, coverage: '최대 30만원 보상' }
];

// ===== SURFING LOCATIONS =====
const SURF_LOCATIONS = [
    { id: 1, name: 'Wave Park Siheung', country: 'South Korea', status: 'OPEN', phone: '031-000-0000', lat: 37.38, lng: 126.74 },
    { id: 2, name: 'Surf Poel', country: 'Belgium', status: 'OPEN', phone: '+32-000-000', lat: 51.12, lng: 4.39 },
    { id: 3, name: 'UNIT Surf Pool', country: 'Germany', status: 'OPEN', phone: '+49-000-000', lat: 48.13, lng: 11.58 },
    { id: 4, name: 'Citywave Munich', country: 'Germany', status: 'OPEN', phone: '+49-000-000', lat: 48.14, lng: 11.55 },
    { id: 5, name: 'Surf\'s Up New Hampshire', country: 'USA', status: 'OPEN', phone: '+1-000-000', lat: 42.99, lng: -71.45 },
    { id: 6, name: 'FlowRider Sentosa', country: 'Singapore', status: 'OPEN', phone: '+65-000-000', lat: 1.25, lng: 103.82 },
    { id: 7, name: 'Surf House Phuket', country: 'Thailand', status: 'OPEN', phone: '+66-000-000', lat: 7.88, lng: 98.38 },
    { id: 8, name: 'Aloha Surfhouse', country: 'Australia', status: 'OPEN', phone: '+61-000-000', lat: -31.95, lng: 115.86 }
];

// ===== INSTRUCTORS =====
const INSTRUCTORS = [
    { id: 1, name: '김서퍼', region: 'Seoul, Korea', level: 1, rating: 4.9, rate: 80000, image: 'https://picsum.photos/400/300?random=10' },
    { id: 2, name: 'Alex Wave', region: 'Sydney, AU', level: 2, rating: 4.8, rate: 120000, image: 'https://picsum.photos/400/300?random=11' },
    { id: 3, name: '박플로우', region: 'Busan, Korea', level: 1, rating: 5.0, rate: 90000, image: 'https://picsum.photos/400/300?random=12' },
    { id: 4, name: 'Mike Flow', region: 'LA, USA', level: 2, rating: 4.7, rate: 150000, image: 'https://picsum.photos/400/300?random=13' },
    { id: 5, name: '이웨이브', region: 'Jeju, Korea', level: 1, rating: 4.9, rate: 85000, image: 'https://picsum.photos/400/300?random=14' },
    { id: 6, name: 'Sarah Surf', region: 'Bali, ID', level: 3, rating: 4.6, rate: 70000, image: 'https://picsum.photos/400/300?random=15' }
];

// ===== EVENTS & NOTICES =====
const EVENTS = {
    KO: [
        { date: '2025.06.15', title: '제1회 ISA 인공서핑 챔피언십 개최' },
        { date: '2025.07.20', title: '여름 특별 할인 이벤트 (공제회 가입비 50% 할인)' },
        { date: '2025.08.10', title: 'ISA x Wave Park 콜라보 페스티벌' },
        { date: '2025.09.01', title: '가을 자격증 시험 일정 공고' }
    ],
    EN: [
        { date: '2025.06.15', title: '1st ISA Artificial Surfing Championship' },
        { date: '2025.07.20', title: 'Summer Special Discount (50% off Insurance)' },
        { date: '2025.08.10', title: 'ISA x Wave Park Collaboration Festival' },
        { date: '2025.09.01', title: 'Fall Certification Exam Schedule' }
    ]
};

const NOTICES = {
    KO: [
        { date: '2025.05.01', title: '홈페이지 리뉴얼 안내' },
        { date: '2025.05.10', title: '자격증 발급 절차 변경 공지' },
        { date: '2025.05.15', title: '공제회 약관 개정 안내' },
        { date: '2025.05.20', title: '시스템 정기 점검 안내 (5/25)' }
    ],
    EN: [
        { date: '2025.05.01', title: 'Website Renewal Notice' },
        { date: '2025.05.10', title: 'Certificate Issuance Process Update' },
        { date: '2025.05.15', title: 'Mutual Aid Terms Revision Notice' },
        { date: '2025.05.20', title: 'System Maintenance Notice (5/25)' }
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
            step4: '자격 발급', step4Desc: '디지털 및 실물 카드 발급',
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
            step4: 'Issuance', step4Desc: 'Digital & Physical Card',
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
            title: 'ISA Introduction', subtitle: 'Discover the charm of each discipline with AI Audio Guides and Official Videos.',
            officialVideo: 'Official Video', aiVoicePreview: 'AI Voice Preview', playBtn: 'Watch Now'
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
        'Standing/Flow Board': { title: '스탠딩/플로우 보드', desc: '서핑과 스노우보드, 스케이트보드가 결합된 하이브리드 스포츠. 빠른 속도감과 화려한 트릭이 특징입니다.', audioTitle: 'Notebook LM: 플로우보딩의 역학', audioDesc: '물살을 가르는 엣지 컨트롤과 펌핑 기술에 대한 심층 오디오 가이드입니다.', videoTitle: '프로 라이더 데모' },
        'Body/Boogie Board': { title: '바디/부기 보드', desc: '가장 접근하기 쉽고 역동적인 인공 서핑의 시작. 낮은 자세로 파도를 타며 스핀과 기술을 구사합니다.', audioTitle: 'Notebook LM: 바디보드 심층 분석', audioDesc: '바디보딩의 역사와 핵심 기술인 "엘 로로(El Rollo)"의 물리학적 원리에 대한 AI 대화 요약입니다.', videoTitle: '바디보드 테크닉 가이드' },
        'Wake Surfing': { title: '웨이크 서핑', desc: '보트가 만들어내는 끊임없는 파도를 타는 즐거움. 인공 파도 풀에서의 새로운 경험.', audioTitle: 'Notebook LM: 웨이크 서핑 안전 수칙', audioDesc: '초보자가 반드시 알아야 할 로프 핸들링과 스탠스 유지법.', videoTitle: '웨이크 서핑 기초' },
        'Wave Surfing': { title: '웨이브 서핑 (인공 파도)', desc: '바다의 파도를 완벽하게 재현한 인공 서핑. 날씨와 상관없이 완벽한 배럴을 경험하세요.', audioTitle: 'Notebook LM: 인공 파도 기술의 진화', audioDesc: '공압식 조파 장치가 만들어내는 파도의 원리와 서퍼의 대응 전략.', videoTitle: '시설 소개 및 라이딩' }
    },
    EN: {
        'Standing/Flow Board': { title: 'Standing/Flow Board', desc: 'A hybrid sport combining surfing, snowboarding, and skateboarding. Characterized by high speed and spectacular tricks.', audioTitle: 'Notebook LM: Mechanics of Flowboarding', audioDesc: 'In-depth audio guide on edge control and pumping techniques cutting through the water.', videoTitle: 'Pro Rider Demo' },
        'Body/Boogie Board': { title: 'Body/Boogie Board', desc: 'The most accessible and dynamic start to artificial surfing. Ride the waves in a low position performing spins and tricks.', audioTitle: 'Notebook LM: Bodyboard Deep Dive', audioDesc: 'AI conversation summary on the history of bodyboarding and the physics behind the "El Rollo".', videoTitle: 'Bodyboard Technique Guide' },
        'Wake Surfing': { title: 'Wake Surfing', desc: 'The joy of riding endless waves created by a boat. A new experience in artificial wave pools.', audioTitle: 'Notebook LM: Wakesurfing Safety', audioDesc: 'Rope handling and stance maintenance essentials for beginners.', videoTitle: 'Wakesurfing Basics' },
        'Wave Surfing': { title: 'Wave Surfing (Artificial)', desc: 'Artificial surfing perfectly recreating ocean waves. Experience perfect barrels regardless of weather.', audioTitle: 'Notebook LM: Evolution of Wave Tech', audioDesc: 'Principles of waves created by pneumatic wave makers and surfer strategies.', videoTitle: 'Facility Tour & Riding' }
    }
};

// ===== LEGAL TEXTS (abbreviated) =====
const LEGAL_TEXTS = {
    privacy: `개인정보처리방침

국제인공서핑협회(이하 "협회")는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.

제1조 (개인정보의 처리 목적)
협회는 다음의 목적을 위하여 개인정보를 처리합니다.
1. 회원 가입 및 관리: 회원 가입의사 확인, 회원 자격 유지·관리, 서비스 부정이용 방지
2. 자격증 발급 및 관리: 자격 시험 접수, 합격 여부 확인, 자격증 발급 및 조회
3. 공제회 운영: 공제 가입, 공제금 청구 및 지급

제2조 (개인정보의 처리 및 보유 기간)
협회는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

제3조 (개인정보의 제3자 제공)
협회는 원칙적으로 정보주체의 개인정보를 제1조에서 명시한 범위 내에서 처리하며, 정보주체의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.

부칙 이 방침은 2025년 5월 1일부터 시행합니다.`,

    terms: `국제인공서핑협회(ISA) 홈페이지 이용약관

제1장 총칙

제1조 (목적)
이 약관은 국제인공서핑협회(이하 "협회")가 제공하는 자격증 발급 및 관련 제반 서비스의 이용조건 및 절차를 규정함을 목적으로 합니다.

제2조 (용어의 정의)
"서비스"란 회원이 이용할 수 있는 자격증 신청, 발급, 조회 등 협회가 제공하는 제반 서비스를 의미합니다.
"회원"이란 협회의 홈페이지에서 본 약관에 따라 이용계약을 체결하고 서비스를 이용하는 자를 말합니다.

제7조 (자격증 발급 및 수수료)
자격증 발급을 원하는 회원은 협회가 정한 절차에 따라 신청하고 수수료를 납부해야 합니다.

제8조 (환불 규정)
회원이 자격증 시험 접수 또는 발급 신청을 취소하는 경우, 관련 법령에 따라 수수료를 환불합니다.

부칙 이 약관은 2025년 5월 1일부터 시행합니다.`,

    insurance: `국제인공서핑협회 공제회 이용약관 (실습 상해 실비 보상형)

제1장 총칙

제1조 (목적)
본 약관은 국제인공서핑협회가 주관하는 인공서핑 자격증 실기 실습 과정에 참여하는 이수자가 실습 중 발생한 상해로 인한 경제적 손실을 보상하여 회원의 생활 안정을 도모함을 목적으로 합니다.

제6조 (보상하는 손해)
협회는 회원이 공제 기간 중에 발생한 공제사고로 인하여 의료기관에서 치료를 받은 경우, 회원이 실제로 부담한 의료비의 일부를 공제금으로 지급합니다.

제7조 (보상하지 않는 손해)
회원 또는 수익자의 고의로 생긴 손해, 실습과 무관한 개인적인 활동 중 발생한 사고 등은 보상하지 않습니다.

제8조 (보상 한도)
1회의 공제사고에 대하여 가입 시 약정한 보상한도액을 한도로 보상합니다. 최대 보상금은 30만원입니다.

부칙 이 약관은 2025년 5월 1일부터 시행합니다.`
};
