// src/app/privado/corretor/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Menu from "@/src/components/Menu";
import RequireAuth from "@/src/components/RequireAuth";
import type { Imovel, Usuario } from "@/src/lib/api";
import {
  listarImoveisDoCorretor,
  obterMeuUsuario,
  atualizarMeuUsuario,
  atualizarMinhaSenha,
  excluirImovel, // <- ADICIONADO
} from "@/src/lib/api";

type PerfilForm = {
  name: string;
  email: string;
};

type SenhaForm = {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
};

export default function CorretorPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  // controle de remoção de imóvel
  const [removendoImovelId, setRemovendoImovelId] = useState<number | null>(null);

  // Perfil
  const [meuUsuario, setMeuUsuario] = useState<Usuario | null>(null);
  const [perfilForm, setPerfilForm] = useState<PerfilForm>({
    name: "",
    email: "",
  });
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [msgPerfil, setMsgPerfil] = useState<string | null>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Senha
  const [senhaForm, setSenhaForm] = useState<SenhaForm>({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [msgSenha, setMsgSenha] = useState<string | null>(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Carregar imóveis e perfil (em blocos separados)
  useEffect(() => {
    if (!token) return;

    async function carregar() {
      // limpa mensagens anteriores
      setErro(null);
      setErroPerfil(null);

      // 1) Tenta carregar só os imóveis do corretor
      try {
        const meus = await listarImoveisDoCorretor();
        setImoveis(meus);
      } catch (e) {
        console.error("Erro ao carregar imóveis:", e);
        setErro("Erro ao carregar imóveis. (verifique se está logado)");
      }

      // 2) Tenta carregar os dados do usuário logado
      try {
        const user = await obterMeuUsuario();
        setMeuUsuario(user);
        setPerfilForm({
          name: user.name ?? "",
          email: user.email ?? "",
        });
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
        setErroPerfil(
          "Erro ao carregar dados do perfil (acesso negado ou não autorizado)."
        );
      }
    }

    carregar();
  }, [token]);

  async function handleSalvarPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroPerfil(null);
    setMsgPerfil(null);

    try {
      setSalvandoPerfil(true);
      const atualizado = await atualizarMeuUsuario({
        name: perfilForm.name,
        email: perfilForm.email,
      });

      setMeuUsuario(
        atualizado ?? (meuUsuario ? { ...meuUsuario, ...perfilForm } : null)
      );
      setMsgPerfil("Perfil atualizado com sucesso!");
    } catch (e) {
      console.error(e);
      setErroPerfil("Erro ao atualizar perfil: " + (e as Error).message);
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function handleSalvarSenha(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroSenha(null);
    setMsgSenha(null);

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      setErroSenha("A confirmação da nova senha não confere.");
      return;
    }

    try {
      setSalvandoSenha(true);

      await atualizarMinhaSenha({
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha,
      });

      setMsgSenha("Senha atualizada com sucesso!");
      setSenhaForm({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      });
    } catch (e) {
      console.error(e);
      setErroSenha("Erro ao atualizar senha: " + (e as Error).message);
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function handleExcluirImovel(id: number) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o imóvel #${id}?`
    );
    if (!confirmar) return;

    try {
      setRemovendoImovelId(id);
      await excluirImovel(id);
      setImoveis((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir imóvel: " + (e as Error).message);
    } finally {
      setRemovendoImovelId(null);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Menu />
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-3">
          <h1 className="text-2xl font-bold">Área do corretor</h1>
          <p className="text-sm text-gray-700">
            Você precisa estar logado como corretor para acessar esta página.
          </p>
          <Link
            href="/login"
            className="inline-block mt-3 border rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            Ir para login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Menu />

        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Área do corretor</h1>
              <p className="text-sm text-gray-600">
                Gerencie seus imóveis e seu perfil.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/privado/imoveis/novo"
                className="rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black"
              >
                Cadastrar novo imóvel
              </Link>
            </div>
          </header>

          {/* ================== MEUS IMÓVEIS ================== */}
          <section className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Meus imóveis</h2>
            </div>

            {erro && <p className="text-xs text-red-600">{erro}</p>}

            <div className="max-h-[26rem] overflow-auto text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="py-1 pr-2">ID</th>
                    <th className="py-1 pr-2">Título</th>
                    <th className="py-1 pr-2">Finalidade</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {imoveis.map((imovel) => (
                    <tr key={imovel.id} className="border-b last:border-0">
                      <td className="py-1 pr-2 text-xs">{imovel.id}</td>
                      <td className="py-1 pr-2">{imovel.titulo}</td>
                      <td className="py-1 pr-2 text-xs">
                        {imovel.finalidade}
                      </td>
                      <td className="py-1 pr-2 text-xs">{imovel.status}</td>
                      <td className="py-1 pr-2 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/privado/imoveis/${imovel.id}/editar`}
                            className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleExcluirImovel(imovel.id!)}
                            disabled={removendoImovelId === imovel.id}
                            className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {removendoImovelId === imovel.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {imoveis.length === 0 && !erro && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-2 text-xs text-gray-600"
                      >
                        Nenhum imóvel encontrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================== MEU PERFIL ================== */}
          {/* ... resto da seção de perfil e senha permanece igual ... */}
          {/* (não mexi ali, só na parte de imóveis) */}

          <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <h2 className="text-lg font-semibold">Meu perfil</h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Dados básicos */}
              <div className="flex-1">
                {erroPerfil && (
                  <p className="text-xs text-red-600 mb-2">{erroPerfil}</p>
                )}

                <form
                  onSubmit={handleSalvarPerfil}
                  className="space-y-3 text-sm max-w-md"
                >
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={perfilForm.name}
                      onChange={(e) =>
                        setPerfilForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={perfilForm.email}
                      onChange={(e) =>
                        setPerfilForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                      required
                    />
                  </div>

                  {meuUsuario?.role && (
                    <p className="text-xs text-gray-500">
                      Perfil:{" "}
                      <span className="font-medium">{meuUsuario.role}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={salvandoPerfil}
                    className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                  >
                    {salvandoPerfil ? "Salvando..." : "Salvar perfil"}
                  </button>

                  {msgPerfil && (
                    <p className="text-xs text-green-600 mt-1">
                      {msgPerfil}
                    </p>
                  )}
                </form>
              </div>

              {/* Troca de senha */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-2">Alterar senha</h3>

                {erroSenha && (
                  <p className="text-xs text-red-600 mb-2">{erroSenha}</p>
                )}
                {msgSenha && (
                  <p className="text-xs text-green-600 mb-2">{msgSenha}</p>
                )}

                <form
                  onSubmit={handleSalvarSenha}
                  className="space-y-3 text-sm max-w-md"
                >
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Senha atual
                    </label>
                    <input
                      type="password"
                      value={senhaForm.senhaAtual}
                      onChange={(e) =>
                        setSenhaForm((prev) => ({
                          ...prev,
                          senhaAtual: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      value={senhaForm.novaSenha}
                      onChange={(e) =>
                        setSenhaForm((prev) => ({
                          ...prev,
                          novaSenha: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      value={senhaForm.confirmarSenha}
                      onChange={(e) =>
                        setSenhaForm((prev) => ({
                          ...prev,
                          confirmarSenha: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={salvandoSenha}
                    className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                  >
                    {salvandoSenha ? "Atualizando..." : "Atualizar senha"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
