// =========================
// 검색 자동완성 타이머
// =========================
let searchSuggestionTimer = null;

// =========================
// 메인 애니 목록 페이징 변수
// =========================
let originalAnimeList = [];
let currentAnimeList = [];
let currentPage = 1;
const animePageSize = 8;

// =========================
// 정렬 기준
// default : 기본순
// rating  : 별점순
// review  : 리뷰 많은 순
// =========================
let currentSortType = "default";

document.addEventListener("DOMContentLoaded", () => {
    loadAnimeList();
    initGenreButtons();
    initSearch();
    initSortButtons();
});

// =========================
// 애니 전체 목록
// =========================
function loadAnimeList() {
    fetch("/anime")
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(data => {
            console.log("애니 목록:", data);
            renderAnimeList(data);
        })
        .catch(error => {
            console.error("애니 목록 불러오기 실패:", error);
        });
}

// =========================
// 장르별 목록
// =========================
function loadAnimeByGenre(genreId) {
    fetch(`/anime/genre/${genreId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(data => {
            console.log("장르별 애니 목록:", data);
            renderAnimeList(data);
        })
        .catch(error => {
            console.error("장르별 애니 목록 불러오기 실패:", error);
        });
}

// =========================
// 제목 검색
// =========================
function searchAnimeByTitle(title) {
    fetch(`/anime/search?title=${encodeURIComponent(title)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(data => {
            console.log("검색 결과:", data);
            renderAnimeList(data);
        })
        .catch(error => {
            console.error("검색 실패:", error);
        });
}

// =========================
// 검색 자동완성 목록 조회
// =========================
function loadSearchSuggestions(title) {
    fetch(`/anime/search?title=${encodeURIComponent(title)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(data => {
            console.log("검색 자동완성:", data);
            renderSearchSuggestions(data);
        })
        .catch(error => {
            console.error("검색 자동완성 실패:", error);
        });
}

// =========================
// 검색 자동완성 목록 출력
// =========================
function renderSearchSuggestions(animeList) {
    const searchSuggestionBox = document.getElementById("searchSuggestionBox");

    searchSuggestionBox.innerHTML = "";

    if (animeList.length === 0) {
        searchSuggestionBox.innerHTML = `
            <div class="search-suggestion-empty">
                検索結果がありません。
            </div>
        `;

        searchSuggestionBox.style.display = "block";
        return;
    }

    animeList.slice(0, 5).forEach(anime => {
        const item = document.createElement("div");
        item.className = "search-suggestion-item";

        item.onclick = () => {
            location.href = `/detail.html?animeId=${anime.animeId}`;
        };

        item.innerHTML = `
            <img src="${anime.imagePath || 'https://placehold.co/60x80'}" alt="${escapeHtml(anime.title)}">

            <div class="search-suggestion-info">
                <div class="search-suggestion-title">
                    ${escapeHtml(anime.title)}
                </div>

                <div class="search-suggestion-sub">
                    ${genreIdToName(anime.genreId)} · ${escapeHtml(anime.studio)}
                </div>
            </div>
        `;

        searchSuggestionBox.appendChild(item);
    });

    searchSuggestionBox.style.display = "block";
}

// =========================
// 검색 자동완성 목록 숨기기
// =========================
function hideSearchSuggestions() {
    const searchSuggestionBox = document.getElementById("searchSuggestionBox");

    if (searchSuggestionBox !== null) {
        searchSuggestionBox.innerHTML = "";
        searchSuggestionBox.style.display = "none";
    }
}

// =========================
// 애니 목록 저장 후 첫 페이지 출력
// =========================
function renderAnimeList(animeList) {
    originalAnimeList = [...animeList];

    applyCurrentSort();

    currentPage = 1;

    renderCurrentAnimePage();
}

// =========================
// 현재 페이지 애니 목록 출력
// =========================
function renderCurrentAnimePage() {
    const animeGrid = document.getElementById("animeGrid");

    animeGrid.innerHTML = "";

    if (currentAnimeList.length === 0) {
        animeGrid.innerHTML = `
            <div class="empty-message">
                表示するアニメがありません。
            </div>
        `;

        renderAnimePagination();
        return;
    }

    const startIndex = (currentPage - 1) * animePageSize;
    const endIndex = startIndex + animePageSize;
    const pageAnimeList = currentAnimeList.slice(startIndex, endIndex);

    pageAnimeList.forEach(anime => {
        const card = document.createElement("div");
        card.className = "anime-card";

        card.onclick = () => {
            location.href = `/detail.html?animeId=${anime.animeId}`;
        };

        card.innerHTML = `
            <img src="${anime.imagePath || 'https://placehold.co/250x350'}" alt="${escapeHtml(anime.title)}">

            <div class="anime-info">
                <div class="anime-title">${escapeHtml(anime.title)}</div>

                <div class="anime-genre">
                    ${genreIdToName(anime.genreId)}
                </div>

                <div class="anime-studio">
                    ${escapeHtml(anime.studio)}
                </div>

                <div class="anime-rating">
                    ${getAnimeRatingText(anime)}
                </div>
            </div>
        `;

        animeGrid.appendChild(card);
    });

    renderAnimePagination();
}

// =========================
// 애니 목록 페이지 버튼 출력
// =========================
function renderAnimePagination() {
    const animePagination = document.getElementById("animePagination");

    if (animePagination === null) {
        return;
    }

    animePagination.innerHTML = "";

    const totalPage = Math.ceil(currentAnimeList.length / animePageSize);

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
            currentPage--;
            renderCurrentAnimePage();
            scrollToAnimeList();
        }
    };

    animePagination.appendChild(prevBtn);

    // 숫자 버튼
    for (let i = 1; i <= totalPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "page-btn";
        pageBtn.textContent = i;

        if (i === currentPage) {
            pageBtn.classList.add("active");
        }

        pageBtn.onclick = () => {
            currentPage = i;
            renderCurrentAnimePage();
            scrollToAnimeList();
        };

        animePagination.appendChild(pageBtn);
    }

    // 다음 버튼
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.textContent = "次へ";
    nextBtn.disabled = currentPage === totalPage;

    nextBtn.onclick = () => {
        if (currentPage < totalPage) {
            currentPage++;
            renderCurrentAnimePage();
            scrollToAnimeList();
        }
    };

    animePagination.appendChild(nextBtn);
}

// =========================
// 페이지 이동 시 애니 목록 위치로 스크롤
// =========================
function scrollToAnimeList() {
    const animeGrid = document.getElementById("animeGrid");

    if (animeGrid !== null) {
        animeGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =========================
// 장르 버튼 이벤트
// =========================
function initGenreButtons() {
    const genreButtons = document.querySelectorAll(".genre-btn");

    genreButtons.forEach(button => {
        button.addEventListener("click", () => {
            genreButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const genre = button.dataset.genre;

            hideSearchSuggestions();

            if (genre === "all") {
                loadAnimeList();
                return;
            }

            loadAnimeByGenre(genre);
        });
    });
}

// =========================
// 정렬 버튼 이벤트
// =========================
function initSortButtons() {
    const sortButtons = document.querySelectorAll(".sort-btn");

    sortButtons.forEach(button => {
        button.addEventListener("click", () => {
            sortButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            currentSortType = button.dataset.sort;
            currentPage = 1;

            applyCurrentSort();
            renderCurrentAnimePage();
            scrollToAnimeList();
        });
    });
}

// =========================
// 현재 정렬 기준 적용
// =========================
function applyCurrentSort() {
    currentAnimeList = [...originalAnimeList];

    if (currentSortType === "rating") {
        currentAnimeList.sort((a, b) => {
            const ratingA = Number(a.averageRating || 0);
            const ratingB = Number(b.averageRating || 0);

            const reviewCountA = Number(a.reviewCount || 0);
            const reviewCountB = Number(b.reviewCount || 0);

            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }

            return reviewCountB - reviewCountA;
        });

        return;
    }

    if (currentSortType === "review") {
        currentAnimeList.sort((a, b) => {
            const reviewCountA = Number(a.reviewCount || 0);
            const reviewCountB = Number(b.reviewCount || 0);

            const ratingA = Number(a.averageRating || 0);
            const ratingB = Number(b.averageRating || 0);

            if (reviewCountB !== reviewCountA) {
                return reviewCountB - reviewCountA;
            }

            return ratingB - ratingA;
        });

        return;
    }
}

// =========================
// 검색 이벤트
// =========================
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const searchSuggestionBox = document.getElementById("searchSuggestionBox");

    // 검색 버튼 클릭
    searchBtn.addEventListener("click", () => {
        const title = searchInput.value.trim();

        hideSearchSuggestions();

        if (title === "") {
            loadAnimeList();
            return;
        }

        searchAnimeByTitle(title);
    });

    // 엔터 입력 시 검색
    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchBtn.click();
        }
    });

    // 검색어 입력 시 자동완성
    searchInput.addEventListener("input", () => {
        const title = searchInput.value.trim();

        clearTimeout(searchSuggestionTimer);

        if (title === "") {
            hideSearchSuggestions();
            return;
        }

        searchSuggestionTimer = setTimeout(() => {
            loadSearchSuggestions(title);
        }, 200);
    });

    // 검색창 포커스 시 기존 입력값으로 자동완성 다시 표시
    searchInput.addEventListener("focus", () => {
        const title = searchInput.value.trim();

        if (title !== "") {
            loadSearchSuggestions(title);
        }
    });

    // 검색창 바깥 클릭 시 자동완성 숨기기
    document.addEventListener("click", event => {
        if (!event.target.closest(".search-box")) {
            hideSearchSuggestions();
        }
    });

    // 자동완성 박스 클릭 시 document 클릭 이벤트로 바로 닫히는 것 방지
    if (searchSuggestionBox !== null) {
        searchSuggestionBox.addEventListener("click", event => {
            event.stopPropagation();
        });
    }
}

// =========================
// 평균 별점 문구 생성
// =========================
function getAnimeRatingText(anime) {
    const reviewCount = Number(anime.reviewCount || 0);
    const averageRating = Number(anime.averageRating || 0);

    if (reviewCount === 0) {
        return "⭐ レビューはまだありません";
    }

    return `⭐ ${averageRating.toFixed(1)} / レビュー ${reviewCount}件`;
}

// =========================
// 장르명 변환
// =========================
function genreIdToName(genreId) {
    if (genreId === 1) {
        return "アクション";
    }

    if (genreId === 2) {
        return "ファンタジー";
    }

    if (genreId === 3) {
        return "コメディ";
    }

    return "その他";
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