import { NextResponse } from "next/server";
import { handleApiError, readJson, requiredId, requiredText } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const data = await sql`
      SELECT s.id, s.name, s.platform_id, p.name AS platform_name,
        (SELECT COUNT(*)::int FROM ratings r WHERE r.series_id = s.id) AS ratings_count
      FROM series s
      JOIN platforms p ON p.id = s.platform_id
      ORDER BY s.name
    `;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "No se pudieron cargar las series.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const name = requiredText(body.name, "nombre", 150);
    const platformId = requiredId(body.platform_id, "una plataforma");
    const sql = getDb();
    const [data] = await sql`
      INSERT INTO series (name, platform_id)
      VALUES (${name}, ${platformId})
      RETURNING id, name, platform_id
    `;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "No se pudo crear la serie.");
  }
}
