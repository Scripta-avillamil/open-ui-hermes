import { OpenClawRequest, ChatMessage } from "@/types";

const GATEWAY_URL =
  process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const API_KEY = process.env.OPENCLAW_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENCLAW_MODEL || "openclaw";

export async function sendChatCompletion(
  messages: ChatMessage[],
  userId?: string,
  stream = false
): Promise<Response> {
  const body: OpenClawRequest = {
    model: DEFAULT_MODEL,
    messages,
    stream,
    ...(userId && { user: userId }),
  };

  const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenClaw Gateway error (${response.status}): ${errorText}`
    );
  }

  return response;
}

export { GATEWAY_URL, DEFAULT_MODEL };
