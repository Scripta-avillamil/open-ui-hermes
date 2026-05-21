"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)] text-[15px] transition-all";

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Todos los campos son requeridos");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await onRegister(username, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" suppressHydrationWarning>
      <input
        type="text"
        suppressHydrationWarning
        autoComplete="username"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className={inputClass}
      />
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
        autoComplete="new-password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="password"
        suppressHydrationWarning
        autoComplete="new-password"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className={inputClass}
      />
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full !py-3.5 text-base mt-1" disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)] pt-1">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("switch-auth-mode"))}
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
