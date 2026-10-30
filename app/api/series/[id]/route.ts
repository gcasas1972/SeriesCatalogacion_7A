import { NextResponse } from "next/server";
import { handleApiError, parseId, readJson, requiredId, requiredText } from "@/lib/api";
import { getDb } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    const body = await readJson(request);
    const name = requiredText(body.name, "nombre", 150);
    const platformId = requiredId(body.platform_id, "una plataforma");
    const sql = getDb();
    const [data] = await sql`
      UPDATE series SET name = ${name}, platform_id = ${platformId}
      WHERE id = ${id}
      RETURNING id, name, platform_id
    `;
    if (!data) return NextResponse.json({ error: "No se encontró la serie." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "No se pudo actualizar la serie.");
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    const sql = getDb();
    const [data] = await sql`
      DELETE FROM series WHERE id = ${id}
      RETURNING id
    `;
    if (!data) return NextResponse.json({ error: "No se encontró la serie." }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return handleApiError(error, "No se pudo eliminar la serie.");
  }
}
