// =========================
// 페이지 로딩 시 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    loadMyPage();
});

// =========================
// 마이페이지 전체 조회
// =========================
function loadMyPage() {
    fetch("/member/me")
        .then(response => response.text())
        .then(text => {
            if (text === "" || text === "null") {
                alert("로그인 후 이용해주세요.");
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
            alert("마이페이지 정보를 불러오지 못했습니다.");
        });
}

// =========================
// 내 정보 출력
// =========================
function renderMyProfile(member) {
    const myProfile = document.getElementById("myProfile");

    myProfile.innerHTML = `
        <div class="profile-row">
            <span>이름</span>
            <strong>${escapeHtml(member.name)}</strong>
        </div>

        <div class="profile-row">
            <span>이메일</span>
            <strong>${escapeHtml(member.email)}</strong>
        </div>

        <div class="profile-row">
            <span>전화번호</span>
            <strong>${escapeHtml(member.phone)}</strong>
        </div>

        <div class="profile-row">
            <span>권한</span>
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
            document.getElementById("myBookmarkCount").textContent =
                `${bookmarkList.length}개`;

            renderMyBookmarks(bookmarkList);
        })
        .catch(error => {
            console.error("내 북마크 조회 실패:", error);
        });
}

// =========================
// 내 북마크 출력
// =========================
function renderMyBookmarks(bookmarkList) {
    const myBookmarkList = document.getElementById("myBookmarkList");

    myBookmarkList.innerHTML = "";

    if (bookmarkList.length === 0) {
        myBookmarkList.innerHTML = `
            <div class="mypage-empty">
                북마크한 애니가 없습니다.
            </div>
        `;
        return;
    }

    bookmarkList.forEach(bookmark => {
        fetch(`/anime/${bookmark.animeId}`)
            .then(response => response.json())
            .then(anime => {
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
}

// =========================
// 내 리뷰 조회
// =========================
function loadMyReviews() {
    fetch("/review/my")
        .then(response => response.json())
        .then(reviewList => {
            document.getElementById("myReviewCount").textContent =
                `${reviewList.length}개`;

            renderMyReviews(reviewList);
        })
        .catch(error => {
            console.error("내 리뷰 조회 실패:", error);
        });
}

// =========================
// 내 리뷰 출력
// =========================
function renderMyReviews(reviewList) {
    const myReviewList = document.getElementById("myReviewList");

    myReviewList.innerHTML = "";

    if (reviewList.length === 0) {
        myReviewList.innerHTML = `
            <div class="mypage-empty">
                작성한 리뷰가 없습니다.
            </div>
        `;
        return;
    }

    reviewList.forEach(review => {
        fetch(`/anime/${review.animeId}`)
            .then(response => response.json())
            .then(anime => {
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
}

// =========================
// 내 댓글 조회
// =========================
function loadMyComments() {
    fetch("/comment/my")
        .then(response => response.json())
        .then(commentList => {
            document.getElementById("myCommentCount").textContent =
                `${commentList.length}개`;

            renderMyComments(commentList);
        })
        .catch(error => {
            console.error("내 댓글 조회 실패:", error);
        });
}

// =========================
// 내 댓글 출력
// =========================
function renderMyComments(commentList) {
    const myCommentList = document.getElementById("myCommentList");

    myCommentList.innerHTML = "";

    if (commentList.length === 0) {
        myCommentList.innerHTML = `
            <div class="mypage-empty">
                작성한 댓글이 없습니다.
            </div>
        `;
        return;
    }

    commentList.forEach(comment => {
        const item = document.createElement("div");
        item.className = "mypage-list-item mypage-comment-item";

        item.innerHTML = `
            <div class="mypage-item-top">
                <strong>내 댓글</strong>
                <span>${formatDate(comment.createdAt)}</span>
            </div>

            <div class="mypage-content">
                ${escapeHtml(comment.content)}
            </div>
        `;

        myCommentList.appendChild(item);
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