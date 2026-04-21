"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Divider,
  Box,
} from "@mui/material";

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";

// 1. MOCK DATA (Bổ sung thông tin người giúp việc)
const mockBookings = [
  {
    maDon: "DD20231001-001",
    ngayDat: "2023-10-01T14:30:00",
    diaChi: "123 Đường Nguyễn Văn Linh, Đà Nẵng",
    ghiChu: "Nhà có chó dữ, nhớ gọi trước khi đến",
    tongTien: 1500000,
    trangThaiDon: "Đang thực hiện",
    trangThaiThanhToan: "Momo - Đã thanh toán",
    lichSuTrangThai: [
      {
        maLichSu: "LS-1",
        trangThai: "Chờ xác nhận",
        thoiGian: "2023-10-01T14:30:00",
      },
      {
        maLichSu: "LS-2",
        trangThai: "Đã xác nhận",
        thoiGian: "2023-10-01T16:00:00",
      },
      {
        maLichSu: "LS-3",
        trangThai: "Đang thực hiện",
        thoiGian: "2023-10-05T08:00:00",
      },
    ],
    chiTietNgayLamViec: [
      {
        maNgayLamViec: "NL-001",
        ngayThucHien: "2023-10-05",
        gioBatDau: "08:00",
        trangThai: "Đang làm việc",
        nguoiGiupViec: { ten: "Nguyễn Thị Lan", sdt: "0901234567" }, // CÓ NHÂN VIÊN
        dichVus: [
          {
            maDichVu: "DV_DON_DEP",
            tenDichVu: "Dọn dẹp nhà cửa",
            thoiLuong: 2,
          },
        ],
      },
    ],
  },
  {
    maDon: "DD20231002-099",
    ngayDat: "2023-10-02T09:15:00",
    diaChi: "456 Trần Phú, Hải Châu, Đà Nẵng",
    ghiChu: "",
    tongTien: 800000,
    trangThaiDon: "Chờ phân công",
    trangThaiThanhToan: "Tiền mặt - Chưa thanh toán",
    lichSuTrangThai: [
      {
        maLichSu: "LS-4",
        trangThai: "Chờ xác nhận",
        thoiGian: "2023-10-02T09:15:00",
      },
      {
        maLichSu: "LS-5",
        trangThai: "Đã xác nhận",
        thoiGian: "2023-10-02T10:30:00",
      },
    ],
    chiTietNgayLamViec: [
      {
        maNgayLamViec: "NL-003",
        ngayThucHien: "2023-10-03",
        gioBatDau: "09:00",
        trangThai: "Chờ phân công",
        nguoiGiupViec: null, // CHƯA CÓ NHÂN VIÊN
        dichVus: [
          {
            maDichVu: "DV_TONG_VE_SINH",
            tenDichVu: "Tổng vệ sinh",
            thoiLuong: 4,
          },
        ],
      },
    ],
  },
  {
    maDon: "DD20230928-055",
    ngayDat: "2023-09-28T08:00:00",
    diaChi: "101 Điện Biên Phủ, Đà Nẵng",
    ghiChu: "",
    tongTien: 1200000,
    trangThaiDon: "Hoàn thành",
    trangThaiThanhToan: "Tiền mặt - Đã thanh toán",
    lichSuTrangThai: [
      {
        maLichSu: "LS-6",
        trangThai: "Chờ xác nhận",
        thoiGian: "2023-09-28T08:00:00",
      },
      {
        maLichSu: "LS-7",
        trangThai: "Đã xác nhận",
        thoiGian: "2023-09-28T09:00:00",
      },
      {
        maLichSu: "LS-8",
        trangThai: "Đang thực hiện",
        thoiGian: "2023-09-29T08:00:00",
      },
      {
        maLichSu: "LS-9",
        trangThai: "Hoàn thành",
        thoiGian: "2023-09-29T12:00:00",
      },
    ],
    chiTietNgayLamViec: [
      {
        maNgayLamViec: "NL-005",
        ngayThucHien: "2023-09-29",
        gioBatDau: "08:00",
        trangThai: "Đã hoàn thành",
        nguoiGiupViec: { ten: "Trần Thị Bé", sdt: "0987654321" }, // CÓ NHÂN VIÊN
        dichVus: [
          {
            maDichVu: "DV_DON_DEP",
            tenDichVu: "Dọn dẹp nhà cửa",
            thoiLuong: 4,
          },
        ],
      },
    ],
  },
];

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("vi-VN") +
    " - " +
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
};

// 2. DANH SÁCH BỘ LỌC
const statusFilters = [
  "Tất cả",
  "Chờ xác nhận",
  "Chờ phân công",
  "Đã xác nhận",
  "Đang thực hiện",
  "Hoàn thành",
  "Hủy đơn",
];

