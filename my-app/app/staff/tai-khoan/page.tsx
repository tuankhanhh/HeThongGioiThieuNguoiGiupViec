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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 font-medium mb-0.5">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
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
        const data = await api.get<any>("/User/me");
        setUser({
          hoTen: data.HoTen || data.hoTen || "—",
          email: data.Email || data.email || "—",
          soDienThoai: data.SoDienThoai || data.soDienThoai || "—",
          role: data.Role || data.role || "Staff",
        });
      } catch {
        // Failed to get user, just show blank
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
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tài khoản</h1>
        <p className="text-sm text-slate-500 mt-1">Thông tin tài khoản nhân viên</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        {/* Avatar area */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
            {loading ? "?" : (user?.hoTen?.charAt(0) ?? "S")}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{loading ? "Đang tải..." : (user?.hoTen ?? "—")}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
              Nhân viên
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-6 py-2">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <InfoItem label="Họ tên" value={user?.hoTen ?? "—"} />
              <InfoItem label="Email" value={user?.email ?? "—"} />
              <InfoItem label="Số điện thoại" value={user?.soDienThoai ?? "—"} />
              <InfoItem label="Vai trò" value="Nhân viên (Staff)" />
            </>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Đăng xuất
      </button>
    </div>
  );
}
