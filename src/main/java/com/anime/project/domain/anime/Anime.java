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

    @Column(nullable = false)
    private LocalDateTime createdAt;
}