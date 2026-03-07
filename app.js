/**
 * =====================================================
 * 살롱페이 v2.0 - App JavaScript
 * 프론트엔드 개발자: 제이든
 * =====================================================
 */

// ===== 다국어 지원 (i18n) =====
const translations = {
    ko: {
        appName: '살롱페이',
        appSubtitle: '스마트한 미용실 적립금 관리',
        customer: '고객',
        customerDesc: '적립금 조회 및 사용',
        admin: '관리자',
        adminDesc: '고객 관리 및 통계',
        hello: '안녕하세요!',
        phonePrompt: '전화번호로 간편하게 조회하세요',
        phoneLabel: '전화번호',
        phonePlaceholder: '010-0000-0000',
        search: '조회하기',
        back: '돌아가기',
        myPoints: '내 적립금',
        availablePoints: '사용 가능한 적립금',
        totalPoints: '총 적립금',
        availableCoupons: '사용 가능 쿠폰',
        recentHistory: '최근 이용 내역',
        noHistory: '아직 이용 내역이 없어요',
        totalCustomers: '총 고객',
        birthdayMonth: '이달 생일',
        returnRate: '재방문율',
        searchPlaceholder: '이름 또는 전화번호로 검색',
        customerDB: '고객 DB',
        birthdayManage: '생일관리',
        analysis: '분석',
        upcomingBirthday: '다가오는 생일',
        monthlyRevenue: '월별 매출 추이',
        serviceRatio: '서비스별 매출 비중',
        cashTierRatio: '현금 결제 구간별 비중',
        settings: '설정',
        cashTierSettings: '현금 결제 구간 설정',
        cashTierDesc: '현금 결제 분석에 사용할 금액 구간을 설정하세요',
        addTier: '+ 구간 추가',
        cancel: '취소',
        save: '저장',
        tenThousandWon: '만원',
        visits: '방문',
        coupons: '쿠폰',
        points: '적립금',
        customerMemo: '고객 메모',
        noMemo: '메모가 없습니다.',
        visitHistory: '방문 기록',
        today: '오늘!',
        magic: '매직',
        perm: '펌',
        etc: '기타',
        monthlyRevenueTitle: '이번 달 매출',
        cashRatio: '현금 결제 비율',
        savedFees: '카드 수수료 절약',
        unusedPoints: '총 미사용 적립금',
        avgPoints: '고객 평균',
        vipCustomers: 'VIP 고객',
        vipDesc: '방문 10회 이상 고객',
        yearTotal: '연간 총 매출',
        monthAvg: '월 평균',
        totalCash: '총 현금결제',
        won: '원',
        count: '건',
        people: '명',
        sheet: '장'
    },
    en: {
        appName: 'SalonPay',
        appSubtitle: 'Smart Salon Points Management',
        customer: 'Customer',
        customerDesc: 'Check & Use Points',
        admin: 'Admin',
        adminDesc: 'Customer Management & Stats',
        hello: 'Hello!',
        phonePrompt: 'Check with your phone number',
        phoneLabel: 'Phone Number',
        phonePlaceholder: '010-0000-0000',
        search: 'Search',
        back: 'Back',
        myPoints: 'My Points',
        availablePoints: 'Available Points',
        totalPoints: 'Total Points',
        availableCoupons: 'Available Coupons',
        recentHistory: 'Recent History',
        noHistory: 'No history yet',
        totalCustomers: 'Customers',
        birthdayMonth: 'Birthdays',
        returnRate: 'Return Rate',
        searchPlaceholder: 'Search by name or phone',
        customerDB: 'Customer DB',
        birthdayManage: 'Birthday',
        analysis: 'Analysis',
        upcomingBirthday: 'Upcoming Birthdays',
        monthlyRevenue: 'Monthly Revenue',
        serviceRatio: 'Service Revenue Ratio',
        cashTierRatio: 'Cash Payment Tiers',
        settings: 'Settings',
        cashTierSettings: 'Cash Tier Settings',
        cashTierDesc: 'Set amount tiers for cash payment analysis',
        addTier: '+ Add Tier',
        cancel: 'Cancel',
        save: 'Save',
        tenThousandWon: '0K KRW',
        visits: 'Visits',
        coupons: 'Coupons',
        points: 'Points',
        customerMemo: 'Customer Memo',
        noMemo: 'No memo',
        visitHistory: 'Visit History',
        today: 'Today!',
        magic: 'Straight',
        perm: 'Perm',
        etc: 'Etc',
        monthlyRevenueTitle: 'Monthly Revenue',
        cashRatio: 'Cash Payment Ratio',
        savedFees: 'Saved Card Fees',
        unusedPoints: 'Total Unused Points',
        avgPoints: 'Customer Average',
        vipCustomers: 'VIP Customers',
        vipDesc: '10+ visits',
        yearTotal: 'Annual Total',
        monthAvg: 'Monthly Avg',
        totalCash: 'Total Cash',
        won: 'KRW',
        count: '',
        people: '',
        sheet: ''
    },
    ja: {
        appName: 'サロンペイ',
        appSubtitle: 'スマートなサロンポイント管理',
        customer: 'お客様',
        customerDesc: 'ポイント照会・使用',
        admin: '管理者',
        adminDesc: '顧客管理・統計',
        hello: 'こんにちは！',
        phonePrompt: '電話番号で簡単に照会',
        phoneLabel: '電話番号',
        phonePlaceholder: '010-0000-0000',
        search: '照会する',
        back: '戻る',
        myPoints: 'マイポイント',
        availablePoints: '利用可能ポイント',
        totalPoints: '総ポイント',
        availableCoupons: '利用可能クーポン',
        recentHistory: '最近の利用履歴',
        noHistory: 'まだ利用履歴がありません',
        totalCustomers: '総顧客',
        birthdayMonth: '今月の誕生日',
        returnRate: 'リピート率',
        searchPlaceholder: '名前または電話番号で検索',
        customerDB: '顧客DB',
        birthdayManage: '誕生日管理',
        analysis: '分析',
        upcomingBirthday: '近日誕生日',
        monthlyRevenue: '月別売上推移',
        serviceRatio: 'サービス別売上比率',
        cashTierRatio: '現金決済区間別比率',
        settings: '設定',
        cashTierSettings: '現金決済区間設定',
        cashTierDesc: '現金決済分析に使用する金額区間を設定',
        addTier: '+ 区間追加',
        cancel: 'キャンセル',
        save: '保存',
        tenThousandWon: '万ウォン',
        visits: '訪問',
        coupons: 'クーポン',
        points: 'ポイント',
        customerMemo: 'お客様メモ',
        noMemo: 'メモがありません',
        visitHistory: '訪問履歴',
        today: '今日！',
        magic: 'マジック',
        perm: 'パーマ',
        etc: 'その他',
        monthlyRevenueTitle: '今月の売上',
        cashRatio: '現金決済比率',
        savedFees: 'カード手数料節約',
        unusedPoints: '未使用ポイント合計',
        avgPoints: '顧客平均',
        vipCustomers: 'VIP顧客',
        vipDesc: '訪問10回以上',
        yearTotal: '年間総売上',
        monthAvg: '月平均',
        totalCash: '現金決済合計',
        won: 'ウォン',
        count: '件',
        people: '名',
        sheet: '枚'
    },
    zh: {
        appName: 'SalonPay',
        appSubtitle: '智能美发店积分管理',
        customer: '顾客',
        customerDesc: '积分查询与使用',
        admin: '管理员',
        adminDesc: '顾客管理与统计',
        hello: '您好！',
        phonePrompt: '用手机号码轻松查询',
        phoneLabel: '手机号码',
        phonePlaceholder: '010-0000-0000',
        search: '查询',
        back: '返回',
        myPoints: '我的积分',
        availablePoints: '可用积分',
        totalPoints: '总积分',
        availableCoupons: '可用优惠券',
        recentHistory: '最近使用记录',
        noHistory: '暂无使用记录',
        totalCustomers: '总顾客',
        birthdayMonth: '本月生日',
        returnRate: '回头率',
        searchPlaceholder: '按姓名或手机号搜索',
        customerDB: '顾客数据库',
        birthdayManage: '生日管理',
        analysis: '分析',
        upcomingBirthday: '即将生日',
        monthlyRevenue: '月度营收趋势',
        serviceRatio: '服务营收比例',
        cashTierRatio: '现金支付区间比例',
        settings: '设置',
        cashTierSettings: '现金支付区间设置',
        cashTierDesc: '设置现金支付分析的金额区间',
        addTier: '+ 添加区间',
        cancel: '取消',
        save: '保存',
        tenThousandWon: '万韩元',
        visits: '访问',
        coupons: '优惠券',
        points: '积分',
        customerMemo: '顾客备注',
        noMemo: '暂无备注',
        visitHistory: '访问记录',
        today: '今天！',
        magic: '拉直',
        perm: '烫发',
        etc: '其他',
        monthlyRevenueTitle: '本月营收',
        cashRatio: '现金支付比例',
        savedFees: '节省刷卡手续费',
        unusedPoints: '未使用积分总计',
        avgPoints: '顾客平均',
        vipCustomers: 'VIP顾客',
        vipDesc: '访问10次以上',
        yearTotal: '年度总营收',
        monthAvg: '月均',
        totalCash: '现金支付总计',
        won: '韩元',
        count: '笔',
        people: '人',
        sheet: '张'
    }
};

