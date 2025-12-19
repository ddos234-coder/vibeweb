// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://srwuwwqgewwyznjzqvyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd3V3d3FnZXd3eXpuanpxdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDg4NDgsImV4cCI6MjA4MTY4NDg0OH0.Y67mX4oZofQ89qAonrzjQP23-ll2OIJxwRIgKj5iNy0';

// Supabase 클라이언트 생성 (전역 변수)
let supabaseClient = null;

// Supabase 클라이언트 초기화 함수
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return null;
    }

    const { createClient } = supabase;

    // localStorage를 기본으로 사용
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    });

    return supabaseClient;
}

// 현재 로그인된 사용자 가져오기
async function getCurrentUser() {
    if (!supabaseClient) {
        initSupabase();
    }

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error('사용자 정보 가져오기 오류:', error);
        return null;
    }

    return user;
}

// 로그아웃 함수
async function logout() {
    if (!supabaseClient) {
        initSupabase();
    }

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('로그아웃 오류:', error);
        return false;
    }

    // localStorage와 sessionStorage 모두 정리
    localStorage.removeItem('sb-srwuwwqgewwyznjzqvyh-auth-token');
    sessionStorage.removeItem('sb-srwuwwqgewwyznjzqvyh-auth-token');

    return true;
}

// 로그인 상태에 따라 UI 업데이트
async function updateAuthUI() {
    const user = await getCurrentUser();
    const authContainer = document.querySelector('.auth-container');

    if (!authContainer) {
        return;
    }

    if (user) {
        // 로그인된 상태
        const userEmail = user.email;
        const emailDisplay = userEmail.length > 20 ? userEmail.substring(0, 17) + '...' : userEmail;

        authContainer.innerHTML = `
            <div class="user-info">
                <span class="user-email">${emailDisplay}</span>
                <button class="logout-btn" id="logoutBtn">로그아웃</button>
            </div>
        `;

        // 로그아웃 버튼 이벤트 리스너
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const success = await logout();
                if (success) {
                    window.location.href = 'index.html';
                }
            });
        }
    } else {
        // 로그인되지 않은 상태
        authContainer.innerHTML = `
            <a href="login.html" class="login-icon" id="loginIcon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>로그인</span>
            </a>
        `;
    }
}

// 페이지 로드 시 인증 상태 확인
document.addEventListener('DOMContentLoaded', async () => {
    // Supabase 라이브러리 로드 대기
    if (typeof supabase !== 'undefined') {
        initSupabase();
        await updateAuthUI();
    } else {
        // Supabase 라이브러리가 로드될 때까지 대기
        let attempts = 0;
        const checkSupabase = setInterval(() => {
            attempts++;
            if (typeof supabase !== 'undefined') {
                clearInterval(checkSupabase);
                initSupabase();
                updateAuthUI();
            } else if (attempts > 50) {
                clearInterval(checkSupabase);
                console.error('Supabase 라이브러리 로드 실패');
            }
        }, 100);
    }
});

// 내보내기 (다른 스크립트에서 사용 가능)
window.supabaseAuth = {
    getClient: () => supabaseClient,
    getCurrentUser,
    logout,
    updateAuthUI
};
