"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// MUI Icons
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ElderlyIcon from "@mui/icons-material/Elderly";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ChairIcon from "@mui/icons-material/Chair";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import Swal from "sweetalert2";

// ---------------- DATA ----------------
// Lưu ý: ID ở đây phải khớp hoàn toàn với MOCK_SERVICES_DB ở trang sau
const servicesData = [
  {
    id: "cleaning",
    title: "Dọn dẹp",
    desc: "Vệ sinh nhà cửa, quét dọn và sắp xếp không gian sống ngăn nắp.",
    icon: <CleaningServicesIcon />,
  },
  {
    id: "cooking",
    title: "Nấu ăn",
    desc: "Chuẩn bị bữa cơm gia đình ấm cúng với thực đơn theo yêu cầu.",
    icon: <RestaurantIcon />,
  },
  {
    id: "childcare",
    title: "Chăm sóc trẻ",
    desc: "Giữ trẻ, chơi cùng bé và hỗ trợ các hoạt động giáo dục sớm.",
    icon: <ChildCareIcon />,
  },
  {
    id: "eldercare",
    title: "Chăm sóc người già",
    desc: "Hỗ trợ sinh hoạt, bầu bạn và theo dõi sức khỏe cho người cao tuổi.",
    icon: <ElderlyIcon />,
  },
  {
    id: "sofa-cleaning",
    title: "Giặt sofa & nệm",
    desc: "Sử dụng máy móc chuyên dụng để làm sạch sâu.",
    icon: <ChairIcon />,
  },
  {
    id: "combo",
    title: "Tổng vệ sinh",
    desc: "Làm sạch sâu mọi ngóc ngách cho nhà mới hoặc dịp lễ Tết.",
    icon: <AllInclusiveIcon />,
  },
];

// ---------------- COMPONENT ----------------
export default function ServiceSelection() {
  const router = useRouter();

  // ✅ Khởi tạo state trực tiếp từ localStorage để giữ trạng thái khi back/forward
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("booking_services");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return []; // Mặc định để trống để người dùng tự chọn
  });

  // ✅ Lưu vào localStorage khi có sự thay đổi
  useEffect(() => {
    localStorage.setItem("booking_services", JSON.stringify(selectedServices));
  }, [selectedServices]);

  // ---------------- SELECT SERVICE ----------------
  const handleSelect = (id: string) => {
    setSelectedServices((prev) => {
      // 1. Nếu đã chọn rồi thì bỏ chọn
      if (prev.includes(id)) {
        // Khi thay đổi dịch vụ, nên xóa lịch cũ ở trang 2 để tránh sai lệch dữ liệu
        localStorage.removeItem("booking_workdays");
        return prev.filter((item) => item !== id);
      }

      // 2. Giới hạn tối đa 2 dịch vụ
      if (prev.length >= 2) {
        Swal.fire({
          title: "Giới hạn dịch vụ",
          text: "Bạn chỉ có thể chọn tối đa 2 dịch vụ cùng lúc để đảm bảo chất lượng phục vụ tốt nhất.",
          icon: "info",
          confirmButtonColor: "#0d7660",
          confirmButtonText: "Đã hiểu",
        });
        return prev;
      }

      // 3. Chọn mới: Xóa lịch làm việc cũ vì bộ dịch vụ đã thay đổi
      localStorage.removeItem("booking_workdays");
      return [...prev, id];
    });
  };

  // ---------------- CONTINUE ----------------
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      router.push("/customer/list-services/choose-time");
    } else {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất 1 dịch vụ để tiếp tục.",
        icon: "warning",
        confirmButtonColor: "#0d7660",
      });
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-[#f8fbfb] py-12 px-4 font-sans flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Thanh tiến trình */}
        <BookingStepper activeStep={0} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Chào mừng bạn trở lại,
          </h1>
          <p className="text-gray-600 text-[15px]">
            Hãy chọn loại hình dịch vụ bạn cần (tối đa 2 dịch vụ). Chúng tôi sẽ
            sắp xếp nhân sự phù hợp nhất cho yêu cầu của bạn.
          </p>
        </div>

        {/* GRID DỊCH VỤ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesData.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            const isLimitReached = !isSelected && selectedServices.length >= 2;

            return (
              <div
                key={service.id}
                onClick={() => {
                  if (!isLimitReached || isSelected) {
                    handleSelect(service.id);
                  }
                }}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border
                ${
                  isSelected
                    ? "bg-[#9ff1d7] border-[#0d7660] shadow-md transform scale-[1.02]"
                    : isLimitReached
                      ? "bg-gray-50 border-transparent opacity-60 grayscale-[0.5] cursor-not-allowed"
                      : "bg-[#f3f7f6] border-transparent hover:bg-white hover:border-[#9ff1d7] shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Icon tích chọn */}
                {isSelected && (
                  <CheckCircleIcon
                    className="absolute top-4 right-4 text-[#0d7660]"
                    fontSize="small"
                  />
                )}

                {/* Icon dịch vụ */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${
                    isSelected
                      ? "text-[#0d7660] bg-white shadow-inner"
                      : "text-[#0d7660] bg-[#e1ece8]"
                  }`}
                >
                  {service.icon}
                </div>

                <h3 className="font-bold text-[17px] text-gray-900 mb-2">
                  {service.title}
                </h3>

                <p
                  className={`text-[14px] leading-relaxed transition-colors
                  ${isSelected ? "text-gray-800" : "text-gray-500"}`}
                >
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* THANH THAO TÁC PHÍA DƯỚI */}
        <div className="mt-10 bg-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl border border-gray-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-[#e4f7f2] p-3 rounded-full">
              <VerifiedUserOutlinedIcon
                className="text-[#0d7660]"
                sx={{ fontSize: 32 }}
              />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-base">
                Đã chọn {selectedServices.length}/2 dịch vụ
              </h4>
              <p className="text-xs text-gray-500">
                Lựa chọn đa dạng, phục vụ tận tâm từ đội ngũ chuyên nghiệp.
              </p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            className={`text-base font-bold py-4 px-12 rounded-2xl flex items-center gap-3 transition-all w-full md:w-auto justify-center
            ${
              selectedServices.length > 0
                ? "bg-[#0d7660] hover:bg-[#0a6350] text-white shadow-lg active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Tiếp tục
            <ArrowForwardIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}
