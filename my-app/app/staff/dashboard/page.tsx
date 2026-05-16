"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface StatsCard {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  iconBg: string;
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
      color: "from-amber-50 to-orange-50 border-amber-200",
      iconBg: "bg-amber-100",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: "Chờ xác nhận",
      value: loading ? "..." : stats.choXacNhan,
      sub: "Cần phân công",
      color: "from-yellow-50 to-amber-50 border-yellow-200",
      iconBg: "bg-yellow-100",
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Đã xác nhận",
      value: loading ? "..." : stats.daXacNhan,
      sub: "Đang tiến hành",
      color: "from-blue-50 to-indigo-50 border-blue-200",
      iconBg: "bg-blue-100",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Đơn đã hủy",
      value: loading ? "..." : stats.huyDon,
      sub: "Từ chối hoặc hủy",
      color: "from-red-50 to-rose-50 border-red-200",
      iconBg: "bg-red-100",
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const shortcuts = [
    {
      title: "Kiểm duyệt hồ sơ",
      desc: "Xem và xét duyệt hồ sơ người giúp việc đang chờ",
      href: "/staff/ho-so-cho-duyet",
      btnText: "Xem danh sách",
      accent: "border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-white",
      iconBg: "bg-amber-100",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Yêu cầu dịch vụ",
      desc: "Xem danh sách yêu cầu và phân công người giúp việc",
      href: "/staff/yeu-cau-dat-dich-vu",
      btnText: "Xem danh sách",
      accent: "border-l-indigo-400 bg-gradient-to-r from-indigo-50/50 to-white",
      iconBg: "bg-indigo-100",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: "Khiếu nại",
      desc: "Xem và xử lý khiếu nại từ khách hàng",
      href: "/staff/khieu-nai",
      btnText: "Xem danh sách",
      accent: "border-l-rose-400 bg-gradient-to-r from-rose-50/50 to-white",
      iconBg: "bg-rose-100",
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 4h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 leading-tight">Dashboard</h1>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Tổng quan hoạt động của nhân viên
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-[30px] font-bold text-slate-800 leading-none">{card.value}</p>
              <p className="text-[12px] font-semibold text-slate-600 mt-1.5">{card.label}</p>
              {card.sub && (
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-slate-700">Truy cập nhanh</h2>
        <p className="text-[12.5px] text-slate-400 mt-0.5">Chuyển đến các mục quản lý chính</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shortcuts.map((s) => (
          <div
            key={s.href}
            className={`${s.accent} rounded-2xl border border-slate-200 border-l-4 p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200 cursor-pointer group`}
            onClick={() => router.push(s.href)}
          >
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-[14px] mb-1">{s.title}</p>
              <p className="text-[12px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(s.href); }}
              className="self-start text-[12.5px] font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-150 cursor-pointer group-hover:shadow-sm"
            >
              {s.btnText} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
