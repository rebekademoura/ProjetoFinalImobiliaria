// src/app/publica/page.tsx
import Link from "next/link";
import Menu from "@/src/components/Menu";
import ImovelCard from "@/src/components/ImovelCard";
import { listarImoveis } from "@/src/lib/api";

type PageProps = {
  // no Next novo, searchParams é uma Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function PublicaHome({ searchParams }: PageProps) {
  // aguardamos o searchParams
  const resolved = await searchParams;

  const finalidadeRaw = resolved["finalidade"];
  const finalidadeParam = Array.isArray(finalidadeRaw)
    ? finalidadeRaw[0]
    : finalidadeRaw;

  // valor padrão: VENDA
  const finalidade: "VENDA" | "ALUGUEL" =
    (finalidadeParam || "VENDA").toUpperCase() === "ALUGUEL"
      ? "ALUGUEL"
      : "VENDA";

  let imoveis: any[] = [];
  let erroCarregamento = false;

  try {
    // busca do backend já por finalidade
    const resultado = await listarImoveis(finalidade);
    // garantia extra: filtrar também pelo campo "finalidade" do imóvel
    imoveis = (resultado || []).filter(
      (imovel: any) =>
        imovel?.finalidade &&
        imovel.finalidade.toString().toUpperCase() === finalidade
    );
  } catch (e) {
    console.error("Erro ao listar imóveis:", e);
    erroCarregamento = true;
  }

  const labelFinalidade = finalidade === "VENDA" ? "compra" : "aluguel";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60 text-foreground">
      <Menu />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho / Hero simples */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Encontre seu próximo imóvel
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              Imóveis para {labelFinalidade}
            </h1>
            
          </div>

          {/* Filtro de finalidade */}
          <div className="inline-flex items-center gap-2 rounded-full bg-background/60 px-2 py-2 shadow-sm border border-foreground/10">
            <span className="px-3 text-xs font-medium text-foreground/70">
              Finalidade
            </span>

            <Link
              href={{ pathname: "/publica", query: { finalidade: "VENDA" } }}
              className={`px-4 py-2 text-sm rounded-full transition-all border ${
                finalidade === "VENDA"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background text-foreground border-foreground/20 hover:border-primary/40"
              }`}
            >
              Comprar
            </Link>

            <Link
              href={{ pathname: "/publica", query: { finalidade: "ALUGUEL" } }}
              className={`px-4 py-2 text-sm rounded-full transition-all border ${
                finalidade === "ALUGUEL"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background text-foreground border-foreground/20 hover:border-primary/40"
              }`}
            >
              Alugar
            </Link>
          </div>
        </section>

        {/* Barra de status / contagem */}
        <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-foreground/70">
            Exibindo{" "}
            <span className="font-semibold">
              {imoveis.length} imóvel
              {imoveis.length !== 1}
            </span>{" "}
            para {labelFinalidade}.
          </p>
          {erroCarregamento && (
            <p className="text-sm text-red-500">
              Não foi possível carregar os imóveis. Tente novamente mais tarde.
            </p>
          )}
        </section>

        {/* Lista de cards */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {!erroCarregamento && imoveis.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-foreground/20 bg-background/60 p-6 text-center text-sm text-foreground/80">
              Nenhum imóvel encontrado para{" "}
              <span className="font-semibold">{labelFinalidade}</span> no
              momento. Tente alterar o filtro ou voltar mais tarde.
            </div>
          )}

          {imoveis.map((imovel) => (
            <div
              key={imovel.id}
              className="group rounded-2xl border border-foreground/10 bg-background/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
            >
              {/* Se o ImovelCard já monta o card completo, só use ele aqui */}
              <ImovelCard imovel={imovel} />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
