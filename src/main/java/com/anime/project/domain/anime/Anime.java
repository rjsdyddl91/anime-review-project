package com.anime.project.domain.anime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "anime")
@Getter
@Setter
public class Anime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long animeId;

    @Column(nullable = false)
    private Long genreId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String studio;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String imagePath;

    // =========================
    // 예고편 영상 URL
    // DB에는 video_url 컬럼으로 생성됨
    // =========================
    @Column(length = 500)
    private String videoUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =========================
    // 평균 별점
    // DB 컬럼이 아니라 화면 출력용 임시 필드
    // =========================
    @Transient
    private Double averageRating;

    // =========================
    // 리뷰 개수
    // DB 컬럼이 아니라 화면 출력용 임시 필드
    // =========================
    @Transient
    private long reviewCount;
}