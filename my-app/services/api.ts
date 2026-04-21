import { ROUTES } from "@/lib/routes";

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

// type RefreshResponse = {
//   accessToken?: string;
//   AccessToken?: string;
//   refreshToken?: string;
//   RefreshToken?: string;
//   token?: string;
// };

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
        // Đảm bảo URL này khớp với Controller C# của bạn (ví dụ: /api/User/refresh-token)
        const res = await fetch(buildUrl("/User/refresh-token"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: currentRefreshToken, // Gửi đúng tên field Backend cần
          }),
        });

        if (!res.ok) return false;

        const data = await res.json();

        // Backend C# của bạn trả về AccessToken và RefreshToken (viết hoa chữ đầu)
        // hoặc accessToken (camelCase). Hãy kiểm tra LoginResponse ở Backend.
        const newAccessToken = data.accessToken || data.AccessToken;
        const newRefreshToken = data.refreshToken || data.RefreshToken;

        if (!newAccessToken) return false;

        // Lưu lại cặp token mới vào localStorage/Store
        tokenStore.setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        return true;
      } catch (error) {
        console.error("Refresh Token Error:", error);
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
  retryOn401 = true,
): Promise<T> => {
  const token = tokenStore.getAccessToken();
  const { headers, body } = prepareBodyAndHeaders(options);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), { ...options, headers, body });

  // 1. Kiểm tra xem đây có phải là request login hay không
  const isLoginRequest = path.includes("/User/login");

  // 2. Chỉ xử lý auto-refresh/redirect nếu KHÔNG PHẢI là trang login
  if (res.status === 401 && retryOn401 && !isLoginRequest) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request<T>(path, options, false);
    } else {
      tokenStore.clearTokens();
      if (typeof window !== "undefined") {
        // Chỉ redirect khi token hết hạn thật sự ở các trang khác
        window.location.href = ROUTES.CUSTOMER.LOGIN;
      }
      throw await parseError(res);
    }
  }

  // 3. Nếu là lỗi (bao gồm cả 401 của Login), ném lỗi ra để component Login xử lý
  if (!res.ok) throw await parseError(res);

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
