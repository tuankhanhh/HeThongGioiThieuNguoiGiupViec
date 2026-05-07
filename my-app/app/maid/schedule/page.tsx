"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Business,
  AccessTime,
  CheckCircle,
  WarningAmber,
} from "@mui/icons-material";

interface Job {
  id: string;
  date: string;
  startTime: string;
  serviceType: string;
  customerAddress: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

interface DayStats {
  totalJobs: number;
  inProgress: number;
  completed: number;
  pending: number;
}

const mockJobs: Job[] = [
  {
    id: "1",
    date: "2026-06-05",
    startTime: "08:00",
    serviceType: "Dọn vệ sinh",
    customerAddress: "123 Đường Lê Lợi, Q1",
    status: "completed",
  },
  {
    id: "2",
    date: "2026-06-05",
    startTime: "10:30",
    serviceType: "Giặt ủi",
    customerAddress: "456 Nguyễn Huệ, Q1",
    status: "in_progress",
  },
  {
    id: "3",
    date: "2026-06-06",
    startTime: "09:00",
    serviceType: "Nấu ăn",
    customerAddress: "789 Trần Hưng Đạo, Q5",
    status: "pending",
  },
  {
    id: "4",
    date: "2026-06-08",
    startTime: "14:00",
    serviceType: "Dọn vệ sinh",
    customerAddress: "101 Đinh Tiên Hoàng, Q2",
    status: "pending",
  },
  {
    id: "5",
    date: "2026-06-10",
    startTime: "08:00",
    serviceType: "Chăm sóc trẻ",
    customerAddress: "202 Calmette, Q1",
    status: "completed",
  },
  {
    id: "6",
    date: "2026-06-12",
    startTime: "11:00",
    serviceType: "Dọn vệ sinh",
    customerAddress: "303 Pasteur, Q3",
    status: "completed",
  },
  {
    id: "7",
    date: "2026-06-15",
    startTime: "09:00",
    serviceType: "Giặt ủi",
    customerAddress: "404 Võ Văn Kiệt, Q4",
    status: "pending",
  },
  {
    id: "8",
    date: "2026-06-20",
    startTime: "10:00",
    serviceType: "Nấu ăn",
    customerAddress: "505 Nguyễn Thị Minh Khai, Q2",
    status: "pending",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [stats] = useState<DayStats>({
    totalJobs: mockJobs.length,
    inProgress: mockJobs.filter((j) => j.status === "in_progress").length,
    completed: mockJobs.filter((j) => j.status === "completed").length,
    pending: mockJobs.filter((j) => j.status === "pending").length,
  });

  const jobsByDate = useMemo(() => {
    const map = new Map<string, Job[]>();
    mockJobs.forEach((job) => {
      if (!map.has(job.date)) map.set(job.date, []);
      map.get(job.date)!.push(job);
    });
    return map;
  }, []);

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

  // Lấy chuỗi tên tháng gốc (ví dụ: "tháng 6, 2026")
  const rawMonthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  // Viết hoa chữ cái đầu tiên (ví dụ: "Tháng 6, 2026")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lịch Trình Công Việc
          </h1>
          <p className="text-gray-600">
            Quản lý lịch làm việc và công việc hàng ngày
          </p>
        </div>

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
            label="Hoàn Thành"
            value={stats.completed}
            color="green"
          />
          <StatsCard
            icon={<WarningAmber sx={{ width: 24, height: 24 }} />}
            label="Chờ Xử Lý"
            value={stats.pending}
            color="orange"
          />
        </div>

        <div className="w-full bg-white rounded-2xl shadow-lg p-8 border border-cyan-100">
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
