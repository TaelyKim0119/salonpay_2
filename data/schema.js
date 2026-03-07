/**
 * =====================================================
 * 살롱페이 v2.0 - 데이터 스키마 정의서
 * 백엔드 개발자: 루카스
 * =====================================================
 *
 * 이 파일은 데이터 구조의 명세서입니다.
 * 실제 구현은 database.js를 참고하세요.
 */

// ===== 1. 고객 (Customer) 스키마 =====

const CustomerSchema = {
    id: 'string',           // 고유 식별자 (예: "cust-0001")
    name: 'string',         // 고객 이름 (예: "김민지")
    phone: 'string',        // 전화번호 (예: "010-1234-5678")
    birthday: 'string',     // 생일 MM-DD 형식 (예: "03-15")
    points: 'number',       // 적립금 잔고 (예: 15000)
    visitCount: 'number',   // 방문 횟수 (예: 12)
    memo: 'string',         // 고객 메모 (예: "펌 알레르기 있음")
    createdAt: 'string',    // 등록일 ISO 형식
    updatedAt: 'string'     // 수정일 ISO 형식
};

// 예시 데이터
const CustomerExample = {
    id: 'cust-0001',
    name: '김민지',
    phone: '010-1234-5678',
    birthday: '03-15',
    points: 15000,
    visitCount: 12,
    memo: '펌 알레르기 있음. 두피 민감.',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-03-01T14:20:00.000Z'
};


// ===== 2. 방문 기록 (Visit) 스키마 =====

const VisitSchema = {
    id: 'string',            // 고유 식별자 (예: "visit-0001")
    customerId: 'string',    // 고객 ID (Foreign Key)
    date: 'string',          // 방문 날짜 YYYY-MM-DD (예: "2024-03-01")
    service: 'string',       // 서비스 내용 (예: "커트 + 염색")
    amount: 'number',        // 원래 금액 (예: 120000)
    discount: 'number',      // 할인 금액 (예: 12000)
    pointsUsed: 'number',    // 사용한 적립금 (예: 5000)
    pointsEarned: 'number',  // 적립된 포인트 (예: 5150)
    paymentMethod: 'string', // 결제 수단 "cash" | "card"
    finalAmount: 'number',   // 최종 결제 금액 (예: 103000)
    createdAt: 'string'      // 기록 생성일 ISO 형식
};

// 예시 데이터
const VisitExample = {
    id: 'visit-0001',
    customerId: 'cust-0001',
    date: '2024-03-01',
    service: '커트 + 염색',
    amount: 120000,
    discount: 12000,
    pointsUsed: 5000,
    pointsEarned: 5150,
    paymentMethod: 'cash',
    finalAmount: 103000,
    createdAt: '2024-03-01T14:20:00.000Z'
};


// ===== 3. 쿠폰 (Coupon) 스키마 =====

const CouponSchema = {
    id: 'string',           // 고유 식별자 (예: "coup-0001")
    customerId: 'string',   // 고객 ID (Foreign Key)
    type: 'string',         // 쿠폰 종류: "birthday" | "welcome" | "event" | "referral"
    amount: 'number',       // 할인 금액 또는 할인율 (예: 10000 또는 15)
    isPercent: 'boolean',   // 퍼센트 할인 여부 (true: %, false: 원)
    expiryDate: 'string',   // 만료일 YYYY-MM-DD (예: "2024-04-15")
    isUsed: 'boolean',      // 사용 여부
    usedAt: 'string|null',  // 사용일 ISO 형식 (미사용시 null)
    createdAt: 'string'     // 발급일 ISO 형식
};

// 쿠폰 종류
const CouponTypes = {
    birthday: '생일 쿠폰',      // 생일에 자동 발급
    welcome: '웰컴 쿠폰',       // 신규 가입시 발급
    event: '이벤트 쿠폰',       // 특별 이벤트용
    referral: '추천인 쿠폰'     // 친구 추천 보상
};

// 예시 데이터 (정액 할인)
const CouponExampleFixed = {
    id: 'coup-0001',
    customerId: 'cust-0001',
    type: 'birthday',
    amount: 10000,           // 10,000원 할인
    isPercent: false,
    expiryDate: '2024-04-15',
    isUsed: false,
    usedAt: null,
    createdAt: '2024-03-15T00:00:00.000Z'
};