// 3. HÀM HELPER CHO TIMELINE
const getTimelineConfig = (status: string) => {
  switch (status) {
    case "Chờ xác nhận":
      return {
        icon: <AccessTimeFilledIcon fontSize="small" />,
        color: "text-slate-500",
        bg: "bg-slate-100",
      };
    case "Đã xác nhận":
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        color: "text-teal-600",
        bg: "bg-slate-100",
      };
    case "Đang thực hiện":
      return {
        icon: <PlayCircleFilledIcon fontSize="small" />,
        color: "text-sky-600",
        bg: "bg-slate-100",
      };
    case "Hoàn thành":
      return {
        icon: <TaskAltIcon fontSize="small" />,
        color: "text-teal-600",
        bg: "bg-slate-100",
      };
    case "Hủy đơn":
      return {
        icon: <CancelIcon fontSize="small" />,
        color: "text-slate-700",
        bg: "bg-slate-100",
      };
    default:
      return {
        icon: <AccessTimeFilledIcon fontSize="small" />,
        color: "text-slate-500",
        bg: "bg-slate-100",
      };
  }
};

export default function BookingHistoryPage() {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const filteredBookings = mockBookings.filter((booking) => {
    if (filterStatus === "Tất cả") return true;
    return booking.trangThaiDon === filterStatus;
  });

  return (
    <Box className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
      <Box className="max-w-6xl mx-auto">
        <Typography
          variant="h4"
          className="text-slate-900 font-bold mb-8 text-center"
        >
          Lịch Sử Đặt Dịch Vụ
        </Typography>

        {/* BỘ LỌC TRẠNG THÁI */}
        <Box className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {statusFilters.map((status) => (
            <Chip
              key={status}
              label={status}
              clickable
              onClick={() => setFilterStatus(status)}
              sx={{
                padding: "20px 8px",
                borderRadius: "12px",
                fontWeight: 500,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                ...(filterStatus === status
                  ? {
                      backgroundColor: "#009999",
                      color: "white",
                      border: "none",
                      "&:hover": {
                        backgroundColor: "#007a7a",
                      },
                    }
                  : {
                      backgroundColor: "white",
                      color: "#475569",
                      border: "1.5px solid #cbd5e1",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        borderColor: "#94a3b8",
                      },
                    }),
              }}
            />
          ))}
        </Box>

        {filteredBookings.length === 0 && (
          <Box className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Typography variant="body1" className="text-slate-600">
              Không có đơn đặt dịch vụ nào ở trạng thái {filterStatus}
            </Typography>
          </Box>
        )}

        {/* DANH SÁCH ĐƠN ĐẶT */}
        {filteredBookings.map((booking) => (
          <Accordion
            key={booking.maDon}
            expanded={expanded === booking.maDon}
            onChange={handleChange(booking.maDon)}
            className="mb-5 rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            sx={{ "&:before": { display: "none" } }}
          >
            {/* TÓM TẮT ĐƠN */}
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className="hover:bg-slate-25 transition-colors"
              sx={{
                padding: "20px 24px",
                borderRadius: "32px",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <Box className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Box>
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-teal-600"
                  >
                    Mã đơn: {booking.maDon}
                  </Typography>
                  <Typography variant="body2" className="text-slate-600 mt-1">
                    Ngày đặt: {formatDate(booking.ngayDat)}
                  </Typography>
                </Box>
                <Box className="flex items-center gap-4">
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-slate-900"
                  >
                    {formatVND(booking.tongTien)}
                  </Typography>
                  <Chip
                    label={booking.trangThaiDon}
                    color={
                      booking.trangThaiDon === "Hủy đơn"
                        ? "error"
                        : booking.trangThaiDon === "Hoàn thành"
                          ? "success"
                          : booking.trangThaiDon.includes("Chờ")
                            ? "warning"
                            : "primary"
                    }
                    size="small"
                    className="font-medium"
                  />
                </Box>
              </Box>
            </AccordionSummary>

            {/* CHI TIẾT ĐƠN */}
            <AccordionDetails className="bg-white border-t border-slate-200 p-6 rounded-b-3xl">
              {/* THÔNG TIN CHUNG */}
              <Box className="flex flex-col md:flex-row gap-6 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <Box className="flex-1 flex flex-col gap-5">
                  <Box className="flex items-start gap-3">
                    <LocationOnIcon
                      sx={{ color: "#0ea5e9", fontSize: 20, marginTop: "2px" }}
                    />
                    <Box className="flex-1">
                      <Typography
                        variant="body2"
                        className="text-slate-600 font-semibold"
                      >
                        Địa chỉ thực hiện
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-medium text-slate-900 mt-1"
                      >
                        {booking.diaChi}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="flex items-start gap-3">
                    <EventNoteIcon
                      sx={{ color: "#0ea5e9", fontSize: 20, marginTop: "2px" }}
                    />
                    <Box className="flex-1">
                      <Typography
                        variant="body2"
                        className="text-slate-600 font-semibold"
                      >
                        Ghi chú
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-slate-700 mt-1"
                      >
                        {booking.ghiChu || "Không có ghi chú"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box className="flex-1 flex flex-col gap-5">
                  <Box className="flex items-start gap-3">
                    <AttachMoneyIcon
                      sx={{ color: "#0ea5e9", fontSize: 20, marginTop: "2px" }}
                    />
                    <Box className="flex-1">
                      <Typography
                        variant="body2"
                        className="text-slate-600 font-semibold"
                      >
                        Thanh toán
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-medium text-slate-900 mt-1"
                      >
                        {booking.trangThaiThanhToan}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className="flex flex-col lg:flex-row gap-10 mt-8">
                {/* 1. LỊCH TRÌNH DỊCH VỤ VÀ NGƯỜI GIÚP VIỆC */}
                <Box className="flex-[2]">
                  <Typography
                    variant="h6"
                    className="text-slate-900 font-bold mb-5 text-sm uppercase tracking-wide"
                  >
                    Chi tiết lịch trình
                  </Typography>
                  <Box className="flex flex-col gap-5">
                    {booking.chiTietNgayLamViec.map((day, index) => (
                      <Box
                        key={day.maNgayLamViec}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        {/* Thanh line nhỏ trang trí */}
                        <Box className="absolute top-0 left-0 w-1 h-full bg-teal-600"></Box>

                        <Box className="flex justify-between items-center mb-4 ml-2">
                          <Typography
                            variant="subtitle2"
                            className="font-bold text-slate-900"
                          >
                            Ngày {index + 1}:{" "}
                            {new Date(day.ngayThucHien).toLocaleDateString(
                              "vi-VN",
                            )}{" "}
                            - {day.gioBatDau}
                          </Typography>
                          <Chip
                            label={day.trangThai}
                            size="small"
                            sx={{
                              backgroundColor: day.trangThai.includes("Chờ")
                                ? "#f1f5f9"
                                : "#f0fdf4",
                              color: day.trangThai.includes("Chờ")
                                ? "#475569"
                                : "#065f46",
                              border: "1px solid",
                              borderColor: day.trangThai.includes("Chờ")
                                ? "#cbd5e1"
                                : "#d1fae5",
                              fontWeight: 500,
                            }}
                          />
                        </Box>

                        {/* ========================================== */}
                        {/* THÔNG TIN NGƯỜI GIÚP VIỆC (MỚI THÊM VÀO) */}
                        {/* ========================================== */}
                        <Box className="ml-2 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          {day.nguoiGiupViec ? (
                            <Box className="flex items-center gap-4 flex-1">
                              <Box className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                                <PersonIcon fontSize="small" />
                              </Box>
                              <Box className="flex-1">
                                <Typography
                                  variant="body2"
                                  className="font-bold text-slate-900"
                                >
                                  {day.nguoiGiupViec.ten}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="text-slate-600 flex items-center gap-1 mt-1"
                                >
                                  <PhoneIcon sx={{ fontSize: 12 }} />{" "}
                                  {day.nguoiGiupViec.sdt}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Box className="flex items-center gap-3 opacity-70">
                              <Box className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                <PersonIcon fontSize="small" />
                              </Box>
                              <Typography
                                variant="body2"
                                className="text-slate-600"
                              >
                                Đang chờ hệ thống phân công nhân viên...
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Danh sách dịch vụ trong ngày */}
                        <Box className="pl-4 border-l-2 border-slate-300 ml-2">
                          {day.dichVus.map((svc, idx) => (
                            <Box
                              key={idx}
                              className="flex justify-between items-center py-2"
                            >
                              <Typography
                                variant="body2"
                                className="text-slate-700 font-medium"
                              >
                                • {svc.tenDichVu}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="text-slate-600 bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {svc.thoiLuong} giờ
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* 2. TIMELINE LỊCH SỬ TRẠNG THÁI */}
                <Box className="flex-1">
                  <Typography
                    variant="h6"
                    className="text-slate-900 font-bold mb-5 text-sm uppercase tracking-wide"
                  >
                    Lịch sử trạng thái
                  </Typography>
                  <Box className="relative border-l-2 border-slate-300 ml-4 mt-2">
                    {booking.lichSuTrangThai.map((ls, idx) => {
                      const config = getTimelineConfig(ls.trangThai);
                      const isLast = idx === booking.lichSuTrangThai.length - 1;

                      return (
                        <Box
                          key={ls.maLichSu}
                          className={`relative pl-10 ${isLast ? "" : "pb-7"}`}
                        >
                          <Box
                            className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-300 ${config.color}`}
                          >
                            {config.icon}
                          </Box>

                          <Box>
                            <Typography
                              variant="subtitle2"
                              className={`font-semibold ${isLast ? "text-slate-900" : "text-slate-700"}`}
                            >
                              {ls.trangThai}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-slate-600 block mt-1"
                            >
                              {formatDate(ls.thoiGian)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
