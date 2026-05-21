"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();

  useEffect(() => {
    const handler = () =>
      setMode((prev) => (prev === "login" ? "register" : "login"));
    window.addEventListener("switch-auth-mode", handler);
    return () => window.removeEventListener("switch-auth-mode", handler);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }
    router.push("/chat");
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al registrarse");
    }
    router.push("/chat");
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)] px-4"
      suppressHydrationWarning
    >
      <div className="w-full max-w-[400px] animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#0d8c6d] mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {mode === "login" ? "Bienvenido" : "Crear cuenta"}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            OpenClaw Chat · Hermes Agent
          </p>
        </div>

        <div className="flex mb-6 p-1 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-color)]">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === "login"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === "register"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Registrarse
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <RegisterForm onRegister={handleRegister} />
        )}
      </div>
    </div>
  );
}
