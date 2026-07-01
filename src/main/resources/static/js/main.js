document.addEventListener("DOMContentLoaded", () => {
    loadAnimeList();
    initGenreButtons();
    initSearch();
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
// 화면 카드 출력
// =========================
function renderAnimeList(animeList) {
    const animeGrid = document.getElementById("animeGrid");

    animeGrid.innerHTML = "";

    if (animeList.length === 0) {
        animeGrid.innerHTML = `
            <div class="empty-message">
                표시할 애니가 없습니다.
            </div>
        `;
        return;
    }

    animeList.forEach(anime => {
        const card = document.createElement("div");
        card.className = "anime-card";

        card.onclick = () => {
            location.href = `/detail.html?animeId=${anime.animeId}`;
        };

        card.innerHTML = `
            <img src="${anime.imagePath || 'https://placehold.co/250x350'}" alt="${anime.title}">

            <div class="anime-info">
                <div class="anime-title">${anime.title}</div>

                <div class="anime-genre">
                    ${genreIdToName(anime.genreId)}
                </div>

                <div class="anime-studio">
                    ${anime.studio}
                </div>
            </div>
        `;

        animeGrid.appendChild(card);
    });
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

            if (genre === "all") {
                loadAnimeList();
                return;
            }

            loadAnimeByGenre(genre);
        });
    });
}

// =========================
// 검색 이벤트
// =========================
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    searchBtn.addEventListener("click", () => {
        const title = searchInput.value.trim();

        if (title === "") {
            loadAnimeList();
            return;
        }

        searchAnimeByTitle(title);
    });

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchBtn.click();
        }
    });
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