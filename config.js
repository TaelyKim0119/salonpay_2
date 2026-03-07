/**
 * =====================================================
 * 살롱페이 v2.0 - Google API Configuration
 * =====================================================
 *
 * 설정 방법:
 * 1. Google Cloud Console (https://console.cloud.google.com) 접속
 * 2. 새 프로젝트 생성 또는 기존 프로젝트 선택
 * 3. "API 및 서비스" > "라이브러리"에서 Google Sheets API 활성화
 * 4. "API 및 서비스" > "사용자 인증 정보"에서:
 *    - OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
 *    - 승인된 JavaScript 원본에 도메인 추가
 * 5. OAuth 동의 화면 구성 (외부 사용자용)
 *
 * 참고: 마스터 스프레드시트 불필요!
 *       각 미용실이 자기 Google 계정에 데이터 저장
 */

const CONFIG = {
    // Google Cloud 프로젝트 설정
    // TODO: Google Cloud Console에서 발급받은 값으로 교체하세요
    GOOGLE_CLIENT_ID: '699843754832-sfe5lo7goujevf0iksek96io9jn614rl.apps.googleusercontent.com',

    // Google Sheets API 설정
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
    DISCOVERY_DOCS: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],

    // 시트 이름 (미용실별 스프레드시트)
    SHEETS: {
        SALON_INFO: 'SalonInfo',
        CUSTOMERS: 'Customers',
        VISITS: 'Visits',
        COUPONS: 'Coupons',
        SETTINGS: 'Settings'
    },

    // 캐시 설정 (밀리초)
    CACHE: {
        CUSTOMER_DATA: 30 * 1000,        // 고객 데이터: 30초
        VISITS: 30 * 1000,               // 방문 기록: 30초
        SETTINGS: 5 * 60 * 1000          // 설정: 5분
    },

    // 기본 설정값
    DEFAULTS: {
        POINT_EARN_RATE: 5,              // 적립률 5%
        CASH_DISCOUNT_RATE: 10,          // 현금 할인율 10%
        BIRTHDAY_COUPON_AMOUNT: 10000,   // 생일 쿠폰 10,000원
        CASH_TIERS: [300000, 500000, 1000000]  // 현금 결제 구간
    },

    // 미용실 코드 설정
    CODE_PREFIX: 'SP'  // 살롱페이 코드 접두어 (예: SP-ABC123)
};

// 설정이 완료되었는지 확인
function isConfigured() {
    return CONFIG.GOOGLE_CLIENT_ID !== 'YOUR_CLIENT_ID.apps.googleusercontent.com';
}

// 전역으로 노출
window.CONFIG = CONFIG;
window.isConfigured = isConfigured;
