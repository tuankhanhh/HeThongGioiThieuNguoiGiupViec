"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";

interface SkillData {
  maKyNang: string;
  tenKyNang: string;
  moTa: string;
  iconName: string;
}

const emptyForm = { tenKyNang: "", moTa: "", iconName: "" };

export default function SkillsManagement() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get<{ success: boolean; data: SkillData[] }>("/admin/skills");
      if (response.success) {
        setSkills(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải kỹ năng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await api.put(`/admin/skills/${editingSkill.maKyNang}`, formData);
        setDialog({
          isOpen: true,
          type: "success",
          title: "Thành công",
          message: "Cập nhật kỹ năng thành công!"
        });
      } else {
        await api.post("/admin/skills", formData);
        setDialog({
          isOpen: true,
          type: "success",
          title: "Thành công",
          message: "Thêm kỹ năng mới thành công!"
        });
      }
      setShowModal(false);
      setEditingSkill(null);
      setFormData(emptyForm);
      fetchSkills();
    } catch (error) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Lỗi hệ thống",
        message: "Không thể lưu: " + (error as any).message
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa kỹ năng này?",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/skills/${id}`);
          setDialog({
            isOpen: true,
            type: "success",
            title: "Thành công",
            message: "Xóa kỹ năng thành công!"
          });
          fetchSkills();
        } catch (error) {
          setDialog({
            isOpen: true,
            type: "error",
            title: "Lỗi hệ thống",
            message: "Không thể xóa: " + (error as any).message
          });
        }
      }
    });
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <p>Đang tải...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .gpu-accelerated { transform: translateZ(0); }
      `}</style>
      
      <div className="gpu-accelerated">
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", animation: "fadeIn 0.3s ease-out both" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Quản trị
            </p>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Kỹ năng</h2>
            <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>
              Quản lý danh sách các kỹ năng yêu cầu.
            </p>
          </div>

          <button
            onClick={() => { setEditingSkill(null); setFormData(emptyForm); setShowModal(true); }}
            style={{ 
              padding: "12px 24px", borderRadius: "14px", border: "none", 
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", 
              color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", 
              display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(30, 27, 75, 0.25)"
            }}
          >
            Thêm mới
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden", animation: "fadeIn 0.4s ease-out both" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <tr>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "120px" }}>Mã KN</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Tên kỹ năng</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Mô tả</th>
                <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "150px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.maKyNang} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>{skill.maKyNang}</td>
                  <td style={{ padding: "16px 24px", fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{skill.tenKyNang}</td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#475569" }}>{skill.moTa}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button onClick={() => { setEditingSkill(skill); setFormData({ tenKyNang: skill.tenKyNang || "", moTa: skill.moTa || "", iconName: skill.iconName || "" }); setShowModal(true); }} style={{ padding: "6px 12px", background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Sửa</button>
                      <button onClick={() => handleDelete(skill.maKyNang)} style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {skills.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "450px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "24px" }}>{editingSkill ? "Chỉnh sửa" : "Thêm mới"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Tên kỹ năng</label>
                <input type="text" value={formData.tenKyNang} required onChange={e => setFormData({ ...formData, tenKyNang: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Mô tả</label>
                <textarea value={formData.moTa} rows={3} onChange={e => setFormData({ ...formData, moTa: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", resize: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Icon (Tên class/mã)</label>
                <input type="text" value={formData.iconName} onChange={e => setFormData({ ...formData, iconName: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "none", background: "#312e81", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Lưu</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
