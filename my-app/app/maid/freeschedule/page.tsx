"use client";

import React, { useState, useEffect } from "react";
import { vi } from "date-fns/locale";
import { format } from "date-fns";
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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

interface TimeRange {
  start: string;
  end: string;
}

interface DailyAvailability {
  [dateKey: string]: TimeRange[];
}

export default function HelperAvailability() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeDate, setActiveDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<DailyAvailability>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Danh sách toàn bộ giờ chẵn trong ngày
  const allHours = Array.from({ length: 25 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return `${hour}:00`;
  });

  const dateKey = activeDate ? format(activeDate, "yyyy-MM-dd") : "";
  const currentDaySlots = availability[dateKey] || [];

  const addSlot = () => {
    if (currentDaySlots.length >= 2) return;
    const defaultStart = currentDaySlots.length === 0 ? "08:00" : "14:00";
    const defaultEnd = currentDaySlots.length === 0 ? "12:00" : "18:00";
    setAvailability({
      ...availability,
      [dateKey]: [...currentDaySlots, { start: defaultStart, end: defaultEnd }],
    });
  };

  const updateSlot = (index: number, field: keyof TimeRange, value: string) => {
    const updatedSlots = [...currentDaySlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };

    // Tự động điều chỉnh giờ kết thúc nếu giờ bắt đầu mới làm ca ngắn hơn 4 tiếng
    if (field === "start") {
      const startMin = toMinutes(value);
      const endMin = toMinutes(updatedSlots[index].end);
      if (endMin - startMin < 240) {
        const newEndMin = startMin + 240;
        if (newEndMin <= 1440) {
          // Không quá 24:00
          const h = Math.floor(newEndMin / 60);
          updatedSlots[index].end = `${h < 10 ? `0${h}` : h}:00`;
        }
      }
    }
    setAvailability({ ...availability, [dateKey]: updatedSlots });
  };

  const removeSlot = (index: number) => {
    const updatedSlots = currentDaySlots.filter((_, i) => i !== index);
    const newAvail = { ...availability };
    updatedSlots.length === 0
      ? delete newAvail[dateKey]
      : (newAvail[dateKey] = updatedSlots);
    setAvailability(newAvail);
  };

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const isOverlapping = () => {
    if (currentDaySlots.length < 2) return false;
    const s1 = toMinutes(currentDaySlots[0].start),
      e1 = toMinutes(currentDaySlots[0].end);
    const s2 = toMinutes(currentDaySlots[1].start),
      e2 = toMinutes(currentDaySlots[1].end);
    return s1 < e2 && s2 < e1;
  };

  if (!isMounted) return null;

  const overlapError = isOverlapping();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", py: 6 }}>
      <Container sx={{ maxWidth: "900px !important", px: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a" }}
          >
            Thiết lập lịch rảnh
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
          <Grid sx={{ width: { xs: "100%", md: "50%" }, pr: { md: 2 } }}>
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
                },
              }}
            >
              <DayPicker
                mode="single"
                selected={activeDate}
                onSelect={setActiveDate}
                locale={vi}
                disabled={{ before: new Date() }}
              />
            </Paper>
          </Grid>

          <Grid sx={{ width: { xs: "100%", md: "50%" }, pl: { md: 2 } }}>
            <Stack sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f0f9ff",
                  borderRadius: "16px",
                  border: "1px solid #bae6fd",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {/* <CalendarMonthIcon sx={{ color: "#0284c7" }} /> */}
                <Typography sx={{ fontWeight: 700, color: "#0369a1" }}>
                  Ngày: {activeDate ? format(activeDate, "dd/MM/yyyy") : "---"}
                </Typography>
              </Box>

              {overlapError && (
                <Typography
                  sx={{
                    color: "#e11d48",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textAlign: "center",
                    bgcolor: "#fff1f2",
                    p: 1,
                    borderRadius: "8px",
                    border: "1px solid #fca5a5",
                  }}
                >
                  Các khung giờ đang bị trùng lặp!
                </Typography>
              )}

              {currentDaySlots.map((slot, index) => {
                // LỌC GIỜ KẾ THÚC: Phải sau giờ bắt đầu ít nhất 4 tiếng (240 phút)
                const filteredEndHours = allHours.filter(
                  (h) => toMinutes(h) >= toMinutes(slot.start) + 240,
                );

                return (
                  <Card
                    key={index}
                    sx={{
                      p: 2.5,
                      borderRadius: "20px",
                      border: "2px solid",
                      borderColor: overlapError ? "#fca5a5" : "#e2e8f0",
                      boxShadow: "none",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {/* CHỌN GIỜ BẮT ĐẦU */}
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel sx={{ fontWeight: 600 }}>
                          Bắt đầu
                        </InputLabel>
                        <Select
                          value={slot.start}
                          label="Bắt đầu"
                          onChange={(e: SelectChangeEvent) =>
                            updateSlot(index, "start", e.target.value)
                          }
                          sx={{ borderRadius: "12px" }}
                        >
                          {allHours.slice(0, 21).map(
                            (
                              h, // Chỉ cho phép bắt đầu muộn nhất là 20:00 để đủ 4 tiếng
                            ) => (
                              <MenuItem key={h} value={h}>
                                {h}
                              </MenuItem>
                            ),
                          )}
                        </Select>
                      </FormControl>

                      {/* CHỌN GIỜ KẾ THÚC (ĐÃ LỌC) */}
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel sx={{ fontWeight: 600 }}>
                          Kết thúc
                        </InputLabel>
                        <Select
                          value={slot.end}
                          label="Kết thúc"
                          onChange={(e: SelectChangeEvent) =>
                            updateSlot(index, "end", e.target.value)
                          }
                          sx={{ borderRadius: "12px" }}
                        >
                          {filteredEndHours.map((h) => (
                            <MenuItem key={h} value={h}>
                              {h}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <IconButton
                        onClick={() => removeSlot(index)}
                        sx={{
                          bgcolor: "#fff1f2",
                          color: "#e11d48",
                          borderRadius: "10px",
                          "&:hover": { bgcolor: "#ffe4e6" },
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Card>
                );
              })}

              {currentDaySlots.length < 2 && activeDate && (
                <Button
                  onClick={addSlot}
                  sx={{
                    py: 1.5,
                    borderRadius: "16px",
                    border: "2px dashed #bae6fd",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#0ea5e9",
                    "&:hover": { borderColor: "#0ea5e9", bgcolor: "#f0f9ff" },
                  }}
                >
                  + Thêm khung giờ
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "#e2e8f0" }} />

        {/* DANH SÁCH TỔNG HỢP */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EventAvailableIcon sx={{ color: "#0ea5e9", fontSize: "2.2rem" }} />
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}
            >
              Lịch rảnh của bạn
            </Typography>
          </Box>

          <Grid sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Object.keys(availability).length === 0 ? (
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
                  Chưa có lịch nào được đăng ký
                </Typography>
              </Box>
            ) : (
              Object.keys(availability)
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
                          color: "#0ea5e9",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#0ea5e9",
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
                        {availability[dateStr].map((slot, idx) => (
                          <Box
                            key={idx}
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
                              {slot.start} — {slot.end}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#0369a1",
                                fontWeight: 700,
                              }}
                            >
                              Ca {idx + 1}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                ))
            )}
          </Grid>
        </Box>

        <Button
          disabled={overlapError}
          sx={{
            mt: 6,
            py: 2,
            width: "100%",
            bgcolor: overlapError ? "#cbd5e1" : "#0ea5e9",
            color: "white",
            borderRadius: "16px",
            fontSize: "1.1rem",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: overlapError ? "#cbd5e1" : "#0284c7" },
            transition: "all 0.2s",
          }}
        >
          Xác nhận lưu lịch làm việc
        </Button>
      </Container>
    </Box>
  );
}
