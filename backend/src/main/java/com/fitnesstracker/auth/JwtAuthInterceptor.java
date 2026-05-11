package com.fitnesstracker.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Value("${SUPABASE_URL:https://qzclbwnfnxxclyvqucrg.supabase.co}")
    private String supabaseUrl;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            return false;
        }

        try {
            String token = authHeader.substring(7);
            DecodedJWT jwt = JWT.decode(token);
            String userId = jwt.getSubject();
            if (userId == null || userId.isEmpty()) {
                response.setStatus(401);
                response.getWriter().write("{\"error\":\"Invalid token: no subject\"}");
                return false;
            }
            request.setAttribute("userId", userId);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            response.getWriter().write("{\"error\":\"Invalid token\"}");
            return false;
        }
    }
}
