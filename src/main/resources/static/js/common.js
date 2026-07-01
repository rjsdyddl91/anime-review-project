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
            <a href="#" onclick="needLogin()">마이페이지</a>
        `;
    }

    if (authArea !== null) {
        authArea.innerHTML = `
            <button class="login-btn" onclick="location.href='/login.html'">
                로그인
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
                <a href="/admin.html">관리자페이지</a>
                <a href="/mypage.html">마이페이지</a>
            `;
        }

        // =========================
        // 일반 회원 로그인 시
        // =========================
        else {
            nav.innerHTML = `
                <a href="/mypage.html">마이페이지</a>
            `;
        }
    }

    if (authArea !== null) {
        authArea.innerHTML = `
            <span class="user-name">${loginUser.name}님</span>
            <button class="logout-btn" onclick="logout()">
                로그아웃
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
                alert("로그아웃되었습니다.");
                location.href = "/index.html";
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("로그아웃 실패:", error);
            alert("로그아웃 중 오류가 발생했습니다.");
        });
}

// =========================
// 로그인 필요 안내
// =========================
function needLogin() {
    alert("로그인 후 이용해주세요.");
    location.href = "/login.html";
}