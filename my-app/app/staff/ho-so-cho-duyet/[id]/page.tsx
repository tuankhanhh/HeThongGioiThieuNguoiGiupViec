"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import StatusBadge from "@/components/componentsStaff/StatusBadge";
import ReasonTextarea from "@/components/componentsStaff/ReasonTextarea";
import ConfirmModal from "@/components/componentsStaff/ConfirmModal";
import { LoadingState, ErrorState } from "@/components/componentsStaff/States";

// --- THÊM CẤU HÌNH BACKEND URL & HÀM HELPER Ở ĐÂY ---
const BACKEND_URL = "https://localhost:7095";

const getImageUrl = (path?: string) => {
  if (!path) return "";

  // Nếu path đã là một URL đầy đủ (http/https) thì giữ nguyên
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Đảm bảo không bị dư hoặc thiếu dấu gạch chéo "/"
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};
// ----------------------------------------------------

interface KyNang {
  id: string;
  ten: string;
  kinhNghiem?: string | null;
}

interface HoSoDetail {
  maHoSo: string;
  maNguoiGiupViec: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  soCccd: string;
  ngaySinh: string;
  gioiTinh: string;
  kinhNghiem: string;
  moTaChiTietKinhNghiem: string;
  tenNguoiThan: string;
  sdtNguoiThan: string;
  anhCccdmatTruoc: string;
  anhCccdmatSau: string;
  anhChanDung: string;
  giayXacNhanCuTru: string;
  trangThai: string;
  lyDoTuChoi: string;
  danhSachKyNang: KyNang[];
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-[14.5px] text-slate-800 font-medium break-words">{value || "—"}</span>
    </div>
  );
}

type ActionState = "idle" | "rejecting";

