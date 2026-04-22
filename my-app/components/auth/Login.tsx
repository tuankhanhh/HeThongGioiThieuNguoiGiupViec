"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, tokenStore } from "@/services/api";
import { ROUTES } from "@/lib/routes";

const ROLE_LABELS = {
  CUSTOMER: "Khách hàng",
  MAID: "Người giúp việc",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const REDIRECT_MAP: Record<string, string> = {
  Customer: "/",
  Staff: "/staff/dashboard",
  Admin: "/admin/dashboard",
  Maid: "ROUTES.MAID.PROFILE",
};

interface LoginProps {
  signUpHref?: string;
  roleType: keyof typeof ROLE_LABELS;
}

export default function Login({
  signUpHref = "ROUTES.CUSTOMER.REGISTER",
  roleType = "CUSTOMER",
}: LoginProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gọi API Login để lấy cặp Token
      const data = await api.post<any>("/User/login", {
        soDienThoai: phone,
        matKhau: password,
      });

      // 2. Lưu token vào store (Để apiService có token gọi các API tiếp theo)
      tokenStore.setTokens({
        accessToken: data.accessToken || data.AccessToken,
        refreshToken: data.refreshToken || data.RefreshToken,
      });

      // 3. GỌI API /ME ĐỂ LẤY ROLE THẬT TỪ SERVER
      // Thay vì atob, ta dùng chính API bạn vừa viết.
      // apiService sẽ tự kẹp Token vừa lưu ở trên vào Header.
      const userData = await api.get<any>("/User/me");
      const role = userData.role || userData.Role;
      
      console.log("User data:", userData);
      console.log("Role:", role);
      console.log("Redirect path:", REDIRECT_MAP[role]);

      // 4. Luồng xử lý điều hướng dựa trên Role từ API /me
      if (role === "Maid") {
        const { hasProfile, status } = await api.get<any>("/v1/maid/status");
        if (!hasProfile) {
          router.push(ROUTES.MAID.REGISTER_INFO);
        } else if (status === "Đã duyệt") {
          router.push(ROUTES.MAID.PROFILE);
        } else {
          router.push(ROUTES.MAID.REGISTER_STATUS);
        }
        return;
      }

      // 5. Điều hướng cho các Role khác (Customer, Staff, Admin)
      const targetPath = REDIRECT_MAP[role] || "/";
      router.push(targetPath);
    } catch (err: any) {
      setError(err.message || "Thông tin đăng nhập không chính xác.");
      tokenStore.clearTokens(); // Xóa sạch dấu vết nếu login lỗi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-800 font-display mb-2">
              Chào mừng trở lại!
            </h2>
            <p className="text-stone-500 text-sm">
              Đăng nhập với vai trò{" "}
              <span className="font-semibold text-amber-600">
                {ROLE_LABELS[roleType]}
              </span>
            </p>
          </header>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-stone-700">
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-xs text-amber-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? "ẨN" : "HIỆN"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading ? "Đang xác thực..." : "Đăng nhập"}
            </button>
          </form>

          {(roleType === "CUSTOMER" || roleType === "MAID") && (
            <footer className="mt-8 text-center border-t border-stone-100 pt-6">
              <p className="text-stone-500 text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  href={signUpHref}
                  className="font-bold text-amber-600 hover:text-amber-700"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </footer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
