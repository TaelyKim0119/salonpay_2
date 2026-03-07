/**
 * =====================================================
 * 살롱페이 v2.0 - 데이터베이스 사용 예시
 * 백엔드 개발자: 루카스
 * =====================================================
 */

// ===== 사용 예시 =====

// 1. 데이터베이스 인스턴스 생성
const db = new SalonPayDB();

// 2. 샘플 데이터 로드 (최초 1회)
// loadSampleData();


// ===== 고객 관리 예시 =====

// 신규 고객 등록
function exampleAddCustomer() {
    try {
        const newCustomer = db.addCustomer({
            name: '홍길동',
            phone: '010-9999-8888',
            birthday: '12-25',
            memo: '신규 고객. 웨이브 펌 관심 있음.'
        });
        console.log('고객 등록 완료:', newCustomer);
    } catch (error) {
        console.error('고객 등록 실패:', error.message);
    }
}

// 고객 검색
function exampleSearchCustomer() {
    // 전화번호로 검색
    const customer = db.getCustomerByPhone('010-1234-5678');
    console.log('검색 결과:', customer);

    // 전체 고객 목록
    const allCustomers = db.getAllCustomers();
    console.log('전체 고객 수:', allCustomers.length);
}

// 고객 정보 수정
function exampleUpdateCustomer() {
    const customer = db.getCustomerByPhone('010-1234-5678');
    if (customer) {
        db.updateCustomer(customer.id, {
            memo: '펌 알레르기 있음. 두피 민감. (업데이트됨)'
        });
        console.log('고객 정보 수정 완료');
    }
}


// ===== 결제 처리 예시 =====

/**
 * 결제 처리 플로우
 * @param {string} customerId - 고객 ID
 * @param {string} service - 서비스 내용
 * @param {number} amount - 원래 금액
 * @param {string} paymentMethod - 결제 수단 (cash/card)
 * @param {number} pointsToUse - 사용할 적립금
 * @param {string} couponId - 사용할 쿠폰 ID (선택)
 */
function processPayment(customerId, service, amount, paymentMethod, pointsToUse = 0, couponId = null) {
    const settings = db.getSettings();
    const customer = db.getCustomerById(customerId);

    if (!customer) {
        throw new Error('고객 정보를 찾을 수 없습니다.');
    }

    // 1. 할인 계산
    let discount = 0;

    // 현금 결제 시 할인
    if (paymentMethod === 'cash') {
        discount = Math.floor(amount * (settings.cashDiscountRate / 100));
    }

    // 쿠폰 적용
    if (couponId) {
        const coupons = db.getActiveCouponsByCustomerId(customerId);
        const coupon = coupons.find(c => c.id === couponId);

        if (coupon) {
            if (coupon.isPercent) {
                discount += Math.floor(amount * (coupon.amount / 100));
            } else {
                discount += coupon.amount;
            }
            db.useCoupon(couponId);
        }
    }

    // 2. 적립금 사용 검증
    if (pointsToUse > customer.points) {
        throw new Error('적립금이 부족합니다.');
    }

    // 3. 최종 금액 계산
    const finalAmount = Math.max(0, amount - discount - pointsToUse);

    // 4. 방문 기록 저장
    const visit = db.addVisit({
        customerId,
        service,
        amount,
        discount,
        pointsUsed: pointsToUse,
        paymentMethod,
        finalAmount
    });

    // 5. 결과 반환
    const updatedCustomer = db.getCustomerById(customerId);

    return {
        visit,
        customer: updatedCustomer,
        summary: {
            originalAmount: amount,
            discount,
            pointsUsed: pointsToUse,
            finalAmount,
            pointsEarned: visit.pointsEarned,
            newPointsBalance: updatedCustomer.points
        }
    };
}

// 결제 예시
function examplePayment() {
    const customer = db.getCustomerByPhone('010-1234-5678');
    if (customer) {
        const result = processPayment(
            customer.id,
            '커트 + 염색',
            120000,
            'cash',
            5000,  // 5000원 적립금 사용
            null   // 쿠폰 미사용
        );

        console.log('=== 결제 완료 ===');
        console.log('원래 금액:', result.summary.originalAmount.toLocaleString() + '원');
        console.log('할인 금액:', result.summary.discount.toLocaleString() + '원');
        console.log('적립금 사용:', result.summary.pointsUsed.toLocaleString() + '원');
        console.log('최종 결제:', result.summary.finalAmount.toLocaleString() + '원');
        console.log('적립 포인트:', result.summary.pointsEarned.toLocaleString() + '원');
        console.log('적립금 잔액:', result.summary.newPointsBalance.toLocaleString() + '원');
    }
}


