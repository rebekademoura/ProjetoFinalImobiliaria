// src/main/java/com/example/demo/dtos/ImovelRequestDTO.java
package com.example.demo.dtos;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImovelRequestDTO {

    private String titulo;
    private String descricao;
    private String caracteristicas;

    private String finalidade;
    private String status;
    private Boolean destaque;

    private Integer dormitorios;
    private Integer banheiros;
    private Integer garagem;

    private BigDecimal precoVenda;
    private BigDecimal precoAluguel;
    private BigDecimal areaConstruida;
    private BigDecimal areaTotal;

    // Endereço
    private String endereco;
    private String numero;
    private String complemento;
    private String cep;
    private String cidade; // se quiser já guardar

    // FKs vindas do formulário
    private Integer bairroId;
    private Integer tipoImovelId;
}
