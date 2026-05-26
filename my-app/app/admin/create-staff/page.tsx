"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";
import { toast } from "@/utils/toast";

export default function CreateStaff() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    diaChi: "", // Đã xóa matKhau khỏi state
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bỏ kiểm tra matKhau
    if (!formData.hoTen || !formData.email || !formData.soDienThoai) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      // Gắn cứng mật khẩu mặc định là "123456" khi gọi API
      await api.post("/User/registerStaff", {
        ...formData,
        matKhau: "123456",
      });

      toast.success(
        "Tạo tài khoản nhân viên thành công với mật khẩu mặc định: 123456",
      );
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "24px",
          }}
        >
          Cấp tài khoản Nhân viên
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Họ tên <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.hoTen}
              onChange={(e) =>
                setFormData({ ...formData, hoTen: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              placeholder="Nhập họ tên nhân viên"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              placeholder="email@example.com"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="tel"
              value={formData.soDienThoai}
              onChange={(e) =>
                setFormData({ ...formData, soDienThoai: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              placeholder="0912345678"
            />
          </div>

          {/* Đã xóa hoàn toàn block input Mật khẩu ở đây */}

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Địa chỉ
            </label>
            <input
              type="text"
              value={formData.diaChi}
              onChange={(e) =>
                setFormData({ ...formData, diaChi: e.target.value })
              }
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              placeholder="Nhập địa chỉ"
            />
          </div>

          {/* Ghi chú nhỏ cho Admin biết hệ thống dùng pass mặc định */}
          <div
            style={{
              marginBottom: "24px",
              fontSize: "13px",
              color: "#64748b",
              fontStyle: "italic",
            }}
          >
            * Tài khoản mới sẽ được cấp mật khẩu mặc định là{" "}
            <strong>123456</strong>.
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#64748b",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: loading ? "#94a3b8" : "#3b82f6",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
