"use client";

import React, { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import BookingStepper from "@/components/BookingStepper";
import OrderSummary, { DayOrder } from "@/components/OrderSumary";
import { useRouter } from "next/navigation";

const BookingPage = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [workDays, setWorkDays] = useState<DayOrder[]>([]);

  // 1. Lấy dữ liệu từ localStorage khi component mounted
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const saved = localStorage.getItem("booking_workdays");
    if (saved) {
      try {
        setWorkDays(JSON.parse(saved));
      } catch (error) {
        console.error("Lỗi đọc dữ liệu từ localStorage", error);
      }
    } else {
      // Nếu không có dữ liệu, quay lại trang chọn thời gian
      router.push("/customer/list-services/time-selection");
    }
  }, [router]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* 1. Stepper - Bước 2: Thông tin địa chỉ */}
      <BookingStepper activeStep={2} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2. Left Section - Form nhập liệu */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-4 text-[#1A3131]">
            Hoàn tất chi tiết yêu cầu
          </h1>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">
            Vui lòng cung cấp địa chỉ chính xác và các lưu ý đặc biệt để chúng
            tôi có thể phục vụ bạn một cách chu đáo nhất.
          </p>

          <div className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            {/* Trường Địa điểm */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#00675B] uppercase tracking-widest">
                Địa điểm thực hiện
              </label>
              <TextField
                fullWidth
                placeholder="Số nhà, tên đường, phường/xã..."
                sx={{
                  bgcolor: "#f3f7f6",
                  "& fieldset": { border: "none" },
                  borderRadius: "12px",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn className="text-[#0d7660]" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Trường Ghi chú */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#00675B] uppercase tracking-widest">
                Ghi chú bổ sung
              </label>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Chia sẻ thêm về tình trạng cụ thể hoặc các chỉ dẫn đường đi..."
                sx={{
                  bgcolor: "#f3f7f6",
                  "& fieldset": { border: "none" },
                  borderRadius: "12px",
                  "& .MuiInputBase-root": { alignItems: "flex-start" },
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Right Section - Bản tóm tắt đồng bộ dữ liệu */}
        <div className="lg:col-span-4">
          <OrderSummary
            orders={workDays}
            onNext={() => router.push("/customer/list-services/payment")}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
