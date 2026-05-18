"use client";

import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  Search,
  ChatOutlined,
  Phone,
  LocationOn,
  NotesOutlined,
  TimerOutlined,
  PersonOutline,
  AttachMoney,
  AccessTime,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

import api from "@/services/api";

export interface Job {
  maNgayLamViec: string;
  maDon: string;
  ngayLam: string;
  gioBatDau: string;
  gioKetThuc: string;
  thoiLuongThucHien: number;
  tenDichVu: string;
  hinhAnh: string;
  hoTenKhach: string;
  sdtKhach: string;
  diaChi: string;
  tongTien: number;
  ghiChu: string;
  trangThai: string;
}

const TABS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Đã phân công", value: "Đã phân công" },
  { label: "Đang làm việc", value: "Đang làm việc" },
];

export default function DailyJobsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const selectedDate = resolvedParams.id;

  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDailyJobs = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<Job[]>(`/v1/maid/schedule/${selectedDate}`);
        setJobs(data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu công việc trong ngày:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyJobs();
  }, [selectedDate]);

  // Lọc và sắp xếp
  let filteredJobs = [...jobs];

  if (activeTab !== "Tất cả") {
    filteredJobs = filteredJobs.filter((job) => job.trangThai === activeTab);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.hoTenKhach.toLowerCase().includes(q) ||
        job.maDon.toLowerCase().includes(q) ||
        job.tenDichVu.toLowerCase().includes(q),
    );
  }

  // Sắp xếp sớm làm trước
  filteredJobs.sort((a, b) => a.gioBatDau.localeCompare(b.gioBatDau));

  const dateObj = new Date(selectedDate);
  const dateStr = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Ngày không hợp lệ";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 px-4 md:p-8 rounded-3xl">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push("/maid/schedule")}
            className="p-2 bg-white hover:bg-slate-50 rounded-lg transition-all shadow-sm border border-slate-200 cursor-pointer"
          >
            <ArrowBack className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{dateStr}</h1>
          </div>
        </div>

        {/* SEARCH BAR & TABS CÙNG 1 KHỐI (Giống form Lịch sử đơn) */}
        <div className="mb-6 border-b border-slate-200 pb-6">
          <div className="mb-4 relative max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search sx={{ fontSize: 20 }} />
            </div>
            <input
              type="text"
              placeholder="Tìm theo khách hàng, dịch vụ, mã đơn..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const count =
                tab.value === "Tất cả"
                  ? jobs.length
                  : jobs.filter((j) => j.trangThai === tab.value).length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* JOBS LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <CircularProgress className="text-blue-600" />
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.maNgayLamViec}
                job={job}
                onClick={() =>
                  router.push(
                    `/maid/schedule/${selectedDate}/${job.maNgayLamViec}`,
                  )
                }
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <NotesOutlined
                  sx={{ fontSize: 32 }}
                  className="text-slate-400"
                />
              </div>
              <p className="text-lg text-slate-600 font-medium">
                Không có công việc nào
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Thử thay đổi bộ lọc hoặc tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BỘ CẤU HÌNH TRẠNG THÁI (Đồng bộ chuẩn UI Lịch Sử Đơn)
const statusConfig = {
  "Đã phân công": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "border-blue-200 bg-blue-100",
  },
  "Đang làm việc": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "border-yellow-200 bg-yellow-100",
  },
  "Hoàn thành": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "border-emerald-200 bg-emerald-100",
  },
  "Hủy lịch": {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "border-red-200 bg-red-100",
  },
  "Chờ phân công": {
    bg: "bg-gray-50",
    text: "text-gray-700",
    badge: "border-gray-200 bg-gray-100",
  },
};

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const config =
    statusConfig[job.trangThai as keyof typeof statusConfig] ||
    statusConfig["Chờ phân công"];

  const timeStart = job.gioBatDau?.substring(0, 5) || "--:--";
  const timeEnd = job.gioKetThuc?.substring(0, 5) || "--:--";

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-6">
        {/* HEADER: BADGES */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Tên dịch vụ (Dạng list Badge) */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-semibold rounded-md border border-teal-100">
              {job.tenDichVu}
            </span>
          </div>
          {/* Trạng thái */}
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.badge} ${config.text}`}
            >
              {job.trangThai}
            </span>
          </div>
        </div>

        {/* LINE DIVIDER */}
        <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-4"></div>

        {/* THÔNG TIN LƯỚI (GRID 4 CỘT) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Cột 1: Khách hàng */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
              <PersonOutline className="text-blue-600" sx={{ fontSize: 20 }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Khách hàng</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {job.hoTenKhach}
              </p>
            </div>
          </div>

          {/* Cột 2: Khung giờ */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg flex-shrink-0">
              <AccessTime className="text-indigo-600" sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời gian</p>
              <p className="text-sm font-semibold text-slate-900">
                {timeStart} - {timeEnd}
              </p>
            </div>
          </div>

          {/* Cột 3: Thời lượng */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
              <TimerOutlined className="text-amber-600" sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thời lượng</p>
              <p className="text-sm font-semibold text-slate-900">
                {job.thoiLuongThucHien} giờ
              </p>
            </div>
          </div>

          {/* Cột 4: Thu nhập */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">
              <AttachMoney className="text-emerald-600" sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thu nhập</p>
              <p className="text-sm font-bold text-emerald-600">
                {formatCurrency(job.tongTien)}
              </p>
            </div>
          </div>
        </div>

        {/* PHẦN MỞ RỘNG: ĐỊA CHỈ & GHI CHÚ */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <LocationOn
              className="text-slate-400 flex-shrink-0 mt-0.5"
              sx={{ fontSize: 18 }}
            />
            <span className="text-sm font-medium text-slate-700 leading-snug">
              {job.diaChi}
            </span>
          </div>
        </div>

        {/* LINE DIVIDER */}
        <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-4"></div>

        {/* BOTTOM SECTION: MÃ ĐƠN & ACTIONS */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mã đơn:{" "}
            <span className="font-mono font-semibold text-slate-900">
              {job.maDon}
            </span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Action Chat
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors duration-200 text-sm cursor-pointer border border-blue-100"
            >
              <ChatOutlined sx={{ fontSize: 18 }} />
              <span className="hidden sm:inline">Nhắn tin</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${job.sdtKhach}`;
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-semibold hover:bg-green-100 transition-colors duration-200 text-sm cursor-pointer border border-green-100"
            >
              <Phone sx={{ fontSize: 18 }} />
              <span className="hidden sm:inline">Gọi điện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