// ===== 쿠폰 관리 예시 =====

// 쿠폰 발급
function exampleIssueCoupon() {
    const customer = db.getCustomerByPhone('010-1234-5678');
    if (customer) {
        // 30일 후 만료
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const coupon = db.addCoupon({
            customerId: customer.id,
            type: 'event',
            amount: 20,       // 20% 할인
            isPercent: true,
            expiryDate: expiryDate.toISOString().split('T')[0]
        });

        console.log('쿠폰 발급 완료:', coupon);
    }
}

// 사용 가능한 쿠폰 조회
function exampleGetCoupons() {
    const customer = db.getCustomerByPhone('010-1234-5678');
    if (customer) {
        const coupons = db.getActiveCouponsByCustomerId(customer.id);
        console.log('사용 가능한 쿠폰:', coupons);
    }
}

// 생일 쿠폰 자동 발급
function exampleBirthdayCoupons() {
    const issued = db.issueBirthdayCoupons();
    console.log('발급된 생일 쿠폰:', issued);
}


// ===== 통계 조회 예시 =====

function exampleGetStats() {
    const stats = db.getDashboardStats();

    console.log('=== 대시보드 통계 ===');
    console.log('총 고객 수:', stats.totalCustomers);
    console.log('이번 달 방문:', stats.monthlyVisits);
    console.log('이번 달 매출:', stats.totalRevenue.toLocaleString() + '원');
    console.log('현금 결제 비율:', stats.cashRatio + '%');
    console.log('절감된 수수료:', stats.savedFees.toLocaleString() + '원');
}


// ===== 고객 상세 정보 조회 =====

function getCustomerDetail(customerId) {
    const customer = db.getCustomerById(customerId);
    if (!customer) return null;

    const visits = db.getVisitsByCustomerId(customerId);
    const coupons = db.getActiveCouponsByCustomerId(customerId);

    // 총 결제 금액 계산
    const totalSpent = visits.reduce((sum, v) => sum + v.finalAmount, 0);

    return {
        ...customer,
        visits,
        coupons,
        totalSpent,
        averageSpent: visits.length > 0 ? Math.floor(totalSpent / visits.length) : 0
    };
}

function exampleCustomerDetail() {
    const customer = db.getCustomerByPhone('010-4567-8901');
    if (customer) {
        const detail = getCustomerDetail(customer.id);

        console.log('=== 고객 상세 정보 ===');
        console.log('이름:', detail.name);
        console.log('방문 횟수:', detail.visitCount);
        console.log('적립금 잔액:', detail.points.toLocaleString() + '원');
        console.log('총 결제 금액:', detail.totalSpent.toLocaleString() + '원');
        console.log('평균 결제 금액:', detail.averageSpent.toLocaleString() + '원');
        console.log('사용 가능한 쿠폰:', detail.coupons.length + '개');
        console.log('최근 방문 기록:', detail.visits.slice(0, 3));
    }
}


// ===== 데이터 백업/복원 =====

function exampleBackup() {
    const data = db.exportData();
    const jsonString = JSON.stringify(data, null, 2);

    // 파일로 다운로드 (브라우저 환경)
    // const blob = new Blob([jsonString], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'salonpay_backup_' + new Date().toISOString().split('T')[0] + '.json';
    // a.click();

    console.log('백업 데이터:', data);
    return data;
}

function exampleRestore(backupData) {
    db.importData(backupData);
    console.log('데이터 복원 완료');
}


// ===== 콘솔에서 테스트 =====

console.log('=== 살롱페이 v2.0 데이터베이스 로드됨 ===');
console.log('샘플 데이터를 로드하려면: loadSampleData()');
console.log('테스트 함수들:');
console.log('  - exampleAddCustomer()');
console.log('  - exampleSearchCustomer()');
console.log('  - examplePayment()');
console.log('  - exampleGetStats()');
console.log('  - exampleCustomerDetail()');
