import type { NextRequest } from "next/server";
import type { z } from "zod";

export async function parseJsonBody(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function parseWithSchema<TSchema extends z.ZodTypeAny>(
  data: unknown,
  schema: TSchema,
): z.output<TSchema> | null {
  const parsed = schema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export function parseQueryParams<TSchema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: TSchema,
  mapper: (params: URLSearchParams) => Record<string, unknown>,
): z.output<TSchema> | null {
  const parsed = schema.safeParse(mapper(request.nextUrl.searchParams));
  return parsed.success ? parsed.data : null;
}

export function queryParamsWithDefaults<T extends Record<string, string | undefined>>(
  params: URLSearchParams,
  defaults: T,
): T {
  const output = {} as T;

  for (const [key, value] of Object.entries(defaults)) {
    output[key as keyof T] = (params.get(key) ?? value) as T[keyof T];
  }

  return output;
}
