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
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 break-words">{value || "—"}</span>
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

  const handleSubmit = async () => {
    if (trangThai === "Đã giải quyết" && !phanHoi.trim()) {
      setPhanHoiError("Vui lòng nhập nội dung phản hồi khi chọn Đã giải quyết.");
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
        noiDungPhanHoi: phanHoi.trim()
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

  const isResolved = kn?.trangThai === "Đã giải quyết";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && kn && (
        <>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Chi tiết khiếu nại
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Mã KN: {kn.maKhieuNai}
              </p>
            </div>
            <StatusBadge status={kn.trangThai} type="khieuNai" />
          </div>

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {/* Thông tin khiếu nại */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Thông tin khiếu nại</h2>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="Thời gian" value={formatDateTime(kn.thoiGian)} />
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs font-medium text-slate-500 sm:w-40 shrink-0">
                  Nội dung
                </span>
                <span className="text-sm text-slate-800 whitespace-pre-wrap">{kn.noiDung || "—"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs font-medium text-slate-500 sm:w-40 shrink-0">
                  Phản hồi
                </span>
                <span className="text-sm text-slate-800 whitespace-pre-wrap">{kn.phanHoi || "Chưa có"}</span>
              </div>
            </div>
          </div>

          {/* Khách hàng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Khách hàng</h2>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="Họ tên" value={kn.hoTenKhachHang} />
              <InfoRow label="Email" value={kn.emailKhachHang} />
              <InfoRow label="SĐT" value={kn.sdtKhachHang} />
            </div>
          </div>

          {/* Đơn đặt */}
          {kn.thongTinDon && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">Đơn đặt dịch vụ ({kn.maDon})</h2>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Ngày đặt" value={formatDateTime(kn.thongTinDon.ngayDat)} />
                <InfoRow label="Tổng tiền" value={<span className="font-semibold text-indigo-600">{formatMoney(kn.thongTinDon.tongTien)}</span>} />
                <InfoRow label="Địa chỉ" value={kn.thongTinDon.diaChi} />
                <InfoRow label="Trạng thái đơn" value={<StatusBadge status={kn.thongTinDon.trangThaiHienTai} type="don" />} />
              </div>
            </div>
          )}

          {/* Cập nhật trạng thái */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Cập nhật trạng thái
            </h2>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                  disabled={isResolved || submitting}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="Chưa xử lý">Chưa xử lý</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã giải quyết">Đã giải quyết</option>
                </select>
              </div>

              <ReasonTextarea
                value={phanHoi}
                onChange={setPhanHoi}
                error={phanHoiError}
                label="Nội dung phản hồi (bắt buộc nếu đã giải quyết)"
                placeholder="Nhập phản hồi cho khách hàng..."
                disabled={isResolved || submitting}
              />

              {!isResolved ? (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Đang xử lý..." : "Cập nhật"}
                  </button>
                </div>
              ) : (
                <div className="pt-2 text-sm text-slate-500 text-center">
                  Khiếu nại đã giải quyết, không thể chỉnh sửa thêm.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal}
        title="Xác nhận giải quyết"
        message="Bạn có chắc chắn muốn đánh dấu khiếu nại này là Đã giải quyết? Hành động này không thể hoàn tác."
        confirmText="Xác nhận"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        isLoading={submitting}
        onConfirm={executeUpdate}
        onCancel={() => setConfirmModal(false)}
      />
    </div>
  );
}
