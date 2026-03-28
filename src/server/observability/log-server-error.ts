export function logServerError(scope: string, error: unknown, metadata?: Record<string, unknown>) {
  const payload = {
    scope,
    errorMessage: error instanceof Error ? error.message : String(error),
    ...(metadata ? { metadata } : {}),
  };

  // Keep logging lightweight and structured for local/dev and production runtimes.
  console.error(payload);
}
