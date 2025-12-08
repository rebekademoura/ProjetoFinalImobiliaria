// src/app/privado/imoveis/[id]/editar/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Menu from "@/src/components/Menu";
import {
  Bairro,
  TipoImovel,
  listarBairros,
  listarTiposImoveis,
  // você cria essas duas no lib/api:
  // obterImovel,
  // atualizarImovel,
} from "@/src/lib/api";

type FormState = {
  titulo: string;
  descricao: string;
  caracteristicas: string;
  finalidade: "VENDA" | "ALUGUEL";
  precoVenda: string;
  precoAluguel: string;
  endereco: string;
  numero: string;
  cep: string;
  complemento: string;
  status: string;
  destaque: boolean;
  dormitorios: string;
  banheiros: string;
  garagem: string;
  areaConstruida: string;
  areaTotal: string;
  bairroId: string;
  tipoImovelId: string;
};

export default function EditarImovelPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [tipos, setTipos] = useState<TipoImovel[]>([]);
  const [form, setForm] = useState<FormState>({
    titulo: "",
    descricao: "",
    caracteristicas: "",
    finalidade: "VENDA",
    precoVenda: "",
    precoAluguel: "",
    endereco: "",
    numero: "",
    cep: "",
    complemento: "",
    status: "ATIVO",
    destaque: false,
    dormitorios: "",
    banheiros: "",
    garagem: "",
    areaConstruida: "",
    areaTotal: "",
    bairroId: "",
    tipoImovelId: "",
  });
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Carregar bairros, tipos e os dados do imóvel
  useEffect(() => {
    async function carregarDados() {
      try {
        setMensagem(null);
        setCarregando(true);

        const [listaBairros, listaTipos] = await Promise.all([
          listarBairros(),
          listarTiposImoveis(),
        ]);

        setBairros(listaBairros);
        setTipos(listaTipos);

        // 👉 Buscar imóvel na API
        // Crie em src/lib/api.ts algo como:
        // export async function obterImovel(id: number) { ... }
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        // se GET /imoveis/{id} estiver liberado, não precisa de token aqui
        const resposta = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/imoveis/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!resposta.ok) {
          throw new Error(`Erro ao carregar imóvel (HTTP ${resposta.status})`);
        }

        const imovel = await resposta.json();

        // Ajuste os campos conforme o DTO que tua API devolve
        setForm({
          titulo: imovel.titulo ?? "",
          descricao: imovel.descricao ?? "",
          caracteristicas: imovel.caracteristicas ?? "",
          finalidade: imovel.finalidade ?? "VENDA",
          precoVenda: imovel.precoVenda != null ? String(imovel.precoVenda) : "",
          precoAluguel:
            imovel.precoAluguel != null ? String(imovel.precoAluguel) : "",
          endereco: imovel.endereco ?? "",
          numero: imovel.numero ?? "",
          cep: imovel.cep ?? "",
          complemento: imovel.complemento ?? "",
          status: imovel.status ?? "ATIVO",
          destaque: imovel.destaque ?? false,
          dormitorios:
            imovel.dormitorios != null ? String(imovel.dormitorios) : "",
          banheiros: imovel.banheiros != null ? String(imovel.banheiros) : "",
          garagem: imovel.garagem != null ? String(imovel.garagem) : "",
          areaConstruida:
            imovel.areaConstruida != null
              ? String(imovel.areaConstruida)
              : "",
          areaTotal:
            imovel.areaTotal != null ? String(imovel.areaTotal) : "",
          bairroId: imovel.bairroId
            ? String(imovel.bairroId)
            : imovel.bairro?.id
            ? String(imovel.bairro.id)
            : "",
          tipoImovelId: imovel.tipoImovelId
            ? String(imovel.tipoImovelId)
            : imovel.tipoImovel?.id
            ? String(imovel.tipoImovel.id)
            : "",
        });
      } catch (erro) {
        console.error(erro);
        setMensagem(
          (erro as Error).message ||
          "Não foi possível carregar os dados do imóvel."
        );
      } finally {
        setCarregando(false);
      }
    }

    if (!Number.isNaN(id)) {
      carregarDados();
    }
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setMensagem("Você precisa estar logado para editar imóveis.");
      return;
    }

    try {
      setSalvando(true);

      const dormitorios = form.dormitorios ? Number(form.dormitorios) : 0;
      const banheiros = form.banheiros ? Number(form.banheiros) : 0;
      const garagem = form.garagem ? Number(form.garagem) : 0;

      const precoVenda = form.precoVenda
        ? Number(form.precoVenda.replace(",", "."))
        : null;
      const precoAluguel = form.precoAluguel
        ? Number(form.precoAluguel.replace(",", "."))
        : null;
      const areaConstruida = form.areaConstruida
        ? Number(form.areaConstruida.replace(",", "."))
        : null;
      const areaTotal = form.areaTotal
        ? Number(form.areaTotal.replace(",", "."))
        : null;

      // Se você tiver atualizarImovel() no lib/api, pode usar aqui:
      // await atualizarImovel(id, { ... }, token);
      const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/imoveis/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo: form.titulo,
            descricao: form.descricao,
            caracteristicas: form.caracteristicas || undefined,
            finalidade: form.finalidade,
            precoVenda,
            precoAluguel,
            endereco: form.endereco,
            numero: form.numero,
            cep: form.cep,
            complemento: form.complemento || undefined,
            status: form.status,
            destaque: form.destaque,
            dormitorios,
            banheiros,
            garagem,
            areaConstruida,
            areaTotal,
            bairroId: Number(form.bairroId),
            tipoImovelId: Number(form.tipoImovelId),
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(`Erro ao atualizar imóvel (HTTP ${resposta.status})`);
      }

      setMensagem("Imóvel atualizado com sucesso.");
      // Se quiser voltar pra listagem:
      // router.push("/privado/imoveis");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar imóvel: " + (error as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Menu />

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Editar imóvel</h1>
          <p className="text-sm text-gray-600">
            Atualize as informações do imóvel e clique em &quot;Salvar&quot;.
          </p>
        </header>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          {carregando ? (
            <p className="text-sm text-gray-600">Carregando dados...</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 text-sm md:grid-cols-2"
            >
              <div className="space-y-1 md:col-span-2">
                <label className="font-medium">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  className="w-full rounded-md border px-2 py-1"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-medium">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    handleChange("descricao", e.target.value)
                  }
                  className="min-h-[80px] w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-medium">
                  Características (separe por vírgula)
                </label>
                <textarea
                  value={form.caracteristicas}
                  onChange={(e) =>
                    handleChange("caracteristicas", e.target.value)
                  }
                  placeholder="Ex.: Sacada, Churrasqueira, Piscina, Lareira..."
                  className="min-h-[70px] w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Finalidade</label>
                <select
                  value={form.finalidade}
                  onChange={(e) =>
                    handleChange(
                      "finalidade",
                      e.target.value as "VENDA" | "ALUGUEL"
                    )
                  }
                  className="w-full rounded-md border px-2 py-1"
                >
                  <option value="VENDA">Venda</option>
                  <option value="ALUGUEL">Aluguel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium">Status</label>
                <input
                  type="text"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Preço de venda (R$)</label>
                <input
                  type="text"
                  value={form.precoVenda}
                  onChange={(e) =>
                    handleChange("precoVenda", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Preço de aluguel (R$)</label>
                <input
                  type="text"
                  value={form.precoAluguel}
                  onChange={(e) =>
                    handleChange("precoAluguel", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Dormitórios</label>
                <input
                  type="number"
                  min={0}
                  value={form.dormitorios}
                  onChange={(e) =>
                    handleChange("dormitorios", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Banheiros</label>
                <input
                  type="number"
                  min={0}
                  value={form.banheiros}
                  onChange={(e) =>
                    handleChange("banheiros", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Vagas de garagem</label>
                <input
                  type="number"
                  min={0}
                  value={form.garagem}
                  onChange={(e) =>
                    handleChange("garagem", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Área construída (m²)</label>
                <input
                  type="text"
                  value={form.areaConstruida}
                  onChange={(e) =>
                    handleChange("areaConstruida", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Área total (m²)</label>
                <input
                  type="text"
                  value={form.areaTotal}
                  onChange={(e) =>
                    handleChange("areaTotal", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="grid gap-4 md:col-span-2 md:grid-cols-[2fr,1fr]">
                <div className="space-y-1">
                  <label className="font-medium">Endereço</label>
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={(e) =>
                      handleChange("endereco", e.target.value)
                    }
                    className="w-full rounded-md border px-2 py-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium">Número</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) =>
                      handleChange("numero", e.target.value)
                    }
                    className="w-full rounded-md border px-2 py-1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium">CEP</label>
                <input
                  type="text"
                  value={form.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Complemento</label>
                <input
                  type="text"
                  value={form.complemento}
                  onChange={(e) =>
                    handleChange("complemento", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Bairro</label>
                <select
                  value={form.bairroId}
                  onChange={(e) =>
                    handleChange("bairroId", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                  required
                >
                  <option value="">Selecione...</option>
                  {bairros.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome} - {b.cidade}/{b.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium">Tipo de imóvel</label>
                <select
                  value={form.tipoImovelId}
                  onChange={(e) =>
                    handleChange("tipoImovelId", e.target.value)
                  }
                  className="w-full rounded-md border px-2 py-1"
                  required
                >
                  <option value="">Selecione...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="destaque"
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(e) =>
                    handleChange("destaque", e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="destaque" className="text-sm">
                  Imóvel em destaque
                </label>
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">

                <div className="flex items-center gap-3">
                  {mensagem && (
                    <p className="text-xs text-gray-700 max-w-[220px]">
                      {mensagem}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={salvando}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                  >
                    {salvando ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
