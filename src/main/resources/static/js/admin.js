// =========================
// 현재 로그인한 관리자 정보
// =========================
let currentAdminUser = null;

// =========================
// 관리자 목록 데이터
// =========================
let adminAnimeData = [];
let adminMemberData = [];
let adminReviewData = [];
let adminCommentData = [];
// =========================
// 관리자 검색어
// =========================
let adminMemberSearchKeyword = "";
let adminReviewSearchKeyword = "";
let adminCommentSearchKeyword = "";

// =========================
// 관리자 페이지 번호
// =========================
let adminAnimePage = 1;
let adminMemberPage = 1;
let adminReviewPage = 1;
let adminCommentPage = 1;

// =========================
// 관리자 페이지당 출력 개수
// =========================
const adminPageSize = 10;

// =========================
// 페이지 로딩 시 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    checkAdminUser();
    initAnimeForm();
    initMemberSearch();
    initReviewSearch();
    initCommentSearch();
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
// 회원 검색 초기 설정
// =========================
function initMemberSearch() {
    const adminMemberSearchInput = document.getElementById("adminMemberSearchInput");

    if (adminMemberSearchInput === null) {
        return;
    }

    adminMemberSearchInput.addEventListener("input", () => {
        adminMemberSearchKeyword = adminMemberSearchInput.value.trim().toLowerCase();
        adminMemberPage = 1;

        renderAdminMemberList();
    });
}

// =========================
// 리뷰 검색 초기 설정
// =========================
function initReviewSearch() {
    const adminReviewSearchInput = document.getElementById("adminReviewSearchInput");

    if (adminReviewSearchInput === null) {
        return;
    }

    adminReviewSearchInput.addEventListener("input", () => {
        adminReviewSearchKeyword = adminReviewSearchInput.value.trim().toLowerCase();
        adminReviewPage = 1;

        renderAdminReviewList();
    });
}

// =========================
// 댓글 검색 초기 설정
// =========================
function initCommentSearch() {
    const adminCommentSearchInput = document.getElementById("adminCommentSearchInput");

    if (adminCommentSearchInput === null) {
        return;
    }

    adminCommentSearchInput.addEventListener("input", () => {
        adminCommentSearchKeyword = adminCommentSearchInput.value.trim().toLowerCase();
        adminCommentPage = 1;

        renderAdminCommentList();
    });
}

// =========================
// 애니 목록 조회
// =========================
function loadAdminAnimeList() {
    fetch("/anime")
        .then(response => response.json())
        .then(animeList => {
            adminAnimeData = animeList;
            adminAnimePage = 1;

            renderAdminAnimeList();
        })
        .catch(error => {
            console.error("애니 목록 조회 실패:", error);
        });
}

