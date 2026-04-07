import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import BookingStepper from "@/components/BookingStepper";
import OrderSummary from "@/components/OrderSumary";

// Giả định dữ liệu này được truyền từ Context/Redux của các trang trước
const prevStepData = {
  serviceName: "Chăm sóc người cao tuổi",
  duration: "4 giờ (Ca sáng)",
  serviceFee: 850000,
  travelFee: 50000,
};

const BookingPage = () => {
  const totalAmount = prevStepData.serviceFee + prevStepData.travelFee;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* 1. Stepper */}
      <BookingStepper activeStep={2} />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        {/* 2. Left Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-[#1A3131]">
            Hoàn tất chi tiết yêu cầu
          </h1>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">
            Vui lòng cung cấp địa chỉ chính xác và các lưu ý đặc biệt để chúng
            tôi có thể phục vụ bạn một cách chu đáo nhất.
          </p>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#00675B] uppercase tracking-widest">
                Địa điểm thực hiện
              </label>
              <TextField
                fullWidth
                placeholder="Số nhà, tên đường, phường/xã..."
                sx={{
                  bgcolor: "#DFEAE9",
                  "& fieldset": { border: "none" },
                  borderRadius: "12px",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn className="text-[#88A4A2]" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

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
                  bgcolor: "#DFEAE9",
                  "& fieldset": { border: "none" },
                  borderRadius: "12px",
                  "& .MuiInputBase-root": { alignItems: "flex-start" },
                }}
              />
            </div>
          </div>
        </div>

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
            nextStepUrl="/customer/list-services/payment" // Link sang bước 4
            buttonText="Tiếp tục"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
