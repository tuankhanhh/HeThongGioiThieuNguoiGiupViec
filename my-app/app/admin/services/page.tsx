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
  tenKyNang?: string; // Đã chuyển thành 1 chuỗi duy nhất
}

interface FormData {
  tenDichVu: string;
  moTa: string;
  giaTheoGio: number;
  hinhAnh: string;
  phoBien: boolean;
  thanhPhans: string[];
  tenKyNang: string; // Đã chuyển thành 1 chuỗi duy nhất
}

const emptyForm: FormData = {
  tenDichVu: "",
  moTa: "",
  giaTheoGio: 0,
  hinhAnh: "",
  phoBien: false,
  thanhPhans: [],
  tenKyNang: "", // Khởi tạo chuỗi rỗng
};

export default function ServicesManagement() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [newSubService, setNewSubService] = useState("");

  const [availableThanhPhans, setAvailableThanhPhans] = useState<
    { maThanhPhan: string; tenThanhPhan: string }[]
  >([]);
  const [availableKyNangs, setAvailableKyNangs] = useState<
    { maKyNang: string; tenKyNang: string }[]
  >([]);

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

  const showAlert = (
    message: string,
    title: string = "Thông báo",
    type: "success" | "error" = "success",
  ) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/admin/sign-in");
      return;
    }
    fetchServices();
    fetchExtras();
  }, []);

  const fetchExtras = async () => {
    try {
      const resTp = await api.get<{ success: boolean; data: any[] }>(
        "/admin/service-components",
      );
      if (resTp.success) setAvailableThanhPhans(resTp.data);
      const resKn = await api.get<{ success: boolean; data: any[] }>(
        "/admin/skills",
      );
      if (resKn.success) setAvailableKyNangs(resKn.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu phụ trợ:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get<{ success: boolean; data: Service[] }>(
        "/admin/services",
      );
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
      // Vì API bây giờ cần đúng chuỗi Tên Kỹ Năng
      // Và FormData của chúng ta cũng đã có tenKyNang, gửi trực tiếp formData là hợp lệ
      if (editingService) {
        await api.put(`/admin/services/${editingService.maDichVu}`, formData);
      } else {
        await api.post("/admin/services", formData);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData(emptyForm);
      fetchServices();
      showAlert("Xử lý thông tin dịch vụ thành công!", "Thành công", "success");
    } catch (error: any) {
      // Backend sẽ trả về lỗi nếu Kỹ năng này đã được dịch vụ khác dùng (Quan hệ 1-1)
      const errorMsg = error.response?.data?.message || error.message;
      showAlert("Lỗi khi xử lý dịch vụ: " + errorMsg, "Lỗi", "error");
    }
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setFormData({
      tenDichVu: s.tenDichVu,
      moTa: s.moTa,
      giaTheoGio: s.giaTheoGio,
      hinhAnh: s.hinhAnh,
      phoBien: s.phoBien,
      thanhPhans: s.thanhPhans || [],
      tenKyNang: s.tenKyNang || "", // Bind tên kỹ năng duy nhất vào form
    });
    setShowModal(true);
  };

  const handleViewDetail = (s: Service) => {
    setViewingService(s);
  };

  const handleDelete = async (maDichVu: string) => {
    showConfirm("Bạn có chắc muốn ngừng hoạt động dịch vụ này?", async () => {
      try {
        await api.delete(`/admin/services/${maDichVu}`);
        showAlert(
          "Đã ngừng hoạt động dịch vụ thành công!",
          "Thành công",
          "success",
        );
        fetchServices();
      } catch (error) {
        showAlert(
          "Lỗi khi xóa dịch vụ: " + (error as any).message,
          "Lỗi",
          "error",
        );
      }
    });
  };

  if (loading)
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
              Đang tải dịch vụ...
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .svc-card { 
          will-change: transform, box-shadow;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          background: #ffffff;
        }
        .svc-card:hover { 
          transform: translateY(-6px) !important; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; 
          border-color: #6366f1 !important; 
        }
        .btn-primary-premium {
          background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%) !important;
          color: #fff !important;
          border: none !important;
          transition: all 0.2s ease !important;
        }
        .btn-primary-premium:hover {
          background: linear-gradient(135deg, #4338ca 0%, #312e81 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(49, 46, 129, 0.2) !important;
        }
        .btn-secondary-premium {
          background: #f8fafc !important;
          color: #475569 !important;
          border: 1px solid #e2e8f0 !important;
          transition: all 0.2s ease !important;
        }
        .btn-secondary-premium:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .btn-danger-premium {
          background: #fef2f2 !important;
          color: #ef4444 !important;
          border: 1px solid #fee2e2 !important;
          transition: all 0.2s ease !important;
        }
        .btn-danger-premium:hover {
          background: #fee2e2 !important;
          color: #b91c1c !important;
          border-color: #fca5a5 !important;
        }
        .sub-service-tag {
          background: #eff6ff !important;
          color: #1d4ed8 !important;
          border: 1px solid #bfdbfe !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          padding: 4px 10px !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          transition: all 0.15s ease !important;
        }
        .sub-service-tag:hover {
          background: #dbeafe !important;
          transform: scale(1.03) !important;
        }
      `}</style>

      <div className="gpu-accelerated">
        {/* ── Header ── */}
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            animation: "fadeIn 0.3s ease-out both",
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
              Quản trị
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
              Dịch vụ hệ thống
            </h2>
            <p style={{ color: "#64748b", marginTop: "6px", fontSize: "15px" }}>
              Quản lý danh mục các dịch vụ cung cấp tới khách hàng.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingService(null);
              setFormData(emptyForm);
              setShowModal(true);
            }}
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 12px rgba(30, 27, 75, 0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="20"
              height="20"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm dịch vụ mới
          </button>
        </div>

        {/* ── Cards Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "28px",
            animation: "fadeIn 0.4s ease-out both",
          }}
        >
          {services.map((service) => (
            <div
              key={service.maDichVu}
              className="svc-card"
              style={{
                background: "#fff",
                borderRadius: "24px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "190px",
                  background: "#f1f5f9",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    service.hinhAnh ||
                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500"
                  }
                  alt={service.tenDichVu}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    display: "flex",
                    gap: "8px",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 800,
                      background:
                        service.trangThai === "Đang hoạt động"
                          ? "rgba(236, 253, 245, 0.9)"
                          : "rgba(254, 242, 242, 0.9)",
                      color:
                        service.trangThai === "Đang hoạt động"
                          ? "#10b981"
                          : "#ef4444",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    {service.trangThai}
                  </span>
                  {service.phoBien && (
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: "rgba(255, 247, 237, 0.9)",
                        color: "#ea580c",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      Phổ biến ★
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {service.maDichVu}
                </span>

                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "6px 0 10px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {service.tenDichVu}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    margin: "0 0 18px",
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {service.moTa}
                </p>

                {/* Dịch vụ thành phần */}
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 10px",
                    }}
                  >
                    Dịch vụ thành phần:
                  </p>
                  {service.thanhPhans && service.thanhPhans.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {service.thanhPhans.slice(0, 3).map((tp, idx) => (
                        <span key={idx} className="sub-service-tag">
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {tp}
                        </span>
                      ))}
                      {service.thanhPhans.length > 3 && (
                        <span
                          className="sub-service-tag"
                          style={{
                            background: "#f1f5f9 !important",
                            color: "#475569 !important",
                            border: "1px solid #e2e8f0 !important",
                          }}
                        >
                          +{service.thanhPhans.length - 3} khác
                        </span>
                      )}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#cbd5e1",
                        fontStyle: "italic",
                      }}
                    >
                      Chưa cấu hình dịch vụ thành phần
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                    marginBottom: "20px",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      color: "#1e1b4b",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {service.giaTheoGio.toLocaleString()}đ
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      fontWeight: 700,
                    }}
                  >
                    / giờ
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleViewDetail(service)}
                    className="btn-primary-premium"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Xem chi tiết
                  </button>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(service)}
                      className="btn-secondary-premium"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(service.maDichVu)}
                      className="btn-danger-premium"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Tạm ngừng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Detail Modal ── */}
        {viewingService && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "32px",
                width: "100%",
                maxWidth: "700px",
                padding: "40px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.3s ease-out",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <button
                onClick={() => setViewingService(null)}
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "24px",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px solid #e2e8f0",
                    margin: "0 auto",
                  }}
                >
                  <img
                    src={viewingService.hinhAnh}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#3b82f6",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {viewingService.maDichVu}
                  </span>
                  <h3
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "8px 0 12px",
                    }}
                  >
                    {viewingService.tenDichVu}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "6px",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#312e81",
                      }}
                    >
                      {viewingService.giaTheoGio.toLocaleString()}đ
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      / giờ
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#475569",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {viewingService.moTa}
                  </p>

                  <div
                    style={{ marginTop: "24px", display: "flex", gap: "12px" }}
                  >
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        background:
                          viewingService.trangThai === "Đang hoạt động"
                            ? "#ecfdf5"
                            : "#fef2f2",
                        color:
                          viewingService.trangThai === "Đang hoạt động"
                            ? "#10b981"
                            : "#ef4444",
                      }}
                    >
                      {viewingService.trangThai}
                    </span>
                    {viewingService.phoBien && (
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 700,
                          background: "#fff7ed",
                          color: "#ea580c",
                        }}
                      >
                        Dịch vụ phổ biến
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dịch vụ thành phần */}
              <div
                style={{
                  marginTop: "28px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "24px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#475569",
                    marginBottom: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Danh mục dịch vụ thành phần (
                  {viewingService.thanhPhans
                    ? viewingService.thanhPhans.length
                    : 0}
                  )
                </h4>
                {viewingService.thanhPhans &&
                viewingService.thanhPhans.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {viewingService.thanhPhans.map((tp, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#f8fafc",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          {tp}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "14px",
                      border: "1px dashed #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      Chưa có cấu hình dịch vụ thành phần nào cho dịch vụ này.
                    </p>
                  </div>
                )}
              </div>

              {/* Yêu cầu kỹ năng (Quan hệ 1-1) hiển thị xem chi tiết */}
              <div
                style={{
                  marginTop: "24px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "24px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#475569",
                    marginBottom: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Yêu cầu Kỹ năng chính
                </h4>
                {viewingService.tenKyNang ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      background: "#fff7ed",
                      borderRadius: "14px",
                      border: "1px solid #ffedd5",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#ffedd5",
                        color: "#ea580c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid #fed7aa",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#c2410c",
                      }}
                    >
                      {viewingService.tenKyNang}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "14px",
                      border: "1px dashed #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      Dịch vụ này chưa được cấu hình yêu cầu kỹ năng.
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "32px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "32px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => {
                    setViewingService(null);
                    handleEdit(viewingService);
                  }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    color: "#1e293b",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setViewingService(null)}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#312e81",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Form Modal ── */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "500px",
                padding: "32px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.3s ease-out",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "24px",
                }}
              >
                {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Tên dịch vụ
                  </label>
                  <input
                    type="text"
                    value={formData.tenDichVu}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, tenDichVu: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Hình ảnh dịch vụ
                  </label>
                  {formData.hinhAnh && (
                    <div
                      style={{
                        marginBottom: "12px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        maxWidth: "200px",
                      }}
                    >
                      <img
                        src={formData.hinhAnh}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formDataUpload = new FormData();
                      formDataUpload.append("file", file);
                      try {
                        const response = await api.post(
                          "/dichvu/upload-image",
                          formDataUpload,
                        );
                        setFormData({ ...formData, hinhAnh: response.imageUrl });
                        showAlert(
                          "Tải ảnh lên thành công!",
                          "Thành công",
                          "success",
                        );
                      } catch (error) {
                        showAlert(
                          "Lỗi khi tải ảnh lên: " + (error as any).message,
                          "Lỗi",
                          "error",
                        );
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Giá theo giờ (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.giaTheoGio}
                    required
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giaTheoGio: Number(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Mô tả dịch vụ
                  </label>
                  <textarea
                    value={formData.moTa}
                    required
                    rows={3}
                    onChange={(e) =>
                      setFormData({ ...formData, moTa: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: "14px",
                      resize: "none",
                    }}
                  />
                </div>

                {/* Thành phần dịch vụ (Vẫn được thiết kế chọn nhiều array) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Dịch vụ thành phần
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      value={newSubService}
                      onChange={(e) => setNewSubService(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <option value="">-- Chọn thành phần dịch vụ --</option>
                      {availableThanhPhans
                        .filter(
                          (tp) =>
                            !formData.thanhPhans.includes(tp.tenThanhPhan),
                        )
                        .map((tp) => (
                          <option key={tp.maThanhPhan} value={tp.tenThanhPhan}>
                            {tp.tenThanhPhan}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSubService) return;
                        if (!formData.thanhPhans.includes(newSubService)) {
                          setFormData({
                            ...formData,
                            thanhPhans: [...formData.thanhPhans, newSubService],
                          });
                        }
                        setNewSubService("");
                      }}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border: "none",
                        background: "#f1f5f9",
                        color: "#1e293b",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Thêm
                    </button>
                  </div>

                  {formData.thanhPhans && formData.thanhPhans.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {formData.thanhPhans.map((tp, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {tp}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                thanhPhans: formData.thanhPhans.filter(
                                  (t) => t !== tp,
                                ),
                              })
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "12px",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Yêu cầu Kỹ năng (1 Select Duy Nhất) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Yêu cầu Kỹ năng
                  </label>
                  <select
                    value={formData.tenKyNang}
                    onChange={(e) =>
                      setFormData({ ...formData, tenKyNang: e.target.value })
                    }
                    required // Ràng buộc bắt buộc chọn 1 kỹ năng
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="">-- Chọn một kỹ năng --</option>
                    {availableKyNangs.map((kn) => (
                      <option key={kn.maKyNang} value={kn.tenKyNang}>
                        {kn.tenKyNang}
                      </option>
                    ))}
                  </select>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.phoBien}
                    onChange={(e) =>
                      setFormData({ ...formData, phoBien: e.target.checked })
                    }
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    Đánh dấu là Dịch vụ phổ biến
                  </span>
                </label>

                <div
                  style={{ display: "flex", gap: "12px", marginTop: "12px" }}
                >
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "14px",
                      border: "none",
                      background: "#312e81",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Lưu dịch vụ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── Premium Custom Modal Dialog (Alert / Confirm) ── */}
      {dialog.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "420px",
              padding: "32px",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            {/* Status Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background:
                  dialog.type === "confirm"
                    ? "#fef3c7"
                    : dialog.type === "error"
                      ? "#fee2e2"
                      : "#ecfdf5",
                color:
                  dialog.type === "confirm"
                    ? "#d97706"
                    : dialog.type === "error"
                      ? "#ef4444"
                      : "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              {dialog.type === "confirm" ? (
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : dialog.type === "error" ? (
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              {dialog.title}
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "28px",
              }}
            >
              {dialog.message}
            </p>

            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              {dialog.type === "confirm" ? (
                <>
                  <button
                    onClick={() =>
                      setDialog((prev) => ({ ...prev, isOpen: false }))
                    }
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
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      if (dialog.onConfirm) dialog.onConfirm();
                      setDialog((prev) => ({ ...prev, isOpen: false }));
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
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#ef4444")
                    }
                  >
                    Đồng ý
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setDialog((prev) => ({ ...prev, isOpen: false }))
                  }
                  style={{
                    padding: "12px 36px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(30, 27, 75, 0.25)",
                    transition: "all 0.15s",
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
