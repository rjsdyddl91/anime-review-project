package com.anime.project.service;

import com.anime.project.domain.episode.Episode;
import com.anime.project.repository.EpisodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EpisodeService {

    private final EpisodeRepository episodeRepository;

    // =========================
    // 특정 애니의 회차 목록 조회
    // =========================
    @Transactional(readOnly = true)
    public List<Episode> findByAnimeId(Long animeId) {
        return episodeRepository.findByAnimeIdOrderByEpisodeNumberAsc(animeId);
    }

    // =========================
    // 회차 등록
    // =========================
    @Transactional
    public void save(Episode episode) {
        episodeRepository.save(episode);
    }

    // =========================
    // 회차 수정
    // =========================
    @Transactional
    public void update(Long episodeId, Episode updateEpisode) {

        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회차입니다."));

        episode.setAnimeId(updateEpisode.getAnimeId());
        episode.setEpisodeNumber(updateEpisode.getEpisodeNumber());
        episode.setEpisodeTitle(updateEpisode.getEpisodeTitle());
        episode.setVideoUrl(updateEpisode.getVideoUrl());
    }

    // =========================
    // 회차 삭제
    // =========================
    @Transactional
    public void delete(Long episodeId) {
        episodeRepository.deleteById(episodeId);
    }

    // =========================
    // 특정 애니에 속한 회차 전체 삭제
    // 애니 삭제할 때 같이 사용
    // =========================
    @Transactional
    public void deleteByAnimeId(Long animeId) {
        episodeRepository.deleteByAnimeId(animeId);
    }
}