import { NextRequest } from "next/server";
import {
  parseJsonBody,
  parseQueryParams,
  parseWithSchema,
  queryParamsWithDefaults,
} from "@/server/http/parsing";
import { badRequest, notFound, ok, serverError } from "@/server/http/response";
import { getRequestUserId } from "@/server/http/request-context";
import {
  watchlistCreateSchema,
  watchlistDeleteSchema,
  watchlistPatchSchema,
  watchlistQuerySchema,
} from "@/server/watchlist/watchlist-schemas";
import {
  createOrUpdateWatchlistItem,
  fetchWatchlistPageData,
  patchWatchlistItem,
  removeWatchlistItem,
} from "@/server/watchlist/watchlist-service";

function toResponse(result: Awaited<ReturnType<typeof createOrUpdateWatchlistItem>>) {
  if (result.kind === "not_found") {
    return notFound(result.message);
  }

  if (result.kind === "error") {
    return serverError(result.message);
  }

  return ok(result.data, result.status);
}

export async function GET(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsed = parseQueryParams(request, watchlistQuerySchema, () => ({
    ...queryParamsWithDefaults(request.nextUrl.searchParams, {
      segment: "all_holdings",
      sortBy: "score_desc",
    }),
    userId: requestUserId,
  }));

  if (!parsed) {
    return badRequest("Invalid watchlist query parameters.");
  }

  const payload = await fetchWatchlistPageData(parsed);
  return ok(payload);
}

export async function POST(request: NextRequest) {
  const rawBody = await parseJsonBody(request);
  if (!rawBody) {
    return badRequest("Invalid JSON body.");
  }

  const body = parseWithSchema(rawBody, watchlistCreateSchema);
  if (!body) {
    return badRequest("Invalid watchlist payload.");
  }

  return toResponse(await createOrUpdateWatchlistItem(body));
}

export async function PATCH(request: NextRequest) {
  const rawBody = await parseJsonBody(request);
  if (!rawBody) {
    return badRequest("Invalid JSON body.");
  }

  const body = parseWithSchema(rawBody, watchlistPatchSchema);
  if (!body) {
    return badRequest("Invalid watchlist update payload.");
  }

  return toResponse(await patchWatchlistItem(body));
}

export async function DELETE(request: NextRequest) {
  const rawBody = await parseJsonBody(request);
  if (!rawBody) {
    return badRequest("Invalid JSON body.");
  }

  const body = parseWithSchema(rawBody, watchlistDeleteSchema);
  if (!body) {
    return badRequest("Invalid watchlist delete payload.");
  }

  return toResponse(await removeWatchlistItem(body));
}
