// src/main/java/com/example/demo/Security/JwtAuthFilter.java
package com.example.demo.Security;

import java.io.IOException;
import java.util.List;

import com.example.demo.Models.UserModel;
import com.example.demo.Repositories.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired
    private JwtService jwt; // ✅ usa o JwtService que criamos acima

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        String path = request.getRequestURI();
        String auth = request.getHeader("Authorization");

        log.info("[JwtAuthFilter] Requisição para {} - Authorization = {}", path, auth);

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);

            try {
                // valida token e extrai o e-mail
                String email = jwt.validateAndGetSubject(token);
                log.info("[JwtAuthFilter] Token válido para email = {}", email);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserModel user = userRepository.findByEmail(email).orElse(null);

                    if (user == null) {
                        log.warn("[JwtAuthFilter] Usuário não encontrado no banco para email = {}", email);
                    } else {
                        log.info("[JwtAuthFilter] Usuário encontrado: id={}, email={}",
                                user.getId(), user.getEmail());
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,   // principal
                                    null,    // credentials
                                    List.of() // authorities vazias
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("[JwtAuthFilter] Authentication registrado no SecurityContext para {}", email);
                }

            } catch (Exception e) {
                log.error("[JwtAuthFilter] Erro ao validar token: {}", e.getMessage(), e);

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                        "{\"error\":\"UNAUTHORIZED\",\"message\":\"Token inválido ou expirado\"}"
                );
                return;
            }

        } else {
            log.info("[JwtAuthFilter] Nenhum token Bearer na requisição para {}", path);
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();

        boolean ignorar =
                p.startsWith("/auth/") ||
                p.startsWith("/users/register");

        if (ignorar) {
            log.info("[JwtAuthFilter] Ignorando filtro JWT para {}", p);
        }

        return ignorar;
    }
}
