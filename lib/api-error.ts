type FlattenedErrors = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

export function formatApiErrorMessage(
  body: unknown,
  fallback = "So‘rovda xato yuz berdi."
): string {
  if (!body || typeof body !== "object") return fallback;

  const payload = body as { error?: string; details?: FlattenedErrors };
  const details = payload.details;

  if (details?.formErrors?.[0]) return details.formErrors[0];

  if (details?.fieldErrors) {
    for (const messages of Object.values(details.fieldErrors)) {
      if (messages?.[0]) return messages[0];
    }
  }

  if (typeof payload.error === "string" && payload.error.length > 0) {
    return payload.error;
  }

  return fallback;
}
