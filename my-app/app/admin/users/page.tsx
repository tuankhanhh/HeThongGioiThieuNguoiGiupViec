"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";
import Swal from "sweetalert2"; // <-- Import SweetAlert2

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
    Admin: { label: "Admin", color: "#ef4444", bg: "#fef2f2" },
    Staff: { label: "Nhân viên", color: "#3b82f6", bg: "#eff6ff" },
    Maid: { label: "Người giúp việc", color: "#8b5cf6", bg: "#f5f3ff" },
    Customer: { label: "Khách hàng", color: "#10b981", bg: "#ecfdf5" },
  };

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/admin/sign-in");
      return;
    }
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
    const result = await Swal.fire({
      title: "Xác nhận thay đổi",
      text: `Bạn có chắc chắn muốn đổi vai trò của người dùng này sang ${roleName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ",
      // Đã xóa dòng borderRadius ở đây
    });

    if (!result.isConfirmed) {
      fetchUsers();
      return;
    }

    try {
      await api.post("/user/assign-role", { maNguoiDung, roleName });

      // Thông báo thành công
      Swal.fire({
        title: "Thành công!",
        text: "Đã cập nhật vai trò người dùng.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchUsers();
    } catch (error) {
      // Thông báo lỗi
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể cập nhật vai trò: " + (error as any).message,
        icon: "error",
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.roles.includes("Admin")) {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Không thể khóa tài khoản của Quản trị viên khác!",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const action = user.trangThai ? "khóa" : "mở khóa";

    // Sử dụng SweetAlert thay cho confirm
    const result = await Swal.fire({
      title: "Xác nhận",
      text: `Bạn có chắc chắn muốn ${action} tài khoản này?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: user.trangThai ? "#ef4444" : "#10b981", // Nút đỏ để khóa, xanh để mở
      cancelButtonColor: "#94a3b8",
      confirmButtonText: `Đồng ý, ${action}`,
      cancelButtonText: "Hủy bỏ",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/admin/users/${user.maNguoiDung}/toggle-status`);

      Swal.fire({
        title: "Thành công!",
        text: `Đã ${action} tài khoản thành công.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchUsers();
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: `Lỗi khi ${action} tài khoản: ` + (error as any).message,
        icon: "error",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.soDienThoai?.includes(searchTerm);

    const matchRole = filterRole === "all" || user.roles.includes(filterRole);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.trangThai) ||
      (filterStatus === "locked" && !user.trangThai);

    return matchSearch && matchRole && matchStatus;
  });

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
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "3px solid #f3f4f6",
                borderTopColor: "#312e81",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .table-row:hover { background: #f8fafc !important; }
        .action-btn:hover { background: #eff6ff !important; color: #3b82f6 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: "32px", animation: "fadeIn 0.4s ease-out" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              Hệ thống
            </p>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Quản lý người dùng
            </h2>
            <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>
              Tổng cộng{" "}
              <span style={{ color: "#0f172a", fontWeight: 700 }}>
                {users.length}
              </span>{" "}
              tài khoản trong hệ thống.
            </p>
          </div>

          {/* ── Search Bar ── */}
          <div style={{ position: "relative", width: "320px" }}>
            <svg
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                color: "#1e293b",
                outline: "none",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#64748b"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}
            >
              Lọc:
            </span>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e293b",
              outline: "none",
              cursor: "pointer",
              background: "#fff",
              transition: "all 0.2s",
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Staff">Nhân viên</option>
            <option value="Maid">Người giúp việc</option>
            <option value="Customer">Khách hàng</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e293b",
              outline: "none",
              cursor: "pointer",
              background: "#fff",
              transition: "all 0.2s",
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>

          {(filterRole !== "all" || filterStatus !== "all" || searchTerm) && (
            <button
              onClick={() => {
                setFilterRole("all");
                setFilterStatus("all");
                setSearchTerm("");
              }}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                fontWeight: 600,
                color: "#64748b",
                background: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Xóa bộ lọc
            </button>
          )}

          <div
            style={{ marginLeft: "auto", fontSize: "14px", color: "#64748b" }}
          >
            Hiển thị{" "}
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {filteredUsers.length}
            </span>{" "}
            / {users.length}
          </div>
        </div>
      </div>

      {/* ── User Table ── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          overflow: "hidden",
          animation: "fadeIn 0.5s ease-out both",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: "#f8fafc",
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
                      padding: "16px 24px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.maNguoiDung}
                    className="table-row"
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      transition: "all 0.2s",
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: user.roles.includes("Admin")
                              ? "linear-gradient(135deg, #1e1b4b, #312e81)"
                              : "#f1f5f9",
                            color: user.roles.includes("Admin")
                              ? "#fff"
                              : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "16px",
                          }}
                        >
                          {user.hoTen?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {user.hoTen || "Chưa cập nhật"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                            ID: {user.maNguoiDung}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        {user.email || "—"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {user.soDienThoai || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {user.roles.map((role) => {
                          const config = roleConfig[role] || {
                            label: role,
                            color: "#64748b",
                            bg: "#f1f5f9",
                          };
                          return (
                            <span
                              key={role}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: config.color,
                                background: config.bg,
                              }}
                            >
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: user.trangThai ? "#ecfdf5" : "#fef2f2",
                          color: user.trangThai ? "#10b981" : "#ef4444",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: user.trangThai ? "#10b981" : "#ef4444",
                          }}
                        ></span>
                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      {new Date(user.ngayTao).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <select
                          title="Phân quyền người dùng"
                          aria-label="Chọn vai trò cho người dùng"
                          onChange={(e) =>
                            handleAssignRole(user.maNguoiDung, e.target.value)
                          }
                          value={user.roles[0] || ""}
                          disabled={user.roles.includes("Admin")}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#1e293b",
                            outline: "none",
                            cursor: "pointer",
                            background: "#fff",
                            opacity: user.roles.includes("Admin") ? 0.5 : 1,
                          }}
                        >
                          <option value="Staff">Staff</option>
                          <option value="Maid">Maid</option>
                          <option value="Customer">Customer</option>
                        </select>

                        {!user.roles.includes("Admin") && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              background: "#fff",
                              color: user.trangThai ? "#ef4444" : "#10b981",
                              transition: "all 0.2s",
                            }}
                            className="action-btn"
                            title={
                              user.trangThai
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              {user.trangThai ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 11V7a4 4 0 118 0v4m0 0a4 4 0 014 4v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3a4 4 0 014-4h8z"
                                />
                              )}
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "80px 24px", textAlign: "center" }}
                  >
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      Không tìm thấy người dùng nào phù hợp.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
