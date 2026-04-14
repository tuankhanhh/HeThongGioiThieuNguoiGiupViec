"use client";

import React, { useState, useEffect } from "react";
import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [workDays, setWorkDays] = useState<DayOrder[]>([]);

  // 1. Lấy dữ liệu lịch làm việc đã lưu
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const saved = localStorage.getItem("booking_workdays");
    if (saved) {
      try {
        setWorkDays(JSON.parse(saved));
      } catch (error) {
        console.error("Lỗi dữ liệu:", error);
      }
    } else {
      router.push("/customer/list-services/time-selection");
    }
  }, [router]);

  const paymentData = {
    bankName: "Techcombank",
    accountNumber: "1903 4567 8901",
    accountHolder: "TRAN DANG TUAN KHANH",
    content: `THANH TOAN DV ${new Date().getTime().toString().slice(-6)}`, // Nội dung động
    qrUrl: "/qr-code-placeholder.png",
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* Bước 3 trong Stepper: Thanh toán */}
      <BookingStepper activeStep={3} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: PHƯƠNG THỨC THANH TOÁN */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-3 text-[#1A3131]">
            Phương thức thanh toán
          </h1>
          <p className="text-gray-500 mb-8 text-[15px] leading-relaxed">
            Vui lòng chuyển khoản chính xác nội dung bên dưới. Hệ thống sẽ kiểm
            tra và kích hoạt yêu cầu của bạn ngay sau khi nhận được tiền.
          </p>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
            {/* QR Code giả lập */}
            <div className="bg-[#f3f7f6] p-6 rounded-3xl border-2 border-dashed border-[#0d7660]/20">
              <div className="w-48 h-48 relative bg-white flex items-center justify-center overflow-hidden rounded-xl shadow-inner">
                <div className="text-center">
                  <div className="text-[#0d7660] font-black text-xl mb-1">
                    QR CODE
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Quét để thanh toán
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết chuyển khoản */}
            <div className="flex-1 w-full space-y-5">
              <div className="pb-4 border-b border-gray-50">
                <h3 className="text-[#0d7660] font-bold text-xl">
                  Thông tin chuyển khoản
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Ngân hàng</span>
                  <span className="font-bold text-[#1A3131]">
                    {paymentData.bankName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Số tài khoản</span>
                  <span className="font-mono font-bold text-lg text-[#1A3131] tracking-wider">
                    {paymentData.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Chủ tài khoản</span>
                  <span className="font-bold text-[#1A3131] uppercase">
                    {paymentData.accountHolder}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#f0f7f6] rounded-xl border border-[#0d7660]/10">
                  <span className="text-gray-500 text-sm">Nội dung</span>
                  <span className="font-bold text-[#0d7660]">
                    {paymentData.content}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg flex gap-3">
                <span className="text-amber-600 text-sm">⚠️</span>
                <p className="text-[12px] text-amber-800 leading-tight">
                  Lưu ý: Nhập chính xác nội dung chuyển khoản để đơn hàng được
                  duyệt tự động.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: TÓM TẮT ĐƠN HÀNG (Sử dụng dữ liệu thật) */}
        <div className="lg:col-span-4">
          <OrderSummary
            orders={workDays}
            buttonText="Xác nhận đã thanh toán"
            onNext={() => router.push("/customer/list-services/success")}
          />
        </div>
      </div>
    </div>
  );
}
