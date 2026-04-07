"use client";
import { useState } from "react";

import { Button } from "@mui/material";

// Import Icons
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ElderlyIcon from "@mui/icons-material/Elderly";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ServiceCard from "@/components/danhsachdichvu/ServiceCard";
import CustomStepper from "@/components/datdichvu/chondichvu/app.process";

// Dữ liệu tĩnh (Có thể tách ra file constants riêng)
const servicesData = [
  {
    id: "don-dep",
    title: "Dọn dẹp",
    description:
      "Vệ sinh nhà cửa, quét dọn và sắp xếp không gian sống ngăn nắp.",
    icon: <CleaningServicesIcon />,
  },
  {
    id: "nau-an",
    title: "Nấu ăn",
    description: "Chuẩn bị bữa cơm gia đình ấm cúng với thực đơn theo yêu cầu.",
    icon: <RestaurantIcon />,
  },
  {
    id: "cham-soc-tre",
    title: "Chăm sóc trẻ",
    description: "Giữ trẻ, chơi cùng bé và hỗ trợ các hoạt động giáo dục sớm.",
    icon: <ChildCareIcon />,
  },
  {
    id: "cham-soc-nguoi-gia",
    title: "Chăm sóc người già",
    description:
      "Hỗ trợ sinh hoạt, bầu bạn và theo dõi sức khỏe cho người cao tuổi.",
    icon: <ElderlyIcon />,
  },
  {
    id: "ket-hop",
    title: "Kết hợp",
    description:
      "Gói dịch vụ đa năng tùy chỉnh theo nhu cầu riêng biệt của gia đình.",
    icon: <AllInclusiveIcon />,
  },
  {
    id: "goi-uu-dai",
    title: "Gói Ưu Đãi",
    description: "Giảm ngay 20% cho khách hàng mới khi đăng ký định kỳ.",
    icon: <AutoAwesomeIcon />,
    isHighlight: true,
  },
];

export default function ServiceSelectionPage() {
  const [selectedService, setSelectedService] = useState<string>("don-dep");

  return (
    <div className="min-h-screen bg-[#F8FAFA] font-sans pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stepper Component */}
        <CustomStepper activeStep={0} />

        {/* Tiêu đề */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Chào mừng bạn trở lại,
          </h1>
          <p className="text-gray-600 max-w-2xl text-base">
            Hãy chọn loại hình dịch vụ bạn cần hôm nay. Chúng tôi cam kết mang
            lại sự tận tâm và chất lượng tốt nhất.
          </p>
        </div>

        {/* Grid Danh sách Dịch vụ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {servicesData.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              isHighlight={service.isHighlight}
              isSelected={selectedService === service.id}
              onClick={() => setSelectedService(service.id)}
            />
          ))}
        </div>

        {/* Footer Area / Nút Hành động */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VerifiedUserOutlinedIcon className="text-[#006A5B]" />
            <div>
              <p className="font-bold text-gray-900 text-sm">
                An tâm tuyệt đối
              </p>
              <p className="text-xs text-gray-500">
                Nhân viên đã được xác minh hồ sơ & kỹ năng.
              </p>
            </div>
          </div>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: "#006A5B",
              textTransform: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#00574a",
                boxShadow: "none",
              },
            }}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}
