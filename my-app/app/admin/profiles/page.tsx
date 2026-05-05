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
    if (!token) {
      router.push("/admin/sign-in");
      return;
    }
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
      await api.post(`/admin/profiles-reject/${selectedProfile.maHoSo}`, {
        lyDo: rejectReason
      });
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

  const ProfileImage = ({ src, label }: { src: string; label: string }) => (
    <div style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563", marginBottom: "8px" }}>{label}</p>
      <div style={{ 
        width: "100%", 
        height: "200px", 
        background: "#f3f4f6", 
        borderRadius: "12px", 
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {src ? (
          <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#9ca3af", fontSize: "12px" }}>Không có ảnh</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#6366f1", animation: "spin 1s linear infinite" }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ marginBottom: "32px", animation: "fadeIn 0.5s ease" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0 }}>Kiểm duyệt hồ sơ</h1>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>Quản lý và xác minh thông tin người giúp việc mới tham gia hệ thống.</p>
      </div>

      <div style={{ background: "white", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                {["Thông tin cá nhân", "Số CCCD", "Giới tính", "Ngày sinh", "Thao tác"].map(h => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length > 0 ? profiles.map((profile) => (
                <tr key={profile.maHoSo} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{profile.hoTen}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>{profile.email}</div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "#374151", fontSize: "14px" }}>{profile.soCccd}</td>
                  <td style={{ padding: "16px 24px", color: "#374151", fontSize: "14px" }}>{profile.gioiTinh}</td>
                  <td style={{ padding: "16px 24px", color: "#374151", fontSize: "14px" }}>{profile.ngaySinh}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <button 
                      onClick={() => setSelectedProfile(profile)}
                      style={{ padding: "8px 16px", borderRadius: "10px", background: "#6366f1", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.2)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#9ca3af" }}>
                    Hiện không có hồ sơ nào đang chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", width: "90%", maxWidth: "900px", maxHeight: "90vh", borderRadius: "24px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>Hồ sơ của {selectedProfile.hoTen}</h2>
                <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: "14px" }}>Vui lòng đối chiếu các giấy tờ dưới đây.</p>
              </div>
              <button onClick={() => setSelectedProfile(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                <ProfileImage src={selectedProfile.anhChanDung} label="Ảnh chân dung" />
                <ProfileImage src={selectedProfile.anhCccdMatTruoc} label="CCCD Mặt trước" />
                <ProfileImage src={selectedProfile.anhCccdMatSau} label="CCCD Mặt sau" />
                <ProfileImage src={selectedProfile.giayXacNhanCuTru} label="Giấy xác nhận cư trú" />
              </div>

              <div style={{ marginTop: "24px", background: "#f9fafb", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>Thông tin chi tiết</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Số CCCD</div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{selectedProfile.soCccd}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Giới tính</div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{selectedProfile.gioiTinh}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Ngày sinh</div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{selectedProfile.ngaySinh}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                disabled={submitting}
                onClick={() => setShowRejectModal(true)}
                style={{ padding: "12px 24px", borderRadius: "12px", background: "white", color: "#ef4444", border: "1px solid #fca5a5", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                Từ chối
              </button>
              <button 
                disabled={submitting}
                onClick={() => handleApprove(selectedProfile.maHoSo)}
                style={{ padding: "12px 24px", borderRadius: "12px", background: "#10b981", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {submitting ? "Đang xử lý..." : "Duyệt hồ sơ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối */}
      {showRejectModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", width: "100%", maxWidth: "450px", borderRadius: "24px", padding: "32px", position: "relative", animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Lý do từ chối</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>Vui lòng cho biết lý do tại sao hồ sơ này không được chấp nhận.</p>
            
            <textarea 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do tại đây..."
              style={{ width: "100%", height: "120px", borderRadius: "12px", border: "1.5px solid #e5e7eb", padding: "16px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
              onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
            />

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#f3f4f6", color: "#4b5563", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button 
                disabled={submitting || !rejectReason}
                onClick={handleReject}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#ef4444", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", opacity: submitting || !rejectReason ? 0.6 : 1 }}
              >
                {submitting ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
