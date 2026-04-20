// src/lib/apiService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local");
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

type ApiError = {
  status: number;
  message: string;
  data?: unknown;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type RefreshResponse = {
  accessToken?: string;
  AccessToken?: string;
  refreshToken?: string;
  RefreshToken?: string;
  token?: string;
};

let refreshPromise: Promise<boolean> | null = null;

const isBrowser = () => typeof window !== "undefined";

const readStorage = (key: string): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(key);
};

const writeStorage = (key: string, value: string | null) => {
  if (!isBrowser()) return;

  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
};

let accessToken: string | null = readStorage(ACCESS_TOKEN_KEY);
let refreshToken: string | null = readStorage(REFRESH_TOKEN_KEY);

export const tokenStore = {
  getAccessToken: () => accessToken ?? readStorage(ACCESS_TOKEN_KEY),
  getRefreshToken: () => refreshToken ?? readStorage(REFRESH_TOKEN_KEY),

  setTokens: (tokens: {
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => {
    if (typeof tokens.accessToken !== "undefined") {
      accessToken = tokens.accessToken;
      writeStorage(ACCESS_TOKEN_KEY, tokens.accessToken);
    }

    if (typeof tokens.refreshToken !== "undefined") {
      refreshToken = tokens.refreshToken;
      writeStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  },

  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
    writeStorage(ACCESS_TOKEN_KEY, null);
    writeStorage(REFRESH_TOKEN_KEY, null);
  },
};

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const isFormData = (body: unknown): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const isBlob = (body: unknown): body is Blob =>
  typeof Blob !== "undefined" && body instanceof Blob;

const isURLSearchParams = (body: unknown): body is URLSearchParams =>
  typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;

const prepareBodyAndHeaders = (options: ApiRequestOptions) => {
  const headers = new Headers(options.headers || {});
  let body: BodyInit | undefined;

  if (typeof options.body === "undefined" || options.body === null) {
    body = undefined;
  } else if (
    isFormData(options.body) ||
    isBlob(options.body) ||
    isURLSearchParams(options.body)
  ) {
    body = options.body;
    headers.delete("Content-Type");
  } else if (typeof options.body === "string") {
    body = options.body;
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/plain;charset=UTF-8");
    }
  } else {
    body = JSON.stringify(options.body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  return { headers, body };
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  return text as T;
};

const parseError = async (res: Response): Promise<ApiError> => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      return {
        status: res.status,
        message:
          (data as Record<string, unknown>)?.message?.toString() ||
          (data as Record<string, unknown>)?.Message?.toString() ||
          `HTTP ${res.status}`,
        data,
      };
    } catch {
      return {
        status: res.status,
        message: `HTTP ${res.status}`,
      };
    }
  }

  const text = await res.text();
  return {
    status: res.status,
    message: text || `HTTP ${res.status}`,
  };
};

const refreshAccessToken = async (): Promise<boolean> => {
  const currentRefreshToken = tokenStore.getRefreshToken();
  if (!currentRefreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl("/User/refresh-token"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: currentRefreshToken,
          }),
          credentials: "include",
        });

        if (!res.ok) return false;

        const data = (await res.json()) as RefreshResponse;

        const newAccessToken =
          data.accessToken ?? data.AccessToken ?? data.token ?? null;

        const newRefreshToken =
          data.refreshToken ?? data.RefreshToken ?? currentRefreshToken;

        if (!newAccessToken) return false;

        tokenStore.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const request = async <T>(
  path: string,
  options: ApiRequestOptions = {},
  retryOn401 = true
): Promise<T> => {
  const token = tokenStore.getAccessToken();
  const { headers, body } = prepareBodyAndHeaders(options);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), {
    ...options,
    headers,
    body,
    credentials: options.credentials ?? "include",
  });

  if (res.status === 401 && retryOn401) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      tokenStore.clearTokens();

      if (isBrowser()) {
        window.location.href = "/customer/sign-in";
      }

      throw {
        status: 401,
        message: "Session expired",
      } as ApiError;
    }

    return request<T>(path, options, false);
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  return parseResponse<T>(res);
};

export const api = {
  get: <T>(path: string, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export default api;