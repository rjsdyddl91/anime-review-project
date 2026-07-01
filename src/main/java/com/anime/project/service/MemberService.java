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
    private final MailService mailService;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    // =========================
    // 회원가입
    // =========================
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

    // =========================
    // 회원가입 이메일 인증 전 체크
    // =========================
    public void checkJoinEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }

        email = email.trim();

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }

        if (memberRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    // =========================
    // 로그인
    // =========================
    public Member login(String email, String password) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다"));

        if (!member.getPassword().equals(password)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다");
        }

        return member;
    }

    // =========================
    // 비밀번호 찾기
    // 기존 기능: 비밀번호 반환
    // 나중에 사용하지 않을 예정
    // =========================
    public String findPassword(String name, String phone, String email) {

        Member member = memberRepository.findByNameAndPhoneAndEmail(name, phone, email)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return member.getPassword();
    }

    // =========================
    // 임시 비밀번호 발급
    // =========================
    public void issueTempPassword(String name, String phone, String email) {

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }

        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("전화번호를 입력해주세요.");
        }

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }

        Member member = memberRepository.findByNameAndPhoneAndEmail(
                name.trim(),
                phone.trim(),
                email.trim()
        ).orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        String tempPassword = mailService.createTempPassword();

        member.setPassword(tempPassword);

        memberRepository.save(member);

        mailService.sendTempPassword(member.getEmail(), tempPassword);
    }

    // =========================
    // 비밀번호 변경
    // =========================
    public Member changePassword(Member loginUser,
                                 String currentPassword,
                                 String newPassword) {

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해주세요.");
        }

        Member member = memberRepository.findById(loginUser.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (!member.getPassword().equals(currentPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        member.setPassword(newPassword.trim());

        memberRepository.save(member);

        return member;
    }

    // =========================
    // 회원 전체 조회
    // =========================
    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    // =========================
    // 회원 삭제
    // =========================
    public void deleteMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        memberRepository.delete(member);
    }
}