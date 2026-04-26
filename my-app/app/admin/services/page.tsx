"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const MOCK_SERVICES: Service[] = [
  {
    maDichVu: "DV001", tenDichVu: "Dọn dẹp nhà cửa",
    moTa: "Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.",
    giaTheoGio: 60000, hinhAnh: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    trangThai: "Đang hoạt động", phoBien: true,
    thanhPhans: ["Quét & lau sàn", "Lau bụi nội thất", "Thu gom rác"],
  },
  {
    maDichVu: "DV002", tenDichVu: "Tổng vệ sinh",
    moTa: "Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.",
    giaTheoGio: 150000, hinhAnh: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400",
    trangThai: "Đang hoạt động", phoBien: false,
    thanhPhans: ["Tẩy vết bẩn cứng đầu", "Vệ sinh bếp & toilet", "Hút bụi rèm cửa"],
  },
  {
    maDichVu: "DV003", tenDichVu: "Nấu ăn gia đình",
    moTa: "Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.",
    giaTheoGio: 80000, hinhAnh: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
    trangThai: "Đang hoạt động", phoBien: false,
    thanhPhans: ["Lên thực đơn", "Đi chợ mua đồ", "Dọn dẹp sau nấu"],
  },
  {
    maDichVu: "DV004", tenDichVu: "Chăm sóc trẻ em",
    moTa: "Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.",
    giaTheoGio: 70000, hinhAnh: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400",
    trangThai: "Đang hoạt động", phoBien: true,
    thanhPhans: ["Cho bé ăn", "Tắm rửa & thay đồ", "Chơi cùng bé"],
  },
  {
    maDichVu: "DV005", tenDichVu: "Chăm sóc người cao tuổi",
    moTa: "Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.",
    giaTheoGio: 80000, hinhAnh: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400",
    trangThai: "Đang hoạt động", phoBien: false,
    thanhPhans: ["Hỗ trợ di chuyển", "Nhắc uống thuốc", "Trò chuyện tâm sự"],
  },
  {
    maDichVu: "DV006", tenDichVu: "Giặt sofa & nệm",
    moTa: "Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.",
    giaTheoGio: 250000, hinhAnh: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400",
    trangThai: "Đang hoạt động", phoBien: false,
    thanhPhans: ["Hút bụi bằng máy", "Tẩy ố bằng hơi nước", "Khử mùi diệt khuẩn"],
  },
];

const emptyForm: FormData = { tenDichVu: "", moTa: "", giaTheoGio: 0, hinhAnh: "", phoBien: false };

