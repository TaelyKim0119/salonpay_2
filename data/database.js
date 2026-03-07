/**
 * =====================================================
 * 살롱페이 v2.0 - 데이터베이스 구조 설계
 * 백엔드 개발자: 루카스
 * =====================================================
 */

// ===== 1. 데이터 스키마 정의 =====

/**
 * 고객 정보 스키마
 * @typedef {Object} Customer
 * @property {string} id - 고유 식별자 (UUID)
 * @property {string} name - 고객 이름
 * @property {string} phone - 전화번호 (010-XXXX-XXXX 형식)
 * @property {string} birthday - 생일 (MM-DD 형식)
 * @property {number} points - 적립금 잔고
 * @property {number} visitCount - 방문 횟수
 * @property {string} createdAt - 등록일
 * @property {string} updatedAt - 수정일
 * @property {string} memo - 고객 메모 (선호 스타일 등)
 */

/**
 * 방문 기록 스키마
 * @typedef {Object} Visit
 * @property {string} id - 고유 식별자
 * @property {string} customerId - 고객 ID (Foreign Key)
 * @property {string} date - 방문 날짜 (YYYY-MM-DD)
 * @property {string} service - 서비스 내용
 * @property {number} amount - 서비스 금액
 * @property {number} discount - 할인 금액
 * @property {number} pointsUsed - 사용한 적립금
 * @property {number} pointsEarned - 적립된 포인트
 * @property {string} paymentMethod - 결제 수단 (cash/card)
 * @property {number} finalAmount - 최종 결제 금액
 * @property {string} createdAt - 기록 생성일
 */

/**
 * 쿠폰 스키마
 * @typedef {Object} Coupon
 * @property {string} id - 고유 식별자
 * @property {string} customerId - 고객 ID (Foreign Key)
 * @property {string} type - 쿠폰 종류 (birthday/welcome/event/referral)
 * @property {number} amount - 할인 금액 (정액) 또는 할인율 (퍼센트)
 * @property {boolean} isPercent - 퍼센트 할인 여부
 * @property {string} expiryDate - 만료일 (YYYY-MM-DD)
 * @property {boolean} isUsed - 사용 여부
 * @property {string} usedAt - 사용일 (nullable)
 * @property {string} createdAt - 발급일
 */


// ===== 2. 유틸리티 함수 =====

/**
 * UUID 생성 함수
 */
function generateId() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

/**
 * 현재 날짜 반환 (YYYY-MM-DD)
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * 현재 시간 반환 (ISO 형식)
 */
function getCurrentDateTime() {
    return new Date().toISOString();
}


// ===== 3. LocalStorage 데이터베이스 클래스 =====

class SalonPayDB {
    constructor() {
        this.KEYS = {
            CUSTOMERS: 'salonpay_customers',
            VISITS: 'salonpay_visits',
            COUPONS: 'salonpay_coupons',
            SETTINGS: 'salonpay_settings'
        };

        // 초기화
        this.initializeDB();
    }

    /**
     * 데이터베이스 초기화
     */
    initializeDB() {
        // 각 테이블이 없으면 빈 배열로 초기화
        Object.values(this.KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // 설정 초기화
        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            const defaultSettings = {
                cashDiscountRate: 10,      // 현금 할인율 (%)
                pointEarnRate: 5,          // 적립률 (%)
                birthdayCouponAmount: 10000, // 생일 쿠폰 금액
                cashTiers: [300000, 500000, 1000000] // 현금 결제 구간 (30만, 50만, 100만)
            };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
    }

    // ----- 고객 관련 메서드 -----

    /**
     * 모든 고객 조회
     */
    getAllCustomers() {
        const data = localStorage.getItem(this.KEYS.CUSTOMERS);
        return JSON.parse(data) || [];
    }

    /**
     * 고객 ID로 조회
     */
    getCustomerById(id) {
        const customers = this.getAllCustomers();
        return customers.find(c => c.id === id) || null;
    }

    /**
     * 전화번호로 고객 조회
     */
    getCustomerByPhone(phone) {
        const customers = this.getAllCustomers();
        return customers.find(c => c.phone === phone) || null;
    }

    /**
     * 고객 등록
     */
    addCustomer(customerData) {
        const customers = this.getAllCustomers();

        // 중복 전화번호 체크
        if (this.getCustomerByPhone(customerData.phone)) {
            throw new Error('이미 등록된 전화번호입니다.');
        }

        const newCustomer = {
            id: generateId(),
            name: customerData.name,
            phone: customerData.phone,
            birthday: customerData.birthday || '',
            points: 0,
            visitCount: 0,
            memo: customerData.memo || '',
            createdAt: getCurrentDateTime(),
            updatedAt: getCurrentDateTime()
        };

        customers.push(newCustomer);
        localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));

