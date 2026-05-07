"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";

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
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get<{ success: boolean; data: Service[] }>("/admin/services");
      if (response.success) {
        setServices(response.data);
      }
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
      alert("Lỗi khi xử lý dịch vụ: " + (error as any).message);
    }
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setFormData({ tenDichVu: s.tenDichVu, moTa: s.moTa, giaTheoGio: s.giaTheoGio, hinhAnh: s.hinhAnh, phoBien: s.phoBien });
    setShowModal(true);
  };

  const handleViewDetail = (s: Service) => {
    setViewingService(s);
  };

  const handleDelete = async (maDichVu: string) => {
    if (!confirm("Bạn có chắc muốn ngừng hoạt động dịch vụ này?")) return;
    try {
      await api.delete(`/admin/services/${maDichVu}`);
      fetchServices();
    } catch (error) {
      alert("Lỗi khi xóa dịch vụ: " + (error as any).message);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#312e81", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Đang tải dịch vụ...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .svc-card { 
          will-change: transform, opacity; 
          transform: translateZ(0); 
          backface-visibility: hidden;
        }
        .svc-card:hover { 
          transform: translateY(-4px) translateZ(0) !important; 
          box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12) !important; 
          border-color: #3b82f6 !important; 
        }
        .btn-action:hover { background: #f1f5f9 !important; color: #0f172a !important; }
      `}</style>

      <div className="gpu-accelerated">
        {/* ── Header ── */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", animation: "fadeIn 0.3s ease-out both" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Quản trị
            </p>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Dịch vụ hệ thống</h2>
            <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>
              Quản lý danh mục các dịch vụ cung cấp tới khách hàng.
            </p>
          </div>

          <button
            onClick={() => { setEditingService(null); setFormData(emptyForm); setShowModal(true); }}
            style={{ 
              padding: "12px 24px", borderRadius: "14px", border: "none", 
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", 
              color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", 
              display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(30, 27, 75, 0.25)"
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm dịch vụ mới
          </button>
        </div>

        {/* ── Cards Grid ── */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "24px",
          animation: "fadeIn 0.4s ease-out both" 
        }}>
          {services.map((service) => (
            <div key={service.maDichVu} className="svc-card" style={{
              background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0", 
              overflow: "hidden", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column"
            }}>
              <div style={{ position: "relative", height: "180px", background: "#f1f5f9", overflow: "hidden" }}>
                <img 
                  src={service.hinhAnh || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500"} 
                  alt={service.tenDichVu} 
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }} 
                />
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px" }}>
                <span style={{ 
                  padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, 
                  background: service.trangThai === "Đang hoạt động" ? "#ecfdf5" : "#fef2f2",
                  color: service.trangThai === "Đang hoạt động" ? "#10b981" : "#ef4444",
                  backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)"
                }}>
                  {service.trangThai}
                </span>
                {service.phoBien && (
                  <span style={{ padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 800, background: "#fff7ed", color: "#ea580c", border: "1px solid rgba(255,255,255,0.5)" }}>
                    Phổ biến ★
                  </span>
                )}
              </div>
            </div>

            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{service.maDichVu}</span>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "6px 0 8px" }}>{service.tenDichVu}</h3>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.6, flex: 1 }}>{service.moTa}</p>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "20px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#312e81" }}>{service.giaTheoGio.toLocaleString()}đ</span>
                <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>/ giờ</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <button onClick={() => handleViewDetail(service)} style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "4px" }} className="btn-action">Xem chi tiết</button>
                <button onClick={() => handleEdit(service)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }} className="btn-action">Sửa</button>
                <button onClick={() => handleDelete(service.maDichVu)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {viewingService && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "32px", width: "100%", maxWidth: "700px", padding: "40px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", animation: "fadeIn 0.3s ease-out", position: "relative" }}>
            <button onClick={() => setViewingService(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", color: "#64748b" }}>✕</button>
            
            <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
              <div style={{ width: "240px", height: "240px", borderRadius: "24px", overflow: "hidden", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                <img src={viewingService.hinhAnh} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em" }}>{viewingService.maDichVu}</span>
                <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "8px 0 12px" }}>{viewingService.tenDichVu}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "#312e81" }}>{viewingService.giaTheoGio.toLocaleString()}đ</span>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>/ giờ</span>
                </div>
                <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: 0 }}>{viewingService.moTa}</p>
                
                <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                  <span style={{ padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, background: viewingService.trangThai === "Đang hoạt động" ? "#ecfdf5" : "#fef2f2", color: viewingService.trangThai === "Đang hoạt động" ? "#10b981" : "#ef4444" }}>{viewingService.trangThai}</span>
                  {viewingService.phoBien && <span style={{ padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, background: "#fff7ed", color: "#ea580c" }}>Dịch vụ phổ biến</span>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "32px", borderTop: "1px solid #f1f5f9", paddingTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => { setViewingService(null); handleEdit(viewingService); }} style={{ padding: "12px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#fff", color: "#1e293b", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Chỉnh sửa</button>
              <button onClick={() => setViewingService(null)} style={{ padding: "12px 32px", borderRadius: "14px", border: "none", background: "#312e81", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "500px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>{editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Tên dịch vụ</label>
                <input type="text" value={formData.tenDichVu} required onChange={e => setFormData({ ...formData, tenDichVu: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>URL hình ảnh</label>
                <input type="text" value={formData.hinhAnh} onChange={e => setFormData({ ...formData, hinhAnh: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Giá theo giờ (VNĐ)</label>
                <input type="number" value={formData.giaTheoGio} required onChange={e => setFormData({ ...formData, giaTheoGio: Number(e.target.value) })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Mô tả dịch vụ</label>
                <textarea value={formData.moTa} required rows={3} onChange={e => setFormData({ ...formData, moTa: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", resize: "none" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={formData.phoBien} onChange={e => setFormData({ ...formData, phoBien: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Dịch vụ phổ biến</span>
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "none", background: "#312e81", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Lưu dịch vụ</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}