package com.anime.project.service;

import com.anime.project.domain.member.Member;
import com.anime.project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    public void join(Member member) {

        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }

        if (member.getPhone() == null || member.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("전화번호를 입력해주세요.");
        }

        if (member.getEmail() == null || member.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }

        if (!EMAIL_PATTERN.matcher(member.getEmail()).matches()) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }

        if (member.getPassword() == null || member.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }

        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        if (memberRepository.existsByPhone(member.getPhone())) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        member.setName(member.getName().trim());
        member.setPhone(member.getPhone().trim());
        member.setEmail(member.getEmail().trim());
        member.setRole("USER");
        member.setCreatedAt(LocalDateTime.now());

        memberRepository.save(member);
    }

    public Member login(String email, String password) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다"));

        if (!member.getPassword().equals(password)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다");
        }

        return member;
    }

    public String findPassword(String name, String phone, String email) {

        Member member = memberRepository.findByNameAndPhoneAndEmail(name, phone, email)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return member.getPassword();
    }

    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    public void deleteMember(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        memberRepository.delete(member);
    }
}