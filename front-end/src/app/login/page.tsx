// src/app/login/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCurrentUserClient } from "@/src/lib/auth";

type AuthResponse = {
  token: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const base = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || "", []);

  function getDefaultPathForCurrentUser(): string {
    const user = getCurrentUserClient();

    if (!user?.role) return "/publica";

    const role = String(user.role).toUpperCase();

    if (role.includes("ADMIN")) return "/privado/admin";
    if (role.includes("CORRETOR")) return "/privado/corretor";

    return "/publica";
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirect");

    if (redirectParam) {
      window.location.replace(redirectParam);
      return;
    }

    const destino = getDefaultPathForCurrentUser();
    window.location.replace(destino);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!base) {
      setMsg("Configuração ausente: defina NEXT_PUBLIC_API_BASE no .env.local");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!r.ok) {
        let backendMsg = "";
        try {
          const j = await r.json();
          backendMsg = typeof j === "string" ? j : j?.message || "";
        } catch {}
        throw new Error(
          backendMsg || `Credenciais inválidas (HTTP ${r.status})`
        );
      }

      const data: AuthResponse = await r.json();
      if (!data?.token) {
        throw new Error("Resposta inesperada do servidor: token ausente.");
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        if (data.user.role) localStorage.setItem("role", data.user.role);
        if (data.user.name) localStorage.setItem("name", data.user.name);
        if (data.user.email) localStorage.setItem("email", data.user.email);
        if (data.user.id != null)
          localStorage.setItem("userId", String(data.user.id));
      }

      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");
      if (redirectParam) {
        window.location.replace(redirectParam);
        return;
      }

      const destino = getDefaultPathForCurrentUser();
      window.location.replace(destino);
    } catch (err: any) {
      setMsg(err?.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-semibold text-slate-900 text-center mb-4">
          Login
        </h1>

        {msg && (
          <div className="mb-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm text-slate-700 font-medium"
            >
              E-mail
            </label>
            <input
              id="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-slate-200 disabled:bg-slate-100"
              type="email"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm text-slate-700 font-medium"
            >
              Senha
            </label>
            <input
              id="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-slate-200 disabled:bg-slate-100"
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={showPass}
                onChange={(e) => setShowPass(e.target.checked)}
                disabled={loading}
              />
              Mostrar senha
            </label>
          </div>

          <button
            type="submit" 
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 mt-2 disabled:bg-slate-400"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
