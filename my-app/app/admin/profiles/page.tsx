"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";

interface PendingProfile {
  maHoSo: string;
  maNguoiDung: string;
  hoTen: string;
  email: string;
  soCccd: string;
  ngaySinh: string;
  gioiTinh: string;
  anhCccdMatTruoc: string;
  anhCccdMatSau: string;
  anhChanDung: string;
  giayXacNhanCuTru: string;
  trangThaiXacMinh: string;
}

export default function ProfilesApproval() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/admin/sign-in"); return; }
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await api.get<{ success: boolean; data: PendingProfile[] }>("/admin/profiles-pending");
      if (response.success) {
        setProfiles(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (maHoSo: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt hồ sơ này?")) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/profiles-approve/${maHoSo}`);
      alert("Đã duyệt hồ sơ thành công!");
      setSelectedProfile(null);
      fetchProfiles();
    } catch (error) {
      alert("Lỗi khi duyệt hồ sơ: " + (error as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile || !rejectReason) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/profiles-reject/${selectedProfile.maHoSo}`, { lyDo: rejectReason });
      alert("Đã từ chối hồ sơ!");
      setShowRejectModal(false);
      setSelectedProfile(null);
      setRejectReason("");
      fetchProfiles();
    } catch (error) {
      alert("Lỗi khi từ chối hồ sơ: " + (error as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#312e81", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Đang tải hồ sơ...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .table-row:hover { background: #f8fafc !important; }
        .img-container:hover { border-color: #3b82f6 !important; transform: scale(1.02); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: "32px", animation: "fadeIn 0.4s ease-out" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Kiểm duyệt
        </p>
        <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Hồ sơ chờ duyệt</h2>
        <p style={{ color: "#64748b", marginTop: "6px", fontSize: "16px" }}>
          Hệ thống đang có <span style={{ color: "#0f172a", fontWeight: 700 }}>{profiles.length}</span> hồ sơ cần xác minh thông tin.
        </p>
      </div>

      {/* ── Table ── */}
      <div style={{ 
        background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", 
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden",
        animation: "fadeIn 0.5s ease-out both"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                {["Thông tin cá nhân", "Số CCCD", "Giới tính", "Ngày sinh", "Thao tác"].map(h => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length > 0 ? profiles.map((profile) => (
                <tr key={profile.maHoSo} className="table-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{profile.hoTen}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{profile.email}</div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "#475569", fontSize: "14px", fontWeight: 600 }}>{profile.soCccd}</td>
                  <td style={{ padding: "16px 24px", color: "#475569", fontSize: "14px" }}>{profile.gioiTinh}</td>
                  <td style={{ padding: "16px 24px", color: "#475569", fontSize: "14px" }}>{profile.ngaySinh}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <button 
                      onClick={() => setSelectedProfile(profile)}
                      style={{ padding: "8px 20px", borderRadius: "10px", background: "#3b82f6", color: "white", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                    >
                      Kiểm tra ngay
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: "80px 24px", textAlign: "center", color: "#94a3b8", fontSize: "15px", fontWeight: 500 }}>
                    Tuyệt vời! Không còn hồ sơ nào đang chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "32px", width: "100%", maxWidth: "1000px", maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out", overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Chi tiết hồ sơ xác minh</h3>
                <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>Ứng viên: <span style={{ color: "#3b82f6", fontWeight: 700 }}>{selectedProfile.hoTen}</span></p>
              </div>
              <button onClick={() => setSelectedProfile(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                {[
                  { src: selectedProfile.anhChanDung, label: "Ảnh chân dung" },
                  { src: selectedProfile.anhCccdMatTruoc, label: "CCCD Mặt trước" },
                  { src: selectedProfile.anhCccdMatSau, label: "CCCD Mặt sau" },
                  { src: selectedProfile.giayXacNhanCuTru, label: "Giấy cư trú" }
                ].map((img, i) => (
                  <div key={i}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>{img.label}</p>
                    <div className="img-container" style={{ width: "100%", height: "220px", background: "#f8fafc", borderRadius: "16px", border: "2px solid #f1f5f9", overflow: "hidden", transition: "all 0.3s ease" }}>
                      <img src={img.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "32px", background: "#f8fafc", borderRadius: "20px", padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Số CCCD</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{selectedProfile.soCccd}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Ngày sinh</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{selectedProfile.ngaySinh}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 4px" }}>Giới tính</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{selectedProfile.gioiTinh}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 32px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
              <button disabled={submitting} onClick={() => setShowRejectModal(true)} style={{ padding: "12px 24px", borderRadius: "14px", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Từ chối hồ sơ</button>
              <button disabled={submitting} onClick={() => handleApprove(selectedProfile.maHoSo)} style={{ padding: "12px 32px", borderRadius: "14px", border: "none", background: "#10b981", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)" }}>{submitting ? "Đang duyệt..." : "Duyệt hồ sơ ngay"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "450px", padding: "32px", animation: "fadeIn 0.3s ease-out" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Lý do từ chối</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Vui lòng nhập lý do cụ thể để người dùng có thể điều chỉnh hồ sơ.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", resize: "none" }} placeholder="VD: Ảnh CCCD bị mờ, không rõ số..." />
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Hủy</button>
              <button disabled={submitting || !rejectReason} onClick={handleReject} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Gửi từ chối</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
