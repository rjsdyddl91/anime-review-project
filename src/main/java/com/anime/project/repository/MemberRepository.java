package com.anime.project.repository;

import com.anime.project.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 이메일 존재 여부 체크
    boolean existsByEmail(String email);

    // 전화번호 존재 여부 체크
    boolean existsByPhone(String phone);

    // 이메일로 회원 찾기
    Optional<Member> findByEmail(String email);

    // 이름 + 전화번호 + 이메일로 회원 찾기
    Optional<Member> findByNameAndPhoneAndEmail(String name, String phone, String email);
}