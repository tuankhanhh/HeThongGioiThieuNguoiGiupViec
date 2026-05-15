"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { api } from "@/services/api";
import { ROUTES } from "@/lib/routes";

// ---------------- TYPES ----------------
interface ApiService {
  id: string;
  title: string;
  pricePerHour: number;
}

type ServiceDict = Record<string, { name: string; pricePerHour: number }>;

// --- CÁC HÀM TIỆN ÍCH THỜI GIAN ---
const getHourOptions = (dateStr: string) => {
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());
  let startHour = 8;
  const endHour = 20;

  if (isToday(targetDate)) {
    const minAllowedTime = addHours(new Date(), 1);
    startHour = minAllowedTime.getHours();

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

const getMinuteOptions = (dateStr: string, selectedHour: string) => {
  const allMinutes = ["00", "15", "30", "45"];
  const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());

  if (isToday(targetDate)) {
    const minAllowedTime = addHours(new Date(), 1);
    const minHour = minAllowedTime.getHours();
    const minMinute = minAllowedTime.getMinutes();

    const hourNum = parseInt(selectedHour, 10);

    if (hourNum === minHour) {
      return allMinutes.filter((m) => parseInt(m, 10) >= minMinute);
    }
  }

  return allMinutes;
};

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
      h += 1;
      m = "00";
    }

    h = Math.max(8, h);
    if (h > 20) return "20:00";
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

  const validatedSignatures = useRef<Set<string>>(new Set());

  const getSignature = (day: DayOrder) => {
    const serviceIds = day.services
      .map((s) => s.id)
      .sort()
      .join(",");
    const durations = day.services.map((s) => s.duration).join(",");
    return `${day.executionDate}-${day.startTime}-${serviceIds}-${durations}`;
  };

  // ---------------- HÀM KIỂM TRA LỊCH TỐI ƯU ----------------
  const checkScheduleForDay = async (
    day: DayOrder,
  ): Promise<{ isValid: boolean; adjustedDay?: DayOrder }> => {
    const now = new Date();
    const targetDate = parse(day.executionDate, "yyyy-MM-dd", new Date());

    if (isToday(targetDate)) {
      const [hours, minutes] = day.startTime.split(":").map(Number);
      const selectedDateTime = addMinutes(
        addHours(startOfDay(targetDate), hours),
        minutes,
      );
      const minAllowedTime = addHours(now, 1);

      if (isBefore(selectedDateTime, minAllowedTime)) {
        Swal.fire({
          title: "Thời gian quá sát",
          html: `Để chuẩn bị dịch vụ tốt nhất, vui lòng chọn giờ làm việc từ <b style="color:#0d7660;">${format(minAllowedTime, "HH:mm")}</b> trở đi bạn nhé.`,
          icon: "info",
          confirmButtonColor: "#0d7660",
          confirmButtonText: "Tôi hiểu rồi",
        });
        return { isValid: false };
      }
    }

    try {
      Swal.fire({
        title: "Đang tìm kiếm nhân sự...",
        text: "Vui lòng đợi trong giây lát",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const [hours, minutes] = day.startTime.split(":").map(Number);
      const fullDateTime = addMinutes(
        addHours(startOfDay(targetDate), hours),
        minutes,
      );

      // SỬA Payload MỚI NHẤT cho khớp API
      const payload = {
        ngayDat: fullDateTime.toISOString(),
        thoiGianBatDau: `${day.startTime}:00`,
        danhSachDichVu: day.services.map((svc) => ({
          maDichVu: svc.id,
          thoiLuong: svc.duration,
        })),
      };

      const response: any = await api.post(
        "/Booking/CheckFreeSchedule",
        payload,
      );

      const data = response.data || response;
      const isAvailable = data.isAvailable ?? true;
      const message = data.message || "";
      const suggestedTime = data.suggestedTime;

      if (!isAvailable) {
        Swal.close();
        if (suggestedTime) {
          const confirmSuggest = await Swal.fire({
            title: "Gợi ý lịch trống gần nhất 💡",
            html: `Rất tiếc, lúc <b>${day.startTime}</b> nhân viên của chúng tôi đều đang bận phục vụ khách khác.<br/><br/>Tin vui là hệ thống tìm thấy lịch trống lúc <b style="color: #0d7660; font-size: 1.2em;">${suggestedTime}</b>. Bạn có muốn đổi sang giờ này không?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#0d7660",
            cancelButtonColor: "#f3f4f6",
            cancelButtonText:
              "<span style='color: #4b5563; font-weight: 500;'>Để tôi tự chọn giờ khác</span>",
            confirmButtonText: `Vâng, đổi sang ${suggestedTime}`,
            reverseButtons: true,
          });

          if (confirmSuggest.isConfirmed) {
            const adjustedDay = { ...day, startTime: suggestedTime };
            return checkScheduleForDay(adjustedDay);
          } else {
            return { isValid: false };
          }
        } else {
          Swal.fire({
            title: "Đã kín lịch ngày này",
            html: `Không còn nhân viên trống lịch vào ngày <b>${format(targetDate, "dd/MM")}</b>.<br/><br/>Bạn vui lòng nhấp vào lịch bên trái để <b>chọn một ngày khác</b> nhé. Rất mong được phục vụ bạn!`,
            icon: "warning",
            confirmButtonColor: "#0d7660",
            confirmButtonText: "Tôi sẽ chọn ngày khác",
          });
          return { isValid: false };
        }
      }

      if (isAvailable && message.toLowerCase().includes("đội ngũ")) {
        Swal.close();
        const confirmTeam = await Swal.fire({
          title: "Sắp xếp 2 chuyên viên 🤝",
          html: `Để đảm bảo hoàn thành tất cả dịch vụ trong khoảng thời gian bạn yêu cầu, chúng tôi sẽ điều phối <b>2 chuyên viên</b> đến làm song song. Quá trình sẽ diễn ra nhanh chóng hơn!<br/><br/>Bạn đồng ý với phương án này chứ?`,
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#0d7660",
          cancelButtonColor: "#f3f4f6",
          cancelButtonText:
            "<span style='color: #4b5563'>Để tôi chọn lại</span>",
          confirmButtonText: "Tuyệt vời, tôi đồng ý!",
          reverseButtons: true,
        });

        if (!confirmTeam.isConfirmed) {
          return { isValid: false };
        }
      } else {
        Swal.close();
      }

      validatedSignatures.current.add(getSignature(day));
      return { isValid: true, adjustedDay: day };
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra lịch:", error);
      Swal.fire({
        title: "Đường truyền gián đoạn",
        text: "Hệ thống đang gặp chút sự cố khi kiểm tra lịch trống. Bạn thử lại giúp chúng tôi nhé!",
        icon: "error",
        confirmButtonColor: "#0d7660",
        confirmButtonText: "Thử lại",
      });
      return { isValid: false };
    }
  };

  // --- HÀM XÓA DỊCH VỤ ---
  const handleRemoveService = (dateIdx: number, serviceIdx: number) => {
    const updated = [...selectedWorkDays];
    if (updated[dateIdx].services.length <= 1) {
      Swal.fire({
        title: "Cần giữ lại dịch vụ",
        text: "Mỗi ngày làm việc cần có ít nhất 1 dịch vụ. Bạn có thể xóa hẳn ngày này bên cạnh nếu không có nhu cầu.",
        icon: "info",
        confirmButtonColor: "#0d7660",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }
    updated[dateIdx].services.splice(serviceIdx, 1);
    setSelectedWorkDays(updated);
  };

  // --- HÀM THÊM DỊCH VỤ MỚI ---
  const handleAddService = async (dateIdx: number, serviceId: string) => {
    if (!serviceId) return;

    const updated = [...selectedWorkDays];
    const isExist = updated[dateIdx].services.some((s) => s.id === serviceId);
    if (isExist) return;

    const info = servicesDict[serviceId];
    if (info) {
      const testDay: DayOrder = JSON.parse(JSON.stringify(updated[dateIdx]));
      testDay.services.push({
        id: serviceId,
        name: info.name,
        duration: 2,
        price: info.pricePerHour * 2,
      });

      const { isValid, adjustedDay } = await checkScheduleForDay(testDay);
      if (!isValid || !adjustedDay) return;

      updated[dateIdx] = adjustedDay;
      setSelectedWorkDays(updated);
    }
  };

  // --- HÀM CẬP NHẬT THỜI GIAN VÀ THỜI LƯỢNG ---
  const updateStartTime = async (dateIdx: number, newTime: string) => {
    const updated = [...selectedWorkDays];
    const testDay = { ...updated[dateIdx], startTime: newTime };

    const { isValid, adjustedDay } = await checkScheduleForDay(testDay);
    if (!isValid || !adjustedDay) return;

    updated[dateIdx] = adjustedDay;
    setSelectedWorkDays(updated);
  };

  const updateServiceDuration = async (
    dateIdx: number,
    serviceIdx: number,
    duration: number,
  ) => {
    const updated = [...selectedWorkDays];
    const service = updated[dateIdx].services[serviceIdx];
    const pricePerHour = servicesDict[service.id]?.pricePerHour || 0;

    const testDay: DayOrder = JSON.parse(JSON.stringify(updated[dateIdx]));
    testDay.services[serviceIdx] = {
      ...service,
      duration: duration,
      price: pricePerHour * duration,
    };

    const { isValid, adjustedDay } = await checkScheduleForDay(testDay);
    if (!isValid || !adjustedDay) return;

    updated[dateIdx] = adjustedDay;
    setSelectedWorkDays(updated);
  };

  // --- HÀM CHỌN NGÀY TỪ LỊCH ---
  const handleDayClick = async (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;

    const dateStr = format(day, "yyyy-MM-dd");
    const isAlreadySelected = selectedWorkDays.some(
      (d) => d.executionDate === dateStr,
    );

    if (isAlreadySelected) {
      if (selectedWorkDays.length <= 1) {
        Swal.fire({
          title: "Vui lòng chọn ngày",
          text: "Bạn cần chọn ít nhất một ngày trên lịch để chúng tôi có thể sắp xếp người đến phục vụ.",
          icon: "info",
          confirmButtonColor: "#0d7660",
          confirmButtonText: "Đã hiểu",
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
        startTime: getDefaultStartTime(dateStr),
        services: servicesForThisDay,
      };

      const { isValid, adjustedDay } = await checkScheduleForDay(newDay);
      if (!isValid || !adjustedDay) return;

      setSelectedWorkDays((prev) =>
        [...prev, adjustedDay].sort(
          (a, b) =>
            new Date(a.executionDate).getTime() -
            new Date(b.executionDate).getTime(),
        ),
      );
    }
  };

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
          router.push(ROUTES.PUBLIC.LIST_SERVICES);
          return;
        }

        const response = await api.get<ApiService[]>("/dichvu");
        const data = Array.isArray(response)
          ? response
          : (response as any).data || [];

        const dict: ServiceDict = data.reduce(
          (acc: ServiceDict, item: ApiService) => {
            acc[item.id] = {
              name: item.title,
              pricePerHour: item.pricePerHour || 0,
            };
            return acc;
          },
          {} as ServiceDict,
        );
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

        let defaultDate = new Date();
        let defaultDateStr = format(defaultDate, "yyyy-MM-dd");
        if (getHourOptions(defaultDateStr).length === 0) {
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
            executionDate: defaultDateStr,
            startTime: getDefaultStartTime(defaultDateStr),
            services: defaultServices,
          },
        ]);
      } catch (error) {
        Swal.fire({
          title: "Lỗi kết nối",
          text: "Không thể lấy thông tin giá dịch vụ. Bạn vui lòng tải lại trang nhé.",
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

  useEffect(() => {
    if (isInitialized && selectedWorkDays.length > 0) {
      localStorage.setItem(
        "booking_workdays",
        JSON.stringify(selectedWorkDays),
      );
    }
  }, [selectedWorkDays, isInitialized]);

  // ---------------- KHI BẤM TIẾP TỤC ----------------
  const handleContinue = async () => {
    if (selectedWorkDays.length === 0) return;

    Swal.fire({
      title: "Đang tạo lịch đặt...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    for (const day of selectedWorkDays) {
      const targetDate = parse(day.executionDate, "yyyy-MM-dd", new Date());

      // SỬA LẠI PAYLOAD MỚI Ở ĐÂY LUÔN
      const payload = {
        ngayDat: addMinutes(
          addHours(
            startOfDay(targetDate),
            parseInt(day.startTime.split(":")[0]),
          ),
          parseInt(day.startTime.split(":")[1]),
        ).toISOString(),
        thoiGianBatDau: `${day.startTime}:00`,
        danhSachDichVu: day.services.map((svc) => ({
          maDichVu: svc.id,
          thoiLuong: svc.duration,
        })),
      };

      try {
        const response: any = await api.post(
          "/Booking/CheckFreeSchedule",
          payload,
        );
        const data = response.data || response;

        const isAvailable = data.isAvailable ?? true;
        const message = data.message || "";
        const suggestedTime = data.suggestedTime;

        if (!isAvailable) {
          if (suggestedTime) {
            Swal.fire({
              title: "Lịch có chút thay đổi",
              html: `Rất tiếc, khung giờ <b>${day.startTime}</b> ngày <b>${format(targetDate, "dd/MM/yyyy")}</b> vừa có người đặt mất rồi.<br/><br/>Hệ thống tìm thấy slot trống gần nhất vào lúc <b style="color:#0d7660;">${suggestedTime}</b>. Bạn vui lòng nhấp chỉnh lại giờ để chúng tôi được phục vụ bạn nhé!`,
              icon: "info",
              confirmButtonColor: "#0d7660",
              confirmButtonText: "Đã hiểu",
            });
          } else {
            Swal.fire({
              title: "Kín lịch ngày này",
              html: `Khung giờ <b>${day.startTime}</b> ngày <b>${format(targetDate, "dd/MM/yyyy")}</b> hiện không còn nhân viên rảnh.<br/><br/>Bạn vui lòng đổi sang ngày khác để tiếp tục. Xin lỗi vì sự bất tiện này!`,
              icon: "warning",
              confirmButtonColor: "#0d7660",
              confirmButtonText: "Tôi sẽ chọn lại",
            });
          }
          return;
        }

        if (isAvailable && message.toLowerCase().includes("đội ngũ")) {
          const sig = getSignature(day);
          if (!validatedSignatures.current.has(sig)) {
            Swal.close();
            const confirmTeam = await Swal.fire({
              title: "Xác nhận đội ngũ 🤝",
              html: `Ngày <b>${format(targetDate, "dd/MM/yyyy")}</b> cần <b>2 nhân sự</b> thực hiện song song để đảm bảo tốc độ. Hệ thống tiến hành lưu lịch nhé?`,
              icon: "success",
              showCancelButton: true,
              confirmButtonColor: "#0d7660",
              cancelButtonColor: "#f3f4f6",
              cancelButtonText:
                "<span style='color: #4b5563'>Kiểm tra lại</span>",
              confirmButtonText: "Xác nhận",
              reverseButtons: true,
            });
            if (!confirmTeam.isConfirmed) return;
            validatedSignatures.current.add(sig);

            Swal.fire({
              title: "Đang xử lý...",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading(),
            });
          }
        }
      } catch (error) {
        Swal.fire({
          title: "Sự cố mạng",
          text: "Có lỗi khi kết nối tới máy chủ. Vui lòng kiểm tra internet và thử lại.",
          icon: "error",
          confirmButtonColor: "#0d7660",
          confirmButtonText: "Đóng",
        });
        return;
      }
    }

    Swal.close();
    router.push(ROUTES.CUSTOMER.ADDRESS);
  };

  // --- MEMO CHO GIAO DIỆN ---
  const isTodayDisabled = React.useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const hours = getHourOptions(todayStr);
    if (hours.length === 0) return true;
    const lastHour = hours[hours.length - 1];
    const mins = getMinuteOptions(todayStr, lastHour);
    if (mins.length === 0) return true;
    return false;
  }, []);

  const selectedDates = React.useMemo(
    () =>
      selectedWorkDays.map((d) =>
        parse(d.executionDate, "yyyy-MM-dd", new Date()),
      ),
    [selectedWorkDays],
  );

  const disabledDays = React.useMemo(() => {
    const today = startOfDay(new Date());
    const disabledArray: any[] = [
      { before: today },
      { after: addDays(today, 29) },
    ];
    if (isTodayDisabled) disabledArray.push(today);
    if (selectedWorkDays.length <= 1) disabledArray.push(...selectedDates);
    return disabledArray;
  }, [selectedDates, selectedWorkDays.length, isTodayDisabled]);

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
            thay đổi ngày khác trên lịch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* LỊCH CHỌN NGÀY */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                <DayPicker
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(days, selectedDay) =>
                    selectedDay && handleDayClick(selectedDay)
                  }
                  locale={vi}
                  disabled={disabledDays}
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
                  const currentHour = day.startTime.split(":")[0];
                  const currentMinute = day.startTime.split(":")[1] || "00";

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

                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                            Giờ bắt đầu làm việc
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative w-1/2">
                              <select
                                value={currentHour}
                                onChange={(e) => {
                                  const newHour = e.target.value;
                                  const validMins = getMinuteOptions(
                                    day.executionDate,
                                    newHour,
                                  );
                                  const newMinute = validMins.includes(
                                    currentMinute,
                                  )
                                    ? currentMinute
                                    : validMins[0] || "00";
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
                            </div>

                            <span className="font-bold text-gray-400">:</span>

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
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Thời lượng & Dịch vụ thực hiện
                          </label>
                          {day.services.map((svc, sIdx) => (
                            <div
                              key={svc.id}
                              className="flex items-center justify-between gap-4 bg-[#f3f7f6] p-3 rounded-xl border border-white"
                            >
                              <span className="text-sm font-medium text-gray-700 flex-1">
                                {svc.name}
                              </span>
                              <div className="flex items-center gap-3">
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
                                  {[1, 2, 3, 4].map((h) => (
                                    <option key={h} value={h}>
                                      {h} giờ
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveService(dIdx, sIdx)
                                  }
                                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                                >
                                  <DeleteOutlineIcon
                                    sx={{ fontSize: "20px" }}
                                  />
                                </button>
                              </div>
                            </div>
                          ))}

                          <div className="pt-2">
                            <select
                              value=""
                              onChange={(e) =>
                                handleAddService(dIdx, e.target.value)
                              }
                              className="w-full bg-transparent border border-dashed border-[#0d7660] text-[#0d7660] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0d7660] outline-none cursor-pointer appearance-none text-center font-medium hover:bg-[#f3f7f6] transition-colors"
                            >
                              <option value="" disabled hidden>
                                + Thêm dịch vụ khác vào ngày này
                              </option>
                              {Object.entries(servicesDict)
                                .filter(
                                  ([id]) =>
                                    !day.services.some((s) => s.id === id),
                                )
                                .map(([id, info]) => (
                                  <option key={id} value={id}>
                                    {info.name} -{" "}
                                    {info.pricePerHour.toLocaleString("vi-VN")}{" "}
                                    đ/giờ
                                  </option>
                                ))}
                            </select>
                          </div>
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
