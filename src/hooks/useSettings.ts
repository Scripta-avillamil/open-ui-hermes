"use client";

import { useState, useEffect, useCallback } from "react";
import { Agent, Setting } from "@/types";

interface SettingsMap {
  platform_name: string;
  platform_logo_url: string;
  default_model: string;
  gateway_url: string;
  [key: string]: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsMap>({
    platform_name: "OpenClaw Chat",
    platform_logo_url: "",
    default_model: "openclaw",
    gateway_url: "http://localhost:18789",
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Error al cargar configuración");
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Error al cargar agentes");
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchSettings(), fetchAgents()]);
    setLoading(false);
  }, [fetchSettings, fetchAgents]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveSettings = useCallback(async (updates: Partial<SettingsMap>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Error al guardar configuración");
      const cleanUpdates: Record<string, string> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) cleanUpdates[k] = v;
      }
      setSettings((prev) => ({ ...prev, ...cleanUpdates }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const createAgent = useCallback(async (agent: Partial<Agent> & { name: string; modelId: string }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });
      if (!res.ok) throw new Error("Error al crear agente");
      const newAgent = await res.json();
      setAgents((prev) => [newAgent, ...prev]);
      return newAgent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: string, data: Partial<Agent>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar agente");
      const updated = await res.json();
      setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteAgent = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar agente");
      setAgents((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    agents,
    loading,
    saving,
    error,
    saveSettings,
    createAgent,
    updateAgent,
    deleteAgent,
    refresh: loadAll,
  };
}
