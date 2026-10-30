import { NextResponse } from "next/server";
import {
  handleApiError,
  readJson,
  requiredId,
  requiredScore,
  requiredText,
} from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const data = await sql`
      SELECT r.id, r.platform_id, p.name AS platform_name, r.series_id,
        s.name AS series_name, r.score, r.observation
      FROM ratings r
      JOIN platforms p ON p.id = r.platform_id
      JOIN series s ON s.id = r.series_id
      ORDER BY r.id DESC
    `;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "No se pudieron cargar las valoraciones.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const platformId = requiredId(body.platform_id, "una plataforma");
    const seriesId = requiredId(body.series_id, "una serie");
    const score = requiredScore(body.score);
    const observation = requiredText(body.observation, "observación", 2000);
    const sql = getDb();
    const [data] = await sql`
      INSERT INTO ratings (platform_id, series_id, score, observation)
      VALUES (${platformId}, ${seriesId}, ${score}, ${observation})
      RETURNING id, platform_id, series_id, score, observation
    `;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "No se pudo crear la valoración.");
  }
}
