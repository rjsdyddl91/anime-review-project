// =========================
// 마이페이지 페이징 변수
// =========================
let myBookmarkData = [];
let myReviewData = [];
let myCommentData = [];

let myBookmarkPage = 1;
let myReviewPage = 1;
let myCommentPage = 1;

const myBookmarkPageSize = 4;
const myReviewPageSize = 5;
const myCommentPageSize = 5;

// =========================
// 비동기 출력 충돌 방지용 번호
// =========================
let bookmarkRenderToken = 0;
let reviewRenderToken = 0;

// =========================
// 페이지 로딩 시 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    loadMyPage();
    initChangePassword();
});

// =========================
// 마이페이지 전체 조회
// =========================
function loadMyPage() {
    fetch("/member/me")
        .then(response => response.text())
        .then(text => {
            if (text === "" || text === "null") {
                alert("ログイン後にご利用ください。");
                location.href = "/login.html";
                return;
            }

            const member = JSON.parse(text);

            renderMyProfile(member);
            loadMyBookmarks();
            loadMyReviews();
            loadMyComments();
        })
        .catch(error => {
            console.error("마이페이지 조회 실패:", error);
            alert("マイページ情報を読み込めませんでした。");
        });
}

// =========================
// 내 정보 출력
// =========================
function renderMyProfile(member) {
    const myProfile = document.getElementById("myProfile");

    myProfile.innerHTML = `
        <div class="profile-row">
            <span>名前</span>
            <strong>${escapeHtml(member.name)}</strong>
        </div>

        <div class="profile-row">
            <span>メールアドレス</span>
            <strong>${escapeHtml(member.email)}</strong>
        </div>

        <div class="profile-row">
            <span>電話番号</span>
            <strong>${escapeHtml(member.phone)}</strong>
        </div>

        <div class="profile-row">
            <span>権限</span>
            <strong>${escapeHtml(member.role)}</strong>
        </div>
    `;
}

// =========================
// 내 북마크 조회
// =========================
function loadMyBookmarks() {
    fetch("/bookmark/my")
        .then(response => response.json())
        .then(bookmarkList => {
            myBookmarkData = bookmarkList;
            myBookmarkPage = 1;

            document.getElementById("myBookmarkCount").textContent =
                `${bookmarkList.length}件`;

            renderMyBookmarks();
        })
        .catch(error => {
            console.error("내 북마크 조회 실패:", error);
        });
}

// =========================
// 내 북마크 출력
// =========================
function renderMyBookmarks() {
    const myBookmarkList = document.getElementById("myBookmarkList");

    myBookmarkList.innerHTML = "";

    bookmarkRenderToken++;
    const currentToken = bookmarkRenderToken;

    if (myBookmarkData.length === 0) {
        myBookmarkList.innerHTML = `
            <div class="mypage-empty">
                ブックマークしたアニメがありません。
            </div>
        `;

        renderPagination(
            myBookmarkData.length,
            myBookmarkPageSize,
            myBookmarkPage,
            "myBookmarkPagination",
            page => {
                myBookmarkPage = page;
                renderMyBookmarks();
            }
        );

        return;
    }

    const pageBookmarkList = getPageItems(
        myBookmarkData,
        myBookmarkPage,
        myBookmarkPageSize
    );

    pageBookmarkList.forEach(bookmark => {
        fetch(`/anime/${bookmark.animeId}`)
            .then(response => response.json())
            .then(anime => {
                if (currentToken !== bookmarkRenderToken) {
                    return;
                }

                const card = document.createElement("div");
                card.className = "mypage-anime-card";

                card.onclick = () => {
                    location.href = `/detail.html?animeId=${anime.animeId}`;
                };

                card.innerHTML = `
                    <img src="${anime.imagePath || 'https://placehold.co/180x250'}"
                         alt="${escapeHtml(anime.title)}">

                    <div class="mypage-anime-info">
                        <div class="mypage-anime-title">
                            ${escapeHtml(anime.title)}
                        </div>

                        <div class="mypage-anime-studio">
                            ${escapeHtml(anime.studio)}
                        </div>
                    </div>
                `;

                myBookmarkList.appendChild(card);
            })
            .catch(error => {
                console.error("북마크 애니 정보 조회 실패:", error);
            });
    });

    renderPagination(
        myBookmarkData.length,
        myBookmarkPageSize,
        myBookmarkPage,
        "myBookmarkPagination",
        page => {
            myBookmarkPage = page;
            renderMyBookmarks();
            scrollToMyPageSection("myBookmarkList");
        }
    );
}

// =========================
// 내 리뷰 조회
// =========================
function loadMyReviews() {
    fetch("/review/my")
        .then(response => response.json())
        .then(reviewList => {
            myReviewData = reviewList;
            myReviewPage = 1;

            document.getElementById("myReviewCount").textContent =
                `${reviewList.length}件`;

            renderMyReviews();
        })
        .catch(error => {
            console.error("내 리뷰 조회 실패:", error);
        });
}

