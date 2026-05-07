"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  Search,
  ChatOutlined,
  Phone,
  AccessTime,
  LocationOn,
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
    | "Không đến làm"
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

const TABS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Chờ phân công", value: "Chờ phân công" },
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

  let filteredJobs = mockJobs.filter((job) => job.ngayLam === selectedDate);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.push("/maid/schedule")}
            className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-sm"
          >
            <ArrowBack className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Công việc hôm nay
            </h1>
            <p className="text-sm text-slate-500 mt-1">{dateStr}</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search sx={{ fontSize: 20 }} />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên khách, mã đơn hoặc dịch vụ..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* JOBS LIST */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
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
            <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
              <p className="text-slate-500 font-medium">
                Không có công việc nào
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Thử thay đổi bộ lọc hoặc tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; bgColor: string; label: string }
    > = {
      "Chờ phân công": {
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        label: "⏱️ Chờ phân công",
      },
      "Đã phân công": {
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        label: "✓ Đã phân công",
      },
      "Đang làm việc": {
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        label: "▶ Đang làm việc",
      },
      "Hoàn thành": {
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 border-emerald-200",
        label: "✓✓ Hoàn thành",
      },
      "Không đến làm": {
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        label: "✗ Không đến làm",
      },
      "Hủy lịch": {
        color: "text-slate-600",
        bgColor: "bg-slate-50 border-slate-200",
        label: "✗ Hủy lịch",
      },
    };
    return configs[status] || configs["Chờ phân công"];
  };

  const statusConfig = getStatusConfig(job.trangThai);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
    >
      {/* TOP SECTION - Customer & Status */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={job.hinhAnh}
            alt={job.tenDichVu}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 group-hover:border-blue-300 transition-colors"
          />
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              {job.hoTenKhach}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Mã: {job.maDon}</p>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bgColor} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </div>
      </div>

      {/* MIDDLE SECTION - Service & Time Info */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h4 className="font-medium text-slate-800 text-sm leading-snug mb-3">
          {job.tenDichVu}
        </h4>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <AccessTime sx={{ fontSize: 16 }} className="text-blue-500" />
            <span className="font-medium">{job.gioBatDau.substring(0, 5)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 flex-1 min-w-0">
            <LocationOn
              sx={{ fontSize: 16 }}
              className="text-slate-400 flex-shrink-0"
            />
            <span className="truncate text-xs">{job.diaChi}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION - Price & Actions */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">Giá dịch vụ</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(job.tongTien)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-2.5 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all border border-slate-200 hover:border-blue-600"
            title="Chat với khách"
          >
            <ChatOutlined sx={{ fontSize: 18 }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-2.5 hover:bg-green-600 hover:text-white text-slate-600 rounded-lg transition-all border border-slate-200 hover:border-green-600"
            title="Gọi điện"
          >
            <Phone sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
