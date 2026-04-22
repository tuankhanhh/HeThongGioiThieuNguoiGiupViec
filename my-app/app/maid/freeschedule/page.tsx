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
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

// Import service API đã viết sẵn
import api from "@/services/api";

interface TimeRange {
  start: string;
  end: string;
}

interface ServerSchedule {
  maLichRanh: string;
  ngay: string; // YYYY-MM-DD
  gioBatDau: string; // HH:mm:ss
  gioKetThuc: string; // HH:mm:ss
}

export default function HelperAvailability() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. CHỌN NHIỀU NGÀY
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);

  // 2. KHUNG GIỜ RIÊNG CHO TỪNG NGÀY (Map Object: "yyyy-MM-dd" => TimeRange[])
  const [dateSlots, setDateSlots] = useState<Record<string, TimeRange[]>>({});

  // Trạng thái dữ liệu lịch đã lưu
  const [existingSchedule, setExistingSchedule] = useState<
    Record<string, ServerSchedule[]>
  >({});

  // Trạng thái loading
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchMySchedule();
  }, []);

  // ==========================================
  // RÀNG BUỘC THỜI GIAN TRÊN LỊCH
  // ==========================================
  const today = startOfDay(new Date());
  const minDate = addDays(today, 3); // Sau 3 ngày kể từ hôm nay
  const maxDate = addDays(minDate, 30); // Cho phép đăng ký trong khoảng 30 ngày tiếp theo

  // ==========================================
  // XỬ LÝ KHI CHỌN/BỎ CHỌN NGÀY TRÊN LỊCH
  // ==========================================
  const handleSelectDates = (dates: Date[] | undefined) => {
    const newDates = dates || [];
    setSelectedDates(newDates);

    const newDateSlots = { ...dateSlots };
    const currentSelectedKeys = newDates.map((d) => format(d, "yyyy-MM-dd"));

    // Xóa các ngày đã bị bỏ chọn khỏi cấu hình giờ
    Object.keys(newDateSlots).forEach((key) => {
      if (!currentSelectedKeys.includes(key)) {
        delete newDateSlots[key];
      }
    });

    // Thêm giờ mặc định cho các ngày mới được chọn
    currentSelectedKeys.forEach((key) => {
      if (!newDateSlots[key]) {
        newDateSlots[key] = [{ start: "08:00", end: "12:00" }];
      }
    });

    setDateSlots(newDateSlots);
  };

  // ==========================================
  // API CALLS
  // ==========================================
  const fetchMySchedule = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ServerSchedule[]>("/LichRanh/my-schedule");
      const grouped: Record<string, ServerSchedule[]> = {};
      data.forEach((item) => {
        if (!grouped[item.ngay]) grouped[item.ngay] = [];
        grouped[item.ngay].push(item);
      });
      setExistingSchedule(grouped);
    } catch (error: any) {
      if (error.status === 404) {
        setExistingSchedule({});
      } else {
        console.error("Fetch schedule error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    const datesToSave = Object.keys(dateSlots);
    if (datesToSave.length === 0) return;

    setIsSaving(true);
    const requests: Promise<any>[] = [];

    // Lặp qua từng ngày và từng khung giờ riêng biệt để lưu
    Object.entries(dateSlots).forEach(([dateStr, slots]) => {
      slots.forEach((slot) => {
        const payload = {
          ngay: dateStr,
          gioBatDau: `${slot.start}:00`,
          gioKetThuc: `${slot.end}:00`,
        };
        requests.push(api.post("/LichRanh/dang-ky", payload));
      });
    });

    try {
      await Promise.all(requests);
      alert("Lưu lịch thành công!");
      setSelectedDates([]); // Reset form
      setDateSlots({});
      fetchMySchedule();
    } catch (error: any) {
      console.error("Save schedule error:", error);
      alert(
        error?.message ||
          "Có lỗi xảy ra hoặc trùng lặp với lịch cũ. Vui lòng kiểm tra lại!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // LOGIC XỬ LÝ KHUNG GIỜ (Riêng theo dateKey)
  // ==========================================
  const allHours = Array.from({ length: 25 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return `${hour}:00`;
  });

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const addSlot = (dateKey: string) => {
    const currentSlots = dateSlots[dateKey] || [];
    if (currentSlots.length >= 2) return; // Tối đa 2 ca/ngày

    if (currentSlots.length === 0) {
      setDateSlots({
        ...dateSlots,
        [dateKey]: [{ start: "08:00", end: "12:00" }],
      });
    } else {
      // Lấy giờ kết thúc của ca trước đó làm mốc cho ca mới
      const prevEndMin = toMinutes(currentSlots[0].end);

      // Giới hạn giờ bắt đầu tối đa là 20:00 (vì cần tối thiểu 4 tiếng đến 24:00)
      const startMin = Math.min(prevEndMin, 20 * 60);
      const hStart = Math.floor(startMin / 60);
      const defaultStart = `${hStart < 10 ? `0${hStart}` : hStart}:00`;

      // Giờ kết thúc mặc định = bắt đầu + 4 tiếng
      const endMin = startMin + 240;
      const hEnd = Math.floor(endMin / 60);
      const defaultEnd = `${hEnd < 10 ? `0${hEnd}` : hEnd}:00`;

      setDateSlots({
        ...dateSlots,
        [dateKey]: [...currentSlots, { start: defaultStart, end: defaultEnd }],
      });
    }
  };

  const updateSlot = (
    dateKey: string,
    index: number,
    field: keyof TimeRange,
    value: string,
  ) => {
    const currentSlots = [...dateSlots[dateKey]];
    currentSlots[index] = { ...currentSlots[index], [field]: value };

    if (field === "start") {
      const startMin = toMinutes(value);
      const endMin = toMinutes(currentSlots[index].end);
      if (endMin - startMin < 240) {
        // Đảm bảo tối thiểu 4 tiếng
        const newEndMin = startMin + 240;
        if (newEndMin <= 1440) {
          const h = Math.floor(newEndMin / 60);
          currentSlots[index].end = `${h < 10 ? `0${h}` : h}:00`;
        }
      }
    }
    setDateSlots({ ...dateSlots, [dateKey]: currentSlots });
  };

  const removeSlot = (dateKey: string, index: number) => {
    const currentSlots = dateSlots[dateKey].filter((_, i) => i !== index);
    setDateSlots({ ...dateSlots, [dateKey]: currentSlots });
  };

  // Ràng buộc lồng nhau cho MỘT ngày cụ thể
  const isOverlapping = (dateKey: string) => {
    const slots = dateSlots[dateKey] || [];
    if (slots.length < 2) return false;
    const s1 = toMinutes(slots[0].start),
      e1 = toMinutes(slots[0].end);
    const s2 = toMinutes(slots[1].start),
      e2 = toMinutes(slots[1].end);
    return s1 < e2 && s2 < e1;
  };

  // Kiểm tra xem có BẤT KỲ ngày nào bị lỗi lồng giờ hay không
  const hasAnyOverlap = Object.keys(dateSlots).some((key) =>
    isOverlapping(key),
  );

  // ==========================================
  // RENDER
  // ==========================================
  if (!isMounted) return null;

  const selectedKeys = Object.keys(dateSlots).sort();
  const isSaveDisabled = hasAnyOverlap || isSaving || selectedKeys.length === 0;

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
            ngày.
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
          {/* CỘT TRÁI: Lịch chọn ngày */}
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
                  disabled={[{ before: minDate }, { after: maxDate }]}
                />
              </Paper>
            </Box>
          </Grid>

          {/* CỘT PHẢI: Form cấu hình giờ cho TỪNG ngày */}
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
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
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
                          // LỌC GIỜ BẮT ĐẦU: Nếu là ca thứ 2 (index > 0), chỉ hiển thị các giờ >= giờ kết thúc của ca 1
                          let availableStartHours = allHours.slice(0, 21); // Mặc định 00:00 -> 20:00
                          if (index > 0) {
                            const prevEndMin = toMinutes(
                              slotsForDate[index - 1].end,
                            );
                            availableStartHours = availableStartHours.filter(
                              (h) => toMinutes(h) >= prevEndMin,
                            );
                          }

                          // LỌC GIỜ KẾT THÚC: Phải >= giờ bắt đầu của chính ca này + 4 tiếng
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
                              <FormControl sx={{ flex: 1 }} size="small">
                                <InputLabel>Bắt đầu</InputLabel>
                                <Select
                                  value={slot.start}
                                  label="Bắt đầu"
                                  onChange={(e: SelectChangeEvent) =>
                                    updateSlot(
                                      dateKey,
                                      index,
                                      "start",
                                      e.target.value,
                                    )
                                  }
                                  sx={{ borderRadius: "12px", bgcolor: "#fff" }}
                                >
                                  {availableStartHours.map((h) => (
                                    <MenuItem key={h} value={h}>
                                      {h}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl sx={{ flex: 1 }} size="small">
                                <InputLabel>Kết thúc</InputLabel>
                                <Select
                                  value={slot.end}
                                  label="Kết thúc"
                                  onChange={(e: SelectChangeEvent) =>
                                    updateSlot(
                                      dateKey,
                                      index,
                                      "end",
                                      e.target.value,
                                    )
                                  }
                                  sx={{ borderRadius: "12px", bgcolor: "#fff" }}
                                >
                                  {filteredEndHours.map((h) => (
                                    <MenuItem key={h} value={h}>
                                      {h}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

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
            boxShadow: "none",
            "&:hover": { bgcolor: isSaveDisabled ? "#cbd5e1" : "#0284c7" },
            transition: "all 0.2s",
          }}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Xác nhận lưu lịch mới"
          )}
        </Button>

        <Divider sx={{ my: 6, borderColor: "#e2e8f0" }} />

        {/* ================= PHẦN DƯỚI: DANH SÁCH LỊCH TỪ SERVER ================= */}
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
                  .map((dateStr) => (
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
                          {existingSchedule[dateStr].map((slot) => (
                            <Box
                              key={slot.maLichRanh}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
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
                          ))}
                        </Stack>
                      </Card>
                    </Grid>
                  ))
              )}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}
