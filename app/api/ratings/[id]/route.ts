import { NextResponse } from "next/server";
import {
  handleApiError,
  parseId,
  readJson,
  requiredId,
  requiredScore,
  requiredText,
} from "@/lib/api";
import { getDb } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    const body = await readJson(request);
    const platformId = requiredId(body.platform_id, "una plataforma");
    const seriesId = requiredId(body.series_id, "una serie");
    const score = requiredScore(body.score);
    const observation = requiredText(body.observation, "observación", 2000);
    const sql = getDb();
    const [data] = await sql`
      UPDATE ratings
      SET platform_id = ${platformId}, series_id = ${seriesId},
        score = ${score}, observation = ${observation}
      WHERE id = ${id}
      RETURNING id, platform_id, series_id, score, observation
    `;
    if (!data) return NextResponse.json({ error: "No se encontró la valoración." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "No se pudo actualizar la valoración.");
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    const sql = getDb();
    const [data] = await sql`
      DELETE FROM ratings WHERE id = ${id}
      RETURNING id
    `;
    if (!data) return NextResponse.json({ error: "No se encontró la valoración." }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return handleApiError(error, "No se pudo eliminar la valoración.");
  }
}
