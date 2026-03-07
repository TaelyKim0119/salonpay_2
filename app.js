/**
 * =====================================================
 * 살롱페이 v2.0 - App JavaScript
 * 프론트엔드 개발자: 제이든
 * =====================================================
 */

// ===== 앱 초기화 =====
let db;
let currentCustomer = null;
let currentTab = 'customers';

document.addEventListener('DOMContentLoaded', () => {
    // 데이터베이스 초기화
    db = new SalonPayDB();

    // 샘플 데이터 로드 (처음 실행 시)
    if (db.getAllCustomers().length === 0) {
        loadSampleData();
        db = new SalonPayDB();
    }

    // 이벤트 리스너 설정
    initEventListeners();

    // 메인 화면 표시
    showScreen('main');
});

// ===== 이벤트 리스너 초기화 =====
function initEventListeners() {
    // 메인 버튼
    document.getElementById('btn-customer').addEventListener('click', () => {
        showScreen('customer-login');
    });

    document.getElementById('btn-admin').addEventListener('click', () => {
        showScreen('admin');
        loadAdminDashboard();
    });

    // 뒤로가기 버튼들
    document.querySelectorAll('.header-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentScreen = document.querySelector('.screen.active');
            if (currentScreen.id === 'customer-dashboard') {
                currentCustomer = null;
                showScreen('main');
            } else if (currentScreen.id === 'customer-detail') {
                showScreen('admin');
            } else {
                showScreen('main');
            }
        });
    });

    // 고객 로그인 폼
    document.getElementById('login-form').addEventListener('submit', handleCustomerLogin);

    // 관리자 검색
    document.getElementById('admin-search').addEventListener('input', (e) => {
        searchCustomers(e.target.value);
    });

    // 탭 버튼
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

