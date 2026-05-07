"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface StatsCard {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    choDuyet: 0,
    choXacNhan: 0,
    daXacNhan: 0,
    huyDon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hoSoRes, donRes] = await Promise.all([
          api.get<any>("/v1/staff/ho-so-cho-duyet"),
          api.get<any>("/v1/staff/danh-sach-yeu-cau"),
        ]);

        const allDon: any[] = donRes?.data ?? [];
        setStats({
          choDuyet: hoSoRes?.data?.length ?? 0,
          choXacNhan: allDon.filter(
            (d) => d.trangThaiHienTai === "Chờ xác nhận",
          ).length,
          daXacNhan: allDon.filter((d) => d.trangThaiHienTai === "Đã xác nhận")
            .length,
          huyDon: allDon.filter((d) => d.trangThaiHienTai === "Hủy đơn").length,
        });
      } catch {
        // Silently fail - staff may not have data yet
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards: StatsCard[] = [
    {
      label: "Hồ sơ chờ duyệt",
      value: loading ? "..." : stats.choDuyet,
      sub: "Người giúp việc mới",
      color: "bg-amber-50 border-amber-200 text-amber-700",
      icon: (
        <svg
          className="w-6 h-6 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      label: "Yêu cầu chờ xác nhận",
      value: loading ? "..." : stats.choXacNhan,
      sub: "Cần phân công",
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: (
        <svg
          className="w-6 h-6 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Đã xác nhận",
      value: loading ? "..." : stats.daXacNhan,
      sub: "Đang tiến hành",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      icon: (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Đơn đã hủy",
      value: loading ? "..." : stats.huyDon,
      sub: "Từ chối hoặc hủy",
      color: "bg-red-50 border-red-200 text-red-700",
      icon: (
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const shortcuts = [
    {
      title: "Kiểm duyệt hồ sơ",
      desc: "Xem và xét duyệt hồ sơ người giúp việc đang chờ",
      href: "/staff/ho-so-cho-duyet",
      btnText: "Đi đến",
      color: "border-l-amber-400",
    },
    {
      title: "Yêu cầu dịch vụ",
      desc: "Xem danh sách yêu cầu và phân công người giúp việc",
      href: "/staff/yeu-cau-dat-dich-vu",
      btnText: "Đi đến",
      color: "border-l-indigo-400",
    },
    {
      title: "Khiếu nại",
      desc: "Xem và xử lý khiếu nại từ khách hàng",
      href: "/staff/khieu-nai",
      btnText: "Đi đến",
      color: "border-l-red-400",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tổng quan hoạt động của nhân viên
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 flex flex-col gap-3 ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium opacity-70">
                {card.label}
              </span>
              {card.icon}
            </div>
            <div>
              <p className="text-3xl font-bold">{card.value}</p>
              {card.sub && (
                <p className="text-xs opacity-60 mt-0.5">{card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <h2 className="text-base font-semibold text-slate-700 mb-3">
        Truy cập nhanh
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shortcuts.map((s) => (
          <div
            key={s.href}
            className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-5 flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">
                {s.title}
              </p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
            <button
              onClick={() => router.push(s.href)}
              className="shrink-0 ml-4 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {s.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
