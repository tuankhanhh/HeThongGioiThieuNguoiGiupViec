"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

export interface ServiceDetail {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface DayOrder {
  executionDate: string;
  startTime: string;
  services: ServiceDetail[];
}

interface OrderSummaryProps {
  orders: DayOrder[]; // Danh sách các ngày đặt
  voucherDiscount?: number; // Số tiền giảm giá
  nextStepUrl?: string;
  onNext?: () => void;
  buttonText?: string;
  showBackButton?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orders = [],
  voucherDiscount = 0,
  nextStepUrl,
  onNext,
  buttonText = "Tiếp tục",
  showBackButton = true,
}) => {
  const router = useRouter();

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // 1. Lấy danh sách tên dịch vụ duy nhất (để hiển thị tiêu đề)
  const allServiceNames = Array.from(
    new Set(orders.flatMap((day) => day.services.map((s) => s.name))),
  );
  const titleServiceStr = allServiceNames.join(" và ");

  // 2. Gom nhóm tổng hợp chi phí (Cộng dồn số giờ và tiền của cùng 1 loại dịch vụ qua các ngày)
  const aggregatedCosts = orders.reduce(
    (acc, day) => {
      day.services.forEach((s) => {
        if (!acc[s.name]) {
          acc[s.name] = { totalDuration: 0, totalPrice: 0 };
        }
        acc[s.name].totalDuration += s.duration;
        acc[s.name].totalPrice += s.price;
      });
      return acc;
    },
    {} as Record<string, { totalDuration: number; totalPrice: number }>,
  );

  // 3. Tính tổng tiền cuối cùng
  const subTotal = Object.values(aggregatedCosts).reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const finalTotal = subTotal - voucherDiscount;

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sticky top-6">
        <h2 className="font-bold text-xl text-gray-800 mb-6 border-b border-gray-100 pb-4">
          Tóm tắt đơn đặt dịch
        </h2>

        {/* Tiêu đề dịch vụ chính */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-[#0d7660] flex justify-center items-center text-white">
            <CleaningServicesIcon />
          </div>
          <h4 className="font-bold text-gray-800 text-[16px]">
            Dịch vụ {titleServiceStr || "Chưa chọn"}
          </h4>
        </div>

        {/* LẶP QUA TỪNG NGÀY */}
        <div className="space-y-6 mb-6">
          {orders.map((day, idx) => (
            <div
              key={idx}
              className="border-l-4 border-[#0d7660] pl-4 space-y-3"
            >
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  <span>
                    Ngày thực hiện:{" "}
                    <strong className="text-gray-800">
                      {day.executionDate}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <span>
                    Thời gian bắt đầu:{" "}
                    <strong className="text-gray-800">{day.startTime}</strong>
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Chi tiết gói đặt:
                </p>
                {day.services.map((s, sIdx) => (
                  <div key={sIdx} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.name}</span>
                    <span className="font-medium text-gray-800">
                      gói {s.duration}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="mb-5 border-gray-100" />

        {/* PHẦN CHI PHÍ TỔNG HỢP */}
        <div className="mb-6">
          <h5 className="text-sm font-bold text-gray-800 mb-3">
            Chi phí dịch vụ:
          </h5>
          <div className="space-y-2">
            {Object.entries(aggregatedCosts).map(([name, data]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {name} x {data.totalDuration}h
                </span>
                <span className="font-bold text-gray-800">
                  {formatVND(data.totalPrice)}
                </span>
              </div>
            ))}

            {/* Voucher */}
            <div className="flex justify-between text-sm text-orange-600 italic">
              <span className="flex items-center gap-1">
                <LocalOfferIcon sx={{ fontSize: 14 }} />
                Voucher
              </span>
              <span>-{formatVND(voucherDiscount)}</span>
            </div>
          </div>
        </div>

        {/* TỔNG CỘNG */}
        <div className="flex justify-between items-center mb-8 bg-[#f4fbf9] p-4 rounded-xl border border-[#e0f2ed]">
          <span className="font-bold text-gray-800 text-base">
            Tổng chi phí
          </span>
          <span className="font-bold text-[#0d7660] text-xl">
            {formatVND(finalTotal > 0 ? finalTotal : 0)}
          </span>
        </div>

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="space-y-4">
          <button
            onClick={() =>
              onNext ? onNext() : nextStepUrl && router.push(nextStepUrl)
            }
            className="group w-full bg-[#0d7660] hover:bg-[#0a6350] text-white py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span className="font-bold text-sm tracking-wide">
              {buttonText}
            </span>
            <ArrowForwardIcon
              fontSize="small"
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-full text-gray-500 text-sm font-semibold hover:text-[#0d7660] transition-colors py-2"
            >
              <KeyboardArrowLeftIcon fontSize="small" className="mr-1" />
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
