// =========================
// 현재 로그인한 관리자 정보
// =========================
let currentAdminUser = null;

// =========================
// 페이지 로딩 시 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    checkAdminUser();
    initAnimeForm();
});

// =========================
// 관리자 권한 확인
// =========================
function checkAdminUser() {
    fetch("/member/me")
        .then(response => response.text())
        .then(text => {
            if (text === "" || text === "null") {
                alert("로그인 후 이용해주세요.");
                location.href = "/login.html";
                return;
            }

            const loginUser = JSON.parse(text);

            if (loginUser.role !== "ADMIN") {
                alert("관리자만 접근할 수 있습니다.");
                location.href = "/index.html";
                return;
            }

            currentAdminUser = loginUser;

            // 관리자 페이지 기본 화면은 애니 관리
            showAdminSection("anime");
        })
        .catch(error => {
            console.error("관리자 권한 확인 실패:", error);
            alert("관리자 정보를 확인하지 못했습니다.");
            location.href = "/index.html";
        });
}

// =========================
// 관리자 섹션 전환
// =========================
function showAdminSection(sectionName) {

    // 모든 섹션 숨김
    document.querySelectorAll(".admin-section").forEach(section => {
        section.classList.remove("active");
    });

    // 모든 탭 버튼 active 제거
    document.querySelectorAll(".admin-tab-btn").forEach(button => {
        button.classList.remove("active");
    });

    // 선택한 섹션 표시
    if (sectionName === "anime") {
        document.getElementById("adminAnimeSection").classList.add("active");
        document.querySelectorAll(".admin-tab-btn")[0].classList.add("active");
        loadAdminAnimeList();
    }

    if (sectionName === "member") {
        document.getElementById("adminMemberSection").classList.add("active");
        document.querySelectorAll(".admin-tab-btn")[1].classList.add("active");
        loadAdminMemberList();
    }

    if (sectionName === "review") {
        document.getElementById("adminReviewSection").classList.add("active");
        document.querySelectorAll(".admin-tab-btn")[2].classList.add("active");
        loadAdminReviewList();
    }

    if (sectionName === "comment") {
        document.getElementById("adminCommentSection").classList.add("active");
        document.querySelectorAll(".admin-tab-btn")[3].classList.add("active");
        loadAdminCommentList();
    }
}

// =========================
// 애니 등록 / 수정 폼 초기 설정
// =========================
function initAnimeForm() {
    const adminAnimeForm = document.getElementById("adminAnimeForm");

    adminAnimeForm.addEventListener("submit", event => {
        event.preventDefault();

        const animeId = document.getElementById("adminAnimeId").value;

        if (animeId === "") {
            insertAnime();
        } else {
            updateAnime(animeId);
        }
    });
}

// =========================
// 애니 목록 조회
// =========================
function loadAdminAnimeList() {
    fetch("/anime")
        .then(response => response.json())
        .then(animeList => {
            renderAdminAnimeList(animeList);
        })
        .catch(error => {
            console.error("애니 목록 조회 실패:", error);
        });
}

