import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessage } from "@/lib/hermes";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let conversation;

    // Get or create conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.userId },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversación no encontrada" },
          { status: 404 }
        );
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50).trim() || "Nueva conversación",
          userId: session.userId,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        conversationId: conversation.id,
      },
    });

    // Send to Hermes
    const hermesResponse = await sendMessage(
      message,
      conversation.hermesSessionId
    );

    // Save Hermes session ID for continuity
    if (
      hermesResponse.sessionId &&
      hermesResponse.sessionId !== conversation.hermesSessionId
    ) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { hermesSessionId: hermesResponse.sessionId },
      });
    }

    // Save assistant message
    await prisma.message.create({
      data: {
        role: "assistant",
        content: hermesResponse.content,
        conversationId: conversation.id,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      content: hermesResponse.content,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
