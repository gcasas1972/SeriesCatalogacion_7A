import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError("El cuerpo de la solicitud no es válido.", 400);
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("El cuerpo de la solicitud no contiene JSON válido.", 400);
  }
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError("El identificador no es válido.", 400);
  }
  return id;
}

export function requiredText(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(`El campo ${field} es obligatorio.`, 400);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new ApiError(`El campo ${field} no puede superar ${maxLength} caracteres.`, 400);
  }
  return text;
}

export function requiredId(value: unknown, field: string): number {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(`Selecciona ${field}.`, 400);
  }
  return id;
}

export function requiredScore(value: unknown): number {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw new ApiError("El puntaje debe ser un número entero entre 1 y 10.", 400);
  }
  return score;
}

export function handleApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "Ya existe un registro con ese nombre." },
        { status: 409 },
      );
    }
    if (code === "23503") {
      return NextResponse.json(
        { error: "No se puede completar la operación porque hay registros relacionados." },
        { status: 409 },
      );
    }
  }

  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
