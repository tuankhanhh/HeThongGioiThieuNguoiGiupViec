"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// MUI Icons
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import Swal from "sweetalert2";
import { ROUTES } from "@/lib/routes";

// ---------------- TYPES ----------------
export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  popular: boolean;
  features: string[];
}

interface Props {
  services: Service[];
}

// ---------------- CLIENT COMPONENT ----------------
export default function ServiceSelectionClient({ services }: Props) {
  const router = useRouter();

  // 1. Khởi tạo mảng rỗng để ĐỒNG BỘ hoàn toàn với Server (Tránh lỗi Hydration)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // 2. Thêm cờ đánh dấu đã load xong dữ liệu từ localStorage chưa
  // Cờ này giúp useEffect ghi (write) không vô tình ghi đè mảng rỗng lên localStorage lúc mới vào trang
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. ĐỌC TỪ LOCALSTORAGE (Chạy sau khi render lần đầu)
  useEffect(() => {
    const saved = localStorage.getItem("booking_services");
    if (saved) {
      try {
        //eslint-disable-next-line
        setSelectedServices(JSON.parse(saved));
      } catch {
        setSelectedServices([]);
      }
    }
    // Đánh dấu là đã lấy dữ liệu ban đầu xong
    setIsLoaded(true);
  }, []);

  // 4. GHI VÀO LOCALSTORAGE
  useEffect(() => {
    // Chỉ ghi đè localStorage khi đã hoàn tất việc load lần đầu
    // Tránh tình trạng mới vào trang selectedServices = [] bị ghi thẳng xuống bộ nhớ
    if (isLoaded) {
      localStorage.setItem(
        "booking_services",
        JSON.stringify(selectedServices),
      );
    }
  }, [selectedServices, isLoaded]);

  // 5. XỬ LÝ CHỌN DỊCH VỤ
  const handleSelect = (id: string) => {
    setSelectedServices((prev) => {
      localStorage.removeItem("booking_workdays");

      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  // 6. CHUYỂN TRANG
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      router.push(ROUTES.CUSTOMER.CHOOSE_TIME);
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
        <BookingStepper activeStep={0} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Chào mừng bạn trở lại,
          </h1>
          <p className="text-gray-600 text-[15px]">
            Hãy chọn các loại hình dịch vụ bạn cần. Chúng tôi sẽ sắp xếp nhân sự
            phù hợp nhất cho yêu cầu của bạn.
          </p>
        </div>

        {/* GRID DỊCH VỤ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isSelected = selectedServices.includes(service.id);

            return (
              <div
                key={service.id}
                onClick={() => handleSelect(service.id)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border
                ${
                  isSelected
                    ? "bg-[#9ff1d7] border-[#0d7660] shadow-md transform scale-[1.02]"
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

                {/* Badge Phổ biến */}
                {service.popular && (
                  <div className="absolute top-4 left-4 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                    Hot
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors overflow-hidden mt-6
                  ${isSelected ? "bg-white shadow-inner" : "bg-[#e1ece8]"}`}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MiscellaneousServicesIcon className="text-[#0d7660]" />
                  )}
                </div>

                {/* Thông tin dịch vụ */}
                <h3 className="font-bold text-[17px] text-gray-900 mb-1">
                  {service.title}
                </h3>
                <p className="text-[#0d7660] font-semibold text-sm mb-2">
                  {service.price}
                </p>
                <p
                  className={`text-[14px] leading-relaxed transition-colors line-clamp-3
                  ${isSelected ? "text-gray-800" : "text-gray-500"}`}
                >
                  {service.description}
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
                Đã chọn {selectedServices.length} dịch vụ
              </h4>
              <p className="text-xs text-gray-500">
                Lựa chọn đa dạng, phục vụ tận tâm từ đội ngũ chuyên nghiệp.
              </p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            className={`text-base font-bold py-4 px-12 rounded-2xl flex items-center gap-3 transition-all w-full md:w-auto justify-center cursor-pointer
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