        return newCustomer;
    }

    /**
     * 고객 정보 수정
     */
    updateCustomer(id, updateData) {
        const customers = this.getAllCustomers();
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            throw new Error('고객을 찾을 수 없습니다.');
        }

        customers[index] = {
            ...customers[index],
            ...updateData,
            updatedAt: getCurrentDateTime()
        };

        localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
        return customers[index];
    }

    /**
     * 고객 삭제
     */
    deleteCustomer(id) {
        const customers = this.getAllCustomers();
        const filtered = customers.filter(c => c.id !== id);
        localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(filtered));

        // 관련 방문 기록 및 쿠폰도 삭제
        this.deleteVisitsByCustomerId(id);
        this.deleteCouponsByCustomerId(id);
    }

    /**
     * 고객 적립금 업데이트
     */
    updateCustomerPoints(id, pointsDelta) {
        const customer = this.getCustomerById(id);
        if (!customer) {
            throw new Error('고객을 찾을 수 없습니다.');
        }

        const newPoints = Math.max(0, customer.points + pointsDelta);
        return this.updateCustomer(id, { points: newPoints });
    }

    /**
     * 고객 방문 횟수 증가
     */
    incrementVisitCount(id) {
        const customer = this.getCustomerById(id);
        if (!customer) {
            throw new Error('고객을 찾을 수 없습니다.');
        }

        return this.updateCustomer(id, { visitCount: customer.visitCount + 1 });
    }

    // ----- 방문 기록 관련 메서드 -----

    /**
     * 모든 방문 기록 조회
     */
    getAllVisits() {
        const data = localStorage.getItem(this.KEYS.VISITS);
        return JSON.parse(data) || [];
    }

    /**
     * 고객별 방문 기록 조회
     */
    getVisitsByCustomerId(customerId) {
        const visits = this.getAllVisits();
        return visits.filter(v => v.customerId === customerId)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * 방문 기록 추가
     */
    addVisit(visitData) {
        const visits = this.getAllVisits();
        const settings = this.getSettings();

        // 적립금 계산
        const pointsEarned = Math.floor(visitData.finalAmount * (settings.pointEarnRate / 100));

        const newVisit = {
            id: generateId(),
            customerId: visitData.customerId,
            date: visitData.date || getCurrentDate(),
            service: visitData.service,
            amount: visitData.amount,
            discount: visitData.discount || 0,
            pointsUsed: visitData.pointsUsed || 0,
            pointsEarned: pointsEarned,
            paymentMethod: visitData.paymentMethod,
            finalAmount: visitData.finalAmount,
            createdAt: getCurrentDateTime()
        };

        visits.push(newVisit);
        localStorage.setItem(this.KEYS.VISITS, JSON.stringify(visits));

        // 고객 정보 업데이트 (적립금, 방문 횟수)
        const pointsDelta = pointsEarned - (visitData.pointsUsed || 0);
        this.updateCustomerPoints(visitData.customerId, pointsDelta);
        this.incrementVisitCount(visitData.customerId);

        return newVisit;
    }

    /**
     * 고객별 방문 기록 삭제
     */
    deleteVisitsByCustomerId(customerId) {
        const visits = this.getAllVisits();
        const filtered = visits.filter(v => v.customerId !== customerId);
        localStorage.setItem(this.KEYS.VISITS, JSON.stringify(filtered));
    }

    /**
     * 날짜 범위로 방문 기록 조회
     */
    getVisitsByDateRange(startDate, endDate) {
        const visits = this.getAllVisits();
        return visits.filter(v => {
            const visitDate = new Date(v.date);
            return visitDate >= new Date(startDate) && visitDate <= new Date(endDate);
        });
    }

    // ----- 쿠폰 관련 메서드 -----

    /**
     * 모든 쿠폰 조회
     */
    getAllCoupons() {
        const data = localStorage.getItem(this.KEYS.COUPONS);
        return JSON.parse(data) || [];
    }

    /**
     * 고객별 쿠폰 조회
     */
    getCouponsByCustomerId(customerId) {
        const coupons = this.getAllCoupons();
        return coupons.filter(c => c.customerId === customerId);
    }

    /**
     * 고객별 사용 가능한 쿠폰 조회
     */
    getActiveCouponsByCustomerId(customerId) {
        const coupons = this.getCouponsByCustomerId(customerId);
        const today = getCurrentDate();

        return coupons.filter(c => !c.isUsed && c.expiryDate >= today);
    }

    /**
     * 쿠폰 발급
     */
    addCoupon(couponData) {
        const coupons = this.getAllCoupons();

        const newCoupon = {
            id: generateId(),
            customerId: couponData.customerId,
            type: couponData.type,
            amount: couponData.amount,
            isPercent: couponData.isPercent || false,
            expiryDate: couponData.expiryDate,
            isUsed: false,
            usedAt: null,
            createdAt: getCurrentDateTime()
        };

        coupons.push(newCoupon);
        localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(coupons));

        return newCoupon;
    }

    /**
     * 쿠폰 사용 처리
     */
    useCoupon(couponId) {
        const coupons = this.getAllCoupons();
        const index = coupons.findIndex(c => c.id === couponId);

        if (index === -1) {
            throw new Error('쿠폰을 찾을 수 없습니다.');
        }

        if (coupons[index].isUsed) {
            throw new Error('이미 사용된 쿠폰입니다.');
        }

        if (coupons[index].expiryDate < getCurrentDate()) {
            throw new Error('만료된 쿠폰입니다.');
        }

        coupons[index].isUsed = true;
        coupons[index].usedAt = getCurrentDateTime();

        localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(coupons));
        return coupons[index];
    }

    /**
     * 고객별 쿠폰 삭제
     */
    deleteCouponsByCustomerId(customerId) {
        const coupons = this.getAllCoupons();
        const filtered = coupons.filter(c => c.customerId !== customerId);
        localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(filtered));
    }

    /**
     * 생일 쿠폰 자동 발급 (오늘 생일인 고객)
     */
    issueBirthdayCoupons() {
        const customers = this.getAllCustomers();
        const settings = this.getSettings();
        const today = getCurrentDate().slice(5); // MM-DD 형식

        const issuedCoupons = [];

        customers.forEach(customer => {
            if (customer.birthday === today) {
                // 이번 달에 이미 생일 쿠폰을 발급받았는지 확인
                const existingCoupons = this.getCouponsByCustomerId(customer.id);
                const thisYear = new Date().getFullYear();
                const alreadyIssued = existingCoupons.some(c =>
                    c.type === 'birthday' &&
                    c.createdAt.startsWith(String(thisYear))
                );

                if (!alreadyIssued) {
                    // 30일 후 만료
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    const coupon = this.addCoupon({
                        customerId: customer.id,
                        type: 'birthday',
                        amount: settings.birthdayCouponAmount,
                        isPercent: false,
                        expiryDate: expiryDate.toISOString().split('T')[0]
                    });

                    issuedCoupons.push({ customer, coupon });
                }
            }
        });

        return issuedCoupons;
    }

    // ----- 설정 관련 메서드 -----

    /**
     * 설정 조회
     */
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return JSON.parse(data) || {};
    }

    /**
     * 설정 업데이트
     */
    updateSettings(newSettings) {
        const settings = this.getSettings();
        const updated = { ...settings, ...newSettings };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }

    // ----- 통계 관련 메서드 -----

    /**
     * 대시보드 통계 계산
     */
    getDashboardStats() {
        const visits = this.getAllVisits();
        const customers = this.getAllCustomers();
        const today = getCurrentDate();
        const thisMonth = today.slice(0, 7); // YYYY-MM

        // 이번 달 방문 기록
        const monthlyVisits = visits.filter(v => v.date.startsWith(thisMonth));

        // 총 매출
        const totalRevenue = monthlyVisits.reduce((sum, v) => sum + v.finalAmount, 0);

        // 현금 결제 비율
        const cashPayments = monthlyVisits.filter(v => v.paymentMethod === 'cash');
        const cashRatio = monthlyVisits.length > 0
            ? Math.round((cashPayments.length / monthlyVisits.length) * 100)
            : 0;

        // 절감된 수수료 (카드 수수료 2.5% 기준)
        const savedFees = cashPayments.reduce((sum, v) => sum + Math.floor(v.finalAmount * 0.025), 0);

        return {
            totalCustomers: customers.length,
            monthlyVisits: monthlyVisits.length,
            totalRevenue,
            cashRatio,
            savedFees
        };
    }

    // ----- 데이터 관리 메서드 -----

    /**
     * 전체 데이터 내보내기
     */
    exportData() {
        return {
            customers: this.getAllCustomers(),
            visits: this.getAllVisits(),
            coupons: this.getAllCoupons(),
            settings: this.getSettings(),
            exportedAt: getCurrentDateTime()
        };
    }

    /**
     * 데이터 가져오기
     */
    importData(data) {
        if (data.customers) {
            localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(data.customers));
        }
        if (data.visits) {
            localStorage.setItem(this.KEYS.VISITS, JSON.stringify(data.visits));
        }
        if (data.coupons) {
            localStorage.setItem(this.KEYS.COUPONS, JSON.stringify(data.coupons));
        }
        if (data.settings) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
        }
    }

    /**
     * 전체 데이터 초기화
     */
    clearAllData() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeDB();
    }
}


