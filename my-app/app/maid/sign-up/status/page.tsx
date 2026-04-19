"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";

// Icons
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplayIcon from "@mui/icons-material/Replay";

// Custom Theme MUI
const theme = createTheme({
  palette: {
    primary: { main: "#047857" },
    error: { main: "#ef4444" },
  },
  typography: { fontFamily: "inherit" },
});

export default function ApplicationStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "Chờ duyệt" | "Từ chối" | "Đã duyệt"
  >("loading");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login"); // Về login nếu không có token
          return;
        }

        // Gọi API thực tế mà bạn cung cấp
        const res = await fetch("https://localhost:7095/api/v1/maid/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Không thể kiểm tra trạng thái");

        const data = await res.json();

        // Nếu API trả về "Đã duyệt" thì đẩy thẳng vào hệ thống
        if (data.status === "Đã duyệt") {
          router.push("/maid/");
          return;
        }

        setStatus(data.status); // Set "Chờ duyệt" hoặc "Từ chối"
      } catch (error) {
        console.error("Lỗi khi tải trạng thái:", error);
        // Có thể setStatus('Từ chối') hoặc hiển thị lỗi fallback ở đây
      }
    };

    fetchStatus();
  }, [router]);

  // UI 1: Đang tải dữ liệu
  if (status === "loading") {
    return (
      <ThemeProvider theme={theme}>
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
          <CircularProgress color="primary" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
          {/* Thanh trang trí đổi màu theo trạng thái */}
          <div
            className={`h-3 w-full bg-gradient-to-r ${
              status === "Từ chối"
                ? "from-red-400 to-red-700"
                : "from-emerald-400 to-emerald-700"
            }`}
          ></div>

          <div className="p-10 md:p-14">
            {/* --- TRƯỜNG HỢP 1: CHỜ DUYỆT --- */}
            {status === "Chờ duyệt" && (
              <>
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="absolute inset-0 bg-emerald-50 rounded-full scale-[1.5]"></div>
                  <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-sm border border-emerald-100 z-10">
                    <HourglassEmptyIcon className="text-emerald-600 text-6xl" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-100 rounded-full p-1.5 shadow-sm border border-white z-20">
                    <HourglassEmptyIcon className="text-yellow-600 text-lg animate-pulse" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Hồ sơ đang chờ duyệt
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Cảm ơn bạn đã đăng ký trở thành đối tác của chúng tôi. Hồ sơ
                  của bạn đang được gửi đến ban quản trị để xét duyệt.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 text-left mb-6 border border-gray-100">
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
                      <span>
                        Thời gian xét duyệt dự kiến từ{" "}
                        <strong>24 - 48 giờ làm việc</strong>.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>
                        Chúng tôi sẽ liên hệ thông báo qua ứng dụng hoặc điện
                        thoại ngay khi có kết quả.
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* --- TRƯỜNG HỢP 2: TỪ CHỐI --- */}
            {status === "Từ chối" && (
              <>
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="absolute inset-0 bg-red-50 rounded-full scale-[1.5]"></div>
                  <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-sm border border-red-100 z-10">
                    <CancelOutlinedIcon className="text-red-600 text-6xl" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Hồ sơ chưa hợp lệ
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Rất tiếc, hồ sơ đăng ký của bạn chưa đáp ứng đủ các yêu cầu
                  hiện tại hoặc thông tin cung cấp chưa chính xác. Vui lòng cập
                  nhật lại thông tin.
                </p>

                <div className="bg-red-50 rounded-2xl p-6 text-left mb-8 border border-red-100">
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">
                    Lưu ý khi tạo lại hồ sơ:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                    <li>Đảm bảo ảnh chụp CCCD/CMND rõ nét, không bị lóa.</li>
                    <li>Điền đầy đủ và chính xác thông tin liên hệ.</li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push("/maid/sign-up/generalinfo")}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  <ReplayIcon /> Cập nhật lại hồ sơ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
