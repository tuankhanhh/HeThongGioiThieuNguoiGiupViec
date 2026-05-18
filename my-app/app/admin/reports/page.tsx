"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface MonthlyRevenue { month: number; revenue: number; count: number; }

const monthNames = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const monthFullNames = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const CURRENT_YEAR = new Date().getFullYear();

export default function ReportsPage() {
  const router = useRouter();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    loadData(year);
  }, [year]);

  const loadData = async (y: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5231/api/admin/statistics/revenue?year=${y}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        const fullData: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1, revenue: 0, count: 0
        }));
        result.data.forEach((item: any) => {
          if (item.month >= 1 && item.month <= 12) {
            fullData[item.month - 1] = { month: item.month, revenue: item.revenue, count: item.count };
          }
        });
        setRevenueData(fullData);
      }
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    // Chuẩn bị dữ liệu CSV với BOM UTF-8 để hiển thị đúng tiếng Việt trong Excel
    let csvContent = "\uFEFF"; // Byte Order Mark
    
    // Tiêu đề báo cáo
    csvContent += `"BÁO CÁO DOANH THU NĂM ${year}"\n\n`;
    
    // Thông tin tổng quan
    csvContent += `"Ngày xuất báo cáo:", "${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}"\n`;
    csvContent += `"Tổng doanh thu cả năm:", "${totalRevenue.toLocaleString()} đ"\n`;
    csvContent += `"Tổng đơn hàng:", "${totalBookings} đơn"\n`;
    csvContent += `"Doanh thu trung bình / đơn:", "${avgPerOrder.toLocaleString()} đ"\n\n`;
    
    // Tiêu đề cột
    csvContent += `"Tháng", "Số lượng đơn hàng", "Doanh thu (VND)", "Trung bình trên đơn (VND)"\n`;
    
    // Dữ liệu từng tháng
    revenueData.forEach((data, index) => {
      const avg = data.count > 0 ? Math.round(data.revenue / data.count) : 0;
      csvContent += `"${monthFullNames[index]}", "${data.count} đơn", "${data.revenue}", "${avg > 0 ? avg : '-'}"\n`;
    });
    
    // Dòng tổng kết
    csvContent += `\n"Tổng cộng cả năm", "${totalBookings} đơn", "${totalRevenue}", "${avgPerOrder > 0 ? avgPerOrder : '-'}"\n`;
    
    // Tạo blob và tải xuống dưới dạng .csv
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_Cao_Doanh_Thu_Nam_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = revenueData.reduce((s,m) => s + m.revenue, 0);
  const totalBookings = revenueData.reduce((s,m) => s + m.count, 0);
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const avgPerOrder = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#312e81", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Đang tải báo cáo...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .bar-fill { transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s; }
        .table-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", animation: "fadeIn 0.4s ease-out" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Thống kê
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Báo cáo doanh thu</h2>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>Phân tích số liệu kinh doanh theo năm {year}.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "#475569" }}>Chọn năm:</label>
            <select
              title="Chọn năm báo cáo"
              aria-label="Chọn năm để xem báo cáo doanh thu"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{ padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 700, color: "#1e293b", outline: "none", cursor: "pointer", background: "#fff" }}
            >
              {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToExcel}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất Excel Báo Cáo
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px", animation: "fadeIn 0.5s ease-out both" }}>
        {[
          { label: `Tổng doanh thu ${year}`, value: `${totalRevenue.toLocaleString()}đ`, color: "#2563eb", bg: "#eff6ff" },
          { label: `Tổng đơn hàng ${year}`, value: totalBookings, color: "#8b5cf6", bg: "#f5f3ff" },
          { label: "Trung bình / đơn", value: `${avgPerOrder.toLocaleString()}đ`, color: "#10b981", bg: "#ecfdf5" },
        ].map((card, i) => (
          <div key={i} style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#64748b" }}>{card.label}</p>
            <h3 style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div style={{ background: "#fff", padding: "32px", borderRadius: "24px", border: "1px solid #e2e8f0", marginBottom: "32px", animation: "fadeIn 0.6s ease-out both" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "32px" }}>Biểu đồ doanh thu tháng</h3>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "200px", gap: "10px" }}>
          {revenueData.map((data, i) => {
            const hPct = (data.revenue / maxRevenue) * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", background: "#f8fafc", borderRadius: "8px", position: "relative", display: "flex", alignItems: "flex-end" }}>
                  <div className="bar-fill" style={{ 
                    width: "100%", height: `${Math.max(hPct, 2)}%`, 
                    background: data.revenue > 0 ? "linear-gradient(to top, #3b82f6, #60a5fa)" : "#e2e8f0",
                    borderRadius: "6px",
                    opacity: hovered === i ? 0.8 : 1
                  }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
                  {hovered === i && data.revenue > 0 && (
                    <div style={{ position: "absolute", bottom: `${hPct + 5}%`, left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", zIndex: 10 }}>
                      {data.revenue.toLocaleString()}đ
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>{monthNames[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden", animation: "fadeIn 0.7s ease-out both" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
              {["Tháng", "Số đơn", "Doanh thu", "Trung bình"].map(h => (
                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenueData.map((data, i) => (
              <tr key={i} className="table-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{monthFullNames[i]}</td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 700 }}>{data.count} đơn</span>
                </td>
                <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#10b981" }}>{data.revenue.toLocaleString()}đ</td>
                <td style={{ padding: "16px 24px", fontSize: "13px", color: "#64748b" }}>
                  {data.count > 0 ? `${Math.round(data.revenue / data.count).toLocaleString()}đ` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
              <td style={{ padding: "20px 24px", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Tổng cộng cả năm</td>
              <td style={{ padding: "20px 24px" }}>
                <span style={{ padding: "6px 14px", borderRadius: "10px", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 800 }}>{totalBookings} đơn</span>
              </td>
              <td style={{ padding: "20px 24px", fontSize: "18px", fontWeight: 800, color: "#10b981" }}>{totalRevenue.toLocaleString()}đ</td>
              <td style={{ padding: "20px 24px", fontSize: "14px", fontWeight: 700, color: "#64748b" }}>
                {totalBookings > 0 ? `${Math.round(totalRevenue / totalBookings).toLocaleString()}đ` : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </AdminLayout>
  );
}