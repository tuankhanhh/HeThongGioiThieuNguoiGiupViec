"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";

interface User {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  trangThai: boolean;
  ngayTao: string;
  roles: string[];
}

const roleConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    Admin: { label: "Admin", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
    Staff: { label: "Staff", color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
    Maid: {
      label: "Người giúp việc",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.1)",
    },
    Customer: {
      label: "Khách hàng",
      color: "#059669",
      bg: "rgba(5,150,105,0.1)",
    },
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>("/user/all");
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (maNguoiDung: string, roleName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng này sang ${roleName}?`)) return;
    try {
      await api.post("/user/assign-role", { maNguoiDung, roleName });
      fetchUsers();
    } catch (error) {
      alert("Lỗi khi cập nhật vai trò: " + (error as any).message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const avatarColors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#ec4899,#f43f5e)",
    "linear-gradient(135deg,#0ea5e9,#06b6d4)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#f97316)",
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "4px solid rgba(99,102,241,0.15)",
                borderTopColor: "#6366f1",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }}
            />
            <p style={{ marginTop: "16px", color: "#6366f1", fontWeight: 500 }}>
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
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1e1b4b",
              margin: 0,
            }}
          >
            Quản lý người dùng
          </h2>
          <p style={{ color: "#6b7280", marginTop: "6px", fontSize: "14px" }}>
            Tổng cộng{" "}
            <strong style={{ color: "#6366f1" }}>{users.length}</strong> người
            dùng trong hệ thống
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "300px" }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 44px",
              borderRadius: "12px",
              border: "1.5px solid rgba(99,102,241,0.2)",
              background: "#fff",
              fontSize: "14px",
              color: "#374151",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
              transition: "border-color 0.2s",
            }}
          />
          <svg
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="#9ca3af"
            width="18"
            height="18"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Table Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 2px 20px rgba(99,102,241,0.07)",
          border: "1px solid rgba(99,102,241,0.06)",
          overflow: "hidden",
          animation: "fadeIn 0.4s ease",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg,#1e1b4b,#3730a3)",
                  color: "white",
                }}
              >
                {[
                   "Người dùng",
                  "Liên hệ",
                  "Vai trò",
                  "Trạng thái",
                  "Ngày tạo",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "rgba(199,210,254,0.9)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <tr
                    key={user.maNguoiDung}
                    style={{
                      borderBottom: "1px solid rgba(99,102,241,0.06)",
                      background:
                        i % 2 === 0 ? "#fff" : "rgba(99,102,241,0.015)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(99,102,241,0.04)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        i % 2 === 0 ? "#fff" : "rgba(99,102,241,0.015)")
                    }
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            background:
                              avatarColors[i % avatarColors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "16px",
                            flexShrink: 0,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                          }}
                        >
                          {user.hoTen?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#1e1b4b",
                              fontSize: "14px",
                            }}
                          >
                            {user.hoTen || "Chưa cập nhật"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#9ca3af",
                              marginTop: "2px",
                            }}
                          >
                            ID: {user.maNguoiDung}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: "14px", color: "#374151" }}>
                        {user.email || "—"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          marginTop: "2px",
                        }}
                      >
                        {user.soDienThoai || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {user.roles?.length > 0 ? (
                          user.roles.map((role, idx) => {
                            const cfg = roleConfig[role] ?? {
                              label: role,
                              color: "#6b7280",
                              bg: "rgba(107,114,128,0.1)",
                            };
                            return (
                              <span
                                key={idx}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "99px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: cfg.color,
                                  background: cfg.bg,
                                }}
                              >
                                {cfg.label}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                            Chưa phân quyền
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "99px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: user.trangThai
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(239,68,68,0.1)",
                          color: user.trangThai ? "#059669" : "#dc2626",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: user.trangThai ? "#10b981" : "#ef4444",
                            display: "inline-block",
                          }}
                        />
                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6b7280" }}>
                      {new Date(user.ngayTao).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <select
                        title="Gán vai trò"
                        aria-label="Gán vai trò cho người dùng"
                        onChange={(e) => handleAssignRole(user.maNguoiDung, e.target.value)}
                        value={(user.roles && user.roles.length > 0) ? user.roles[0] : ""}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid rgba(99,102,241,0.15)",
                          fontSize: "13px",
                          color: "#1e1b4b",
                          fontWeight: 500,
                          outline: "none",
                          cursor: "pointer",
                          background: "white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          transition: "all 0.2s"
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)")}
                      >
                        <option value="" disabled>Gán vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                        <option value="Maid">Người giúp việc</option>
                        <option value="Customer">Khách hàng</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "60px 20px", textAlign: "center" }}
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#d1d5db"
                      width="48"
                      height="48"
                      style={{ margin: "0 auto 12px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p style={{ color: "#9ca3af", fontWeight: 500 }}>
                      Không tìm thấy người dùng nào
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filteredUsers.length > 0 && (
          <div style={{ padding:"12px 20px", borderTop:"0.5px solid #f3f4f6", background:"#fafafa" }}>
            <p style={{ margin:0, fontSize:"12px", color:"#9ca3af" }}>
              Hiển thị <span style={{ color:"#534AB7", fontWeight:600 }}>{filteredUsers.length}</span> / {users.length} người dùng
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}