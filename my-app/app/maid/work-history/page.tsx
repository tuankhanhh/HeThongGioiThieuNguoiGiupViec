"use client";

import React, { useState, useEffect } from "react";
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
  CalendarMonth,
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

// CẬP NHẬT ĐẦY ĐỦ CÁC TRẠNG THÁI
const TABS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Đã phân công", value: "Đã phân công" },
  { label: "Đang làm việc", value: "Đang làm việc" },
  { label: "Hoàn thành", value: "Hoàn thành" },
  { label: "Không đến làm", value: "Không đến làm" },
  { label: "Hủy lịch", value: "Hủy lịch" },
];

export default function AllHistoryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GỌI API LẤY TẤT CẢ LỊCH SỬ
  useEffect(() => {
    const fetchAllJobsHistory = async () => {
      setIsLoading(true);
      try {
        // Đổi endpoint thành API lấy tất cả lịch sử bạn vừa tạo
        const response: any = await api.get(`/v1/maid/history`);
        const data = response?.data || response;
        setJobs(data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lịch sử công việc:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllJobsHistory();
  }, []);

  // Lọc dữ liệu theo tab và từ khóa
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
        job.tenDichVu.toLowerCase().includes(q) ||
        job.maNgayLamViec.toLowerCase().includes(q),
    );
  }

  // API đã sort sẵn theo thời gian (mới nhất lên đầu),
  // ta có thể giữ nguyên thứ tự API trả về hoặc custom sort lại ở client nếu cần.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 px-4 md:p-8 rounded-3xl">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white hover:bg-slate-50 rounded-lg transition-all shadow-sm border border-slate-200 cursor-pointer"
          >
            <ArrowBack className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Lịch sử công việc
            </h1>
          </div>
        </div>

        {/* SEARCH BAR & TABS */}
        <div className="mb-6 border-b border-slate-200 pb-4">
          {/* Khung tìm kiếm */}
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

          {/* Thanh cuộn Tabs để trên mobile không bị tràn dòng */}
          <div
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
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
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer text-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={`ml-1 text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}
                  >
                    ({count})
                  </span>
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
                  router.push(`/maid/work-history/${job.maNgayLamViec}`)
                }
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <NotesOutlined
                  sx={{ fontSize: 32 }}
                  className="text-slate-400"
                />
              </div>
              <p className="text-lg text-slate-700 font-bold">
                Không tìm thấy công việc nào
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BỘ CẤU HÌNH TRẠNG THÁI (Đồng bộ với các trạng thái mới)
const statusConfig = {
  "Đã phân công": {
    text: "text-blue-700",
    badge: "border-blue-200 bg-blue-50",
  },
  "Đang làm việc": {
    text: "text-purple-700",
    badge: "border-purple-200 bg-purple-50",
  },
  "Hoàn thành": {
    text: "text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50",
  },
  "Không đến làm": {
    text: "text-red-700",
    badge: "border-red-200 bg-red-50",
  },
  "Hủy lịch": {
    text: "text-rose-700",
    badge: "border-rose-200 bg-rose-50",
  },
  "Chờ phân công": {
    text: "text-amber-700",
    badge: "border-amber-200 bg-amber-50",
  },
};

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format ngày tháng hiển thị
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "---";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return dateObj.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const config =
    statusConfig[job.trangThai as keyof typeof statusConfig] ||
    statusConfig["Chờ phân công"];

  const timeStart = job.gioBatDau?.substring(0, 5) || "--:--";
  const timeEnd = job.gioKetThuc?.substring(0, 5) || "--:--";

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-5 md:p-6">
        {/* HEADER: DỊCH VỤ & TRẠNG THÁI */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-semibold rounded-md border border-teal-100">
                {job.tenDichVu}
              </span>
            </div>
            {/* THÊM HIỂN THỊ NGÀY LÀM VIỆC VÌ LÀ TRANG LỊCH SỬ TỔNG HỢP */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <CalendarMonth sx={{ fontSize: 14 }} className="text-slate-400" />
              {formatDateDisplay(job.ngayLam)}
            </div>
          </div>

          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-semibold border shadow-sm ${config.badge} ${config.text}`}
            >
              {job.trangThai}
            </span>
          </div>
        </div>

        {/* LINE DIVIDER */}
        <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-4"></div>

        {/* THÔNG TIN LƯỚI (GRID 4 CỘT TRÊN DEKSTOP / 2 CỘT MOBILE) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Cột 1: Khách hàng */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
              <PersonOutline className="text-blue-600" sx={{ fontSize: 20 }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">
                Khách hàng
              </p>
              <p className="text-sm font-bold text-slate-900 truncate">
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
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">
                Thời gian
              </p>
              <p className="text-sm font-bold text-slate-900">
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
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">
                Thời lượng
              </p>
              <p className="text-sm font-bold text-slate-900">
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
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">
                Thu nhập
              </p>
              <p className="text-sm font-black text-emerald-600">
                {formatCurrency(job.tongTien)}
              </p>
            </div>
          </div>
        </div>

        {/* PHẦN MỞ RỘNG: ĐỊA CHỈ & GHI CHÚ */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <LocationOn
              className="text-slate-400 flex-shrink-0 mt-0.5"
              sx={{ fontSize: 18 }}
            />
            <span className="text-sm font-medium text-slate-700 leading-snug">
              {job.diaChi}
            </span>
          </div>

          {job.ghiChu && (
            <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
              <NotesOutlined
                className="text-amber-600 flex-shrink-0 mt-0.5"
                sx={{ fontSize: 18 }}
              />
              <span className="text-sm font-medium text-amber-800 leading-snug italic">
                {job.ghiChu}
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: MÃ ĐƠN & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Mã ngày làm việc:{" "}
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded ml-1">
              {job.maNgayLamViec}
            </span>
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Logic nhắn tin nếu có
              }}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-colors text-sm border border-blue-100 cursor-pointer"
            >
              <ChatOutlined sx={{ fontSize: 18 }} />
              <span>Nhắn tin</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${job.sdtKhach}`;
              }}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-colors text-sm border border-green-100 cursor-pointer"
            >
              <Phone sx={{ fontSize: 18 }} />
              <span>Gọi điện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
