"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface User {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  trangThai: boolean;
  ngayTao: string;
  roles: string[];
}

const MOCK_USERS: User[] = [
  { maNguoiDung: "ADMIN", hoTen: "System Administrator", email: "admin@gmail.com",  soDienThoai: "0332711675", trangThai: true, ngayTao: new Date(Date.now()-110*86400000).toISOString(), roles: ["Admin"] },
  { maNguoiDung: "NV001",  hoTen: "Đặng Thị Hạnh",      email: "hanh@gmail.com",   soDienThoai: "0906666666", trangThai: true, ngayTao: new Date(Date.now()-110*86400000).toISOString(), roles: ["Staff"] },
  { maNguoiDung: "KH001",  hoTen: "Nguyễn Thị Lan",     email: "lan@gmail.com",    soDienThoai: "0901111111", trangThai: true, ngayTao: new Date(Date.now()-120*86400000).toISOString(), roles: ["Customer"] },
  { maNguoiDung: "KH002",  hoTen: "Trần Văn Minh",      email: "minh@gmail.com",   soDienThoai: "0902222222", trangThai: true, ngayTao: new Date(Date.now()-90*86400000).toISOString(),  roles: ["Customer"] },
  { maNguoiDung: "KH003",  hoTen: "Lê Thị Hoa",         email: "hoa@gmail.com",    soDienThoai: "0903333333", trangThai: true, ngayTao: new Date(Date.now()-60*86400000).toISOString(),  roles: ["Customer"] },
  { maNguoiDung: "KH004",  hoTen: "Bùi Thành Đạt",      email: "dat@gmail.com",    soDienThoai: "0904444400", trangThai: true, ngayTao: new Date(Date.now()-45*86400000).toISOString(),  roles: ["Customer"] },
  { maNguoiDung: "GV001",  hoTen: "Phạm Thị Mai",       email: "mai@gmail.com",    soDienThoai: "0904444441", trangThai: true, ngayTao: new Date(Date.now()-100*86400000).toISOString(), roles: ["Maid"] },
  { maNguoiDung: "GV002",  hoTen: "Võ Thị Thu",         email: "thu@gmail.com",    soDienThoai: "0905555555", trangThai: true, ngayTao: new Date(Date.now()-80*86400000).toISOString(),  roles: ["Maid"] },
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  Admin:    { label: "Admin",           color: "#991B1B", bg: "#FEF2F2" },
  Staff:    { label: "Nhân viên",       color: "#1E40AF", bg: "#EFF6FF" },
  Maid:     { label: "Người giúp việc", color: "#5B21B6", bg: "#F5F3FF" },
  Customer: { label: "Khách hàng",      color: "#065F46", bg: "#ECFDF5" },
};

const avatarBgs = [
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#FBEAF0", color: "#993556" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
  { bg: "#FAEEDA", color: "#854F0B" },
];

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    setTimeout(() => { setUsers(MOCK_USERS); setLoading(false); }, 400);
  }, []);

  const filtered = users.filter(u =>
    u.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <AdminLayout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid #EEEDFE", borderTopColor:"#534AB7", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
          <p style={{ marginTop:"12px", color:"#534AB7", fontWeight:500, fontSize:"14px" }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:"24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
        <div>
          <p style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", letterSpacing:"0.07em", textTransform:"uppercase", margin:"0 0 6px" }}>
            Quản trị hệ thống
          </p>
          <h2 style={{ fontSize:"22px", fontWeight:600, color:"#1e1b4b", margin:0, lineHeight:1.3 }}>
            Quản lý người dùng
          </h2>
          <p style={{ color:"#9ca3af", marginTop:"4px", fontSize:"13px" }}>
            Tổng cộng{" "}
            <span style={{ color:"#534AB7", fontWeight:600 }}>{users.length}</span>
            {" "}người dùng trong hệ thống
          </p>
        </div>

        {/* Search */}
        <div style={{ position:"relative", minWidth:"280px" }}>
          <svg style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} fill="none" viewBox="0 0 24 24" stroke="#9ca3af" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width:"100%", padding:"9px 14px 9px 38px",
              borderRadius:"10px", border:"0.5px solid #e5e7eb",
              background:"#fff", fontSize:"13px", color:"#374151",
              outline:"none", boxSizing:"border-box",
              transition:"border-color 0.2s",
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor="#a5b4fc"}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor="#e5e7eb"}
          />
        </div>
      </div>

      {/* Table card */}
      <div style={{
        background:"#fff",
        borderRadius:"14px",
        border:"0.5px solid #e5e7eb",
        overflow:"hidden",
        animation:"fadeIn 0.35s ease",
      }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"680px" }}>
            <thead>
              <tr style={{ borderBottom:"0.5px solid #e5e7eb", background:"#fafafa" }}>
                {["Người dùng", "Liên hệ", "Vai trò", "Trạng thái", "Ngày tạo"].map(h => (
                  <th key={h} style={{
                    padding:"12px 20px", textAlign:"left",
                    fontSize:"11px", fontWeight:600,
                    textTransform:"uppercase", letterSpacing:"0.06em",
                    color:"#9ca3af",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((user, i) => {
                const av = avatarBgs[i % avatarBgs.length];
                return (
                  <tr
                    key={user.maNguoiDung}
                    style={{ borderBottom:"0.5px solid #f3f4f6", transition:"background 0.15s", cursor:"default" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f9fafb"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}
                  >
                    {/* Avatar + name */}
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{
                          width:"38px", height:"38px", borderRadius:"50%",
                          background:av.bg,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:av.color, fontWeight:600, fontSize:"15px", flexShrink:0,
                        }}>
                          {user.hoTen?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:"#1e1b4b", fontSize:"13px" }}>{user.hoTen}</div>
                          <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>ID: {user.maNguoiDung}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ fontSize:"13px", color:"#374151" }}>{user.email}</div>
                      <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>{user.soDienThoai}</div>
                    </td>

                    {/* Role badges */}
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                        {user.roles.map((role, idx) => {
                          const cfg = roleConfig[role] ?? { label:role, color:"#6b7280", bg:"#f3f4f6" };
                          return (
                            <span key={idx} style={{
                              padding:"2px 9px", borderRadius:"99px",
                              fontSize:"11px", fontWeight:600,
                              color:cfg.color, background:cfg.bg,
                            }}>
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding:"14px 20px" }}>
                      <span style={{
                        padding:"3px 10px", borderRadius:"99px",
                        fontSize:"11px", fontWeight:600,
                        background:user.trangThai ? "#ECFDF5" : "#FEF2F2",
                        color:user.trangThai ? "#065F46" : "#991B1B",
                        display:"inline-flex", alignItems:"center", gap:"5px",
                      }}>
                        <span style={{
                          width:"5px", height:"5px", borderRadius:"50%",
                          background:user.trangThai ? "#10b981" : "#ef4444",
                          display:"inline-block",
                        }} />
                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding:"14px 20px", fontSize:"12px", color:"#9ca3af" }}>
                      {new Date(user.ngayTao).toLocaleDateString("vi-VN", { year:"numeric", month:"2-digit", day:"2-digit" })}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} style={{ padding:"60px 20px", textAlign:"center", color:"#9ca3af", fontSize:"13px" }}>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{ padding:"12px 20px", borderTop:"0.5px solid #f3f4f6", background:"#fafafa" }}>
            <p style={{ margin:0, fontSize:"12px", color:"#9ca3af" }}>
              Hiển thị <span style={{ color:"#534AB7", fontWeight:600 }}>{filtered.length}</span> / {users.length} người dùng
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}