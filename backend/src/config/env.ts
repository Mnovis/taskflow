import "dotenv/config";
import { z } from "zod";

// Valida as variáveis de ambiente na inicialização do processo.
// Se algo obrigatório estiver faltando ou malformado, o app falha rápido
// (fail-fast) em vez de quebrar silenciosamente em runtime.
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_URL: z.string().url(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_ACCESS_SECRET: z.string().min(10, "JWT_ACCESS_SECRET muito curto"),
  JWT_REFRESH_SECRET: z.string().min(10, "JWT_REFRESH_SECRET muito curto"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
