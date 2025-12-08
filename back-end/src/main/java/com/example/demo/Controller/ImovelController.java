// src/main/java/com/example/demo/Controller/ImovelController.java
package com.example.demo.Controller;

import java.net.URI;
import java.util.List;

import com.example.demo.Models.ImovelModel;
import com.example.demo.Models.UserModel;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.ImovelService;
import com.example.demo.dtos.ImovelRequestDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/imoveis")
public class ImovelController {

    private static final Logger log = LoggerFactory.getLogger(ImovelController.class);

    @Autowired
    private ImovelService service;

    @Autowired
    private UserRepository userRepository;

    // ========= LISTAGENS =========

    @GetMapping
    public ResponseEntity<List<ImovelModel>> getAllImoveis() {
        log.info("[ImovelController] GET /imoveis chamado");
        List<ImovelModel> list = service.getAll();
        log.info("[ImovelController] Retornando {} imóveis", list.size());
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImovelModel> find(@PathVariable Integer id) {
        log.info("[ImovelController] GET /imoveis/{} chamado", id);
        ImovelModel model = service.find(id);
        if (model != null) {
            log.info("[ImovelController] Imóvel encontrado: id={}", id);
            return ResponseEntity.status(HttpStatus.OK).body(model);
        } else {
            log.warn("[ImovelController] Imóvel NÃO encontrado: id={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ========= CRIAR COM DTO + USUÁRIO DA SESSÃO =========

    @PostMapping
    public ResponseEntity<ImovelModel> insert(
            @RequestBody ImovelRequestDTO dto,
            Authentication authentication) {

        log.info("[ImovelController] POST /imoveis chamado. Authentication = {}", authentication);

        UserModel usuario = getUsuarioLogado(authentication);

        log.info("[ImovelController] Usuário logado: id={}, email={}",
                usuario.getId(), usuario.getEmail());

        log.info(
                "[ImovelController] DTO recebido: titulo='{}', bairroId={}, tipoImovelId={}, precoVenda={}, precoAluguel={}",
                dto.getTitulo(), dto.getBairroId(), dto.getTipoImovelId(),
                dto.getPrecoVenda(), dto.getPrecoAluguel());

        ImovelModel model = service.insertFromDto(dto, usuario);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(model.getId())
                .toUri();

        log.info("[ImovelController] Imóvel salvo com id={}", model.getId());

        return ResponseEntity.created(uri).body(model);
    }

    // ========= UPDATE =========

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @RequestBody ImovelModel model,
            @PathVariable Integer id) {
        try {
            log.info("[ImovelController] PUT /imoveis/{} chamado", id);
            model.setId(id);
            ImovelModel atualizado = service.update(model);
            if (atualizado == null) {
                log.warn("[ImovelController] Imóvel não encontrado para update: id={}", id);
                return ResponseEntity.notFound().build();
            }
            log.info("[ImovelController] Imóvel atualizado: id={}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("[ImovelController] Erro ao atualizar imóvel id={}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    // ========= DELETE =========

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.info("[ImovelController] DELETE /imoveis/{} chamado", id);
        service.delete(id);
        log.info("[ImovelController] Imóvel removido: id={}", id);
        return ResponseEntity.noContent().build();
    }

    // ========= AUXILIAR =========

    private UserModel getUsuarioLogado(Authentication authentication) {
        log.info("[ImovelController] getUsuarioLogado() - authentication = {}", authentication);

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            log.warn("[ImovelController] Usuário não autenticado. authentication = {}", authentication);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        String email = authentication.getName();
        log.info("[ImovelController] Buscando usuário por email = {}", email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[ImovelController] Usuário não encontrado para email = {}", email);
                    return new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED, "Usuário não encontrado");
                });
    }
}
