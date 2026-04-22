"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface MonthlyRevenue {
  month: number;
  revenue: number;
  count: number;
}

const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const monthFullNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

export default function ReportsPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    fetchRevenueData();
  }, [year]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/statistics/revenue?year=${year}`);
      if (response.data.success) {
        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const monthData = response.data.data.find((d: MonthlyRevenue) => d.month === i + 1);
          return { month: i + 1, revenue: monthData?.revenue || 0, count: monthData?.count || 0 };
        });
        setRevenueData(allMonths);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu doanh thu:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = revenueData.reduce((sum, m) => sum + m.count, 0);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "4px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <p style={{ marginTop: "16px", color: "#6366f1", fontWeight: 500 }}>Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes grow { from { height:0; } to { height:var(--h); } } @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>Báo cáo thống kê</h2>
          <p style={{ color: "#6b7280", marginTop: "6px", fontSize: "14px" }}>Doanh thu và đơn đặt dịch vụ theo năm</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>Năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              padding: "9px 14px", borderRadius: "10px",
              border: "1.5px solid rgba(99,102,241,0.2)",
              fontSize: "14px", color: "#1e1b4b", fontWeight: 600,
              background: "#fff", outline: "none", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
            }}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "18px", marginBottom: "28px", animation: "fadeIn 0.4s ease" }}>
        {[
          {
            label: `Tổng doanh thu ${year}`,
            value: `${totalRevenue.toLocaleString("vi-VN")}đ`,
            gradient: "linear-gradient(135deg,#10b981,#059669)",
            shadow: "rgba(16,185,129,0.3)",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="white" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
          {
            label: `Tổng đơn đặt ${year}`,
            value: totalBookings.toString(),
            gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            shadow: "rgba(99,102,241,0.3)",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="white" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
          },
          {
            label: "Trung bình / đơn",
            value: totalBookings > 0 ? `${Math.round(totalRevenue / totalBookings).toLocaleString("vi-VN")}đ` : "—",
            gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
            shadow: "rgba(245,158,11,0.3)",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="white" width="22" height="22"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: "#fff", borderRadius: "16px", padding: "20px",
            boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
            border: "1px solid rgba(99,102,241,0.06)",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: card.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 14px ${card.shadow}` }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>{card.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 700, color: "#1e1b4b" }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 16px rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.06)", marginBottom: "24px", animation: "fadeIn 0.5s ease 0.1s both" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e1b4b", margin: "0 0 24px" }}>
          Biểu đồ doanh thu theo tháng
        </h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px", padding: "0 8px" }}>
          {revenueData.map((data, index) => {
            const heightPct = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={data.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div
                  title={`${monthFullNames[index]}: ${data.revenue.toLocaleString("vi-VN")}đ`}
                  style={{
                    width: "100%", minWidth: "16px",
                    height: `${Math.max(heightPct, 2)}%`,
                    background: heightPct > 60
                      ? "linear-gradient(180deg,#6366f1,#8b5cf6)"
                      : heightPct > 30
                        ? "linear-gradient(180deg,#818cf8,#a5b4fc)"
                        : "linear-gradient(180deg,#c7d2fe,#ddd6fe)",
                    borderRadius: "6px 6px 0 0",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    boxShadow: heightPct > 10 ? "0 -4px 12px rgba(99,102,241,0.25)" : "none",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                />
                <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600 }}>{monthNames[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.06)", animation: "fadeIn 0.5s ease 0.15s both" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#1e1b4b,#3730a3)" }}>
                {["Tháng", "Số đơn", "Doanh thu", "Trung bình / đơn"].map((h) => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(199,210,254,0.9)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data, index) => (
                <tr key={data.month} style={{
                  borderBottom: "1px solid rgba(99,102,241,0.06)",
                  background: index % 2 === 0 ? "#fff" : "rgba(99,102,241,0.015)",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.04)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = index % 2 === 0 ? "#fff" : "rgba(99,102,241,0.015)")}
                >
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#1e1b4b", fontSize: "14px" }}>
                    {monthFullNames[index]}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", padding: "3px 10px", borderRadius: "99px", fontSize: "13px", fontWeight: 600 }}>
                      {data.count}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "#10b981", fontSize: "14px" }}>
                    {data.revenue.toLocaleString("vi-VN")}đ
                  </td>
                  <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: "13px" }}>
                    {data.count > 0 ? `${Math.round(data.revenue / data.count).toLocaleString("vi-VN")}đ` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "linear-gradient(135deg,rgba(30,27,75,0.05),rgba(55,48,163,0.05))", borderTop: "2px solid rgba(99,102,241,0.15)" }}>
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "#1e1b4b", fontSize: "14px" }}>Tổng cộng</td>
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "#1e1b4b" }}>{totalBookings}</td>
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "#059669", fontSize: "15px" }}>
                  {totalRevenue.toLocaleString("vi-VN")}đ
                </td>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: "#374151" }}>
                  {totalBookings > 0 ? `${Math.round(totalRevenue / totalBookings).toLocaleString("vi-VN")}đ` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
