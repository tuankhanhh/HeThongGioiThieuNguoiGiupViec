"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Link from "next/link";

interface OrderSummaryProps {
  duration: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  totalBasePrice: number;
  vat: number;
  finalPrice: number;
  nextStepUrl: string;
  buttonText?: string;
  showBackButton?: boolean; // Hiện/ẩn nút quay lại
  isButtonDisabled?: boolean;
}

const OrderSummary = ({
  duration,
  startTime,
  endTime,
  startDate,
  endDate,
  numberOfDays,
  totalBasePrice,
  vat,
  finalPrice,
  nextStepUrl,
  buttonText = "Tiếp theo",
  showBackButton = true,
  isButtonDisabled = false,
}: OrderSummaryProps) => {
  const router = useRouter();

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sticky top-6">
        <h2 className="font-bold text-xl text-gray-800 mb-6">
          Tóm tắt đơn hàng
        </h2>

        {/* Phần Dịch vụ & Ngày giờ (Giữ nguyên như cũ) */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0d7660] flex justify-center items-center text-white">
            <CleaningServicesIcon />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-[15px]">
              Dịch vụ Vệ sinh Nhà cửa
            </h4>
            <p className="text-gray-500 text-xs mt-0.5">Gói {duration}H</p>
          </div>
        </div>

        <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2 italic">
              Ngày bắt đầu
            </span>
            <span className="font-bold text-gray-800">{startDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2 italic">
              Ngày kết thúc
            </span>
            <span className="font-bold text-gray-800">{endDate}</span>
          </div>
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-500 flex items-center gap-2 text-[13px]">
              <AccessTimeIcon className="text-gray-400" fontSize="small" />
              Khung giờ mỗi ngày
            </span>
            <span className="font-bold text-gray-800">
              {startTime} - {endTime}
            </span>
          </div>
        </div>

        {/* Phần Tính tiền */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Phí dịch vụ ({numberOfDays} ngày)</span>
            <span className="font-medium text-gray-800">
              {formatVND(totalBasePrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Thuế VAT (8%)</span>
            <span className="font-medium text-gray-800">{formatVND(vat)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-gray-800 text-lg">Tổng cộng</span>
          <span className="font-bold text-[#0d7660] text-2xl">
            {formatVND(finalPrice)}
          </span>
        </div>

        {/* Cụm Nút hành động */}
        <div className="space-y-4">
          <Link href={nextStepUrl}>
            <button
              disabled={isButtonDisabled || numberOfDays === 0}
              className="group w-full bg-[#0d7660] hover:bg-[#0a6350] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 pl-6 pr-2 rounded-xl transition-all flex items-center justify-between shadow-md"
            >
              <span className="font-bold text-sm tracking-wide">
                {buttonText}
              </span>
              <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                <ArrowForwardIcon fontSize="small" />
              </div>
            </button>
          </Link>

          {/* NÚT QUAY LẠI */}
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-full text-gray-400 text-[11px] font-bold hover:text-[#0d7660] transition-colors uppercase tracking-widest"
            >
              <KeyboardArrowLeftIcon fontSize="small" />
              Quay lại bước trước
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
