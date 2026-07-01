package com.anime.project.domain.bookmark;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookmark")
@Getter
@Setter
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookmarkId;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private Long animeId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}