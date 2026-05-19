"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowBack,
  ArrowLeft,
  CalendarMonth,
  LocationOn,
  Person,
  Phone,
  AccessTime,
  Star,
  StarBorder,
  Send,
  Assignment,
  HomeRepairService,
  HelpOutline,
  CheckCircleOutline,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { OrderStatusTimeline } from "@/components/componentsCustomer/Orderstatustimeline";

import api from "@/services/api";

// Hàm xử lý màu sắc động cho từng trạng thái ca làm việc
const getShiftStatusColor = (status: string) => {
  switch (status) {
    case "Hoàn thành":
      return {
        badge: "bg-emerald-100 text-emerald-700",
        border: "bg-emerald-500",
      };
    case "Đang thực hiện":
    case "Đang làm việc":
      return {
        badge: "bg-purple-100 text-purple-700",
        border: "bg-purple-500",
      };
    case "Đã huỷ":
    case "Hủy":
    case "Hủy ca":
      return {
        badge: "bg-rose-100 text-rose-700",
        border: "bg-rose-500",
      };
    case "Đã xác nhận":
    case "Đã phân công":
      return {
        badge: "bg-blue-100 text-blue-700",
        border: "bg-blue-500",
      };
    case "Chờ phân công":
    case "Chờ xác nhận":
    default:
      return {
        badge: "bg-amber-100 text-amber-700",
        border: "bg-amber-500",
      };
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // STATE CHO MODAL XÁC NHẬN VÀ THÔNG BÁO TOAST
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    maThuNhap: string | null;
    isSubmitting: boolean;
  }>({ isOpen: false, maThuNhap: null, isSubmitting: false });

  // THÊM MỚI: STATE CHO MODAL BÁO CÁO KHÔNG ĐẾN LÀM
  const [absenceModal, setAbsenceModal] = useState<{
    isOpen: boolean;
    maNgayLamViec: string | null;
    isSubmitting: boolean;
  }>({ isOpen: false, maNgayLamViec: null, isSubmitting: false });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Hàm hiển thị Toast
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<any>(`/Booking/GetOrderDetail/${orderId}`);

        // Nếu backend trả về { success, data }
        setOrder(data?.data ?? data);
      } catch (err: any) {
        console.error("Lỗi fetch chi tiết đơn:", err);

        setError(err?.message || "Đã xảy ra lỗi khi tải chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // ==========================================
  // HÀM XỬ LÝ: XÁC NHẬN HOÀN THÀNH
  // ==========================================
  const handleOpenConfirm = (maThuNhap: string) => {
    if (!maThuNhap) {
      showToast("Không tìm thấy mã thu nhập để xác nhận!", "error");
      return;
    }
    setConfirmModal({ isOpen: true, maThuNhap, isSubmitting: false });
  };

  const executeConfirmCompletion = async () => {
    if (!confirmModal.maThuNhap) return;
    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response: any = await api.put(
        `/ThuNhap/${confirmModal.maThuNhap}/status`,
        { TrangThai: "Đã xác nhận" },
      );

      setConfirmModal({ isOpen: false, maThuNhap: null, isSubmitting: false });
      showToast("Xác nhận hoàn thành thành công!", "success");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi xác nhận hoàn thành:", error);
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi cập nhật trạng thái.",
        "error",
      );
    }
  };

  // ==========================================
  // HÀM XỬ LÝ: BÁO CÁO KHÔNG ĐẾN LÀM
  // ==========================================
  const handleReportAbsence = (maNgayLamViec: string) => {
    if (!maNgayLamViec) {
      showToast("Không tìm thấy mã ca làm việc!", "error");
      return;
    }
    setAbsenceModal({ isOpen: true, maNgayLamViec, isSubmitting: false });
  };

  const executeReportAbsence = async () => {
    if (!absenceModal.maNgayLamViec) return;
    setAbsenceModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await api.put(`/job/${absenceModal.maNgayLamViec}/status`, {
        TrangThai: "Không đến làm",
      });

      setAbsenceModal({
        isOpen: false,
        maNgayLamViec: null,
        isSubmitting: false,
      });
      showToast("Báo cáo thành công! Hệ thống sẽ xử lý sự cố.", "success");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi báo cáo:", error);
      setAbsenceModal((prev) => ({ ...prev, isSubmitting: false }));
      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi báo cáo.",
        "error",
      );
    }
  };

  // ==========================================
  // HÀM XỬ LÝ: ĐÁNH GIÁ
  // ==========================================
  const handleSubmitReview = async () => {
    try {
      const response: any = await api.post("/Review/Submit", {
        maDon: orderId,
        soSao: rating,
        noiDung: reviewText,
      });

      if (response?.data?.success || response?.success) {
        showToast("Cảm ơn bạn đã gửi đánh giá!", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(
          "Có lỗi xảy ra: " + (response?.data?.message || response?.message),
          "error",
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error);
      showToast(
        error?.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá.",
        "error",
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "---";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Đã hoàn thành":
      case "Hoàn thành":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Đã huỷ":
      case "Hủy đơn":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Đang xử lý":
      case "Đang thực hiện":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <CircularProgress className="text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/customer/history"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>
          <div className="text-center py-16">
            <p className="text-lg text-red-500 font-medium mb-4">
              {error || "Không tìm thấy đơn đặt"}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link
            href="/customer/history"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowBack sx={{ fontSize: 20 }} />
            <span>Quay lại</span>
          </Link>

          <div
            className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold border shadow-sm tracking-wide ${getStatusBadgeStyle(
              order.trangThai,
            )}`}
          >
            {order.trangThai}
          </div>
        </div>

        <div className="mb-4 w-full">
          <OrderStatusTimeline
            currentStatus={order.trangThai}
            statusTimes={order.statusTimes || {}}
            lichSuTrangThai={order.lichSuTrangThai || []}
            orderDate={formatDate(order.ngayDat)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin đơn đặt */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-2">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Thông tin đơn đặt
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-indigo-50 p-2 rounded-lg flex-shrink-0 text-indigo-600 flex items-center justify-center">
                    <Assignment sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                      Mã đơn đặt
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      {order.maDon}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0 text-blue-600 flex items-center justify-center">
                    <CalendarMonth sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                      Ngày đặt dịch vụ
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(order.ngayDat)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0 text-purple-600 flex items-center justify-center">
                    <AccessTime sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                      Số ngày thực hiện
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {order.soNgay} ngày
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                  <div className="bg-teal-50 p-2 rounded-lg flex-shrink-0 text-teal-600 mt-0.5 flex items-center justify-center">
                    <HomeRepairService sx={{ fontSize: 18 }} />
                  </div>
                  <div className="w-full">
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">
                      Dịch vụ
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(order.tenDichVu) ? (
                        order.tenDichVu.map((dichVu: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-md border border-teal-100"
                          >
                            {dichVu}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-md border border-teal-100">
                          {order.tenDichVu || "Chưa xác định"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                  <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0 text-amber-600 mt-0.5 flex items-center justify-center">
                    <LocationOn sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                      Địa chỉ thực hiện
                    </p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {order.diaChi}
                    </p>
                  </div>
                </div>

                {order.ghiChu && (
                  <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-3 md:col-span-2 text-sm">
                    <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
                      <span className="font-bold text-amber-800">
                        Ghi chú từ khách hàng:
                      </span>{" "}
                      {order.ghiChu}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách ngày làm việc */}
            <div className="space-y-6 mb-2">
              {order.ngayLamViec &&
                order.ngayLamViec.map((dayGroup: any, index: number) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm mb-2"
                  >
                    <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-1">
                      <CalendarMonth className="text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-900">
                        Ngày thực hiện: {formatDate(dayGroup.ngay)}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {dayGroup.danhSachCa.map((ca: any, idx: number) => {
                        const isPending = order.trangThai === "Chờ xác nhận";
                        const displayStatus = isPending
                          ? "Chờ phân công"
                          : ca.trangThai;
                        const showWorkerInfo = !isPending && ca.tenNhanVien;

                        const statusColors = getShiftStatusColor(displayStatus);

                        // ==========================================
                        // LOGIC KIỂM TRA TRỄ 15 PHÚT
                        // ==========================================
                        let isLate15Min = false;
                        if (
                          dayGroup.ngay &&
                          ca.gioBatDau &&
                          ca.trangThai === "Đã phân công"
                        ) {
                          // Kết hợp Ngày và Giờ để tạo đối tượng Date hợp lệ
                          const shiftStartStr = `${dayGroup.ngay}T${ca.gioBatDau}:00`;
                          const shiftStartTime = new Date(shiftStartStr);

                          if (!isNaN(shiftStartTime.getTime())) {
                            const now = new Date();
                            // Tính chênh lệch phút
                            const diffInMinutes =
                              (now.getTime() - shiftStartTime.getTime()) /
                              60000;
                            // Nếu đã qua 15 phút thì cho phép báo cáo
                            if (diffInMinutes >= 15) {
                              isLate15Min = true;
                            }
                          }
                        }

                        return (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-lg border border-slate-100 relative overflow-hidden mb-2 shadow-sm"
                          >
                            <div
                              className={`absolute top-0 left-0 w-1.5 h-full ${statusColors.border}`}
                            ></div>

                            <div className="pl-2">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md text-sm border border-indigo-100">
                                  {ca.tenDichVu}
                                </span>

                                <span
                                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors.badge}`}
                                >
                                  {displayStatus}
                                </span>
                              </div>

                              <div className="text-sm text-slate-600 mb-2">
                                <span className="font-medium text-slate-800">
                                  Thời gian:
                                </span>{" "}
                                {ca.gioBatDau} - {ca.gioKetThuc}
                              </div>

                              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-300">
                                    <Person
                                      sx={{ fontSize: 24 }}
                                      className="text-slate-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    {showWorkerInfo ? (
                                      <>
                                        <p className="font-semibold text-slate-900">
                                          {ca.tenNhanVien}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                                          <Phone sx={{ fontSize: 16 }} />
                                          <span className="text-sm">
                                            {ca.sdtNhanVien ||
                                              "Đang cập nhật SĐT"}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-sm font-medium text-slate-500 italic">
                                        Hệ thống đang điều phối nhân viên...
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {/* BỔ SUNG: Nút báo Không đến làm (Chỉ hiện khi Đã phân công + trễ 15p) */}
                                  {isLate15Min && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReportAbsence(ca.maNgayLamViec)
                                      }
                                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                                    >
                                      Báo không đến làm
                                    </button>
                                  )}

                                  {/* Nút xác nhận hoàn thành */}
                                  {ca.trangThai === "Hoàn thành" &&
                                    ca.trangThaiThuNhap !== "Đã xác nhận" && (
                                      <button
                                        onClick={() =>
                                          handleOpenConfirm(ca.maThuNhap)
                                        }
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                                      >
                                        Xác nhận hoàn thành
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Đánh giá dịch vụ */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Đánh giá của bạn
              </h2>

              {order.danhGia ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        {i < order.danhGia.soSao ? (
                          <Star sx={{ fontSize: 28 }} />
                        ) : (
                          <StarBorder sx={{ fontSize: 28 }} />
                        )}
                      </span>
                    ))}
                    <span className="ml-2 text-sm font-semibold text-slate-700">
                      {order.danhGia.soSao}/5
                    </span>
                  </div>
                  {order.danhGia.noiDung && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-slate-700 leading-relaxed italic">
                        {order.danhGia.noiDung}
                      </p>
                    </div>
                  )}
                </div>
              ) : order.trangThai === "Đã hoàn thành" ||
                order.trangThai === "Hoàn thành" ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          className={`transition-colors duration-200 ${
                            ratingValue <= (hoverRating || rating)
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }`}
                          onClick={() => setRating(ratingValue)}
                          onMouseEnter={() => setHoverRating(ratingValue)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star sx={{ fontSize: 36 }} />
                        </button>
                      );
                    })}
                    <span className="ml-3 text-sm font-medium text-slate-500">
                      {rating > 0 ? `${rating}/5 sao` : "Vui lòng chọn số sao"}
                    </span>
                  </div>

                  <div>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
                      placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={rating === 0}
                      className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      <Send sx={{ fontSize: 18 }} />
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
                  <p className="text-slate-500">
                    Bạn chỉ có thể đánh giá sau khi dịch vụ{" "}
                    <strong>đã hoàn thành</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải - Chi tiết thanh toán */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white sticky top-25 shadow-md">
              <h2 className="text-lg font-bold mb-6">Chi tiết thanh toán</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-blue-500">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Giá dịch vụ</span>
                  <span className="font-semibold">
                    {formatCurrency(order.soTien)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-xl">
                  <span className="font-bold">Thành tiền</span>
                  <span className="font-bold text-2xl">
                    {formatCurrency(order.thanhTien)}
                  </span>
                </div>
              </div>

              {order.thanhToan && (
                <div className="space-y-2 text-sm bg-white/10 p-4 rounded-xl mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Trạng thái:</span>
                    <span className="font-semibold">
                      {order.thanhToan.trangThai}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-100">Phương thức:</span>
                    <span className="font-semibold">
                      {order.thanhToan.phuongThuc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-100">Ngày thanh toán:</span>
                    <span className="font-semibold">
                      {formatDate(order.thanhToan.ngayThanhToan)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL XÁC NHẬN HOÀN THÀNH --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpOutline sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Xác nhận hoàn thành
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Bạn có chắc chắn muốn xác nhận hoàn thành cho ca làm việc này?
                Hành động này sẽ gửi thông báo và cập nhật thu nhập cho nhân
                viên.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: false,
                      maThuNhap: null,
                      isSubmitting: false,
                    })
                  }
                  disabled={confirmModal.isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={executeConfirmCompletion}
                  disabled={confirmModal.isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {confirmModal.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Đồng ý"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BÁO CÁO KHÔNG ĐẾN LÀM --- */}
      {absenceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpOutline sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Báo cáo vắng mặt
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Xác nhận người giúp việc không đến làm? Hệ thống sẽ ghi nhận đây
                là sự cố cho đơn hàng này và có biện pháp xử lý.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setAbsenceModal({
                      isOpen: false,
                      maNgayLamViec: null,
                      isSubmitting: false,
                    })
                  }
                  disabled={absenceModal.isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={executeReportAbsence}
                  disabled={absenceModal.isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {absenceModal.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Xác nhận báo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST THÔNG BÁO --- */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none"
        } ${
          toast.type === "success"
            ? "bg-emerald-600 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {toast.type === "success" ? (
          <CheckCircleOutline sx={{ fontSize: 20 }} />
        ) : (
          <CloseIcon sx={{ fontSize: 20 }} />
        )}
        <span className="text-sm font-semibold pr-2">{toast.message}</span>
        <button
          onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          className="text-white/80 hover:text-white"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
}
