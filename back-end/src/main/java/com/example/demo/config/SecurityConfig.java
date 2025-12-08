// src/main/java/com/example/demo/config/SecurityConfig.java
package com.example.demo.config;

import com.example.demo.Security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS + CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            // Sessão stateless (JWT)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Autorização
            .authorizeHttpRequests(auth -> auth
                // Libera login, cadastro etc
                .requestMatchers("/auth/**").permitAll()

                // (Opcional) liberar /users em dev
                .requestMatchers("/users/**").permitAll()

                // Libera OPTIONS (preflight do browser)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // GET públicos
                .requestMatchers(HttpMethod.GET,
                        "/imoveis/**",
                        "/bairros/**",
                        "/tiposImoveis/**"
                ).permitAll()

                // POST públicos (dev)
                .requestMatchers(HttpMethod.POST,
                        "/imoveis/**",
                        "/bairros/**",
                        "/tiposImoveis/**"
                ).permitAll()

                // PUT públicos (dev)
                .requestMatchers(HttpMethod.PUT,
                        "/imoveis/**",
                        "/bairros/**",
                        "/tiposImoveis/**"
                ).permitAll()

                // DELETE públicos (dev)
                .requestMatchers(HttpMethod.DELETE,
                        "/imoveis/**",
                        "/bairros/**",
                        "/tiposImoveis/**"
                ).permitAll()

                // qualquer outra rota: precisa estar autenticado
                .anyRequest().authenticated()
            )

            // Filtro JWT antes do UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS para permitir o front (Next em outra porta)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Em dev pode liberar geral
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // PasswordEncoder usado no AuthController/UserService
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager se você usar em algum lugar
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
