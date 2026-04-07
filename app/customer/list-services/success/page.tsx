"use client";

import React from "react";

import CheckIcon from "@mui/icons-material/Check";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import Image from "next/image";
import BookingStepper from "@/components/BookingStepper";
import OrderSummary from "@/components/OrderSumary";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* 1. Stepper - Active bước cuối cùng (Xác nhận) */}
      <BookingStepper activeStep={4} />

      <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8">
        {/* 2. LEFT: THÔNG BÁO THÀNH CÔNG */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center text-center">
            {/* Icon Thành công */}
            <div className="w-20 h-20 bg-[#CFF2EB] rounded-full flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-[#0d7660] rounded-full flex items-center justify-center text-white">
                <CheckIcon fontSize="large" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-[#1A3131] mb-4">
              Yêu cầu đã được gửi thành công
            </h1>

            {/* Badge Trạng thái */}
            <div className="inline-flex items-center gap-2 bg-[#E8F1F1] px-4 py-1.5 rounded-full text-[#0d7660] text-sm font-bold mb-8">
              <HourglassEmptyIcon sx={{ fontSize: 16 }} />
              Trạng thái: Chờ xác nhận
            </div>

            <p className="text-gray-500 max-w-md leading-relaxed mb-10">
              Vui lòng chờ đội ngũ của chúng tôi kết nối với người giúp việc phù
              hợp nhất cho nhu cầu của bạn.
            </p>

            {/* Nút điều hướng */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button className="bg-[#0d7660] hover:bg-[#0a6350] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md">
                Xem trạng thái đơn hàng
              </button>
              <Link href="/">
                <button className="w-full bg-[#E8F1F1] hover:bg-[#D1E5E5] text-[#0d7660] font-bold py-3.5 px-8 rounded-xl transition-all">
                  Quay về trang chủ
                </button>
              </Link>
            </div>
          </div>

          {/* Banner Yên tâm tận hưởng */}
          <div className="bg-[#F0F7F6] rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center border border-[#E0ECEB]">
            <div className="w-full md:w-1/2 h-64 relative">
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                {/* Image placeholder - thay bằng src thật của bạn */}
                <span>[Ảnh Nhân Viên]</span>
              </div>
            </div>
            <div className="p-8 md:p-10 flex-1">
              <h3 className="text-2xl font-bold text-[#1A3131] mb-4">
                Yên tâm tận hưởng thời gian của bạn
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Trong lúc chờ đợi, bạn có thể hoàn toàn yên tâm. Mọi đối tác của
                chúng tôi đều được xác minh danh tính và đào tạo nghiệp vụ khắt
                khe để mang lại trải nghiệm tốt nhất.
              </p>
              <div className="flex flex-wrap gap-6 text-[#0d7660] font-bold text-xs">
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

        {/* 3. RIGHT: ORDER SUMMARY (Sử dụng component đã có) */}
        <div className="lg:col-span-4 space-y-6">
          <OrderSummary
            duration={4}
            startTime="09:00"
            endTime="13:00"
            startDate="24 Tháng 5, 2024"
            endDate="24 Tháng 5, 2024"
            numberOfDays={1}
            totalBasePrice={800000}
            vat={64000}
            finalPrice={864000}
            nextStepUrl="#"
            buttonText="Hỗ trợ ngay" // Thay đổi text nút để phù hợp mục đích hỗ trợ
            showBackButton={false} // Không cần nút quay lại ở trang thành công
          />

          {/* Card Cần hỗ trợ phụ trợ (nếu muốn giữ style của ảnh cũ) */}
          <div className="bg-[#EBF3FF] p-6 rounded-[24px] border border-[#D6E6FF] relative overflow-hidden">
            <h4 className="font-bold text-[#1E3A8A] mb-2">
              Bạn cần hỗ trợ thêm?
            </h4>
            <p className="text-[#3B82F6] text-xs mb-4">
              Chúng tôi luôn sẵn sàng 24/7 để giải đáp mọi thắc mắc của bạn.
            </p>
            <p className="font-black text-[#1E3A8A] text-lg">1900-CARE</p>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-[#1E3A8A]">
              <VerifiedUserIcon sx={{ fontSize: 80 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
