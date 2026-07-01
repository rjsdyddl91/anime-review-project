package com.anime.project.service;

import com.anime.project.domain.member.Member;
import com.anime.project.domain.review.Review;
import com.anime.project.dto.ReviewResponseDTO;
import com.anime.project.repository.MemberRepository;
import com.anime.project.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;

    public void insert(Review review, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1~5점만 가능합니다.");
        }

        review.setMemberId(loginUser.getMemberId());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        reviewRepository.save(review);
    }

    public List<ReviewResponseDTO> findByAnimeId(Long animeId) {
        return reviewRepository.findByAnimeId(animeId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<Review> findMyReviews(Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return reviewRepository.findByMemberId(loginUser.getMemberId());
    }

    public void update(Long reviewId, Review updateReview, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        if (!review.getMemberId().equals(loginUser.getMemberId())) {
            throw new IllegalArgumentException("본인 리뷰만 수정할 수 있습니다.");
        }

        if (updateReview.getRating() < 1 || updateReview.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1~5점만 가능합니다.");
        }

        review.setRating(updateReview.getRating());
        review.setContent(updateReview.getContent());
        review.setUpdatedAt(LocalDateTime.now());

        reviewRepository.save(review);
    }

    public void delete(Long reviewId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        if (!review.getMemberId().equals(loginUser.getMemberId())
                && !"ADMIN".equals(loginUser.getRole())) {
            throw new IllegalArgumentException("본인 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
    }

    // =========================
    // 전체 리뷰 조회
    // =========================
    public List<ReviewResponseDTO> findAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    private ReviewResponseDTO convertToDTO(Review review) {

        ReviewResponseDTO dto = new ReviewResponseDTO();

        dto.setReviewId(review.getReviewId());
        dto.setMemberId(review.getMemberId());
        dto.setAnimeId(review.getAnimeId());
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        Member member = memberRepository.findById(review.getMemberId())
                .orElse(null);

        if (member == null) {
            dto.setWriterName("알 수 없음");
        } else {
            dto.setWriterName(maskName(member.getName()));
        }

        return dto;
    }

    private String maskName(String name) {

        if (name == null || name.isBlank()) {
            return "알 수 없음";
        }

        if ("관리자".equals(name)) {
            return "관리자";
        }

        if (name.length() == 1) {
            return name + "**";
        }

        return name.charAt(0) + "**";
    }
}