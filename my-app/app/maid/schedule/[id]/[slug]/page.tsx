"use client";

import React, { useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  Phone,
  ChatOutlined,
  AccessTime,
  LocationOn,
  Info,
  ChevronRight,
  Flag,
} from "@mui/icons-material";
// src/data/mockJobs.ts

export interface Job {
  maNgayLamViec: string;
  maDon: string;
  ngayLam: string;
  gioBatDau: string;
  tenDichVu: string;
  hinhAnh: string;
  hoTenKhach: string;
  sdtKhach: string;
  diaChi: string;
  tongTien: number;
  ghiChu: string;
  trangThai:
    | "Chờ phân công"
    | "Đã phân công"
    | "Đang làm việc"
    | "Hoàn thành"
    // | "Không đến làm"
    | "Hủy lịch";
}

export const mockJobs: Job[] = [
  {
    maNgayLamViec: "NLV01",
    maDon: "DD001",
    ngayLam: "2026-06-05",
    gioBatDau: "08:00:00",
    tenDichVu: "Dọn dẹp nhà cửa tiêu chuẩn (3 giờ)",
    hinhAnh: "https://placehold.co/100x100/e0f2fe/0369a1?text=Clean",
    hoTenKhach: "Nguyễn Văn A",
    sdtKhach: "0901234567",
    diaChi: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM",
    tongTien: 180000,
    ghiChu: "Nhà có nuôi chó nhỏ, chú ý khi quét dọn",
    trangThai: "Đã phân công",
  },
  {
    maNgayLamViec: "NLV02",
    maDon: "DD002",
    ngayLam: "2026-06-05",
    gioBatDau: "14:00:00",
    tenDichVu: "Nấu ăn gia đình (Combo 4 món)",
    hinhAnh: "https://placehold.co/100x100/ffedd5/c2410c?text=Cook",
    hoTenKhach: "Trần Thị B",
    sdtKhach: "0987654321",
    diaChi: "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM",
    tongTien: 250000,
    ghiChu: "Khách ăn nhạt, không ăn cay",
    trangThai: "Đang làm việc",
  },
  {
    maNgayLamViec: "NLV03",
    maDon: "DD003",
    ngayLam: "2026-06-05",
    gioBatDau: "18:00:00",
    tenDichVu: "Chăm sóc trẻ em (Buổi tối)",
    hinhAnh: "https://placehold.co/100x100/fce7f3/be185d?text=Baby",
    hoTenKhach: "Lê Hoàng C",
    sdtKhach: "0912333444",
    diaChi: "789 Trần Hưng Đạo, Phường 1, Quận 5, TP. HCM",
    tongTien: 200000,
    ghiChu: "Bé 3 tuổi, cần cho bé ăn và chơi cùng bé",
    trangThai: "Chờ phân công",
  },
];

