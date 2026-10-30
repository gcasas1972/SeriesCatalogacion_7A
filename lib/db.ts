import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Falta configurar la variable de entorno DATABASE_URL.");
  }

  return neon(databaseUrl);
}