// ─── tiny shared tokens ───────────────────────────────────────────────────────
const T = {
  purple: { bg: "#EEEDFE", text: "#534AB7", border: "#C9C6F4" },
  green:  { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
  red:    { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
  amber:  { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
  gray:   { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  borderRadius: "8px", border: "0.5px solid #e5e7eb",
  fontSize: "13px", color: "#1f2937", outline: "none",
  boxSizing: "border-box", background: "#fff",
  transition: "border-color 0.15s",
};

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
    setTimeout(() => { setServices(MOCK_SERVICES); setLoading(false); }, 400);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices(prev => prev.map(s => s.maDichVu === editingService.maDichVu ? { ...s, ...formData } : s));
    } else {
      const newId = "DV" + String(services.length + 1).padStart(3, "0");
      setServices(prev => [...prev, { maDichVu: newId, ...formData, trangThai: "Đang hoạt động", thanhPhans: [] }]);
    }
    setShowModal(false); setEditingService(null); setFormData(emptyForm);
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setFormData({ tenDichVu: s.tenDichVu, moTa: s.moTa, giaTheoGio: s.giaTheoGio, hinhAnh: s.hinhAnh, phoBien: s.phoBien });
    setShowModal(true);
  };

  const handleDelete = (maDichVu: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    setServices(prev => prev.map(s => s.maDichVu === maDichVu ? { ...s, trangThai: "Ngừng hoạt động" } : s));
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #EEEDFE", borderTopColor: "#534AB7", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <p style={{ marginTop: "12px", color: "#534AB7", fontWeight: 500, fontSize: "14px" }}>Đang tải...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .svc-card:hover { border-color: #c7d2fe !important; box-shadow: 0 8px 28px rgba(99,102,241,0.10) !important; transform: translateY(-3px); }
        .svc-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .btn-edit:hover { background: #534AB7 !important; color: #fff !important; border-color: #534AB7 !important; }
        .btn-del:hover  { background: #991B1B !important; color: #fff !important; border-color: #991B1B !important; }
        .btn-edit, .btn-del { transition: background 0.15s, color 0.15s, border-color 0.15s; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Quản trị hệ thống
          </p>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#1e1b4b", margin: 0 }}>Quản lý dịch vụ</h2>
          <p style={{ color: "#9ca3af", marginTop: "4px", fontSize: "13px" }}>
            <span style={{ color: "#534AB7", fontWeight: 600 }}>{services.length}</span> dịch vụ trong hệ thống
          </p>
        </div>

        <button
          onClick={() => { setEditingService(null); setFormData(emptyForm); setShowModal(true); }}
          style={{ padding: "9px 18px", borderRadius: "10px", border: "0.5px solid #C9C6F4", background: "#EEEDFE", color: "#534AB7", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="15" height="15">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm dịch vụ
        </button>
      </div>

      {/* ── Cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))", gap: "16px" }}>
        {services.map((service, index) => (
          <div
            key={service.maDichVu}
            className="svc-card"
            style={{
              background: "#fff",
              borderRadius: "14px",
              overflow: "hidden",
              border: "0.5px solid #e5e7eb",
              animation: `fadeInUp 0.35s ease ${index * 0.055}s both`,
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", height: "168px", overflow: "hidden", background: "#f3f4f6" }}>
              {service.hinhAnh ? (
                <img
                  src={service.hinhAnh}
                  alt={service.tenDichVu}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d1d5db" }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="40" height="40">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Overlay badges */}
              <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{
                  padding: "3px 9px", borderRadius: "99px", fontSize: "11px", fontWeight: 600,
                  background: service.trangThai === "Đang hoạt động" ? T.green.bg : T.red.bg,
                  color: service.trangThai === "Đang hoạt động" ? T.green.text : T.red.text,
                  backdropFilter: "blur(6px)",
                }}>
                  {service.trangThai === "Đang hoạt động" ? "● Hoạt động" : "● Ngừng"}
                </span>
                {service.phoBien && (
                  <span style={{ padding: "3px 9px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: T.amber.bg, color: T.amber.text }}>
                    ★ Phổ biến
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "16px" }}>
              {/* ID tag */}
              <span style={{ fontSize: "10px", fontWeight: 600, color: T.purple.text, background: T.purple.bg, padding: "1px 7px", borderRadius: "4px", letterSpacing: "0.04em" }}>
                {service.maDichVu}
              </span>

              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1e1b4b", margin: "7px 0 4px" }}>
                {service.tenDichVu}
              </h3>
              <p style={{
                fontSize: "12px", color: "#9ca3af", margin: "0 0 12px", lineHeight: 1.55,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {service.moTa}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "14px" }}>
                <span style={{ fontSize: "20px", fontWeight: 600, color: "#534AB7" }}>
                  {service.giaTheoGio.toLocaleString("vi-VN")}đ
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>/giờ</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(service)}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${T.purple.border}`, background: T.purple.bg, color: T.purple.text, fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                >
                  Chỉnh sửa
                </button>
                <button
                  className="btn-del"
                  onClick={() => handleDelete(service.maDichVu)}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `0.5px solid ${T.red.border}`, background: T.red.bg, color: T.red.text, fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,10,40,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 48px rgba(0,0,0,0.18)", animation: "modalIn 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Modal header */}
            <div style={{ padding: "22px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#1e1b4b", margin: 0 }}>
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </h3>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: "3px 0 0" }}>
                  {editingService ? "Cập nhật thông tin dịch vụ" : "Điền đầy đủ thông tin bên dưới"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ width: "30px", height: "30px", borderRadius: "8px", border: "0.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexShrink: 0 }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 24px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Tên dịch vụ */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Tên dịch vụ</label>
                  <input type="text" value={formData.tenDichVu} required
                    onChange={e => setFormData({ ...formData, tenDichVu: e.target.value })}
                    placeholder="VD: Dọn dẹp nhà cửa"
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#a5b4fc"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#e5e7eb"}
                  />
                </div>

                {/* URL hình ảnh */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>URL hình ảnh</label>
                  <input type="text" value={formData.hinhAnh}
                    onChange={e => setFormData({ ...formData, hinhAnh: e.target.value })}
                    placeholder="https://..."
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#a5b4fc"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#e5e7eb"}
                  />
                </div>

                {/* Giá */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Giá theo giờ (VNĐ)</label>
                  <input type="number" value={formData.giaTheoGio} required min={0}
                    onChange={e => setFormData({ ...formData, giaTheoGio: Number(e.target.value) })}
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#a5b4fc"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#e5e7eb"}
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Mô tả</label>
                  <textarea value={formData.moTa} onChange={e => setFormData({ ...formData, moTa: e.target.value })} rows={3} required
                    placeholder="Mô tả ngắn về dịch vụ..."
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#a5b4fc"}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "#e5e7eb"}
                  />
                </div>

                {/* Checkbox phổ biến */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div
                    onClick={() => setFormData({ ...formData, phoBien: !formData.phoBien })}
                    style={{
                      width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                      border: formData.phoBien ? "none" : "0.5px solid #d1d5db",
                      background: formData.phoBien ? "#534AB7" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {formData.phoBien && (
                      <svg fill="none" viewBox="0 0 24 24" stroke="white" width="12" height="12">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", color: "#374151", userSelect: "none" }}>Đánh dấu là dịch vụ phổ biến</span>
                </label>
              </div>

              {/* Modal footer */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "none", background: "#534AB7", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                  {editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "0.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
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