package com.anime.project.domain.episode;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "episode",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_episode_anime_number",
                        columnNames = {"anime_id", "episode_number"}
                )
        }
)
@Getter
@Setter
public class Episode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "episode_id")
    private Long episodeId;

    // =========================
    // 어떤 애니에 소속된 회차인지
    // anime 테이블의 anime_id 값
    // =========================
    @Column(name = "anime_id", nullable = false)
    private Long animeId;

    // =========================
    // 회차 번호
    // 예: 1화 = 1, 2화 = 2
    // =========================
    @Column(name = "episode_number", nullable = false)
    private int episodeNumber;

    // =========================
    // 회차 제목
    // =========================
    @Column(name = "episode_title", nullable = false)
    private String episodeTitle;

    // =========================
    // 영상 URL
    // 합법적으로 사용할 수 있는 영상 URL만 등록
    // =========================
    @Column(name = "video_url", nullable = false, length = 1000)
    private String videoUrl;

    // =========================
    // 등록일
    // =========================
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // =========================
    // insert 되기 전에 자동으로 등록일 세팅
    // =========================
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}