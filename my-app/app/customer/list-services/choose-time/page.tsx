"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  isBefore,
  startOfDay,
  addHours,
  addMinutes,
  parse,
  isToday,
  addDays,
} from "date-fns";
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
import { api } from "@/utils/api";

// ---------------- TYPES ----------------
interface ApiService {
  id: string;
  title: string;
  pricePerHour: number;
}

type ServiceDict = Record<string, { name: string; pricePerHour: number }>;

// --- HÀM 1: LẤY DANH SÁCH GIỜ HỢP LỆ ---
const getHourOptions = (dateStr: string) => {
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());
  let startHour = 8;
  const endHour = 20;

  if (isToday(targetDate)) {
    const minAllowedTime = addHours(new Date(), 1);
    startHour = minAllowedTime.getHours();

    // Nếu số phút của thời gian tối thiểu > 45,
    // nghĩa là giờ hiện tại không còn slot nào hợp lệ -> Nhảy sang giờ tiếp theo.
    if (minAllowedTime.getMinutes() > 45) {
      startHour += 1;
    }
  }

  startHour = Math.max(8, startHour);

  const options: string[] = [];
  for (let i = startHour; i <= endHour; i++) {
    options.push(i.toString().padStart(2, "0"));
  }
  return options;
};

// --- HÀM 2: LẤY DANH SÁCH PHÚT HỢP LỆ (Phụ thuộc vào Giờ đang chọn) ---
const getMinuteOptions = (dateStr: string, selectedHour: string) => {
  const allMinutes = ["00", "15", "30", "45"];
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());

  if (isToday(targetDate)) {
    const minAllowedTime = addHours(new Date(), 1);
    const minHour = minAllowedTime.getHours();
    const minMinute = minAllowedTime.getMinutes();

    const hourNum = parseInt(selectedHour, 10);

    // Nếu giờ đang chọn chính là giờ tối thiểu (sát nút nhất)
    // Thì phải lọc bỏ những số phút nhỏ hơn phút tối thiểu
    if (hourNum === minHour) {
      return allMinutes.filter((m) => parseInt(m, 10) >= minMinute);
    }
  }

  // Nếu là các giờ sau đó, hoặc ngày tương lai thì full lựa chọn
  return allMinutes;
};

// --- HÀM 3: LẤY GIỜ MẶC ĐỊNH ---
const getDefaultStartTime = (dateStr: string) => {
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());

  if (isToday(targetDate)) {
    const minAllowedTime = addHours(new Date(), 1);
    let h = minAllowedTime.getHours();
    const minMin = minAllowedTime.getMinutes();
    let m = "00";

    if (minMin <= 0) m = "00";
    else if (minMin <= 15) m = "15";
    else if (minMin <= 30) m = "30";
    else if (minMin <= 45) m = "45";
    else {
      h += 1; // Vượt quá 45 phút thì nhảy sang tròn giờ của giờ tiếp theo
      m = "00";
    }

    h = Math.max(8, h);
    if (h > 20) return "20:00"; // Quá muộn
    return `${h.toString().padStart(2, "0")}:${m}`;
  }

  return "08:00";
};

