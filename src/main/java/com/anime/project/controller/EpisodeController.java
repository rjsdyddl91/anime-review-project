package com.anime.project.controller;

import com.anime.project.domain.episode.Episode;
import com.anime.project.service.EpisodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/episodes")
@RequiredArgsConstructor
public class EpisodeController {

    private final EpisodeService episodeService;

    // =========================
    // 특정 애니의 회차 목록 조회
    // 예: /api/episodes/anime/1
    // =========================
    @GetMapping("/anime/{animeId}")
    public List<Episode> findByAnimeId(@PathVariable Long animeId) {
        return episodeService.findByAnimeId(animeId);
    }

    // =========================
    // 회차 등록
    // =========================
    @PostMapping
    public void save(@RequestBody Episode episode) {
        episodeService.save(episode);
    }

    // =========================
    // 회차 수정
    // =========================
    @PutMapping("/{episodeId}")
    public void update(@PathVariable Long episodeId,
                       @RequestBody Episode episode) {
        episodeService.update(episodeId, episode);
    }

    // =========================
    // 회차 삭제
    // =========================
    @DeleteMapping("/{episodeId}")
    public void delete(@PathVariable Long episodeId) {
        episodeService.delete(episodeId);
    }
}