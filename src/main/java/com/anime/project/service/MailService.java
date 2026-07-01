package com.anime.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;

    // =========================
    // 이메일 인증코드 생성
    // =========================
    public String createAuthCode() {

        Random random = new Random();

        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }

        return code.toString();
    }

    // =========================
    // 임시 비밀번호 생성
    // =========================
    public String createTempPassword() {

        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();

        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 10; i++) {
            int index = random.nextInt(chars.length());
            password.append(chars.charAt(index));
        }

        return password.toString();
    }

    // =========================
    // 회원가입 인증코드 이메일 발송
    // =========================
    public void sendAuthCode(String email, String authCode) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("[Anime Review] 회원가입 이메일 인증코드");
        message.setText(
                "Anime Review 회원가입 이메일 인증코드입니다.\n\n"
                        + "인증코드: " + authCode + "\n\n"
                        + "인증코드는 5분 이내에 입력해주세요."
        );

        javaMailSender.send(message);
    }

    // =========================
    // 임시 비밀번호 이메일 발송
    // =========================
    public void sendTempPassword(String email, String tempPassword) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("[Anime Review] 임시 비밀번호 안내");
        message.setText(
                "Anime Review 임시 비밀번호입니다.\n\n"
                        + "임시 비밀번호: " + tempPassword + "\n\n"
                        + "로그인 후 마이페이지에서 비밀번호를 변경해주세요."
        );

        javaMailSender.send(message);
    }
}