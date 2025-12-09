// src/main/java/com/example/demo/Services/ImovelService.java
package com.example.demo.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Models.BairroModel;
import com.example.demo.Models.ImovelModel;
import com.example.demo.Models.TiposImoveisModel;
import com.example.demo.Models.UserModel;
import com.example.demo.Repositories.BairroRepository;
import com.example.demo.Repositories.ImovelRepository;
import com.example.demo.Repositories.TiposImoveisRepository;
import com.example.demo.dtos.ImovelRequestDTO;

@Service
public class ImovelService {

    private final ImovelRepository repository;
    private final BairroRepository bairroRepository;
    private final TiposImoveisRepository tiposImoveisRepository;

    @Autowired
    public ImovelService(
            ImovelRepository repository,
            BairroRepository bairroRepository,
            TiposImoveisRepository tiposImoveisRepository) {
        this.repository = repository;
        this.bairroRepository = bairroRepository;
        this.tiposImoveisRepository = tiposImoveisRepository;
    }

    // ========= LISTAR / BUSCAR =========

    public List<ImovelModel> getAll() {
        return repository.findAll();
    }

    public ImovelModel find(Integer id) {
        Optional<ImovelModel> model = repository.findById(id);
        return model.orElse(null);
    }

    /**
     * Lista apenas os imóveis cadastrados por um determinado usuário
     * (usado em /imoveis/meus).
     */
    public List<ImovelModel> listarPorUsuario(UserModel usuario) {
        if (usuario == null || usuario.getId() == null) {
            throw new IllegalArgumentException("Usuário inválido para listagem de imóveis.");
        }
        return repository.findByUsuario(usuario);
        // Se você tiver usado findByUsuarioId no repository, use:
        // return repository.findByUsuarioId(usuario.getId());
    }

    // ========= INSERIR A PARTIR DO DTO =========

    public ImovelModel insertFromDto(ImovelRequestDTO dto, UserModel usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário não informado para o cadastro do imóvel.");
        }

        ImovelModel imovel = new ImovelModel();

        imovel.setTitulo(dto.getTitulo());
        imovel.setDescricao(dto.getDescricao());
        imovel.setCaracteristicas(dto.getCaracteristicas());
        imovel.setFinalidade(dto.getFinalidade());
        imovel.setStatus(dto.getStatus());
        imovel.setDestaque(dto.getDestaque() != null ? dto.getDestaque() : Boolean.FALSE);

        imovel.setDormitorios(dto.getDormitorios());
        imovel.setBanheiros(dto.getBanheiros());
        imovel.setGaragem(dto.getGaragem());

        imovel.setPrecoVenda(dto.getPrecoVenda());
        imovel.setPrecoAluguel(dto.getPrecoAluguel());
        imovel.setAreaConstruida(dto.getAreaConstruida());
        imovel.setAreaTotal(dto.getAreaTotal());

        imovel.setEndereco(dto.getEndereco());
        imovel.setNumero(dto.getNumero());
        imovel.setComplemento(dto.getComplemento());
        imovel.setCep(dto.getCep());
        imovel.setCidade(dto.getCidade());

        // 🔗 BAIRRO
        if (dto.getBairroId() != null) {
            BairroModel bairro = bairroRepository.findById(dto.getBairroId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Bairro não encontrado: " + dto.getBairroId()));
            imovel.setBairro(bairro);
        }

        // 🔗 TIPO DE IMÓVEL
        if (dto.getTipoImovelId() != null) {
            TiposImoveisModel tipo = tiposImoveisRepository.findById(dto.getTipoImovelId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Tipo de imóvel não encontrado: " + dto.getTipoImovelId()));
            imovel.setTipoImovel(tipo);
        }

        // 🔗 USUÁRIO DONO / CORRETOR
        imovel.setUsuario(usuario);

        // defaults
        if (imovel.getStatus() == null || imovel.getStatus().isBlank()) {
            imovel.setStatus("ATIVO");
        }
        if (imovel.getDestaque() == null) {
            imovel.setDestaque(Boolean.FALSE);
        }

        return repository.save(imovel);
    }

    // ========= (LEGADO) INSERIR DIRETO COM MODEL, SE AINDA FOR USADO =========

    public ImovelModel insert(ImovelModel model) {
        return repository.save(model);
    }

    // ========= UPDATE / DELETE =========

    public ImovelModel update(ImovelModel model) {
    Integer id = model.getId();

    Optional<ImovelModel> opt = repository.findById(id);
    if (opt.isEmpty()) {
        return null; // vai virar 404 lá no controller
    }

    ImovelModel existente = opt.get();

    // Copia os campos que podem ser alterados
    existente.setTitulo(model.getTitulo());
    existente.setDescricao(model.getDescricao());
    existente.setCaracteristicas(model.getCaracteristicas());
    existente.setFinalidade(model.getFinalidade());
    existente.setPrecoVenda(model.getPrecoVenda());
    existente.setPrecoAluguel(model.getPrecoAluguel());
    existente.setEndereco(model.getEndereco());
    existente.setNumero(model.getNumero());
    existente.setCep(model.getCep());
    existente.setComplemento(model.getComplemento());
    existente.setStatus(model.getStatus());
    existente.setDormitorios(model.getDormitorios());
    existente.setBanheiros(model.getBanheiros());
    existente.setGaragem(model.getGaragem());
    existente.setAreaConstruida(model.getAreaConstruida());
    existente.setAreaTotal(model.getAreaTotal());

    // se tiver relacionamentos:
    existente.setBairro(model.getBairro());
    existente.setTipoImovel(model.getTipoImovel());
    existente.setUsuario(model.getUsuario());

    return repository.save(existente);
}


    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
