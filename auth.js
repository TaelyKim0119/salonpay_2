/**
 * =====================================================
 * 살롱페이 v2.0 - Authentication Manager
 * Google OAuth 2.0 인증 관리
 * =====================================================
 */

class AuthManager {
    constructor() {
        this.tokenClient = null;
        this.accessToken = null;
        this.userEmail = null;
        this.userName = null;
        this.userPicture = null;
        this.isInitialized = false;
        this.authStateListeners = [];
    }

    /**
     * Google Identity Services 초기화
     */
    async initialize() {
        // Google Identity Services 로드 대기
        await this._waitForGoogleIdentityServices();

        return new Promise((resolve, reject) => {
            try {
                // OAuth2 토큰 클라이언트 초기화
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CONFIG.GOOGLE_CLIENT_ID,
                    scope: CONFIG.SCOPES,
                    callback: (response) => {
                        if (response.error) {
                            console.error('OAuth 오류:', response.error);
                            this._notifyAuthStateChange(false);
                            return;
                        }
                        this.accessToken = response.access_token;
                        this._fetchUserInfo();
                    }
                });

                // 저장된 세션 복원 시도
                this._restoreSession();
                this.isInitialized = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Google Identity Services 로드 대기
     */
    _waitForGoogleIdentityServices(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkGoogle = () => {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Google Identity Services 로드 시간 초과'));
                } else {
                    setTimeout(checkGoogle, 100);
                }
            };

            checkGoogle();
        });
    }

    /**
     * Google 로그인 시작
     */
    async signIn() {
        if (!this.tokenClient) {
            throw new Error('AuthManager가 초기화되지 않았습니다.');
        }

        return new Promise((resolve, reject) => {
            try {
                // 기존 콜백을 확장
                const originalCallback = this.tokenClient.callback;
                this.tokenClient.callback = async (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                        return;
                    }
                    this.accessToken = response.access_token;
                    await this._fetchUserInfo();
                    resolve({
                        email: this.userEmail,
                        name: this.userName,
                        picture: this.userPicture
                    });
                };

                // 로그인 팝업 표시
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 로그아웃
     */
    signOut() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('토큰 폐기됨');
            });
        }

        this.accessToken = null;
        this.userEmail = null;
        this.userName = null;
        this.userPicture = null;

        // 세션 스토리지 클리어
        sessionStorage.removeItem('salonpay_auth');

        this._notifyAuthStateChange(false);
    }

    /**
     * 로그인 상태 확인
     */
    isSignedIn() {
        return !!this.accessToken && !!this.userEmail;
    }

    /**
     * 현재 액세스 토큰 반환
     */
    getAccessToken() {
        return this.accessToken;
    }

    /**
     * 사용자 이메일 반환
     */
    getUserEmail() {
        return this.userEmail;
    }

    /**
     * 사용자 이름 반환
     */
    getUserName() {
        return this.userName;
    }

    /**
     * 사용자 프로필 사진 URL 반환
     */
    getUserPicture() {
        return this.userPicture;
    }

    /**
     * 인증 상태 변경 리스너 등록
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        // 현재 상태 즉시 알림
        callback(this.isSignedIn());
    }

    /**
     * 인증 상태 변경 리스너 제거
     */
    offAuthStateChange(callback) {
        const index = this.authStateListeners.indexOf(callback);
        if (index > -1) {
            this.authStateListeners.splice(index, 1);
        }
    }

    /**
     * Google에서 사용자 정보 가져오기
     * @private
     */
    async _fetchUserInfo() {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }

            const userInfo = await response.json();
            this.userEmail = userInfo.email;
            this.userName = userInfo.name;
            this.userPicture = userInfo.picture;

            // 세션 저장
            this._saveSession();

            this._notifyAuthStateChange(true);
        } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
            this._notifyAuthStateChange(false);
        }
    }

    /**
     * 세션 저장
     * @private
     */
    _saveSession() {
        const sessionData = {
            accessToken: this.accessToken,
            userEmail: this.userEmail,
            userName: this.userName,
            userPicture: this.userPicture,
            timestamp: Date.now()
        };
        sessionStorage.setItem('salonpay_auth', JSON.stringify(sessionData));
    }

    /**
     * 세션 복원
     * @private
     */
    _restoreSession() {
        try {
            const sessionData = sessionStorage.getItem('salonpay_auth');
            if (!sessionData) return false;

            const data = JSON.parse(sessionData);

            // 세션 유효성 검사 (1시간)
            if (Date.now() - data.timestamp > 60 * 60 * 1000) {
                sessionStorage.removeItem('salonpay_auth');
                return false;
            }

            this.accessToken = data.accessToken;
            this.userEmail = data.userEmail;
            this.userName = data.userName;
            this.userPicture = data.userPicture;

            // 토큰 유효성 검증
            this._validateToken();

            return true;
        } catch (error) {
            console.error('세션 복원 실패:', error);
            return false;
        }
    }

    /**
     * 토큰 유효성 검증
     * @private
     */
    async _validateToken() {
        if (!this.accessToken) return;

        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`);
            if (!response.ok) {
                // 토큰 만료됨
                this.signOut();
            } else {
                this._notifyAuthStateChange(true);
            }
        } catch (error) {
            console.error('토큰 검증 실패:', error);
            this.signOut();
        }
    }

    /**
     * 인증 상태 변경 알림
     * @private
     */
    _notifyAuthStateChange(isSignedIn) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(isSignedIn);
            } catch (error) {
                console.error('Auth state listener 오류:', error);
            }
        });
    }
}

// 전역 인스턴스 생성
const authManager = new AuthManager();
window.authManager = authManager;
