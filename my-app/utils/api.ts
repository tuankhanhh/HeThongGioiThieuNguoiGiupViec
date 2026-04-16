// 1. Định nghĩa các Interface cơ bản
type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions extends RequestInit {
  params?: QueryParams;
}

// 2. Lấy Base URL từ biến môi trường
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 3. Hàm xử lý Query String
const buildQueryString = (params?: QueryParams): string => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

// 4. API Service chính
export const apiService = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...customConfig } = options;

    // Tạo URL hoàn chỉnh với Query String
    const url = `${BASE_URL}${endpoint}${buildQueryString(params)}`;

    // Tự động lấy token từ localStorage (chỉ chạy ở phía Client)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customConfig.headers,
    };

    const config: RequestInit = {
      ...customConfig,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Xử lý lỗi HTTP (401, 403, 500...)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
      }

      // Nếu API không trả về nội dung (204 No Content)
      if (response.status === 204) return {} as T;

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Đã xảy ra lỗi không xác định");
    }
  },

  // Các phương thức rút gọn
  get<T>(endpoint: string, params?: QueryParams) {
    return this.request<T>(endpoint, { method: "GET", params });
  },

  post<T, D>(endpoint: string, data: D) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put<T, D>(endpoint: string, data: D) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  },
};

export default apiService;
