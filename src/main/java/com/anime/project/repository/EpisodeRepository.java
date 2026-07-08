package com.anime.project.repository;

import com.anime.project.domain.episode.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {

    // 특정 애니의 회차 목록 조회
    List<Episode> findByAnimeIdOrderByEpisodeNumberAsc(Long animeId);

    // 특정 애니의 회차 전체 삭제
    void deleteByAnimeId(Long animeId);
}