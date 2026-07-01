package com.anime.project.service;

import com.anime.project.domain.bookmark.Bookmark;
import com.anime.project.domain.member.Member;
import com.anime.project.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    // =========================
    // 북마크 토글
    // =========================
    public String toggle(Long animeId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return bookmarkRepository.findByMemberIdAndAnimeId(
                loginUser.getMemberId(),
                animeId
        ).map(bookmark -> {

            bookmarkRepository.delete(bookmark);
            return "bookmark removed";

        }).orElseGet(() -> {

            Bookmark bookmark = new Bookmark();
            bookmark.setMemberId(loginUser.getMemberId());
            bookmark.setAnimeId(animeId);
            bookmark.setCreatedAt(LocalDateTime.now());

            bookmarkRepository.save(bookmark);
            return "bookmark added";
        });
    }

    // =========================
    // 북마크 여부 확인
    // =========================
    public boolean isBookmarked(Long animeId, Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return bookmarkRepository.findByMemberIdAndAnimeId(
                loginUser.getMemberId(),
                animeId
        ).isPresent();
    }

    // =========================
    // 내 북마크 목록 조회
    // =========================
    public List<Bookmark> findMyBookmarks(Member loginUser) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return bookmarkRepository.findByMemberId(loginUser.getMemberId());
    }
}