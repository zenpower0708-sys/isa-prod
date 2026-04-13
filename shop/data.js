const LANG = {
    KO: {
        header: {
            title: 'STORE',
            cart: 'Cart',
            login: '로그인',
            logout: '로그아웃'
        },
        auth: {
            titleLogin: '로그인',
            titleSignup: '회원가입',
            name: '이름',
            email: '이메일 주소',
            pw: '비밀번호',
            btnSubmit: '확인',
            toSignup: '계정이 없으신가요? 회원가입',
            toLogin: '이미 계정이 있으신가요? 로그인',
            welcome: '님, 환영합니다!',
            logoutConfirm: '로그아웃 하시겠습니까?'
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
            { id: 'boards', name: '서핑보드' },
            { id: 'clothes', name: '의류' },
            { id: 'acc', name: '악세사리' },
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
        },
        checkout: {
            title: '주문 및 배송 정보',
            name: '주문자 이름',
            phone: '휴대폰 번호',
            zip: '우편번호',
            zipBtn: '찾기',
            addr: '배송 주소',
            detail: '상세 주소',
            request: '배송 요청사항',
            reqOptions: [
                { val: 'none', text: '선택 안 함' },
                { val: 'front', text: '문 앞에 놓아주세요' },
                { val: 'security', text: '경비실에 맡겨주세요' },
                { val: 'direct', text: '직접 수령하겠습니다' }
            ],
            agree: '개인정보 수집 및 배송 정보 제공에 동의합니다.',
            submit: '결제하기',
            success: '주문이 정상적으로 접수되었습니다. 곧 안내 문자가 발송됩니다.'
        }
    },
    EN: {
        header: {
            title: 'STORE',
            cart: 'Cart',
            login: 'Login',
            logout: 'Logout'
        },
        auth: {
            titleLogin: 'Login',
            titleSignup: 'Sign Up',
            name: 'Name',
            email: 'Email Address',
            pw: 'Password',
            btnSubmit: 'Submit',
            toSignup: "Don't have an account? Sign up",
            toLogin: 'Already have an account? Login',
            welcome: 'Welcome, ',
            logoutConfirm: 'Are you sure you want to logout?'
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
            { id: 'boards', name: 'Surfboards' },
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
        },
        checkout: {
            title: 'Order & Shipping Info',
            name: 'Full Name',
            phone: 'Phone Number',
            zip: 'Zip Code',
            zipBtn: 'Find',
            addr: 'Shipping Address',
            detail: 'Detail Address',
            request: 'Delivery Instructions',
            reqOptions: [
                { val: 'none', text: 'None' },
                { val: 'front', text: 'Leave at the door' },
                { val: 'security', text: 'Leave at security office' },
                { val: 'direct', text: 'Pickup in person' }
            ],
            agree: 'Agree to collection of personal info and delivery providing.',
            submit: 'Place Order',
            success: 'The order has been received successfully. A text will be sent soon.'
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
            KO: '인공서핑 중 머리를 보호하는 통기성 뛰어난 충격흡수 헬멧. (쿠팡 경유 시 추가 할인)',
            EN: 'Shock-absorbing helmet with high breathability. Extra discount via Coupang.'
        },
        rating: 4.9
    },
    { 
        id: 8, 
        name: '[쿠팡/Event] 라이프 자켓', 
        price: 68000, 
        img: 'https://images.unsplash.com/photo-1627918544974-9ae00624bd7e?w=600', 
        cat: 'coupang', 
        link: 'https://www.coupang.com', 
        tag: { KO: '할인가', EN: 'Sale' },
        desc: {
            KO: '최고급 네오프렌 소재의 초강력 부력 라이프 자켓. 자격증 쿠폰 적용 가능!',
            EN: 'Premium neoprene life jacket. Exam coupons applicable on Coupang!'
        },
        rating: 4.8
    },
    { 
        id: 9, 
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
        id: 10, 
        name: '[올리브영] 쿨링 바디워시', 
        price: 12000, 
        img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 
        cat: 'olive', 
        link: 'https://www.oliveyoung.co.kr', 
        tag: { KO: '1+1 특가', EN: 'BOGO' },
        desc: {
            KO: '서핑 후 열오른 피부를 즉각 진정시켜주는 멘톨 쿨링 바디워시.',
            EN: 'Menthol cooling body wash to soothe skin after surfing.'
        },
        rating: 4.6
    },
    { 
        id: 11, 
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
        id: 12, 
        name: 'ISA Official Keychain', 
        price: 8000, 
        img: 'https://images.unsplash.com/photo-1516086256959-5fafaae39d2c?w=600', 
        cat: 'others',
        desc: {
            KO: '국제인공서핑협회 로고가 각인된 한정판 서핑보드 키링.',
            EN: 'Limited edition surfboard keychain engraved with the ISA logo.'
        },
        rating: 4.9
    },
    { 
        id: 13, 
        name: 'Elite Fins v2', 
        price: 95000, 
        img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600', 
        cat: 'boards',
        desc: {
            KO: '플로우보드 하부 드라이브 성능을 극대화하는 카본 핀 세트.',
            EN: 'Carbon fin set maximizing drive performance for flowboards.'
        },
        rating: 4.8
    },
    { 
        id: 14, 
        name: '[쿠팡] 디지털 웨이브 슈즈', 
        price: 29000, 
        img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 
        cat: 'coupang', 
        link: 'https://www.coupang.com', 
        tag: { KO: '로켓와우', EN: 'Wow' },
        desc: {
            KO: '미끄럼 방지 설계로 서핑장 안팎에서 만능인 웨어러블 아쿠아 슈즈.',
            EN: 'Anti-slip wearable aqua shoes for both inside and outside the surf area.'
        },
        rating: 4.7
    },
    { 
        id: 15, 
        name: 'ISA Hoodie Limited', 
        price: 89000, 
        img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 
        cat: 'others',
        desc: {
            KO: '포근하고 두툼한 기모 안감의 협회 공식 한정판 후드티.',
            EN: 'Official limited edition hoodie with warm fleece lining.'
        },
        rating: 4.9
    },
    { 
        id: 16, 
        name: 'Surfer Multi-Vitamin', 
        price: 34000, 
        img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600', 
        cat: 'others',
        desc: {
            KO: '고강도 운동 후 빠른 회복을 돕는 필수 비타민 세트.',
            EN: 'Essential vitamin set for fast recovery after high-intensity exercise.'
        },
        rating: 4.6
    }
];
