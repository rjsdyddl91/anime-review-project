package com.anime.project.repository;

import com.anime.project.domain.anime.Anime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {

    // 장르별 조회
    List<Anime> findByGenreId(Long genreId);

    // 제목 검색
    List<Anime> findByTitleContaining(String title);
}