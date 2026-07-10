let currentLoginUser = null;

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

// =========================
// 로그인 상태 확인
// =========================
function checkLoginStatus() {
    fetch("/member/me")
        .then(response => response.text())
        .then(text => {
            if (text === "" || text === "null") {
                currentLoginUser = null;
                renderGuestHeader();
                return;
            }

            currentLoginUser = JSON.parse(text);
            renderLoginHeader(currentLoginUser);
        })
        .catch(error => {
            console.error("로그인 상태 확인 실패:", error);
            currentLoginUser = null;
            renderGuestHeader();
        });
}

// =========================
// 비로그인 헤더
// =========================
function renderGuestHeader() {
    const nav = document.getElementById("navMenu");
    const authArea = document.getElementById("authArea");

    if (nav !== null) {
        nav.innerHTML = `
            <a href="#" onclick="needLogin()">マイページ</a>
        `;
    }

    if (authArea !== null) {
        authArea.innerHTML = `
            <button class="login-btn" onclick="location.href='/login.html'">
                ログイン
            </button>
        `;
    }
}

// =========================
// 로그인 헤더
// =========================
function renderLoginHeader(loginUser) {
    const nav = document.getElementById("navMenu");
    const authArea = document.getElementById("authArea");

    if (nav !== null) {

        // =========================
        // 관리자 로그인 시
        // =========================
        if (loginUser.role === "ADMIN") {
            nav.innerHTML = `
                <a href="/admin.html">管理者ページ</a>
                <a href="/mypage.html">マイページ</a>
            `;
        }

        // =========================
        // 일반 회원 로그인 시
        // =========================
        else {
            nav.innerHTML = `
                <a href="/mypage.html">マイページ</a>
            `;
        }
    }

    if (authArea !== null) {
        authArea.innerHTML = `
            <span class="user-name">${loginUser.name}さん</span>
            <button class="logout-btn" onclick="logout()">
                ログアウト
            </button>
        `;
    }
}

// =========================
// 로그아웃
// =========================
function logout() {
    fetch("/member/logout", {
        method: "POST"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "logout success") {
                currentLoginUser = null;
                alert("ログアウトしました。");
                location.href = "/index.html";
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("로그아웃 실패:", error);
            alert("ログアウト中にエラーが発生しました。");
        });
}

// =========================
// 로그인 필요 안내
// =========================
function needLogin() {
    alert("ログイン後にご利用ください。");
    location.href = "/login.html";
}