package com.anime.project.controller;

import com.anime.project.domain.anime.Anime;
import com.anime.project.domain.member.Member;
import com.anime.project.service.AnimeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anime")
@RequiredArgsConstructor
public class AnimeController {

    private final AnimeService animeService;

    // =========================
    // 관리자 권한 체크
    // =========================
    private void checkAdmin(HttpSession session) {

        Member loginUser = (Member) session.getAttribute("loginUser");

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginUser.getRole())) {
            throw new IllegalArgumentException("관리자만 가능합니다.");
        }
    }

    // =========================
    // 애니 등록
    // =========================
    @PostMapping
    public String insert(@RequestBody Anime anime,
                         HttpSession session) {

        try {
            checkAdmin(session);

            animeService.insert(anime);

            return "anime inserted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 애니 전체 조회
    // =========================
    @GetMapping
    public List<Anime> findAll() {

        return animeService.findAll();
    }

    // =========================
    // 장르별 조회
    // =========================
    @GetMapping("/genre/{genreId}")
    public List<Anime> findByGenreId(@PathVariable Long genreId) {

        return animeService.findByGenreId(genreId);
    }

    // =========================
    // 제목 검색
    // =========================
    @GetMapping("/search")
    public List<Anime> searchByTitle(@RequestParam("title") String title) {

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("검색어를 입력해주세요.");
        }

        return animeService.searchByTitle(title);
    }

    // =========================
    // 애니 상세 조회
    // =========================
    @GetMapping("/{animeId}")
    public Anime findById(@PathVariable Long animeId) {

        return animeService.findById(animeId);
    }

    // =========================
    // 애니 수정
    // =========================
    @PutMapping("/{animeId}")
    public String update(@PathVariable Long animeId,
                         @RequestBody Anime anime,
                         HttpSession session) {

        try {
            checkAdmin(session);

            animeService.update(animeId, anime);

            return "anime updated";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 애니 삭제
    // =========================
    @DeleteMapping("/{animeId}")
    public String delete(@PathVariable Long animeId,
                         HttpSession session) {

        try {
            checkAdmin(session);

            animeService.delete(animeId);

            return "anime deleted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}