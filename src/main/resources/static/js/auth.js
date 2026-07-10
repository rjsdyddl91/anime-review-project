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
            alert("メールアドレスとパスワードを入力してください。");
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
                    alert("ログインしました。");
                    location.href = "/index.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("로그인 실패:", error);
                alert("ログイン中にエラーが発生しました。");
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
            alert("すべての項目を入力してください。");
            return;
        }

        if (!joinEmailVerified || verifiedJoinEmail !== email) {
            alert("メール認証を完了してください。");
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
                    alert("会員登録が完了しました。");
                    location.href = "/login.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("회원가입 실패:", error);
                alert("会員登録中にエラーが発生しました。");
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
        alert("メールアドレスを入力してください。");
        return;
    }

    joinEmailVerified = false;
    verifiedJoinEmail = "";

    if (resultBox !== null) {
        resultBox.textContent = "認証コードを送信中です...";
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
                    resultBox.textContent = "認証コードがメールで送信されました。";
                    resultBox.classList.remove("error");
                }

                alert("認証コードを送信しました。");
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
                resultBox.textContent = "認証コードの送信中にエラーが発生しました。";
                resultBox.classList.add("error");
            }

            alert("認証コードの送信中にエラーが発生しました。");
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
            alert("メールアドレスを入力してください。");
            return;
        }

        if (authCode === "") {
            alert("認証コードを入力してください。");
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
                        resultBox.textContent = "メール認証が完了しました。";
                        resultBox.classList.remove("error");
                    }

                    alert("メール認証が完了しました。");
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
                    resultBox.textContent = "認証コードの確認中にエラーが発生しました。";
                    resultBox.classList.add("error");
                }

                alert("認証コードの確認中にエラーが発生しました。");
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
            alert("名前、電話番号、メールアドレスをすべて入力してください。");
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
                    resultBox.textContent = "仮パスワードがメールで送信されました。ログイン後、マイページでパスワードを変更してください。";
                    resultBox.classList.remove("error");
                    alert("仮パスワードがメールで送信されました。");
                    return;
                }

                resultBox.textContent = result;
                resultBox.classList.add("error");
            })
            .catch(error => {
                console.error("비밀번호 찾기 실패:", error);
                alert("パスワード確認中にエラーが発生しました。");
            });
    });
}