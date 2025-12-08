// src/main/java/com/example/demo/Controller/AuthController.java
package com.example.demo.Controller;

import com.example.demo.Models.UserModel;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Security.JwtService;
import com.example.demo.dtos.AuthResponseDTO;
import com.example.demo.dtos.LoginRequestDTO;
import com.example.demo.dtos.UserDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO data) {

        log.info("[AuthController] Tentativa de login para email={}", data.getEmail());

        // 1) Busca usuário por e-mail
        Optional<UserModel> optUser = userRepository.findByEmail(data.getEmail());
        if (optUser.isEmpty()) {
            log.warn("[AuthController] Usuário não encontrado para email={}", data.getEmail());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciais inválidas"));
        }

        UserModel user = optUser.get();
        log.info("[AuthController] Usuário encontrado: id={}, email={}", user.getId(), user.getEmail());

        String senhaDigitada = data.getPassword();
        String senhaBanco = user.getPassword();

        boolean senhaOk;

        // 2) Se a senha do banco parece ser um hash BCrypt, usa passwordEncoder.matches
        if (isBcryptHash(senhaBanco)) {
            senhaOk = passwordEncoder.matches(senhaDigitada, senhaBanco);
            log.info("[AuthController] Verificando senha com BCrypt: resultado={}", senhaOk);
        } else {
            // 3) Caso de ambiente de teste/legado com senha em texto puro
            senhaOk = senhaDigitada != null && senhaDigitada.equals(senhaBanco);
            log.warn("[AuthController] Senha no banco NÃO parece BCrypt. Comparando texto puro. resultado={}",
                    senhaOk);
        }

        if (!senhaOk) {
            log.warn("[AuthController] Senha inválida para email={}", data.getEmail());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciais inválidas"));
        }

        // 4) Gera token JWT
        String token = jwtService.generateToken(user);
        log.info("[AuthController] Login bem-sucedido para email={}", data.getEmail());

        // 5) Monta resposta
        UserDTO userDTO = new UserDTO(user);
        AuthResponseDTO response = new AuthResponseDTO(token, userDTO);

        return ResponseEntity.ok(response);
    }

    /**
     * Heurística simples para identificar se uma string parece um hash BCrypt.
     * Não muda nada pra quem já salva hash correto; só evita matches errados.
     */
    private boolean isBcryptHash(String s) {
        if (s == null) return false;
        // bcrypt tipicamente começa com $2a$, $2b$, $2y$ e tem ~60 chars
        return s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
    }
}
