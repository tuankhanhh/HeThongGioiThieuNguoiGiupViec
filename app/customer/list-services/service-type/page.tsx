"use client";

import React, { useState } from "react";

// Import MUI Icons
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ElderlyIcon from "@mui/icons-material/Elderly";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ChairIcon from "@mui/icons-material/Chair";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import BookingStepper from "@/components/BookingStepper";

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
    desc: "Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.",
    icon: <ChairIcon />,
  },
  {
    id: "combo",
    title: "Kết hợp",
    desc: "Gói dịch vụ đa năng tùy chỉnh theo nhu cầu riêng biệt của gia đình.",
    icon: <AllInclusiveIcon />,
  },
];

export default function ServiceSelection() {
  const [selectedService, setSelectedService] = useState<string>("cleaning");

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-12 px-4 font-sans flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Stepper (MUI) */}
        <BookingStepper activeStep={0} />

        {/* Tiêu đề */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Chào mừng bạn trở lại,
          </h1>
          <p className="text-gray-600 text-[15px]">
            Hãy chọn loại hình dịch vụ bạn cần hôm nay. Chúng tôi cam kết mang
            lại sự tận tâm và chất lượng tốt nhất.
          </p>
        </div>

        {/* Grid Danh sách Dịch vụ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesData.map((service) => {
            const isSelected = selectedService === service.id;
            return (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 ease-in-out ${
                  isSelected
                    ? "bg-[#9ff1d7] border border-[#0d7660] shadow-sm"
                    : "bg-[#f3f7f6] border border-transparent hover:bg-gray-100"
                }`}
              >
                {/* Dấu tích góc phải cho thẻ được chọn */}
                {isSelected && (
                  <CheckCircleIcon
                    className="absolute top-4 right-4 text-[#0d7660]"
                    fontSize="small"
                  />
                )}

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                    isSelected
                      ? "text-[#0d7660]"
                      : "text-[#0d7660] bg-[#e1ece8]"
                  }`}
                >
                  {service.icon}
                </div>
                <h3 className="font-bold text-[17px] text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p
                  className={`text-[14px] leading-relaxed ${
                    isSelected ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-10 bg-white rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <VerifiedUserOutlinedIcon
              className="text-[#0d7660]"
              sx={{ fontSize: 32 }}
            />
            <div>
              <h4 className="font-bold text-gray-800 text-sm">
                An tâm tuyệt đối
              </h4>
              <p className="text-xs text-gray-500">
                Nhân viên đã được xác minh hồ sơ & kỹ năng.
              </p>
            </div>
          </div>

          <Link
            href="/customer/list-services/choose-time"
            className="bg-[#0d7660] hover:bg-[#0a6350] text-white text-sm font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
          >
            Tiếp tục <ArrowForwardIcon fontSize="small" />
          </Link>
        </div>
      </div>
    </div>
  );
}
