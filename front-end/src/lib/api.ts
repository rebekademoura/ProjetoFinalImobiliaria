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
  bairro?: string | Bairro;

  bairroId?: number;
  tipoImovelId?: number;

  // dono do imóvel (corretor)
  usuarioId?: number;
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

// =======================
// Função base da API
// =======================

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
  // só define JSON se não for multipart ou outro tipo custom
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

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
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const raw = await res.text().catch(() => "");
  if (!raw) {
    // @ts-expect-error – T pode ser void
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

export async function apiPublic<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  return baseApi<T>(path, init, false);
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  return baseApi<T>(path, init, true);
}

// =======================
// Imóveis
// =======================

export async function listarImoveis(
  finalidade?: "VENDA" | "ALUGUEL"
): Promise<Imovel[]> {
  const params = finalidade ? `?finalidade=${finalidade}` : "";
  return apiPublic<Imovel[]>(`/imoveis${params}`);
}

export async function buscarImovel(id: number | string): Promise<Imovel> {
  return apiPublic<Imovel>(`/imoveis/${id}`);
}

// usando endpoint autenticado que retorna só imóveis do corretor logado
export async function listarImoveisDoCorretor(): Promise<Imovel[]> {
  return api<Imovel[]>("/imoveis/meus");
}

export async function criarImovel(
  dados: Partial<Imovel>
): Promise<Imovel> {
  return api<Imovel>("/imoveis", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarImovel(
  id: number | string,
  dados: Partial<Imovel>
): Promise<void> {
  // não exige estar logado – chamada pública
  return apiPublic<void>(`/imoveis/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}


export async function excluirImovel(
  id: number | string
): Promise<void> {
  await api<void>(`/imoveis/${id}`, {
    method: "DELETE",
  });
}

export const deletarImovel = excluirImovel;

// =======================
// Bairros
// =======================

export async function listarBairros(): Promise<Bairro[]> {
  return apiPublic<Bairro[]>("/bairros");
}

export type BairroInput = {
  nome: string;
  cidade: string;
  estado: string;
};

export async function criarBairro(data: BairroInput) {
  return api<Bairro>("/bairros", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarBairro(id: number, data: BairroInput) {
  return api<Bairro>(`/bairros/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function excluirBairro(id: number) {
  return api<void>(`/bairros/${id}`, {
    method: "DELETE",
  });
}

// =======================
// Tipos de Imóvel
// =======================

export async function listarTiposImoveis(): Promise<TipoImovel[]> {
  // use o mesmo path que está no backend (ex.: @RequestMapping("/tiposImoveis"))
  return apiPublic<TipoImovel[]>("/tiposImoveis");
}

export type TipoImovelInput = {
  nome: string;
  descricao?: string | null;
};

export async function criarTipoImovel(data: TipoImovelInput) {
  return api<TipoImovel>("/tiposImoveis", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function atualizarTipoImovel(id: number, data: TipoImovelInput) {
  return api<TipoImovel>(`/tiposImoveis/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function excluirTipoImovel(id: number) {
  return api<void>(`/tiposImoveis/${id}`, {
    method: "DELETE",
  });
}

// =======================
// Usuários (admin)
// =======================

export type UsuarioUpdateInput = {
  name?: string;
  email?: string;
  role?: string;
};

export async function criarUsuario(dados: NovoUsuario): Promise<Usuario> {
  return api<Usuario>("/users", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function listarUsuarios(): Promise<Usuario[]> {
  return api<Usuario[]>("/users");
}

export async function excluirUsuario(
  id: number | string
): Promise<void> {
  await api<void>(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function atualizarUsuario(
  id: number,
  data: UsuarioUpdateInput
) {
  return api<Usuario>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


export async function obterMeuUsuario(): Promise<Usuario> {
  return api<Usuario>("/users/me");
}

export async function atualizarMeuUsuario(data: {
  name?: string;
  email?: string;
}): Promise<Usuario> {
  return api<Usuario>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function atualizarMinhaSenha(data: {
  senhaAtual: string;
  novaSenha: string;
}): Promise<void> {
  await api<void>("/users/me/senha", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
