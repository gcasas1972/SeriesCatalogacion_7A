import { NextResponse } from "next/server";
import { handleApiError, readJson, requiredText } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const data = await sql`
      SELECT p.id, p.name,
        (SELECT COUNT(*)::int FROM series s WHERE s.platform_id = p.id) AS series_count
      FROM platforms p
      ORDER BY p.name
    `;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "No se pudieron cargar las plataformas.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const name = requiredText(body.name, "nombre", 100);
    const sql = getDb();
    const [data] = await sql`
      INSERT INTO platforms (name)
      VALUES (${name})
      RETURNING id, name
    `;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "No se pudo crear la plataforma.");
  }
}
