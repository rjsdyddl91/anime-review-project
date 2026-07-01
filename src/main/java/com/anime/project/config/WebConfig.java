package com.anime.project.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(loginInterceptor) 
                .addPathPatterns("/review/**", "/comment/**", "/bookmark/**")
                .excludePathPatterns(
                        "/member/login",
                        "/member/join",
                        "/member/find-password",

                        // 리뷰 목록 조회는 비로그인도 가능
                        "/review/anime/**",

                        // 댓글 목록 조회는 비로그인도 가능
                        "/comment/review/**"
                );
    }
}