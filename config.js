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
 *    - API 키 생성 (GOOGLE_API_KEY)
 *    - OAuth 2.0 클라이언트 ID 생성 (GOOGLE_CLIENT_ID)
 * 5. OAuth 동의 화면 구성 (외부 사용자용)
 * 6. 마스터 스프레드시트 생성 후 ID 복사 (MASTER_SHEET_ID)
 */

const CONFIG = {
    // Google Cloud 프로젝트 설정
    // TODO: Google Cloud Console에서 발급받은 값으로 교체하세요
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'YOUR_API_KEY',

    // 마스터 스프레드시트 ID (미용실 목록 저장용)
    // TODO: 마스터 스프레드시트 생성 후 ID 입력
    // 스프레드시트 URL: https://docs.google.com/spreadsheets/d/{MASTER_SHEET_ID}/edit
    MASTER_SHEET_ID: 'YOUR_MASTER_SHEET_ID',

    // Google Sheets API 설정
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
    DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',

    // 시트 이름 (마스터 스프레드시트)
    MASTER_SHEETS: {
        SALONS: 'Salons'  // 미용실 목록
    },

    // 시트 이름 (미용실별 스프레드시트)
    SALON_SHEETS: {
        CUSTOMERS: 'Customers',
        VISITS: 'Visits',
        COUPONS: 'Coupons',
        SETTINGS: 'Settings',
        SALON_INFO: 'SalonInfo'
    },

    // 캐시 설정 (밀리초)
    CACHE: {
        SALON_LIST: 5 * 60 * 1000,      // 미용실 목록: 5분
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
    }
};

// 설정이 완료되었는지 확인
function isConfigured() {
    return CONFIG.GOOGLE_CLIENT_ID !== 'YOUR_CLIENT_ID.apps.googleusercontent.com' &&
           CONFIG.GOOGLE_API_KEY !== 'YOUR_API_KEY' &&
           CONFIG.MASTER_SHEET_ID !== 'YOUR_MASTER_SHEET_ID';
}

// 전역으로 노출
window.CONFIG = CONFIG;
window.isConfigured = isConfigured;