// ===== 4. 샘플 데이터 =====

const SAMPLE_DATA = {
    customers: [
        {
            id: 'cust-0001',
            name: '김민지',
            phone: '010-1234-5678',
            birthday: '03-15',
            points: 15000,
            visitCount: 12,
            memo: '펌 알레르기 있음. 두피 민감.',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-03-01T14:20:00.000Z'
        },
        {
            id: 'cust-0002',
            name: '이서연',
            phone: '010-2345-6789',
            birthday: '07-22',
            points: 8500,
            visitCount: 7,
            memo: '염색 선호. 밝은 브라운 계열.',
            createdAt: '2024-02-20T11:00:00.000Z',
            updatedAt: '2024-02-28T16:45:00.000Z'
        },
        {
            id: 'cust-0003',
            name: '박준혁',
            phone: '010-3456-7890',
            birthday: '11-08',
            points: 3200,
            visitCount: 4,
            memo: '짧은 투블럭 선호',
            createdAt: '2024-03-01T09:15:00.000Z',
            updatedAt: '2024-03-05T13:30:00.000Z'
        },
        {
            id: 'cust-0004',
            name: '최수아',
            phone: '010-4567-8901',
            birthday: '05-30',
            points: 22000,
            visitCount: 18,
            memo: 'VIP 고객. 매달 정기 방문. 레이어드 컷 선호.',
            createdAt: '2023-06-10T14:00:00.000Z',
            updatedAt: '2024-03-06T11:00:00.000Z'
        }
    ],

    visits: [
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
        {
            id: 'visit-0002',
            customerId: 'cust-0002',
            date: '2024-02-28',
            service: '염색 (전체)',
            amount: 80000,
            discount: 8000,
            pointsUsed: 0,
            pointsEarned: 3600,
            paymentMethod: 'cash',
            finalAmount: 72000,
            createdAt: '2024-02-28T16:45:00.000Z'
        },
        {
            id: 'visit-0003',
            customerId: 'cust-0003',
            date: '2024-03-05',
            service: '남성 커트',
            amount: 25000,
            discount: 0,
            pointsUsed: 0,
            pointsEarned: 1250,
            paymentMethod: 'card',
            finalAmount: 25000,
            createdAt: '2024-03-05T13:30:00.000Z'
        },
        {
            id: 'visit-0004',
            customerId: 'cust-0004',
            date: '2024-03-06',
            service: '커트 + 클리닉',
            amount: 95000,
            discount: 9500,
            pointsUsed: 10000,
            pointsEarned: 3775,
            paymentMethod: 'cash',
            finalAmount: 75500,
            createdAt: '2024-03-06T11:00:00.000Z'
        },
        {
            id: 'visit-0005',
            customerId: 'cust-0001',
            date: '2024-02-15',
            service: '커트',
            amount: 40000,
            discount: 4000,
            pointsUsed: 0,
            pointsEarned: 1800,
            paymentMethod: 'cash',
            finalAmount: 36000,
            createdAt: '2024-02-15T11:30:00.000Z'
        },
        {
            id: 'visit-0006',
            customerId: 'cust-0004',
            date: '2024-02-06',
            service: '커트 + 펌',
            amount: 150000,
            discount: 15000,
            pointsUsed: 0,
            pointsEarned: 6750,
            paymentMethod: 'cash',
            finalAmount: 135000,
            createdAt: '2024-02-06T10:00:00.000Z'
        }
    ],

    coupons: [
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
        {
            id: 'coup-0002',
            customerId: 'cust-0002',
            type: 'welcome',
            amount: 5000,
            isPercent: false,
            expiryDate: '2024-03-20',
            isUsed: true,
            usedAt: '2024-02-28T16:45:00.000Z',
            createdAt: '2024-02-20T11:00:00.000Z'
        },
        {
            id: 'coup-0003',
            customerId: 'cust-0004',
            type: 'event',
            amount: 15,
            isPercent: true,
            expiryDate: '2024-03-31',
            isUsed: false,
            usedAt: null,
            createdAt: '2024-03-01T09:00:00.000Z'
        },
        {
            id: 'coup-0004',
            customerId: 'cust-0003',
            type: 'referral',
            amount: 10000,
            isPercent: false,
            expiryDate: '2024-04-01',
            isUsed: false,
            usedAt: null,
            createdAt: '2024-03-01T09:15:00.000Z'
        }
    ],

    settings: {
        cashDiscountRate: 10,
        pointEarnRate: 5,
        birthdayCouponAmount: 10000,
        cashTiers: [300000, 500000, 1000000]
    }
};


