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

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
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
  const [roleFilter, setRoleFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom premium Dialog Modal state (Confirm & Alert)
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "confirm" | "success" | "error";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Xác nhận yêu cầu",
      message,
      onConfirm,
    });
  };

  const showAlert = (message: string, title: string = "Thông báo", type: "success" | "error" = "success") => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isDropdownOpen) {
        const dropdownContainer = document.getElementById("role-filter-dropdown-container");
        if (dropdownContainer && !dropdownContainer.contains(e.target as Node)) {
          setIsDropdownOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isDropdownOpen]);

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
    showConfirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng này sang ${roleName}?`, async () => {
      try {
        await api.post("/user/assign-role", { maNguoiDung, roleName });
        showAlert("Cập nhật vai trò thành công!", "Thành công", "success");
        fetchUsers();
      } catch (error) {
        showAlert("Lỗi khi cập nhật vai trò: " + (error as any).message, "Lỗi", "error");
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    if (user.roles.includes("Admin")) {
      showAlert("Không thể khóa tài khoản của Quản trị viên khác!", "Cảnh báo");
      return;
    }

    const action = user.trangThai ? "khóa" : "mở khóa";
    showConfirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`, async () => {
      try {
        await api.post(`/admin/users/${user.maNguoiDung}/toggle-status`);
        showAlert(`Đã ${action} tài khoản thành công!`, "Thành công", "success");
        fetchUsers();
      } catch (error) {
        showAlert(`Lỗi khi ${action} tài khoản: ` + (error as any).message, "Lỗi", "error");
      }
    });
  };

  const filteredUsers = users.filter(
    (user) => {
      const matchesSearch =
        user.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.soDienThoai?.includes(searchTerm);
      
      const matchesRole =
        roleFilter === "All" || user.roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    }
  );

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#312e81", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Đang tải dữ liệu...</p>
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
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", animation: "fadeIn 0.4s ease-out" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Hệ thống
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Quản lý người dùng</h2>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>
            Tổng cộng <span style={{ color: "#0f172a", fontWeight: 700 }}>{users.length}</span> tài khoản trong hệ thống.
          </p>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Role Filter Selector */}
          <div id="role-filter-dropdown-container" style={{ position: "relative" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 20px",
                borderRadius: "14px",
                border: isDropdownOpen ? "1.5px solid #3b82f6" : "1.5px solid #e2e8f0",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e293b",
                background: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px 0 rgba(0,0,0,0.03)",
                minWidth: "180px"
              }}
            >
              <span>
                {roleFilter === "All" && "Tất cả vai trò"}
                {roleFilter === "Admin" && "Admin"}
                {roleFilter === "Staff" && "Nhân viên"}
                {roleFilter === "Maid" && "Người giúp việc"}
                {roleFilter === "Customer" && "Khách hàng"}
              </span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#64748b" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "6px",
                width: "100%",
                minWidth: "180px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 100,
                overflow: "hidden",
                animation: "fadeIn 0.2s ease-out"
              }}>
                {[
                  { value: "All", label: "Tất cả vai trò" },
                  { value: "Admin", label: "Admin" },
                  { value: "Staff", label: "Nhân viên" },
                  { value: "Maid", label: "Người giúp việc" },
                  { value: "Customer", label: "Khách hàng" }
                ].map((opt) => {
                  const isSelected = opt.value === roleFilter;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRoleFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        border: "none",
                        background: isSelected ? "#eff6ff" : "#ffffff",
                        color: isSelected ? "#2563eb" : "#334155",
                        fontSize: "14px",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#ffffff";
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", width: "320px" }}>
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px 12px 44px", borderRadius: "14px", border: "1px solid #e2e8f0",
                fontSize: "14px", color: "#1e293b", outline: "none", transition: "all 0.2s",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
        </div>
      </div>

      {/* ── User Table ── */}
      <div style={{ 
        background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", 
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden",
        animation: "fadeIn 0.5s ease-out both"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                {["Người dùng", "Liên hệ", "Vai trò", "Trạng thái", "Ngày tạo", "Thao tác"].map((h) => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.maNguoiDung} className="table-row" style={{ borderBottom: "1px solid #f8fafc", transition: "all 0.2s" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ 
                          width: "40px", height: "40px", borderRadius: "12px", 
                          background: user.roles.includes("Admin") ? "linear-gradient(135deg, #1e1b4b, #312e81)" : "#f1f5f9",
                          color: user.roles.includes("Admin") ? "#fff" : "#475569",
                          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px"
                        }}>
                          {user.hoTen?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{user.hoTen || "Chưa cập nhật"}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>ID: {user.maNguoiDung}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "14px", color: "#475569" }}>{user.email || "—"}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{user.soDienThoai || "—"}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {user.roles.map((role) => {
                          const config = roleConfig[role] || { label: role, color: "#64748b", bg: "#f1f5f9" };
                          return (
                            <span key={role} style={{ 
                              padding: "4px 10px", borderRadius: "8px", fontSize: "12px", 
                              fontWeight: 700, color: config.color, background: config.bg 
                            }}>
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                        padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 700,
                        background: user.trangThai ? "#ecfdf5" : "#fef2f2",
                        color: user.trangThai ? "#10b981" : "#ef4444",
                        display: "inline-flex", alignItems: "center", gap: "6px"
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user.trangThai ? "#10b981" : "#ef4444" }}></span>
                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "#64748b" }}>
                      {new Date(user.ngayTao).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <select
                          title="Phân quyền người dùng"
                          aria-label="Chọn vai trò cho người dùng"
                          onChange={(e) => handleAssignRole(user.maNguoiDung, e.target.value)}
                          value={user.roles[0] || ""}
                          disabled={user.roles.includes("Admin")}
                          style={{
                            padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0",
                            fontSize: "13px", fontWeight: 600, color: "#1e293b", outline: "none", cursor: "pointer",
                            background: "#fff", opacity: user.roles.includes("Admin") ? 0.5 : 1
                          }}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Staff">Staff</option>
                          <option value="Maid">Maid</option>
                          <option value="Customer">Customer</option>
                        </select>
                        
                        {!user.roles.includes("Admin") && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0",
                              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                              background: "#fff", color: user.trangThai ? "#ef4444" : "#10b981", transition: "all 0.2s"
                            }}
                            className="action-btn"
                            title={user.trangThai ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {user.trangThai ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4m0 0a4 4 0 014 4v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3a4 4 0 014-4h8z" />
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
                  <td colSpan={6} style={{ padding: "80px 24px", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8", fontSize: "15px", fontWeight: 500 }}>Không tìm thấy người dùng nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Premium Custom Modal Dialog (Alert / Confirm) ── */}
      {dialog.isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "24px",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "420px",
            padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "1px solid #f1f5f9"
          }}>
            {/* Status Icon */}
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: dialog.type === "confirm" ? "#fef3c7" : dialog.type === "error" ? "#fee2e2" : "#ecfdf5",
              color: dialog.type === "confirm" ? "#d97706" : dialog.type === "error" ? "#ef4444" : "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              {dialog.type === "confirm" ? (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : dialog.type === "error" ? (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              {dialog.title}
            </h3>
            
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "28px" }}>
              {dialog.message}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {dialog.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      color: "#64748b",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      if (dialog.onConfirm) dialog.onConfirm();
                      setDialog(prev => ({ ...prev, isOpen: false }));
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                    onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
                  >
                    Đồng ý
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    padding: "12px 36px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(30, 27, 75, 0.25)",
                    transition: "all 0.15s"
                  }}
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}