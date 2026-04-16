"use client";

import React, { useState, useEffect } from "react";
import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [workDays, setWorkDays] = useState<DayOrder[]>([]);

  // 1. Kiểm tra Hydration và lấy dữ liệu đã lưu từ các bước trước
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("booking_workdays");
    if (saved) {
      try {
        setWorkDays(JSON.parse(saved));
      } catch (error) {
        console.error("Lỗi parse dữ liệu booking_workdays:", error);
      }
    } else {
      // Nếu không có dữ liệu lịch làm việc, đẩy về bước chọn thời gian
      router.push("/customer/list-services/time-selection");
    }
  }, [router]);

  const paymentData = {
    bankName: "Techcombank",
    accountNumber: "1903 4567 8901",
    accountHolder: "TRAN DANG TUAN KHANH",
    content: `THANH TOAN DV ${new Date().getTime().toString().slice(-6)}`,
    qrUrl: "/qr-code-placeholder.png",
  };

  // 2. Hàm xử lý xác nhận thanh toán và gọi API Create Booking
  const handleConfirmPayment = async () => {
    try {
      // Bật loading
      Swal.fire({
        title: "Đang tạo đơn hàng...",
        text: "Vui lòng chờ trong giây lát",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Lấy Token và thông tin từ localStorage
      const token = localStorage.getItem("accessToken");
      const address = localStorage.getItem("booking_address") || "";
      const note = localStorage.getItem("booking_note") || "";

      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      // --- GIẢI MÃ TOKEN ĐỂ LẤY ID NGƯỜI DÙNG ---
      let customerId = "";
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        // Key này tương ứng với ClaimTypes.NameIdentifier trong TokenService C# của bạn
        customerId =
          decodedPayload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];

        if (!customerId) {
          // Fallback nếu tên claim thay đổi
          customerId = decodedPayload.nameid || decodedPayload.sub;
        }
      } catch (decodeError) {
        console.error("Lỗi giải mã token:", decodeError);
        throw new Error("Dữ liệu đăng nhập không hợp lệ.");
      }

      if (!customerId) {
        throw new Error("Không xác định được danh tính khách hàng.");
      }

      // Tính tổng tiền
      const totalAmount = workDays.reduce((total, day) => {
        const dayTotal = day.services.reduce((sum, svc) => sum + svc.price, 0);
        return total + dayTotal;
      }, 0);

      // --- XÂY DỰNG PAYLOAD GỬI BACKEND ---
      const payload = {
        maKhachHang: customerId,
        diaChiThucHien: address,
        ghiChu: note,
        tongTien: totalAmount,
        phuongThucThanhToan: "Chuyển khoản",
        maGiaoDich: paymentData.content,
        chiTietNgayLamViec: workDays.map((day) => ({
          ngayThucHien: day.executionDate,
          gioBatDau: day.startTime,
          dichVus: day.services.map((svc) => ({
            maDichVu: svc.id,
            thoiLuong: svc.duration,
            thanhTien: svc.price,
          })),
        })),
      };

      // Gọi API tới Backend C#
      const response = await fetch(
        "https://localhost:7095/api/Booking/Create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Header quan trọng để qua middleware Authorize
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Lỗi khi tạo đơn hàng từ server.");
      }

      Swal.fire({
        title: "Thành công!",
        text: "Đơn hàng của bạn đã được tạo thành công.",
        icon: "success",
        confirmButtonColor: "#0d7660",
      }).then(() => {
        router.push("/customer/list-services/success");
      });
    } catch (error: any) {
      console.error("Lỗi Payment:", error);
      Swal.fire({
        title: "Lỗi thanh toán",
        text: error.message || "Đã xảy ra lỗi không xác định.",
        icon: "error",
        confirmButtonColor: "#0d7660",
      });
    }
  };

  // Tránh lỗi Hydration trong Next.js
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      <div className="max-w-7xl mx-auto">
        <BookingStepper activeStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
          {/* Cột trái: Thông tin thanh toán */}
          <div className="lg:col-span-8">
            <h1 className="text-3xl font-bold mb-3 text-[#1A3131]">
              Phương thức thanh toán
            </h1>
            <p className="text-gray-500 mb-8 text-[15px]">
              Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận
              đơn hàng.
            </p>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
              {/* QR Section */}
              <div className="bg-[#f3f7f6] p-6 rounded-3xl border-2 border-dashed border-[#0d7660]/20">
                <div className="w-48 h-48 bg-white flex items-center justify-center rounded-xl shadow-inner relative overflow-hidden">
                  <div className="text-center">
                    <p className="text-[#0d7660] font-black text-xl">QR PAY</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      Scan to pay
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="flex-1 w-full space-y-5">
                <div className="pb-4 border-b border-gray-50">
                  <h3 className="text-[#0d7660] font-bold text-xl">
                    Chuyển khoản ngân hàng
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngân hàng</span>
                    <span className="font-bold">{paymentData.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số tài khoản</span>
                    <span className="font-mono font-bold text-lg text-[#0d7660]">
                      {paymentData.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chủ tài khoản</span>
                    <span className="font-bold uppercase">
                      {paymentData.accountHolder}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-[#f0f7f6] rounded-2xl border border-[#0d7660]/10">
                    <span className="text-gray-500">Nội dung chuyển khoản</span>
                    <span className="font-bold text-[#0d7660]">
                      {paymentData.content}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl flex gap-3">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-[12px] text-amber-800 leading-tight">
                    Lưu ý quan trọng: Vui lòng không thay đổi nội dung chuyển
                    khoản để chúng tôi có thể xử lý đơn hàng của bạn nhanh nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Tổng kết đơn hàng */}
          <div className="lg:col-span-4">
            <OrderSummary
              orders={workDays}
              buttonText="Xác nhận đã thanh toán"
              onNext={handleConfirmPayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
