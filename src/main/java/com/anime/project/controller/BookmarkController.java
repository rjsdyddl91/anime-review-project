package com.anime.project.controller;

import com.anime.project.domain.bookmark.Bookmark;
import com.anime.project.domain.member.Member;
import com.anime.project.service.BookmarkService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    // =========================
    // 북마크 토글
    // =========================
    @PostMapping("/{animeId}")
    public String toggle(@PathVariable Long animeId,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return bookmarkService.toggle(animeId, loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 북마크 여부 확인
    // =========================
    @GetMapping("/check/{animeId}")
    public Object checkBookmark(@PathVariable Long animeId,
                                HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return bookmarkService.isBookmarked(animeId, loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 내 북마크 목록 조회
    // =========================
    @GetMapping("/my")
    public Object findMyBookmarks(HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return bookmarkService.findMyBookmarks(loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}