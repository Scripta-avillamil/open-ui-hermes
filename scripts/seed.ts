import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Scripta2025*", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@openclaw.local" },
    update: { passwordHash },
    create: {
      username: "admin",
      email: "admin@openclaw.local",
      passwordHash,
    },
  });

  console.log(`Created admin user: ${user.username} (${user.email})`);
  console.log("Password: Scripta2025*");

  // Seed settings
  const defaultSettings = [
    { key: "platform_name", value: "OpenClaw Chat" },
    { key: "platform_logo_url", value: "" },
    { key: "default_model", value: "openclaw" },
    { key: "gateway_url", value: "http://localhost:18789" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("Default settings seeded");

  // Seed default agent
  const existingAgents = await prisma.agent.count();
  if (existingAgents === 0) {
    await prisma.agent.create({
      data: {
        name: "OpenClaw General",
        description: "Agente general de OpenClaw/Hermes para conversaciones versátiles",
        modelId: "openclaw",
        systemPrompt: "Eres un asistente útil y amigable. Responde en el mismo idioma que el usuario.",
        gatewayUrl: "",
        apiKey: "",
        temperature: 0.7,
        maxTokens: 2048,
      },
    });
    console.log("Default agent seeded");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
