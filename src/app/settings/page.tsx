"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Bot,
  Settings2,
  Palette,
  Server,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Check,
  Zap,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Agent } from "@/types";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    settings,
    agents,
    loading,
    saving,
    error,
    saveSettings,
    createAgent,
    updateAgent,
    deleteAgent,
  } = useSettings();

  const [platformName, setPlatformName] = useState("");
  const [platformLogoUrl, setPlatformLogoUrl] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"platform" | "agents">("platform");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    modelId: "",
    systemPrompt: "",
    gatewayUrl: "",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 2048,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platform_name || "");
      setPlatformLogoUrl(settings.platform_logo_url || "");
      setDefaultModel(settings.default_model || "openclaw");
      setGatewayUrl(settings.gateway_url || "");
    }
  }, [settings]);

  const handleSavePlatform = async () => {
    const ok = await saveSettings({
      platform_name: platformName,
      platform_logo_url: platformLogoUrl,
      default_model: defaultModel,
      gateway_url: gatewayUrl,
    });
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCreateAgent = async (e: FormEvent) => {
    e.preventDefault();
    const result = await createAgent(newAgent);
    if (result) {
      setShowNewAgent(false);
      setNewAgent({
        name: "",
        description: "",
        modelId: "",
        systemPrompt: "",
        gatewayUrl: "",
        apiKey: "",
        temperature: 0.7,
        maxTokens: 2048,
      });
    }
  };

  const handleToggleAgent = async (id: string, isActive: boolean) => {
    await updateAgent(id, { isActive: !isActive });
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-6 h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <button
          onClick={() => router.push("/chat")}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          aria-label="Volver al chat"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[var(--accent)]" />
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            Configuración
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-[var(--border-color)] px-6">
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "platform"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Palette className="w-4 h-4" />
          Plataforma
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "agents"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Bot className="w-4 h-4" />
          Agentes
          {agents.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
              {agents.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-sm">
              {error}
            </div>
          )}

          {activeTab === "platform" && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Branding Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                    <ImagePlus className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Marca
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Personaliza el nombre y logo de la plataforma
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)]">
                  {/* Logo Preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#10a37f] to-[#0d8c6d] flex items-center justify-center overflow-hidden shrink-0 border-2 border-[var(--border-color)]">
                      {platformLogoUrl ? (
                        <img
                          src={platformLogoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-8 h-8"
                          fill="white"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        URL del Logo
                      </label>
                      <input
                        type="url"
                        value={platformLogoUrl}
                        onChange={(e) => setPlatformLogoUrl(e.target.value)}
                        placeholder="https://ejemplo.com/logo.png"
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Nombre de la plataforma
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      placeholder="OpenClaw Chat"
                      className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                    />
                  </div>
                </div>
              </section>

              {/* Gateway Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                    <Server className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Gateway
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Conexión con OpenClaw / Hermes Agent Gateway
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)]">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      URL del Gateway
                    </label>
                    <input
                      type="url"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      placeholder="http://localhost:18789"
                      className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Modelo por defecto
                    </label>
                    <input
                      type="text"
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      placeholder="openclaw"
                      className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                    />
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                      Identificador del modelo en el gateway (ej: &quot;openclaw&quot;, &quot;openclaw:main&quot;)
                    </p>
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSavePlatform} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveSuccess ? "Guardado" : "Guardar cambios"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                    <Zap className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Agentes de IA
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Configura los agentes disponibles en el gateway
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowNewAgent(!showNewAgent)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Nuevo agente
                </Button>
              </div>

              {/* New Agent Form */}
              {showNewAgent && (
                <form
                  onSubmit={handleCreateAgent}
                  className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--accent)]/30 space-y-4 animate-fade-in-up"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[var(--accent)]" />
                    Crear nuevo agente
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAgent.name}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, name: e.target.value })
                        }
                        placeholder="Mi Agente"
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Modelo ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAgent.modelId}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, modelId: e.target.value })
                        }
                        placeholder="openclaw"
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={newAgent.description}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción breve del agente"
                      className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      System Prompt
                    </label>
                    <textarea
                      value={newAgent.systemPrompt}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          systemPrompt: e.target.value,
                        })
                      }
                      placeholder="Eres un asistente especializado en..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Gateway URL (opcional)
                      </label>
                      <input
                        type="url"
                        value={newAgent.gatewayUrl}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            gatewayUrl: e.target.value,
                          })
                        }
                        placeholder="Usar URL por defecto"
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        API Key (opcional)
                      </label>
                      <input
                        type="password"
                        value={newAgent.apiKey}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, apiKey: e.target.value })
                        }
                        placeholder="Usar key por defecto"
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Temperatura ({newAgent.temperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={newAgent.temperature}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            temperature: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="256"
                        max="32768"
                        value={newAgent.maxTokens}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            maxTokens: parseInt(e.target.value) || 2048,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all border-[var(--border-input)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewAgent(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1.5" />
                      )}
                      Crear agente
                    </Button>
                  </div>
                </form>
              )}

              {/* Agents List */}
              {agents.length === 0 && !showNewAgent ? (
                <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                  <Bot className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    No hay agentes configurados
                  </p>
                  <Button size="sm" onClick={() => setShowNewAgent(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Crear primer agente
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      expanded={expandedAgent === agent.id}
                      onToggleExpand={() =>
                        setExpandedAgent(
                          expandedAgent === agent.id ? null : agent.id
                        )
                      }
                      onToggleActive={() =>
                        handleToggleAgent(agent.id, agent.isActive)
                      }
                      onDelete={() => deleteAgent(agent.id)}
                      onUpdate={(data) => updateAgent(agent.id, data)}
                      saving={saving}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  expanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
  onUpdate,
  saving,
}: {
  agent: Agent;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<Agent>) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: agent.name,
    description: agent.description,
    modelId: agent.modelId,
    systemPrompt: agent.systemPrompt,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
  });

  const handleSave = () => {
    onUpdate(editData);
    setEditing(false);
  };

  return (
    <div
      className={`bg-[var(--bg-secondary)] rounded-2xl border transition-all ${
        agent.isActive
          ? "border-[var(--border-color)]"
          : "border-[var(--border-color)] opacity-60"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            agent.isActive
              ? "bg-gradient-to-br from-[#10a37f] to-[#0d8c6d]"
              : "bg-[var(--bg-hover)]"
          }`}
        >
          <Bot
            className={`w-5 h-5 ${agent.isActive ? "text-white" : "text-[var(--text-secondary)]"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {agent.name}
            </h3>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                agent.isActive
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              }`}
            >
              {agent.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
            {agent.description || `Modelo: ${agent.modelId}`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleActive}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
            title={agent.isActive ? "Desactivar" : "Activar"}
          >
            <Zap
              className={`w-4 h-4 ${agent.isActive ? "text-[var(--accent)]" : ""}`}
            />
          </button>
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[var(--border-color)] animate-fade-in-up">
          {editing ? (
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Modelo ID
                  </label>
                  <input
                    type="text"
                    value={editData.modelId}
                    onChange={(e) =>
                      setEditData({ ...editData, modelId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  System Prompt
                </label>
                <textarea
                  value={editData.systemPrompt}
                  onChange={(e) =>
                    setEditData({ ...editData, systemPrompt: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Temperatura ({editData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editData.temperature}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="256"
                    max="32768"
                    value={editData.maxTokens}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        maxTokens: parseInt(e.target.value) || 2048,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-mono border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-[var(--text-secondary)]">Modelo:</span>{" "}
                  <span className="text-[var(--text-primary)] font-mono">
                    {agent.modelId}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">
                    Temperatura:
                  </span>{" "}
                  <span className="text-[var(--text-primary)]">
                    {agent.temperature}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">
                    Max Tokens:
                  </span>{" "}
                  <span className="text-[var(--text-primary)]">
                    {agent.maxTokens}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">
                    Gateway:
                  </span>{" "}
                  <span className="text-[var(--text-primary)] font-mono truncate">
                    {agent.gatewayUrl || "Por defecto"}
                  </span>
                </div>
              </div>
              {agent.systemPrompt && (
                <div className="text-xs">
                  <span className="text-[var(--text-secondary)]">
                    System Prompt:
                  </span>
                  <p className="mt-1 p-2.5 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                    {agent.systemPrompt}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditData({
                      name: agent.name,
                      description: agent.description,
                      modelId: agent.modelId,
                      systemPrompt: agent.systemPrompt,
                      temperature: agent.temperature,
                      maxTokens: agent.maxTokens,
                    });
                    setEditing(true);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
