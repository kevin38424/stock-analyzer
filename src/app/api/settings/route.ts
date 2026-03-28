import { NextRequest } from "next/server";
import { parseJsonBody, parseWithSchema } from "@/server/http/parsing";
import { badRequest, ok, serverError } from "@/server/http/response";
import { getRequestUserId } from "@/server/http/request-context";
import { getDefaultSettings, getSettingsData, upsertSettingsData } from "@/server/settings/get-settings-data";
import { settingsPatchSchema, settingsQuerySchema } from "@/server/settings/settings-schemas";

export async function GET(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsed = settingsQuerySchema.safeParse({ userId: requestUserId });

  if (!parsed.success) {
    return badRequest("Invalid query parameters.");
  }

  if (!parsed.data.userId) {
    return ok(getDefaultSettings());
  }

  const data = await getSettingsData(parsed.data.userId);
  return ok(data);
}

export async function PATCH(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsedUserId = settingsQuerySchema.safeParse({ userId: requestUserId });
  if (!parsedUserId.success || !parsedUserId.data.userId) {
    return badRequest("A valid userId is required.");
  }

  const rawBody = await parseJsonBody(request);
  if (!rawBody) {
    return badRequest("Invalid JSON body.");
  }

  const parsed = parseWithSchema(rawBody, settingsPatchSchema);
  if (!parsed) {
    return badRequest("Invalid settings payload.");
  }

  if (!parsed.profile && !parsed.preferences && !parsed.notifications) {
    return badRequest("At least one settings section is required.");
  }

  try {
    await upsertSettingsData(parsedUserId.data.userId, {
      profile: parsed.profile,
      preferences: parsed.preferences,
      notifications: parsed.notifications,
    });

    const data = await getSettingsData(parsedUserId.data.userId);
    return ok(data);
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Failed to update settings.");
  }
}
