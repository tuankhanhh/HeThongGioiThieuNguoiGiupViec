"use client";

import React, { useState, useEffect } from "react";
import { format, isBefore, startOfDay, addHours, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useRouter } from "next/navigation";

// MUI Icons
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";
import Swal from "sweetalert2";

// ---------------- TYPES ----------------
interface ApiService {
  id: string;
  title: string;
  pricePerHour: number; // Backend phải trả về trường này là số (ví dụ: 100000)
}

export default function TimeSelectionContent() {
  const router = useRouter();

  // Kiểm tra mounted để tránh lỗi hydration
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State lưu trữ dữ liệu dịch vụ từ API (thay thế MOCK_SERVICES_DB)
  const [servicesDict, setServicesDict] = useState<
    Record<string, { name: string; pricePerHour: number }>
  >({});

  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);
  const [selectedWorkDays, setSelectedWorkDays] = useState<DayOrder[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // Lấy ID dịch vụ đã chọn từ localStorage
    const services = localStorage.getItem("booking_services");
    const parsedIds = services ? JSON.parse(services) : [];
    setSavedServiceIds(parsedIds);

    // Nếu chưa chọn gì ở trang 1 thì báo lỗi và quay lại
    if (parsedIds.length === 0) {
      Swal.fire({
        title: "Chưa chọn dịch vụ",
        text: "Vui lòng chọn loại dịch vụ bạn cần trước khi chọn thời gian.",
        icon: "warning",
        confirmButtonColor: "#0d7660",
      }).then(() => {
        router.push("/customer/list-services");
      });
      return;
    }

    // GỌI API LẤY DANH SÁCH DỊCH VỤ ĐỂ LẤY GIÁ
    const fetchServices = async () => {
      try {
        // THAY URL BẰNG API THẬT CỦA BẠN
        const response = await fetch("https://localhost:7095/api/dichvu");
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");

        const data: ApiService[] = await response.json();

        // Chuyển array từ API thành Dictionary để dễ tra cứu giống MOCK_SERVICES_DB cũ
        const dict: Record<string, { name: string; pricePerHour: number }> = {};
        data.forEach((item) => {
          dict[item.id] = {
            name: item.title,
            pricePerHour: item.pricePerHour || 0, // Backup = 0 nếu API chưa có
          };
        });

        setServicesDict(dict);

        // SAU KHI CÓ DATA TỪ API, KHỞI TẠO LỊCH LÀM VIỆC
        const savedWorkdays = localStorage.getItem("booking_workdays");
        if (savedWorkdays) {
          try {
            const parsedWorkdays = JSON.parse(savedWorkdays);
            if (Array.isArray(parsedWorkdays) && parsedWorkdays.length > 0) {
              // (Tùy chọn) Có thể map lại để cập nhật giá mới nhất từ API vào giỏ hàng cũ
              const updatedOldWorkdays = parsedWorkdays.map((day) => ({
                ...day,
                services: day.services.map((svc: any) => ({
                  ...svc,
                  name: dict[svc.id]?.name || svc.name,
                  price: (dict[svc.id]?.pricePerHour || 0) * svc.duration,
                })),
              }));
              setSelectedWorkDays(updatedOldWorkdays);
              setIsLoading(false);
              return;
            }
          } catch {
            /* ignore */
          }
        }

        // NẾU CHƯA CÓ LỊCH LƯU, TẠO MẶC ĐỊNH NGÀY HÔM NAY
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const defaultServices = parsedIds.map((id: string) => {
          const info = dict[id];
          return {
            id,
            name: info?.name || "Dịch vụ",
            duration: 2,
            price: (info?.pricePerHour || 0) * 2,
          };
        });

        setSelectedWorkDays([
          {
            executionDate: todayStr,
            startTime: "08:00",
            services: defaultServices,
          },
        ]);
      } catch (error) {
        console.error("Lỗi fetch services:", error);
        Swal.fire({
          title: "Lỗi kết nối",
          text: "Không thể lấy thông tin giá dịch vụ. Vui lòng thử lại sau.",
          icon: "error",
          confirmButtonColor: "#0d7660",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ localStorage khi thay đổi lịch làm việc
  useEffect(() => {
    if (isMounted && selectedWorkDays.length > 0) {
      localStorage.setItem(
        "booking_workdays",
        JSON.stringify(selectedWorkDays),
      );
    }
  }, [selectedWorkDays, isMounted]);

  // ---------------- LOGIC XỬ LÝ ----------------
  const handleDayClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;

    const dateStr = format(day, "yyyy-MM-dd");
    const isAlreadySelected = selectedWorkDays.some(
      (d) => d.executionDate === dateStr,
    );

    if (isAlreadySelected) {
      if (selectedWorkDays.length <= 1) {
        Swal.fire({
          title: "Thông báo",
          text: "Bạn cần chọn ít nhất một ngày để thực hiện dịch vụ.",
          icon: "info",
          confirmButtonColor: "#0d7660",
        });
        return;
      }
      setSelectedWorkDays(
        selectedWorkDays.filter((d) => d.executionDate !== dateStr),
      );
    } else {
      // Dùng servicesDict (từ API) thay vì MOCK_SERVICES_DB
      const servicesForThisDay = savedServiceIds.map((id) => {
        const info = servicesDict[id];
        return {
          id,
          name: info?.name || "Dịch vụ",
          duration: 2,
          price: (info?.pricePerHour || 0) * 2,
        };
      });

      const newDay: DayOrder = {
        executionDate: dateStr,
        startTime: "08:00",
        services: servicesForThisDay,
      };

      setSelectedWorkDays(
        [...selectedWorkDays, newDay].sort(
          (a, b) =>
            new Date(a.executionDate).getTime() -
            new Date(b.executionDate).getTime(),
        ),
      );
    }
  };

  const updateStartTime = (dateIdx: number, time: string) => {
    const updated = [...selectedWorkDays];
    const targetDate = parse(
      updated[dateIdx].executionDate,
      "yyyy-MM-dd",
      new Date(),
    );
    const [hours] = time.split(":").map(Number);
    const selectedDateTime = addHours(startOfDay(targetDate), hours);
    const minTimeAllowed = addHours(new Date(), 5);

    if (isBefore(selectedDateTime, minTimeAllowed)) {
      Swal.fire({
        title: "Thời gian không hợp lệ",
        text: "Vui lòng chọn thời gian thực hiện cách hiện tại ít nhất 5 tiếng.",
        icon: "error",
        confirmButtonColor: "#0d7660",
      });
      return;
    }

    updated[dateIdx].startTime = time;
    setSelectedWorkDays(updated);
  };

  const updateServiceDuration = (
    dateIdx: number,
    serviceIdx: number,
    duration: number,
  ) => {
    const updated = [...selectedWorkDays];
    const service = updated[dateIdx].services[serviceIdx];

    // Dùng servicesDict (từ API) thay vì MOCK_SERVICES_DB
    const pricePerHour = servicesDict[service.id]?.pricePerHour || 0;

    updated[dateIdx].services[serviceIdx] = {
      ...service,
      duration: duration,
      price: pricePerHour * duration,
    };
    setSelectedWorkDays(updated);
  };

  const timeOptions = Array.from(
    { length: 15 },
    (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`,
  );

  if (!isMounted) return null;

  // Hiển thị trạng thái Loading trong lúc đợi API trả về giá tiền
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fbfb] flex flex-col items-center py-20">
        <BookingStepper activeStep={1} />
        <div className="animate-spin mt-20 rounded-full h-12 w-12 border-b-2 border-[#0d7660]"></div>
        <p className="mt-4 text-gray-500">Đang tải cấu hình dịch vụ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 font-sans text-gray-800">
      <BookingStepper activeStep={1} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thiết lập lịch làm việc
          </h1>
          <p className="text-gray-500">
            Hệ thống đã tự động chọn ngày hôm nay. Bạn có thể chọn thêm hoặc
            thay đổi ngày khác.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                <DayPicker
                  mode="multiple"
                  selected={selectedWorkDays
                    .filter((d) => d?.executionDate)
                    .map((d) =>
                      parse(d.executionDate, "yyyy-MM-dd", new Date()),
                    )}
                  onDayClick={handleDayClick}
                  locale={vi}
                  disabled={[
                    { before: new Date() },
                    ...(selectedWorkDays.length <= 1
                      ? selectedWorkDays.map((d) =>
                          parse(d.executionDate, "yyyy-MM-dd", new Date()),
                        )
                      : []),
                  ]}
                  modifiersStyles={{
                    selected: { fontSize: "inherit" },
                    today: { color: "#0ea5e9" },
                  }}
                />
              </div>

              <div
                className="flex-1 space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar"
                style={{ scrollbarGutter: "stable" }}
              >
                {selectedWorkDays.map((day, dIdx) => (
                  <div
                    key={day.executionDate}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <span className="font-bold text-[#0d7660]">
                        {format(
                          parse(day.executionDate, "yyyy-MM-dd", new Date()),
                          "eeee, dd/MM",
                          { locale: vi },
                        )}
                      </span>

                      <button
                        onClick={() =>
                          handleDayClick(
                            parse(day.executionDate, "yyyy-MM-dd", new Date()),
                          )
                        }
                        className={`${
                          selectedWorkDays.length <= 1
                            ? "opacity-20 cursor-not-allowed"
                            : "text-red-400 hover:text-red-600"
                        } transition-colors`}
                        disabled={selectedWorkDays.length <= 1}
                      >
                        <DeleteOutlineIcon
                          sx={{ cursor: "pointer", fontSize: "24px" }}
                        />
                      </button>
                    </div>

                    <div className="space-y-4 ">
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Giờ bắt đầu làm việc
                        </label>
                        <select
                          value={day.startTime}
                          onChange={(e) =>
                            updateStartTime(dIdx, e.target.value)
                          }
                          className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0d7660] outline-none cursor-pointer"
                        >
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Thời lượng thực hiện
                        </label>
                        {day.services.map((svc, sIdx) => (
                          <div
                            key={svc.id}
                            className="flex items-center justify-between gap-4 bg-[#f3f7f6] p-3 rounded-xl border border-white"
                          >
                            <span className="text-sm font-medium text-gray-700 ">
                              {svc.name}
                            </span>
                            <select
                              value={svc.duration}
                              onChange={(e) =>
                                updateServiceDuration(
                                  dIdx,
                                  sIdx,
                                  Number(e.target.value),
                                )
                              }
                              className="bg-white border border-gray-200 rounded-lg text-sm p-1 px-2 outline-none focus:border-[#0d7660] cursor-pointer"
                            >
                              {[2, 3, 4, 5, 6].map((h) => (
                                <option key={h} value={h}>
                                  {h} giờ
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <OrderSummary
              orders={selectedWorkDays}
              onNext={() => router.push("/customer/list-services/address")}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e1ece8;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
