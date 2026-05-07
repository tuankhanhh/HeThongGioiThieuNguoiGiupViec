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
    <div className="flex flex-col sm:flex-row sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider sm:w-48 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-[14px] text-slate-700 font-medium">{value || "—"}</span>
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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer group"
      >
        <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
        Quay lại danh sách
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && hoSo && (
        <>
          {/* Title */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
                {hoSo.hoTen?.charAt(0) ?? "?"}
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-slate-800">{hoSo.hoTen}</h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5 font-mono">
                  Mã hồ sơ: {hoSo.maHoSo}
                </p>
              </div>
            </div>
            <StatusBadge status={hoSo.trangThai} type="hoSo" />
          </div>

          {/* Already processed banner */}
          {isDone && (
            <div
              className={`mb-5 p-4 rounded-xl text-[13.5px] font-medium flex items-start gap-3 ${
                hoSo.trangThai === "Đã duyệt"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span className="text-[18px] leading-none">
                {hoSo.trangThai === "Đã duyệt" ? "✓" : "✗"}
              </span>
              <span>
                {hoSo.trangThai === "Đã duyệt"
                  ? "Hồ sơ này đã được duyệt thành công."
                  : `Hồ sơ đã bị từ chối${hoSo.lyDoTuChoi ? `: "${hoSo.lyDoTuChoi}"` : "."}`}
              </span>
            </div>
          )}

          {/* Success msg */}
          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13.5px] font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-indigo-500" />
              <h2 className="text-[14px] font-bold text-slate-700">Thông tin cá nhân</h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Họ tên" value={hoSo.hoTen} />
              <InfoRow label="Email" value={hoSo.email} />
              <InfoRow label="Số điện thoại" value={hoSo.soDienThoai} />
              <InfoRow label="Địa chỉ" value={hoSo.diaChi} />
              <InfoRow
                label="Ngày sinh"
                value={
                  hoSo.ngaySinh
                    ? new Date(hoSo.ngaySinh).toLocaleDateString("vi-VN")
                    : "—"
                }
              />
              <InfoRow label="Giới tính" value={hoSo.gioiTinh} />
              <InfoRow label="Số CCCD" value={hoSo.soCccd} />
              <InfoRow
                label="Người thân"
                value={hoSo.tenNguoiThan ? `${hoSo.tenNguoiThan}` : "—"}
              />
              <InfoRow
                label="Số điện thoại người thân"
                value={hoSo.sdtNguoiThan ? `${hoSo.sdtNguoiThan}` : "—"}
              />
            </div>
          </div>

          {/* Kinh nghiệm */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-indigo-500" />
              <h2 className="text-[14px] font-bold text-slate-700">Kinh nghiệm & Kỹ năng</h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow
                label="Kinh nghiệm"
                value={
                  hoSo.danhSachKyNang?.length
                    ? hoSo.danhSachKyNang
                        .map(
                          (kn: KyNang) => `${kn.ten} (${kn.kinhNghiem ?? "—"})`,
                        )
                        .join(", ")
                    : "—"
                }
              />

              <InfoRow
                label="Mô tả chi tiết"
                value={
                  hoSo.danhSachKyNang?.length
                    ? hoSo.danhSachKyNang
                        .map(
                          (kn: KyNang) => `${kn.ten}: ${kn.kinhNghiem ?? "—"}`,
                        )
                        .join(" | ")
                    : "—"
                }
              />
            </div>
          </div>

          {/* Giấy tờ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-indigo-500" />
              <h2 className="text-[14px] font-bold text-slate-700">Giấy tờ & Hình ảnh</h2>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              {[
                { label: "CCCD mặt trước", src: hoSo.anhCccdmatTruoc },
                { label: "CCCD mặt sau", src: hoSo.anhCccdmatSau },
                { label: "Ảnh chân dung", src: hoSo.anhChanDung },
                { label: "Giấy xác nhận cư trú", src: hoSo.giayXacNhanCuTru },
              ].map(({ label, src }) => (
                <div key={label}>
                  <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                  {src ? (
                    <img
                      src={getImageUrl(src)}
                      alt={label}
                      className="w-full rounded-xl border border-slate-200 object-cover max-h-36 hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                  ) : (
                    <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-[12px] text-slate-400 font-medium bg-slate-50">
                      Chưa có
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action area - only if still pending */}
          {!isDone && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 rounded-full bg-indigo-500" />
                <h2 className="text-[14px] font-bold text-slate-700">Xét duyệt hồ sơ</h2>
              </div>

              {actionError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {actionError}
                </div>
              )}

              {actionState === "idle" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDuyet(true)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    ✓ Duyệt hồ sơ
                  </button>
                  <button
                    onClick={() => setActionState("rejecting")}
                    className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[14px] font-bold transition-all duration-150 cursor-pointer"
                  >
                    ✗ Từ chối
                  </button>
                </div>
              )}

              {actionState === "rejecting" && (
                <div className="space-y-4">
                  <ReasonTextarea
                    value={lyDo}
                    onChange={setLyDo}
                    error={lyDoError}
                    placeholder="Nhập lý do từ chối hồ sơ này..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionState("idle");
                        setLyDo("");
                        setLyDoError("");
                      }}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleTuChoi}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-all duration-150 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
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
          )}
        </>
      )}

      {/* Confirm modal for approve */}
      <ConfirmModal
        isOpen={confirmDuyet}
        title="Xác nhận duyệt hồ sơ"
        message={`Bạn có chắc muốn duyệt hồ sơ của ${hoSo?.hoTen ?? "người giúp việc này"} không?`}
        confirmText="Duyệt"
        confirmClass="bg-emerald-600 hover:bg-emerald-700 text-white"
        isLoading={submitting}
        onConfirm={handleDuyet}
        onCancel={() => setConfirmDuyet(false)}
      />
    </div>
  );
}
