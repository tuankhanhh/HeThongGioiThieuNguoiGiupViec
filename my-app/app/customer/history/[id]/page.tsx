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
  CheckCircle,
  Warning,
  Download,
  Help,
  Star,
  StarBorder,
  Send,
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
        <Link
          href="/customer/history"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold transition-colors"
        >
          <ArrowBack sx={{ fontSize: 20 }} />
          <span>Quay lại lịch sử</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                {order.tenDichVu}
              </h1>
              <p className="text-lg text-slate-600">
                Mã đơn:{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {order.maDon}
                </span>
              </p>
            </div>
            {/* <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${config.bg} ${config.text}`}
            >
              {config.label === "Hoàn thành" ? (
                <CheckCircle sx={{ fontSize: 20 }} />
              ) : config.label === "Đã huỷ" ? (
                <Warning sx={{ fontSize: 20 }} />
              ) : (
                <AccessTime sx={{ fontSize: 20 }} />
              )}
              {config.label}
            </div> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <OrderStatusTimeline
              currentStatus={order.trangThai} // <-- Truyền thẳng
              statusTimes={order.statusTimes || {}} // <-- Truyền thẳng
              orderDate={formatDate(order.ngayDat)}
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Mô tả dịch vụ
              </h2>
              <p className="text-slate-700 leading-relaxed">{order.moTa}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Thông tin đơn đặt
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg mt-1">
                    <CalendarMonth
                      className="text-blue-600"
                      sx={{ fontSize: 20 }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Ngày đặt dịch vụ
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {formatDate(order.ngayDat)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-50 p-3 rounded-lg mt-1">
                    <LocationOn
                      className="text-amber-600"
                      sx={{ fontSize: 20 }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Địa chỉ thực hiện
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {order.diaChi}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg mt-1">
                    <AccessTime
                      className="text-purple-600"
                      sx={{ fontSize: 20 }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Số ngày thực hiện
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {order.soNgay} ngày
                    </p>
                  </div>
                </div>

                {order.ghiChu && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">Ghi chú:</span>{" "}
                      {order.ghiChu}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Work Schedule & Assignees */}
            {order.ngayLamViec && order.ngayLamViec.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  Lịch làm việc & Nhân viên phụ trách
                </h2>

                <div className="space-y-4">
                  {order.ngayLamViec.map((schedule: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl p-5 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                    >
                      {/* Dòng 1: Thông tin ngày giờ & trạng thái */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
                              Ngày làm việc
                            </p>
                            <p className="font-semibold text-slate-900 text-lg">
                              {formatDate(schedule.ngay)}
                            </p>
                          </div>
                          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
                              Thời gian
                            </p>
                            <p className="font-semibold text-slate-900 text-lg">
                              {schedule.gioBatDau} - {schedule.gioKetThuc}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                              schedule.trangThai === "Hoàn thành"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {schedule.trangThai}
                          </span>
                        </div>
                      </div>

                      {/* Dòng 2: Thông tin nhân viên cho ca làm việc này */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-300">
                          <Person
                            sx={{ fontSize: 24 }}
                            className="text-blue-600"
                          />
                        </div>
                        <div className="flex-1">
                          {schedule.tenNhanVien ? (
                            <>
                              <p className="font-semibold text-slate-900">
                                {schedule.tenNhanVien}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                                <Phone sx={{ fontSize: 16 }} />
                                <span className="text-sm">
                                  {schedule.sdtNhanVien || "Đang cập nhật SĐT"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-slate-500 italic">
                              Hệ thống đang điều phối người giúp việc...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Section */}
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
              ) : order.trangThai === "Hoàn thành" ? (
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

          {/* Right Column - Summary */}
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
