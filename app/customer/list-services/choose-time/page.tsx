"use client";

import React, { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Import MUI Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Link from "next/link";
import BookingStepper from "@/components/BookingStepper";
import OrderSummary from "@/components/OrderSumary";

export default function TimeSelectionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // Mặc định chọn 14:00 (định dạng 24h)
  const [startTime, setStartTime] = useState("14:00");
  const [duration, setDuration] = useState<number>(4);

  // ----- TÍNH TOÁN GIÁ TIỀN ĐỘNG -----
  const PRICE_PER_HOUR = 150000;
  const PRICE_FULL_DAY = 1000000;

  const numberOfDays =
    dateRange?.from && dateRange?.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
      : dateRange?.from
        ? 1
        : 0;

  const basePricePerDay =
    duration === 24 ? PRICE_FULL_DAY : duration * PRICE_PER_HOUR;

  const totalBasePrice = basePricePerDay * numberOfDays;
  const vat = totalBasePrice * 0.08;
  const finalPrice = totalBasePrice + vat;

  // Formatter tiền tệ & Ngày tháng
  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatSingleDate = (date?: Date) => {
    if (!date) return "Chưa chọn";
    return format(date, "dd/MM/yyyy");
  };

  // ----- TÍNH THỜI GIAN KẾT THÚC (24H) -----
  const calculateEndTime = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHour = hours + duration;
    let daySuffix = "cùng ngày";

    // Nếu thời gian cộng dồn qua 24h (nửa đêm)
    if (endHour >= 24) {
      endHour -= 24;
      daySuffix = "hôm sau";
    }

    return `${endHour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${daySuffix}`;
  };

  // Tạo danh sách giờ (Từ 06:00 đến 18:00) theo hệ 24h
  const timeOptions = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 font-sans text-gray-800">
      <BookingStepper activeStep={1} />

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chọn thời gian thuê
          </h1>
          <p className="text-gray-500 text-sm">
            Vui lòng chọn khoảng thời gian và gói giờ phù hợp. Hệ thống sẽ tự
            động tính toán chi phí cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ---- CỘT TRÁI ---- */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* --- BỘ LỊCH RANGE --- */}
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex-1 w-full max-w-sm">
                <style>{`
                  .rdp { 
                    margin: 0; 
                    --rdp-cell-size: 40px; 
                    --rdp-accent-color: #0d7660; 
                  }
                  .rdp-caption_label { 
                    font-size: 1.125rem; 
                    font-weight: 700; 
                    color: #1f2937; 
                    text-transform: capitalize;
                  }
                  .rdp-head_cell { 
                    font-size: 11px; 
                    color: #9ca3af; 
                    font-weight: 600; 
                    text-transform: uppercase; 
                  }
                  .rdp-day { font-size: 14px; font-weight: 500; }
                  
                  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { 
                    background-color: #0d7660;
                    color: white; 
                  }

                  .rdp-day_range_middle {
                    background-color: #e4f7f2 !important;
                    color: #0d7660 !important;
                    border-radius: 0 !important;
                  }

                  .rdp-day_range_start:not(.rdp-day_range_end) {
                    border-top-right-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                  }

                  .rdp-day_range_end:not(.rdp-day_range_start) {
                    border-top-left-radius: 0 !important;
                    border-bottom-left-radius: 0 !important;
                  }
                `}</style>

                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={vi}
                  showOutsideDays
                  disabled={{ before: new Date() }} // Vô hiệu hóa ngày trong quá khứ
                  className="w-full flex justify-center"
                />
              </div>

              {/* --- CÁC TÙY CHỌN GIỜ --- */}
              <div className="flex-1 w-full space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Giờ bắt đầu
                  </label>
                  <div className="relative">
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="appearance-none w-full bg-[#e5ecea] px-4 py-3.5 rounded-xl text-gray-800 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#0d7660]/50"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <ExpandMoreIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gói thời gian
                  </label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="appearance-none w-full bg-[#e5ecea] px-4 py-3.5 rounded-xl text-gray-800 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#0d7660]/50"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                        <option key={hour} value={hour}>
                          {hour} giờ (Tiêu chuẩn)
                        </option>
                      ))}
                    </select>
                    <AccessTimeIcon
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      fontSize="small"
                    />
                  </div>
                </div>

                {/* Box Thông tin thêm */}
                <div className="bg-[#e4f7f2] p-5 rounded-xl mt-4 border border-[#b2e5d5]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500 text-sm">
                      Dự kiến kết thúc:
                    </span>
                    <span className="text-[#0d7660] font-bold text-sm">
                      {calculateEndTime()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      Số ngày thực hiện:
                    </span>
                    <span className="text-gray-800 font-bold text-sm">
                      {numberOfDays} ngày
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="relative bg-[#1c4841] overflow-hidden rounded-2xl p-8 mt-2 shadow-md min-h-[160px] flex items-center">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-white font-bold text-xl mb-2">
                  Chăm sóc tận tâm
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed opacity-90">
                  Chúng tôi luôn đảm bảo không gian của bạn được chăm chút tỉ mỉ
                  nhất.
                </p>
              </div>
              <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-gradient-to-tr from-[#2d6f58] to-transparent rounded-full opacity-50 blur-2xl pointer-events-none"></div>
              <div className="absolute right-10 bottom-0 opacity-80 pointer-events-none">
                <svg
                  width="180"
                  height="150"
                  viewBox="0 0 100 100"
                  className="fill-[#e1ece8]"
                >
                  <path d="M50 100 Q 40 50 10 30 Q 50 20 50 60 Q 50 20 90 30 Q 60 50 50 100 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ---- CỘT PHẢI (Tóm tắt đơn hàng) ---- */}
          {/* Phần Tóm tắt bên phải (col-span-4) */}
          <div className="col-span-4">
            <OrderSummary
              duration={4}
              startTime="14:00"
              endTime="18:00"
              startDate="08/04/2026"
              endDate="08/04/2026"
              numberOfDays={1}
              totalBasePrice={600000}
              vat={48000}
              finalPrice={648000}
              nextStepUrl="/customer/list-services/address" // Link sang bước 4
              buttonText="Tiếp tục"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
