/**
 * =====================================================
 * 살롱페이 v2.0 - Google Sheets Database
 * Google Sheets API를 사용한 데이터베이스 레이어
 * =====================================================
 */

class GoogleSheetsDB {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentSalonId = null;
        this.currentSpreadsheetId = null;
        this.cache = {};
        this.isInitialized = false;
    }

    /**
     * Google Sheets API 초기화
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE_API_KEY,
                        discoveryDocs: [CONFIG.DISCOVERY_DOC]
                    });
                    this.isInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // ========== 미용실 관리 (마스터 시트) ==========

    /**
     * 미용실 검색
     * @param {string} query - 검색어 (이름 또는 지역)
     */
    async searchSalons(query) {
        const cacheKey = `salons_search_${query}`;
        const cached = this._getCache(cacheKey, CONFIG.CACHE.SALON_LIST);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.MASTER_SHEET_ID,
                range: `${CONFIG.MASTER_SHEETS.SALONS}!A2:G`
            });

            const rows = response.result.values || [];
            const salons = rows
                .map(row => ({
                    salonId: row[0],
                    salonName: row[1],
                    region: row[2],
                    spreadsheetId: row[3],
                    ownerEmail: row[4],
                    createdAt: row[5],
                    status: row[6] || 'active'
                }))
                .filter(salon =>
                    salon.status === 'active' &&
                    (salon.salonName.toLowerCase().includes(query.toLowerCase()) ||
                     salon.region.toLowerCase().includes(query.toLowerCase()))
                );

            this._setCache(cacheKey, salons);
            return salons;
        } catch (error) {
            console.error('미용실 검색 오류:', error);
            throw error;
        }
    }

    /**
     * 모든 미용실 목록 가져오기
     */
    async getAllSalons() {
        const cacheKey = 'salons_all';
        const cached = this._getCache(cacheKey, CONFIG.CACHE.SALON_LIST);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.MASTER_SHEET_ID,
                range: `${CONFIG.MASTER_SHEETS.SALONS}!A2:G`
            });

            const rows = response.result.values || [];
            const salons = rows
                .map(row => ({
                    salonId: row[0],
                    salonName: row[1],
                    region: row[2],
                    spreadsheetId: row[3],
                    ownerEmail: row[4],
                    createdAt: row[5],
                    status: row[6] || 'active'
                }))
                .filter(salon => salon.status === 'active');

            this._setCache(cacheKey, salons);
            return salons;
        } catch (error) {
            console.error('미용실 목록 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 이메일로 미용실 찾기 (관리자용)
     */
    async getSalonByOwnerEmail(email) {
        try {
            const salons = await this.getAllSalons();
            return salons.find(s => s.ownerEmail === email);
        } catch (error) {
            console.error('미용실 찾기 오류:', error);
            return null;
        }
    }

    /**
     * 새 미용실 등록
     */
    async registerSalon(salonData) {
        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) {
            throw new Error('로그인이 필요합니다.');
        }

        const salonId = this._generateId();
        const createdAt = new Date().toISOString();

        try {
            // 1. 새 스프레드시트 생성
            const spreadsheetId = await this._createSalonSpreadsheet(salonData.salonName, salonId);

            // 2. 마스터 시트에 등록
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.MASTER_SHEET_ID,
                range: `${CONFIG.MASTER_SHEETS.SALONS}!A:G`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[
                        salonId,
                        salonData.salonName,
                        salonData.region,
                        spreadsheetId,
                        this.authManager.getUserEmail(),
                        createdAt,
                        'active'
                    ]]
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // 캐시 무효화
            this._clearCache('salons_');

            return {
                salonId,
                spreadsheetId,
                ...salonData
            };
        } catch (error) {
            console.error('미용실 등록 오류:', error);
            throw error;
        }
    }

    /**
     * 미용실 스프레드시트 생성
     * @private
     */
    async _createSalonSpreadsheet(salonName, salonId) {
        const accessToken = this.authManager.getAccessToken();

        // 스프레드시트 생성 요청
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: `SalonPay_${salonId}_${salonName}`
                },
                sheets: [
                    { properties: { title: CONFIG.SALON_SHEETS.CUSTOMERS } },
                    { properties: { title: CONFIG.SALON_SHEETS.VISITS } },
                    { properties: { title: CONFIG.SALON_SHEETS.COUPONS } },
                    { properties: { title: CONFIG.SALON_SHEETS.SETTINGS } },
                    { properties: { title: CONFIG.SALON_SHEETS.SALON_INFO } }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('스프레드시트 생성 실패');
        }

        const data = await response.json();
        const spreadsheetId = data.spreadsheetId;

        // 헤더 행 추가
        await this._initializeSpreadsheetHeaders(spreadsheetId);

        // 기본 설정 추가
        await this._initializeSettings(spreadsheetId);

        // 미용실 정보 추가
        await this._initializeSalonInfo(spreadsheetId, salonName);

        return spreadsheetId;
    }

    /**
     * 스프레드시트 헤더 초기화
     * @private
     */
    async _initializeSpreadsheetHeaders(spreadsheetId) {
        const accessToken = this.authManager.getAccessToken();

        const requests = [
            {
                range: `${CONFIG.SALON_SHEETS.CUSTOMERS}!A1:I1`,
                values: [['id', 'name', 'phone', 'birthday', 'points', 'visitCount', 'memo', 'createdAt', 'updatedAt']]
            },
            {
                range: `${CONFIG.SALON_SHEETS.VISITS}!A1:K1`,
                values: [['id', 'customerId', 'date', 'service', 'amount', 'discount', 'pointsUsed', 'pointsEarned', 'paymentMethod', 'finalAmount', 'createdAt']]
            },
            {
                range: `${CONFIG.SALON_SHEETS.COUPONS}!A1:I1`,
                values: [['id', 'customerId', 'type', 'amount', 'isPercent', 'expiryDate', 'isUsed', 'usedAt', 'createdAt']]
            }
        ];

        await gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
                valueInputOption: 'RAW',
                data: requests
            }
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    }

    /**
     * 기본 설정 초기화
     * @private
     */
    async _initializeSettings(spreadsheetId) {
        const accessToken = this.authManager.getAccessToken();

        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${CONFIG.SALON_SHEETS.SETTINGS}!A1:B5`,
            valueInputOption: 'RAW',
            resource: {
                values: [
                    ['key', 'value'],
                    ['pointEarnRate', CONFIG.DEFAULTS.POINT_EARN_RATE],
                    ['cashDiscountRate', CONFIG.DEFAULTS.CASH_DISCOUNT_RATE],
                    ['birthdayCouponAmount', CONFIG.DEFAULTS.BIRTHDAY_COUPON_AMOUNT],
                    ['cashTiers', JSON.stringify(CONFIG.DEFAULTS.CASH_TIERS)]
                ]
            }
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    }

    /**
     * 미용실 정보 초기화
     * @private
     */
    async _initializeSalonInfo(spreadsheetId, salonName) {
        const accessToken = this.authManager.getAccessToken();

        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${CONFIG.SALON_SHEETS.SALON_INFO}!A1:B4`,
            valueInputOption: 'RAW',
            resource: {
                values: [
                    ['salonName', salonName],
                    ['ownerEmail', this.authManager.getUserEmail()],
                    ['createdAt', new Date().toISOString()],
                    ['plan', 'free']
                ]
            }
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    }

    // ========== 현재 미용실 설정 ==========

    /**
     * 현재 작업할 미용실 설정
     */
    async setCurrentSalon(salonId) {
        const salons = await this.getAllSalons();
        const salon = salons.find(s => s.salonId === salonId);

        if (!salon) {
            throw new Error('미용실을 찾을 수 없습니다.');
        }

        this.currentSalonId = salonId;
        this.currentSpreadsheetId = salon.spreadsheetId;

        // localStorage에 저장 (고객용)
        localStorage.setItem('salonpay_current_salon', JSON.stringify({
            salonId,
            salonName: salon.salonName,
            spreadsheetId: salon.spreadsheetId
        }));

        return salon;
    }

    /**
     * 저장된 현재 미용실 복원
     */
    restoreCurrentSalon() {
        try {
            const saved = localStorage.getItem('salonpay_current_salon');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentSalonId = data.salonId;
                this.currentSpreadsheetId = data.spreadsheetId;
                return data;
            }
        } catch (error) {
            console.error('미용실 복원 오류:', error);
        }
        return null;
    }

    /**
     * 현재 미용실 클리어
     */
    clearCurrentSalon() {
        this.currentSalonId = null;
        this.currentSpreadsheetId = null;
        localStorage.removeItem('salonpay_current_salon');
    }

    // ========== 고객 관리 ==========

    /**
     * 모든 고객 가져오기
     */
    async getAllCustomers() {
        this._ensureSalonSelected();

        const cacheKey = `${this.currentSalonId}_customers`;
        const cached = this._getCache(cacheKey, CONFIG.CACHE.CUSTOMER_DATA);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.CUSTOMERS}!A2:I`
            });

            const rows = response.result.values || [];
            const customers = rows.map(row => ({
                id: row[0],
                name: row[1],
                phone: row[2],
                birthday: row[3] || '',
                points: parseInt(row[4]) || 0,
                visitCount: parseInt(row[5]) || 0,
                memo: row[6] || '',
                createdAt: row[7],
                updatedAt: row[8]
            }));

            this._setCache(cacheKey, customers);
            return customers;
        } catch (error) {
            console.error('고객 목록 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 전화번호로 고객 찾기
     */
    async getCustomerByPhone(phone) {
        const customers = await this.getAllCustomers();
        return customers.find(c => c.phone === phone);
    }

    /**
     * ID로 고객 찾기
     */
    async getCustomerById(customerId) {
        const customers = await this.getAllCustomers();
        return customers.find(c => c.id === customerId);
    }

    /**
     * 고객 추가
     */
    async addCustomer(customerData) {
        this._ensureSalonSelected();
        this._ensureAuthenticated();

        const accessToken = this.authManager.getAccessToken();
        const id = this._generateId();
        const now = new Date().toISOString();

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.CUSTOMERS}!A:I`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[
                        id,
                        customerData.name,
                        customerData.phone,
                        customerData.birthday || '',
                        customerData.points || 0,
                        customerData.visitCount || 0,
                        customerData.memo || '',
                        now,
                        now
                    ]]
                }
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            this._clearCache(`${this.currentSalonId}_customers`);

            return { id, ...customerData, createdAt: now, updatedAt: now };
        } catch (error) {
            console.error('고객 추가 오류:', error);
            throw error;
        }
    }

    /**
     * 고객 정보 업데이트
     */
    async updateCustomer(customerId, updates) {
        this._ensureSalonSelected();
        this._ensureAuthenticated();

        const accessToken = this.authManager.getAccessToken();
        const customers = await this.getAllCustomers();
        const customerIndex = customers.findIndex(c => c.id === customerId);

        if (customerIndex === -1) {
            throw new Error('고객을 찾을 수 없습니다.');
        }

        const rowNumber = customerIndex + 2; // 헤더 + 0-based index
        const updatedCustomer = { ...customers[customerIndex], ...updates, updatedAt: new Date().toISOString() };

        try {
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.CUSTOMERS}!A${rowNumber}:I${rowNumber}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[
                        updatedCustomer.id,
                        updatedCustomer.name,
                        updatedCustomer.phone,
                        updatedCustomer.birthday,
                        updatedCustomer.points,
                        updatedCustomer.visitCount,
                        updatedCustomer.memo,
                        updatedCustomer.createdAt,
                        updatedCustomer.updatedAt
                    ]]
                }
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            this._clearCache(`${this.currentSalonId}_customers`);

            return updatedCustomer;
        } catch (error) {
            console.error('고객 업데이트 오류:', error);
            throw error;
        }
    }

    // ========== 방문 기록 관리 ==========

    /**
     * 모든 방문 기록 가져오기
     */
    async getAllVisits() {
        this._ensureSalonSelected();

        const cacheKey = `${this.currentSalonId}_visits`;
        const cached = this._getCache(cacheKey, CONFIG.CACHE.VISITS);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.VISITS}!A2:K`
            });

            const rows = response.result.values || [];
            const visits = rows.map(row => ({
                id: row[0],
                customerId: row[1],
                date: row[2],
                service: row[3],
                amount: parseInt(row[4]) || 0,
                discount: parseInt(row[5]) || 0,
                pointsUsed: parseInt(row[6]) || 0,
                pointsEarned: parseInt(row[7]) || 0,
                paymentMethod: row[8],
                finalAmount: parseInt(row[9]) || 0,
                createdAt: row[10]
            }));

            this._setCache(cacheKey, visits);
            return visits;
        } catch (error) {
            console.error('방문 기록 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 고객별 방문 기록 가져오기
     */
    async getVisitsByCustomerId(customerId) {
        const visits = await this.getAllVisits();
        return visits
            .filter(v => v.customerId === customerId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * 방문 기록 추가
     */
    async addVisit(visitData) {
        this._ensureSalonSelected();
        this._ensureAuthenticated();

        const accessToken = this.authManager.getAccessToken();
        const id = this._generateId();
        const now = new Date().toISOString();

        // 적립금 계산
        const settings = await this.getSettings();
        const pointEarnRate = settings.pointEarnRate || CONFIG.DEFAULTS.POINT_EARN_RATE;
        const pointsEarned = Math.floor(visitData.finalAmount * (pointEarnRate / 100));

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.VISITS}!A:K`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[
                        id,
                        visitData.customerId,
                        visitData.date,
                        visitData.service,
                        visitData.amount,
                        visitData.discount || 0,
                        visitData.pointsUsed || 0,
                        pointsEarned,
                        visitData.paymentMethod,
                        visitData.finalAmount,
                        now
                    ]]
                }
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            // 고객 포인트 및 방문 횟수 업데이트
            const customer = await this.getCustomerById(visitData.customerId);
            if (customer) {
                await this.updateCustomer(visitData.customerId, {
                    points: customer.points + pointsEarned - (visitData.pointsUsed || 0),
                    visitCount: customer.visitCount + 1
                });
            }

            this._clearCache(`${this.currentSalonId}_visits`);

            return { id, ...visitData, pointsEarned, createdAt: now };
        } catch (error) {
            console.error('방문 기록 추가 오류:', error);
            throw error;
        }
    }

    // ========== 쿠폰 관리 ==========

    /**
     * 모든 쿠폰 가져오기
     */
    async getAllCoupons() {
        this._ensureSalonSelected();

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.COUPONS}!A2:I`
            });

            const rows = response.result.values || [];
            return rows.map(row => ({
                id: row[0],
                customerId: row[1],
                type: row[2],
                amount: parseInt(row[3]) || 0,
                isPercent: row[4] === 'TRUE',
                expiryDate: row[5],
                isUsed: row[6] === 'TRUE',
                usedAt: row[7] || null,
                createdAt: row[8]
            }));
        } catch (error) {
            console.error('쿠폰 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 고객별 활성 쿠폰 가져오기
     */
    async getActiveCouponsByCustomerId(customerId) {
        const coupons = await this.getAllCoupons();
        const today = new Date().toISOString().split('T')[0];

        return coupons.filter(c =>
            c.customerId === customerId &&
            !c.isUsed &&
            c.expiryDate >= today
        );
    }

    // ========== 설정 관리 ==========

    /**
     * 설정 가져오기
     */
    async getSettings() {
        this._ensureSalonSelected();

        const cacheKey = `${this.currentSalonId}_settings`;
        const cached = this._getCache(cacheKey, CONFIG.CACHE.SETTINGS);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.currentSpreadsheetId,
                range: `${CONFIG.SALON_SHEETS.SETTINGS}!A2:B`
            });

            const rows = response.result.values || [];
            const settings = {};

            rows.forEach(row => {
                const key = row[0];
                let value = row[1];

                // JSON 파싱 시도
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // 숫자 변환 시도
                    if (!isNaN(value)) {
                        value = parseFloat(value);
                    }
                }

                settings[key] = value;
            });

            this._setCache(cacheKey, settings);
            return settings;
        } catch (error) {
            console.error('설정 가져오기 오류:', error);
            return CONFIG.DEFAULTS;
        }
    }

    /**
     * 대시보드 통계 가져오기
     */
    async getDashboardStats() {
        const customers = await this.getAllCustomers();
        const visits = await this.getAllVisits();

        const today = new Date();
        const thisMonth = today.toISOString().slice(0, 7); // YYYY-MM

        const monthlyVisits = visits.filter(v => v.date.startsWith(thisMonth));
        const totalRevenue = monthlyVisits.reduce((sum, v) => sum + v.finalAmount, 0);
        const cashVisits = monthlyVisits.filter(v => v.paymentMethod === 'cash');
        const cashRatio = monthlyVisits.length > 0
            ? Math.round((cashVisits.length / monthlyVisits.length) * 100)
            : 0;
        const savedFees = Math.round(cashVisits.reduce((sum, v) => sum + v.finalAmount, 0) * 0.025);

        return {
            totalCustomers: customers.length,
            monthlyVisits: monthlyVisits.length,
            totalRevenue,
            cashRatio,
            savedFees
        };
    }

    // ========== 유틸리티 ==========

    _generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    _ensureSalonSelected() {
        if (!this.currentSpreadsheetId) {
            throw new Error('미용실이 선택되지 않았습니다.');
        }
    }

    _ensureAuthenticated() {
        if (!this.authManager.isSignedIn()) {
            throw new Error('로그인이 필요합니다.');
        }
    }

    _getCache(key, maxAge) {
        const item = this.cache[key];
        if (item && Date.now() - item.timestamp < maxAge) {
            return item.data;
        }
        return null;
    }

    _setCache(key, data) {
        this.cache[key] = {
            data,
            timestamp: Date.now()
        };
    }

    _clearCache(prefix) {
        if (prefix) {
            Object.keys(this.cache).forEach(key => {
                if (key.startsWith(prefix)) {
                    delete this.cache[key];
                }
            });
        } else {
            this.cache = {};
        }
    }
}

// 전역으로 노출
window.GoogleSheetsDB = GoogleSheetsDB;
