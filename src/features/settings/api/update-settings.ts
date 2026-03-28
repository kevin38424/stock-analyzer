import { fetchJson } from "@/lib/http/fetch-json";
import type { SettingsResponse } from "@/features/settings/types/settings";

export type UpdateSettingsPayload = {
  profile?: Partial<SettingsResponse["profile"]>;
  preferences?: Partial<SettingsResponse["preferences"]>;
  notifications?: Partial<SettingsResponse["notifications"]>;
};

export type UpdateSettingsParams = {
  userId: string;
  payload: UpdateSettingsPayload;
};

export async function updateSettings(params: UpdateSettingsParams): Promise<SettingsResponse> {
  const searchParams = new URLSearchParams({ userId: params.userId });

  return fetchJson<SettingsResponse>(`/api/settings?${searchParams.toString()}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.payload),
  });
}
