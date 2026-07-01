package com.anime.project.repository;

import com.anime.project.domain.bookmark.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // 내 북마크 목록 조회
    List<Bookmark> findByMemberId(Long memberId);

    // 특정 회원이 특정 애니를 북마크했는지 확인
    Optional<Bookmark> findByMemberIdAndAnimeId(Long memberId, Long animeId);
}