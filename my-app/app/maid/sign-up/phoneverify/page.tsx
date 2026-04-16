"use client";
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import { PhoneIphone } from "@mui/icons-material";
import RegistrationStepper from "@/components/componentsMaid/Stepper";
import Link from "next/link";
// 1. Import store Zustand
import { useRegistrationStore } from "@/store/useRegistrationStore";

export default function PhoneVerification() {
  // 2. Lấy dữ liệu và hàm cập nhật từ Store
  const step1_phone = useRegistrationStore((state) => state.step1_phone);
  const updatePhone = useRegistrationStore((state) => state.updatePhone);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);

  // Xử lý đếm ngược
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Xử lý nhập OTP
  const handleOtpChange = (element: any, index: number) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    // Tự động nhảy sang ô tiếp theo
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">
          Trở thành đối tác của chúng tôi
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Trải nghiệm dịch vụ chăm sóc gia đình cao cấp, nơi sự tận tâm và
          chuyên nghiệp được đặt lên hàng đầu.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Stepper */}
          <RegistrationStepper activeStep={0} />

          {/* Form Content */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#ccfbf1] text-[#0d9488] rounded-full flex items-center justify-center mb-4">
              <PhoneIphone />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Xác thực số điện thoại
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Chúng tôi sẽ gửi mã OTP đến số điện thoại của bạn để kích hoạt tài
              khoản.
            </p>

            {/* Input Phone */}
            <div className="w-full max-w-md space-y-6">
              <div className="flex gap-2">
                <TextField
                  fullWidth
                  placeholder="0xxx xxx xxx"
                  variant="outlined"
                  size="medium"
                  // 3. Gắn state của Zustand vào đây
                  value={step1_phone}
                  onChange={(e) => updatePhone(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f1f5f9",
                      border: "none",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  sx={{
                    bgcolor: "#ccfbf1",
                    color: "#0d9488",
                    fontWeight: 600,
                    px: 3,
                    borderRadius: "10px",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#b2f5ea" },
                  }}
                >
                  Gửi mã OTP
                </Button>
              </div>

              {/* OTP Inputs */}
              <div>
                <label className="block text-left text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                  Mã xác thực (6 chữ số)
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-full h-14 text-center text-xl font-bold bg-[#f1f5f9] border-none rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Timer */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-1"></span>
                  Gửi lại sau {timer}s
                </span>
                <button className="text-teal-600 font-bold hover:underline cursor-pointer">
                  Gửi lại mã
                </button>
              </div>

              {/* Confirm Button */}
              <Link href="/maid/sign-up/generalinfo">
                <button className="w-full py-4 bg-[#065f46] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#044e3a] transition-all transform active:scale-95">
                  Xác thực
                </button>
              </Link>

              <p className="text-[11px] text-gray-400">
                Bằng cách nhấn Xác thực, bạn đồng ý với{" "}
                <span className="text-teal-600 underline">
                  Điều khoản & Điều kiện
                </span>{" "}
                của Homezy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
