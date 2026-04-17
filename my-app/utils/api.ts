import queryString from "query-string";

// Lấy Base URL từ biến môi trường
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const sendRequest = async <T>(props: IRequest): Promise<T> => {
  const {
    url,
    method,
    body,
    queryParams = {},
    useCredentials = false,
    headers = {},
    nextOption = {},
  } = props;

  // 1. Xử lý URL: Kết hợp Base URL nếu truyền vào url tương đối
  const fullUrl = url.startsWith("http")
    ? url
    : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  // 2. Xử lý Query Params
  const finalUrl =
    Object.keys(queryParams).length > 0
      ? `${fullUrl}?${queryString.stringify(queryParams)}`
      : fullUrl;

  const options: RequestInit = {
    method: method,
    headers: new Headers({
      "content-type": "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : null,
    ...nextOption,
  };

  if (useCredentials) options.credentials = "include";

  // 3. Thực thi Request bằng async/await cho sạch sẽ
  const res = await fetch(finalUrl, options);

  if (res.ok) {
    return (await res.json()) as T;
  } else {
    const json = await res.json();
    // Trả về một object lỗi có cấu trúc
    return {
      statusCode: res.status,
      message: json?.message ?? "Có lỗi xảy ra",
      error: json?.error ?? "Lỗi không xác định",
    } as T;
  }
};
