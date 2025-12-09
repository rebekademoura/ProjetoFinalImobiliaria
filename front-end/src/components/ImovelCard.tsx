// src/components/ImovelCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { Imovel } from "@/src/lib/api";

type Props = {
  imovel: Imovel;
};

// Deixamos mais flexível pra não dar erro de tipo
function formatarPreco(imovel: any): string {
  const finalidade = imovel?.finalidade ?? "VENDA";

  const preco =
    finalidade === "ALUGUEL"
      ? imovel?.precoAluguel ?? imovel?.precoVenda
      : imovel?.precoVenda ?? imovel?.precoAluguel;

  if (!preco) return "Consulte";

  return Number(preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ImovelCard({ imovel }: Props) {
  const anyImovel = imovel as any;

  // ===== Fotos =====
  const fotos = Array.isArray(anyImovel.fotos) ? anyImovel.fotos : [];
  const capa =
    fotos && fotos.length > 0
      ? fotos.find((f: any) => f?.capa) ?? fotos[0]
      : undefined;

  // ===== Bairro (pode ser string ou objeto) =====
  const rawBairro = anyImovel.bairro;

  let bairroNome: string | undefined;
  let bairroCidadeEstado: string | undefined;

  if (rawBairro) {
    if (typeof rawBairro === "string") {
      bairroNome = rawBairro;
    } else {
      // tenta pegar como objeto
      bairroNome = rawBairro?.nome;
      if (rawBairro?.cidade && rawBairro?.estado) {
        bairroCidadeEstado = `${rawBairro.cidade}/${rawBairro.estado}`;
      }
    }
  }

  // ===== Endereço (só com strings seguras) =====
  const enderecoPartes: string[] = [];

  if (anyImovel.endereco && anyImovel.numero != null) {
    enderecoPartes.push(`${anyImovel.endereco}, ${anyImovel.numero}`);
  }

  if (bairroNome) enderecoPartes.push(bairroNome);
  if (bairroCidadeEstado) enderecoPartes.push(bairroCidadeEstado);

  const endereco = enderecoPartes.join(" - ");

  const finalidade = anyImovel.finalidade === "ALUGUEL" ? "ALUGUEL" : "VENDA";
  const finalidadeLabel = finalidade === "ALUGUEL" ? "Aluguel" : "Venda";
  const precoFormatado = formatarPreco(anyImovel);

  const finalidadeClasse =
    finalidade === "ALUGUEL"
      ? "bg-indigo-500/10 text-indigo-700 border-indigo-200"
      : "bg-emerald-500/10 text-emerald-700 border-emerald-200";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Imagem de capa (se existir) */}
      {capa && (
        <div className="relative w-full h-48">
          <Image
            src={capa.caminho ?? capa.url ?? "/placeholder.jpg"}
            alt={anyImovel.titulo ?? "Imóvel"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Finalidade + preço */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${finalidadeClasse}`}
          >
            {finalidadeLabel}
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {precoFormatado}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
          {anyImovel.titulo ?? "Imóvel sem título"}
        </h3>

        {/* Endereço */}
        {endereco && (
          <p className="text-xs text-gray-500 line-clamp-1">
            <span className="mr-1" aria-hidden>
              📍
            </span>
            {endereco}
          </p>
        )}

        {/* Descrição resumida */}
        {anyImovel.descricao && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {anyImovel.descricao}
          </p>
        )}

        {/* Botão */}
        <div className="mt-auto pt-2">
          <Link
            href={`/publica/imovel/${anyImovel.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
