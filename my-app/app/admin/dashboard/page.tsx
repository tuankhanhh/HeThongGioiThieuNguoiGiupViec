"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Statistics {
  totalUsers: number;
  totalMaids: number;
  totalBookings: number;
  totalRevenue: number;
  pendingProfiles: number;
  pendingBookings: number;
}

const statCards = [
  {
    key: "totalUsers" as keyof Statistics,
    label: "Tổng người dùng",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    shadow: "rgba(99,102,241,0.35)",
    light: "rgba(99,102,241,0.08)",
    textColor: "#6366f1",
  },
  {
    key: "totalMaids" as keyof Statistics,
    label: "Người giúp việc",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    shadow: "rgba(236,72,153,0.35)",
    light: "rgba(236,72,153,0.08)",
    textColor: "#ec4899",
  },
  {
    key: "totalBookings" as keyof Statistics,
    label: "Tổng đơn đặt",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    shadow: "rgba(14,165,233,0.35)",
    light: "rgba(14,165,233,0.08)",
    textColor: "#0ea5e9",
  },
  {
    key: "totalRevenue" as keyof Statistics,
    label: "Tổng doanh thu",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    shadow: "rgba(16,185,129,0.35)",
    light: "rgba(16,185,129,0.08)",
    textColor: "#10b981",
    isCurrency: true,
  },
  {
    key: "pendingBookings" as keyof Statistics,
    label: "Đơn chờ xác nhận",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    shadow: "rgba(245,158,11,0.35)",
    light: "rgba(245,158,11,0.08)",
    textColor: "#f59e0b",
  },
  {
    key: "pendingProfiles" as keyof Statistics,
    label: "Hồ sơ chờ duyệt",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    shadow: "rgba(139,92,246,0.35)",
    light: "rgba(139,92,246,0.08)",
    textColor: "#8b5cf6",
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
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/statistics");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              border: "4px solid rgba(99,102,241,0.15)",
              borderTopColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <p style={{ marginTop: "16px", color: "#6366f1", fontWeight: 500 }}>Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>
          Tổng quan hệ thống
        </h2>
        <p style={{ color: "#6b7280", marginTop: "6px", fontSize: "14px" }}>
          Chào mừng trở lại! Đây là tổng quan về hoạt động hệ thống.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
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
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
                border: "1px solid rgba(99,102,241,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                animation: `fadeInUp 0.4s ease ${index * 0.07}s both`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${card.shadow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(99,102,241,0.07)";
              }}
            >
              <div style={{
                width: "52px", height: "52px",
                background: card.gradient,
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 6px 16px ${card.shadow}`,
                color: "white",
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>
                  {card.label}
                </p>
                <p style={{
                  margin: "4px 0 0",
                  fontSize: card.isCurrency ? "20px" : "30px",
                  fontWeight: 700,
                  color: "#1e1b4b",
                  lineHeight: 1.2,
                }}>
                  {displayValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "12px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1e1b4b", margin: "0 0 16px" }}>
          Truy cập nhanh
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          {[
            { label: "Quản lý người dùng", path: "/admin/users", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
            { label: "Quản lý dịch vụ", path: "/admin/services", color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
            { label: "Báo cáo doanh thu", path: "/admin/reports", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => router.push(action.path)}
              style={{
                background: action.bg,
                border: `1px solid ${action.color}20`,
                borderRadius: "12px",
                padding: "16px 20px",
                color: action.color,
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 20px ${action.color}25`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