// =========================
// 내 리뷰 출력
// =========================
function renderMyReviews() {
    const myReviewList = document.getElementById("myReviewList");

    myReviewList.innerHTML = "";

    reviewRenderToken++;
    const currentToken = reviewRenderToken;

    if (myReviewData.length === 0) {
        myReviewList.innerHTML = `
            <div class="mypage-empty">
                投稿したレビューがありません。
            </div>
        `;

        renderPagination(
            myReviewData.length,
            myReviewPageSize,
            myReviewPage,
            "myReviewPagination",
            page => {
                myReviewPage = page;
                renderMyReviews();
            }
        );

        return;
    }

    const pageReviewList = getPageItems(
        myReviewData,
        myReviewPage,
        myReviewPageSize
    );

    pageReviewList.forEach(review => {
        fetch(`/anime/${review.animeId}`)
            .then(response => response.json())
            .then(anime => {
                if (currentToken !== reviewRenderToken) {
                    return;
                }

                const item = document.createElement("div");
                item.className = "mypage-list-item";

                item.onclick = () => {
                    location.href = `/detail.html?animeId=${anime.animeId}`;
                };

                item.innerHTML = `
                    <div class="mypage-item-top">
                        <strong>${escapeHtml(anime.title)}</strong>
                        <span>${formatDate(review.createdAt)}</span>
                    </div>

                    <div class="mypage-rating">
                        ${ratingToStars(review.rating)}
                    </div>

                    <div class="mypage-content">
                        ${escapeHtml(review.content)}
                    </div>
                `;

                myReviewList.appendChild(item);
            })
            .catch(error => {
                console.error("리뷰 애니 정보 조회 실패:", error);
            });
    });

    renderPagination(
        myReviewData.length,
        myReviewPageSize,
        myReviewPage,
        "myReviewPagination",
        page => {
            myReviewPage = page;
            renderMyReviews();
            scrollToMyPageSection("myReviewList");
        }
    );
}

// =========================
// 내 댓글 조회
// =========================
function loadMyComments() {
    fetch("/comment/my")
        .then(response => response.json())
        .then(commentList => {
            myCommentData = commentList;
            myCommentPage = 1;

            document.getElementById("myCommentCount").textContent =
                `${commentList.length}件`;

            renderMyComments();
        })
        .catch(error => {
            console.error("내 댓글 조회 실패:", error);
        });
}

// =========================
// 내 댓글 출력
// =========================
function renderMyComments() {
    const myCommentList = document.getElementById("myCommentList");

    myCommentList.innerHTML = "";

    if (myCommentData.length === 0) {
        myCommentList.innerHTML = `
            <div class="mypage-empty">
                投稿したコメントがありません。
            </div>
        `;

        renderPagination(
            myCommentData.length,
            myCommentPageSize,
            myCommentPage,
            "myCommentPagination",
            page => {
                myCommentPage = page;
                renderMyComments();
            }
        );

        return;
    }

    const pageCommentList = getPageItems(
        myCommentData,
        myCommentPage,
        myCommentPageSize
    );

    pageCommentList.forEach(comment => {
        const item = document.createElement("div");
        item.className = "mypage-list-item mypage-comment-item";

        item.innerHTML = `
            <div class="mypage-item-top">
                <strong>自分のコメント</strong>
                <span>${formatDate(comment.createdAt)}</span>
            </div>

            <div class="mypage-content">
                ${escapeHtml(comment.content)}
            </div>
        `;

        myCommentList.appendChild(item);
    });

    renderPagination(
        myCommentData.length,
        myCommentPageSize,
        myCommentPage,
        "myCommentPagination",
        page => {
            myCommentPage = page;
            renderMyComments();
            scrollToMyPageSection("myCommentList");
        }
    );
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
// 페이지 버튼 출력
// =========================
function renderPagination(totalCount, pageSize, currentPage, paginationId, onPageChange) {
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
    prevBtn.textContent = "前へ";
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
    nextBtn.textContent = "次へ";
    nextBtn.disabled = currentPage === totalPage;

    nextBtn.onclick = () => {
        if (currentPage < totalPage) {
            onPageChange(currentPage + 1);
        }
    };

    pagination.appendChild(nextBtn);
}

// =========================
// 페이지 이동 시 해당 영역으로 스크롤
// =========================
function scrollToMyPageSection(elementId) {
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
// 비밀번호 변경
// =========================
function initChangePassword() {
    const changePasswordBtn = document.getElementById("changePasswordBtn");

    if (changePasswordBtn === null) {
        return;
    }

    changePasswordBtn.addEventListener("click", () => {
        const currentPassword = document.getElementById("currentPassword").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const newPasswordCheck = document.getElementById("newPasswordCheck").value.trim();
        const resultBox = document.getElementById("passwordChangeResult");

        if (currentPassword === "" || newPassword === "" || newPasswordCheck === "") {
            alert("パスワードをすべて入力してください。");
            return;
        }

        if (newPassword !== newPasswordCheck) {
            alert("新しいパスワードが一致しません。");
            return;
        }

        fetch("/member/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword,
                newPasswordCheck: newPasswordCheck
            })
        })
            .then(response => response.text())
            .then(result => {
                if (result === "password changed") {
                    alert("パスワードが変更されました。");

                    document.getElementById("currentPassword").value = "";
                    document.getElementById("newPassword").value = "";
                    document.getElementById("newPasswordCheck").value = "";

                    if (resultBox !== null) {
                        resultBox.textContent = "パスワードが変更されました。";
                        resultBox.classList.remove("error");
                    }

                    return;
                }

                if (resultBox !== null) {
                    resultBox.textContent = result;
                    resultBox.classList.add("error");
                }

                alert(result);
            })
            .catch(error => {
                console.error("비밀번호 변경 실패:", error);
                alert("パスワード変更中にエラーが発生しました。");
            });
    });
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