// ===== 화면 전환 =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// ===== 고객 로그인 =====
function handleCustomerLogin(e) {
    e.preventDefault();

    const phoneInput = document.getElementById('phone-input');
    let phone = phoneInput.value.replace(/[^0-9]/g, '');

    // 전화번호 형식 변환
    if (phone.length === 11) {
        phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (phone.length === 10) {
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    const customer = db.getCustomerByPhone(phone);

    if (customer) {
        currentCustomer = customer;
        showScreen('customer-dashboard');
        loadCustomerDashboard();
        phoneInput.value = '';
    } else {
        showToast('등록되지 않은 전화번호입니다.');
    }
}

// ===== 고객 대시보드 로드 =====
function loadCustomerDashboard() {
    if (!currentCustomer) return;

    // 최신 정보 가져오기
    currentCustomer = db.getCustomerById(currentCustomer.id);

    // 잔고 카드 업데이트
    document.getElementById('customer-name-display').textContent = `${currentCustomer.name} 님`;
    document.getElementById('customer-phone-display').textContent = currentCustomer.phone;
    document.getElementById('customer-balance').textContent = formatNumber(currentCustomer.points);

    // 적립금 카드
    document.getElementById('customer-points-card').textContent = formatNumber(currentCustomer.points);

    // 쿠폰 카드
    const activeCoupons = db.getActiveCouponsByCustomerId(currentCustomer.id);
    document.getElementById('customer-coupons-count').textContent = activeCoupons.length;

    // 최근 내역
    loadCustomerHistory();
}

// ===== 고객 이용 내역 로드 =====
function loadCustomerHistory() {
    const historyList = document.getElementById('customer-history');
    const visits = db.getVisitsByCustomerId(currentCustomer.id).slice(0, 5);

    if (visits.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>아직 이용 내역이 없습니다.</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = visits.map(visit => `
        <div class="history-item">
            <div class="history-icon earn">✨</div>
            <div class="history-info">
                <div class="history-service">${visit.service}</div>
                <div class="history-date">${formatDate(visit.date)}</div>
            </div>
            <div class="history-amount">
                <div class="history-points earn">+${formatNumber(visit.pointsEarned)}P</div>
                <div class="history-price">${formatNumber(visit.finalAmount)}원</div>
            </div>
        </div>
    `).join('');
}

// ===== 관리자 대시보드 로드 =====
function loadAdminDashboard() {
    const stats = db.getDashboardStats();
    const customers = db.getAllCustomers();

    // 통계 업데이트
    document.getElementById('stat-total-customers').textContent = customers.length;

    // 이번 달 생일
    const today = new Date();
    const thisMonth = String(today.getMonth() + 1).padStart(2, '0');
    const birthdayThisMonth = customers.filter(c => c.birthday && c.birthday.startsWith(thisMonth));
    document.getElementById('stat-birthday-month').textContent = birthdayThisMonth.length;

    // 재방문율 계산 (방문 2회 이상)
    const returningCustomers = customers.filter(c => c.visitCount >= 2);
    const returnRate = customers.length > 0
        ? Math.round((returningCustomers.length / customers.length) * 100)
        : 0;
    document.getElementById('stat-return-rate').textContent = `${returnRate}%`;

    // 고객 목록 로드
    loadCustomerList(customers);

    // 생일 목록 로드
    loadBirthdayList();

    // 분석 데이터 로드
    loadAnalysisData(stats);
}

// ===== 고객 목록 로드 =====
function loadCustomerList(customers) {
    const listContainer = document.getElementById('customer-list');

    if (customers.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>등록된 고객이 없습니다.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = customers.map(customer => `
        <div class="customer-card" onclick="showCustomerDetail('${customer.id}')">
            <div class="customer-avatar">${customer.name.charAt(0)}</div>
            <div class="customer-info">
                <div class="customer-name">${customer.name}</div>
                <div class="customer-phone">${customer.phone}</div>
            </div>
            <div class="customer-meta">
                <div class="customer-points">${formatNumber(customer.points)}P</div>
                <div class="customer-visits">방문 ${customer.visitCount}회</div>
            </div>
        </div>
    `).join('');
}

// ===== 고객 검색 =====
function searchCustomers(query) {
    const customers = db.getAllCustomers();
    const filtered = customers.filter(c =>
        c.name.includes(query) ||
        c.phone.includes(query)
    );
    loadCustomerList(filtered);
}

// ===== 탭 전환 =====
function switchTab(tabId) {
    currentTab = tabId;

    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // 탭 콘텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
}

// ===== 생일 목록 로드 =====
function loadBirthdayList() {
    const listContainer = document.getElementById('birthday-list');
    const customers = db.getAllCustomers();
    const today = new Date();
    const thisMonth = String(today.getMonth() + 1).padStart(2, '0');
    const nextMonth = String((today.getMonth() + 2) % 12 || 12).padStart(2, '0');

    // 이번 달, 다음 달 생일자
    const birthdayCustomers = customers
        .filter(c => c.birthday)
        .filter(c => {
            const month = c.birthday.split('-')[0];
            return month === thisMonth || month === nextMonth;
        })
        .sort((a, b) => {
            const [aMonth, aDay] = a.birthday.split('-');
            const [bMonth, bDay] = b.birthday.split('-');
            return (aMonth + aDay).localeCompare(bMonth + bDay);
        });

    if (birthdayCustomers.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎂</div>
                <p>예정된 생일이 없습니다.</p>
            </div>
        `;
        return;
    }

    const todayMMDD = `${thisMonth}-${String(today.getDate()).padStart(2, '0')}`;

    listContainer.innerHTML = birthdayCustomers.map(customer => {
        const isToday = customer.birthday === todayMMDD;
        const [month, day] = customer.birthday.split('-');

        return `
            <div class="birthday-card">
                <div class="birthday-icon"><img src="이미지/생일.png" alt="생일"></div>
                <div class="birthday-info">
                    <div class="birthday-name">${customer.name}</div>
                    <div class="birthday-date">${month}월 ${day}일</div>
                </div>
                ${isToday ? '<div class="birthday-badge">오늘!</div>' : ''}
            </div>
        `;
    }).join('');
}

// ===== 분석 데이터 로드 =====
function loadAnalysisData(stats) {
    const container = document.getElementById('analysis-content');
    const customers = db.getAllCustomers();

    // 총 적립금
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

    // VIP 고객 (방문 10회 이상)
    const vipCustomers = customers.filter(c => c.visitCount >= 10);

    container.innerHTML = `
        <div class="analysis-card">
            <div class="card-title">이번 달 매출</div>
            <div class="card-value">${formatNumber(stats.totalRevenue)}<span>원</span></div>
            <div class="card-desc">방문 ${stats.monthlyVisits}건</div>
        </div>

        <div class="analysis-card">
            <div class="card-title">현금 결제 비율</div>
            <div class="card-value">${stats.cashRatio}<span>%</span></div>
            <div class="card-desc">카드 수수료 ${formatNumber(stats.savedFees)}원 절약</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.cashRatio}%"></div>
            </div>
        </div>

        <div class="analysis-card">
            <div class="card-title">총 미사용 적립금</div>
            <div class="card-value">${formatNumber(totalPoints)}<span>P</span></div>
            <div class="card-desc">고객 평균 ${formatNumber(Math.round(totalPoints / (customers.length || 1)))}P</div>
        </div>

        <div class="analysis-card">
            <div class="card-title">VIP 고객</div>
            <div class="card-value">${vipCustomers.length}<span>명</span></div>
            <div class="card-desc">방문 10회 이상 고객</div>
        </div>
    `;
}

// ===== 고객 상세 보기 =====
function showCustomerDetail(customerId) {
    const customer = db.getCustomerById(customerId);
    if (!customer) return;

    // 헤더 정보
    document.getElementById('detail-avatar').textContent = customer.name.charAt(0);
    document.getElementById('detail-name').textContent = customer.name;
    document.getElementById('detail-phone').textContent = customer.phone;

    // 통계
    document.getElementById('detail-points').textContent = formatNumber(customer.points);
    document.getElementById('detail-visits').textContent = customer.visitCount;

    const coupons = db.getActiveCouponsByCustomerId(customerId);
    document.getElementById('detail-coupons').textContent = coupons.length;

    // 메모
    document.getElementById('detail-memo').textContent = customer.memo || '메모가 없습니다.';

    // 방문 기록
    const visits = db.getVisitsByCustomerId(customerId).slice(0, 10);
    const historyContainer = document.getElementById('detail-history');

    if (visits.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>방문 기록이 없습니다.</p>
            </div>
        `;
    } else {
        historyContainer.innerHTML = visits.map(visit => `
            <div class="history-item">
                <div class="history-icon earn">✨</div>
                <div class="history-info">
                    <div class="history-service">${visit.service}</div>
                    <div class="history-date">${formatDate(visit.date)}</div>
                </div>
                <div class="history-amount">
                    <div class="history-points earn">+${formatNumber(visit.pointsEarned)}P</div>
                    <div class="history-price">${formatNumber(visit.finalAmount)}원</div>
                </div>
            </div>
        `).join('');
    }

    showScreen('customer-detail');
}

// ===== 유틸리티 함수 =====
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

function showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ===== 전역 함수 노출 =====
window.showScreen = showScreen;
window.showCustomerDetail = showCustomerDetail;
window.switchTab = switchTab;