// 예시 데이터 (퍼센트 할인)
const CouponExamplePercent = {
    id: 'coup-0003',
    customerId: 'cust-0004',
    type: 'event',
    amount: 15,              // 15% 할인
    isPercent: true,
    expiryDate: '2024-03-31',
    isUsed: false,
    usedAt: null,
    createdAt: '2024-03-01T09:00:00.000Z'
};


// ===== 4. 설정 (Settings) 스키마 =====

const SettingsSchema = {
    cashDiscountRate: 'number',      // 현금 할인율 % (예: 10)
    pointEarnRate: 'number',         // 적립률 % (예: 5)
    birthdayCouponAmount: 'number'   // 생일 쿠폰 금액 (예: 10000)
};

// 기본 설정
const SettingsDefault = {
    cashDiscountRate: 10,       // 현금 결제시 10% 할인
    pointEarnRate: 5,           // 결제 금액의 5% 적립
    birthdayCouponAmount: 10000 // 생일 쿠폰 10,000원
};


// ===== 5. localStorage 키 구조 =====

const StorageKeys = {
    CUSTOMERS: 'salonpay_customers',  // 고객 배열
    VISITS: 'salonpay_visits',        // 방문 기록 배열
    COUPONS: 'salonpay_coupons',      // 쿠폰 배열
    SETTINGS: 'salonpay_settings'     // 설정 객체
};


// ===== 6. 전체 데이터 구조 예시 =====

const FullDatabaseExample = {
    // localStorage에 저장되는 형태
    'salonpay_customers': [
        {
            id: 'cust-0001',
            name: '김민지',
            phone: '010-1234-5678',
            birthday: '03-15',
            points: 15000,
            visitCount: 12,
            memo: '펌 알레르기 있음',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-03-01T14:20:00.000Z'
        },
        // ... 더 많은 고객
    ],

    'salonpay_visits': [
        {
            id: 'visit-0001',
            customerId: 'cust-0001',
            date: '2024-03-01',
            service: '커트 + 염색',
            amount: 120000,
            discount: 12000,
            pointsUsed: 5000,
            pointsEarned: 5150,
            paymentMethod: 'cash',
            finalAmount: 103000,
            createdAt: '2024-03-01T14:20:00.000Z'
        },
        // ... 더 많은 방문 기록
    ],

    'salonpay_coupons': [
        {
            id: 'coup-0001',
            customerId: 'cust-0001',
            type: 'birthday',
            amount: 10000,
            isPercent: false,
            expiryDate: '2024-04-15',
            isUsed: false,
            usedAt: null,
            createdAt: '2024-03-15T00:00:00.000Z'
        },
        // ... 더 많은 쿠폰
    ],

    'salonpay_settings': {
        cashDiscountRate: 10,
        pointEarnRate: 5,
        birthdayCouponAmount: 10000
    }
};


// ===== 7. 관계도 (ERD) =====

/**
 * +----------------+       +----------------+       +----------------+
 * |   Customer     |       |     Visit      |       |    Coupon      |
 * +----------------+       +----------------+       +----------------+
 * | id (PK)        |<----->| customerId(FK) |       | id (PK)        |
 * | name           |       | id (PK)        |       | customerId(FK) |<--+
 * | phone (UNIQUE) |       | date           |       | type           |   |
 * | birthday       |       | service        |       | amount         |   |
 * | points         |       | amount         |       | isPercent      |   |
 * | visitCount     |       | discount       |       | expiryDate     |   |
 * | memo           |       | pointsUsed     |       | isUsed         |   |
 * | createdAt      |       | pointsEarned   |       | usedAt         |   |
 * | updatedAt      |       | paymentMethod  |       | createdAt      |   |
 * +----------------+       | finalAmount    |       +----------------+   |
 *        ^                 | createdAt      |              ^             |
 *        |                 +----------------+              |             |
 *        |                        |                        |             |
 *        +------------------------+------------------------+-------------+
 *                          One-to-Many 관계
 *        (한 고객은 여러 방문 기록과 여러 쿠폰을 가질 수 있음)
 */

console.log('살롱페이 v2.0 스키마 정의서 로드됨');
