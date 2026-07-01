package com.anime.project.service;

import com.anime.project.domain.anime.Anime;
import com.anime.project.repository.AnimeRepository;
import com.anime.project.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimeService {

    private final AnimeRepository animeRepository;
    private final ReviewRepository reviewRepository;

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

        List<Anime> animeList = animeRepository.findAll();

        setRatingInfoList(animeList);

        return animeList;
    }

    // =========================
    // 애니 상세 조회
    // =========================
    public Anime findById(Long animeId) {

        Anime anime = animeRepository.findById(animeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 애니입니다."));

        setRatingInfo(anime);

        return anime;
    }

    // =========================
    // 장르별 조회
    // =========================
    public List<Anime> findByGenreId(Long genreId) {

        List<Anime> animeList = animeRepository.findByGenreId(genreId);

        setRatingInfoList(animeList);

        return animeList;
    }

    // =========================
    // 제목 검색
    // =========================
    public List<Anime> searchByTitle(String title) {

        List<Anime> animeList = animeRepository.findByTitleContaining(title);

        setRatingInfoList(animeList);

        return animeList;
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

    // =========================
    // 애니 목록에 별점 정보 추가
    // =========================
    private void setRatingInfoList(List<Anime> animeList) {

        for (Anime anime : animeList) {
            setRatingInfo(anime);
        }
    }

    // =========================
    // 애니 1개에 별점 정보 추가
    // =========================
    private void setRatingInfo(Anime anime) {

        Double averageRating = reviewRepository.findAverageRatingByAnimeId(anime.getAnimeId());
        long reviewCount = reviewRepository.countByAnimeId(anime.getAnimeId());

        if (averageRating == null) {
            anime.setAverageRating(0.0);
        } else {
            double roundedRating = Math.round(averageRating * 10) / 10.0;
            anime.setAverageRating(roundedRating);
        }

        anime.setReviewCount(reviewCount);
    }
}