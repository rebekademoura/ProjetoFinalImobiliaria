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

        // default para status/destaque se vierem nulos
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

    // ========= UPDATE / DELETE (mantidos como estavam) =========

    public ImovelModel update(ImovelModel model) {
        try {
            if (find(model.getId()) != null) {
                return repository.save(model);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
