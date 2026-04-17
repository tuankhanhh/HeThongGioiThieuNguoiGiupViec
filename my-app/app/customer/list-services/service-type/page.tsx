"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// MUI Icons (Giữ lại vài icon làm fallback nếu API không có hình)
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import Swal from "sweetalert2";

// ---------------- TYPES ----------------
// Khai báo kiểu dữ liệu khớp với JSON từ Backend trả về
interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  popular: boolean;
  features: string[];
}

// ---------------- COMPONENT ----------------
export default function ServiceSelection() {
  const router = useRouter();

  // State lưu dữ liệu từ API
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo state trực tiếp từ localStorage để giữ trạng thái khi back/forward
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
    return [];
  });

  // Lưu vào localStorage khi có sự thay đổi
  useEffect(() => {
    localStorage.setItem("booking_services", JSON.stringify(selectedServices));
  }, [selectedServices]);

  // ---------------- CALL API ----------------
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("https://localhost:7095/api/dichvu");

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu dịch vụ");
        }

        const data: Service[] = await response.json();
        setServicesData(data);
      } catch (error) {
        console.error("Lỗi fetch services:", error);
        Swal.fire({
          title: "Lỗi kết nối",
          text: "Không thể tải danh sách dịch vụ lúc này. Vui lòng thử lại sau.",
          icon: "error",
          confirmButtonColor: "#0d7660",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ---------------- SELECT SERVICE ----------------
  const handleSelect = (id: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        localStorage.removeItem("booking_workdays");
        return prev.filter((item) => item !== id);
      }

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

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7660]"></div>
          </div>
        ) : (
          /* GRID DỊCH VỤ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicesData.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const isLimitReached =
                !isSelected && selectedServices.length >= 2;

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

                  {/* Badge Phổ biến (Dựa vào API) */}
                  {service.popular && (
                    <div className="absolute top-4 left-4 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                      Hot
                    </div>
                  )}

                  {/* Hình ảnh từ API (hoặc Icon fallback) */}
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

                  <h3 className="font-bold text-[17px] text-gray-900 mb-1">
                    {service.title}
                  </h3>

                  {/* Giá tiền từ API */}
                  <p className="text-[#0d7660] font-semibold text-sm mb-2">
                    {service.price}
                  </p>

                  <p
                    className={`text-[14px] leading-relaxed transition-colors line-clamp-3
                    ${isSelected ? "text-gray-800" : "text-gray-500"}`}
                  >
                    {service.description}{" "}
                    {/* Đã sửa từ desc thành description theo API */}
                  </p>
                </div>
              );
            })}
          </div>
        )}

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
