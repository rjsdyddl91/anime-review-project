package com.anime.project.controller;

import com.anime.project.domain.member.Member;
import com.anime.project.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // =========================
    // 관리자 권한 체크
    // =========================
    private void checkAdmin(HttpSession session) {

        Member loginUser = (Member) session.getAttribute("loginUser");

        if (loginUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        if (!"ADMIN".equals(loginUser.getRole())) {
            throw new IllegalArgumentException("관리자만 가능합니다.");
        }
    }

    // =========================
    // 테스트
    // =========================
    @GetMapping("/test")
    public String test() {
        return "ok";
    }

    // =========================
    // 회원가입
    // =========================
    @PostMapping("/join")
    public String join(@RequestBody Member member) {

        try {
            memberService.join(member);
            return "success";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 로그인
    // =========================
    @PostMapping("/login")
    public String login(@RequestBody Member member,
                        HttpSession session) {

        try {
            Member loginUser = memberService.login(
                    member.getEmail(),
                    member.getPassword()
            );

            // 로그인 성공 시 세션 저장
            session.setAttribute("loginUser", loginUser);

            return "login success";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 로그인 사용자 확인
    // =========================
    @GetMapping("/me")
    public Member me(HttpSession session) {

        return (Member) session.getAttribute("loginUser");
    }

    // =========================
    // 로그아웃
    // =========================
    @PostMapping("/logout")
    public String logout(HttpSession session) {

        session.invalidate();

        return "logout success";
    }

    // =========================
    // 비밀번호 찾기
    // =========================
    @PostMapping("/find-password")
    public String findPassword(@RequestBody Member member) {

        try {
            return memberService.findPassword(
                    member.getName(),
                    member.getPhone(),
                    member.getEmail()
            );

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 회원 전체 조회
    // =========================
    @GetMapping("/list")
    public Object findAllMembers(HttpSession session) {

        try {
            checkAdmin(session);

            return memberService.findAllMembers();

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 회원 삭제
    // =========================
    @DeleteMapping("/{memberId}")
    public String deleteMember(@PathVariable Long memberId,
                               HttpSession session) {

        try {
            checkAdmin(session);

            memberService.deleteMember(memberId);

            return "member deleted";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }
}