"use client";

import React, { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ROUTES } from "@/lib/routes";

// Cần import api service của bạn (giống trang Profile)
import api from "@/services/api";

const BookingPage = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [workDays, setWorkDays] = useState<DayOrder[]>([]);

  // State lưu trữ địa chỉ và ghi chú
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // 1. Lấy dữ liệu từ localStorage và API khi component mounted
  useEffect(() => {
    //eslint-disable-next-line
    setIsMounted(true);
    const savedWorkDays = localStorage.getItem("booking_workdays");
    const savedAddress = localStorage.getItem("booking_address");
    const savedNote = localStorage.getItem("booking_note");

    if (savedNote) setNote(savedNote);

    // Xử lý lấy địa chỉ
    if (savedAddress) {
      // Nếu có sẵn trong localStorage (do quay lại từ trang Payment), dùng luôn
      setAddress(savedAddress);
    } else {
      // Nếu chưa có, gọi API lấy địa chỉ mặc định từ Profile
      const fetchDefaultAddress = async () => {
        try {
          // Lưu ý: Đổi endpoint "/api/profile/address" cho đúng với định tuyến backend của bạn
          const response = await api.get<any>("/Customer/address");
          if (response && response.diaChi) {
            setAddress(response.diaChi);
          }
        } catch (error) {
          console.error("Không thể lấy địa chỉ mặc định:", error);
        }
      };
      fetchDefaultAddress();
    }

    if (savedWorkDays) {
      try {
        setWorkDays(JSON.parse(savedWorkDays));
      } catch (error) {
        console.error("Lỗi đọc dữ liệu từ localStorage", error);
      }
    } else {
      router.push(ROUTES.CUSTOMER.CHOOSE_TIME);
    }
  }, [router]);

  // 2. Xử lý khi nhấn nút Tiếp theo
  const handleNext = () => {
    if (!address.trim()) {
      Swal.fire({
        title: "Thiếu thông tin",
        text: "Vui lòng nhập địa điểm thực hiện dịch vụ.",
        icon: "warning",
        confirmButtonColor: "#0d7660",
      });
      return;
    }

    // Lưu vào localStorage để trang Payment sử dụng
    localStorage.setItem("booking_address", address);
    localStorage.setItem("booking_note", note);

    router.push(ROUTES.CUSTOMER.PAYMENT);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      <BookingStepper activeStep={2} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                Địa điểm thực hiện <span className="text-red-500">*</span>
              </label>
              <TextField
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã..."
                sx={{
                  bgcolor: "#f3f7f6",
                  "& fieldset": { border: "none" },
                  borderRadius: "12px",
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn className="text-[#0d7660]" />
                      </InputAdornment>
                    ),
                  },
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
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

        <div className="lg:col-span-4">
          <OrderSummary orders={workDays} onNext={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
