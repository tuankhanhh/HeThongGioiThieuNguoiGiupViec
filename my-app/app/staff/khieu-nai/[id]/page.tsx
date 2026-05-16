"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import StatusBadge from "@/components/componentsStaff/StatusBadge";
import ReasonTextarea from "@/components/componentsStaff/ReasonTextarea";
import ConfirmModal from "@/components/componentsStaff/ConfirmModal";
import { LoadingState, ErrorState } from "@/components/componentsStaff/States";

interface KhieuNaiDetail {
  maKhieuNai: string;
  maDon: string;
  noiDung: string;
  thoiGian: string;
  trangThai: string;
  phanHoi: string | null;
  maKhachHang: string;
  hoTenKhachHang: string;
  emailKhachHang: string;
  sdtKhachHang: string;
  maNhanVien: string | null;
  hoTenNhanVien: string | null;
  thongTinDon: {
    ngayDat: string;
    tongTien: number;
    diaChi: string;
    trangThaiHienTai: string;
  };
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-[14.5px] text-slate-800 font-medium break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function formatMoney(n: number | undefined | null) {
  return n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";
}

function formatDateTime(d: string | null) {
  return d ? new Date(d).toLocaleString("vi-VN") : "Chưa có dữ liệu";
}

export default function ChiTietKhieuNaiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [kn, setKn] = useState<KhieuNaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trangThai, setTrangThai] = useState("Chưa xử lý");
  const [phanHoi, setPhanHoi] = useState("");
  const [phanHoiError, setPhanHoiError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/v1/staff/chi-tiet-khieu-nai/${id}`);
      const data = res?.data;
      setKn(data);
      if (data) {
        setTrangThai(data.trangThai);
        setPhanHoi(data.phanHoi || "");
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Không tìm thấy dữ liệu khiếu nại.");
      } else {
        setError(err?.message ?? "Lỗi hệ thống.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const isResolved = kn?.trangThai === "Đã xử lý";
  const handleSubmit = async () => {
    if (trangThai === "Đã giải quyết" && !phanHoi.trim()) {
      setPhanHoiError(
        "Vui lòng nhập nội dung phản hồi khi chọn Đã giải quyết.",
      );
      return;
    }

    if (trangThai === "Đã giải quyết") {
      setConfirmModal(true);
      return;
    }

    await executeUpdate();
  };

  const executeUpdate = async () => {
    setPhanHoiError("");
    setSubmitting(true);
    setActionError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post<any>("/v1/staff/cap-nhat-khieu-nai", {
        maKhieuNai: id,
        trangThai: trangThai,
        noiDungPhanHoi: phanHoi.trim(),
      });
      setSuccessMsg(res?.message || "Cập nhật thành công!");
      await fetchData(); // Refresh data
    } catch (err: any) {
      setActionError(err?.message ?? "Cập nhật thất bại.");
    } finally {
      setSubmitting(false);
      setConfirmModal(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors cursor-pointer group"
      >
        <span className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center transition-all">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </span>
        Quay lại danh sách
      </button>
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}
      {!loading && !error && kn && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-rose-600 font-bold shadow-inner border-2 border-white shrink-0">
                <svg
                  className="w-7 h-7"
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
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Chi tiết khiếu nại
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold font-mono rounded-md">
                    {kn.maKhieuNai}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={kn.trangThai} type="khieuNai" />
            </div>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-medium flex items-center gap-2 shadow-sm">
              <svg
                className="w-5 h-5 shrink-0"
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
              {successMsg}
            </div>
          )}

          {/* Main Content 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Thông tin khiếu nại */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    Nội dung khiếu nại
                  </h2>
                </div>
                <div className="p-6">
                  <InfoRow
                    label="Thời gian gửi"
                    value={formatDateTime(kn.thoiGian)}
                  />
                  <div className="flex flex-col py-2.5 border-b border-slate-100">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nội dung phản ánh
                    </span>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {kn.noiDung || "—"}
                    </div>
                  </div>
                  <div className="flex flex-col py-2.5">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phản hồi từ ban quản lý
                    </span>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-[14px] text-indigo-900 leading-relaxed whitespace-pre-wrap">
                      {kn.phanHoi || "Chưa có phản hồi nào."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Khách hàng */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    Thông tin Khách hàng
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InfoRow label="Họ tên" value={kn.hoTenKhachHang} />
                  <InfoRow label="SĐT" value={kn.sdtKhachHang} />
                  <div className="md:col-span-2">
                    <InfoRow label="Email" value={kn.emailKhachHang} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cập nhật trạng thái */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    Cập nhật trạng thái
                  </h2>
                </div>
                <div className="p-6">
                  {actionError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] flex items-center gap-2 shadow-sm">
                      <svg
                        className="w-5 h-5 shrink-0"
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
                      {actionError}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-600 mb-2">
                        Trạng thái xử lý
                      </label>
                      <select
                        value={trangThai}
                        onChange={(e) => setTrangThai(e.target.value)}
                        disabled={isResolved || submitting}
                        className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500 font-medium transition-colors"
                      >
                        <option value="Chưa xử lý">Chưa xử lý</option>
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Đã xử lý">Đã xử lý</option>
                      </select>
                    </div>

                    <ReasonTextarea
                      value={phanHoi}
                      onChange={setPhanHoi}
                      error={phanHoiError}
                      label="Nội dung phản hồi (bắt buộc nếu đã xử lý)"
                      placeholder="Nhập phản hồi cho khách hàng..."
                      disabled={isResolved || submitting}
                    />

                    {!isResolved ? (
                      <div className="pt-2">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[15px] font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {submitting && (
                            <svg
                              className="animate-spin w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          )}
                          {submitting ? "Đang xử lý..." : "Cập nhật thay đổi"}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 text-[13px] font-medium text-slate-500 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Khiếu nại này đã được đánh dấu xử lý và không thể chỉnh
                        sửa thêm.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Đơn đặt */}
              {kn.thongTinDon && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h2 className="text-[15px] font-bold text-slate-800">
                      Đơn đặt liên quan
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[13px] font-bold font-mono rounded-md">
                        {kn.maDon}
                      </span>
                      <StatusBadge
                        status={kn.thongTinDon.trangThaiHienTai}
                        type="don"
                      />
                    </div>
                    <div className="space-y-1">
                      <InfoRow
                        label="Ngày đặt"
                        value={formatDateTime(kn.thongTinDon.ngayDat)}
                      />
                      <InfoRow
                        label="Tổng tiền"
                        value={
                          <span className="font-bold text-indigo-600 text-[16px]">
                            {formatMoney(kn.thongTinDon.tongTien)}
                          </span>
                        }
                      />
                      <InfoRow label="Địa chỉ" value={kn.thongTinDon.diaChi} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}{" "}
      {/* <-- ĐÂY LÀ DẤU ĐÓNG NGOẶC BỊ THIẾU Ở CODE CŨ CỦA BẠN */}
      <ConfirmModal
        isOpen={confirmModal}
        title="Xác nhận xử lý"
        message="Bạn có chắc chắn muốn đánh dấu khiếu nại này là Đã xử lý? Hành động này không thể hoàn tác."
        confirmText="Xác nhận"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        isLoading={submitting}
        onConfirm={executeUpdate}
        onCancel={() => setConfirmModal(false)}
      />
    </div>
  );
}
