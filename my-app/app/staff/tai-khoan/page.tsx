"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore } from "@/services/api";

interface UserInfo {
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  role: string;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
          {label}
        </span>
        <span className="text-base text-slate-800 font-semibold break-words">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Modal Đổi mật khẩu
// ─────────────────────────────────────────────

function ModalDoiMatKhau({ onClose }: { onClose: () => void }) {
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhauMoi, setXacNhanMatKhauMoi] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(
    null
  );

  const handleXacNhan = async () => {
    setThongBaoLoi(null);
    setThongBaoThanhCong(null);

    if (!matKhauCu.trim() || !matKhauMoi.trim() || !xacNhanMatKhauMoi.trim()) {
      setThongBaoLoi("Vui lòng điền đầy đủ tất cả các ô.");
      return;
    }
    if (matKhauMoi !== xacNhanMatKhauMoi) {
      setThongBaoLoi("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (matKhauMoi.length < 6) {
      setThongBaoLoi("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setDangGui(true);
    try {
      await api.post("/v1/staff/doi-mat-khau", {
        MatKhauCu: matKhauCu,
        MatKhauMoi: matKhauMoi,
      });
      setThongBaoThanhCong("Đổi mật khẩu thành công!");
      setMatKhauCu("");
      setMatKhauMoi("");
      setXacNhanMatKhauMoi("");
    } catch (err: any) {
      const thongDiep =
        err?.response?.data?.message ||
        err?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      setThongBaoLoi(thongDiep);
    } finally {
      setDangGui(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-white">Đổi mật khẩu</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Thông báo lỗi */}
          {thongBaoLoi && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {thongBaoLoi}
            </div>
          )}

          {/* Thông báo thành công */}
          {thongBaoThanhCong && (
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {thongBaoThanhCong}
            </div>
          )}

          {/* Input Mật khẩu cũ */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Mật khẩu cũ
            </label>
            <input
              type="password"
              value={matKhauCu}
              onChange={(e) => setMatKhauCu(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Input Mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={matKhauMoi}
              onChange={(e) => setMatKhauMoi(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Input Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={xacNhanMatKhauMoi}
              onChange={(e) => setXacNhanMatKhauMoi(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={dangGui}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleXacNhan}
            disabled={dangGui}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {dangGui ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function TaiKhoanPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hienThiModalDoiMatKhau, setHienThiModalDoiMatKhau] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get<any>("/v1/staff/me");
        const userData = res.data || res;
        setUser({
          hoTen: userData.hoTen || userData.HoTen || "—",
          email: userData.email || userData.Email || "—",
          soDienThoai:
            userData.soDienThoai ||
            userData.SoDienThoai ||
            userData.phone ||
            "—",
          diaChi:
            userData.diaChi ||
            userData.DiaChi ||
            userData.address ||
            "Chưa cập nhật",
          role: userData.role || userData.Role || "Nhân viên",
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
    <>
      {/* Modal Đổi mật khẩu */}
      {hienThiModalDoiMatKhau && (
        <ModalDoiMatKhau onClose={() => setHienThiModalDoiMatKhau(false)} />
      )}

      <div className="p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            <h1 className="text-3xl font-black text-slate-800 leading-tight">
              Tài khoản
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-4">
            Thông tin tài khoản nhân viên
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          {/* Banner with avatar */}
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-black text-4xl backdrop-blur-sm shrink-0 shadow-lg">
                {loading ? "?" : (user?.hoTen?.charAt(0)?.toUpperCase() ?? "S")}
              </div>

              {/* Name & meta */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white leading-tight truncate">
                  {loading ? "Đang tải..." : (user?.hoTen ?? "—")}
                </h2>
                <p className="text-sm text-white/70 mt-1 truncate">
                  {user?.email ?? ""}
                </p>
                <span className="inline-block mt-3 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/25 backdrop-blur-sm">
                  {user?.role ?? "Nhân viên"}
                </span>
              </div>
            </div>
          </div>

          {/* Info grid — 2 columns on large screens */}
          <div className="px-8 py-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">
                  Đang tải thông tin...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                <InfoRow
                  label="Họ tên"
                  value={user?.hoTen ?? "—"}
                  icon={
                    <svg
                      className="w-4.5 h-4.5"
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
                <InfoRow
                  label="Email"
                  value={user?.email ?? "—"}
                  icon={
                    <svg
                      className="w-4.5 h-4.5"
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
                <InfoRow
                  label="Số điện thoại"
                  value={user?.soDienThoai ?? "—"}
                  icon={
                    <svg
                      className="w-4.5 h-4.5"
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
                <InfoRow
                  label="Địa chỉ"
                  value={user?.diaChi ?? "Chưa cập nhật"}
                  icon={
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                />
                <InfoRow
                  label="Vai trò"
                  value={user?.role ?? "Nhân viên"}
                  icon={
                    <svg
                      className="w-4.5 h-4.5"
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
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Nút Đổi mật khẩu */}
          <button
            onClick={() => setHienThiModalDoiMatKhau(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border-2 border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-150 cursor-pointer group w-full sm:w-fit"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Đổi mật khẩu
          </button>

          {/* Nút Đăng xuất */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all duration-150 cursor-pointer group w-full sm:w-fit"
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
      </div>
    </>
  );
}
