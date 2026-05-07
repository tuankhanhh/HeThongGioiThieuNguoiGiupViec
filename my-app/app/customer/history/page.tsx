"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RestartAlt,
  CalendarMonth,
  AttachMoney,
  EventNote,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import api from "@/services/api";
import Swal, { SweetAlertIcon } from "sweetalert2";

// Khai báo interface dựa theo dữ liệu API trả về
interface Order {
  maDon: string;
  tenDichVu: string;
  ngayDat: string;
  trangThai: string;
  soTien: number;
  thanhTien: number | null;
}

const statusConfig = {
  "Hoàn thành": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-100",
  },
  "Chờ xác nhận": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100",
  },
  "Đã xác nhận": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    badge: "bg-indigo-100",
  },
  "Đang thực hiện": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100",
  },
  "Đã hủy": {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100",
  },
  "Mặc định": {
    bg: "bg-gray-50",
    text: "text-gray-700",
    badge: "bg-gray-100",
  },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const handleCancelOrder = async (maDon: string) => {
    const result = await Swal.fire({
      title: "Xác nhận hủy đơn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning" as SweetAlertIcon, // Ép kiểu để TS không bắt bẻ string
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Màu đỏ của Tailwind (red-500)
      cancelButtonColor: "#3b82f6", // Màu xanh của Tailwind (blue-500)
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Quay lại",
      background: "#ffffff",
      // Sử dụng customClass để chỉnh bo góc bằng Tailwind
      customClass: {
        popup: "rounded-2xl",
        title: "text-xl font-semibold text-gray-800",
        confirmButton: "rounded-lg px-4 py-2",
        cancelButton: "rounded-lg px-4 py-2",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setCancellingId(maDon);
      // Lưu ý: Đảm bảo api.post trả về đúng cấu trúc bạn mong muốn
      const res: any = await api.post(`/Booking/Cancel/${maDon}`);

      // Kiểm tra thành công linh hoạt hơn
      const isSuccess =
        res?.status === 200 || res?.data?.success || res?.success;

      if (isSuccess) {
        setOrders((prev) =>
          prev.map((order) =>
            order.maDon === maDon ? { ...order, trangThai: "Đã hủy" } : order,
          ),
        );

        Swal.fire({
          title: "Thành công!",
          text: "Đơn hàng đã được hủy.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl",
          },
        });
      } else {
        throw new Error("Phản hồi từ server không thành công");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      Swal.fire({
        title: "Thất bại",
        text: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
        icon: "error",
        customClass: {
          popup: "rounded-2xl",
        },
      });
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Gọi API lấy thông tin user hiện tại (Sửa lại route cho khớp với controller của bạn VD: "/Auth/me")
        const userResponse: any = await api.get("/User/me");

        // Tùy thuộc vào cách axios wrapper trả dữ liệu, có thể nằm trong userResponse.data hoặc trực tiếp
        const maNguoiDung =
          userResponse?.maNguoiDung || userResponse?.data?.maNguoiDung;

        if (!maNguoiDung) {
          setError("Không thể xác thực thông tin người dùng.");
          return;
        }

        // 2. Gọi API lấy danh sách đơn (Sửa lại route cho khớp với controller của bạn VD: "/Booking")
        // Lấy pageSize lớn một chút hoặc cấu hình phân trang sau để đếm số lượng các tab cho chuẩn
        const ordersResponse: any = await api.get(
          `/Booking/GetByCustomer/${maNguoiDung}?pageSize=100`,
        );

        if (ordersResponse?.success || ordersResponse?.data?.success) {
          const ordersData = ordersResponse?.data?.data || ordersResponse?.data;
          setOrders(ordersData);
        } else {
          setError("Lỗi khi tải dữ liệu đơn đặt.");
        }
      } catch (err) {
        console.error("Lỗi fetch đơn hàng:", err);
        setError("Đã xảy ra lỗi hệ thống khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = selectedStatus
    ? orders.filter((order) => order.trangThai === selectedStatus)
    : orders;

  const formatDate = (dateString: string) => {
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
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // UI State: Đang tải
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <CircularProgress className="text-blue-600" />
      </div>
    );
  }

  // UI State: Lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Lịch sử đơn đặt
          </h1>
          <p className="text-lg text-slate-600">
            Quản lý và theo dõi các dịch vụ đã đặt
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-slate-200">
          <button
            onClick={() => setSelectedStatus(null)}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
              selectedStatus === null
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {[
            "Hoàn thành",
            "Chờ xác nhận",
            "Đã xác nhận",
            "Đang thực hiện",
            "Đã hủy",
          ].map((status) => {
            const count = orders.filter((o) => o.trangThai === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              // Xử lý fallback nếu trạng thái từ DB không khớp với config
              const config =
                statusConfig[order.trangThai as keyof typeof statusConfig] ||
                statusConfig["Mặc định"];

              return (
                <div
                  key={order.maDon}
                  className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.badge} ${config.text}`}
                    >
                      {order.trangThai}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="p-6 pr-5">
                    {/* Service Name */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 pr-4">
                      {order.tenDichVu}
                    </h3>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-4"></div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {/* Order Date */}
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <CalendarMonth
                            className="text-blue-600"
                            sx={{ fontSize: 20 }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Ngày đặt
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDate(order.ngayDat)}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2 rounded-lg">
                          <AttachMoney
                            className="text-amber-600"
                            sx={{ fontSize: 20 }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Giá dịch vụ
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(order.soTien)}
                          </p>
                        </div>
                      </div>

                      {/* Final Price */}
                      {order.thanhTien !== null && (
                        <div className="col-span-2 md:col-span-2 flex items-center gap-3">
                          <div className="bg-emerald-50 p-2 rounded-lg">
                            <AttachMoney
                              className="text-emerald-600"
                              sx={{ fontSize: 20 }}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">
                              Thành tiền
                            </p>
                            <p className="text-sm font-bold text-emerald-600">
                              {formatCurrency(order.thanhTien)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-4"></div>

                    {/* Bottom Section with Buttons */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Mã đơn:{" "}
                        <span className="font-mono font-semibold text-slate-900">
                          {order.maDon}
                        </span>
                      </p>

                      <div className="flex gap-3">
                        {order.trangThai === "Hoàn thành" && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors duration-200 text-sm cursor-pointer">
                            <RestartAlt sx={{ fontSize: 16 }} />
                            Đặt lại
                          </button>
                        )}

                        {order.trangThai === "Chờ xác nhận" && (
                          <button
                            onClick={() => handleCancelOrder(order.maDon)}
                            disabled={cancellingId === order.maDon}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {cancellingId === order.maDon
                              ? "Đang hủy..."
                              : "Hủy đơn"}
                          </button>
                        )}

                        <Link href={`/customer/history/${order.maDon}`}>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm group cursor-pointer">
                            Chi tiết
                            <ChevronRight
                              sx={{ fontSize: 16 }}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EventNote sx={{ fontSize: 32 }} className="text-slate-400" />
              </div>
              <p className="text-lg text-slate-600">Không có đơn đặt nào</p>
              <p className="text-sm text-slate-500 mt-2">
                Hãy đặt dịch vụ để bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