let currentLang = localStorage.getItem('salonpay_lang') || 'ko';

function t(key) {
    return translations[currentLang]?.[key] || translations['ko'][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('salonpay_lang', lang);
    applyTranslations();
}

function applyTranslations() {
    // 모든 data-i18n 속성을 가진 요소 번역
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

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

    // 다국어 적용
    applyTranslations();

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
            <div class="history-icon">
                <img src="${getServiceIcon(visit.service)}" alt="${visit.service}">
            </div>
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

    // 차트 렌더링
    setTimeout(() => {
        renderRevenueChart();
        renderServicePieChart();
        renderPaymentPieChart();
    }, 100);
}

// ===== 차트 렌더링 함수 =====

// 월별 매출 시계열 차트
function renderRevenueChart() {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const visits = db.getAllVisits();

    // 최근 12개월 데이터 집계
    const monthlyData = {};
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { revenue: 0, visits: 0, label: `${date.getMonth() + 1}월` };
    }

    visits.forEach(visit => {
        const monthKey = visit.date.slice(0, 7);
        if (monthlyData[monthKey]) {
            monthlyData[monthKey].revenue += visit.finalAmount;
            monthlyData[monthKey].visits += 1;
        }
    });

    const data = Object.values(monthlyData);
    const maxRevenue = Math.max(...data.map(d => d.revenue), 100000);

    // 캔버스 크기 설정
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '200px';
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 배경
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 그리드 라인
    ctx.strokeStyle = '#E5E5EA';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    // 바 차트
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length * 0.4;

    data.forEach((d, i) => {
        const x = padding.left + (chartWidth / data.length) * i + barGap / 2;
        const barHeight = (d.revenue / maxRevenue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        // 그라데이션 바
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#FFD93D');
        gradient.addColorStop(1, '#F5A623');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();

        // X축 레이블
        ctx.fillStyle = '#8E8E93';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barWidth / 2, height - 10);
    });

    // Y축 레이블
    ctx.fillStyle = '#8E8E93';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = Math.round((maxRevenue / 4) * (4 - i));
        const y = padding.top + (chartHeight / 4) * i;
        ctx.fillText(formatCompactNumber(value), padding.left - 8, y + 4);
    }

    // 범례 업데이트
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / 12);
    document.getElementById('revenue-legend').innerHTML = `
        <span class="legend-item">
            <span class="legend-dot" style="background: linear-gradient(135deg, #FFD93D, #F5A623);"></span>
            연간 총 매출: ${formatNumber(totalRevenue)}원
        </span>
        <span class="legend-item">
            <span class="legend-dot" style="background: #34C759;"></span>
            월 평균: ${formatNumber(avgRevenue)}원
        </span>
    `;
}