// ===== 5. 샘플 데이터 로드 함수 =====

/**
 * 샘플 데이터를 localStorage에 로드
 */
function loadSampleData() {
    const db = new SalonPayDB();
    db.importData(SAMPLE_DATA);
    console.log('샘플 데이터가 로드되었습니다.');
    return db;
}


// ===== 6. 쿠폰 종류 상수 =====

const COUPON_TYPES = {
    BIRTHDAY: 'birthday',    // 생일 쿠폰
    WELCOME: 'welcome',      // 신규 가입 쿠폰
    EVENT: 'event',          // 이벤트 쿠폰
    REFERRAL: 'referral'     // 추천인 쿠폰
};

const COUPON_TYPE_LABELS = {
    birthday: '생일 쿠폰',
    welcome: '웰컴 쿠폰',
    event: '이벤트 쿠폰',
    referral: '추천인 쿠폰'
};


// ===== 7. 서비스 목록 상수 =====

const SERVICE_LIST = [
    { id: 'cut', name: '커트', price: 40000 },
    { id: 'cut_male', name: '남성 커트', price: 25000 },
    { id: 'perm', name: '펌', price: 100000 },
    { id: 'color', name: '염색', price: 80000 },
    { id: 'color_partial', name: '부분 염색', price: 50000 },
    { id: 'clinic', name: '클리닉', price: 50000 },
    { id: 'cut_perm', name: '커트 + 펌', price: 130000 },
    { id: 'cut_color', name: '커트 + 염색', price: 110000 },
    { id: 'cut_clinic', name: '커트 + 클리닉', price: 80000 },
    { id: 'full', name: '풀 케어 (커트+염색+클리닉)', price: 150000 }
];


// ===== 8. 내보내기 =====

// ES6 모듈 환경
// export { SalonPayDB, SAMPLE_DATA, loadSampleData, COUPON_TYPES, COUPON_TYPE_LABELS, SERVICE_LIST };

// 브라우저 전역 환경
if (typeof window !== 'undefined') {
    window.SalonPayDB = SalonPayDB;
    window.SAMPLE_DATA = SAMPLE_DATA;
    window.loadSampleData = loadSampleData;
    window.COUPON_TYPES = COUPON_TYPES;
    window.COUPON_TYPE_LABELS = COUPON_TYPE_LABELS;
    window.SERVICE_LIST = SERVICE_LIST;
}
