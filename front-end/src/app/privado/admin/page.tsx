// src/app/privado/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Menu from "@/src/components/Menu";
import RequireAuth from "@/src/components/RequireAuth";
import type { Imovel, Usuario } from "@/src/lib/api";
import {
  listarImoveis,
  listarUsuarios,
  criarUsuario,
  excluirImovel,
  excluirUsuario,
} from "@/src/lib/api";

type FormUsuario = {
  name: string;
  email: string;
};

export default function AdminPage() {
  // ========== ESTADOS ==========

  // Lista de imóveis
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [erroImoveis, setErroImoveis] = useState<string | null>(null);
  const [removendoImovelId, setRemovendoImovelId] = useState<number | null>(
    null
  );

  // Lista de usuários / corretores
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erroUsuarios, setErroUsuarios] = useState<string | null>(null);
  const [removendoUsuarioId, setRemovendoUsuarioId] = useState<number | null>(
    null
  );

  // Formulário de criação de corretor
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [msgUsuario, setMsgUsuario] = useState<string | null>(null);
  const [formUsuario, setFormUsuario] = useState<FormUsuario>({
    name: "",
    email: "",
  });

  // ========== CARREGAR DADOS INICIAIS ==========

  useEffect(() => {
    // Carrega a lista de imóveis ao abrir a tela
    listarImoveis()
      .then(setImoveis)
      .catch((e) =>
        setErroImoveis("Erro ao carregar imóveis: " + (e as Error).message)
      );

    // Carrega a lista de usuários / corretores ao abrir a tela
    listarUsuarios()
      .then(setUsuarios)
      .catch((e) =>
        setErroUsuarios("Erro ao carregar usuários: " + (e as Error).message)
      );
  }, []);

  // ========== AÇÕES: IMÓVEIS ==========

  async function handleExcluirImovel(id: number) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o imóvel #${id}?`
    );
    if (!confirmar) return;

    try {
      setRemovendoImovelId(id);
      await excluirImovel(id);

      // Remove o imóvel da lista local sem precisar recarregar tudo
      setImoveis((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert("Erro ao excluir imóvel: " + (e as Error).message);
    } finally {
      setRemovendoImovelId(null);
    }
  }

  // ========== AÇÕES: USUÁRIOS / CORRETORES ==========

  async function handleCriarCorretor(e: React.FormEvent) {
    e.preventDefault();
    setMsgUsuario(null);

    try {
      setSalvandoUsuario(true);

      // 🔒 SEMPRE cria como CORRETOR, com senha padrão "trocar123"
      await criarUsuario({
        name: formUsuario.name,
        email: formUsuario.email,
        role: "CORRETOR",
        password: "trocar123",
      });

      setMsgUsuario(
        "Corretor cadastrado com sucesso. Senha padrão: trocar123"
      );
      setFormUsuario({ name: "", email: "" });

      // Recarrega lista de usuários para aparecer o novo corretor
      const novaLista = await listarUsuarios();
      setUsuarios(novaLista);
    } catch (error) {
      setMsgUsuario(
        "Erro ao cadastrar corretor: " + (error as Error).message
      );
    } finally {
      setSalvandoUsuario(false);
    }
  }

  async function handleExcluirUsuario(id: number) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o usuário #${id}?`
    );
    if (!confirmar) return;

    try {
      setRemovendoUsuarioId(id);
      await excluirUsuario(id);

      // Remove o usuário da lista local
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert("Erro ao excluir usuário: " + (e as Error).message);
    } finally {
      setRemovendoUsuarioId(null);
    }
  }

  // ========== RENDER ==========

  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Menu />

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {/* Cabeçalho geral da área administrativa */}
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">Área administrativa</h1>
            <p className="text-sm text-slate-600">
              Gerencie imóveis e usuários do sistema.
            </p>
          </header>

          {/* ======================= SEÇÃO 1: IMÓVEIS ======================= */}
          <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Imóveis cadastrados</h2>
                <p className="text-xs text-slate-600">
                  Visualize, edite ou exclua os imóveis publicados no site.
                </p>
              </div>

              {/* Botão principal para cadastrar novo imóvel */}
              <Link
                href="/privado/imoveis/novo"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Cadastrar novo imóvel
              </Link>
            </div>

            {erroImoveis && (
              <p className="text-xs text-red-600">{erroImoveis}</p>
            )}

            <div className="overflow-auto text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-600">
                    <th className="py-1 pr-2">ID</th>
                    <th className="py-1 pr-2">Título</th>
                    <th className="py-1 pr-2">Finalidade</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {imoveis.map((imovel) => (
                    <tr
                      key={imovel.id}
                      className="border-b last:border-0 border-slate-100"
                    >
                      <td className="py-1 pr-2 text-xs text-slate-600">
                        {imovel.id}
                      </td>
                      <td className="py-1 pr-2">{imovel.titulo}</td>
                      <td className="py-1 pr-2 text-xs text-slate-700">
                        {imovel.finalidade}
                      </td>
                      <td className="py-1 pr-2 text-xs text-slate-700">
                        {imovel.status}
                      </td>
                      <td className="py-1 pr-2 text-xs">
                        <div className="flex items-center justify-center gap-2">
                          {/* Link para página de edição do imóvel */}
                          <Link
                            href={`/privado/imoveis/${imovel.id}/editar`}
                            className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </Link>

                          {/* Botão para excluir imóvel */}
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

                  {imoveis.length === 0 && !erroImoveis && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-2 text-xs text-slate-600 text-center"
                      >
                        Nenhum imóvel cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ======================= SEÇÃO 2: USUÁRIOS / CORRETORES ======================= */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* Coluna esquerda: formulário de criação de corretor */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <h2 className="text-lg font-semibold">Cadastrar corretor</h2>

              <p className="text-xs text-slate-600">
                O corretor será criado com tipo <b>CORRETOR</b> e senha padrão{" "}
                <b>trocar123</b>.
              </p>

              <form
                onSubmit={handleCriarCorretor}
                className="space-y-3 text-sm"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formUsuario.name}
                    onChange={(e) =>
                      setFormUsuario((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formUsuario.email}
                    onChange={(e) =>
                      setFormUsuario((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvandoUsuario}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {salvandoUsuario ? "Salvando..." : "Salvar corretor"}
                </button>

                {msgUsuario && (
                  <p className="text-xs text-slate-700 mt-2">{msgUsuario}</p>
                )}
              </form>
            </div>

            {/* Coluna direita: lista de usuários / corretores */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              <h2 className="text-lg font-semibold">Usuários do sistema</h2>

              {erroUsuarios && (
                <p className="text-xs text-red-600">{erroUsuarios}</p>
              )}

              <div className="overflow-auto text-sm max-h-80">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-600">
                      <th className="py-1 pr-2">ID</th>
                      <th className="py-1 pr-2">Nome</th>
                      <th className="py-1 pr-2">E-mail</th>
                      <th className="py-1 pr-2">Perfil</th>
                      <th className="py-1 pr-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b last:border-0 border-slate-100"
                      >
                        <td className="py-1 pr-2 text-xs text-slate-600">
                          {u.id}
                        </td>
                        <td className="py-1 pr-2">{u.name}</td>
                        <td className="py-1 pr-2 text-xs">{u.email}</td>
                        <td className="py-1 pr-2 text-xs">
                          {u.role ?? "-"}
                        </td>
                        <td className="py-1 pr-2 text-xs">
                          <div className="flex items-center justify-center gap-2">
                            {/* Link para futura tela de edição de usuário */}
                            <Link
                              href={`/privado/admin/usuarios/${u.id}/editar`}
                              className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              Editar
                            </Link>

                            {/* Botão para excluir usuário */}
                            <button
                              type="button"
                              onClick={() => handleExcluirUsuario(u.id!)}
                              disabled={removendoUsuarioId === u.id}
                              className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {removendoUsuarioId === u.id
                                ? "Excluindo..."
                                : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {usuarios.length === 0 && !erroUsuarios && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-2 text-xs text-slate-600 text-center"
                        >
                          Nenhum usuário cadastrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
