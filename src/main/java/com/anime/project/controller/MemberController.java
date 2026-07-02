package com.anime.project.controller;

import com.anime.project.domain.member.Member;
import com.anime.project.service.MailService;
import com.anime.project.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MailService mailService;

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
    // 회원가입 이메일 인증코드 발송
    // =========================
    @PostMapping("/join/send-code")
    public String sendJoinCode(@RequestBody Map<String, String> body,
                               HttpSession session) {

        try {
            String email = body.get("email");

            memberService.checkJoinEmail(email);

            String authCode = mailService.createAuthCode();

            session.setAttribute("joinEmail", email.trim());
            session.setAttribute("joinCode", authCode);
            session.setAttribute("joinCodeTime", System.currentTimeMillis());
            session.setAttribute("joinVerified", false);

            mailService.sendAuthCode(email.trim(), authCode);

            return "join code sent";

        } catch (IllegalArgumentException e) {
            return e.getMessage();

        } catch (Exception e) {
            return "이메일 발송 중 오류가 발생했습니다.";
        }
    }

    // =========================
    // 회원가입 이메일 인증코드 확인
    // =========================
    @PostMapping("/join/verify-code")
    public String verifyJoinCode(@RequestBody Map<String, String> body,
                                 HttpSession session) {

        String email = body.get("email");
        String authCode = body.get("authCode");

        String savedEmail = (String) session.getAttribute("joinEmail");
        String savedCode = (String) session.getAttribute("joinCode");
        Long savedTime = (Long) session.getAttribute("joinCodeTime");

        if (email == null || email.trim().isEmpty()) {
            return "이메일을 입력해주세요.";
        }

        if (authCode == null || authCode.trim().isEmpty()) {
            return "인증코드를 입력해주세요.";
        }   

        if (savedEmail == null || savedCode == null || savedTime == null) {
            return "인증코드를 먼저 발송해주세요.";
        }

        if (!savedEmail.equals(email.trim())) {
            return "인증코드를 발송한 이메일과 일치하지 않습니다.";
        }

        long now = System.currentTimeMillis();
        long limitTime = 5 * 60 * 1000;

        if (now - savedTime > limitTime) {
            session.removeAttribute("joinEmail");
            session.removeAttribute("joinCode");
            session.removeAttribute("joinCodeTime");
            session.removeAttribute("joinVerified");

            return "인증 시간이 만료되었습니다. 다시 발송해주세요.";
        }

        if (!savedCode.equals(authCode.trim())) {
            return "인증코드가 일치하지 않습니다.";
        }

        session.setAttribute("joinVerified", true);

        return "join verified";
    }

    // =========================
    // 회원가입
    // =========================
    @PostMapping("/join")
    public String join(@RequestBody Member member,
                       HttpSession session) {

        try {
            Boolean joinVerified = (Boolean) session.getAttribute("joinVerified");
            String joinEmail = (String) session.getAttribute("joinEmail");

            if (joinVerified == null || !joinVerified) {
                return "이메일 인증을 완료해주세요.";
            }

            if (joinEmail == null || member.getEmail() == null
                    || !joinEmail.equals(member.getEmail().trim())) {
                return "인증한 이메일과 가입 이메일이 일치하지 않습니다.";
            }

            memberService.join(member);

            session.removeAttribute("joinEmail");
            session.removeAttribute("joinCode");
            session.removeAttribute("joinCodeTime");
            session.removeAttribute("joinVerified");

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
    // 비밀번호 변경
    // =========================
    @PutMapping("/password")
    public String changePassword(@RequestBody Map<String, String> body,
                                 HttpSession session) {

        try {
            Member loginUser = (Member) session.getAttribute("loginUser");

            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            String newPasswordCheck = body.get("newPasswordCheck");

            if (newPassword == null || newPasswordCheck == null
                    || !newPassword.equals(newPasswordCheck)) {
                return "새 비밀번호가 일치하지 않습니다.";
            }

            Member updatedMember = memberService.changePassword(
                    loginUser,
                    currentPassword,
                    newPassword
            );

            // 세션에 저장된 회원 정보도 최신 비밀번호로 갱신
            session.setAttribute("loginUser", updatedMember);

            return "password changed";

        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    // =========================
    // 임시 비밀번호 발급
    // =========================
    @PostMapping("/find-password")
    public String findPassword(@RequestBody Member member) {

        try {
            memberService.issueTempPassword(
                    member.getName(),
                    member.getPhone(),
                    member.getEmail()
            );

            return "temp password sent";

        } catch (IllegalArgumentException e) {
            return e.getMessage();

        } catch (Exception e) {
            return "임시 비밀번호 발송 중 오류가 발생했습니다.";
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