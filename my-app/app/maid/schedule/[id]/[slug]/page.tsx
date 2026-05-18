"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  Assignment,
  CalendarMonth,
  AccessTime,
  LocationOn,
  Person,
  Phone,
  ChatOutlined,
  HomeRepairService,
  ChevronRight,
  InfoOutlined,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import api from "@/services/api";

export interface Job {
  maNgayLamViec: string;
  maDon: string;
  ngayLam: string;
  gioBatDau: string;
  gioKetThuc: string;
  thoiLuongThucHien: number;
  tenDichVu: string;
  hinhAnh: string;
  hoTenKhach: string;
  sdtKhach: string;
  diaChi: string;
  tongTien: number;
  ghiChu: string;
  trangThai:
    | "Chờ phân công"
    | "Đã phân công"
    | "Đang làm việc"
    | "Hoàn thành"
    | "Hủy lịch";
}

const WORKER_STATUSES = ["Đã phân công", "Đang làm việc", "Hoàn thành"];

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  // States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Đã phân công");
  const [dragProgress, setDragProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Confirmation States
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const dragRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  // GỌI API LẤY CHI TIẾT
  useEffect(() => {
    const loadJobDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: any = await api.get(
          `/v1/maid/job/${resolvedParams.slug}`,
        );
        const data = response?.data || response;
        if (data && data.maNgayLamViec) {
          setSelectedJob(data);
          setStatus(data.trangThai);
        } else {
          setError("Không thể tải chi tiết công việc.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết công việc:", error);
        setError("Đã xảy ra lỗi hệ thống khi tải dữ liệu.");
        setSelectedJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.slug) {
      loadJobDetail();
    }
  }, [resolvedParams.slug]);

  const job = selectedJob;

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadgeStyle = (s: string) => {
    switch (s) {
      case "Hoàn thành":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Hủy lịch":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Đang làm việc":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Đã phân công":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const currentStatusIndex = WORKER_STATUSES.indexOf(status as any);

  // LOGIC KÉO THẢ CHUỘT
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isUpdating) return;
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === 0 || isUpdating) return;
    const delta = e.clientX - startXRef.current;
    const maxDelta = 120;
    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  // LOGIC KÉO THẢ TRÊN ĐIỆN THOẠI
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isUpdating) return;
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === 0 || isUpdating) return;
    const delta = e.touches[0].clientX - startXRef.current;
    const maxDelta = 120;
    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  // LOGIC KHI KÉO XONG (MỞ MODAL)
  const handleDragEnd = () => {
    if (
      dragProgress > 0.7 &&
      currentStatusIndex < WORKER_STATUSES.length - 1 &&
      !isUpdating &&
      job
    ) {
      const nextStatus = WORKER_STATUSES[currentStatusIndex + 1];
      setPendingStatus(nextStatus);
      setIsConfirmDialogOpen(true);
    } else {
      setDragProgress(0);
    }
    startXRef.current = 0;
  };

  const handleMouseUp = () => handleDragEnd();
  const handleTouchEnd = () => handleDragEnd();

  // HÀM CHẠY KHI BẤM "ĐỒNG Ý" TRONG MODAL
  const confirmUpdate = async () => {
    setIsConfirmDialogOpen(false);
    if (!job || !pendingStatus) return;

    try {
      setIsUpdating(true);
      await api.put(`/v1/maid/job/${job.maNgayLamViec}/status`, {
        trangThai: pendingStatus,
      });

      setStatus(pendingStatus);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setIsUpdating(false);
      setDragProgress(0);
      setPendingStatus("");
    }
  };

  // HÀM CHẠY KHI BẤM "HỦY" TRONG MODAL
  const cancelUpdate = () => {
    setIsConfirmDialogOpen(false);
    setDragProgress(0);
    setPendingStatus("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <CircularProgress className="text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <div className="text-center py-16">
            <p className="text-lg text-red-500 font-medium mb-4">
              {error || "Không tìm thấy công việc này"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowBack sx={{ fontSize: 20 }} />
            <span>Quay lại danh sách</span>
          </button>

          <div
            className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold border shadow-sm tracking-wide ${getStatusBadgeStyle(
              status,
            )}`}
          >
            {status}
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </div>
            <p className="text-emerald-700 font-medium text-sm">
              Cập nhật trạng thái thành công!
            </p>
          </div>
        )}

        {/* MAIN CONTENT CONTAINERS */}
        <div className="space-y-6">
          {/* KHỐI THÔNG TIN CÔNG VIỆC CHÍNH */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-5">
              Thông tin công việc
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Mã đơn hàng */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="bg-indigo-50 p-2.5 rounded-lg flex-shrink-0 text-indigo-600 flex items-center justify-center">
                  <Assignment sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Mã đơn
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-900">
                    {job.maDon}
                  </p>
                </div>
              </div>

              {/* 2. Mã ngày làm việc */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="bg-slate-100 p-2.5 rounded-lg flex-shrink-0 text-slate-600 flex items-center justify-center">
                  <InfoOutlined sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Mã ngày làm việc
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-800">
                    {job.maNgayLamViec}
                  </p>
                </div>
              </div>

              {/* 3. Ngày thực hiện */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="bg-blue-50 p-2.5 rounded-lg flex-shrink-0 text-blue-600 flex items-center justify-center">
                  <CalendarMonth sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Ngày thực hiện
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(job.ngayLam)}
                  </p>
                </div>
              </div>

              {/* 4. Thời lượng thực hiện */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="bg-purple-50 p-2.5 rounded-lg flex-shrink-0 text-purple-600 flex items-center justify-center">
                  <AccessTime sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Thời lượng
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {job.thoiLuongThucHien} giờ
                  </p>
                </div>
              </div>

              {/* 5. Khung giờ làm việc chi tiết */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 md:col-span-2">
                <div className="bg-amber-50 p-2.5 rounded-lg flex-shrink-0 text-amber-600 flex items-center justify-center">
                  <AccessTime sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Khung giờ thực hiện
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {job.gioBatDau.substring(0, 5)} -{" "}
                    {job.gioKetThuc.substring(0, 5)}
                  </p>
                </div>
              </div>

              {/* 6. Dịch vụ */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 md:col-span-2">
                <div className="bg-teal-50 p-2.5 rounded-lg flex-shrink-0 text-teal-600 mt-0.5 flex items-center justify-center">
                  <HomeRepairService sx={{ fontSize: 20 }} />
                </div>
                <div className="w-full">
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">
                    Dịch vụ yêu cầu
                  </p>
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-semibold rounded-md border border-teal-100 inline-block">
                    {job.tenDichVu}
                  </span>
                </div>
              </div>

              {/* 7. Khách hàng */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 md:col-span-2">
                <div className="bg-sky-50 p-2.5 rounded-lg flex-shrink-0 text-sky-600 mt-0.5 flex items-center justify-center">
                  <Person sx={{ fontSize: 20 }} />
                </div>
                <div className="w-full">
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                    Thông tin khách hàng
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-base font-bold text-slate-900">
                      {job.hoTenKhach}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 mr-1">
                        {job.sdtKhach}
                      </span>
                      <a
                        href={`tel:${job.sdtKhach}`}
                        className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors border border-green-200"
                      >
                        <Phone sx={{ fontSize: 18 }} />
                      </a>
                      <button className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors border border-blue-200">
                        <ChatOutlined sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Địa chỉ thực hiện */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 md:col-span-2">
                <div className="bg-amber-50 p-2.5 rounded-lg flex-shrink-0 text-amber-600 mt-0.5 flex items-center justify-center">
                  <LocationOn sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    Địa chỉ thực hiện
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {job.diaChi}
                  </p>
                </div>
              </div>

              {/* 10. Ghi chú của đơn đặt */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 md:col-span-2 text-sm">
                <p className="text-slate-700 leading-relaxed text-sm">
                  <span className="font-bold text-amber-800 block mb-1">
                    Ghi chú của khách hàng
                  </span>
                  {job.ghiChu ? (
                    job.ghiChu
                  ) : (
                    <span className="text-slate-400 italic">
                      Không có ghi chú nào từ khách hàng.
                    </span>
                  )}
                </p>
              </div>

              {/* 9. Tổng thu nhập */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50 border border-blue-100 p-4 rounded-xl md:col-span-2">
                <div className="flex items-start gap-2.5">
                  <InfoOutlined
                    sx={{ fontSize: 18 }}
                    className="text-blue-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-0.5">
                      Tổng thu nhập nhận được
                    </p>
                    <p className="text-xs text-slate-500">
                      Sẽ cộng vào ví sau khi công việc được Hoàn thành
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-600 sm:text-right">
                  {formatCurrency(job.tongTien)}
                </p>
              </div>
            </div>
          </div>

          {/* KHỐI CẬP NHẬT TIẾN ĐỘ (KÉO THẢ) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-5">
              Cập nhật tiến độ
            </h2>

            {/* Progress Timeline (Đã xử lý khoảng cách 2 bên và căn chính giữa đường thẳng) */}
            <div className="mb-16 mt-4 px-8 md:px-16">
              <div className="relative flex items-center justify-between">
                {/* Lớp chứa đường kẻ nền z-0 */}
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 px-4">
                  <div className="relative w-full h-[4px] bg-slate-200 rounded-full">
                    {/* Thanh kẻ màu xanh chạy theo tiến độ */}
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
                      style={{
                        width: `${(currentStatusIndex / (WORKER_STATUSES.length - 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Các vòng tròn mốc (z-10) */}
                {WORKER_STATUSES.map((s, idx) => {
                  const isCompleted =
                    WORKER_STATUSES.indexOf(status as any) >= idx;
                  const isCurrent = status === s;

                  return (
                    <div
                      key={s}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ring-4 ring-white ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isCompleted && !isCurrent ? "✓" : idx + 1}
                      </div>

                      {/* Chữ mô tả, sử dụng absolute để chữ không đè/đẩy vòng tròn bị lệch */}
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 text-center mt-1">
                        <p
                          className={`text-[12px] md:text-[13px] transition-colors ${
                            isCurrent
                              ? "text-blue-700 font-bold"
                              : isCompleted
                                ? "text-slate-800 font-semibold"
                                : "text-slate-400 font-medium"
                          }`}
                        >
                          {s}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DRAG TO ADVANCE */}
            {currentStatusIndex < WORKER_STATUSES.length - 1 ? (
              <div>
                <div className="mb-3 text-sm flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái tiếp theo:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    {WORKER_STATUSES[currentStatusIndex + 1]}
                  </span>
                </div>

                <div
                  ref={dragRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    setDragProgress(0);
                    startXRef.current = 0;
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`relative h-14 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200 transition-all overflow-hidden shadow-inner ${
                    isUpdating
                      ? "cursor-wait opacity-70"
                      : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {/* Progress Fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/20 transition-all"
                    style={{ width: `${dragProgress * 100}%` }}
                  ></div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-sm font-semibold text-slate-600 select-none z-10 flex items-center gap-2">
                      {isUpdating ? (
                        <>
                          <CircularProgress
                            size={16}
                            className="text-slate-500"
                          />
                          Đang chờ...
                        </>
                      ) : (
                        "Vuốt sang phải để cập nhật"
                      )}
                    </span>
                  </div>

                  {!isUpdating && (
                    <div
                      className="absolute top-1 bottom-1 left-1 bg-white border border-slate-200 rounded-lg w-12 flex items-center justify-center shadow-sm"
                      style={{
                        transform: `translateX(${
                          dragProgress *
                          (dragRef.current?.clientWidth
                            ? dragRef.current.clientWidth - 56
                            : 280)
                        }px)`,
                        transition:
                          dragProgress === 0
                            ? "transform 0.3s ease-out"
                            : "none",
                      }}
                    >
                      <ChevronRight className="text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 text-xl font-bold">✓</span>
                </div>
                <h3 className="text-emerald-800 font-bold mb-1">
                  Công việc đã hoàn tất
                </h3>
                <p className="text-emerald-600 text-sm">
                  Cảm ơn bạn đã hoàn thành xuất sắc công việc này.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN CẬP NHẬT TRẠNG THÁI */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Xác nhận cập nhật
              </h3>
              <p className="text-slate-600 text-sm">
                Bạn có chắc chắn muốn chuyển trạng thái công việc sang{" "}
                <strong className="text-blue-600">{pendingStatus}</strong>{" "}
                không?
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={cancelUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                {isUpdating && (
                  <CircularProgress size={14} className="text-white" />
                )}
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
