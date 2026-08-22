package com.studycircle.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class CookieUtils {

    @Value("${jwt.cookie-name:jwt_token}")
    private String cookieName;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public ResponseCookie createJwtCookie(String token, boolean secure) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtExpirationMs / 1000)
                .build();
    }

    public ResponseCookie createCleanJwtCookie(boolean secure) {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    public Optional<String> getJwtFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
