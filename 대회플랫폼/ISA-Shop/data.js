const LANG = {
    KO: {
        header: {
            title: 'STORE',
            cart: 'Cart',
            login: '로그인'
        },
        hero: {
            title: '당신의 파도를 준비하세요',
            desc: '국제인공서핑협회 검증을 거친 최상의 장비와 제휴 할인 혜택을 만나보세요.'
        },
        banner: {
            title: '수강생 전용 제휴 할인 혜택!🎟️',
            desc1: '현재 메인 사이트에서 ',
            bold1: '[자격증 응시]',
            desc2: ' 또는 ',
            bold2: '[아카데미 수강]',
            desc3: '을 신청하시면,<br>쿠팡 및 올리브영에서 즉시 사용할 수 있는 최대 5만원권 제휴 장비 구매 쿠폰을 지급해 드립니다. ',
            link: '(자격증 신청 페이지로 이동)'
        },
        categories: [
            { id: 'all', name: '전체' },
            { id: 'boards', name: '보드' },
            { id: 'clothes', name: '의류' },
            { id: 'acc', name: '액세서리' },
            { id: 'coupang', name: '쿠팡', icon: '📦' },
            { id: 'olive', name: '올리브영', icon: '🌿' },
            { id: 'others', name: '기타' }
        ],
        empty: '해당 카테고리에 상품이 없습니다.',
        btn: {
            partner: '입점몰 혜택받고 구경하기',
            native: '구매하기',
            confirm: '확인'
        },
        modal: {
            title: '시스템 안내 (System)',
            readyMsg: '장바구니/결제 시스템 준비 중입니다.'
        }
    },
    EN: {
        header: {
            title: 'STORE',
            cart: 'Cart',
            login: 'Login'
        },
        hero: {
            title: 'GEAR UP FOR THE WAVES',
            desc: 'Discover top-tier equipment approved by the ISA and enjoy exclusive partner discounts.'
        },
        banner: {
            title: 'Exclusive Discounts for Trainees!🎟️',
            desc1: 'When you apply for ',
            bold1: '[Certification Exam]',
            desc2: ' or ',
            bold2: '[Academy Training]',
            desc3: ' on our main website,<br>you will receive up to ₩50,000 equivalent equipment coupons for Coupang & Olive Young. ',
            link: '(Go to Certification Page)'
        },
        categories: [
            { id: 'all', name: 'All' },
            { id: 'boards', name: 'Boards' },
            { id: 'clothes', name: 'Apparel' },
            { id: 'acc', name: 'Accessories' },
            { id: 'coupang', name: 'Coupang', icon: '📦' },
            { id: 'olive', name: 'OliveYoung', icon: '🌿' },
            { id: 'others', name: 'Others' }
        ],
        empty: 'No items found in this category.',
        btn: {
            partner: 'View Partner Benefits',
            native: 'Buy Now',
            confirm: 'OK'
        },
        modal: {
            title: 'System Message',
            readyMsg: 'Cart and Payment system are currently in preparation.'
        }
    }
};

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
        id: 4, 
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
        id: 5, 
        name: '[쿠팡특가/Special] 안전 헬멧', 
        price: 42000, 
        img: 'https://images.unsplash.com/photo-1454165833767-027508496b41?w=600', 
        cat: 'coupang', 
        link: 'https://www.coupang.com', 
        tag: { KO: '로켓배송', EN: 'Fast Ship' },
        desc: {
            KO: '인공서핑 중 머리를 보호하는 통기성 뛰어난 충격흡수 헬멧.',
            EN: 'Shock-absorbing helmet with high breathability for artificial surfing.'
        },
        rating: 4.9
    },
    { 
        id: 6, 
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
    },
    { 
        id: 7, 
        name: 'Hybrid Smartwatch Strap', 
        price: 32000, 
        img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600', 
        cat: 'acc',
        desc: {
            KO: '인공서핑 중에도 풀리지 않는 실리콘-메탈 하이브리드 스트랩.',
            EN: 'Silicone-metal hybrid strap that never comes loose during rides.'
        },
        rating: 4.5
    },
    { 
        id: 8, 
        name: 'ISA Official Keychain', 
        price: 8000, 
        img: 'https://images.unsplash.com/photo-1516086256959-5fafaae39d2c?w=600', 
        cat: 'others',
        desc: {
            KO: '국제인공서핑협회 로고가 각인된 한정판 서핑보드 키링.',
            EN: 'Limited edition surfboard keychain engraved with the ISA logo.'
        },
        rating: 4.9
    }
];
