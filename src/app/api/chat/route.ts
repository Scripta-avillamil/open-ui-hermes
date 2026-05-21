import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendChatCompletion } from "@/lib/openclaw";
import { ChatMessage } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId, stream = true } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.userId },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversación no encontrada" },
          { status: 404 }
        );
      }
    }

    // Save the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user" && conversationId) {
      await prisma.message.create({
        data: {
          role: "user",
          content: lastMessage.content,
          conversationId,
        },
      });

      // Update conversation title from first message
      const msgCount = await prisma.message.count({
        where: { conversationId },
      });
      if (msgCount <= 1) {
        const title = lastMessage.content.substring(0, 50).trim();
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            title: title || "Nueva conversación",
            updatedAt: new Date(),
          },
        });
      }
    }

    // Forward to OpenClaw Gateway
    const gatewayResponse = await sendChatCompletion(
      messages as ChatMessage[],
      session.userId,
      stream
    );

    if (!stream) {
      const data = await gatewayResponse.json();
      const assistantContent = data.choices?.[0]?.message?.content || "";

      if (conversationId && assistantContent) {
        await prisma.message.create({
          data: { role: "assistant", content: assistantContent, conversationId },
        });
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      }

      return NextResponse.json(data);
    }

    // Stream response with proper SSE buffering
    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        const reader = gatewayResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let sseBuffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split("\n");
            // Keep last potentially incomplete line
            sseBuffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));

                // Save complete assistant message to DB
                if (conversationId && fullContent) {
                  await prisma.message.create({
                    data: { role: "assistant", content: fullContent, conversationId },
                  });
                  await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() },
                  });
                }
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                }
              } catch {
                // Skip malformed JSON
              }

              // Forward the SSE event to client
              controller.enqueue(encoder.encode(`${trimmed}\n\n`));
            }
          }

          // Process any remaining buffer
          if (sseBuffer.trim()) {
            const trimmed = sseBuffer.trim();
            if (trimmed.startsWith("data: ")) {
              controller.enqueue(encoder.encode(`${trimmed}\n\n`));
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
