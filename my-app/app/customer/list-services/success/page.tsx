"use client";

import React, { useState, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";

export default function SuccessPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [workDays, setWorkDays] = useState<DayOrder[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const saved = localStorage.getItem("booking_workdays");
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setWorkDays(parsedData);

        // Tùy chọn: Dọn dẹp localStorage sau khi đã load dữ liệu vào state
        // Điều này giúp đơn hàng tiếp theo bắt đầu từ trạng thái trống.
        // localStorage.removeItem("booking_workdays");
        // localStorage.removeItem("booking_services");
      } catch (error) {
        console.error("Lỗi dữ liệu:", error);
      }
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* 1. Stepper - Bước cuối cùng (Thành công) */}
      <BookingStepper activeStep={4} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2. LEFT: THÔNG BÁO THÀNH CÔNG */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[40px] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white flex flex-col items-center text-center">
            {/* Icon Thành công */}
            <div className="w-24 h-24 bg-[#CFF2EB] rounded-full flex items-center justify-center mb-8 animate-bounce">
              <div className="w-14 h-14 bg-[#0d7660] rounded-full flex items-center justify-center text-white shadow-lg">
                <CheckIcon sx={{ fontSize: 35 }} />
              </div>
            </div>

            <h1 className="text-4xl font-black text-[#1A3131] mb-4">
              Tuyệt vời! Yêu cầu của bạn đã được gửi
            </h1>

            {/* Badge Trạng thái */}
            <div className="inline-flex items-center gap-2 bg-[#E8F1F1] px-6 py-2 rounded-full text-[#0d7660] text-sm font-bold mb-8 border border-[#0d7660]/10">
              <HourglassEmptyIcon sx={{ fontSize: 18 }} />
              Trạng thái: Chờ xác nhận thanh toán
            </div>

            <p className="text-gray-500 max-w-md leading-relaxed mb-10 text-lg">
              Đội ngũ của chúng tôi đang kiểm tra giao dịch và sẽ thông báo cho
              bạn ngay khi người giúp việc được xác nhận.
            </p>

            {/* Nút điều hướng */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button className="bg-[#0d7660] hover:bg-[#0a6350] text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-[#0d7660]/20 active:scale-95">
                Xem chi tiết đơn hàng
              </button>
              <Link href="/">
                <button className="w-full bg-[#E8F1F1] hover:bg-[#D1E5E5] text-[#0d7660] font-bold py-4 px-10 rounded-2xl transition-all active:scale-95">
                  Quay về trang chủ
                </button>
              </Link>
            </div>
          </div>

          {/* Banner Uy tín */}
          <div className="bg-[#1A3131] rounded-[40px] overflow-hidden flex flex-col md:flex-row items-center border border-white/10 shadow-lg">
            <div className="w-full md:w-1/3 h-48 md:h-64 relative bg-[#264242] flex items-center justify-center">
              <VerifiedUserIcon
                sx={{ fontSize: 100, color: "#0d7660", opacity: 0.3 }}
              />
            </div>
            <div className="p-8 md:p-10 flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">
                Mọi thứ đã sẵn sàng cho bạn
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Bạn có thể theo dõi tiến độ công việc ngay trên ứng dụng. Chúng
                tôi cam kết mang lại sự hài lòng tối đa với chính sách bảo hiểm
                và hỗ trợ 24/7.
              </p>
              <div className="flex flex-wrap gap-6 text-[#CFF2EB] font-bold text-xs">
                <span className="flex items-center gap-1">
                  <VerifiedUserIcon sx={{ fontSize: 16 }} /> Bảo hiểm 100%
                </span>
                <span className="flex items-center gap-1">
                  <StarIcon sx={{ fontSize: 16 }} /> Đối tác 5 sao
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: ORDER SUMMARY (Đồng bộ dữ liệu thật) */}
        <div className="lg:col-span-4 space-y-6">
          <OrderSummary
            orders={workDays}
            buttonText="Gặp sự cố? Hỗ trợ ngay"
            onNext={() => window.open("tel:19001234")} // Ví dụ: gọi hotline
            showBackButton={false}
          />

          {/* Card Hotline hỗ trợ */}
          <div className="bg-[#0d7660] p-8 rounded-[32px] text-white relative overflow-hidden shadow-lg">
            <h4 className="font-bold text-white/80 mb-2 uppercase tracking-widest text-xs">
              Tổng đài hỗ trợ 24/7
            </h4>
            <p className="text-2xl font-black mb-4 tracking-tighter">
              1900-CARE
            </p>
            <p className="text-white/60 text-[11px] leading-relaxed">
              Nếu có bất kỳ thay đổi nào về lịch trình, vui lòng liên hệ sớm với
              chúng tôi để được hỗ trợ miễn phí.
            </p>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
              <StarIcon sx={{ fontSize: 120 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
