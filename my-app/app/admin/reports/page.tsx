"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface MonthlyRevenue { month: number; revenue: number; count: number; }

const monthNames     = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const monthFullNames = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const MOCK_DATA_2026: MonthlyRevenue[] = [
  { month:1,  revenue:640000, count:2 },
  { month:2,  revenue:710000, count:2 },
  { month:3,  revenue:570000, count:2 },
  { month:4,  revenue:850000, count:3 },
  ...Array.from({ length:8 }, (_,i) => ({ month:i+5, revenue:0, count:0 })),
];

const CURRENT_YEAR = new Date().getFullYear();

export default function ReportsPage() {
  const router = useRouter();
  const [year, setYear]           = useState(CURRENT_YEAR);
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading]     = useState(true);
  const [hovered, setHovered]     = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    loadData(year);
  }, []);

  useEffect(() => { if (!loading) loadData(year); }, [year]);

  const loadData = (y: number) => {
    setLoading(true);
    setTimeout(() => {
      setRevenueData(y === CURRENT_YEAR
        ? MOCK_DATA_2026
        : Array.from({ length:12 }, (_,i) => ({ month:i+1, revenue:0, count:0 })));
      setLoading(false);
    }, 300);
  };

  const totalRevenue  = revenueData.reduce((s,m) => s + m.revenue, 0);
  const totalBookings = revenueData.reduce((s,m) => s + m.count,   0);
  const maxRevenue    = Math.max(...revenueData.map(d => d.revenue), 1);
  const avgPerOrder   = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  if (loading) return (
    <AdminLayout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid #EEEDFE", borderTopColor:"#534AB7", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
          <p style={{ marginTop:"12px", color:"#534AB7", fontWeight:500, fontSize:"14px" }}>Đang tải...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .bar-col:hover .bar-fill { opacity: 0.75; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom:"24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
        <div>
          <p style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", letterSpacing:"0.07em", textTransform:"uppercase", margin:"0 0 6px" }}>
            Quản trị hệ thống
          </p>
          <h2 style={{ fontSize:"22px", fontWeight:600, color:"#1e1b4b", margin:0 }}>Báo cáo thống kê</h2>
          <p style={{ color:"#9ca3af", marginTop:"4px", fontSize:"13px" }}>
            Doanh thu và đơn đặt dịch vụ theo năm
          </p>
        </div>

        {/* Year picker */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <label style={{ fontSize:"12px", color:"#9ca3af", fontWeight:500 }}>Năm</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding:"7px 12px", borderRadius:"8px", border:"0.5px solid #e5e7eb", fontSize:"13px", fontWeight:600, color:"#1e1b4b", background:"#fff", outline:"none", cursor:"pointer" }}
          >
            {Array.from({ length:5 }, (_,i) => CURRENT_YEAR - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))", gap:"12px", marginBottom:"20px", animation:"fadeIn 0.35s ease" }}>
        {[
          {
            label: `Tổng doanh thu ${year}`,
            value: `${totalRevenue.toLocaleString("vi-VN")}đ`,
            iconBg: "#EAF3DE", iconColor: "#3B6D11",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            valueColor: "#1e1b4b", small: true,
          },
          {
            label: `Tổng đơn đặt ${year}`,
            value: String(totalBookings),
            iconBg: "#EEEDFE", iconColor: "#534AB7",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            valueColor: "#1e1b4b", small: false,
          },
          {
            label: "Trung bình / đơn",
            value: totalBookings > 0 ? `${avgPerOrder.toLocaleString("vi-VN")}đ` : "—",
            iconBg: "#FAEEDA", iconColor: "#854F0B",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            valueColor: "#1e1b4b", small: true,
          },
        ].map(card => (
          <div key={card.label} style={{ background:"#fff", borderRadius:"14px", padding:"16px 18px", border:"0.5px solid #e5e7eb", display:"flex", alignItems:"flex-start", gap:"12px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:card.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:card.iconColor }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin:0, fontSize:"11px", color:"#9ca3af", fontWeight:500 }}>{card.label}</p>
              <p style={{ margin:"3px 0 0", fontSize: card.small ? "17px" : "26px", fontWeight:600, color:card.valueColor, lineHeight:1.2 }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bar chart ── */}
      <div style={{ background:"#fff", borderRadius:"14px", padding:"22px 24px", border:"0.5px solid #e5e7eb", marginBottom:"16px", animation:"fadeIn 0.4s ease 0.08s both" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:"#1e1b4b" }}>Doanh thu theo tháng — {year}</p>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ width:"10px", height:"10px", borderRadius:"2px", background:"#534AB7" }} />
            <span style={{ fontSize:"11px", color:"#9ca3af" }}>Doanh thu (đồng)</span>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ position:"relative" }}>
          {/* Y-axis guides */}
          {[100, 75, 50, 25, 0].map(pct => (
            <div key={pct} style={{ position:"absolute", left:0, right:0, bottom:`${pct}%`, display:"flex", alignItems:"center", gap:"8px", pointerEvents:"none" }}>
              <span style={{ fontSize:"9px", color:"#d1d5db", width:"32px", textAlign:"right", flexShrink:0 }}>
                {pct === 0 ? "0" : `${Math.round(maxRevenue * pct / 100 / 1000)}k`}
              </span>
              <div style={{ flex:1, borderTop: pct === 0 ? "1px solid #e5e7eb" : "0.5px dashed #f3f4f6" }} />
            </div>
          ))}

          {/* Bars */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"160px", paddingLeft:"40px", paddingBottom:"1px" }}>
            {revenueData.map((data, i) => {
              const hPct = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              const isHov = hovered === i;
              return (
                <div
                  key={data.month}
                  className="bar-col"
                  style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", cursor: data.revenue > 0 ? "pointer" : "default" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Tooltip */}
                  {isHov && data.revenue > 0 && (
                    <div style={{ position:"absolute", bottom:`${hPct + 4}%`, background:"#1e1b4b", color:"#fff", fontSize:"10px", padding:"4px 8px", borderRadius:"6px", whiteSpace:"nowrap", pointerEvents:"none", zIndex:10, transform:"translateX(-50%)", marginLeft:"50%" }}>
                      {data.revenue.toLocaleString("vi-VN")}đ
                    </div>
                  )}
                  <div
                    className="bar-fill"
                    style={{
                      width:"100%", minWidth:"12px",
                      height:`${Math.max(hPct, data.revenue > 0 ? 3 : 1)}%`,
                      background: data.revenue > 0 ? "#534AB7" : "#f3f4f6",
                      borderRadius:"4px 4px 0 0",
                      transition:"opacity 0.15s, height 0.3s ease",
                      opacity: isHov ? 0.75 : 1,
                    }}
                  />
                  <span style={{ fontSize:"9px", color:"#9ca3af", fontWeight:500 }}>{monthNames[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background:"#fff", borderRadius:"14px", overflow:"hidden", border:"0.5px solid #e5e7eb", animation:"fadeIn 0.4s ease 0.14s both" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"540px" }}>
            <thead>
              <tr style={{ borderBottom:"0.5px solid #e5e7eb", background:"#fafafa" }}>
                {["Tháng","Số đơn","Doanh thu","Trung bình / đơn"].map(h => (
                  <th key={h} style={{ padding:"11px 20px", textAlign:"left", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:"#9ca3af" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data, i) => (
                <tr
                  key={data.month}
                  style={{ borderBottom:"0.5px solid #f3f4f6", transition:"background 0.12s", cursor:"default" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <td style={{ padding:"12px 20px", fontWeight:500, color:"#1e1b4b", fontSize:"13px" }}>{monthFullNames[i]}</td>
                  <td style={{ padding:"12px 20px" }}>
                    {data.count > 0
                      ? <span style={{ background:"#EEEDFE", color:"#534AB7", padding:"2px 9px", borderRadius:"99px", fontSize:"11px", fontWeight:600 }}>{data.count}</span>
                      : <span style={{ color:"#d1d5db", fontSize:"13px" }}>—</span>
                    }
                  </td>
                  <td style={{ padding:"12px 20px", fontWeight:600, color: data.revenue > 0 ? "#3B6D11" : "#d1d5db", fontSize:"13px" }}>
                    {data.revenue > 0 ? `${data.revenue.toLocaleString("vi-VN")}đ` : "—"}
                  </td>
                  <td style={{ padding:"12px 20px", color:"#9ca3af", fontSize:"12px" }}>
                    {data.count > 0 ? `${Math.round(data.revenue / data.count).toLocaleString("vi-VN")}đ` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:"0.5px solid #e5e7eb", background:"#fafafa" }}>
                <td style={{ padding:"13px 20px", fontWeight:700, color:"#1e1b4b", fontSize:"13px" }}>Tổng cộng</td>
                <td style={{ padding:"13px 20px" }}>
                  <span style={{ background:"#EEEDFE", color:"#534AB7", padding:"2px 9px", borderRadius:"99px", fontSize:"11px", fontWeight:700 }}>{totalBookings}</span>
                </td>
                <td style={{ padding:"13px 20px", fontWeight:700, color:"#3B6D11", fontSize:"14px" }}>{totalRevenue.toLocaleString("vi-VN")}đ</td>
                <td style={{ padding:"13px 20px", fontWeight:600, color:"#374151", fontSize:"13px" }}>
                  {totalBookings > 0 ? `${avgPerOrder.toLocaleString("vi-VN")}đ` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}