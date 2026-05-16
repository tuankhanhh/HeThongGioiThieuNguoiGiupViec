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
} from "@mui/icons-material";
import { useParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { OrderStatusTimeline } from "@/components/componentsCustomer/Orderstatustimeline";

import api from "@/services/api";

const getTimelineStatus = (rawStatus: string) => {
  switch (rawStatus) {
    case "Đã hoàn thành":
      return "Hoàn thành";
    case "Đã huỷ":
      return "Hủy đơn";
    case "Đang xử lý":
      return "Đang thực hiện";
    default:
      return "Chờ xác nhận";
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

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: any = await api.get(
          `/Booking/GetOrderDetail/${orderId}`,
        );

        if (response?.data?.success || response?.success) {
          const orderData = response?.data?.data || response?.data;
          setOrder(orderData);
        } else {
          setError("Không thể tải chi tiết đơn hàng.");
        }
      } catch (err: any) {
        console.error("Lỗi fetch chi tiết đơn:", err);
        if (err?.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Đã xảy ra lỗi hệ thống khi tải dữ liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleSubmitReview = async () => {
    try {
      const response: any = await api.post("/Review/Submit", {
        maDon: orderId,
        soSao: rating,
        noiDung: reviewText,
      });

      if (response?.data?.success || response?.success) {
        alert("Cảm ơn bạn đã gửi đánh giá!");
        window.location.reload();
      } else {
        alert(
          "Có lỗi xảy ra: " + (response?.data?.message || response?.message),
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error);
      alert(
        error?.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá.",
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

  // Hàm trả về màu sắc động dựa theo trạng thái đơn hàng
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* THAY ĐỔI TẠI ĐÂY: Hàng trên cùng chứa nút quay lại bên trái và trạng thái đơn hàng bên phải */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link
            href="/customer/history"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowBack sx={{ fontSize: 20 }} />
            <span>Quay lại</span>
          </Link>

          <div
            className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold border shadow-sm tracking-wide ${getStatusBadgeStyle(order.trangThai)}`}
          >
            {order.trangThai}
          </div>
        </div>

        {/* Timeline trạng thái đơn hàng */}
        <div className="mb-4 w-full">
          <OrderStatusTimeline
            currentStatus={order.trangThai}
            statusTimes={order.statusTimes || {}}
            lichSuTrangThai={order.lichSuTrangThai || []}
            orderDate={formatDate(order.ngayDat)}
          />
        </div>

        {/* Grid nội dung chi tiết phía dưới */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cột trái - Chi tiết lịch trình công việc */}
          <div className="lg:col-span-2 space-y-6">
            {/* Khối thông tin đơn đặt */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-2">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Thông tin đơn đặt
              </h2>

              {/* Bố cục lưới: 1 cột trên mobile, 2 cột trên màn hình desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Mã đơn hàng */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-indigo-50 p-2 rounded-lg flex-shrink-0 text-indigo-600 flex items-center justify-center">
                    <Assignment sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                      Mã đơn hàng
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">
                      {order.maDon}
                    </p>
                  </div>
                </div>

                {/* 2. Ngày đặt dịch vụ */}
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

                {/* 3. Số ngày thực hiện */}
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

                {/* Danh sách dịch vụ đặt */}
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

                {/* 4. Địa chỉ thực hiện */}
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

                {/* 5. Ghi chú (Nếu có) */}
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

            {/* Khối danh sách ngày làm việc */}
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

                        return (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-lg border border-slate-100 relative overflow-hidden mb-2"
                          >
                            <div
                              className={`absolute top-0 left-0 w-1.5 h-full ${dayGroup.danhSachCa[idx].trangThai === "Hoàn thành" ? "bg-emerald-500" : "bg-blue-500"}`}
                            ></div>

                            <div className="pl-2">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md text-sm border border-indigo-100">
                                  {ca.tenDichVu}
                                </span>
                                <span className="text-xs font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                                  {displayStatus}
                                </span>
                              </div>

                              <div className="text-sm text-slate-600 mb-2">
                                <span className="font-medium text-slate-800">
                                  Thời gian:
                                </span>{" "}
                                {ca.gioBatDau} - {ca.gioKetThuc}
                              </div>

                              <div className="border-t border-slate-100 pt-4 mt-2">
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
                      className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
}
