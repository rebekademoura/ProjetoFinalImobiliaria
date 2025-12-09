// src/app/privado/admin/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Menu from "@/src/components/Menu";
import RequireAuth from "@/src/components/RequireAuth";
import type { Imovel, Usuario, Bairro, TipoImovel } from "@/src/lib/api";
import {
  listarImoveis,
  listarUsuarios,
  criarUsuario,
  excluirImovel,
  excluirUsuario,
  atualizarUsuario,
  // Bairros
  listarBairros,
  criarBairro,
  atualizarBairro,
  excluirBairro,
  // Tipos de imóveis
  listarTiposImoveis,
  criarTipoImovel,
  atualizarTipoImovel,
  excluirTipoImovel,
} from "@/src/lib/api";

type FormUsuario = {
  name: string;
  email: string;
};

type FormBairro = {
  nome: string;
  cidade: string;
  estado: string;
};

type FormTipoImovel = {
  nome: string;
  descricao: string;
};

export default function AdminPage() {
  // ========== ESTADOS: IMÓVEIS ==========
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [erroImoveis, setErroImoveis] = useState<string | null>(null);
  const [removendoImovelId, setRemovendoImovelId] = useState<number | null>(
    null
  );

  // ========== ESTADOS: USUÁRIOS ==========
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erroUsuarios, setErroUsuarios] = useState<string | null>(null);
  const [removendoUsuarioId, setRemovendoUsuarioId] = useState<number | null>(
    null
  );

  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [msgUsuario, setMsgUsuario] = useState<string | null>(null);
  const [formUsuario, setFormUsuario] = useState<FormUsuario>({
    name: "",
    email: "",
  });

  // usuário em edição (inline)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  // ========== ESTADOS: BAIRROS ==========
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [erroBairros, setErroBairros] = useState<string | null>(null);
  const [formBairro, setFormBairro] = useState<FormBairro>({
    nome: "",
    cidade: "",
    estado: "",
  });
  const [salvandoBairro, setSalvandoBairro] = useState(false);
  const [bairroEditando, setBairroEditando] = useState<Bairro | null>(null);
  const [removendoBairroId, setRemovendoBairroId] = useState<number | null>(
    null
  );

  // ========== ESTADOS: TIPOS DE IMÓVEIS ==========
  const [tiposImoveis, setTiposImoveis] = useState<TipoImovel[]>([]);
  const [erroTipos, setErroTipos] = useState<string | null>(null);
  const [formTipoImovel, setFormTipoImovel] = useState<FormTipoImovel>({
    nome: "",
    descricao: "",
  });
  const [salvandoTipo, setSalvandoTipo] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoImovel | null>(null);
  const [removendoTipoId, setRemovendoTipoId] = useState<number | null>(null);

  // ========== CARREGAR DADOS INICIAIS ==========
  useEffect(() => {
    // Imóveis
    listarImoveis()
      .then(setImoveis)
      .catch((e) =>
        setErroImoveis("Erro ao carregar imóveis: " + (e as Error).message)
      );

    // Usuários
    listarUsuarios()
      .then(setUsuarios)
      .catch((e) =>
        setErroUsuarios("Erro ao carregar usuários: " + (e as Error).message)
      );

    // Bairros
    listarBairros()
      .then(setBairros)
      .catch((e) =>
        setErroBairros("Erro ao carregar bairros: " + (e as Error).message)
      );

    // Tipos de imóveis
    listarTiposImoveis()
      .then(setTiposImoveis)
      .catch((e) =>
        setErroTipos(
          "Erro ao carregar tipos de imóveis: " + (e as Error).message
        )
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
      setImoveis((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert("Erro ao excluir imóvel: " + (e as Error).message);
    } finally {
      setRemovendoImovelId(null);
    }
  }

  // ========== AÇÕES: USUÁRIOS ==========
  async function handleCriarCorretor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsgUsuario(null);

    try {
      setSalvandoUsuario(true);

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
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert("Erro ao excluir usuário: " + (e as Error).message);
    } finally {
      setRemovendoUsuarioId(null);
    }
  }

  function iniciarEdicaoUsuario(usuario: Usuario) {
    setUsuarioEditando({ ...usuario });
  }

  function cancelarEdicaoUsuario() {
    setUsuarioEditando(null);
  }

  async function salvarEdicaoUsuario() {
    if (!usuarioEditando?.id) return;

    try {
      await atualizarUsuario(usuarioEditando.id, {
        name: usuarioEditando.name,
        email: usuarioEditando.email,
        role: usuarioEditando.role,
      });

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioEditando.id ? usuarioEditando : u))
      );
      setUsuarioEditando(null);
    } catch (e) {
      alert("Erro ao atualizar usuário: " + (e as Error).message);
    }
  }

  // ========== AÇÕES: BAIRROS ==========
  async function handleCriarBairro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroBairros(null);

    try {
      setSalvandoBairro(true);
      await criarBairro({
        nome: formBairro.nome,
        cidade: formBairro.cidade,
        estado: formBairro.estado,
      });

      setFormBairro({ nome: "", cidade: "", estado: "" });
      const lista = await listarBairros();
      setBairros(lista);
    } catch (error) {
      setErroBairros("Erro ao cadastrar bairro: " + (error as Error).message);
    } finally {
      setSalvandoBairro(false);
    }
  }

  function iniciarEdicaoBairro(bairro: Bairro) {
    setBairroEditando({ ...bairro });
  }

  function cancelarEdicaoBairro() {
    setBairroEditando(null);
  }

  async function salvarEdicaoBairro() {
    if (!bairroEditando?.id) return;

    try {
      await atualizarBairro(bairroEditando.id, {
        nome: bairroEditando.nome,
        cidade: bairroEditando.cidade,
        estado: bairroEditando.estado,
      });

      setBairros((prev) =>
        prev.map((b) => (b.id === bairroEditando.id ? bairroEditando : b))
      );
      setBairroEditando(null);
    } catch (e) {
      alert("Erro ao atualizar bairro: " + (e as Error).message);
    }
  }

  async function handleExcluirBairro(id: number) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o bairro #${id}?`
    );
    if (!confirmar) return;

    try {
      setRemovendoBairroId(id);
      await excluirBairro(id);
      setBairros((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert("Erro ao excluir bairro: " + (e as Error).message);
    } finally {
      setRemovendoBairroId(null);
    }
  }

  // ========== AÇÕES: TIPOS DE IMÓVEIS ==========
  async function handleCriarTipoImovel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroTipos(null);

    try {
      setSalvandoTipo(true);
      await criarTipoImovel({
        nome: formTipoImovel.nome,
        descricao: formTipoImovel.descricao,
      });

      setFormTipoImovel({ nome: "", descricao: "" });
      const lista = await listarTiposImoveis();
      setTiposImoveis(lista);
    } catch (error) {
      setErroTipos(
        "Erro ao cadastrar tipo de imóvel: " + (error as Error).message
      );
    } finally {
      setSalvandoTipo(false);
    }
  }

  function iniciarEdicaoTipo(tipo: TipoImovel) {
    setTipoEditando({ ...tipo });
  }

  function cancelarEdicaoTipo() {
    setTipoEditando(null);
  }

  async function salvarEdicaoTipo() {
    if (!tipoEditando?.id) return;

    try {
      await atualizarTipoImovel(tipoEditando.id, {
        nome: tipoEditando.nome,
        descricao: tipoEditando.descricao,
      });

      setTiposImoveis((prev) =>
        prev.map((t) => (t.id === tipoEditando.id ? tipoEditando : t))
      );
      setTipoEditando(null);
    } catch (e) {
      alert("Erro ao atualizar tipo de imóvel: " + (e as Error).message);
    }
  }

  async function handleExcluirTipo(id: number) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o tipo de imóvel #${id}?`
    );
    if (!confirmar) return;

    try {
      setRemovendoTipoId(id);
      await excluirTipoImovel(id);
      setTiposImoveis((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert("Erro ao excluir tipo de imóvel: " + (e as Error).message);
    } finally {
      setRemovendoTipoId(null);
    }
  }

  // ========== RENDER ==========
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Menu />

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          {/* Cabeçalho geral */}
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">Área administrativa</h1>
            <p className="text-sm text-slate-600">
              Gerencie imóveis, usuários, bairros e tipos de imóveis.
            </p>
          </header>

          {/* ======================= IMÓVEIS ======================= */}
          <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Imóveis cadastrados</h2>
                <p className="text-xs text-slate-600">
                  Visualize, edite ou exclua os imóveis publicados no site.
                </p>
              </div>

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

          {/* ======================= USUÁRIOS / CORRETORES ======================= */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* Cadastrar corretor */}
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

            {/* Lista de usuários */}
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
                    {usuarios.map((u) => {
                      const emEdicao = usuarioEditando?.id === u.id;

                      return (
                        <tr
                          key={u.id}
                          className="border-b last:border-0 border-slate-100"
                        >
                          <td className="py-1 pr-2 text-xs text-slate-600">
                            {u.id}
                          </td>

                          {/* Nome */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                value={usuarioEditando?.name ?? ""}
                                onChange={(e) =>
                                  setUsuarioEditando((prev) =>
                                    prev
                                      ? { ...prev, name: e.target.value }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              u.name
                            )}
                          </td>

                          {/* E-mail */}
                          <td className="py-1 pr-2 text-xs">
                            {emEdicao ? (
                              <input
                                type="email"
                                value={usuarioEditando?.email ?? ""}
                                onChange={(e) =>
                                  setUsuarioEditando((prev) =>
                                    prev
                                      ? { ...prev, email: e.target.value }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              u.email
                            )}
                          </td>

                          {/* Perfil / role */}
                          <td className="py-1 pr-2 text-xs">
                            {emEdicao ? (
                              <select
                                value={usuarioEditando?.role ?? ""}
                                onChange={(e) =>
                                  setUsuarioEditando((prev) =>
                                    prev
                                      ? { ...prev, role: e.target.value }
                                      : prev
                                  )
                                }
                                className="border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              >
                                <option value="">-</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="CORRETOR">CORRETOR</option>
                                <option value="CLIENTE">CLIENTE</option>
                              </select>
                            ) : (
                              u.role ?? "-"
                            )}
                          </td>

                          {/* Ações */}
                          <td className="py-1 pr-2 text-xs">
                            <div className="flex items-center justify-center gap-2">
                              {emEdicao ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={salvarEdicaoUsuario}
                                    className="px-2 py-1 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px]"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelarEdicaoUsuario}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoUsuario(u)}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Editar
                                  </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleExcluirUsuario(u.id!)
                                      }
                                      disabled={removendoUsuarioId === u.id}
                                      className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-[11px]"
                                    >
                                      {removendoUsuarioId === u.id
                                        ? "Excluindo..."
                                        : "Excluir"}
                                    </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

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

          {/* ======================= BAIRROS & TIPOS DE IMÓVEIS ======================= */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* BAIRROS */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Bairros</h2>
                <p className="text-xs text-slate-600">
                  Cadastre, edite e exclua bairros utilizados nos imóveis.
                </p>
              </div>

              {erroBairros && (
                <p className="text-xs text-red-600">{erroBairros}</p>
              )}

              {/* Formulário de criação de bairro */}
              <form
                onSubmit={handleCriarBairro}
                className="space-y-2 text-sm border border-slate-200 rounded-md p-3 bg-slate-50"
              >
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Nome do bairro
                    </label>
                    <input
                      type="text"
                      value={formBairro.nome}
                      onChange={(e) =>
                        setFormBairro((prev) => ({
                          ...prev,
                          nome: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formBairro.cidade}
                      onChange={(e) =>
                        setFormBairro((prev) => ({
                          ...prev,
                          cidade: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1 w-20">
                    <label className="block text-xs font-medium text-slate-700">
                      UF
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formBairro.estado}
                      onChange={(e) =>
                        setFormBairro((prev) => ({
                          ...prev,
                          estado: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm uppercase text-center focus:outline-none focus:ring focus:ring-slate-200"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={salvandoBairro}
                  className="mt-1 rounded-md px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {salvandoBairro ? "Salvando..." : "Cadastrar bairro"}
                </button>
              </form>

              {/* Tabela de bairros */}
              <div className="overflow-auto text-sm max-h-64">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-600">
                      <th className="py-1 pr-2">ID</th>
                      <th className="py-1 pr-2">Nome</th>
                      <th className="py-1 pr-2">Cidade</th>
                      <th className="py-1 pr-2">UF</th>
                      <th className="py-1 pr-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bairros.map((b) => {
                      const emEdicao = bairroEditando?.id === b.id;
                      return (
                        <tr
                          key={b.id}
                          className="border-b last:border-0 border-slate-100"
                        >
                          <td className="py-1 pr-2 text-xs text-slate-600">
                            {b.id}
                          </td>

                          {/* Nome */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                value={bairroEditando?.nome ?? ""}
                                onChange={(e) =>
                                  setBairroEditando((prev) =>
                                    prev
                                      ? { ...prev, nome: e.target.value }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              b.nome
                            )}
                          </td>

                          {/* Cidade */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                value={bairroEditando?.cidade ?? ""}
                                onChange={(e) =>
                                  setBairroEditando((prev) =>
                                    prev
                                      ? { ...prev, cidade: e.target.value }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              b.cidade
                            )}
                          </td>

                          {/* UF */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                maxLength={2}
                                value={bairroEditando?.estado ?? ""}
                                onChange={(e) =>
                                  setBairroEditando((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          estado: e.target.value.toUpperCase(),
                                        }
                                      : prev
                                  )
                                }
                                className="w-14 border border-slate-300 rounded-md px-1 py-0.5 text-xs text-center uppercase"
                              />
                            ) : (
                              b.estado
                            )}
                          </td>

                          <td className="py-1 pr-2 text-xs">
                            <div className="flex items-center justify-center gap-2">
                              {emEdicao ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={salvarEdicaoBairro}
                                    className="px-2 py-1 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px]"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelarEdicaoBairro}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoBairro(b)}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleExcluirBairro(b.id as number)
                                    }
                                    disabled={removendoBairroId === b.id}
                                    className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-[11px]"
                                  >
                                    {removendoBairroId === b.id
                                      ? "Excluindo..."
                                      : "Excluir"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {bairros.length === 0 && !erroBairros && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-2 text-xs text-slate-600 text-center"
                        >
                          Nenhum bairro cadastrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIPOS DE IMÓVEIS */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Tipos de imóveis</h2>
                <p className="text-xs text-slate-600">
                  Cadastre, edite e exclua os tipos de imóveis (casa, apto,
                  sala comercial, etc.).
                </p>
              </div>

              {erroTipos && (
                <p className="text-xs text-red-600">{erroTipos}</p>
              )}

              {/* Formulário de criação de tipo de imóvel */}
              <form
                onSubmit={handleCriarTipoImovel}
                className="space-y-2 text-sm border border-slate-200 rounded-md p-3 bg-slate-50"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Nome do tipo
                  </label>
                  <input
                    type="text"
                    value={formTipoImovel.nome}
                    onChange={(e) =>
                      setFormTipoImovel((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formTipoImovel.descricao}
                    onChange={(e) =>
                      setFormTipoImovel((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvandoTipo}
                  className="mt-1 rounded-md px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {salvandoTipo ? "Salvando..." : "Cadastrar tipo"}
                </button>
              </form>

              {/* Tabela de tipos */}
              <div className="overflow-auto text-sm max-h-64">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-600">
                      <th className="py-1 pr-2">ID</th>
                      <th className="py-1 pr-2">Nome</th>
                      <th className="py-1 pr-2">Descrição</th>
                      <th className="py-1 pr-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiposImoveis.map((t) => {
                      const emEdicao = tipoEditando?.id === t.id;
                      return (
                        <tr
                          key={t.id}
                          className="border-b last:border-0 border-slate-100"
                        >
                          <td className="py-1 pr-2 text-xs text-slate-600">
                            {t.id}
                          </td>

                          {/* Nome */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                value={tipoEditando?.nome ?? ""}
                                onChange={(e) =>
                                  setTipoEditando((prev) =>
                                    prev
                                      ? { ...prev, nome: e.target.value }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              t.nome
                            )}
                          </td>

                          {/* Descrição */}
                          <td className="py-1 pr-2">
                            {emEdicao ? (
                              <input
                                type="text"
                                value={tipoEditando?.descricao ?? ""}
                                onChange={(e) =>
                                  setTipoEditando((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          descricao: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                                className="w-full border border-slate-300 rounded-md px-1 py-0.5 text-xs"
                              />
                            ) : (
                              t.descricao
                            )}
                          </td>

                          <td className="py-1 pr-2 text-xs">
                            <div className="flex items-center justify-center gap-2">
                              {emEdicao ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={salvarEdicaoTipo}
                                    className="px-2 py-1 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px]"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelarEdicaoTipo}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoTipo(t)}
                                    className="px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px]"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleExcluirTipo(t.id as number)
                                    }
                                    disabled={removendoTipoId === t.id}
                                    className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-[11px]"
                                  >
                                    {removendoTipoId === t.id
                                      ? "Excluindo..."
                                      : "Excluir"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {tiposImoveis.length === 0 && !erroTipos && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-2 text-xs text-slate-600 text-center"
                        >
                          Nenhum tipo de imóvel cadastrado ainda.
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
