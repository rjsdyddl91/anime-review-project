package com.anime.project.service;

import com.anime.project.domain.member.Member;
import com.anime.project.domain.reviewlike.ReviewLike;
import com.anime.project.repository.ReviewLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewLikeService {

    private final ReviewLikeRepository reviewLikeRepository;

    // =========================
    // 좋아요 토글
    // =========================
    public String toggle(Long reviewId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        ReviewLike reviewLike = reviewLikeRepository
                .findByMemberIdAndReviewId(loginUser.getMemberId(), reviewId)
                .orElse(null);

        if (reviewLike != null) {

            reviewLikeRepository.delete(reviewLike);

            return "like removed";
        }

        ReviewLike newLike = new ReviewLike();

        newLike.setReviewId(reviewId);
        newLike.setMemberId(loginUser.getMemberId());
        newLike.setCreatedAt(LocalDateTime.now());

        reviewLikeRepository.save(newLike);

        return "like added";
    }

    // =========================
    // 좋아요 개수 조회
    // =========================
    public long count(Long reviewId) {

        return reviewLikeRepository.countByReviewId(reviewId);
    }

    // =========================
    // 좋아요 여부 확인
    // =========================
    public boolean isLiked(Long reviewId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return reviewLikeRepository
                .findByMemberIdAndReviewId(loginUser.getMemberId(), reviewId)
                .isPresent();
    }
}