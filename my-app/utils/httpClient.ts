const BASE_URL = "https://localhost:7095/api";

async function refreshToken() {
  const token = localStorage.getItem("refreshToken");
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/User/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export const httpClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("accessToken");

  // Cấu hình Header mặc định
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  // Gọi request lần 1
  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Nếu lỗi 401, thử Refresh Token
  if (response.status === 401) {
    const newToken = await refreshToken();

    if (newToken) {
      // Thử gọi lại lần 2 với Token mới
      const retryConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        },
      };
      response = await fetch(`${BASE_URL}${endpoint}`, retryConfig);
    } else {
      // Refresh thất bại -> Xóa rác và đẩy về trang login (chỉ chạy ở client)
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  }

  return response;
};
