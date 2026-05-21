import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const HERMES_BIN = process.env.HERMES_BIN || "hermes";
const HERMES_TIMEOUT = parseInt(process.env.HERMES_TIMEOUT || "120000", 10);

export interface HermesResponse {
  content: string;
  sessionId: string | null;
}

function parseSessionId(output: string): string | null {
  const match = output.match(/session_id:\s*([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

function cleanOutput(output: string): string {
  let cleaned = output;
  const sessionLine = cleaned.match(/^session_id:.*$/im);
  if (sessionLine) {
    cleaned = cleaned.replace(sessionLine[0], "");
  }
  return cleaned.trim();
}

export async function sendMessage(
  message: string,
  sessionId?: string | null
): Promise<HermesResponse> {
  const args: string[] = ["chat", "-q", message, "-Q"];

  if (sessionId) {
    args.push("--resume", sessionId);
  }

  try {
    const { stdout, stderr } = await execFileAsync(HERMES_BIN, args, {
      timeout: HERMES_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, HERMES_ACCEPT_HOOKS: "1" },
    });

    const output = stdout || stderr;
    const newSessionId = parseSessionId(output);
    const content = cleanOutput(output);

    return {
      content: content || "Sin respuesta del agente.",
      sessionId: newSessionId || sessionId || null,
    };
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ETIMEDOUT") {
      throw new Error("Hermes tardó demasiado en responder. Intenta de nuevo.");
    }

    const execError = error as { stdout?: string; stderr?: string; message?: string };
    const partialOutput = execError.stdout || execError.stderr || "";

    if (partialOutput) {
      const newSessionId = parseSessionId(partialOutput);
      const content = cleanOutput(partialOutput);
      if (content) {
        return {
          content,
          sessionId: newSessionId || sessionId || null,
        };
      }
    }

    throw new Error(
      `Error communicating with Hermes: ${execError.message || "Unknown error"}`
    );
  }
}
