package com.anime.project.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponseDTO {

    private Long reviewId;
    private Long memberId;
    private String writerName;
    private Long animeId;
    private int rating;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}