"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RoleType = "CUSTOMER" | "MAID" | "STAFF" | "ADMIN";

interface LoginProps {
  signUpHref?: string;
  roleType: RoleType;
}

export default function Login({
  signUpHref = "/customer/sign-up",
  roleType = "CUSTOMER",
}: LoginProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const roleLabels: Record<RoleType, string> = {
    CUSTOMER: "Khách hàng",
    MAID: "Người giúp việc",
    STAFF: "Nhân viên",
    ADMIN: "Quản trị viên",
  };

  const redirectMap: Record<string, string> = {
    Customer: "/",
    Staff: "/Staff",
    Admin: "/Admin",
  };

  async function loginApi(soDienThoai: string, matKhau: string) {
    const res = await fetch("https://localhost:7095/api/User/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soDienThoai, matKhau }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Đăng nhập thất bại");
    }
    return res.json();
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Gọi API Login
      const data = await loginApi(phone, password);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 2. Giải mã JWT lấy Role
      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      const roles =
        payload["role"] ||
        payload["roles"] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const role = Array.isArray(roles) ? roles[0] : roles;

      // 3. Xử lý logic riêng nếu Role là Maid
      if (role === "Maid") {
        const statusRes = await fetch(
          "https://localhost:7095/api/v1/maid/status",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.accessToken}`,
            },
          },
        );

        if (!statusRes.ok) throw new Error("Không thể tải trạng thái hồ sơ");

        const { hasProfile, status } = await statusRes.json();

        if (!hasProfile) {
          router.push("/maid/sign-up/generalinfo");
          return;
        }

        // Tối ưu Router: Gom Chờ duyệt & Từ chối về chung 1 trang Status
        switch (status) {
          case "Đã duyệt":
            router.push("/maid/profile"); // Vào thẳng hệ thống làm việc
            break;
          case "Chờ duyệt":
          case "Từ chối":
            // Đẩy sang trang dùng chung để hiển thị thông báo
            router.push("/maid/sign-up/status");
            break;
          default:
            throw new Error("Trạng thái hồ sơ không hợp lệ.");
        }
        return;
      }

      // 4. Nếu là các Role khác
      const targetPath = redirectMap[role] || "/";
      router.push(targetPath);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
      >
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-800 font-display mb-2">
              Chào mừng trở lại!
            </h2>
            <p className="text-stone-500 text-sm">
              Đăng nhập với vai trò{" "}
              <span className="font-semibold text-amber-600">
                {roleLabels[roleType]}
              </span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-stone-700">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-amber-500 hover:text-amber-600"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {(roleType === "CUSTOMER" || roleType === "MAID") && (
            <div className="mt-8 text-center">
              <p className="text-stone-500 text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  href={signUpHref}
                  className="font-bold text-amber-500 hover:text-amber-600"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
