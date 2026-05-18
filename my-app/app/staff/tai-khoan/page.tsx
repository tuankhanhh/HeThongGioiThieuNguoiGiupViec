"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore } from "@/services/api";

interface UserInfo {
  hoTen: string;
  email: string;
  soDienThoai: string;
  role: string;
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-[14px] text-slate-800 font-semibold">
            {value || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TaiKhoanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<any>("/User/me");

        // Console log ra để xem cấu trúc thật của API trả về
        console.log("Dữ liệu User/me:", res);

        // Trích xuất đúng object chứa thông tin (nếu backend bọc trong res.data thì lấy res.data)
        const userData = res.data || res;

        setUser({
          hoTen: userData.HoTen || userData.hoTen || "—",
          email: userData.Email || userData.email || "—",
          soDienThoai:
            userData.SoDienThoai ||
            userData.soDienThoai ||
            userData.phone ||
            "—",
          role: userData.Role || userData.role || "Nhân viên",
        });
      } catch (err) {
        console.error("Lỗi lấy thông tin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    tokenStore.clearTokens();
    router.push("/staff/login");
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
          Tài khoản
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Thông tin tài khoản nhân viên
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        {/* Avatar area */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 px-6 py-8 flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm shrink-0">
            {loading ? "?" : (user?.hoTen?.charAt(0) ?? "S")}
          </div>
          <div>
            <p className="text-[20px] font-bold text-white leading-tight">
              {loading ? "Đang tải..." : (user?.hoTen ?? "—")}
            </p>
            <p className="text-[12.5px] text-white/70 mt-1">
              {user?.email ?? ""}
            </p>
            <span className="inline-block mt-2 text-[11.5px] font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
              Nhân viên
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-6 py-2">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-[13px] text-slate-400">
                Đang tải thông tin...
              </p>
            </div>
          ) : (
            <>
              <InfoItem
                label="Họ tên"
                value={user?.hoTen ?? "—"}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
              <InfoItem
                label="Email"
                value={user?.email ?? "—"}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <InfoItem
                label="Số điện thoại"
                value={user?.soDienThoai ?? "—"}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
              />
              <InfoItem
                label="Vai trò"
                value="Nhân viên (Staff)"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 text-[14px] font-bold hover:bg-red-50 hover:border-red-300 transition-all duration-150 cursor-pointer group"
      >
        <svg
          className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Đăng xuất
      </button>
    </div>
  );
}
