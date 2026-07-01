package com.anime.project.controller;

import com.anime.project.domain.comment.Comment;
import com.anime.project.domain.member.Member;
import com.anime.project.dto.CommentResponseDTO;
import com.anime.project.service.CommentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

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
    // 댓글 작성
    // =========================
    @PostMapping
    public String insert(@RequestBody Comment comment,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            commentService.insert(comment, loginUser);

            return "comment inserted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 댓글 전체 조회
    // =========================
    @GetMapping("/list")
    public Object findAllComments(HttpSession session) {

        try {
            checkAdmin(session);

            return commentService.findAllComments();

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 특정 리뷰 댓글 조회
    // =========================
    @GetMapping("/review/{reviewId}")
    public List<CommentResponseDTO> findByReviewId(@PathVariable Long reviewId) {

        return commentService.findByReviewId(reviewId);
    }

    // =========================
    // 내 댓글 조회
    // =========================
    @GetMapping("/my")
    public Object findMyComments(HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            return commentService.findMyComments(loginUser);

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 댓글 삭제
    // =========================
    @DeleteMapping("/{commentId}")
    public String delete(@PathVariable Long commentId,
                         HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            commentService.delete(commentId, loginUser);

            return "comment deleted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}