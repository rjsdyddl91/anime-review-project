package com.anime.project.service;

import com.anime.project.domain.comment.Comment;
import com.anime.project.domain.member.Member;
import com.anime.project.dto.CommentResponseDTO;
import com.anime.project.repository.CommentRepository;
import com.anime.project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;

    // =========================
    // 댓글 작성
    // =========================
    public void insert(Comment comment, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }

        comment.setMemberId(loginUser.getMemberId());
        comment.setContent(comment.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());

        commentRepository.save(comment);
    }

    // =========================
    // 특정 리뷰 댓글 조회
    // 일반 사용자 화면이므로 작성자 이름 마스킹
    // =========================
    public List<CommentResponseDTO> findByReviewId(Long reviewId) {

        return commentRepository.findByReviewId(reviewId)
                .stream()
                .map(comment -> convertToDTO(comment, true))
                .toList();
    }

    // =========================
    // 내 댓글 조회
    // 일반 사용자 화면이므로 작성자 이름 마스킹
    // =========================
    public List<CommentResponseDTO> findMyComments(Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return commentRepository.findByMemberId(loginUser.getMemberId())
                .stream()
                .map(comment -> convertToDTO(comment, true))
                .toList();
    }

    // =========================
    // 댓글 삭제
    // =========================
    public void delete(Long commentId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        if (!comment.getMemberId().equals(loginUser.getMemberId())
                && !"ADMIN".equals(loginUser.getRole())) {
            throw new IllegalArgumentException("본인 댓글만 삭제할 수 있습니다.");
        }

        commentRepository.delete(comment);
    }

    // =========================
    // 전체 댓글 조회
    // 관리자 화면이므로 작성자 이름 원본 표시
    // =========================
    public List<CommentResponseDTO> findAllComments() {

        return commentRepository.findAll()
                .stream()
                .map(comment -> convertToDTO(comment, false))
                .toList();
    }

    // =========================
    // DTO 변환
    // maskWriterName이 true면 이름 마스킹
    // maskWriterName이 false면 원본 이름 표시
    // =========================
    private CommentResponseDTO convertToDTO(Comment comment, boolean maskWriterName) {

        CommentResponseDTO dto = new CommentResponseDTO();

        dto.setCommentId(comment.getCommentId());
        dto.setReviewId(comment.getReviewId());
        dto.setMemberId(comment.getMemberId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        Member member = memberRepository.findById(comment.getMemberId())
                .orElse(null);

        if (member == null) {
            dto.setWriterName("알 수 없음");
        } else {
            if (maskWriterName) {
                dto.setWriterName(maskName(member.getName()));
            } else {
                dto.setWriterName(member.getName());
            }
        }

        return dto;
    }

    // =========================
    // 이름 마스킹
    // =========================
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