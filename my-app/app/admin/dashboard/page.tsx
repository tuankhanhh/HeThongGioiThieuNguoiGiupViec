"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";

interface Statistics {
  totalUsers: number;
  totalMaids: number;
  totalBookings: number;
  totalRevenue: number;
  pendingProfiles: number;
  pendingBookings: number;
}

interface RevenueItem {
  month: number;
  revenue: number;
  count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/admin/sign-in");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, revRes] = await Promise.all([
        api.get<{ success: boolean; data: Statistics }>("/admin/statistics"),
        api.get<{ success: boolean; data: RevenueItem[] }>("/admin/statistics/revenue")
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (revRes.data) setRevenueData(revRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#312e81", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Đang tải dữ liệu thực tế...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hover-card:hover { transform: translateY(-4px) translateZ(0); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; border-color: #3b82f6 !important; }
        .chart-bar-inner { transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1); will-change: height; }
      `}</style>

      <div className="gpu-accelerated">
        {/* ── Header ── */}
        <div style={{ marginBottom: "32px", animation: "fadeIn 0.3s ease-out both" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Dashboard
        </p>
        <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Tổng quan hệ thống</h2>
        <p style={{ color: "#64748b", marginTop: "6px", fontSize: "16px" }}>Chào mừng trở lại! Dưới đây là tình hình hoạt động hôm nay.</p>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
        gap: "24px", 
        marginBottom: "32px",
        animation: "fadeIn 0.5s ease-out both" 
      }}>
        {[
          { label: "Tổng người dùng", value: stats.totalUsers, sub: "Tài khoản đăng ký", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", bg: "#eff6ff", color: "#3b82f6" },
          { label: "Người giúp việc", value: stats.totalMaids, sub: "Cộng tác viên xác thực", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", bg: "#f0fdf4", color: "#22c55e" },
          { label: "Đơn đặt hàng", value: stats.totalBookings, sub: "Tổng lượt đặt dịch vụ", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", bg: "#fff7ed", color: "#f97316" },
          { label: "Doanh thu", value: `${stats.totalRevenue.toLocaleString()}đ`, sub: "Tổng tiền thực tế", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", bg: "#faf5ff", color: "#a855f7" },
        ].map((card, idx) => (
          <div key={idx} className="hover-card" style={{ 
            background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "flex-start", gap: "20px", transition: "all 0.3s ease"
          }}>
            <div style={{ 
              width: "56px", height: "56px", borderRadius: "14px", background: card.bg, color: card.color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#64748b" }}>{card.label}</p>
              <h3 style={{ margin: "4px 0", fontSize: "26px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{card.value}</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "32px", animation: "fadeIn 0.6s ease-out both" }}>
        {/* ── Revenue Chart Placeholder Design ── */}
        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Biểu đồ doanh thu</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Số liệu thống kê 12 tháng gần nhất</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#3b82f6" }}></span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Doanh thu</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "220px", gap: "8px" }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const monthData = revenueData.find(d => d.month === i + 1);
              const revenue = monthData ? monthData.revenue : 0;
              const maxRev = Math.max(...revenueData.map(d => d.revenue), 100000);
              const height = (revenue / maxRev) * 100;
              
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", background: "#f8fafc", borderRadius: "8px", position: "relative", display: "flex", alignItems: "flex-end" }}>
                    <div className="chart-bar-inner" style={{ 
                      width: "100%", height: `${Math.max(height, 5)}%`, 
                      background: revenue > 0 ? "linear-gradient(to top, #3b82f6, #60a5fa)" : "#e2e8f0",
                      borderRadius: "6px",
                      opacity: revenue > 0 ? 1 : 0.3
                    }}></div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>T{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Action Center ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>Việc cần xử lý</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Hồ sơ chờ duyệt", count: stats.pendingProfiles, path: "/admin/profiles", color: "#3b82f6", bg: "#eff6ff" },
                { label: "Đơn hàng mới", count: stats.pendingBookings, path: "/admin/reports", color: "#f97316", bg: "#fff7ed" },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => router.push(item.path)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9",
                    background: "#f8fafc", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = item.bg; e.currentTarget.style.borderColor = item.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>{item.label}</span>
                  <span style={{ 
                    background: item.color, color: "#fff", padding: "4px 10px", 
                    borderRadius: "10px", fontSize: "12px", fontWeight: 700 
                  }}>{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: "28px", borderRadius: "24px", color: "#fff" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Trợ giúp quản trị</h3>
            <p style={{ fontSize: "13px", opacity: 0.8, lineHeight: 1.5, margin: "0 0 20px" }}>
              Nếu gặp vấn đề trong việc vận hành, hãy liên hệ ngay với bộ phận kỹ thuật để được hỗ trợ.
            </p>
            <button style={{ 
              width: "100%", padding: "12px", borderRadius: "12px", border: "none", 
              background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "14px", 
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            >
              Xem hướng dẫn
            </button>
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}