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
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 sm:w-44 shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value || "—"}</span>
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
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && hoSo && (
        <>
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{hoSo.hoTen}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Mã hồ sơ: {hoSo.maHoSo}
              </p>
            </div>
            <StatusBadge status={hoSo.trangThai} type="hoSo" />
          </div>

          {/* Already processed banner */}
          {isDone && (
            <div
              className={`mb-5 p-4 rounded-xl text-sm font-medium ${
                hoSo.trangThai === "Đã duyệt"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {hoSo.trangThai === "Đã duyệt"
                ? "✓ Hồ sơ này đã được duyệt."
                : `✗ Hồ sơ đã bị từ chối${hoSo.lyDoTuChoi ? `: "${hoSo.lyDoTuChoi}"` : "."}`}
            </div>
          )}

          {/* Success msg */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Thông tin cá nhân
              </h2>
            </div>
            <div className="px-5 py-1">
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
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Kinh nghiệm & Kỹ năng
              </h2>
            </div>
            <div className="px-5 py-1">
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
            </div>
          </div>

          {/* Giấy tờ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Giấy tờ & Hình ảnh
              </h2>
            </div>
            <div className="px-5 py-3 grid grid-cols-2 gap-3">
              {[
                { label: "CCCD mặt trước", src: hoSo.anhCccdmatTruoc },
                { label: "CCCD mặt sau", src: hoSo.anhCccdmatSau },
                { label: "Ảnh chân dung", src: hoSo.anhChanDung },
                { label: "Giấy xác nhận cư trú", src: hoSo.giayXacNhanCuTru },
              ].map(({ label, src }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  {src ? (
                    <img
                      src={getImageUrl(src)}
                      alt={label}
                      className="w-full rounded-lg border border-slate-200 object-cover max-h-32"
                    />
                  ) : (
                    <div className="w-full h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                      Chưa có
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action area - only if still pending */}
          {!isDone && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Xét duyệt hồ sơ
              </h2>

              {actionError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {actionError}
                </div>
              )}

              {actionState === "idle" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDuyet(true)}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Duyệt hồ sơ
                  </button>
                  <button
                    onClick={() => setActionState("rejecting")}
                    className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
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
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleTuChoi}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
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
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        isLoading={submitting}
        onConfirm={handleDuyet}
        onCancel={() => setConfirmDuyet(false)}
      />
    </div>
  );
}
