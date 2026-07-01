package com.anime.project.repository;

import com.anime.project.domain.review.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 특정 애니의 리뷰 조회
    List<Review> findByAnimeId(Long animeId);

    // 특정 회원이 작성한 리뷰 조회
    List<Review> findByMemberId(Long memberId);

    // =========================
    // 특정 애니의 평균 별점 조회
    // =========================
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.animeId = :animeId")
    Double findAverageRatingByAnimeId(@Param("animeId") Long animeId);

    // =========================
    // 특정 애니의 리뷰 개수 조회
    // =========================
    long countByAnimeId(Long animeId);
}