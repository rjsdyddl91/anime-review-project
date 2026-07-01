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

    if (joinBtn === null) {
        return;
    }

    joinBtn.addEventListener("click", () => {
        const name = document.getElementById("joinName").value.trim();
        const phone = document.getElementById("joinPhone").value.trim();
        const email = document.getElementById("joinEmail").value.trim();
        const password = document.getElementById("joinPassword").value.trim();

        if (name === "" || phone === "" || email === "" || password === "") {
            alert("모든 항목을 입력해주세요.");
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
                if (result === "회원 정보를 찾을 수 없습니다.") {
                    resultBox.textContent = result;
                    resultBox.classList.add("error");
                    return;
                }

                resultBox.textContent = "비밀번호: " + result;
                resultBox.classList.remove("error");
            })
            .catch(error => {
                console.error("비밀번호 찾기 실패:", error);
                alert("비밀번호 찾기 중 오류가 발생했습니다.");
            });
    });
}