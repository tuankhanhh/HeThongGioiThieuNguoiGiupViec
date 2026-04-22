"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Service {
  maDichVu: string;
  tenDichVu: string;
  moTa: string;
  giaTheoGio: number;
  hinhAnh: string;
  trangThai: string;
  phoBien: boolean;
  thanhPhans: string[];
}

interface FormData {
  tenDichVu: string;
  moTa: string;
  giaTheoGio: number;
  hinhAnh: string;
  phoBien: boolean;
}

const emptyForm: FormData = { tenDichVu: "", moTa: "", giaTheoGio: 0, hinhAnh: "", phoBien: false };

export default function ServicesManagement() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/admin/services");
      if (response.data.success) setServices(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dịch vụ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.maDichVu}`, formData);
      } else {
        await api.post("/admin/services", formData);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData(emptyForm);
      fetchServices();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ tenDichVu: service.tenDichVu, moTa: service.moTa, giaTheoGio: service.giaTheoGio, hinhAnh: service.hinhAnh, phoBien: service.phoBien });
    setShowModal(true);
  };

  const handleDelete = async (maDichVu: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await api.delete(`/admin/services/${maDichVu}`);
      fetchServices();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(-10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>Quản lý dịch vụ</h2>
          <p style={{ color: "#6b7280", marginTop: "6px", fontSize: "14px" }}>
            <strong style={{ color: "#6366f1" }}>{services.length}</strong> dịch vụ trong hệ thống
          </p>
        </div>
        <button
          onClick={() => { setEditingService(null); setFormData(emptyForm); setShowModal(true); }}
          style={{
            padding: "11px 22px", borderRadius: "12px", border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "white", fontWeight: 600, fontSize: "14px",
            boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
            display: "flex", alignItems: "center", gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 24px rgba(99,102,241,0.5)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(99,102,241,0.4)"; }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Services Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {services.map((service, index) => (
          <div key={service.maDichVu} style={{
            background: "#fff", borderRadius: "20px", overflow: "hidden",
            boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
            border: "1px solid rgba(99,102,241,0.06)",
            animation: `fadeInUp 0.4s ease ${index * 0.06}s both`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(99,102,241,0.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(99,102,241,0.07)"; }}
          >
            {/* Image */}
            <div style={{ position: "relative", height: "180px", overflow: "hidden", background: "linear-gradient(135deg,#e0e7ff,#ede9fe)" }}>
              {service.hinhAnh ? (
                <img src={service.hinhAnh} alt={service.tenDichVu}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" width="48" height="48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {service.phoBien && (
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "white", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700 }}>
                  ⭐ Phổ biến
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e1b4b", margin: "0 0 6px" }}>
                {service.tenDichVu}
              </h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {service.moTa}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#6366f1" }}>
                  {service.giaTheoGio.toLocaleString("vi-VN")}đ
                  <span style={{ fontSize: "12px", fontWeight: 400, color: "#9ca3af" }}>/giờ</span>
                </span>
                <span style={{
                  padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                  background: service.trangThai === "Đang hoạt động" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: service.trangThai === "Đang hoạt động" ? "#059669" : "#dc2626",
                }}>
                  {service.trangThai}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(service)} style={{
                  flex: 1, padding: "9px", borderRadius: "10px", border: "1.5px solid rgba(99,102,241,0.25)",
                  background: "rgba(99,102,241,0.05)", color: "#6366f1", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#6366f1"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)"; (e.currentTarget as HTMLElement).style.color = "#6366f1"; }}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button onClick={() => handleDelete(service.maDichVu)} style={{
                  flex: 1, padding: "9px", borderRadius: "10px", border: "1.5px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.05)", color: "#dc2626", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#dc2626"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.05)"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 20px" }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#d1d5db" width="56" height="56" style={{ margin: "0 auto 16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p style={{ color: "#9ca3af", fontWeight: 500, fontSize: "16px" }}>Chưa có dịch vụ nào</p>
            <p style={{ color: "#d1d5db", fontSize: "13px", marginTop: "4px" }}>Nhấn "Thêm dịch vụ mới" để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,10,40,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: "20px",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "500px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.25)",
            animation: "modalIn 0.3s ease",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ padding: "28px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#1e1b4b", margin: 0 }}>
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </h3>
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0 0" }}>
                  {editingService ? "Cập nhật thông tin dịch vụ" : "Điền đầy đủ thông tin dịch vụ"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: "36px", height: "36px", borderRadius: "10px", border: "none",
                background: "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "all 0.2s",
              }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {[
                  { id: "tenDichVu", label: "Tên dịch vụ", type: "text", key: "tenDichVu" as keyof FormData },
                  { id: "hinhAnh", label: "URL hình ảnh", type: "text", key: "hinhAnh" as keyof FormData },
                  { id: "giaTheoGio", label: "Giá theo giờ (VNĐ)", type: "number", key: "giaTheoGio" as keyof FormData },
                ].map((field) => (
                  <div key={field.id}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.key] as string | number}
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      required
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "10px",
                        border: "1.5px solid #e5e7eb", fontSize: "14px", color: "#1f2937",
                        outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#6366f1")}
                      onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#e5e7eb")}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Mô tả</label>
                  <textarea
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    rows={3}
                    required
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px",
                      border: "1.5px solid #e5e7eb", fontSize: "14px", color: "#1f2937",
                      outline: "none", resize: "vertical", boxSizing: "border-box",
                    }}
                    onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "#6366f1")}
                    onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "#e5e7eb")}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ position: "relative" }}>
                    <input type="checkbox" checked={formData.phoBien}
                      onChange={(e) => setFormData({ ...formData, phoBien: e.target.checked })}
                      style={{ opacity: 0, position: "absolute" }}
                    />
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "6px",
                      border: formData.phoBien ? "none" : "1.5px solid #d1d5db",
                      background: formData.phoBien ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {formData.phoBien && <svg fill="none" viewBox="0 0 24 24" stroke="white" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>Đánh dấu là dịch vụ phổ biến</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="submit" style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(99,102,241,0.35)", transition: "all 0.2s",
                }}>
                  {editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  border: "1.5px solid #e5e7eb",
                  background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
