package com.anime.project.controller;

import com.anime.project.domain.member.Member;
import com.anime.project.service.ReviewLikeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review-like")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    // =========================
    // 좋아요 토글
    // =========================
    @PostMapping("/{reviewId}")
    public String toggle(@PathVariable Long reviewId,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return reviewLikeService.toggle(reviewId, loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 좋아요 개수 조회
    // =========================
    @GetMapping("/count/{reviewId}")
    public long count(@PathVariable Long reviewId) {

        return reviewLikeService.count(reviewId);
    }

    // =========================
    // 좋아요 여부 확인
    // =========================
    @GetMapping("/check/{reviewId}")
    public Object check(@PathVariable Long reviewId,
                        HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return reviewLikeService.isLiked(reviewId, loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}