// 서비스별 매출 파이 차트
function renderServicePieChart() {
    const canvas = document.getElementById('service-pie-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const visits = db.getAllVisits();

    // 서비스별 매출 집계
    const serviceData = {};
    visits.forEach(visit => {
        const service = categorizeService(visit.service);
        if (!serviceData[service]) {
            serviceData[service] = 0;
        }
        serviceData[service] += visit.finalAmount;
    });

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const data = Object.entries(serviceData).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, d) => sum + d.value, 0);

    // 캔버스 설정
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(200, window.innerWidth - 180);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // 파이 차트 그리기
    let startAngle = -Math.PI / 2;
    data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        // 흰색 테두리
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += sliceAngle;
    });

    // 도넛 홀
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // 중앙 텍스트
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('서비스', centerX, centerY - 5);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8E8E93';
    ctx.fillText('매출 비중', centerX, centerY + 12);

    // 범례
    document.getElementById('service-legend').innerHTML = data.map(d => `
        <div class="pie-legend-item">
            <span class="legend-color" style="background: ${d.color};"></span>
            <span class="legend-label">${d.name}</span>
            <span class="legend-value">${Math.round(d.value / total * 100)}%</span>
        </div>
    `).join('');
}

// 현금 결제 구간별 파이 차트
function renderPaymentPieChart() {
    const canvas = document.getElementById('payment-pie-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const visits = db.getAllVisits();
    const settings = db.getSettings();
    const tiers = settings.cashTiers || [300000, 500000, 1000000];

    // 현금 결제 건수별 구간 집계
    const tierCounts = {};
    const tierLabels = [];

    // 구간 레이블 생성
    tierLabels.push(`${formatCompactNumber(tiers[0])} 미만`);
    for (let i = 0; i < tiers.length; i++) {
        if (i < tiers.length - 1) {
            tierLabels.push(`${formatCompactNumber(tiers[i])}~${formatCompactNumber(tiers[i+1])}`);
        } else {
            tierLabels.push(`${formatCompactNumber(tiers[i])} 이상`);
        }
    }

    // 초기화
    tierLabels.forEach(label => tierCounts[label] = 0);

    // 현금 결제만 집계
    const cashVisits = visits.filter(v => v.paymentMethod === 'cash');
    cashVisits.forEach(visit => {
        const amount = visit.finalAmount;
        if (amount < tiers[0]) {
            tierCounts[tierLabels[0]]++;
        } else if (amount >= tiers[tiers.length - 1]) {
            tierCounts[tierLabels[tierLabels.length - 1]]++;
        } else {
            for (let i = 0; i < tiers.length - 1; i++) {
                if (amount >= tiers[i] && amount < tiers[i + 1]) {
                    tierCounts[tierLabels[i + 1]]++;
                    break;
                }
            }
        }
    });

    const colors = ['#FFD93D', '#F5A623', '#E8920D', '#D4780A'];
    const data = tierLabels.map((label, i) => ({
        name: label,
        value: tierCounts[label],
        color: colors[i % colors.length]
    })).filter(d => d.value > 0);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
        document.getElementById('payment-legend').innerHTML = '<p style="color: #8E8E93;">현금 결제 내역이 없습니다.</p>';
        return;
    }

    // 캔버스 설정
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(200, window.innerWidth - 180);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // 파이 차트 그리기
    let startAngle = -Math.PI / 2;
    data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += sliceAngle;
    });

    // 도넛 홀
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // 중앙 텍스트
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('현금', centerX, centerY - 5);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8E8E93';
    ctx.fillText('구간별 비중', centerX, centerY + 12);

    // 범례
    document.getElementById('payment-legend').innerHTML = `
        ${data.map(d => `
            <div class="pie-legend-item">
                <span class="legend-color" style="background: ${d.color};"></span>
                <span class="legend-label">${d.name}</span>
                <span class="legend-value">${d.value}건 (${Math.round(d.value / total * 100)}%)</span>
            </div>
        `).join('')}
        <div class="pie-legend-item highlight">
            <span class="legend-color" style="background: #F5A623;"></span>
            <span class="legend-label">총 현금결제</span>
            <span class="legend-value">${total}건</span>
        </div>
    `;
}

