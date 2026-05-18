"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Business,
  AccessTime,
  CheckCircle,
  WarningAmber,
} from "@mui/icons-material";

// Import apiService mà bạn đã định nghĩa
import api from "@/services/api";

// Cập nhật Interface khớp với dữ liệu JSON trả về từ API C#
interface Job {
  maCongViec: string;
  ngay: string;
  gioBatDau: string;
  loaiDichVu: string;
  diaChiKhachHang: string;
  trangThai: string;
}

// Cập nhật tên các thống kê để khớp với logic nghiệp vụ
interface DayStats {
  totalJobs: number;
  inProgress: number;
  assigned: number;
  cancelled: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gọi API mỗi khi thay đổi tháng/năm
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // Dùng apiService để gọi GET, tự động handle token và lỗi
        const data = await api.get<Job[]>(
          `/v1/maid/schedule?year=${year}&month=${month}`,
        );
        setJobs(data || []);
      } catch (error) {
        console.error("Lỗi khi tải lịch làm việc:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentDate]);

  // Tính toán số lượng cho 4 thẻ thống kê ở trên
  const stats: DayStats = useMemo(() => {
    return {
      totalJobs: jobs.length,
      inProgress: jobs.filter((j) => j.trangThai === "Đang làm việc").length,
      assigned: jobs.filter((j) => j.trangThai === "Đã phân công").length,
      cancelled: jobs.filter((j) => j.trangThai === "Hủy lịch").length,
    };
  }, [jobs]);

  // Gom nhóm công việc theo ngày để đánh dấu trên lịch
  const jobsByDate = useMemo(() => {
    const map = new Map<string, Job[]>();
    jobs.forEach((job) => {
      if (!map.has(job.ngay)) map.set(job.ngay, []);
      map.get(job.ngay)!.push(job);
    });
    return map;
  }, [jobs]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  const prevMonthDays = getDaysInMonth(
    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
  );
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const formatDateStr = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const hasJobsOnDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const dateStr = formatDateStr(day);
    return jobsByDate.has(dateStr);
  };

  const rawMonthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const monthName =
    rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 rounded-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lịch Trình Công Việc
          </h1>
          <p className="text-gray-600">
            Quản lý lịch làm việc và công việc hàng ngày
          </p>
        </div>

        {/* Cập nhật nhãn thống kê để khớp với dữ liệu API nhưng giữ nguyên Layout & Icon */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Business sx={{ width: 24, height: 24 }} />}
            label="Tổng Công Việc"
            value={stats.totalJobs}
            color="blue"
          />
          <StatsCard
            icon={<AccessTime sx={{ width: 24, height: 24 }} />}
            label="Đang Thực Hiện"
            value={stats.inProgress}
            color="amber"
          />
          <StatsCard
            icon={<CheckCircle sx={{ width: 24, height: 24 }} />}
            label="Đã Phân Công"
            value={stats.assigned}
            color="green"
          />
          <StatsCard
            icon={<WarningAmber sx={{ width: 24, height: 24 }} />}
            label="Hủy Lịch"
            value={stats.cancelled}
            color="orange"
          />
        </div>

        <div className="w-full bg-white rounded-2xl shadow-lg p-8 border border-cyan-100 relative">
          {/* Hiệu ứng mờ khi đang tải dữ liệu API */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl transition-all duration-300">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ChevronLeft sx={{ width: 24, height: 24, color: "#0369a1" }} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ChevronRight
                  sx={{ width: 24, height: 24, color: "#0369a1" }}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-4">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {days.map((dayObj, idx) => {
              const hasJobs = hasJobsOnDate(dayObj.day, dayObj.isCurrentMonth);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasJobs) {
                      const dateQuery = formatDateStr(dayObj.day);
                      router.push(`/maid/schedule/${dateQuery}`);
                    }
                  }}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center font-semibold text-lg
                    transition-all duration-200 relative
                    ${
                      dayObj.isCurrentMonth
                        ? hasJobs
                          ? "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md cursor-pointer"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        : "bg-gray-50 text-gray-300"
                    }
                  `}
                >
                  <span>{dayObj.day}</span>
                  {hasJobs && (
                    <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "amber" | "orange";
}

function StatsCard({ icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>
    </div>
  );
}