export default function HoSoChiTietPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [hoSo, setHoSo] = useState<HoSoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionState, setActionState] = useState<ActionState>("idle");
  const [lyDo, setLyDo] = useState("");
  const [lyDoError, setLyDoError] = useState("");

  const [confirmDuyet, setConfirmDuyet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/v1/staff/chi-tiet-ho-so/${id}`);
      setHoSo(res?.data ?? null);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleDuyet = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post("/v1/staff/duyet-ho-so", { MaHoSo: id });
      setSuccessMsg("Hồ sơ đã được duyệt thành công!");
      setConfirmDuyet(false);
      fetchData();
    } catch (err: any) {
      setActionError(err?.message ?? "Duyệt hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTuChoi = async () => {
    if (!lyDo.trim()) {
      setLyDoError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setLyDoError("");
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post("/v1/staff/tu-choi-ho-so", {
        MaHoSo: id,
        LyDoTuChoi: lyDo.trim(),
      });
      setSuccessMsg("Đã từ chối hồ sơ.");
      setActionState("idle");
      setLyDo("");
      fetchData();
    } catch (err: any) {
      setActionError(err?.message ?? "Từ chối hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDone = hoSo && hoSo.trangThai !== "Chờ duyệt";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors cursor-pointer group"
      >
        <span className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
        Quay lại danh sách
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && hoSo && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0 shadow-inner border-2 border-white">
                {hoSo.hoTen?.charAt(0) ?? "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{hoSo.hoTen}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold font-mono rounded-md">
                    {hoSo.maHoSo}
                  </span>
                  <span className="text-sm text-slate-500">{hoSo.soDienThoai}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={hoSo.trangThai} type="hoSo" />
            </div>
          </div>

          {/* Alert banners */}
          {isDone && (
            <div
              className={`p-4 rounded-xl text-[14px] font-medium flex items-start gap-3 shadow-sm ${
                hoSo.trangThai === "Đã duyệt"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span className="text-[20px] leading-none mt-0.5">
                {hoSo.trangThai === "Đã duyệt" ? "✓" : "✗"}
              </span>
              <span>
                {hoSo.trangThai === "Đã duyệt"
                  ? "Hồ sơ này đã được duyệt thành công và hệ thống đã ghi nhận người giúp việc."
                  : `Hồ sơ đã bị từ chối${hoSo.lyDoTuChoi ? ` với lý do: "${hoSo.lyDoTuChoi}"` : "."}`}
              </span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-medium flex items-center gap-2 shadow-sm">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Main Content 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">Thông tin cá nhân</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  <InfoRow label="Họ tên" value={hoSo.hoTen} />
                  <InfoRow label="Email" value={hoSo.email} />
                  <InfoRow label="Số điện thoại" value={hoSo.soDienThoai} />
                  <InfoRow label="Giới tính" value={hoSo.gioiTinh} />
                  <InfoRow
                    label="Ngày sinh"
                    value={hoSo.ngaySinh ? new Date(hoSo.ngaySinh).toLocaleDateString("vi-VN") : "—"}
                  />
                  <InfoRow label="Số CCCD" value={hoSo.soCccd} />
                  <div className="md:col-span-2">
                    <InfoRow label="Địa chỉ" value={hoSo.diaChi} />
                  </div>
                  <InfoRow label="Người thân" value={hoSo.tenNguoiThan || "—"} />
                  <InfoRow label="SĐT Người thân" value={hoSo.sdtNguoiThan || "—"} />
                </div>
              </div>


            </div>

            {/* Right Column: Skills */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                <div className="px-6 py-4 border-b border-violet-100 bg-violet-50/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">Kỹ năng & Kinh nghiệm</h2>
                </div>
                <div className="p-6">
                  {hoSo.danhSachKyNang?.length ? (
                    <div className="space-y-3">
                      {hoSo.danhSachKyNang.map((kn) => (
                        <div key={kn.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1 hover:border-violet-200 transition-colors">
                          <span className="text-[14px] font-bold text-violet-700">{kn.ten}</span>
                          <span className="text-[13px] text-slate-500 font-medium">{kn.kinhNghiem || "Chưa có kinh nghiệm"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Không có dữ liệu kỹ năng
                    </div>
                  )}
                  {hoSo.kinhNghiem && hoSo.kinhNghiem !== "—" && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả thêm</p>
                      <p className="text-[14px] text-slate-700 leading-relaxed">{hoSo.kinhNghiem}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Bottom: Documents */}
          {/* Full Width Bottom: Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-[15px] font-bold text-slate-800">Giấy tờ & Hình ảnh</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "CCCD mặt trước", src: hoSo.anhCccdmatTruoc },
                { label: "CCCD mặt sau", src: hoSo.anhCccdmatSau },
                { label: "Ảnh chân dung", src: hoSo.anhChanDung },
                { label: "Giấy xác nhận cư trú", src: hoSo.giayXacNhanCuTru },
              ].map(({ label, src }) => (
                <div key={label} className="group">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
                  {src ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50">
                      <img
                        src={getImageUrl(src)}
                        alt={label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50/50">
                      <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[13px] font-medium">Chưa cập nhật</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action area (if pending) */}
          {!isDone && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-[15px] font-bold text-slate-800">Xét duyệt hồ sơ</h2>
              </div>
              <div className="p-6">
                {actionError && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] flex items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actionError}
                  </div>
                )}

                {actionState === "idle" && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfirmDuyet(true)}
                      className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Duyệt hồ sơ
                    </button>
                    <button
                      onClick={() => setActionState("rejecting")}
                      className="flex-1 py-3.5 rounded-xl bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[15px] font-bold transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Từ chối
                    </button>
                  </div>
                )}

                {actionState === "rejecting" && (
                  <div className="space-y-4">
                    <ReasonTextarea
                      value={lyDo}
                      onChange={setLyDo}
                      error={lyDoError}
                      placeholder="Nhập lý do từ chối hồ sơ này (bắt buộc)..."
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setActionState("idle");
                          setLyDo("");
                          setLyDoError("");
                        }}
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[14px] font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        onClick={handleTuChoi}
                        disabled={submitting}
                        className="flex-[2] py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting && (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        )}
                        {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm modal for approve */}
      <ConfirmModal
        isOpen={confirmDuyet}
        title="Xác nhận duyệt hồ sơ"
        message={`Bạn có chắc chắn muốn duyệt hồ sơ của ${hoSo?.hoTen ?? "ứng viên này"}? Hành động này sẽ cấp quyền hoạt động trên hệ thống.`}
        confirmText="Duyệt hồ sơ"
        confirmClass="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
        isLoading={submitting}
        onConfirm={handleDuyet}
        onCancel={() => setConfirmDuyet(false)}
      />
    </div>
  );
}
