// src/lib/api.ts

// =======================
// Tipos compartilhados
// =======================

export type FinalidadeImovel = "VENDA" | "ALUGUEL" | string;
export type StatusImovel =
  | "ATIVO"
  | "INATIVO"
  | "ALUGADO"
  | "VENDIDO"
  | string;

export type Imovel = {
  id: number;
  titulo: string;
  finalidade: FinalidadeImovel;
  status: StatusImovel;

  descricao?: string;
  caracteristicas?: string;
  destaque?: boolean;

  // preço genérico para uso em listagens públicas
  preco?: number;
  precoVenda?: number | null;
  precoAluguel?: number | null;

  dormitorios?: number;
  banheiros?: number;
  garagem?: number;

  areaConstruida?: number | null;
  areaTotal?: number | null;

  endereco?: string;
  numero?: string;
  cep?: string;
  complemento?: string;
  cidade?: string;
  bairro?: string;

  bairroId?: number;
  tipoImovelId?: number;
};

export type NovoUsuario = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type Usuario = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Bairro = {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
};

export type TipoImovel = {
  id: number;
  nome: string;
  descricao?: string;
};

// =======================
// Função base da API
// =======================

/**
 * Função base para chamadas HTTP.
 * - Monta a URL com base em NEXT_PUBLIC_API_BASE;
 * - Configura JSON + Authorization (quando withAuth = true);
 * - Faz o fetch e valida erros HTTP;
 * - Tenta converter a resposta para JSON.
 */
async function baseApi<T>(
  path: string,
  init: RequestInit = {},
  withAuth: boolean
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE;

  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE não definido. " +
        "Configure no .env.local, ex.: NEXT_PUBLIC_API_BASE=http://localhost:8080"
    );
  }

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  // Se a rota exigir autenticação, tenta enviar o token salvo no localStorage
  const token =
    withAuth && typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (withAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = base.replace(/\/$/, "") + path;

  console.log("Chamando API:", url, "auth?", withAuth);

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Devolve texto do backend se tiver, senão um erro genérico com status
    throw new Error(txt || `HTTP ${res.status}`);
  }

  // Pode haver respostas SEM corpo (ex.: 201/204)
  const raw = await res.text().catch(() => "");
  if (!raw) {
    // @ts-expect-error – em alguns casos T pode ser void/null
    return undefined;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Resposta da API não é um JSON válido.");
  }
}

// =======================
// Wrappers públicos/privados
// =======================

/** Para rotas públicas (NÃO envia Authorization) */
export async function apiPublic<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  return baseApi<T>(path, init, false);
}

/** Para rotas autenticadas (envia Authorization se houver token) */
export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  return baseApi<T>(path, init, true);
}

// =======================
// Imóveis
// =======================

/**
 * Lista imóveis.
 * Se finalidade for informada ("VENDA" | "ALUGUEL"), aplica filtro na URL.
 * Rota pública: não exige token.
 */
export async function listarImoveis(
  finalidade?: "VENDA" | "ALUGUEL"
): Promise<Imovel[]> {
  const params = finalidade ? `?finalidade=${finalidade}` : "";
  return apiPublic<Imovel[]>(`/imoveis${params}`);
}

/** Busca um imóvel específico por ID (público). */
export async function buscarImovel(id: number | string): Promise<Imovel> {
  return apiPublic<Imovel>(`/imoveis/${id}`);
}

/**
 * Cria um novo imóvel.
 * - Usa rota autenticada (envia Authorization: Bearer <token>);
 * - O backend usa o usuário autenticado para associar o usuario_id.
 * Retorna o imóvel criado.
 */
export async function criarImovel(
  dados: Partial<Imovel>
): Promise<Imovel> {
  return api<Imovel>("/imoveis", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/** Atualiza dados de um imóvel existente (rota autenticada). */
export async function atualizarImovel(
  id: number | string,
  dados: Partial<Imovel>
): Promise<void> {
  await api<void>(`/imoveis/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

/**
 * Exclui um imóvel pelo ID (rota autenticada).
 * Usado na tela de admin.
 */
export async function excluirImovel(
  id: number | string
): Promise<void> {
  await api<void>(`/imoveis/${id}`, {
    method: "DELETE",
  });
}

/**
 * Alias para manter compatibilidade se você já usava deletarImovel em algum lugar.
 * (Ambos fazem a mesma coisa.)
 */
export const deletarImovel = excluirImovel;

// =======================
// Bairros e Tipos de Imóvel
// =======================

/** Lista todos os bairros (público). */
export async function listarBairros(): Promise<Bairro[]> {
  return apiPublic<Bairro[]>("/bairros");
}

/** Lista todos os tipos de imóvel (público). Ajuste o path se no back estiver diferente. */
export async function listarTiposImoveis(): Promise<TipoImovel[]> {
  return apiPublic<TipoImovel[]>("/tiposImoveis");
}

// =======================
// Usuários
// =======================

/**
 * Cria um novo usuário.
 * - Usado no admin para cadastrar corretores;
 * - Usa rota autenticada (apenas admin).
 */
export async function criarUsuario(dados: NovoUsuario): Promise<Usuario> {
  return api<Usuario>("/users", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/** Lista todos os usuários do sistema (rota autenticada). */
export async function listarUsuarios(): Promise<Usuario[]> {
  return api<Usuario[]>("/users");
}

/**
 * Exclui um usuário pelo ID (rota autenticada).
 * Usado na tabela de usuários do admin.
 */
export async function excluirUsuario(
  id: number | string
): Promise<void> {
  await api<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
