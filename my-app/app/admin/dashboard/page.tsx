"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface Statistics {
  totalUsers: number;
  totalMaids: number;
  totalBookings: number;
  totalRevenue: number;
  pendingProfiles: number;
  pendingBookings: number;
}

// ✅ Dữ liệu tĩnh từ CSDL (DAPM.sql seed data)
const MOCK_STATISTICS: Statistics = {
  totalUsers: 8,
  totalMaids: 2,
  totalBookings: 9,
  totalRevenue: 2770000,
  pendingProfiles: 1,
  pendingBookings: 2,
};

const statCards = [
  {
    key: "totalUsers" as keyof Statistics,
    label: "Tổng người dùng",
    sub: "4 KH · 2 GV · 1 NV · 1 Admin",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
    valueColor: "#1e1b4b",
  },
  {
    key: "totalMaids" as keyof Statistics,
    label: "Người giúp việc",
    sub: "GV001, GV002",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    iconBg: "#FBEAF0",
    iconColor: "#993556",
    valueColor: "#1e1b4b",
  },
  {
    key: "totalBookings" as keyof Statistics,
    label: "Tổng đơn đặt",
    sub: "DD001 → DD009",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
    valueColor: "#1e1b4b",
  },
  {
    key: "totalRevenue" as keyof Statistics,
    label: "Tổng doanh thu",
    sub: "↑ Tổng tích lũy",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "#EAF3DE",
    iconColor: "#3B6D11",
    valueColor: "#1e1b4b",
    isCurrency: true,
  },
  {
    key: "pendingBookings" as keyof Statistics,
    label: "Đơn chờ xác nhận",
    sub: "DD008, DD009",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
    valueColor: "#854F0B",
  },
  {
    key: "pendingProfiles" as keyof Statistics,
    label: "Hồ sơ chờ duyệt",
    sub: "HS002 — cần xem xét",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
    valueColor: "#534AB7",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/admin/sign-in");
      return;
    }
    // ✅ Dùng mock data tĩnh — không cần gọi API
    setTimeout(() => {
      setStats(MOCK_STATISTICS);
      setLoading(false);
    }, 400);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid #EEEDFE",
              borderTopColor: "#534AB7",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <p style={{ marginTop: "12px", color: "#534AB7", fontWeight: 500, fontSize: "14px" }}>
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "#EAF3DE", color: "#3B6D11",
          fontSize: "11px", fontWeight: 600,
          padding: "3px 10px", borderRadius: "20px",
          marginBottom: "10px", letterSpacing: "0.03em",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B6D11", display: "inline-block" }} />
          Hệ thống đang hoạt động
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#1e1b4b", margin: 0, lineHeight: 1.3 }}>
          Tổng quan hệ thống
        </h2>
        <p style={{ color: "#9ca3af", marginTop: "4px", fontSize: "13px" }}>
          Chào mừng trở lại! Đây là tổng quan về hoạt động hệ thống.
        </p>
      </div>

      {/* Section Label */}
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "14px" }}>
        Thống kê chính
      </p>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "12px",
        marginBottom: "28px",
      }}>
        {statCards.map((card, index) => {
          const value = stats?.[card.key] ?? 0;
          const displayValue = card.isCurrency
            ? `${(value as number).toLocaleString("vi-VN")}đ`
            : value;

          return (
            <div
              key={card.key}
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "18px 20px",
                border: "0.5px solid #e5e7eb",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                animation: `fadeInUp 0.35s ease ${index * 0.06}s both`,
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div style={{
                width: "40px", height: "40px",
                background: card.iconBg,
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                color: card.iconColor,
              }}>
                {card.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>
                  {card.label}
                </p>
                <p style={{
                  margin: "3px 0 0",
                  fontSize: card.isCurrency ? "18px" : "26px",
                  fontWeight: 600,
                  color: card.valueColor,
                  lineHeight: 1.2,
                }}>
                  {displayValue}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: "0.5px", background: "#f3f4f6", marginBottom: "20px" }} />

      {/* Quick Actions */}
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "14px" }}>
        Truy cập nhanh
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "10px" }}>
        {[
          {
            label: "Quản lý người dùng",
            desc: "Xem, chỉnh sửa tài khoản",
            path: "/admin/users",
            iconBg: "#EEEDFE", iconColor: "#534AB7",
            icon: (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
          {
            label: "Quản lý dịch vụ",
            desc: "Cập nhật danh mục dịch vụ",
            path: "/admin/services",
            iconBg: "#FBEAF0", iconColor: "#993556",
            icon: (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
          },
          {
            label: "Báo cáo doanh thu",
            desc: "Xem thống kê tài chính",
            path: "/admin/reports",
            iconBg: "#EAF3DE", iconColor: "#3B6D11",
            icon: (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => router.push(action.path)}
            style={{
              background: "#fff",
              border: "0.5px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px 18px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "32px", height: "32px",
              background: action.iconBg,
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: action.iconColor,
            }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e1b4b" }}>
                {action.label}
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                {action.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </AdminLayout>
  );
}