const BACKEND_URL = "https://localhost:7095";

export const getImageUrl = (path?: string) => {
  if (!path) return "/default-placeholder.png"; // Đường dẫn đến ảnh mặc định trong thư mục public của Next.js

  // Nếu path đã là một URL đầy đủ (http/https) thì giữ nguyên
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Đảm bảo không bị dư hoặc thiếu dấu gạch chéo "/"
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${BACKEND_URL}${cleanPath}`;
};
