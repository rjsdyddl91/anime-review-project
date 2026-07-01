package com.anime.project.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CommentResponseDTO {

    private Long commentId;
    private Long reviewId;
    private Long memberId;
    private String writerName;
    private String content;
    private LocalDateTime createdAt;
}