export default function TimeSelectionContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const [servicesDict, setServicesDict] = useState<ServiceDict>({});
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);
  const [selectedWorkDays, setSelectedWorkDays] = useState<DayOrder[]>([]);

  // 1. KHỞI TẠO VÀ GỌI API
  useEffect(() => {
    const initializeData = async () => {
      try {
        const servicesStr = localStorage.getItem("booking_services");
        const parsedIds: string[] = servicesStr ? JSON.parse(servicesStr) : [];
        setSavedServiceIds(parsedIds);

        if (parsedIds.length === 0) {
          await Swal.fire({
            title: "Chưa chọn dịch vụ",
            text: "Vui lòng chọn loại dịch vụ bạn cần trước khi chọn thời gian.",
            icon: "warning",
            confirmButtonColor: "#0d7660",
          });
          router.push("/customer/list-services");
          return;
        }

        const data = await api.get<ApiService[]>("/dichvu");

        const dict: ServiceDict = data.reduce((acc, item) => {
          acc[item.id] = {
            name: item.title,
            pricePerHour: item.pricePerHour || 0,
          };
          return acc;
        }, {} as ServiceDict);

        setServicesDict(dict);

        const savedWorkdaysStr = localStorage.getItem("booking_workdays");
        if (savedWorkdaysStr) {
          try {
            const parsedWorkdays: DayOrder[] = JSON.parse(savedWorkdaysStr);
            if (Array.isArray(parsedWorkdays) && parsedWorkdays.length > 0) {
              const updatedOldWorkdays = parsedWorkdays.map((day) => ({
                ...day,
                services: day.services.map((svc) => ({
                  ...svc,
                  name: dict[svc.id]?.name || svc.name,
                  price: (dict[svc.id]?.pricePerHour || 0) * svc.duration,
                })),
              }));
              setSelectedWorkDays(updatedOldWorkdays);
              return;
            }
          } catch {
            console.error("Lỗi parse booking_workdays");
          }
        }

        // ====================================================================
        // LOGIC MỚI: TỰ ĐỘNG CHUYỂN NGÀY MAI NẾU HÔM NAY HẾT GIỜ
        // ====================================================================
        let defaultDate = new Date();
        let defaultDateStr = format(defaultDate, "yyyy-MM-dd");

        // Kiểm tra xem hôm nay còn khung giờ nào không
        const availableHoursToday = getHourOptions(defaultDateStr);

        if (availableHoursToday.length === 0) {
          // Nếu hết giờ, tự động đẩy lịch sang ngày mai
          defaultDate = addDays(new Date(), 1);
          defaultDateStr = format(defaultDate, "yyyy-MM-dd");
        }

        const defaultServices = parsedIds.map((id) => {
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
            executionDate: defaultDateStr, // Biến này chứa Hôm nay hoặc Ngày mai
            startTime: getDefaultStartTime(defaultDateStr), // Tự động lấy giờ hợp lệ tương ứng
            services: defaultServices,
          },
        ]);
        // ====================================================================
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
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [router]);

  // 2. ĐỒNG BỘ LOCALSTORAGE
  useEffect(() => {
    if (isInitialized && selectedWorkDays.length > 0) {
      localStorage.setItem(
        "booking_workdays",
        JSON.stringify(selectedWorkDays),
      );
    }
  }, [selectedWorkDays, isInitialized]);

  // ---------------- LOGIC XỬ LÝ UI ----------------

  // Thêm hàm kiểm tra trước khi chuyển trang
  const handleContinue = () => {
    if (selectedWorkDays.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất 1 dịch vụ để tiếp tục.",
        icon: "warning",
        confirmButtonColor: "#0d7660",
      });
      return;
    }

    // --- BẮT ĐẦU: KIỂM TRA LỖI TREO MÁY ---
    let isStaleData = false;
    const now = new Date();

    for (const day of selectedWorkDays) {
      const targetDate = parse(day.executionDate, "yyyy-MM-dd", new Date());

      // Chỉ cần kiểm tra nếu ngày thực hiện là hôm nay
      if (isToday(targetDate)) {
        const [hours, minutes] = day.startTime.split(":").map(Number);
        const selectedDateTime = addMinutes(
          addHours(startOfDay(targetDate), hours),
          minutes,
        );

        const minAllowedTime = addHours(now, 1);

        // Nếu giờ đã chọn hiện tại không còn thỏa mãn cách 1 tiếng nữa
        if (isBefore(selectedDateTime, minAllowedTime)) {
          isStaleData = true;
          break; // Thoát vòng lặp ngay khi phát hiện lỗi
        }
      }
    }

    if (isStaleData) {
      Swal.fire({
        title: "Thời gian đã hết hạn",
        text: "Do bạn đã treo máy một khoảng thời gian, giờ bắt đầu bạn chọn trước đó không còn hợp lệ (phải cách hiện tại ít nhất 1 tiếng). Vui lòng chọn lại giờ mới.",
        icon: "error",
        confirmButtonColor: "#0d7660",
      });

      // Tùy chọn: Tự động reset lại giờ hợp lệ cho ngày hôm nay để khách đỡ mất công
      // const updatedDays = [...selectedWorkDays];
      // ... logic reset ...

      return; // Chặn không cho chuyển trang
    }
    // --- KẾT THÚC KIỂM TRA ---

    // Mọi thứ OK -> Chuyển sang trang nhập địa chỉ
    router.push("/customer/list-services/address");
  };
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
      setSelectedWorkDays((prev) =>
        prev.filter((d) => d.executionDate !== dateStr),
      );
    } else {
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
        startTime: getDefaultStartTime(dateStr), // Lấy giờ mặc định động
        services: servicesForThisDay,
      };

      setSelectedWorkDays((prev) =>
        [...prev, newDay].sort(
          (a, b) =>
            new Date(a.executionDate).getTime() -
            new Date(b.executionDate).getTime(),
        ),
      );
    }
  };

  const updateStartTime = (dateIdx: number, newTime: string) => {
    const updated = [...selectedWorkDays];
    const targetDate = parse(
      updated[dateIdx].executionDate,
      "yyyy-MM-dd",
      new Date(),
    );
    const [hours, minutes] = newTime.split(":").map(Number);

    // Cộng chính xác số Giờ và số Phút vào ngày mục tiêu
    const selectedDateTime = addMinutes(
      addHours(startOfDay(targetDate), hours),
      minutes,
    );

    if (isToday(targetDate)) {
      const minTimeAllowed = addHours(new Date(), 1);

      if (isBefore(selectedDateTime, minTimeAllowed)) {
        Swal.fire({
          title: "Thời gian không hợp lệ",
          text: `Vui lòng chọn thời gian bắt đầu sau ${format(minTimeAllowed, "HH:mm")}.`,
          icon: "error",
          confirmButtonColor: "#0d7660",
        });
        return; // Dừng lại, không cập nhật state để UI tự động reset về giờ hợp lệ trước đó
      }
    }

    updated[dateIdx].startTime = newTime;
    setSelectedWorkDays(updated);
  };

  const updateServiceDuration = (
    dateIdx: number,
    serviceIdx: number,
    duration: number,
  ) => {
    const updated = [...selectedWorkDays];
    const service = updated[dateIdx].services[serviceIdx];
    const pricePerHour = servicesDict[service.id]?.pricePerHour || 0;

    updated[dateIdx].services[serviceIdx] = {
      ...service,
      duration: duration,
      price: pricePerHour * duration,
    };
    setSelectedWorkDays(updated);
  };
  const isTodayDisabled = React.useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const hours = getHourOptions(todayStr); // Hàm này đã có logic (Giờ hiện tại + 1)

    // Nếu mảng giờ trống, hoặc giờ duy nhất còn lại là giờ cuối nhưng không còn phút nào hợp lệ
    if (hours.length === 0) return true;

    // Kiểm tra sâu hơn về phút cho giờ cuối cùng
    const lastHour = hours[hours.length - 1];
    const mins = getMinuteOptions(todayStr, lastHour);
    if (mins.length === 0) return true;

    return false;
  }, []);
  // 1. Dùng useMemo để cố định mảng ngày đã chọn (Tránh lỗi tạo mới liên tục)
  const selectedDates = React.useMemo(() => {
    return selectedWorkDays.map((d) =>
      parse(d.executionDate, "yyyy-MM-dd", new Date()),
    );
  }, [selectedWorkDays]);

  // 2. Dùng useMemo để cố định các điều kiện vô hiệu hóa ngày (chặn click)
  const disabledDays = React.useMemo(() => {
    const today = startOfDay(new Date());
    const disabledArray: any[] = [
      { before: today }, // Chặn ngày quá khứ
      { after: addDays(today, 29) }, // Chặn sau 29 ngày
    ];

    // NẾU HÔM NAY HẾT GIỜ -> CHẶN LUÔN NGÀY HÔM NAY
    if (isTodayDisabled) {
      disabledArray.push(today);
    }

    // Chặn không cho bỏ chọn nếu chỉ còn 1 ngày
    if (selectedWorkDays.length <= 1) {
      disabledArray.push(...selectedDates);
    }

    return disabledArray;
  }, [selectedDates, selectedWorkDays.length, isTodayDisabled]);
  // Thêm logic kiểm tra xem "Hôm nay" có còn giờ không

  // Các mốc phút cho phép
  const minuteOptions = ["00", "15", "30", "45"];

  if (!isInitialized || isLoading) {
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
              {/* LỊCH CHỌN NGÀY */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                <DayPicker
                  mode="multiple"
                  selected={selectedDates} // Dùng biến đã cố định
                  onSelect={(days, selectedDay) => {
                    // THAY ĐỔI QUAN TRỌNG: Dùng onSelect thay cho onDayClick
                    // selectedDay chính là ngày khách hàng vừa click vào lịch
                    if (selectedDay) {
                      handleDayClick(selectedDay);
                    }
                  }}
                  locale={vi}
                  disabled={disabledDays} // Dùng biến đã cố định
                  modifiersStyles={{
                    selected: { fontSize: "inherit" },
                    today: { color: "#0ea5e9" },
                  }}
                />
              </div>

              {/* DANH SÁCH NGÀY ĐÃ CHỌN */}
              <div
                className="flex-1 space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar"
                style={{ scrollbarGutter: "stable" }}
              >
                {selectedWorkDays.map((day, dIdx) => {
                  // Tách Giờ và Phút từ chuỗi startTime đang lưu
                  const currentHour = day.startTime.split(":")[0];
                  const currentMinute = day.startTime.split(":")[1] || "00";

                  // Lấy danh sách giờ và phút ĐỘNG
                  const availableHours = getHourOptions(day.executionDate);
                  const availableMinutes = getMinuteOptions(
                    day.executionDate,
                    currentHour,
                  );

                  return (
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
                              parse(
                                day.executionDate,
                                "yyyy-MM-dd",
                                new Date(),
                              ),
                            )
                          }
                          className={`${selectedWorkDays.length <= 1 ? "opacity-20 cursor-not-allowed" : "text-red-400 hover:text-red-600"} transition-colors`}
                          disabled={selectedWorkDays.length <= 1}
                        >
                          <DeleteOutlineIcon
                            sx={{ cursor: "pointer", fontSize: "24px" }}
                          />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* PHẦN CHỌN GIỜ & PHÚT ĐÃ ĐƯỢC CHIA LÀM HAI COMBOBOX */}
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                            Giờ bắt đầu làm việc
                          </label>
                          <div className="flex items-center gap-2">
                            {/* COMBOBOX GIỜ */}
                            <div className="relative w-1/2">
                              <select
                                value={currentHour}
                                onChange={(e) => {
                                  const newHour = e.target.value;
                                  // Khi đổi Giờ, kiểm tra xem Phút hiện tại còn hợp lệ không
                                  const validMinutesForNewHour =
                                    getMinuteOptions(
                                      day.executionDate,
                                      newHour,
                                    );
                                  let newMinute = currentMinute;

                                  // Nếu phút hiện tại không có trong danh sách hợp lệ của giờ mới -> Tự động chuyển về phút hợp lệ đầu tiên
                                  if (
                                    !validMinutesForNewHour.includes(
                                      currentMinute,
                                    )
                                  ) {
                                    newMinute =
                                      validMinutesForNewHour[0] || "00";
                                  }

                                  updateStartTime(
                                    dIdx,
                                    `${newHour}:${newMinute}`,
                                  );
                                }}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0d7660] outline-none cursor-pointer appearance-none"
                              >
                                {availableHours.map((h) => (
                                  <option key={h} value={h}>
                                    {h} giờ
                                  </option>
                                ))}
                              </select>
                              {/* SVG mũi tên... */}
                            </div>

                            <span className="font-bold text-gray-400">:</span>

                            {/* COMBOBOX PHÚT */}
                            <div className="relative w-1/2">
                              <select
                                value={currentMinute}
                                onChange={(e) =>
                                  updateStartTime(
                                    dIdx,
                                    `${currentHour}:${e.target.value}`,
                                  )
                                }
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0d7660] outline-none cursor-pointer appearance-none"
                              >
                                {availableMinutes.map((m) => (
                                  <option key={m} value={m}>
                                    {m} phút
                                  </option>
                                ))}
                              </select>
                              {/* SVG mũi tên... */}
                            </div>
                          </div>
                        </div>

                        {/* CHỌN THỜI LƯỢNG (GIỮ NGUYÊN) */}
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
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <OrderSummary orders={selectedWorkDays} onNext={handleContinue} />
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