const WORKER_STATUSES = [
  "Đã phân công",
  "Đang làm việc",
  "Hoàn thành",
  // "Không đến làm",
];

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("Đã phân công");
  const [dragProgress, setDragProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  React.useEffect(() => {
    const loadJobDetail = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const found = mockJobs.find(
        (j) => j.maNgayLamViec === resolvedParams.slug,
      );

      if (found) {
        setSelectedJob(found);
        setStatus(found.trangThai);
      } else {
        setSelectedJob(null);
      }
      setIsLoading(false);
    };

    loadJobDetail();
  }, [resolvedParams.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Đang tải chi tiết công việc...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-col gap-6 px-4">
        <div className="text-center">
          <p className="text-slate-600 font-medium text-lg mb-2">
            Không tìm thấy công việc này
          </p>
          <p className="text-slate-500 text-sm mb-4">
            Mã công việc:{" "}
            <code className="bg-slate-200 px-2 py-1 rounded text-xs">
              {resolvedParams.slug}
            </code>
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const job = selectedJob;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (s: string) => {
    const configs: Record<
      string,
      { color: string; bgColor: string; icon: string }
    > = {
      "Chờ phân công": {
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        icon: "⏱️",
      },
      "Đã phân công": {
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        icon: "✓",
      },
      "Đang làm việc": {
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: "▶",
      },
      "Hoàn thành": {
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 border-emerald-200",
        icon: "✓",
      },
      // "Không đến làm": {
      //   color: "text-red-600",
      //   bgColor: "bg-red-50 border-red-200",
      //   icon: "✗",
      // },
      "Hủy lịch": {
        color: "text-slate-600",
        bgColor: "bg-slate-50 border-slate-200",
        icon: "✗",
      },
    };
    return configs[s] || configs["Chờ phân công"];
  };

  const currentStatusIndex = WORKER_STATUSES.indexOf(status as any);

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === 0) return;

    const delta = e.clientX - startXRef.current;
    const maxDelta = 120;

    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragProgress > 0.7 && currentStatusIndex < WORKER_STATUSES.length - 1) {
      const nextStatus = WORKER_STATUSES[currentStatusIndex + 1];
      setStatus(nextStatus as any);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
    setDragProgress(0);
    startXRef.current = 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === 0) return;

    const delta = e.touches[0].clientX - startXRef.current;
    const maxDelta = 120;

    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragProgress > 0.7 && currentStatusIndex < WORKER_STATUSES.length - 1) {
      const nextStatus = WORKER_STATUSES[currentStatusIndex + 1];
      setStatus(nextStatus as any);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
    setDragProgress(0);
    startXRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-sm"
          >
            <ArrowBack className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Chi tiết công việc
            </h1>
            <p className="text-sm text-slate-500 mt-1">Mã đơn: {job.maDon}</p>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2">
            <p className="text-green-700 font-medium text-sm">
              ✓ Cập nhật trạng thái thành công
            </p>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* CUSTOMER INFO SECTION */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              Thông tin khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Họ và tên
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {job.hoTenKhach}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Số điện thoại
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-slate-800">
                    {job.sdtKhach}
                  </p>
                  <button className="p-2 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all border border-slate-200 hover:border-blue-600">
                    <Phone sx={{ fontSize: 18 }} />
                  </button>
                  <button className="p-2 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all border border-slate-200 hover:border-blue-600">
                    <ChatOutlined sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                <LocationOn sx={{ fontSize: 14 }} className="inline mr-1" />
                Địa chỉ thực hiện
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                {job.diaChi}
              </p>
            </div>
            {job.ghiChu && (
              <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                <p className="text-xs font-semibold text-amber-800 uppercase mb-2 flex items-center gap-2">
                  <Flag sx={{ fontSize: 16 }} />
                  Ghi chú từ khách
                </p>
                <p className="text-sm text-amber-800">{job.ghiChu}</p>
              </div>
            )}
          </div>

          {/* SERVICE INFO SECTION */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              Dịch vụ phân công
            </h2>
            <div className="flex gap-4 mb-6">
              <img
                src={job.hinhAnh}
                alt="service"
                className="w-28 h-28 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {job.tenDichVu}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <AccessTime
                      sx={{ fontSize: 16 }}
                      className="text-blue-500"
                    />
                    <span>
                      Thời gian:{" "}
                      <strong>{job.gioBatDau.substring(0, 5)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Info sx={{ fontSize: 16 }} className="text-slate-400" />
                    <span>Mã ngày làm việc: {job.maNgayLamViec}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                Thu nhập
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(job.tongTien)}
              </p>
            </div>
          </div>

          {/* STATUS UPDATE SECTION - INTERACTIVE SWIPE */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              Cập nhật trạng thái
            </h2>

            {/* CURRENT STATUS BADGE */}
            <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              <p className="text-xs text-slate-600 uppercase font-semibold mb-2">
                Trạng thái hiện tại
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`px-4 py-2 rounded-full font-semibold text-sm border ${getStatusConfig(status).bgColor} ${getStatusConfig(status).color}`}
                >
                  {getStatusConfig(status).icon} {status}
                </div>
              </div>
            </div>

            {/* DRAG TO ADVANCE */}
            <div
              ref={dragRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setDragProgress(0);
                startXRef.current = 0;
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg border-2 border-dashed border-slate-300 cursor-grab active:cursor-grabbing transition-all overflow-hidden mb-4"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${dragProgress * 0.1})`,
              }}
            >
              {/* Progress Bar */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-10 rounded-lg transition-all"
                style={{ width: `${dragProgress * 100}%` }}
              ></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Kéo để cập nhật trạng thái
                  </p>
                  <p className="text-xs text-slate-600">
                    Kéo từ trái sang phải để chuyển đến trạng thái tiếp theo
                  </p>
                </div>
                <ChevronRight
                  sx={{
                    fontSize: 32,
                    color: `rgba(59, 130, 246, ${0.3 + dragProgress * 0.7})`,
                    transform: `translateX(${dragProgress * 30}px)`,
                    transition: "all 0.2s ease-out",
                  }}
                />
              </div>

              {dragProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">
                      {Math.round(dragProgress * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {currentStatusIndex < WORKER_STATUSES.length - 1 && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">
                  Trạng thái tiếp theo:{" "}
                  <strong>{WORKER_STATUSES[currentStatusIndex + 1]}</strong>
                </p>
              </div>
            )}

            {/* WORKFLOW DIAGRAM */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-4">
                Quy trình công việc
              </p>
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                {WORKER_STATUSES.map((s, idx) => (
                  <React.Fragment key={s}>
                    <div
                      className={`flex-1 min-w-min px-3 py-2 rounded-lg text-center text-xs font-medium transition-all whitespace-nowrap ${
                        WORKER_STATUSES.indexOf(status as any) >= idx
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s}
                    </div>
                    {idx < WORKER_STATUSES.length - 1 && (
                      <div
                        className={`w-6 h-1 rounded-full transition-all ${
                          WORKER_STATUSES.indexOf(status as any) > idx
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {/* <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all"
          >
            Quay lại
          </button>
          <button
            onClick={() => {
              setShowSuccessMessage(true);
              setTimeout(() => {
                setShowSuccessMessage(false);
                router.back();
              }, 1500);
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            Lưu & Quay lại
          </button>
        </div> */}
      </div>
    </div>
  );
}
