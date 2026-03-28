import type { NextRequest } from "next/server";

export function getRequestUserId(request: NextRequest, queryUserId: string | null) {
  const headerUserId = request.headers.get("x-user-id");
  return headerUserId ?? queryUserId;
}