// =========================
// 애니 목록 출력
// =========================
function renderAdminAnimeList(animeList) {
    const adminAnimeList = document.getElementById("adminAnimeList");

    adminAnimeList.innerHTML = "";

    if (animeList.length === 0) {
        adminAnimeList.innerHTML = `
            <tr>
                <td colspan="6">등록된 애니가 없습니다.</td>
            </tr>
        `;
        return;
    }

    animeList.forEach(anime => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${anime.animeId}</td>

            <td>
                <img class="admin-thumb"
                     src="${anime.imagePath || 'https://placehold.co/80x100'}"
                     alt="${escapeHtml(anime.title)}">
            </td>

            <td>${escapeHtml(anime.title)}</td>
            <td>${genreIdToName(anime.genreId)}</td>
            <td>${escapeHtml(anime.studio)}</td>

            <td>
                <button class="admin-small-btn edit"
                        onclick="setAnimeUpdateForm(${anime.animeId})">
                    수정
                </button>

                <button class="admin-small-btn delete"
                        onclick="deleteAnime(${anime.animeId})">
                    삭제
                </button>
            </td>
        `;

        adminAnimeList.appendChild(tr);
    });
}

// =========================
// 애니 등록
// =========================
function insertAnime() {
    const anime = getAnimeFormData();

    if (anime === null) {
        return;
    }

    fetch("/anime", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(anime)
    })
        .then(response => response.text())
        .then(result => {
            if (result === "anime inserted") {
                alert("애니가 등록되었습니다.");
                resetAnimeForm();
                loadAdminAnimeList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("애니 등록 실패:", error);
            alert("애니 등록 중 오류가 발생했습니다.");
        });
}

// =========================
// 애니 수정 폼에 기존 데이터 넣기
// =========================
function setAnimeUpdateForm(animeId) {
    fetch(`/anime/${animeId}`)
        .then(response => response.json())
        .then(anime => {
            document.getElementById("adminAnimeId").value = anime.animeId;
            document.getElementById("adminAnimeTitle").value = anime.title;
            document.getElementById("adminAnimeGenreId").value = anime.genreId;
            document.getElementById("adminAnimeStudio").value = anime.studio;
            document.getElementById("adminAnimeImagePath").value = anime.imagePath;
            document.getElementById("adminAnimeDescription").value = anime.description;

            document.getElementById("adminAnimeSubmitBtn").textContent = "수정";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        })
        .catch(error => {
            console.error("애니 상세 조회 실패:", error);
            alert("애니 정보를 불러오지 못했습니다.");
        });
}

// =========================
// 애니 수정
// =========================
function updateAnime(animeId) {
    const anime = getAnimeFormData();

    if (anime === null) {
        return;
    }

    fetch(`/anime/${animeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(anime)
    })
        .then(response => response.text())
        .then(result => {
            if (result === "anime updated") {
                alert("애니가 수정되었습니다.");
                resetAnimeForm();
                loadAdminAnimeList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("애니 수정 실패:", error);
            alert("애니 수정 중 오류가 발생했습니다.");
        });
}

// =========================
// 애니 삭제
// =========================
function deleteAnime(animeId) {
    if (!confirm("정말 이 애니를 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/anime/${animeId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "anime deleted") {
                alert("애니가 삭제되었습니다.");
                loadAdminAnimeList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("애니 삭제 실패:", error);
            alert("애니 삭제 중 오류가 발생했습니다.");
        });
}

// =========================
// 애니 폼 데이터 가져오기
// =========================
function getAnimeFormData() {
    const title = document.getElementById("adminAnimeTitle").value.trim();
    const genreId = document.getElementById("adminAnimeGenreId").value;
    const studio = document.getElementById("adminAnimeStudio").value.trim();
    const imagePath = document.getElementById("adminAnimeImagePath").value.trim();
    const description = document.getElementById("adminAnimeDescription").value.trim();

    if (title === "") {
        alert("제목을 입력해주세요.");
        return null;
    }

    if (genreId === "") {
        alert("장르를 선택해주세요.");
        return null;
    }

    if (studio === "") {
        alert("제작사를 입력해주세요.");
        return null;
    }

    if (imagePath === "") {
        alert("이미지 경로를 입력해주세요.");
        return null;
    }

    if (description === "") {
        alert("줄거리를 입력해주세요.");
        return null;
    }

    return {
        title: title,
        genreId: Number(genreId),
        studio: studio,
        imagePath: imagePath,
        description: description
    };
}

// =========================
// 애니 입력 폼 초기화
// =========================
function resetAnimeForm() {
    document.getElementById("adminAnimeId").value = "";
    document.getElementById("adminAnimeTitle").value = "";
    document.getElementById("adminAnimeGenreId").value = "";
    document.getElementById("adminAnimeStudio").value = "";
    document.getElementById("adminAnimeImagePath").value = "";
    document.getElementById("adminAnimeDescription").value = "";

    document.getElementById("adminAnimeSubmitBtn").textContent = "등록";
}

// =========================
// 회원 목록 조회
// =========================
function loadAdminMemberList() {
    fetch("/member/list")
        .then(response => response.json())
        .then(memberList => {
            if (!Array.isArray(memberList)) {
                alert(memberList);
                return;
            }

            renderAdminMemberList(memberList);
        })
        .catch(error => {
            console.error("회원 목록 조회 실패:", error);
        });
}

// =========================
// 회원 목록 출력
// =========================
function renderAdminMemberList(memberList) {
    const adminMemberList = document.getElementById("adminMemberList");

    adminMemberList.innerHTML = "";

    if (memberList.length === 0) {
        adminMemberList.innerHTML = `
            <tr>
                <td colspan="6">가입한 회원이 없습니다.</td>
            </tr>
        `;
        return;
    }

    memberList.forEach(member => {
        const tr = document.createElement("tr");

        let deleteButton = `
            <button class="admin-small-btn delete"
                    onclick="deleteMember(${member.memberId})">
                삭제
            </button>
        `;

        if (currentAdminUser !== null && currentAdminUser.memberId === member.memberId) {
            deleteButton = `
                <span class="admin-me-label">현재 관리자</span>
            `;
        }

        tr.innerHTML = `
            <td>${member.memberId}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.phone)}</td>
            <td>${escapeHtml(member.role)}</td>
            <td>${deleteButton}</td>
        `;

        adminMemberList.appendChild(tr);
    });
}

// =========================
// 회원 삭제
// =========================
function deleteMember(memberId) {
    if (!confirm("정말 이 회원을 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/member/${memberId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "member deleted") {
                alert("회원이 삭제되었습니다.");
                loadAdminMemberList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("회원 삭제 실패:", error);
            alert("회원 삭제 중 오류가 발생했습니다.");
        });
}

// =========================
// 리뷰 목록 조회
// =========================
function loadAdminReviewList() {
    fetch("/review/list")
        .then(response => response.json())
        .then(reviewList => {
            if (!Array.isArray(reviewList)) {
                alert(reviewList);
                return;
            }

            renderAdminReviewList(reviewList);
        })
        .catch(error => {
            console.error("리뷰 목록 조회 실패:", error);
        });
}

// =========================
// 리뷰 목록 출력
// =========================
function renderAdminReviewList(reviewList) {
    const adminReviewList = document.getElementById("adminReviewList");

    adminReviewList.innerHTML = "";

    if (reviewList.length === 0) {
        adminReviewList.innerHTML = `
            <tr>
                <td colspan="7">작성된 리뷰가 없습니다.</td>
            </tr>
        `;
        return;
    }

    reviewList.forEach(review => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${review.reviewId}</td>
            <td>${review.animeId}</td>
            <td>${escapeHtml(review.writerName)}</td>
            <td>${ratingToStars(review.rating)}</td>
            <td class="admin-content-cell">${escapeHtml(review.content)}</td>
            <td>${formatDate(review.createdAt)}</td>

            <td>
                <button class="admin-small-btn delete"
                        onclick="deleteReview(${review.reviewId})">
                    삭제
                </button>
            </td>
        `;

        adminReviewList.appendChild(tr);
    });
}

// =========================
// 리뷰 삭제
// =========================
function deleteReview(reviewId) {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/review/${reviewId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "review deleted") {
                alert("리뷰가 삭제되었습니다.");
                loadAdminReviewList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("리뷰 삭제 실패:", error);
            alert("리뷰 삭제 중 오류가 발생했습니다.");
        });
}

// =========================
// 댓글 목록 조회
// =========================
function loadAdminCommentList() {
    fetch("/comment/list")
        .then(response => response.json())
        .then(commentList => {
            if (!Array.isArray(commentList)) {
                alert(commentList);
                return;
            }

            renderAdminCommentList(commentList);
        })
        .catch(error => {
            console.error("댓글 목록 조회 실패:", error);
        });
}

// =========================
// 댓글 목록 출력
// =========================
function renderAdminCommentList(commentList) {
    const adminCommentList = document.getElementById("adminCommentList");

    adminCommentList.innerHTML = "";

    if (commentList.length === 0) {
        adminCommentList.innerHTML = `
            <tr>
                <td colspan="6">작성된 댓글이 없습니다.</td>
            </tr>
        `;
        return;
    }

    commentList.forEach(comment => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${comment.commentId}</td>
            <td>${comment.reviewId}</td>
            <td>${escapeHtml(comment.writerName)}</td>
            <td class="admin-content-cell">${escapeHtml(comment.content)}</td>
            <td>${formatDate(comment.createdAt)}</td>

            <td>
                <button class="admin-small-btn delete"
                        onclick="deleteComment(${comment.commentId})">
                    삭제
                </button>
            </td>
        `;

        adminCommentList.appendChild(tr);
    });
}

// =========================
// 댓글 삭제
// =========================
function deleteComment(commentId) {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/comment/${commentId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "comment deleted") {
                alert("댓글이 삭제되었습니다.");
                loadAdminCommentList();
            } else {
                alert(result);
            }
        })
        .catch(error => {
            console.error("댓글 삭제 실패:", error);
            alert("댓글 삭제 중 오류가 발생했습니다.");
        });
}

// =========================
// 별점 표시
// =========================
function ratingToStars(rating) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += "★";
        } else {
            stars += "☆";
        }
    }

    return stars;
}

// =========================
// 날짜 포맷
// =========================
function formatDate(dateText) {
    if (!dateText) {
        return "-";
    }

    return dateText.substring(0, 10);
}

// =========================
// 장르명 변환
// =========================
function genreIdToName(genreId) {
    genreId = Number(genreId);

    if (genreId === 1) {
        return "액션";
    }

    if (genreId === 2) {
        return "판타지";
    }

    if (genreId === 3) {
        return "코미디";
    }

    return "기타";
}

// =========================
// HTML 태그 입력 방지
// =========================
function escapeHtml(text) {
    if (!text) {
        return "";
    }

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}