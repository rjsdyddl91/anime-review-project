let currentAnimeId = null;
let selectedRating = 5;

// =========================
// 본편 회차 관련 변수
// =========================
let episodeList = [];
let currentEpisodePage = 1;
let selectedEpisodeId = null;
const EPISODES_PER_PAGE = 10;

// =========================
// 페이지 로딩 시 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    currentAnimeId = getAnimeIdFromUrl();

    if (currentAnimeId === null) {
        alert("잘못된 접근입니다.");
        location.href = "/index.html";
        return;
    }

    loadAnimeDetail(currentAnimeId);
    loadEpisodeList(currentAnimeId);
    loadReviewList(currentAnimeId);
    loadBookmarkStatus();

    initStarRating();
    initReviewSubmit();
    initBookmark();
});

// =========================
// URL에서 animeId 가져오기
// =========================
function getAnimeIdFromUrl() {
    const params = new URLSearchParams(location.search);
    const animeId = params.get("animeId");

    if (animeId === null || animeId.trim() === "") {
        return null;
    }

    return animeId;
}

// =========================
// 애니 상세 조회
// =========================
function loadAnimeDetail(animeId) {
    fetch(`/anime/${animeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(anime => {
            console.log("애니 상세:", anime);
            renderAnimeDetail(anime);
        })
        .catch(error => {
            console.error("애니 상세 불러오기 실패:", error);
            alert("애니 정보를 불러오지 못했습니다.");
            location.href = "/index.html";
        });
}

// =========================
// 상세 화면 출력
// =========================
function renderAnimeDetail(anime) {
    document.getElementById("detailImage").src =
        anime.imagePath || "https://placehold.co/350x500";

    document.getElementById("detailImage").alt = anime.title;
    document.getElementById("detailGenre").textContent = genreIdToName(anime.genreId);
    document.getElementById("detailTitle").textContent = anime.title;
    document.getElementById("detailStudio").textContent = anime.studio;
    document.getElementById("detailDescription").textContent = anime.description;
    document.getElementById("detailCreatedAt").textContent = formatDate(anime.createdAt);

    const detailRating = document.getElementById("detailRating");

    if (detailRating !== null) {
        detailRating.textContent = getAnimeRatingText(anime);
    }
}

// =========================
// 본편 회차 목록 조회
// =========================
function loadEpisodeList(animeId) {
    fetch(`/api/episodes/anime/${animeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(list => {
            console.log("본편 회차 목록:", list);

            episodeList = list || [];
            currentEpisodePage = 1;
            selectedEpisodeId = null;

            renderEpisodeSection();
        })
        .catch(error => {
            console.error("본편 회차 목록 불러오기 실패:", error);

            const episodeSection = document.getElementById("episodeSection");

            if (episodeSection !== null) {
                episodeSection.style.display = "none";
            }
        });
}

// =========================
// 본편 영역 출력
// =========================
function renderEpisodeSection() {
    const episodeSection = document.getElementById("episodeSection");
    const episodeCount = document.getElementById("episodeCount");
    const episodePlayerBox = document.getElementById("episodePlayerBox");
    const episodeFrame = document.getElementById("episodeFrame");

    if (episodeSection === null) {
        return;
    }

    if (episodeList.length === 0) {
        episodeSection.style.display = "none";

        if (episodePlayerBox !== null) {
            episodePlayerBox.style.display = "none";
        }

        if (episodeFrame !== null) {
            episodeFrame.src = "";
        }

        return;
    }

    episodeSection.style.display = "block";

    if (episodeCount !== null) {
        episodeCount.textContent = `${episodeList.length}화`;
    }

    if (selectedEpisodeId === null) {
        selectedEpisodeId = episodeList[0].episodeId;
        updateEpisodePlayer(episodeList[0]);
    }

    renderEpisodeList();
    renderEpisodePagination();
}

// =========================
// 본편 회차 목록 출력
// =========================
function renderEpisodeList() {
    const episodeListBox = document.getElementById("episodeList");

    if (episodeListBox === null) {
        return;
    }

    episodeListBox.innerHTML = "";

    const startIndex = (currentEpisodePage - 1) * EPISODES_PER_PAGE;
    const endIndex = startIndex + EPISODES_PER_PAGE;
    const pageEpisodeList = episodeList.slice(startIndex, endIndex);

    pageEpisodeList.forEach(episode => {
        const episodeItem = document.createElement("div");
        episodeItem.className = "episode-item";

        if (Number(selectedEpisodeId) === Number(episode.episodeId)) {
            episodeItem.classList.add("active");
        }

        episodeItem.addEventListener("click", () => {
            selectEpisode(episode.episodeId);
        });

        episodeItem.innerHTML = `
            <span class="episode-number">
                ${episode.episodeNumber}화
            </span>

            <span class="episode-title">
                ${escapeHtml(episode.episodeTitle)}
            </span>
        `;

        episodeListBox.appendChild(episodeItem);
    });
}

// =========================
// 본편 회차 선택
// =========================
function selectEpisode(episodeId) {
    const episode = episodeList.find(item => Number(item.episodeId) === Number(episodeId));

    if (episode === undefined) {
        return;
    }

    selectedEpisodeId = episode.episodeId;

    updateEpisodePlayer(episode);
    renderEpisodeList();
}

// =========================
// 본편 영상 플레이어 변경
// =========================
function updateEpisodePlayer(episode) {
    const episodePlayerBox = document.getElementById("episodePlayerBox");
    const episodeFrame = document.getElementById("episodeFrame");

    if (episodePlayerBox === null || episodeFrame === null) {
        return;
    }

    const embedUrl = convertEpisodeVideoUrl(episode.videoUrl);

    if (embedUrl === null) {
        episodePlayerBox.style.display = "none";
        episodeFrame.src = "";
        alert("재생 가능한 영상 URL이 아닙니다.");
        return;
    }

    episodeFrame.src = embedUrl;
    episodePlayerBox.style.display = "block";
}

// =========================
// 본편 영상 URL 변환
// YouTube watch URL / youtu.be URL도 embed URL로 변환
// 그 외에는 iframe에 넣을 수 있는 합법적인 embed URL만 사용
// =========================
function convertEpisodeVideoUrl(videoUrl) {
    if (videoUrl === null || videoUrl === undefined || videoUrl.trim() === "") {
        return null;
    }

    try {
        const url = new URL(videoUrl);
        const host = url.hostname.replace("www.", "");

        if (host === "youtube.com" && url.pathname.startsWith("/embed/")) {
            return videoUrl;
        }

        if (host === "youtube.com" || host === "m.youtube.com") {
            const videoId = url.searchParams.get("v");

            if (videoId !== null && videoId.trim() !== "") {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        if (host === "youtu.be") {
            const videoId = url.pathname.replace("/", "");

            if (videoId !== "") {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        return videoUrl;

    } catch (error) {
        console.error("본편 영상 URL 변환 실패:", error);
        return null;
    }
}

// =========================
// 본편 페이징 출력
// =========================
function renderEpisodePagination() {
    const episodePagination = document.getElementById("episodePagination");

    if (episodePagination === null) {
        return;
    }

    episodePagination.innerHTML = "";

    const totalPages = Math.ceil(episodeList.length / EPISODES_PER_PAGE);

    if (totalPages <= 1) {
        return;
    }

    const prevButton = document.createElement("button");
    prevButton.className = "episode-page-btn";
    prevButton.textContent = "이전";
    prevButton.disabled = currentEpisodePage === 1;

    prevButton.addEventListener("click", () => {
        goEpisodePage(currentEpisodePage - 1);
    });

    episodePagination.appendChild(prevButton);

    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");
        pageButton.className = "episode-page-btn";
        pageButton.textContent = page;

        if (page === currentEpisodePage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {
            goEpisodePage(page);
        });

        episodePagination.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.className = "episode-page-btn";
    nextButton.textContent = "다음";
    nextButton.disabled = currentEpisodePage === totalPages;

    nextButton.addEventListener("click", () => {
        goEpisodePage(currentEpisodePage + 1);
    });

    episodePagination.appendChild(nextButton);
}

// =========================
// 본편 페이지 이동
// =========================
function goEpisodePage(page) {
    const totalPages = Math.ceil(episodeList.length / EPISODES_PER_PAGE);

    if (page < 1 || page > totalPages) {
        return;
    }

    currentEpisodePage = page;

    const firstIndex = (currentEpisodePage - 1) * EPISODES_PER_PAGE;
    const firstEpisode = episodeList[firstIndex];

    if (firstEpisode !== undefined) {
        selectedEpisodeId = firstEpisode.episodeId;
        updateEpisodePlayer(firstEpisode);
    }

    renderEpisodeList();
    renderEpisodePagination();
}

// =========================
// 북마크 상태 조회
// =========================
function loadBookmarkStatus() {
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    if (bookmarkBtn === null) {
        return;
    }

    fetch(`/bookmark/check/${currentAnimeId}`)
        .then(response => response.text())
        .then(result => {
            if (result === "true") {
                bookmarkBtn.classList.add("active");
                bookmarkBtn.textContent = "♥ 북마크";
                return;
            }

            bookmarkBtn.classList.remove("active");
            bookmarkBtn.textContent = "♡ 북마크";
        })
        .catch(error => {
            console.error("북마크 상태 조회 실패:", error);
        });
}

// =========================
// 북마크 버튼 이벤트
// =========================
function initBookmark() {
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    if (bookmarkBtn === null) {
        return;
    }

    bookmarkBtn.addEventListener("click", () => {
        fetch(`/bookmark/${currentAnimeId}`, {
            method: "POST"
        })
            .then(response => response.text())
            .then(result => {
                if (result === "bookmark added" || result === "bookmark removed") {
                    loadBookmarkStatus();
                    return;
                }

                if (result === "login required" || result === "로그인이 필요합니다.") {
                    alert("로그인 후 이용해주세요.");
                    location.href = "/login.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("북마크 처리 실패:", error);
                alert("북마크 처리 중 오류가 발생했습니다.");
            });
    });
}

// =========================
// 리뷰 목록 조회
// =========================
function loadReviewList(animeId) {
    fetch(`/review/anime/${animeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(reviewList => {
            console.log("리뷰 목록:", reviewList);
            renderReviewList(reviewList);
        })
        .catch(error => {
            console.error("리뷰 목록 불러오기 실패:", error);
        });
}

// =========================
// 리뷰 목록 출력
// =========================
function renderReviewList(reviewList) {
    const reviewListBox = document.getElementById("reviewList");
    const reviewCount = document.getElementById("reviewCount");

    reviewListBox.innerHTML = "";
    reviewCount.textContent = `${reviewList.length}개`;

    if (reviewList.length === 0) {
        reviewListBox.innerHTML = `
            <div class="empty-review">
                아직 등록된 리뷰가 없습니다.
            </div>
        `;
        return;
    }

    reviewList.forEach(review => {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";
        reviewItem.id = `reviewItem-${review.reviewId}`;

        reviewItem.innerHTML = createReviewViewHtml(review);

        reviewListBox.appendChild(reviewItem);
        loadReviewLike(review.reviewId);
        loadCommentList(review.reviewId);
    });
}

// =========================
// 리뷰 보기 화면 HTML 생성
// =========================
function createReviewViewHtml(review) {
    let actionButtons = "";

    if (currentLoginUser !== null) {

        // =========================
        // 본인 리뷰: 수정 / 삭제 가능
        // =========================
        if (currentLoginUser.memberId === review.memberId) {
            actionButtons += `
                <button class="review-action-btn edit-btn"
                        onclick="showReviewEditForm(${review.reviewId}, ${review.rating}, '${escapeForAttribute(review.content)}')">
                    수정
                </button>

                <button class="review-action-btn delete-btn"
                        onclick="deleteReview(${review.reviewId})">
                    삭제
                </button>
            `;
        }

        // =========================
        // 관리자: 삭제만 가능
        // =========================
        else if (currentLoginUser.role === "ADMIN") {
            actionButtons += `
                <button class="review-action-btn delete-btn"
                        onclick="deleteReview(${review.reviewId})">
                    삭제
                </button>
            `;
        }
    }

    return `
        <div class="review-item-top">
            <div class="review-rating">${ratingToStars(review.rating)}</div>
            <div class="review-date">${formatDate(review.createdAt)}</div>
        </div>

        <div class="review-content">
            ${escapeHtml(review.content)}
        </div>

        <div class="review-writer">
            작성자: ${review.writerName || "알 수 없음"}
        </div>

        <div class="review-footer">
            <div class="review-like-area">
                <button class="review-like-btn"
                        id="likeBtn-${review.reviewId}"
                        onclick="toggleReviewLike(${review.reviewId})">
                    👍 0
                </button>
            </div>

            <div class="review-actions">
                ${actionButtons}
            </div>
        </div>

        <div class="comment-section">
            <div class="comment-header" id="commentHeader-${review.reviewId}">
                댓글 0개
            </div>

            <div class="comment-write-box">
                <input type="text"
                       id="commentInput-${review.reviewId}"
                       placeholder="댓글을 입력하세요.">

                <button onclick="insertComment(${review.reviewId})">
                    등록
                </button>
            </div>

            <div class="comment-list" id="commentList-${review.reviewId}">
                <!-- 댓글 목록 JS 출력 -->
            </div>
        </div>
    `;
}

// =========================
// 리뷰 등록 이벤트
// =========================
function initReviewSubmit() {
    const submitBtn = document.getElementById("reviewSubmitBtn");

    if (submitBtn === null) {
        return;
    }

    submitBtn.addEventListener("click", () => {
        const rating = selectedRating;
        const content = document.getElementById("reviewContent").value.trim();

        if (content === "") {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        const reviewData = {
            animeId: Number(currentAnimeId),
            rating: rating,
            content: content
        };

        fetch("/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reviewData)
        })
            .then(response => response.text())
            .then(result => {
                if (result === "review inserted") {
                    alert("리뷰가 등록되었습니다.");
                    document.getElementById("reviewContent").value = "";
                    selectedRating = 5;
                    fillStars(selectedRating);

                    loadAnimeDetail(currentAnimeId);
                    loadReviewList(currentAnimeId);
                    return;
                }

                if (result === "login required" || result === "로그인이 필요합니다.") {
                    alert("로그인 후 이용해주세요.");
                    location.href = "/login.html";
                    return;
                }

                alert(result);
            })
            .catch(error => {
                console.error("리뷰 등록 실패:", error);
                alert("리뷰 등록 중 오류가 발생했습니다.");
            });
    });
}

// =========================
// 별점 클릭 이벤트
// =========================
function initStarRating() {
    const stars = document.querySelectorAll("#starRating .star");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = Number(star.dataset.value);
            fillStars(selectedRating);
        });
    });

    fillStars(selectedRating);
}

// =========================
// 별점 채우기
// =========================
function fillStars(rating) {
    const stars = document.querySelectorAll("#starRating .star");

    stars.forEach(star => {
        const value = Number(star.dataset.value);

        if (value <= rating) {
            star.textContent = "★";
            star.classList.add("active");
        } else {
            star.textContent = "☆";
            star.classList.remove("active");
        }
    });
}

// =========================
// 리뷰 수정 폼 표시
// =========================
function showReviewEditForm(reviewId, rating, content) {
    const reviewItem = document.getElementById(`reviewItem-${reviewId}`);

    reviewItem.innerHTML = `
        <div class="review-edit-box">
            <div class="review-form-row">
                <label>별점</label>

                <div class="star-rating edit-star-rating" id="editStarRating-${reviewId}">
                    ${createEditStarsHtml(rating)}
                </div>
            </div>

            <textarea id="editReviewContent-${reviewId}">${escapeHtml(content)}</textarea>

            <div class="review-edit-actions">
                <button class="review-action-btn edit-btn"
                        onclick="updateReview(${reviewId})">
                    수정완료
                </button>

                <button class="review-action-btn cancel-btn"
                        onclick="loadReviewList(currentAnimeId)">
                    취소
                </button>
            </div>
        </div>
    `;

    initEditStarRating(reviewId, rating);
}

// =========================
// 수정 별점 HTML 생성
// =========================
function createEditStarsHtml(rating) {
    let html = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += `<span class="star active" data-value="${i}">★</span>`;
        } else {
            html += `<span class="star" data-value="${i}">☆</span>`;
        }
    }

    return html;
}

// =========================
// 수정 별점 클릭 이벤트
// =========================
function initEditStarRating(reviewId, initialRating) {
    const stars = document.querySelectorAll(`#editStarRating-${reviewId} .star`);

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const rating = Number(star.dataset.value);
            document.getElementById(`editStarRating-${reviewId}`).dataset.rating = rating;
            fillEditStars(reviewId, rating);
        });
    });

    document.getElementById(`editStarRating-${reviewId}`).dataset.rating = initialRating;
}

// =========================
// 수정 별점 채우기
// =========================
function fillEditStars(reviewId, rating) {
    const stars = document.querySelectorAll(`#editStarRating-${reviewId} .star`);

    stars.forEach(star => {
        const value = Number(star.dataset.value);

        if (value <= rating) {
            star.textContent = "★";
            star.classList.add("active");
        } else {
            star.textContent = "☆";
            star.classList.remove("active");
        }
    });
}

// =========================
// 리뷰 수정 처리
// =========================
function updateReview(reviewId) {
    const rating = Number(document.getElementById(`editStarRating-${reviewId}`).dataset.rating);
    const content = document.getElementById(`editReviewContent-${reviewId}`).value.trim();

    if (content === "") {
        alert("리뷰 내용을 입력해주세요.");
        return;
    }

    const reviewData = {
        rating: rating,
        content: content
    };

    fetch(`/review/${reviewId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewData)
    })
        .then(response => response.text())
        .then(result => {
            if (result === "review updated") {
                alert("리뷰가 수정되었습니다.");

                loadAnimeDetail(currentAnimeId);
                loadReviewList(currentAnimeId);
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("리뷰 수정 실패:", error);
            alert("리뷰 수정 중 오류가 발생했습니다.");
        });
}

// =========================
// 리뷰 삭제 처리
// =========================
function deleteReview(reviewId) {
    if (!confirm("리뷰를 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/review/${reviewId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "review deleted") {
                alert("리뷰가 삭제되었습니다.");

                loadAnimeDetail(currentAnimeId);
                loadReviewList(currentAnimeId);
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("리뷰 삭제 실패:", error);
            alert("리뷰 삭제 중 오류가 발생했습니다.");
        });
}

// =========================
// 리뷰 좋아요 수 / 상태 조회
// =========================
function loadReviewLike(reviewId) {
    fetch(`/review-like/count/${reviewId}`)
        .then(response => response.text())
        .then(count => {
            const likeBtn = document.getElementById(`likeBtn-${reviewId}`);

            if (likeBtn === null) {
                return;
            }

            likeBtn.textContent = `👍 ${count}`;
        });

    fetch(`/review-like/check/${reviewId}`)
        .then(response => response.text())
        .then(result => {
            const likeBtn = document.getElementById(`likeBtn-${reviewId}`);

            if (likeBtn === null) {
                return;
            }

            if (result === "true") {
                likeBtn.classList.add("active");
            } else {
                likeBtn.classList.remove("active");
            }
        })
        .catch(error => {
            console.error("좋아요 상태 조회 실패:", error);
        });
}

// =========================
// 리뷰 좋아요 토글
// =========================
function toggleReviewLike(reviewId) {
    fetch(`/review-like/${reviewId}`, {
        method: "POST"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "like added" || result === "like removed") {
                loadReviewLike(reviewId);
                return;
            }

            if (result === "login required" || result === "로그인이 필요합니다.") {
                alert("로그인 후 이용해주세요.");
                location.href = "/login.html";
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("좋아요 처리 실패:", error);
            alert("좋아요 처리 중 오류가 발생했습니다.");
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
// 평균 별점 문구 생성
// =========================
function getAnimeRatingText(anime) {
    const reviewCount = Number(anime.reviewCount || 0);
    const averageRating = Number(anime.averageRating || 0);

    if (reviewCount === 0) {
        return "⭐ 아직 리뷰 없음";
    }

    return `⭐ ${averageRating.toFixed(1)} / 리뷰 ${reviewCount}개`;
}

// =========================
// 장르명 변환
// =========================
function genreIdToName(genreId) {
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

// =========================
// HTML 속성 입력 방지
// =========================
function escapeForAttribute(text) {
    if (!text) {
        return "";
    }

    return String(text)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "");
}

// =========================
// 댓글 목록 조회
// =========================
function loadCommentList(reviewId) {
    fetch(`/comment/review/${reviewId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(commentList => {
            renderCommentList(reviewId, commentList);
        })
        .catch(error => {
            console.error("댓글 목록 불러오기 실패:", error);
        });
}

// =========================
// 댓글 목록 출력
// =========================
function renderCommentList(reviewId, commentList) {
    const commentListBox = document.getElementById(`commentList-${reviewId}`);
    const commentHeader = document.getElementById(`commentHeader-${reviewId}`);

    if (commentHeader !== null) {
        commentHeader.textContent = `댓글 ${commentList.length}개`;
    }

    if (commentListBox === null) {
        return;
    }

    commentListBox.innerHTML = "";

    if (commentList.length === 0) {
        commentListBox.innerHTML = `
            <div class="empty-comment">
                아직 댓글이 없습니다.
            </div>
        `;
        return;
    }

    commentList.forEach(comment => {
        const commentItem = document.createElement("div");
        commentItem.className = "comment-item";

        commentItem.innerHTML = createCommentHtml(comment);

        commentListBox.appendChild(commentItem);
    });
}

// =========================
// 댓글 HTML 생성
// =========================
function createCommentHtml(comment) {
    let deleteButton = "";

    if (currentLoginUser !== null) {
        if (currentLoginUser.memberId === comment.memberId || currentLoginUser.role === "ADMIN") {
            deleteButton = `
                <button class="comment-delete-btn"
                        onclick="deleteComment(${comment.commentId}, ${comment.reviewId})">
                    삭제
                </button>
            `;
        }
    }

    return `
        <div class="comment-top">
            <span class="comment-writer">
                ${comment.writerName || "알 수 없음"}
            </span>

            <span class="comment-date">
                ${formatDate(comment.createdAt)}
            </span>
        </div>

        <div class="comment-content">
            ${escapeHtml(comment.content)}
        </div>

        <div class="comment-actions">
            ${deleteButton}
        </div>
    `;
}

// =========================
// 댓글 등록
// =========================
function insertComment(reviewId) {
    const commentInput = document.getElementById(`commentInput-${reviewId}`);

    if (commentInput === null) {
        return;
    }

    const content = commentInput.value.trim();

    if (content === "") {
        alert("댓글 내용을 입력해주세요.");
        return;
    }

    const commentData = {
        reviewId: reviewId,
        content: content
    };

    fetch("/comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(commentData)
    })
        .then(response => response.text())
        .then(result => {
            if (result === "comment inserted") {
                commentInput.value = "";
                loadCommentList(reviewId);
                return;
            }

            if (result === "login required" || result === "로그인이 필요합니다.") {
                alert("로그인 후 이용해주세요.");
                location.href = "/login.html";
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("댓글 등록 실패:", error);
            alert("댓글 등록 중 오류가 발생했습니다.");
        });
}

// =========================
// 댓글 삭제
// =========================
function deleteComment(commentId, reviewId) {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
        return;
    }

    fetch(`/comment/${commentId}`, {
        method: "DELETE"
    })
        .then(response => response.text())
        .then(result => {
            if (result === "comment deleted") {
                loadCommentList(reviewId);
                return;
            }

            alert(result);
        })
        .catch(error => {
            console.error("댓글 삭제 실패:", error);
            alert("댓글 삭제 중 오류가 발생했습니다.");
        });
}