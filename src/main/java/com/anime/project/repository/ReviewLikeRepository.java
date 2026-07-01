package com.anime.project.repository;

import com.anime.project.domain.reviewlike.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {

    // 특정 회원이 특정 리뷰에 좋아요를 눌렀는지 확인
    Optional<ReviewLike> findByMemberIdAndReviewId(Long memberId, Long reviewId);

    // 특정 리뷰의 좋아요 수 조회
    long countByReviewId(Long reviewId);
}