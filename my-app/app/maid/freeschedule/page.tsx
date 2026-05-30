"use client";

import React, { useState, useEffect } from "react";
import { vi } from "date-fns/locale";
import { format, addDays, startOfDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Card,
  Container,
  IconButton,
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import api from "@/services/api";
import NotificationToast from "@/components/NotificationToast";

interface TimeRange {
  start: string;
  end: string;
  isSaved?: boolean;
}

interface ServerSchedule {
  maLichRanh: string;
  ngay: string;
  chiTietCaLam: {
    maCaLamViec: string;
    gioBatDau: string;
    gioKetThuc: string;
    thoiGianTao: string;
    daCoKhachDat?: boolean;
  }[];
}

export default function HelperAvailability() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [dateSlots, setDateSlots] = useState<Record<string, TimeRange[]>>({});
  const [existingSchedule, setExistingSchedule] = useState<
    Record<string, ServerSchedule>
  >({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [checkingSlotId, setCheckingSlotId] = useState<string | null>(null);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [cancelConfirm, setCancelConfirm] = useState({
    open: false,
    maLichRanh: "",
    maCaLamViec: "",
    isDeleting: false,
  });

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setIsMounted(true);
    fetchMySchedule();
  }, []);

  // Hàm kiểm tra xem ca làm việc có được phép hủy không
  const canDeleteSlot = (slot: any) => {
    // 1. Khách đã đặt -> Ẩn nút ngay lập tức
    if (slot.daCoKhachDat) return false;

    // 2. Kiểm tra quy định 15 phút
    if (!slot.thoiGianTao) return false;
    const createTime = new Date(slot.thoiGianTao).getTime();
    const currentTime = new Date().getTime();
    const diffInMinutes = (currentTime - createTime) / (1000 * 60);

    return diffInMinutes <= 15;
  };

  // Hàm tiện ích chuyển đổi giờ "HH:mm:ss" sang phút
  const serverTimeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const today = startOfDay(new Date());
  const minDate = addDays(today, 3);
  const maxDate = addDays(minDate, 30);

  // THÊM DÒNG NÀY: Lọc ra các ngày từ hôm nay trở đi
  const futureScheduleKeys = Object.keys(existingSchedule)
    .filter((dateStr) => new Date(dateStr) >= today)
    .sort();
  // PHÂN LOẠI NGÀY DỰA TRÊN DỮ LIỆU TỪ SERVER
  const fullyBookedDays: Date[] = [];
  const partialAvailableDays: Date[] = [];

  Object.values(existingSchedule).forEach((s) => {
    const date = new Date(s.ngay);

    // Nếu đã đủ 2 ca -> Kín lịch
    if (s.chiTietCaLam.length >= 2) {
      fullyBookedDays.push(date);
    }
    // Nếu có 1 ca -> Kiểm tra xem còn khoảng trống >= 360 phút không
    else if (s.chiTietCaLam.length === 1) {
      const shift = s.chiTietCaLam[0];
      const startMin = serverTimeToMinutes(shift.gioBatDau);
      const endMin = serverTimeToMinutes(shift.gioKetThuc);

      const canFitBefore = startMin >= 360;
      const canFitAfter = 1440 - endMin >= 360;

      // Nếu không nhét được ca nào nữa -> Coi như kín lịch
      if (!canFitBefore && !canFitAfter) {
        fullyBookedDays.push(date);
      } else {
        // Nếu vẫn còn chỗ nhét ca thứ 2 -> Còn khả dụng
        partialAvailableDays.push(date);
      }
    }
  });

  // Chặn chọn các ngày vi phạm khoảng min/max và các ngày đã KÍN LỊCH
  const disabledDates = [
    { before: minDate },
    { after: maxDate },
    ...fullyBookedDays,
  ];

  const handleSelectDates = (dates: Date[] | undefined) => {
    const newDates = dates || [];
    setSelectedDates(newDates);

    const newDateSlots = { ...dateSlots };
    const currentSelectedKeys = newDates.map((d) => format(d, "yyyy-MM-dd"));

    Object.keys(newDateSlots).forEach((key) => {
      if (!currentSelectedKeys.includes(key)) {
        delete newDateSlots[key];
      }
    });

    currentSelectedKeys.forEach((key) => {
      if (!newDateSlots[key]) {
        const existing = existingSchedule[key];
        if (existing && existing.chiTietCaLam.length === 1) {
          const shift = existing.chiTietCaLam[0];
          newDateSlots[key] = [
            {
              start: shift.gioBatDau.substring(0, 5),
              end: shift.gioKetThuc.substring(0, 5),
              isSaved: true,
            },
          ];
        } else {
          newDateSlots[key] = [{ start: "08:00", end: "12:00" }];
        }
      }
    });

    setDateSlots(newDateSlots);
  };

  const fetchMySchedule = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ServerSchedule[]>("/LichRanh/my-schedule");
      const grouped: Record<string, ServerSchedule> = {};

      const listData = Array.isArray(data) ? data : (data as any).data || [];

      listData.forEach((item: ServerSchedule) => {
        grouped[item.ngay] = item;
      });
      setExistingSchedule(grouped);
    } catch (error: any) {
      if (error.response?.status === 404 || error.status === 404) {
        setExistingSchedule({});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const executeSave = async () => {
    setOpenConfirm(false);
    setIsSaving(true);

    const danhSachDangKyMoi: any[] = [];
    const requestsBoSung: any[] = [];

    // 1. Phân loại dữ liệu
    Object.entries(dateSlots).forEach(([dateStr, slots]) => {
      if (slots.length > 0) {
        const existing = existingSchedule[dateStr];

        // Trường hợp bổ sung ca lẻ vào ngày đã tồn tại
        if (existing && existing.chiTietCaLam.length === 1) {
          const newSlot = slots.find((s) => !s.isSaved);
          if (newSlot) {
            const payload = {
              gioBatDau: `${newSlot.start}:00`,
              gioKetThuc:
                newSlot.end === "24:00" ? "23:59:59" : `${newSlot.end}:00`,
            };
            requestsBoSung.push(
              api.post(`/LichRanh/bo-sung-ca/${existing.maLichRanh}`, payload),
            );
          }
        }
        // Trường hợp tạo mới hoàn toàn
        else if (!existing) {
          danhSachDangKyMoi.push({
            ngay: dateStr,
            danhSachCa: slots.map((slot) => ({
              gioBatDau: `${slot.start}:00`,
              gioKetThuc: slot.end === "24:00" ? "23:59:59" : `${slot.end}:00`,
            })),
          });
        }
      }
    });

    try {
      // 2. Thực thi API đăng ký hàng loạt (nếu có ngày mới)
      if (danhSachDangKyMoi.length > 0) {
        await api.post("/LichRanh/dang-ky", {
          danhSachDangKy: danhSachDangKyMoi,
        });
      }

      // 3. Thực thi các API bổ sung ca lẻ song song (nếu có)
      if (requestsBoSung.length > 0) {
        await Promise.all(requestsBoSung);
      }

      // 4. Xử lý UI sau khi thành công
      setToast({
        open: true,
        message: "Lưu lịch rảnh thành công!",
        severity: "success",
      });
      setSelectedDates([]);
      setDateSlots({});
      fetchMySchedule();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng kiểm tra lại!";
      setToast({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitiateCancel = async (
    maLichRanh: string,
    maCaLamViec: string,
  ) => {
    setCheckingSlotId(maCaLamViec);

    try {
      const res: any = await api.get(
        `/LichRanh/kiem-tra-huy/${maLichRanh}/${maCaLamViec}`,
      );

      const responseData = res.data ? res.data : res;
      const canCancel = responseData.canCancel ?? responseData.CanCancel;
      const message =
        responseData.message ??
        responseData.Message ??
        "Đã quá thời gian cho phép hủy ca.";

      if (canCancel) {
        setCancelConfirm({
          open: true,
          maLichRanh,
          maCaLamViec,
          isDeleting: false,
        });
      } else {
        setToast({ open: true, message: message, severity: "error" });
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Không thể kiểm tra lịch lúc này.";
      setToast({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setCheckingSlotId(null);
    }
  };

  const executeCancel = async () => {
    setCancelConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(
        `/LichRanh/huy-ca/${cancelConfirm.maLichRanh}/${cancelConfirm.maCaLamViec}`,
      );

      setToast({
        open: true,
        message: "Hủy ca làm việc thành công!",
        severity: "success",
      });
      setCancelConfirm({
        open: false,
        maLichRanh: "",
        maCaLamViec: "",
        isDeleting: false,
      });
      fetchMySchedule();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Có lỗi xảy ra khi hủy ca!";
      setToast({ open: true, message: errorMsg, severity: "error" });
      setCancelConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSaveSchedule = () => {
    if (Object.keys(dateSlots).length === 0) return;
    setOpenConfirm(true);
  };

  const allHours = Array.from({ length: 25 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return `${hour}:00`;
  });

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`;
  };

  const canAddSecondSlot = (slots: TimeRange[]) => {
    if (slots.length === 0) return true;
    if (slots.length >= 2) return false;

    const exStart = toMinutes(slots[0].start);
    const exEnd = toMinutes(slots[0].end);

    const canFitBefore = exStart >= 360;
    const canFitAfter = 1440 - exEnd >= 360;

    return canFitBefore || canFitAfter;
  };

  const addSlot = (dateKey: string) => {
    setDateSlots((prev) => {
      const currentSlots = [...(prev[dateKey] ?? [])];

      if (!canAddSecondSlot(currentSlots)) return prev;

      let defaultStart = "08:00";
      let defaultEnd = "12:00";

      if (currentSlots.length === 1) {
        const exStartMin = toMinutes(currentSlots[0].start);
        const exEndMin = toMinutes(currentSlots[0].end);

        if (1440 - exEndMin >= 360) {
          const startMin = exEndMin + 120;
          defaultStart = minutesToTime(startMin);
          defaultEnd = minutesToTime(startMin + 240);
        } else if (exStartMin >= 360) {
          const startMin = exStartMin - 360;
          defaultStart = minutesToTime(startMin);
          defaultEnd = minutesToTime(startMin + 240);
        }
      }

      currentSlots.push({ start: defaultStart, end: defaultEnd });
      return { ...prev, [dateKey]: currentSlots };
    });
  };

  const updateSlot = (
    dateKey: string,
    index: number,
    field: keyof TimeRange,
    value: string,
  ) => {
    setDateSlots((prev) => {
      const currentSlots = [...(prev[dateKey] ?? [])];
      const slot = currentSlots[index];

      if (!slot) return prev;
      const updatedSlot: TimeRange = { ...slot, [field]: value };

      if (field === "start") {
        const startMin = toMinutes(value);
        const endMin = toMinutes(updatedSlot.end);

        if (endMin - startMin < 240) {
          const newEndMin = Math.min(startMin + 240, 1440);
          updatedSlot.end = minutesToTime(newEndMin);
        }
      }

      currentSlots[index] = updatedSlot;
      return { ...prev, [dateKey]: currentSlots };
    });
  };

  const removeSlot = (dateKey: string, index: number) => {
    const currentSlots = dateSlots[dateKey].filter((_, i) => i !== index);
    setDateSlots({ ...dateSlots, [dateKey]: currentSlots });
  };

  const isInvalidTimeGap = (dateKey: string) => {
    const slots = dateSlots[dateKey] || [];
    if (slots.length < 2) return false;

    const s1 = toMinutes(slots[0].start),
      e1 = toMinutes(slots[0].end);
    const s2 = toMinutes(slots[1].start),
      e2 = toMinutes(slots[1].end);

    const isValid = e1 + 120 <= s2 || e2 + 120 <= s1;

    return !isValid;
  };

  const hasAnyInvalidGap = Object.keys(dateSlots).some((key) =>
    isInvalidTimeGap(key),
  );

  const hasNewChanges = Object.values(dateSlots).some((slots) =>
    slots.some((slot) => !slot.isSaved),
  );

  // Nhóm lịch theo tháng/năm để hiển thị trực quan hơn
  const groupSchedulesByMonth = () => {
    const grouped: Record<string, ServerSchedule[]> = {};

    // Sử dụng mảng futureScheduleKeys thay vì Object.keys(existingSchedule)
    futureScheduleKeys.forEach((dateStr) => {
      const dateObj = new Date(dateStr);
      const monthKey = `Tháng ${format(dateObj, "MM/yyyy")}`;
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(existingSchedule[dateStr]);
    });
    return grouped;
  };

  // Viết hoa chữ cái đầu của Thứ (VD: "thứ hai" -> "Thứ Hai")
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Xác định trạng thái của card
  const getDayStatus = (schedule: ServerSchedule) => {
    // Ép về cùng chuẩn 0h00 để so sánh chính xác ngày
    const scheduleDate = startOfDay(new Date(schedule.ngay));

    // 1. Ràng buộc 3 ngày: Nếu ngày của lịch < ngày minDate (hôm nay + 3 ngày) -> Đã chốt sổ, không cho sửa
    if (scheduleDate < minDate) return "LOCKED";

    // 2. Kín lịch: Nếu đã đủ 2 ca
    if (schedule.chiTietCaLam.length >= 2) return "FULL";

    // 3. Kiểm tra xem có 1 ca thì còn nhét được ca thứ 2 không
    const shift = schedule.chiTietCaLam[0];
    const startMin = serverTimeToMinutes(shift.gioBatDau);
    const endMin = serverTimeToMinutes(shift.gioKetThuc);
    const canFitBefore = startMin >= 360;
    const canFitAfter = 1440 - endMin >= 360;

    return !canFitBefore && !canFitAfter ? "FULL" : "PARTIAL";
  };

  // Xử lý khi người dùng click vào thẻ ngày "Có thể bổ sung"
  const handleEditPartialDay = (dateStr: string) => {
    const targetDate = new Date(dateStr);

    // Kiểm tra xem ngày này đã được chọn trên lịch chưa
    const isAlreadySelected = selectedDates?.some(
      (d) => format(d, "yyyy-MM-dd") === dateStr,
    );

    // Nếu chưa chọn thì thêm vào mảng đang chọn
    if (!isAlreadySelected) {
      const newSelected = [...(selectedDates || []), targetDate];
      handleSelectDates(newSelected);
    }

    // Tự động cuộn trang lên khu vực chọn giờ (cách top một khoảng vừa đủ)
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  if (!isMounted) return null;

  const selectedKeys = Object.keys(dateSlots).sort();
  const isSaveDisabled =
    hasAnyInvalidGap || isSaving || selectedKeys.length === 0 || !hasNewChanges;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        py: 6,
        borderRadius: "24px",
      }}
    >
      <Container sx={{ maxWidth: "1000px !important", px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a" }}
          >
            Đăng ký lịch rảnh
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Chọn ngày trên lịch để thiết lập thời gian làm việc. Ngày{" "}
            <strong>viền cam</strong> là ngày có thể bổ sung ca. Ngày{" "}
            <strong style={{ color: "#059669" }}>viền xanh lá</strong> là ngày
            đã kín lịch (không thể chọn).
          </Typography>
        </Box>

        <Grid
          sx={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            gap: { xs: 4, md: 0 },
          }}
        >
          <Grid sx={{ width: { xs: "100%", md: "40%" }, pr: { md: 2 } }}>
            <Box sx={{ position: "sticky", top: 20 }}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: "24px",
                  bgcolor: "white",
                  display: "flex",
                  justifyContent: "center",
                  border: "1px solid #e2e8f0",
                  boxShadow: "none",
                  "& .rdp-day_selected": {
                    bgcolor: "#0ea5e9 !important",
                    borderRadius: "8px",
                    color: "white",
                  },
                }}
              >
                <DayPicker
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={handleSelectDates}
                  locale={vi}
                  disabled={disabledDates}
                  modifiers={{
                    hasOneShift: partialAvailableDays,
                    isFullyBooked: fullyBookedDays,
                  }}
                  modifiersStyles={{
                    hasOneShift: {
                      border: "2px dashed #f59e0b",
                      color: "#d97706",
                      fontWeight: "bold",
                      borderRadius: "8px",
                    },
                    isFullyBooked: {
                      border: "2px solid #10b981",
                      backgroundColor: "#ecfdf5", // Nền xanh lá mờ
                      color: "#059669",
                      fontWeight: "bold",
                      borderRadius: "8px",
                    },
                  }}
                />
              </Paper>
            </Box>
          </Grid>

          <Grid sx={{ width: { xs: "100%", md: "60%" }, pl: { md: 2 } }}>
            <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {selectedKeys.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "20px",
                    color: "#94a3b8",
                  }}
                >
                  Vui lòng chọn ngày trên lịch để thiết lập thời gian.
                </Box>
              ) : (
                selectedKeys.map((dateKey) => {
                  const slotsForDate = dateSlots[dateKey];
                  const isInvalid = isInvalidTimeGap(dateKey);
                  return (
                    <Paper
                      key={dateKey}
                      sx={{
                        p: 3,
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: isInvalid ? "#fca5a5" : "#e2e8f0",
                        bgcolor: isInvalid ? "#fff1f2" : "white",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#0369a1",
                            fontSize: "1.1rem",
                          }}
                        >
                          Ngày {format(new Date(dateKey), "dd/MM/yyyy")}
                          {existingSchedule[dateKey] && (
                            <Typography
                              component="span"
                              sx={{
                                color: "#f59e0b",
                                ml: 1,
                                fontSize: "0.85rem",
                              }}
                            >
                              (Bổ sung ca)
                            </Typography>
                          )}
                        </Typography>
                        {isInvalid && (
                          <Typography
                            sx={{
                              color: "#e11d48",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              bgcolor: "#ffe4e6",
                              px: 1,
                              py: 0.5,
                              borderRadius: "6px",
                            }}
                          >
                            Lỗi trùng hoặc cách nhau dưới 2h!
                          </Typography>
                        )}
                      </Box>

                      <Stack sx={{ gap: 2 }}>
                        {slotsForDate.map((slot, index) => {
                          const otherSlot =
                            slotsForDate.length > 1
                              ? slotsForDate[1 - index]
                              : null;

                          const isBefore = otherSlot
                            ? toMinutes(slot.start) <
                                toMinutes(otherSlot.start) ||
                              (toMinutes(slot.start) ===
                                toMinutes(otherSlot.start) &&
                                index === 0)
                            : true;

                          const filteredStartHours = allHours
                            .slice(0, 21)
                            .filter((h) => {
                              if (!otherSlot) return true;

                              const hMin = toMinutes(h);
                              const otherStartMin = toMinutes(otherSlot.start);
                              const otherEndMin = toMinutes(otherSlot.end);

                              if (isBefore) {
                                return hMin + 360 <= otherStartMin;
                              } else {
                                return hMin >= otherEndMin + 120;
                              }
                            });

                          if (!filteredStartHours.includes(slot.start)) {
                            filteredStartHours.push(slot.start);
                            filteredStartHours.sort();
                          }

                          const filteredEndHours = allHours.filter((h) => {
                            const hMin = toMinutes(h);
                            const startMin = toMinutes(slot.start);

                            if (hMin < startMin + 240) return false;

                            if (otherSlot && isBefore) {
                              const otherStartMin = toMinutes(otherSlot.start);
                              if (hMin + 120 > otherStartMin) return false;
                            }

                            return true;
                          });

                          if (!filteredEndHours.includes(slot.end)) {
                            filteredEndHours.push(slot.end);
                            filteredEndHours.sort();
                          }

                          return (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                              }}
                            >
                              <FormControl
                                sx={{ flex: 1 }}
                                size="small"
                                disabled={slot.isSaved}
                              >
                                <InputLabel>Bắt đầu</InputLabel>
                                <Select
                                  value={slot.start}
                                  label="Bắt đầu"
                                  onChange={(e) =>
                                    updateSlot(
                                      dateKey,
                                      index,
                                      "start",
                                      e.target.value,
                                    )
                                  }
                                  sx={{
                                    borderRadius: "12px",
                                    bgcolor: slot.isSaved ? "#f8fafc" : "#fff",
                                  }}
                                >
                                  {filteredStartHours.map((h) => (
                                    <MenuItem key={h} value={h}>
                                      {h}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControl
                                sx={{ flex: 1 }}
                                size="small"
                                disabled={slot.isSaved}
                              >
                                <InputLabel>Kết thúc</InputLabel>
                                <Select
                                  value={slot.end}
                                  label="Kết thúc"
                                  onChange={(e) =>
                                    updateSlot(
                                      dateKey,
                                      index,
                                      "end",
                                      e.target.value,
                                    )
                                  }
                                  sx={{
                                    borderRadius: "12px",
                                    bgcolor: slot.isSaved ? "#f8fafc" : "#fff",
                                  }}
                                >
                                  {filteredEndHours.map((h) => (
                                    <MenuItem key={h} value={h}>
                                      {h}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              {slot.isSaved ? (
                                <Box
                                  sx={{
                                    width: 40,
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: "#059669",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Đã lưu
                                  </Typography>
                                </Box>
                              ) : (
                                <IconButton
                                  onClick={() => removeSlot(dateKey, index)}
                                  sx={{
                                    bgcolor: "#f1f5f9",
                                    color: "#64748b",
                                    borderRadius: "10px",
                                    "&:hover": {
                                      bgcolor: "#ffe4e6",
                                      color: "#e11d48",
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              )}
                            </Box>
                          );
                        })}

                        {canAddSecondSlot(slotsForDate) && (
                          <Button
                            onClick={() => addSlot(dateKey)}
                            sx={{
                              py: 1,
                              borderRadius: "12px",
                              border: "1px dashed #bae6fd",
                              textTransform: "none",
                              fontWeight: 600,
                              color: "#0ea5e9",
                              "&:hover": {
                                borderColor: "#0ea5e9",
                                bgcolor: "#f0f9ff",
                              },
                            }}
                          >
                            + Thêm ca
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Grid>
        </Grid>

        <Button
          onClick={handleSaveSchedule}
          disabled={isSaveDisabled}
          sx={{
            mt: 4,
            py: 2,
            width: "100%",
            bgcolor: isSaveDisabled ? "#cbd5e1" : "#0ea5e9",
            color: "white",
            borderRadius: "16px",
            fontSize: "1.1rem",
            textTransform: "none",
            "&:hover": { bgcolor: isSaveDisabled ? "#cbd5e1" : "#0284c7" },
          }}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Xác nhận lưu lịch mới"
          )}
        </Button>

        <Divider sx={{ my: 6, borderColor: "#e2e8f0" }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EventAvailableIcon sx={{ color: "#10b981", fontSize: "2.2rem" }} />
            <Box>
              <Typography
                sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}
              >
                Lịch rảnh hiện tại của bạn
              </Typography>
              <Typography
                sx={{ color: "#64748b", fontSize: "0.95rem", mt: 0.5 }}
              >
                Danh sách các ca làm việc bạn đã đăng ký trên hệ thống.
              </Typography>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : futureScheduleKeys.length === 0 ? ( // SỬA DÒNG NÀY
            <Box
              sx={{
                width: "100%",
                p: 5,
                textAlign: "center",
                borderRadius: "20px",
                border: "2px dashed #cbd5e1",
                bgcolor: "white",
              }}
            >
              <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                Bạn chưa có lịch rảnh nào trong hôm nay và sắp tới.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={4}>
              {Object.entries(groupSchedulesByMonth()).map(
                ([monthKey, schedules]) => (
                  <Box key={monthKey}>
                    {/* Tiêu đề Tháng */}
                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "#475569",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&::after": {
                          content: '""',
                          flex: 1,
                          height: "1px",
                          bgcolor: "#e2e8f0",
                          ml: 2,
                        },
                      }}
                    >
                      {monthKey}
                    </Typography>

                    {/* Danh sách ngày trong tháng */}
                    <Grid sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {schedules.map((schedule) => {
                        const dateObj = new Date(schedule.ngay);
                        const dayName = capitalizeFirstLetter(
                          format(dateObj, "EEEE", { locale: vi }),
                        );
                        const status = getDayStatus(schedule);

                        // TẠO CẤU HÌNH MÀU SẮC DỰA TRÊN TRẠNG THÁI
                        const statusConfig: Record<string, any> = {
                          FULL: {
                            label: "Đã kín lịch",
                            color: "#059669",
                            bgcolor: "#ecfdf5",
                            border: "#10b981",
                            chipBorder: "#a7f3d0",
                          },
                          PARTIAL: {
                            label: "Có thể bổ sung",
                            color: "#d97706",
                            bgcolor: "#fef3c7",
                            border: "#f59e0b",
                            chipBorder: "#fde68a",
                          },
                          LOCKED: {
                            label: "Đã chốt lịch",
                            color: "#475569",
                            bgcolor: "#f1f5f9",
                            border: "#cbd5e1",
                            chipBorder: "#e2e8f0",
                          },
                        };
                        const ui = statusConfig[status];
                        const isClickable = status === "PARTIAL";
                        return (
                          <Grid
                            key={schedule.ngay}
                            sx={{
                              width: {
                                xs: "100%",
                                sm: "calc(50% - 8px)",
                                md: "calc(33.333% - 11px)",
                              },
                            }}
                          >
                            <Card
                              // 1. GẮN SỰ KIỆN CLICK VÀO CARD NẾU LÀ PARTIAL
                              onClick={() =>
                                isClickable &&
                                handleEditPartialDay(schedule.ngay)
                              }
                              sx={{
                                p: 2.5,
                                borderRadius: "20px",
                                border: "1px solid",
                                borderColor: ui.border,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",

                                // 2. THÊM HIỆU ỨNG HOVER NẾU CÓ THỂ CLICK
                                cursor: isClickable ? "pointer" : "default",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": isClickable
                                  ? {
                                      borderColor: "#0ea5e9", // Đổi màu viền xanh dương khi hover
                                      boxShadow:
                                        "0 4px 12px rgba(14, 165, 233, 0.15)",
                                      transform: "translateY(-4px)", // Nổi thẻ lên 1 chút
                                    }
                                  : {},
                              }}
                            >
                              {/* Header của Card */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      fontSize: "1.05rem",
                                    }}
                                  >
                                    {dayName}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#64748b",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {format(dateObj, "dd/MM/yyyy")}
                                  </Typography>
                                </Box>

                                <Chip
                                  label={ui.label}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    borderRadius: "8px",
                                    bgcolor: ui.bgcolor,
                                    color: ui.color,
                                    border: `1px solid ${ui.chipBorder}`,
                                  }}
                                />
                              </Box>

                              <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                              {/* Danh sách ca */}
                              <Stack spacing={1.5} sx={{ flex: 1 }}>
                                {schedule.chiTietCaLam.map((slot, index) => (
                                  <Box
                                    key={slot.maCaLamViec}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      p: 1.5,
                                      bgcolor: "#f8fafc",
                                      borderRadius: "12px",
                                      border: "1px solid #f1f5f9",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: "50%",
                                          bgcolor: ui.border,
                                        }}
                                      />
                                      <Typography
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: "0.95rem",
                                          color: "#334155",
                                        }}
                                      >
                                        {slot.gioBatDau.substring(0, 5)} —{" "}
                                        {slot.gioKetThuc.substring(0, 5)}
                                      </Typography>
                                    </Box>

                                    {/* Icon Hủy ca */}
                                    {canDeleteSlot(slot) && (
                                      <IconButton
                                        size="small"
                                        disabled={
                                          checkingSlotId === slot.maCaLamViec
                                        }
                                        onClick={(e) => {
                                          // 3. CHẶN SỰ KIỆN CLICK BUBBLE LÊN CARD
                                          e.stopPropagation();
                                          handleInitiateCancel(
                                            schedule.maLichRanh,
                                            slot.maCaLamViec,
                                          );
                                        }}
                                        sx={{
                                          bgcolor:
                                            checkingSlotId === slot.maCaLamViec
                                              ? "transparent"
                                              : "#ffe4e6",
                                          color: "#e11d48",
                                          "&:hover": { bgcolor: "#fecdd3" },
                                          p: 0.5,
                                        }}
                                      >
                                        {checkingSlotId === slot.maCaLamViec ? (
                                          <CircularProgress
                                            size={20}
                                            color="error"
                                          />
                                        ) : (
                                          <DeleteOutlineIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                    )}
                                  </Box>
                                ))}
                              </Stack>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ),
              )}
            </Stack>
          )}
        </Box>

        <Dialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Xác nhận lưu lịch rảnh
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Hệ thống sẽ ghi nhận thiết lập thời gian của bạn cho các ngày đã
              chọn. Bạn có chắc chắn không?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenConfirm(false)}
              sx={{ color: "#64748b" }}
            >
              Hủy
            </Button>
            <Button
              onClick={executeSave}
              variant="contained"
              sx={{ bgcolor: "#0ea5e9" }}
            >
              Đồng ý lưu
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={cancelConfirm.open}
          onClose={() =>
            !cancelConfirm.isDeleting &&
            setCancelConfirm({ ...cancelConfirm, open: false })
          }
          slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#e11d48" }}>
            Xác nhận hủy ca làm việc
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn chỉ có thể hủy ca trong vòng 15 phút sau khi đăng ký. Bạn có
              chắc chắn muốn hủy ca này không?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              disabled={cancelConfirm.isDeleting}
              onClick={() =>
                setCancelConfirm({ ...cancelConfirm, open: false })
              }
              sx={{ color: "#64748b" }}
            >
              Hủy
            </Button>
            <Button
              disabled={cancelConfirm.isDeleting}
              onClick={executeCancel}
              variant="contained"
              color="error"
            >
              {cancelConfirm.isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đồng ý Hủy"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <NotificationToast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </Container>
    </Box>
  );
}
