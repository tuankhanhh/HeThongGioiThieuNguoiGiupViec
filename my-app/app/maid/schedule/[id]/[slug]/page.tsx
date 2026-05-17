"use client";

import React, { useState, use, useRef, useEffect } from "react";
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
import api from "@/services/api"; // Tích hợp API service

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
    | "Hủy lịch";
}

const WORKER_STATUSES = [
  "Đã phân công",
  "Đang làm việc",
  "Hoàn thành",
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
  const [isUpdating, setIsUpdating] = useState(false); // Trạng thái khóa kéo khi đang lưu DB

  const dragRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  // GỌI API LẤY CHI TIẾT
  useEffect(() => {
    const loadJobDetail = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<Job>(`/v1/maid/job/${resolvedParams.slug}`);
        if (data) {
          setSelectedJob(data);
          setStatus(data.trangThai);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết công việc:", error);
        setSelectedJob(null);
      } finally {
        setIsLoading(false);
      }
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
      "Hủy lịch": {
        color: "text-slate-600",
        bgColor: "bg-slate-50 border-slate-200",
        icon: "✗",
      },
    };
    return configs[s] || configs["Chờ phân công"];
  };

  const currentStatusIndex = WORKER_STATUSES.indexOf(status as any);

  // LOGIC KÉO THẢ CHUỘT
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isUpdating) return;
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === 0 || isUpdating) return;

    const delta = e.clientX - startXRef.current;
    const maxDelta = 120;

    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  const handleMouseUp = async () => {
    if (dragProgress > 0.7 && currentStatusIndex < WORKER_STATUSES.length - 1 && !isUpdating) {
      const nextStatus = WORKER_STATUSES[currentStatusIndex + 1];
      
      try {
        setIsUpdating(true); // Khóa kéo thả trong lúc lưu DB
        // GỌI API LƯU TRẠNG THÁI VÀO C#
        await api.put(`/v1/maid/job/${job.maNgayLamViec}/status`, {
          trangThai: nextStatus,
        });

        setStatus(nextStatus);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái!");
      } finally {
        setIsUpdating(false);
      }
    }
    setDragProgress(0);
    startXRef.current = 0;
  };

  // LOGIC KÉO THẢ TRÊN ĐIỆN THOẠI
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isUpdating) return;
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === 0 || isUpdating) return;

    const delta = e.touches[0].clientX - startXRef.current;
    const maxDelta = 120;

    if (delta > 0) {
      const progress = Math.min(delta / maxDelta, 1);
      setDragProgress(progress);
    } else {
      setDragProgress(0);
    }
  };

  const handleTouchEnd = async () => {
    if (dragProgress > 0.7 && currentStatusIndex < WORKER_STATUSES.length - 1 && !isUpdating) {
      const nextStatus = WORKER_STATUSES[currentStatusIndex + 1];
      
      try {
        setIsUpdating(true);
        await api.put(`/api/v1/maid/job/${job.maNgayLamViec}/status`, {
          trangThai: nextStatus,
        });

        setStatus(nextStatus);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái!");
      } finally {
        setIsUpdating(false);
      }
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
              className={`relative p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg border-2 border-dashed border-slate-300 transition-all overflow-hidden mb-4 ${
                isUpdating ? "cursor-wait opacity-70" : "cursor-grab active:cursor-grabbing"
              }`}
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
                    {isUpdating ? "Đang lưu..." : "Kéo để cập nhật trạng thái"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Kéo từ trái sang phải để chuyển đến trạng thái tiếp theo
                  </p>
                </div>
                {!isUpdating && (
                  <ChevronRight
                    sx={{
                      fontSize: 32,
                      color: `rgba(59, 130, 246, ${0.3 + dragProgress * 0.7})`,
                      transform: `translateX(${dragProgress * 30}px)`,
                      transition: "all 0.2s ease-out",
                    }}
                  />
                )}
              </div>

              {dragProgress > 0 && !isUpdating && (
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
      </div>
    </div>
  );
}