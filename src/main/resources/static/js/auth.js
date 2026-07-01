// =========================
// 회원가입 이메일 인증 상태
// =========================
let joinEmailVerified = false;
let verifiedJoinEmail = "";

document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initJoin();
    initFindPassword();
});

// =========================
// 로그인
// =========================
function initLogin() {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn === null) {
        return;
    }

    loginBtn.addEventListener("click", () => {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        const loginData = {
            email: email,
            password: password
        };

        fetch("/member/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        })
            .then(response => response.text())
            .then(result => {
                if (result === "login success") {
                    alert("로그인되었습니다.");
                    location.href = "/index.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("로그인 실패:", error);
                alert("로그인 중 오류가 발생했습니다.");
            });
    });
}

// =========================
// 회원가입
// =========================
function initJoin() {
    const joinBtn = document.getElementById("joinBtn");
    const sendJoinCodeBtn = document.getElementById("sendJoinCodeBtn");
    const verifyJoinCodeBtn = document.getElementById("verifyJoinCodeBtn");

    if (joinBtn === null) {
        return;
    }

    // =========================
    // 회원가입 이메일 인증코드 발송
    // =========================
    if (sendJoinCodeBtn !== null) {
        sendJoinCodeBtn.addEventListener("click", () => {
            sendJoinEmailCode();
        });
    }

    // =========================
    // 회원가입 이메일 인증코드 확인
    // =========================
    if (verifyJoinCodeBtn !== null) {
        verifyJoinEmailCode();
    }

    // =========================
    // 회원가입 버튼
    // =========================
    joinBtn.addEventListener("click", () => {
        const name = document.getElementById("joinName").value.trim();
        const phone = document.getElementById("joinPhone").value.trim();
        const email = document.getElementById("joinEmail").value.trim();
        const password = document.getElementById("joinPassword").value.trim();

        if (name === "" || phone === "" || email === "" || password === "") {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        if (!joinEmailVerified || verifiedJoinEmail !== email) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        const joinData = {
            name: name,
            phone: phone,
            email: email,
            password: password
        };

        fetch("/member/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(joinData)
        })
            .then(response => response.text())
            .then(result => {
                if (result === "success") {
                    alert("회원가입이 완료되었습니다.");
                    location.href = "/login.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("회원가입 실패:", error);
                alert("회원가입 중 오류가 발생했습니다.");
            });
    });
}

// =========================
// 회원가입 이메일 인증코드 발송
// =========================
function sendJoinEmailCode() {
    const email = document.getElementById("joinEmail").value.trim();
    const resultBox = document.getElementById("joinEmailAuthResult");

    if (email === "") {
        alert("이메일을 입력해주세요.");
        return;
    }

    joinEmailVerified = false;
    verifiedJoinEmail = "";

    if (resultBox !== null) {
        resultBox.textContent = "인증코드를 발송 중입니다...";
        resultBox.classList.remove("error");
    }

    fetch("/member/join/send-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email
        })
    })
        .then(response => response.text())
        .then(result => {
            if (result === "join code sent") {
                if (resultBox !== null) {
                    resultBox.textContent = "인증코드가 이메일로 발송되었습니다.";
                    resultBox.classList.remove("error");
                }

                alert("인증코드가 발송되었습니다.");
                return;
            }

            if (resultBox !== null) {
                resultBox.textContent = result;
                resultBox.classList.add("error");
            }

            alert(result);
        })
        .catch(error => {
            console.error("인증코드 발송 실패:", error);

            if (resultBox !== null) {
                resultBox.textContent = "인증코드 발송 중 오류가 발생했습니다.";
                resultBox.classList.add("error");
            }

            alert("인증코드 발송 중 오류가 발생했습니다.");
        });
}

// =========================
// 회원가입 이메일 인증코드 확인
// =========================
function verifyJoinEmailCode() {
    const verifyJoinCodeBtn = document.getElementById("verifyJoinCodeBtn");

    if (verifyJoinCodeBtn === null) {
        return;
    }

    verifyJoinCodeBtn.addEventListener("click", () => {
        const email = document.getElementById("joinEmail").value.trim();
        const authCode = document.getElementById("joinAuthCode").value.trim();
        const resultBox = document.getElementById("joinEmailAuthResult");

        if (email === "") {
            alert("이메일을 입력해주세요.");
            return;
        }

        if (authCode === "") {
            alert("인증코드를 입력해주세요.");
            return;
        }

        fetch("/member/join/verify-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                authCode: authCode
            })
        })
            .then(response => response.text())
            .then(result => {
                if (result === "join verified") {
                    joinEmailVerified = true;
                    verifiedJoinEmail = email;

                    if (resultBox !== null) {
                        resultBox.textContent = "이메일 인증이 완료되었습니다.";
                        resultBox.classList.remove("error");
                    }

                    alert("이메일 인증이 완료되었습니다.");
                    return;
                }

                joinEmailVerified = false;
                verifiedJoinEmail = "";

                if (resultBox !== null) {
                    resultBox.textContent = result;
                    resultBox.classList.add("error");
                }

                alert(result);
            })
            .catch(error => {
                console.error("인증코드 확인 실패:", error);

                joinEmailVerified = false;
                verifiedJoinEmail = "";

                if (resultBox !== null) {
                    resultBox.textContent = "인증코드 확인 중 오류가 발생했습니다.";
                    resultBox.classList.add("error");
                }

                alert("인증코드 확인 중 오류가 발생했습니다.");
            });
    });
}

// =========================
// 비밀번호 찾기
// =========================
function initFindPassword() {
    const findPasswordBtn = document.getElementById("findPasswordBtn");

    if (findPasswordBtn === null) {
        return;
    }

    findPasswordBtn.addEventListener("click", () => {
        const name = document.getElementById("findName").value.trim();
        const phone = document.getElementById("findPhone").value.trim();
        const email = document.getElementById("findEmail").value.trim();
        const resultBox = document.getElementById("findPasswordResult");

        if (name === "" || phone === "" || email === "") {
            alert("이름, 전화번호, 이메일을 모두 입력해주세요.");
            return;
        }

        const findData = {
            name: name,
            phone: phone,
            email: email
        };

        fetch("/member/find-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(findData)
        })
            .then(response => response.text())
            .then(result => {
                if (result === "temp password sent") {
                    resultBox.textContent = "임시 비밀번호가 이메일로 발송되었습니다. 로그인 후 마이페이지에서 비밀번호를 변경해주세요.";
                    resultBox.classList.remove("error");
                    alert("임시 비밀번호가 이메일로 발송되었습니다.");
                    return;
                }

                resultBox.textContent = result;
                resultBox.classList.add("error");
            })
            .catch(error => {
                console.error("비밀번호 찾기 실패:", error);
                alert("비밀번호 찾기 중 오류가 발생했습니다.");
            });
    });
}