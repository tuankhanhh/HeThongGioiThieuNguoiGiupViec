"use client";

import React, { useState, useEffect } from "react";
import { format, isBefore, startOfDay, addHours, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useRouter } from "next/navigation";

// MUI Icons
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import BookingStepper from "@/components/componentsCustomer/BookingStepper";
import OrderSummary, {
  DayOrder,
} from "@/components/componentsCustomer/OrderSumary";
import Swal from "sweetalert2";

// ---------------- DATA MAPPING ----------------
const MOCK_SERVICES_DB: Record<string, { name: string; pricePerHour: number }> =
  {
    cleaning: { name: "Dọn dẹp nhà cửa", pricePerHour: 100000 },
    cooking: { name: "Nấu ăn tại gia", pricePerHour: 120000 },
    childcare: { name: "Chăm sóc trẻ em", pricePerHour: 150000 },
    eldercare: { name: "Chăm sóc người già", pricePerHour: 150000 },
    "sofa-cleaning": { name: "Giặt sofa & nệm", pricePerHour: 200000 },
    combo: { name: "Tổng vệ sinh", pricePerHour: 250000 },
  };

export default function TimeSelectionContent() {
  const router = useRouter();

  // ✅ FIX: Thêm state để kiểm tra mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // ✅ 1. Lấy danh sách ID dịch vụ đã chọn từ trang 1
  const [savedServiceIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const services = localStorage.getItem("booking_services");
      try {
        const parsed = services ? JSON.parse(services) : [];
        return parsed.length > 0 ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // ✅ 2. Quản lý danh sách các ngày làm việc (Mặc định chọn ngày hôm nay)
  const [selectedWorkDays, setSelectedWorkDays] = useState<DayOrder[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("booking_workdays");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          /* ignore */
        }
      }

      const todayStr = format(new Date(), "yyyy-MM-dd");
      const rawServices = localStorage.getItem("booking_services");
      const currentIds = rawServices ? JSON.parse(rawServices) : [];

      const defaultServices = currentIds.map((id: string) => {
        const info = MOCK_SERVICES_DB[id];
        return {
          id,
          name: info?.name || "Dịch vụ",
          duration: 2,
          price: (info?.pricePerHour || 0) * 2,
        };
      });

      return [
        {
          executionDate: todayStr,
          startTime: "08:00",
          services: defaultServices,
        },
      ];
    }
    return [];
  });

  // ✅ 3. Kiểm tra nếu chưa chọn dịch vụ ở trang 1 thì yêu cầu quay lại
  useEffect(() => {
    if (isMounted && savedServiceIds.length === 0) {
      Swal.fire({
        title: "Chưa chọn dịch vụ",
        text: "Vui lòng chọn loại dịch vụ bạn cần trước khi chọn thời gian.",
        icon: "warning",
        confirmButtonColor: "#0d7660",
      }).then(() => {
        router.push("/customer/list-services");
      });
    }
  }, [savedServiceIds, router, isMounted]);

  // ✅ 4. Đồng bộ localStorage khi thay đổi lịch làm việc
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "booking_workdays",
        JSON.stringify(selectedWorkDays),
      );
    }
  }, [selectedWorkDays, isMounted]);

  // ---------------- LOGIC XỬ LÝ ----------------

  const handleDayClick = (day: Date) => {
    // Chặn chọn các ngày trong quá khứ
    if (isBefore(day, startOfDay(new Date()))) return;

    const dateStr = format(day, "yyyy-MM-dd");
    const isAlreadySelected = selectedWorkDays.some(
      (d) => d.executionDate === dateStr,
    );

    if (isAlreadySelected) {
      // Nếu người dùng click vào ngày đã chọn (có ý định bỏ chọn)
      // KIỂM TRA: Nếu chỉ còn 1 ngày duy nhất thì KHÔNG cho phép xóa
      if (selectedWorkDays.length <= 1) {
        Swal.fire({
          title: "Thông báo",
          text: "Bạn cần chọn ít nhất một ngày để thực hiện dịch vụ.",
          icon: "info",
          confirmButtonColor: "#0d7660",
        });
        return; // Dừng hàm tại đây, không cập nhật state
      }

      // Nếu có nhiều hơn 1 ngày, tiến hành lọc bỏ ngày vừa click
      setSelectedWorkDays(
        selectedWorkDays.filter((d) => d.executionDate !== dateStr),
      );
    } else {
      // Logic thêm ngày mới (giữ nguyên như cũ của bạn)
      const servicesForThisDay = savedServiceIds.map((id) => {
        const info = MOCK_SERVICES_DB[id];
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
    const pricePerHour = MOCK_SERVICES_DB[service.id]?.pricePerHour || 0;

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

  // ✅ FIX: Trả về null hoặc skeleton nếu chưa mount để tránh lệch HTML
  if (!isMounted) return null;

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
                  // CẬP NHẬT Ở ĐÂY 👇
                  disabled={[
                    { before: new Date() }, // Chặn ngày quá khứ
                    ...(selectedWorkDays.length <= 1
                      ? selectedWorkDays.map((d) =>
                          parse(d.executionDate, "yyyy-MM-dd", new Date()),
                        )
                      : []), // Nếu còn 1 ngày, add ngày đó vào danh sách disabled
                  ]}
                  modifiersStyles={{
                    selected: {
                      backgroundColor: "#0d7660",
                      color: "white",
                      borderRadius: "50%",
                    },
                  }}
                />
              </div>

              <div className="flex-1 space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
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
                        // Thêm class opacity hoặc ẩn đi nếu chỉ còn 1 ngày
                        className={`${
                          selectedWorkDays.length <= 1
                            ? "opacity-20 cursor-not-allowed"
                            : "text-red-400 hover:text-red-600"
                        } transition-colors`}
                        disabled={selectedWorkDays.length <= 1} // Disable click trực tiếp trên button
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Giờ bắt đầu làm việc
                        </label>
                        <select
                          value={day.startTime}
                          onChange={(e) =>
                            updateStartTime(dIdx, e.target.value)
                          }
                          className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0d7660] outline-none"
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
                            <span className="text-sm font-medium text-gray-700">
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
                              className="bg-white border border-gray-200 rounded-lg text-sm p-1 px-2 outline-none focus:border-[#0d7660]"
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
