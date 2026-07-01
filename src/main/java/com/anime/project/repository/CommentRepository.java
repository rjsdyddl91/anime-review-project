package com.anime.project.repository;

import com.anime.project.domain.comment.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 리뷰의 댓글 조회
    List<Comment> findByReviewId(Long reviewId);

    // 특정 회원이 작성한 댓글 조회
    List<Comment> findByMemberId(Long memberId);
}