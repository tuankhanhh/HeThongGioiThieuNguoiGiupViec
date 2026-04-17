"use client";

import React from "react";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import Link from "next/link";

// Icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

// Custom Theme MUI (Đồng nhất với các trang trước)
const theme = createTheme({
  palette: {
    primary: {
      main: "#047857",
    },
  },
  typography: {
    fontFamily: "inherit",
  },
});

export default function RegistrationSuccessPage() {
  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
          {/* Thanh trang trí phía trên */}
          <div className="h-3 w-full bg-gradient-to-r from-emerald-400 to-emerald-700"></div>

          <div className="p-10 md:p-14">
            {/* Vùng Icon minh họa */}
            <div className="relative inline-flex items-center justify-center mb-8">
              {/* Vòng tròn nền */}
              <div className="absolute inset-0 bg-emerald-50 rounded-full scale-[1.5]"></div>

              <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-sm border border-emerald-100 z-10">
                <CheckCircleOutlineIcon className="text-emerald-600 text-6xl" />
              </div>

              {/* Icon đồng hồ cát nhỏ nhắn biểu thị sự chờ đợi */}
              <div className="absolute -bottom-2 -right-2 bg-yellow-100 rounded-full p-1.5 shadow-sm border border-white z-20">
                <HourglassEmptyIcon className="text-yellow-600 text-lg animate-pulse" />
              </div>
            </div>

            {/* Nội dung thông báo */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nộp hồ sơ thành công!
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Cảm ơn bạn đã đăng ký trở thành đối tác của chúng tôi. Hồ sơ của
              bạn đang được gửi đến ban quản trị để xét duyệt.
            </p>

            {/* Khối thông tin thêm */}
            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-10 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HourglassEmptyIcon
                  fontSize="small"
                  className="text-emerald-600"
                />
                Tiến trình tiếp theo
              </h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Thời gian xét duyệt dự kiến từ{" "}
                  <strong>24 - 48 giờ làm việc</strong>.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Chúng tôi sẽ liên hệ qua <strong>số điện thoại</strong> hoặc
                  thông báo qua ứng dụng ngay khi có kết quả.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Vui lòng chú ý điện thoại trong thời gian này để ban quản trị
                  có thể gọi điện xác minh nếu cần.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
