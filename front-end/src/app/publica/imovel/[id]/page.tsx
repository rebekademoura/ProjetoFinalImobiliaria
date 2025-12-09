// src/app/publica/imovel/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buscarImovel, type Imovel } from "@/src/lib/api";

export default function ImovelPublicoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErro("ID do imóvel não informado na URL.");
      return;
    }

    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        console.log("Buscando imóvel com id =", id);
        const dados = await buscarImovel(id);
        setImovel(dados);
      } catch (e: any) {
        console.warn("Erro ao carregar imóvel:", e);
        const msg =
          e instanceof Error ? e.message : String(e?.message || e);

        if (msg.includes("404")) {
          setErro("Imóvel não encontrado.");
        } else {
          setErro("Ocorreu um erro ao carregar os dados do imóvel.");
        }
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  function formatarPreco(valor?: number | null) {
    if (valor === null || valor === undefined) return "-";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const precoPrincipal =
    imovel?.preco ??
    imovel?.precoVenda ??
    imovel?.precoAluguel ??
    undefined;

  const tituloPagina = imovel?.titulo ?? (id ? `Imóvel #${id}` : "Imóvel");

  // 🧠 tratar bairro: pode ser string ou objeto
  const nomeBairro =
    imovel && imovel.bairro
      ? typeof imovel.bairro === "string"
        ? imovel.bairro
        : imovel.bairro.nome
      : undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* topo: breadcrumb + voltar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="breadcrumb"
            className="text-xs font-medium text-slate-500"
          >
            <ol className="flex items-center gap-1">
              <li>
                <a
                  href="/publica"
                  className="text-slate-500 transition hover:text-slate-800"
                >
                  Início
                </a>
                <span className="mx-1 text-slate-400">/</span>
              </li>
              <li>
                <a
                  href="/publica"
                  className="text-slate-500 transition hover:text-slate-800"
                >
                  Imóveis
                </a>
                <span className="mx-1 text-slate-400">/</span>
              </li>
              <li className="text-slate-700">Detalhes</li>
            </ol>
          </nav>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <span className="text-sm">←</span>
            Voltar
          </button>
        </div>

        {/* título + chips */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {tituloPagina}
          </h1>

          {imovel && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imovel.finalidade && (
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
                  {imovel.finalidade === "VENDA"
                    ? "À venda"
                    : imovel.finalidade === "ALUGUEL"
                    ? "Para alugar"
                    : imovel.finalidade}
                </span>
              )}

              {imovel.status && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                  {imovel.status}
                </span>
              )}

              {imovel.destaque && (
                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-100">
                  Destaque
                </span>
              )}
            </div>
          )}
        </header>

        {/* estados de carregamento/erro */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <svg
              className="mr-3 h-5 w-5 animate-spin text-slate-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Carregando imóvel…
          </div>
        )}

        {!loading && erro && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {erro}
          </div>
        )}

        {!loading && !erro && !imovel && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Imóvel não encontrado.
          </div>
        )}

        {!loading && imovel && (
          <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Esquerda: imagem + descrição */}
            <section className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 shadow-sm">
                <div className="relative aspect-video">
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
                    Foto do imóvel
                  </div>

                  {imovel.finalidade && (
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {imovel.finalidade === "VENDA"
                        ? "Imóvel à venda"
                        : imovel.finalidade === "ALUGUEL"
                        ? "Imóvel para alugar"
                        : imovel.finalidade}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Descrição
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {imovel.descricao
                    ? imovel.descricao
                    : "Este imóvel ainda não possui uma descrição detalhada."}
                </p>
              </div>
            </section>

            {/* Direita: informações principais */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-3 text-base font-semibold text-slate-900">
                  Informações principais
                </h2>

                <div className="mb-4">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Valor
                  </span>
                  <span className="mt-1 block text-3xl font-semibold text-blue-600">
                    {precoPrincipal
                      ? formatarPreco(precoPrincipal)
                      : "Sob consulta"}
                  </span>

                  {(imovel.precoVenda || imovel.precoAluguel) && (
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {imovel.precoVenda && (
                        <div>
                          Venda:{" "}
                          <span className="font-semibold">
                            {formatarPreco(imovel.precoVenda)}
                          </span>
                        </div>
                      )}
                      {imovel.precoAluguel && (
                        <div>
                          Aluguel:{" "}
                          <span className="font-semibold">
                            {formatarPreco(imovel.precoAluguel)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Localização */}
                <div className="mb-4 space-y-1">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Localização
                  </span>
                  <div className="text-sm text-slate-800">
                    {imovel.endereco && (
                      <>
                        {imovel.endereco}
                        {imovel.numero && `, ${imovel.numero}`}
                        <br />
                      </>
                    )}
                    {(nomeBairro || imovel.cidade) && (
                      <>
                        {nomeBairro && <>{nomeBairro} - </>}
                        {imovel.cidade}
                        <br />
                      </>
                    )}
                    {imovel.cep && (
                      <span className="text-xs text-slate-500">
                        CEP: {imovel.cep}
                      </span>
                    )}
                  </div>
                  {imovel.complemento && (
                    <div className="text-xs text-slate-500">
                      Complemento: {imovel.complemento}
                    </div>
                  )}
                </div>

                <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Detalhes do cadastro */}
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Detalhes do cadastro
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    <li>
                      <span className="font-semibold">ID:</span> {imovel.id}
                    </li>
                    {imovel.tipoImovelId && (
                      <li>
                        <span className="font-semibold">Tipo (ID):</span>{" "}
                        {imovel.tipoImovelId}
                      </li>
                    )}
                    {imovel.bairroId && (
                      <li>
                        <span className="font-semibold">Bairro (ID):</span>{" "}
                        {imovel.bairroId}
                      </li>
                    )}
                    {imovel.status && (
                      <li>
                        <span className="font-semibold">Status:</span>{" "}
                        {imovel.status}
                      </li>
                    )}
                    {typeof imovel.destaque === "boolean" && (
                      <li>
                        <span className="font-semibold">Destaque:</span>{" "}
                        {imovel.destaque ? "Sim" : "Não"}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:flex-none"
                  >
                    Tenho interesse
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/publica")}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 md:flex-none"
                  >
                    Ver outros imóveis
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