// 서비스 분류 함수
function categorizeService(serviceName) {
    if (serviceName.includes('펌')) return '펌';
    if (serviceName.includes('염색') || serviceName.includes('컬러')) return '염색';
    if (serviceName.includes('클리닉') || serviceName.includes('케어')) return '클리닉';
    if (serviceName.includes('커트')) return '커트';
    return '기타';
}

// 숫자 축약 표시
function formatCompactNumber(num) {
    if (num >= 10000000) return Math.round(num / 10000000) + '천만';
    if (num >= 1000000) return Math.round(num / 1000000) + '백만';
    if (num >= 10000) return Math.round(num / 10000) + '만';
    if (num >= 1000) return Math.round(num / 1000) + 'K';
    return num.toString();
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
                <div class="history-icon">
                    <img src="${getServiceIcon(visit.service)}" alt="${visit.service}">
                </div>
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
function getServiceIcon(serviceName) {
    if (serviceName.includes('염색') || serviceName.includes('컬러')) {
        return '이미지/염색.png';
    }
    if (serviceName.includes('펌')) {
        return '이미지/펌.png';
    }
    // 커트 또는 기타
    return '이미지/커트.png';
}

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

// ===== 설정 관련 함수 =====
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('active');
    loadTierInputs();
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('active');
}

