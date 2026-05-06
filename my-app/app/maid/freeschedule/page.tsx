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
    ghiChu?: string;
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

  // State loading RIÊNG cho việc click kiểm tra hủy (tránh unmount UI)
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

  const today = startOfDay(new Date());
  const minDate = addDays(today, 3);
  const maxDate = addDays(minDate, 30);

  const fullDays = Object.values(existingSchedule)
    .filter((s) => s.chiTietCaLam.length >= 2)
    .map((s) => new Date(s.ngay));

  const partialDays = Object.values(existingSchedule)
    .filter((s) => s.chiTietCaLam.length === 1)
    .map((s) => new Date(s.ngay));

  const disabledDates = [{ before: minDate }, { after: maxDate }, ...fullDays];

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

      // Xử lý trường hợp data bị bọc thêm 1 lớp (phòng hờ)
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
    const requests: Promise<any>[] = [];

    Object.entries(dateSlots).forEach(([dateStr, slots]) => {
      if (slots.length > 0) {
        const existing = existingSchedule[dateStr];

        if (existing && existing.chiTietCaLam.length === 1) {
          const newSlot = slots.find((s) => !s.isSaved);
          if (newSlot) {
            const payload = {
              gioBatDau: `${newSlot.start}:00`,
              gioKetThuc: `${newSlot.end}:00`,
            };
            requests.push(
              api.post(`/LichRanh/bo-sung-ca/${existing.maLichRanh}`, payload),
            );
          }
        } else if (!existing) {
          const payload = {
            ngay: dateStr,
            danhSachCa: slots.map((slot) => ({
              gioBatDau: `${slot.start}:00`,
              gioKetThuc: `${slot.end}:00`,
            })),
          };
          requests.push(api.post("/LichRanh/dang-ky", payload));
        }
      }
    });

    try {
      await Promise.all(requests);
      setToast({
        open: true,
        message: "Lưu lịch thành công!",
        severity: "success",
      });
      setSelectedDates([]);
      setDateSlots({});
      fetchMySchedule();
    } catch (error: any) {
      setToast({
        open: true,
        message:
          error.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng kiểm tra lại!",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================================
  // XỬ LÝ HỦY CA LÀM VIỆC ĐÃ LƯU
  // ========================================================
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
      // IN LOG RA ĐÂY ĐỂ XEM LỖI GÌ
      console.error("Lỗi khi gọi API kiem-tra-huy:", error);
      console.log("Cấu trúc error.response:", error.response);

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

      // Load lại danh sách mới
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
  // ========================================================

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

  const addSlot = (dateKey: string) => {
    setDateSlots((prev) => {
      const currentSlots = [...(prev[dateKey] ?? [])];
      if (currentSlots.length >= 2) return prev;

      let startMin = 8 * 60;
      if (currentSlots.length > 0) {
        const prevEnd = currentSlots[0]?.end;
        if (prevEnd) {
          const prevEndMin = toMinutes(prevEnd);
          startMin = Math.min(prevEndMin, 20 * 60);
        }
      }

      const hStart = Math.floor(startMin / 60);
      const defaultStart = `${hStart < 10 ? `0${hStart}` : hStart}:00`;

      const newEndMin = Math.min(startMin + 240, 24 * 60);
      const hEnd = Math.floor(newEndMin / 60);
      const defaultEnd = `${hEnd < 10 ? `0${hEnd}` : hEnd}:00`;

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
          const h = Math.floor(newEndMin / 60);
          updatedSlot.end = `${h < 10 ? `0${h}` : h}:00`;
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

  const isOverlapping = (dateKey: string) => {
    const slots = dateSlots[dateKey] || [];
    if (slots.length < 2) return false;
    const s1 = toMinutes(slots[0].start),
      e1 = toMinutes(slots[0].end);
    const s2 = toMinutes(slots[1].start),
      e2 = toMinutes(slots[1].end);
    return s1 < e2 && s2 < e1;
  };

  const hasAnyOverlap = Object.keys(dateSlots).some((key) =>
    isOverlapping(key),
  );
  const hasNewChanges = Object.values(dateSlots).some((slots) =>
    slots.some((slot) => !slot.isSaved),
  );

  if (!isMounted) return null;

  const selectedKeys = Object.keys(dateSlots).sort();
  const isSaveDisabled =
    hasAnyOverlap || isSaving || selectedKeys.length === 0 || !hasNewChanges;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", py: 6 }}>
      <Container sx={{ maxWidth: "1000px !important", px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a" }}
          >
            Đăng ký lịch rảnh
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Chọn nhiều ngày và thiết lập thời gian làm việc riêng biệt cho từng
            ngày. Những ngày viền cam là ngày bạn có thể bổ sung thêm ca.
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
                  modifiers={{ hasOneShift: partialDays }}
                  modifiersStyles={{
                    hasOneShift: {
                      border: "2px dashed #f59e0b",
                      color: "#d97706",
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
                  const hasOverlap = isOverlapping(dateKey);
                  return (
                    <Paper
                      key={dateKey}
                      sx={{
                        p: 3,
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: hasOverlap ? "#fca5a5" : "#e2e8f0",
                        bgcolor: hasOverlap ? "#fff1f2" : "white",
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
                              (Bổ sung ca làm việc)
                            </Typography>
                          )}
                        </Typography>
                        {hasOverlap && (
                          <Typography
                            sx={{
                              color: "#e11d48",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            Lỗi lồng giờ!
                          </Typography>
                        )}
                      </Box>

                      <Stack sx={{ gap: 2 }}>
                        {slotsForDate.map((slot, index) => {
                          const filteredEndHours = allHours.filter(
                            (h) => toMinutes(h) >= toMinutes(slot.start) + 240,
                          );
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
                                  {allHours.slice(0, 21).map((h) => (
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
                        {slotsForDate.length < 2 && (
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EventAvailableIcon sx={{ color: "#10b981", fontSize: "2.2rem" }} />
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}
            >
              Lịch rảnh hiện tại của bạn
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {Object.keys(existingSchedule).length === 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    p: 4,
                    textAlign: "center",
                    borderRadius: "20px",
                    border: "2px dashed #cbd5e1",
                  }}
                >
                  <Typography sx={{ color: "#94a3b8" }}>
                    Bạn chưa có lịch rảnh nào trên hệ thống.
                  </Typography>
                </Box>
              ) : (
                Object.keys(existingSchedule)
                  .sort()
                  .map((dateStr) => {
                    const schedule = existingSchedule[dateStr];
                    return (
                      <Grid
                        key={dateStr}
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <Card
                          sx={{
                            p: 2.5,
                            borderRadius: "20px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "none",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#10b981",
                              mb: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#10b981",
                              }}
                            />
                            {format(new Date(dateStr), "dd/MM/yyyy")}
                          </Typography>

                          <Stack
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {schedule.chiTietCaLam.map((slot, index) => (
                              <Box
                                key={index}
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

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
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

                                  {/* ICON HỦY CA MỚI VỚI VÒNG XOAY LOADING */}
                                  <IconButton
                                    size="small"
                                    disabled={
                                      checkingSlotId === slot.maCaLamViec
                                    }
                                    onClick={() =>
                                      handleInitiateCancel(
                                        schedule.maLichRanh,
                                        slot.maCaLamViec,
                                      )
                                    }
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
                                  {/* -------------------------------------- */}
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Card>
                      </Grid>
                    );
                  })
              )}
            </Grid>
          )}
        </Box>

        {/* --- Dialog XÁC NHẬN LƯU --- */}
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

        {/* --- Dialog MỚI: XÁC NHẬN HỦY CA --- */}
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
