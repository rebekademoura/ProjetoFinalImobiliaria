// src/main/java/com/example/demo/Repositories/ImovelRepository.java
package com.example.demo.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Models.ImovelModel;
import com.example.demo.Models.UserModel;

@Repository
public interface ImovelRepository extends JpaRepository<ImovelModel, Integer> {

    // buscar todos os imóveis de um usuário específico
    List<ImovelModel> findByUsuario(UserModel usuario);

    // se preferir usar só o ID:
    // List<ImovelModel> findByUsuarioId(Integer usuarioId);
}