// =========================
// 애니 목록 출력
// =========================
function renderAdminAnimeList() {
    const adminAnimeList = document.getElementById("adminAnimeList");

    adminAnimeList.innerHTML = "";

    if (adminAnimeData.length === 0) {
        adminAnimeList.innerHTML = `
            <tr>
                <td colspan="6">등록된 애니가 없습니다.</td>
            </tr>
        `;

        renderAdminPagination(
            adminAnimeData.length,
            adminPageSize,
            adminAnimePage,
            "adminAnimePagination",
            page => {
                adminAnimePage = page;
                renderAdminAnimeList();
            }
        );

        return;
    }

    const pageAnimeList = getPageItems(
        adminAnimeData,
        adminAnimePage,
        adminPageSize
    );

    pageAnimeList.forEach((anime, index) => {
        const tr = document.createElement("tr");
        const rowNumber = getRowNumber(adminAnimePage, index);

        tr.innerHTML = `
            <td class="col-no">${rowNumber}</td>

            <td class="col-image">
                <img class="admin-thumb"
                     src="${anime.imagePath || 'https://placehold.co/80x100'}"
                     alt="${escapeHtml(anime.title)}">
            </td>

            <td class="col-title">${escapeHtml(anime.title)}</td>
            <td class="col-genre">${genreIdToName(anime.genreId)}</td>
            <td class="col-studio">${escapeHtml(anime.studio)}</td>

            <td class="col-action">
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

    renderAdminPagination(
        adminAnimeData.length,
        adminPageSize,
        adminAnimePage,
        "adminAnimePagination",
        page => {
            adminAnimePage = page;
            renderAdminAnimeList();
            scrollToAdminSection("adminAnimeList");
        }
    );
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

            adminMemberData = memberList;
            adminMemberPage = 1;

            renderAdminMemberList();
        })
        .catch(error => {
            console.error("회원 목록 조회 실패:", error);
        });
}

// =========================
// 회원 목록 출력
// =========================
function renderAdminMemberList() {
    const adminMemberList = document.getElementById("adminMemberList");

    adminMemberList.innerHTML = "";

    const filteredMemberList = getFilteredMemberList();

    if (filteredMemberList.length === 0) {
        adminMemberList.innerHTML = `
            <tr>
                <td colspan="6">검색 결과가 없습니다.</td>
            </tr>
        `;

        renderAdminPagination(
            filteredMemberList.length,
            adminPageSize,
            adminMemberPage,
            "adminMemberPagination",
            page => {
                adminMemberPage = page;
                renderAdminMemberList();
            }
        );

        return;
    }

    const pageMemberList = getPageItems(
        filteredMemberList,
        adminMemberPage,
        adminPageSize
    );

    pageMemberList.forEach((member, index) => {
        const tr = document.createElement("tr");
        const rowNumber = getRowNumber(adminMemberPage, index);

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
            <td class="col-no">${rowNumber}</td>
            <td class="col-name">${escapeHtml(member.name)}</td>
            <td class="col-email">${escapeHtml(member.email)}</td>
            <td class="col-phone">${escapeHtml(member.phone)}</td>
            <td class="col-role">${escapeHtml(member.role)}</td>
            <td class="col-action">${deleteButton}</td>
        `;

        adminMemberList.appendChild(tr);
    });

    renderAdminPagination(
        filteredMemberList.length,
        adminPageSize,
        adminMemberPage,
        "adminMemberPagination",
        page => {
            adminMemberPage = page;
            renderAdminMemberList();
            scrollToAdminSection("adminMemberList");
        }
    );
}

// =========================
// 회원 검색 필터
// =========================
function getFilteredMemberList() {
    if (adminMemberSearchKeyword === "") {
        return adminMemberData;
    }

    return adminMemberData.filter(member => {
        const name = String(member.name || "").toLowerCase();
        const email = String(member.email || "").toLowerCase();
        const phone = String(member.phone || "").toLowerCase();

        return name.includes(adminMemberSearchKeyword)
            || email.includes(adminMemberSearchKeyword)
            || phone.includes(adminMemberSearchKeyword);
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

            adminReviewData = reviewList;
            adminReviewPage = 1;

            renderAdminReviewList();
        })
        .catch(error => {
            console.error("리뷰 목록 조회 실패:", error);
        });
}

// =========================
// 리뷰 목록 출력
// =========================
function renderAdminReviewList() {
    const adminReviewList = document.getElementById("adminReviewList");

    adminReviewList.innerHTML = "";

    const filteredReviewList = getFilteredReviewList();

    if (filteredReviewList.length === 0) {
        adminReviewList.innerHTML = `
            <tr>
                <td colspan="6">검색 결과가 없습니다.</td>
            </tr>
        `;

        renderAdminPagination(
            filteredReviewList.length,
            adminPageSize,
            adminReviewPage,
            "adminReviewPagination",
            page => {
                adminReviewPage = page;
                renderAdminReviewList();
            }
        );

        return;
    }

    const pageReviewList = getPageItems(
        filteredReviewList,
        adminReviewPage,
        adminPageSize
    );

    pageReviewList.forEach((review, index) => {
        const tr = document.createElement("tr");
        const rowNumber = getRowNumber(adminReviewPage, index);

        tr.innerHTML = `
            <td class="col-no">${rowNumber}</td>
            <td class="col-writer">${escapeHtml(review.writerName)}</td>
            <td class="col-rating">${ratingToStars(review.rating)}</td>
            <td class="col-content admin-content-cell">${escapeHtml(review.content)}</td>
            <td class="col-date">${formatDate(review.createdAt)}</td>

            <td class="col-action">
                <button class="admin-small-btn delete"
                        onclick="deleteReview(${review.reviewId})">
                    삭제
                </button>
            </td>
        `;

        adminReviewList.appendChild(tr);
    });

    renderAdminPagination(
        filteredReviewList.length,
        adminPageSize,
        adminReviewPage,
        "adminReviewPagination",
        page => {
            adminReviewPage = page;
            renderAdminReviewList();
            scrollToAdminSection("adminReviewList");
        }
    );
}

