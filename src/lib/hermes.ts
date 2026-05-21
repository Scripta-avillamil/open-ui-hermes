import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const HERMES_BIN = process.env.HERMES_BIN || "hermes";
const HERMES_TIMEOUT = parseInt(process.env.HERMES_TIMEOUT || "120000", 10);

export interface HermesResponse {
  content: string;
  sessionId: string | null;
}

function parseSessionId(output: string): string | null {
  // Match session_id patterns like "session_id: abc123" or just the ID after a label
  const patterns = [
    /session_id:\s*([a-f0-9-]{8,})/i,
    /session\s*(?:id)?:\s*([a-f0-9-]{8,})/i,
    /Saved session\s*\(?([a-f0-9-]{8,})\)?/i,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function cleanOutput(output: string): string {
  let cleaned = output;

  // Remove session info lines
  cleaned = cleaned.replace(/^session_id:.*$/gim, "");
  cleaned = cleaned.replace(/^session\s*(?:id)?:.*$/gim, "");
  cleaned = cleaned.replace(/^Saved session.*$/gim, "");

  return cleaned.trim();
}

export async function sendMessage(
  message: string,
  sessionId?: string | null
): Promise<HermesResponse> {
  // For long messages or messages with special chars, use a temp file approach
  const needsFile = message.length > 200 || message.includes("\n");

  if (needsFile) {
    return sendMessageViaFile(message, sessionId);
  }

  return executeHermes(["chat", "-q", message, "-Q"], sessionId);
}

async function sendMessageViaFile(
  message: string,
  sessionId?: string | null
): Promise<HermesResponse> {
  const tmpFile = join(tmpdir(), `hermes-msg-${randomUUID()}.txt`);

  try {
    await writeFile(tmpFile, message, "utf-8");

    // Use stdin to pass the message
    const args: string[] = ["chat", "-Q"];

    if (sessionId) {
      args.push("--resume", sessionId);
    }

    // Read from file and pipe to stdin
    const { execFile: execFileCb } = require("child_process");
    const result = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        const child = execFileCb(
          HERMES_BIN,
          sessionId
            ? ["chat", "-Q", "--resume", sessionId]
            : ["chat", "-Q"],
          {
            timeout: HERMES_TIMEOUT,
            maxBuffer: 10 * 1024 * 1024,
            env: { ...process.env, HERMES_ACCEPT_HOOKS: "1" },
          },
          (error: Error | null, stdout: string, stderr: string) => {
            if (error && !stdout && !stderr) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          }
        );

        // Send message via stdin and close it
        child.stdin.write(message);
        child.stdin.end();
      }
    );

    const output = result.stdout || result.stderr;
    const newSessionId = parseSessionId(output);
    const content = cleanOutput(output);

    return {
      content: content || "Sin respuesta del agente.",
      sessionId: newSessionId || sessionId || null,
    };
  } finally {
    try {
      await unlink(tmpFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function executeHermes(
  baseArgs: string[],
  sessionId?: string | null
): Promise<HermesResponse> {
  const args: string[] = [...baseArgs];

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
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ETIMEDOUT"
    ) {
      throw new Error("Hermes tardó demasiado en responder. Intenta de nuevo.");
    }

    const execError = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
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
