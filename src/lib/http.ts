export type ApiErrorShape = {
  message: string;
  code?: string | number;
  details?: unknown;
  status?: number;
};

export class ApiError extends Error {
  code?: string | number;
  details?: unknown;
  status?: number;
  constructor({ message, code, details, status }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(input, { ...init });
    const contentType = res.headers.get("content-type") ?? "";

    let payload: unknown = null;
    if (contentType.includes("application/json")) {
      payload = await res.json().catch(() => null);
    } else {
      payload = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const errPayload = payload as { message?: string; error?: string } | null;
      const message = (errPayload && (errPayload.message || errPayload.error)) || `Error ${res.status}`;
      throw new ApiError({ message, status: res.status, details: payload });
    }
    return payload as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const message = err instanceof Error ? err.message : "Fallo de red. Inténtalo de nuevo";
    throw new ApiError({ message, code: "NETWORK_ERROR" });
  }
}


