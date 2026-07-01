package com.anime.project.service;

import com.anime.project.domain.anime.Anime;
import com.anime.project.repository.AnimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimeService {

    private final AnimeRepository animeRepository;

    // =========================
    // 애니 등록
    // =========================
    public void insert(Anime anime) {
        anime.setCreatedAt(LocalDateTime.now());
        animeRepository.save(anime);
    }

    // =========================
    // 애니 전체 조회
    // =========================
    public List<Anime> findAll() {
        return animeRepository.findAll();
    }

    // =========================
    // 애니 상세 조회
    // =========================
    public Anime findById(Long animeId) {
        return animeRepository.findById(animeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 애니입니다."));
    }

    // =========================
    // 장르별 조회
    // =========================
    public List<Anime> findByGenreId(Long genreId) {
        return animeRepository.findByGenreId(genreId);
    }

    // =========================
    // 제목 검색
    // =========================
    public List<Anime> searchByTitle(String title) {
        return animeRepository.findByTitleContaining(title);
    }

    // =========================
    // 애니 수정
    // =========================
    public void update(Long animeId, Anime updateAnime) {

        Anime anime = animeRepository.findById(animeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 애니입니다."));

        anime.setGenreId(updateAnime.getGenreId());
        anime.setTitle(updateAnime.getTitle());
        anime.setStudio(updateAnime.getStudio());
        anime.setDescription(updateAnime.getDescription());
        anime.setImagePath(updateAnime.getImagePath());

        animeRepository.save(anime);
    }

    // =========================
    // 애니 삭제
    // =========================
    public void delete(Long animeId) {
        animeRepository.deleteById(animeId);
    }
}