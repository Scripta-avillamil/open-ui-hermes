"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)] text-[15px] transition-all";

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Todos los campos son requeridos");
      return;
    }
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
      <input
        type="email"
        suppressHydrationWarning
        autoComplete="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="password"
        suppressHydrationWarning
        autoComplete="current-password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={inputClass}
      />
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full !py-3.5 text-base" disabled={loading}>
        {loading ? "Entrando..." : "Continuar"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("switch-auth-mode"))}
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