// =========================
// 리뷰 검색 필터
// =========================
function getFilteredReviewList() {
    if (adminReviewSearchKeyword === "") {
        return adminReviewData;
    }

    return adminReviewData.filter(review => {
        const writerName = String(review.writerName || "").toLowerCase();
        const content = String(review.content || "").toLowerCase();

        return writerName.includes(adminReviewSearchKeyword)
            || content.includes(adminReviewSearchKeyword);
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

            adminCommentData = commentList;
            adminCommentPage = 1;

            renderAdminCommentList();
        })
        .catch(error => {
            console.error("댓글 목록 조회 실패:", error);
        });
}

// =========================
// 댓글 목록 출력
// =========================
function renderAdminCommentList() {
    const adminCommentList = document.getElementById("adminCommentList");

    adminCommentList.innerHTML = "";

    const filteredCommentList = getFilteredCommentList();

    if (filteredCommentList.length === 0) {
        adminCommentList.innerHTML = `
            <tr>
                <td colspan="5">검색 결과가 없습니다.</td>
            </tr>
        `;

        renderAdminPagination(
            filteredCommentList.length,
            adminPageSize,
            adminCommentPage,
            "adminCommentPagination",
            page => {
                adminCommentPage = page;
                renderAdminCommentList();
            }
        );

        return;
    }

    const pageCommentList = getPageItems(
        filteredCommentList,
        adminCommentPage,
        adminPageSize
    );

    pageCommentList.forEach((comment, index) => {
        const tr = document.createElement("tr");
        const rowNumber = getRowNumber(adminCommentPage, index);

        tr.innerHTML = `
            <td class="col-no">${rowNumber}</td>
            <td class="col-writer">${escapeHtml(comment.writerName)}</td>
            <td class="col-content admin-content-cell">${escapeHtml(comment.content)}</td>
            <td class="col-date">${formatDate(comment.createdAt)}</td>

            <td class="col-action">
                <button class="admin-small-btn delete"
                        onclick="deleteComment(${comment.commentId})">
                    삭제
                </button>
            </td>
        `;

        adminCommentList.appendChild(tr);
    });

    renderAdminPagination(
        filteredCommentList.length,
        adminPageSize,
        adminCommentPage,
        "adminCommentPagination",
        page => {
            adminCommentPage = page;
            renderAdminCommentList();
            scrollToAdminSection("adminCommentList");
        }
    );
}

// =========================
// 댓글 검색 필터
// =========================
function getFilteredCommentList() {
    if (adminCommentSearchKeyword === "") {
        return adminCommentData;
    }

    return adminCommentData.filter(comment => {
        const writerName = String(comment.writerName || "").toLowerCase();
        const content = String(comment.content || "").toLowerCase();

        return writerName.includes(adminCommentSearchKeyword)
            || content.includes(adminCommentSearchKeyword);
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
// 페이지에 맞는 데이터 자르기
// =========================
function getPageItems(list, currentPage, pageSize) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return list.slice(startIndex, endIndex);
}

// =========================
// 현재 페이지 기준 행 번호 계산
// =========================
function getRowNumber(currentPage, index) {
    return (currentPage - 1) * adminPageSize + index + 1;
}

// =========================
// 관리자 페이지 버튼 출력
// =========================
function renderAdminPagination(totalCount, pageSize, currentPage, paginationId, onPageChange) {
    const pagination = document.getElementById(paginationId);

    if (pagination === null) {
        return;
    }

    pagination.innerHTML = "";

    const totalPage = Math.ceil(totalCount / pageSize);

    if (totalPage <= 1) {
        return;
    }

    // 이전 버튼
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.textContent = "이전";
    prevBtn.disabled = currentPage === 1;

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    pagination.appendChild(prevBtn);

    // 숫자 버튼
    for (let i = 1; i <= totalPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "page-btn";
        pageBtn.textContent = i;

        if (i === currentPage) {
            pageBtn.classList.add("active");
        }

        pageBtn.onclick = () => {
            onPageChange(i);
        };

        pagination.appendChild(pageBtn);
    }

    // 다음 버튼
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.textContent = "다음";
    nextBtn.disabled = currentPage === totalPage;

    nextBtn.onclick = () => {
        if (currentPage < totalPage) {
            onPageChange(currentPage + 1);
        }
    };

    pagination.appendChild(nextBtn);
}

// =========================
// 페이지 이동 시 해당 목록으로 스크롤
// =========================
function scrollToAdminSection(elementId) {
    const target = document.getElementById(elementId);

    if (target !== null) {
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
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