function loadTierInputs() {
    const container = document.getElementById('tier-inputs');
    const settings = db.getSettings();
    const tiers = settings.cashTiers || [300000, 500000, 1000000];

    container.innerHTML = tiers.map((tier, i) => `
        <div class="tier-input-row">
            <input type="number" class="tier-value" value="${tier / 10000}" min="1" placeholder="금액">
            <span class="tier-unit">만원</span>
            <button class="btn-remove-tier" onclick="removeTierInput(this)" ${tiers.length <= 1 ? 'disabled style="opacity:0.5"' : ''}>−</button>
        </div>
    `).join('');
}

function addTierInput() {
    const container = document.getElementById('tier-inputs');
    const lastInput = container.querySelector('.tier-input-row:last-child .tier-value');
    const lastValue = lastInput ? parseInt(lastInput.value) || 50 : 50;

    const newRow = document.createElement('div');
    newRow.className = 'tier-input-row';
    newRow.innerHTML = `
        <input type="number" class="tier-value" value="${lastValue + 20}" min="1" placeholder="금액">
        <span class="tier-unit">만원</span>
        <button class="btn-remove-tier" onclick="removeTierInput(this)">−</button>
    `;
    container.appendChild(newRow);
    updateRemoveButtons();
}

function removeTierInput(btn) {
    const container = document.getElementById('tier-inputs');
    if (container.children.length > 1) {
        btn.closest('.tier-input-row').remove();
        updateRemoveButtons();
    }
}

function updateRemoveButtons() {
    const container = document.getElementById('tier-inputs');
    const buttons = container.querySelectorAll('.btn-remove-tier');
    buttons.forEach(btn => {
        btn.disabled = container.children.length <= 1;
        btn.style.opacity = container.children.length <= 1 ? '0.5' : '1';
    });
}

function saveSettings() {
    const inputs = document.querySelectorAll('#tier-inputs .tier-value');
    const tiers = Array.from(inputs)
        .map(input => parseInt(input.value) * 10000)
        .filter(v => !isNaN(v) && v > 0)
        .sort((a, b) => a - b);

    if (tiers.length === 0) {
        showToast('최소 1개 이상의 구간을 입력하세요');
        return;
    }

    const settings = db.getSettings();
    settings.cashTiers = tiers;
    db.updateSettings(settings);

    closeSettings();
    showToast('설정이 저장되었습니다');

    // 차트 새로고침
    renderPaymentPieChart();
}

// ===== 전역 함수 노출 =====
window.showScreen = showScreen;
window.showCustomerDetail = showCustomerDetail;
window.switchTab = switchTab;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.addTierInput = addTierInput;
window.removeTierInput = removeTierInput;
window.saveSettings = saveSettings;
window.setLanguage = setLanguage;
