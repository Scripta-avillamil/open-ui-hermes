import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Error al obtener agentes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, modelId, systemPrompt, gatewayUrl, apiKey, temperature, maxTokens } = body;

    if (!name || !modelId) {
      return NextResponse.json(
        { error: "Nombre y modelo son requeridos" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description: description || "",
        modelId,
        systemPrompt: systemPrompt || "",
        gatewayUrl: gatewayUrl || "",
        apiKey: apiKey || "",
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 2048,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Error al crear agente" },
      { status: 500 }
    );
  }
}
