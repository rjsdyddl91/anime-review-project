package com.anime.project.controller;

import com.anime.project.domain.member.Member;
import com.anime.project.domain.review.Review;
import com.anime.project.dto.ReviewResponseDTO;
import com.anime.project.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

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

    @PostMapping
    public String insert(@RequestBody Review review, HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            reviewService.insert(review, loginUser);

            return "review inserted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 리뷰 전체 조회
    // =========================
    @GetMapping("/list")
    public Object findAllReviews(HttpSession session) {

        try {
            checkAdmin(session);

            return reviewService.findAllReviews();

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    @GetMapping("/anime/{animeId}")
    public List<ReviewResponseDTO> findByAnimeId(@PathVariable Long animeId) {

        return reviewService.findByAnimeId(animeId);
    }

    @GetMapping("/my")
    public Object findMyReviews(HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return reviewService.findMyReviews(loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    @PutMapping("/{reviewId}")
    public String update(@PathVariable Long reviewId,
                         @RequestBody Review review,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            reviewService.update(reviewId, review, loginUser);

            return "review updated";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    @DeleteMapping("/{reviewId}")
    public String delete(@PathVariable Long reviewId,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            reviewService.delete(reviewId, loginUser);

            return "review deleted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}