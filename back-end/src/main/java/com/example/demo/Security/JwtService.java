// src/main/java/com/example/demo/Security/JwtService.java
package com.example.demo.Security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import com.example.demo.Models.UserModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;

@Service
public class JwtService {

    // segredo usado para assinar e validar o JWT
    @Value("${api.security.token.secret}")
    private String secret;

    // expiração em milissegundos (padrão: 24h)
    @Value("${api.security.token.expiration-ms:86400000}")
    private long expirationMs;

    /** Cria a chave criptográfica a partir da string do .properties */
    private Key getSigningKey() {
        // usa os bytes da string diretamente (NÃO tenta decodificar Base64)
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // HS256 exige pelo menos 256 bits (32 bytes) → garante uma chave forte
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Gera o token JWT a partir do usuário */
    public String generateToken(UserModel user) {
        Date agora = new Date();
        Date expira = new Date(agora.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(user.getEmail())              // sub = email
                .claim("role", user.getRole())            // payload extra
                .claim("name", user.getName())
                .setIssuedAt(agora)
                .setExpiration(expira)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 👈 aqui mudou
                .compact();
    }

    /** Valida o token e devolve o subject (email) */
    public String validateAndGetSubject(String token) {
        Claims claims = Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())           // 👈 mesmo segredo
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject(); // email
    }
}
