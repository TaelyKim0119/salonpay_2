/**
 * =====================================================
 * 살롱페이 v2.0 - Google Sheets Database
 * 각 미용실이 자신의 Google 계정에 데이터 저장
 * 마스터 스프레드시트 없음 - 완전 분산형
 * =====================================================
 */

class GoogleSheetsDB {
    constructor(authManager) {
        this.authManager = authManager;
        this.spreadsheetId = null;
        this.salonCode = null;
        this.salonInfo = null;
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
                        discoveryDocs: CONFIG.DISCOVERY_DOCS
                    });
                    this.isInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * gapi에 액세스 토큰 설정
     */
    setAccessToken(token) {
        if (token && gapi.client) {
            gapi.client.setToken({ access_token: token });
        }
    }

    // ========== 미용실 코드 시스템 ==========

    /**
     * 스프레드시트 ID를 미용실 코드로 변환
     * 코드 = 스프레드시트 ID (디코딩 가능하도록)
     */
    encodeToSalonCode(spreadsheetId) {
        // 스프레드시트 ID 자체를 코드로 사용
        return spreadsheetId;
    }

    /**
     * 미용실 코드에서 스프레드시트 ID 추출
     */
    decodeFromSalonCode(code) {
        // 코드 = 스프레드시트 ID
        return code;
    }

    /**
     * 미용실 코드에서 스프레드시트 ID 디코딩
     * 참고: 짧은 코드로는 완전 복원 불가 → 저장된 매핑 사용
     */
    getSavedSalonByCode(code) {
        const savedSalons = this._getSavedSalons();
        return savedSalons.find(s => s.code === code);
    }

    /**
     * 로컬에 저장된 미용실 목록 (고객용)
     */
    _getSavedSalons() {
        try {
            return JSON.parse(localStorage.getItem('salonpay_saved_salons') || '[]');
        } catch {
            return [];
        }
    }

    /**
     * 미용실을 로컬에 저장 (고객용)
     */
    _saveSalonLocally(salonData) {
        const salons = this._getSavedSalons();
        const existing = salons.findIndex(s => s.code === salonData.code);

        if (existing >= 0) {
            salons[existing] = salonData;
        } else {
            salons.unshift(salonData); // 최근 것을 앞에
        }

        // 최대 10개만 저장
        localStorage.setItem('salonpay_saved_salons', JSON.stringify(salons.slice(0, 10)));
    }

    // ========== 미용실 등록 (관리자용) ==========

    /**
     * 새 미용실 스프레드시트 생성
     * 관리자의 Google Drive에 저장됨
     */
    async createSalonSpreadsheet(salonName, region) {
        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) {
            throw new Error('로그인이 필요합니다.');
        }

        // gapi에 토큰 설정
        this.setAccessToken(accessToken);

        // 1. 스프레드시트 생성
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: `살롱페이 - ${salonName}`
                },
                sheets: [
                    { properties: { title: CONFIG.SHEETS.SALON_INFO } },
                    { properties: { title: CONFIG.SHEETS.CUSTOMERS } },
                    { properties: { title: CONFIG.SHEETS.VISITS } },
                    { properties: { title: CONFIG.SHEETS.COUPONS } },
                    { properties: { title: CONFIG.SHEETS.SETTINGS } }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('스프레드시트 생성 에러:', response.status, errorData);
            throw new Error(`스프레드시트 생성 실패: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        this.spreadsheetId = data.spreadsheetId;
        this.salonCode = this.encodeToSalonCode(this.spreadsheetId);

        // 2. 초기 데이터 설정
        await this._initializeSpreadsheet(salonName, region);

        // 3. 로컬에 저장
        this.salonInfo = {
            code: this.salonCode,
            spreadsheetId: this.spreadsheetId,
            salonName,
            region,
            ownerEmail: this.authManager.getUserEmail()
        };

        this._saveSalonLocally(this.salonInfo);
        this._saveCurrentSalon();

        return this.salonInfo;
    }

    /**
     * 스프레드시트 초기화 (헤더, 설정 등)
     */
    async _initializeSpreadsheet(salonName, region) {
        const accessToken = this.authManager.getAccessToken();

        const requests = [
            // 미용실 정보
            {
                range: `${CONFIG.SHEETS.SALON_INFO}!A1:B6`,
                values: [
                    ['key', 'value'],
                    ['salonName', salonName],
                    ['region', region],
                    ['salonCode', this.salonCode],
                    ['ownerEmail', this.authManager.getUserEmail()],
                    ['createdAt', new Date().toISOString()]
                ]
            },
            // 고객 헤더
            {
                range: `${CONFIG.SHEETS.CUSTOMERS}!A1:I1`,
                values: [['id', 'name', 'phone', 'birthday', 'points', 'visitCount', 'memo', 'createdAt', 'updatedAt']]
            },
            // 방문 기록 헤더
            {
                range: `${CONFIG.SHEETS.VISITS}!A1:K1`,
                values: [['id', 'customerId', 'date', 'service', 'amount', 'discount', 'pointsUsed', 'pointsEarned', 'paymentMethod', 'finalAmount', 'createdAt']]
            },
            // 쿠폰 헤더
            {
                range: `${CONFIG.SHEETS.COUPONS}!A1:I1`,
                values: [['id', 'customerId', 'type', 'amount', 'isPercent', 'expiryDate', 'isUsed', 'usedAt', 'createdAt']]
            },
            // 설정
            {
                range: `${CONFIG.SHEETS.SETTINGS}!A1:B5`,
                values: [
                    ['key', 'value'],
                    ['pointEarnRate', CONFIG.DEFAULTS.POINT_EARN_RATE],
                    ['cashDiscountRate', CONFIG.DEFAULTS.CASH_DISCOUNT_RATE],
                    ['birthdayCouponAmount', CONFIG.DEFAULTS.BIRTHDAY_COUPON_AMOUNT],
                    ['cashTiers', JSON.stringify(CONFIG.DEFAULTS.CASH_TIERS)]
                ]
            }
        ];

        await gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
                valueInputOption: 'RAW',
                data: requests
            }
        });
    }

    // ========== 미용실 연결 ==========

    /**
     * 미용실 코드로 연결 (고객용)
     */
    async connectBySalonCode(code) {
        // 코드 = 스프레드시트 ID
        const spreadsheetId = this.decodeFromSalonCode(code.trim());

        // 먼저 로컬에서 찾기
        const saved = this.getSavedSalonByCode(code);
        if (saved) {
            return { success: true, salon: saved };
        }

        // 스프레드시트에서 직접 정보 가져오기
        try {
            const salon = await this.connectToSalonPublic(spreadsheetId);
            return { success: true, salon };
        } catch (error) {
            console.error('미용실 연결 오류:', error);
            return { success: false, error: '미용실을 찾을 수 없습니다.' };
        }
    }

    /**
     * 스프레드시트에서 미용실 정보 가져오기 (공개 읽기)
     */
    async connectToSalonPublic(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;

        try {
            // gapi를 통해 공개 시트 읽기 시도
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: `${CONFIG.SHEETS.SALON_INFO}!A2:B6`
            });

            const rows = response.result.values || [];
            const info = {};
            rows.forEach(row => {
                if (row[0] && row[1]) {
                    info[row[0]] = row[1];
                }
            });

            this.salonCode = spreadsheetId;
            this.salonInfo = {
                code: spreadsheetId,
                spreadsheetId: spreadsheetId,
                salonName: info.salonName || '미용실',
                region: info.region || '',
                ownerEmail: info.ownerEmail || ''
            };

            // 로컬에 저장
            this._saveSalonLocally(this.salonInfo);
            this._saveCurrentSalon();

            return this.salonInfo;
        } catch (error) {
            console.error('스프레드시트 읽기 오류:', error);
            throw new Error('미용실을 찾을 수 없습니다.');
        }
    }

    /**
     * 스프레드시트 ID로 직접 연결
     */
    async connectToSalon(spreadsheetId, cachedInfo = null) {
        this.spreadsheetId = spreadsheetId;

        try {
            // 미용실 정보 가져오기
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.SHEETS.SALON_INFO}!A2:B6`
            });

            const rows = response.result.values || [];
            const info = {};
            rows.forEach(row => {
                if (row[0] && row[1]) {
                    info[row[0]] = row[1];
                }
            });

            this.salonCode = info.salonCode;
            this.salonInfo = {
                code: this.salonCode,
                spreadsheetId: this.spreadsheetId,
                salonName: info.salonName,
                region: info.region,
                ownerEmail: info.ownerEmail
            };

            // 로컬에 저장 (다음에 빠르게 접근)
            this._saveSalonLocally(this.salonInfo);
            this._saveCurrentSalon();

            return this.salonInfo;
        } catch (error) {
            // API 키 없이는 공개 시트만 접근 가능
            // 캐시된 정보 사용
            if (cachedInfo) {
                this.salonInfo = cachedInfo;
                this.salonCode = cachedInfo.code;
                this._saveCurrentSalon();
                return this.salonInfo;
            }
            throw error;
        }
    }

    /**
     * 관리자의 기존 미용실 찾기
     */
    async findMySalon() {
        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) return null;

        try {
            // Drive에서 "살롱페이" 스프레드시트 검색
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name contains '살롱페이' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Drive API 에러:', response.status, errorData);
                return null;
            }

            const data = await response.json();
            if (data.files && data.files.length > 0) {
                // 첫 번째 살롱페이 스프레드시트 사용
                const file = data.files[0];
                return this.connectToSalon(file.id);
            }
        } catch (error) {
            console.error('미용실 찾기 오류:', error);
        }
        return null;
    }

    /**
     * 현재 미용실 저장
     */
    _saveCurrentSalon() {
        if (this.salonInfo) {
            localStorage.setItem('salonpay_current_salon', JSON.stringify(this.salonInfo));
        }
    }

    /**
     * 저장된 현재 미용실 복원
     */
    restoreCurrentSalon() {
        try {
            const saved = localStorage.getItem('salonpay_current_salon');
            if (saved) {
                this.salonInfo = JSON.parse(saved);
                this.spreadsheetId = this.salonInfo.spreadsheetId;
                this.salonCode = this.salonInfo.code;
                return this.salonInfo;
            }
        } catch (error) {
            console.error('미용실 복원 오류:', error);
        }
        return null;
    }

    /**
     * 연결 해제
     */
    disconnect() {
        this.spreadsheetId = null;
        this.salonCode = null;
        this.salonInfo = null;
        localStorage.removeItem('salonpay_current_salon');
        this._clearCache();
    }

    /**
     * 연결 상태 확인
     */
    isConnected() {
        return !!this.spreadsheetId;
    }

    // ========== 고객 관리 ==========

    async getAllCustomers() {
        this._ensureConnected();

        const cacheKey = 'customers';
        const cached = this._getCache(cacheKey, CONFIG.CACHE.CUSTOMER_DATA);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.SHEETS.CUSTOMERS}!A2:I`
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

    async getCustomerByPhone(phone) {
        const customers = await this.getAllCustomers();
        return customers.find(c => c.phone === phone);
    }

    async getCustomerById(customerId) {
        const customers = await this.getAllCustomers();
        return customers.find(c => c.id === customerId);
    }

    async addCustomer(customerData) {
        this._ensureConnected();

        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) throw new Error('로그인이 필요합니다.');

        const id = this._generateId();
        const now = new Date().toISOString();

        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${CONFIG.SHEETS.CUSTOMERS}!A:I`,
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
        });

        this._clearCache('customers');
        return { id, ...customerData, createdAt: now, updatedAt: now };
    }

    async updateCustomer(customerId, updates) {
        this._ensureConnected();

        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) throw new Error('로그인이 필요합니다.');

        const customers = await this.getAllCustomers();
        const customerIndex = customers.findIndex(c => c.id === customerId);

        if (customerIndex === -1) {
            throw new Error('고객을 찾을 수 없습니다.');
        }

        const rowNumber = customerIndex + 2;
        const updatedCustomer = { ...customers[customerIndex], ...updates, updatedAt: new Date().toISOString() };

        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${CONFIG.SHEETS.CUSTOMERS}!A${rowNumber}:I${rowNumber}`,
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
        });

        this._clearCache('customers');
        return updatedCustomer;
    }

    // ========== 방문 기록 ==========

    async getAllVisits() {
        this._ensureConnected();

        const cacheKey = 'visits';
        const cached = this._getCache(cacheKey, CONFIG.CACHE.VISITS);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.SHEETS.VISITS}!A2:K`
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

    async getVisitsByCustomerId(customerId) {
        const visits = await this.getAllVisits();
        return visits
            .filter(v => v.customerId === customerId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async addVisit(visitData) {
        this._ensureConnected();

        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) throw new Error('로그인이 필요합니다.');

        const id = this._generateId();
        const now = new Date().toISOString();

        const settings = await this.getSettings();
        const pointEarnRate = settings.pointEarnRate || CONFIG.DEFAULTS.POINT_EARN_RATE;
        const pointsEarned = Math.floor(visitData.finalAmount * (pointEarnRate / 100));

        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${CONFIG.SHEETS.VISITS}!A:K`,
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
        });

        // 고객 포인트/방문 횟수 업데이트
        const customer = await this.getCustomerById(visitData.customerId);
        if (customer) {
            await this.updateCustomer(visitData.customerId, {
                points: customer.points + pointsEarned - (visitData.pointsUsed || 0),
                visitCount: customer.visitCount + 1
            });
        }

        this._clearCache('visits');
        return { id, ...visitData, pointsEarned, createdAt: now };
    }

    // ========== 쿠폰 ==========

    async getAllCoupons() {
        this._ensureConnected();

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.SHEETS.COUPONS}!A2:I`
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

    async getActiveCouponsByCustomerId(customerId) {
        const coupons = await this.getAllCoupons();
        const today = new Date().toISOString().split('T')[0];
        return coupons.filter(c =>
            c.customerId === customerId &&
            !c.isUsed &&
            c.expiryDate >= today
        );
    }

    // ========== 설정 ==========

    async getSettings() {
        this._ensureConnected();

        const cacheKey = 'settings';
        const cached = this._getCache(cacheKey, CONFIG.CACHE.SETTINGS);
        if (cached) return cached;

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.SHEETS.SETTINGS}!A2:B`
            });

            const rows = response.result.values || [];
            const settings = {};

            rows.forEach(row => {
                const key = row[0];
                let value = row[1];
                try { value = JSON.parse(value); } catch { if (!isNaN(value)) value = parseFloat(value); }
                settings[key] = value;
            });

            this._setCache(cacheKey, settings);
            return settings;
        } catch (error) {
            console.error('설정 가져오기 오류:', error);
            return CONFIG.DEFAULTS;
        }
    }

    async updateSettings(newSettings) {
        this._ensureConnected();

        const accessToken = this.authManager.getAccessToken();
        if (!accessToken) throw new Error('로그인이 필요합니다.');

        const values = [
            ['key', 'value'],
            ['pointEarnRate', newSettings.pointEarnRate || CONFIG.DEFAULTS.POINT_EARN_RATE],
            ['cashDiscountRate', newSettings.cashDiscountRate || CONFIG.DEFAULTS.CASH_DISCOUNT_RATE],
            ['birthdayCouponAmount', newSettings.birthdayCouponAmount || CONFIG.DEFAULTS.BIRTHDAY_COUPON_AMOUNT],
            ['cashTiers', JSON.stringify(newSettings.cashTiers || CONFIG.DEFAULTS.CASH_TIERS)]
        ];

        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${CONFIG.SHEETS.SETTINGS}!A1:B5`,
            valueInputOption: 'RAW',
            resource: { values }
        });

        this._clearCache('settings');
    }

    // ========== 통계 ==========

    async getDashboardStats() {
        const customers = await this.getAllCustomers();
        const visits = await this.getAllVisits();

        const today = new Date();
        const thisMonth = today.toISOString().slice(0, 7);

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

    _ensureConnected() {
        if (!this.spreadsheetId) {
            throw new Error('미용실에 연결되지 않았습니다.');
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
        this.cache[key] = { data, timestamp: Date.now() };
    }

    _clearCache(prefix) {
        if (prefix) {
            Object.keys(this.cache).forEach(key => {
                if (key.startsWith(prefix)) delete this.cache[key];
            });
        } else {
            this.cache = {};
        }
    }
}

// 전역으로 노출
window.GoogleSheetsDB = GoogleSheetsDB;
