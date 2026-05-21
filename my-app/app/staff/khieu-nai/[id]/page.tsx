"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import StatusBadge from "@/components/componentsStaff/StatusBadge";
import ReasonTextarea from "@/components/componentsStaff/ReasonTextarea";
import ConfirmModal from "@/components/componentsStaff/ConfirmModal";
import { LoadingState, ErrorState } from "@/components/componentsStaff/States";
import { motion, AnimatePresence } from "framer-motion";

interface CaLamViecLoi {
  maNgayLamViec: string;
  tenDichVu: string;
  ngayLam: string;
  gioBatDau: string;
  gioKetThuc: string | null;
  maNguoiGiupViec: string | null;
  tenNguoiGiupViec: string | null;
  trangThai: string;
  nguoiDeXuat: {
    maNguoiGiupViec: string;
    hoTen: string;
    kyNangs: { maKyNang: string; tenKyNang: string; kinhNghiem: string }[];
  } | null;
}

interface KhieuNaiDetail {
  maKhieuNai: string;
  maDon: string;
  noiDung: string;
  thoiGian: string;
  trangThai: string;
  phanHoi: string | null;
  maKhachHang: string;
  hoTenKhachHang: string;
  emailKhachHang: string;
  sdtKhachHang: string;
  maNhanVien: string | null;
  hoTenNhanVien: string | null;
  thongTinDon: {
    ngayDat: string;
    tongTien: number;
    diaChi: string;
    trangThaiHienTai: string;
  };
  caLamViecLoi?: CaLamViecLoi[];
}

interface Candidate {
  maNguoiGiupViec: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  anhChanDung: string;
  danhSachKyNang: string[];
  chiTietKyNang: { maKyNang: string; tenKyNang: string; kinhNghiem: string }[];
  soLichDangCo: number;
}

interface ShiftOption {
  maNgayLamViec: string;
  maDonDatDichVu?: string;
  tenDichVu?: string;
  ngayLam: string;
  gioBatDau: string;
  currentAssignment?: Candidate | null;
  replacementCandidates?: Candidate[];
  candidates?: Candidate[];
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-[14.5px] text-slate-800 font-medium break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function formatMoney(n: number | undefined | null) {
  return n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";
}

function formatDateTime(d: string | null) {
  return d ? new Date(d).toLocaleString("vi-VN") : "Chưa có dữ liệu";
}

const calculateNewTime = (
  oldTimeString: string | null | undefined,
  minutes: number,
) => {
  if (!oldTimeString) return "—";
  const parts = oldTimeString.split(":");
  if (parts.length < 2) return oldTimeString;

  const [hoursStr, minutesStr] = parts;
  let h = parseInt(hoursStr, 10);
  let m = parseInt(minutesStr, 10) + minutes;

  h = h + Math.floor(m / 60);
  m = m % 60;

  h = h % 24;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const ManualAssignModal = ({
  isOpen,
  onClose,
  shift,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  shift: ShiftOption | null;
  onAssign: (maNguoiGiupViec: string) => void;
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  if (!isOpen || !shift) return null;

  const currentMa = shift.currentAssignment?.maNguoiGiupViec;
  const candidates = (shift.candidates || []).filter(
    (c) => c.maNguoiGiupViec !== currentMa,
  );
  const itemsPerSlide = 2;
  const totalSlides = Math.ceil(candidates.length / itemsPerSlide);

  const currentCandidates = candidates.slice(
    slideIndex * itemsPerSlide,
    (slideIndex + 1) * itemsPerSlide,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Chọn người giúp việc thủ công
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Ca làm việc: {shift.ngayLam} ({shift.gioBatDau}) -{" "}
              {shift.tenDichVu}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 relative min-h-[300px]">
          {candidates.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center h-full">
              <svg
                className="w-12 h-12 text-slate-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              Không có ứng viên nào rảnh rỗi và phù hợp kỹ năng cho ca làm việc
              này.
            </div>
          ) : (
            <div className="relative h-full flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {currentCandidates.map((c) => (
                    <div
                      key={c.maNguoiGiupViec}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full"
                    >
                      <div className="flex gap-4 items-start mb-4">
                        <img
                          src={c.anhChanDung || "/default-avatar.png"}
                          alt={c.hoTen}
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-1">
                            {c.hoTen}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-mono rounded-md">
                            {c.maNguoiGiupViec}
                          </span>
                          <div className="flex items-center gap-1.5 mt-2">
                            <svg
                              className="w-3.5 h-3.5 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="text-[12px] font-medium text-slate-600">
                              {c.soDienThoai}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 mb-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Kỹ năng
                        </div>
                        {c.chiTietKyNang.slice(0, 3).map((kn) => (
                          <div
                            key={kn.maKyNang}
                            className="bg-slate-50 rounded-lg p-2 text-[12px] flex justify-between items-center border border-slate-100"
                          >
                            <span className="font-medium text-slate-700">
                              {kn.tenKyNang}
                            </span>
                            <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                              {kn.kinhNghiem || "Mới"}
                            </span>
                          </div>
                        ))}
                        {c.chiTietKyNang.length === 0 && (
                          <div className="text-[12px] text-slate-400 italic">
                            Chưa cập nhật kỹ năng
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onAssign(c.maNguoiGiupViec)}
                        className="w-full py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[13px] transition-colors mt-auto flex items-center justify-center gap-2"
                      >
                        Chọn ứng viên này
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {totalSlides > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() =>
                      setSlideIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={slideIndex === 0}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-[13px] font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                    {slideIndex + 1} / {totalSlides}
                  </span>
                  <button
                    onClick={() =>
                      setSlideIndex((prev) =>
                        Math.min(totalSlides - 1, prev + 1),
                      )
                    }
                    disabled={slideIndex === totalSlides - 1}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChiTietKhieuNaiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [kn, setKn] = useState<KhieuNaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Tab 1 state
  const [thoiGianLuiPhut, setThoiGianLuiPhut] = useState<number>(30);
  const [shiftsInfo, setShiftsInfo] = useState<ShiftOption[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // Manual Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedShiftForManual, setSelectedShiftForManual] =
    useState<ShiftOption | null>(null);

  const [manualSelections, setManualSelections] = useState<
    Record<
      string,
      {
        maNguoiGiupViec: string;
        hoTen: string;
        kyNangs: { maKyNang: string; tenKyNang: string; kinhNghiem: string }[];
      }
    >
  >({});
  // Tab 2 state (Hủy lịch)
  const [huyDonLyDo, setHuyDonLyDo] = useState("");
  const [huyDonError, setHuyDonError] = useState("");

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/v1/khieu-nai/chi-tiet/${id}`);
      const data = res?.data;
      setKn(data);
      if (data?.maDon) {
        fetchShiftsInfo(data.maDon);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Không tìm thấy dữ liệu khiếu nại.");
      } else {
        setError(err?.message ?? "Lỗi hệ thống.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftsInfo = async (maDon: string) => {
    setLoadingShifts(true);
    try {
      const res = await api.get<any>(
        `/v1/staff/danh-sach-nguoi-giup-viec?maDon=${maDon}`,
      );
      const mode3 = res?.mode3 ?? res?.data?.mode3;
      if (mode3) {
        setShiftsInfo(mode3);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingShifts(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const isResolved = kn?.trangThai === "Đã xử lý";

  const handleTiepNhanKhieuNai = async () => {
    setSubmitting(true);
    try {
      await api.post(`/v1/khieu-nai/dang-xu-ly/${id}`);
      setSuccessMsg("Đã tiếp nhận khiếu nại. Bạn có thể bắt đầu xử lý.");
      await fetchData(); // Cập nhật lại data mới nhất
    } catch (err: any) {
      setActionError(err?.message ?? "Lỗi khi tiếp nhận khiếu nại.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleAutoReassign = async () => {
    setActionError(null);
    setSuccessMsg(null);

    if (thoiGianLuiPhut < 15 || thoiGianLuiPhut > 45) {
      setActionError("Thời gian lùi lịch phải từ 15 đến 45 phút.");
      return;
    }

    setConfirmMessage(
      `Bạn có chắc chắn muốn lùi lịch ${thoiGianLuiPhut} phút và tự động phân công lại cho tất cả các ca bị lỗi?`,
    );
    setConfirmAction(() => async () => {
      setSubmitting(true);
      try {
        const res = await api.post<any>("/v1/khieu-nai/tu-dong-phan-cong-lai", {
          maKhieuNai: id,
          thoiGianLuiPhut: Number(thoiGianLuiPhut),
          danhSachPhanCongThuCong: Object.entries(manualSelections).map(
            ([maNgayLamViec, info]) => ({
              maNgayLamViec,
              maNguoiGiupViec: info.maNguoiGiupViec,
            }),
          ),
        });
        setSuccessMsg(res?.message || "Đã phân công lại thành công.");
        await fetchData();
      } catch (err: any) {
        setActionError(err?.message ?? "Lỗi phân công.");
      } finally {
        setSubmitting(false);
        setConfirmModal(false);
      }
    });
    setConfirmModal(true);
  };

  const openManualAssign = (maNgayLamViec: string) => {
    const shiftInfo = shiftsInfo.find((s) => s.maNgayLamViec === maNgayLamViec);
    if (shiftInfo) {
      setSelectedShiftForManual(shiftInfo);
      setManualModalOpen(true);
    } else {
      setActionError("Không thể tải danh sách ứng viên cho ca này.");
    }
  };

  const handleManualAssign = (maNguoiGiupViec: string) => {
    if (!selectedShiftForManual) return;
    const candidate = selectedShiftForManual.candidates?.find(
      (c) => c.maNguoiGiupViec === maNguoiGiupViec,
    );
    if (!candidate) return;
    setManualSelections((prev) => ({
      ...prev,
      [selectedShiftForManual.maNgayLamViec]: {
        maNguoiGiupViec: candidate.maNguoiGiupViec,
        hoTen: candidate.hoTen,
        kyNangs: candidate.chiTietKyNang.map((k) => ({
          maKyNang: k.maKyNang,
          tenKyNang: k.tenKyNang,
          kinhNghiem: k.kinhNghiem,
        })),
      },
    }));
    setManualModalOpen(false);
  };

  const handleCancelOrder = async () => {
    setActionError(null);
    setSuccessMsg(null);
    setHuyDonError("");
    if (!huyDonLyDo.trim()) {
      setHuyDonError("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    setConfirmMessage(
      "Bạn có chắc chắn muốn hủy đơn và hoàn tiền? Hành động này không thể hoàn tác.",
    );
    setConfirmAction(() => async () => {
      setSubmitting(true);
      try {
        const res = await api.post<any>("/v1/khieu-nai/huy-don-su-co", {
          maKhieuNai: id,
          noiDungPhanHoi: huyDonLyDo.trim(),
        });
        setSuccessMsg(res?.message || "Hủy đơn thành công.");
        await fetchData();
      } catch (err: any) {
        setActionError(err?.message ?? "Lỗi hủy đơn.");
      } finally {
        setSubmitting(false);
        setConfirmModal(false);
      }
    });
    setConfirmModal(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors cursor-pointer group"
      >
        <span className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center transition-all">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </span>
        Quay lại danh sách
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}
      {!loading && !error && kn && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-rose-600 font-bold shadow-inner border-2 border-white shrink-0">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Chi tiết khiếu nại
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold font-mono rounded-md">
                    {kn.maKhieuNai}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={kn.trangThai} type="khieuNai" />
            </div>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-medium flex items-center gap-2 shadow-sm">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Main Content 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Information) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Thông tin khiếu nại */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-rose-100 bg-rose-50/30 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-[14px] font-bold text-slate-800">
                    Nội dung khiếu nại
                  </h2>
                </div>
                <div className="p-5">
                  <InfoRow
                    label="Thời gian gửi"
                    value={formatDateTime(kn.thoiGian)}
                  />
                  <div className="flex flex-col py-2.5 border-b border-slate-100">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nội dung phản ánh
                    </span>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {kn.noiDung || "—"}
                    </div>
                  </div>
                  <div className="flex flex-col py-2.5">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phản hồi từ ban quản lý
                    </span>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[13.5px] text-indigo-900 leading-relaxed whitespace-pre-wrap">
                      {kn.phanHoi || "Chưa có phản hồi nào."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Khách hàng & Đơn đặt */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h2 className="text-[14px] font-bold text-slate-800">
                    Thông tin liên quan
                  </h2>
                </div>
                <div className="p-5">
                  <InfoRow
                    label="Khách hàng"
                    value={`${kn.hoTenKhachHang} - ${kn.sdtKhachHang}`}
                  />
                  {kn.thongTinDon && (
                    <>
                      <div className="flex items-center gap-3 mt-3 mb-1">
                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                          Đơn hàng
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold font-mono rounded-md">
                          {kn.maDon}
                        </span>
                      </div>
                      <InfoRow
                        label="Ngày đặt"
                        value={formatDateTime(kn.thongTinDon.ngayDat)}
                      />
                      <InfoRow
                        label="Tổng tiền"
                        value={
                          <span className="font-bold text-indigo-600">
                            {formatMoney(kn.thongTinDon.tongTien)}
                          </span>
                        }
                      />
                      <InfoRow label="Địa chỉ" value={kn.thongTinDon.diaChi} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Workspace) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    Workspace Xử lý sự cố
                  </h2>
                </div>

                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${activeTab === 1 ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                  >
                    Phân công lại
                  </button>
                  <button
                    onClick={() => setActiveTab(2)}
                    className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${activeTab === 2 ? "border-b-2 border-rose-600 text-rose-600 bg-rose-50/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                  >
                    Hủy lịch
                  </button>
                </div>

                <div className="p-6 flex-1 bg-white">
                  {actionError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] flex items-center gap-2 shadow-sm">
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {actionError}
                    </div>
                  )}

                  {kn.trangThai === "Chờ xử lý" ? (
                    // TRẠNG THÁI 1: CHƯA TIẾP NHẬN
                    <div className="h-full flex items-center justify-center p-6 text-center min-h-[300px]">
                      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 max-w-sm w-full shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-7 h-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <h3 className="text-slate-800 font-bold mb-2 text-lg">
                          Tiếp nhận khiếu nại
                        </h3>
                        <p className="text-[13.5px] text-slate-500 mb-6">
                          Bạn cần tiếp nhận để bắt đầu sử dụng các công cụ xử lý
                          sự cố. Trạng thái sẽ được cập nhật cho khách hàng.
                        </p>
                        <button
                          onClick={handleTiepNhanKhieuNai}
                          disabled={submitting}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          {submitting ? "Đang xử lý..." : "Tiếp nhận ngay"}
                        </button>
                      </div>
                    </div>
                  ) : isResolved ? (
                    <div className="h-full flex items-center justify-center p-6 text-center min-h-[300px]">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm w-full">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-slate-800 font-bold mb-1">
                          Đã xử lý xong
                        </h3>
                        <p className="text-[13px] text-slate-500">
                          Khiếu nại này đã được đánh dấu xử lý và không thể
                          chỉnh sửa thêm.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      {/* Tab 1: Phân công lại */}
                      {activeTab === 1 && (
                        <div className="space-y-6 flex-1 flex flex-col">
                          {/* Controls */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                                Số phút lùi lịch (15 - 45)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={15}
                                  max={45}
                                  step={5}
                                  value={thoiGianLuiPhut}
                                  onChange={(e) =>
                                    setThoiGianLuiPhut(Number(e.target.value))
                                  }
                                  disabled={submitting}
                                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 text-[14px] font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">
                                  phút
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={handleAutoReassign}
                              disabled={submitting || !kn?.caLamViecLoi?.length}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 whitespace-nowrap"
                            >
                              {submitting
                                ? "Đang xử lý..."
                                : "Xác nhận phân công"}
                            </button>
                          </div>

                          {/* Danh sách ca lỗi */}
                          <div className="flex-1">
                            <h3 className="text-[13px] font-bold text-slate-800 mb-3 flex items-center justify-between">
                              <span>Danh sách ca làm việc bị ảnh hưởng</span>
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[11px]">
                                {kn?.caLamViecLoi?.length || 0} ca
                              </span>
                            </h3>

                            {!kn?.caLamViecLoi ||
                            kn.caLamViecLoi.length === 0 ? (
                              <div className="text-center py-8 text-slate-500 text-[13px] bg-white border border-dashed border-slate-200 rounded-xl">
                                Không có ca làm việc nào cần xử lý.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {kn.caLamViecLoi.map((ca) => {
                                  const shiftExtraInfo = shiftsInfo.find(
                                    (s) => s.maNgayLamViec === ca.maNgayLamViec,
                                  );
                                  const hasCandidates =
                                    shiftExtraInfo &&
                                    shiftExtraInfo.candidates &&
                                    shiftExtraInfo.candidates.length > 0;

                                  return (
                                    <div
                                      key={ca.maNgayLamViec}
                                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-colors group"
                                    >
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-bold text-slate-800">
                                              {ca.tenDichVu}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-mono rounded-md">
                                              {ca.maNgayLamViec}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-4 text-[13px]">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                              <svg
                                                className="w-4 h-4 text-slate-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                              </svg>
                                              {new Date(
                                                ca.ngayLam,
                                              ).toLocaleDateString("vi-VN")}
                                            </div>
                                            <div className="flex items-center gap-2 font-mono">
                                              <span className="text-slate-500 line-through decoration-rose-400">
                                                {ca.gioBatDau}
                                              </span>
                                              <svg
                                                className="w-3.5 h-3.5 text-slate-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                />
                                              </svg>
                                              <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                {calculateNewTime(
                                                  ca.gioBatDau,
                                                  thoiGianLuiPhut,
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="text-[12.5px] text-slate-500 flex items-center gap-1.5">
                                            <svg
                                              className="w-3.5 h-3.5"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                              />
                                            </svg>
                                            NV Hiện tại:{" "}
                                            <span className="font-medium text-slate-700">
                                              {ca.tenNguoiGiupViec || "Chưa có"}
                                            </span>
                                          </div>
                                          {(() => {
                                            const manualPick =
                                              manualSelections[
                                                ca.maNgayLamViec
                                              ];
                                            const deXuat =
                                              manualPick ?? ca.nguoiDeXuat;
                                            if (!deXuat) return null;
                                            return (
                                              <div
                                                className={`mt-1 px-2 py-1.5 rounded-lg text-[12px] flex flex-col gap-0.5 border ${manualPick ? "bg-emerald-50 border-emerald-200" : "bg-indigo-50 border-indigo-100"}`}
                                              >
                                                <span
                                                  className={`font-bold ${manualPick ? "text-emerald-600" : "text-indigo-600"}`}
                                                >
                                                  {manualPick
                                                    ? "Đã chọn thủ công:"
                                                    : "Đề xuất thay thế:"}
                                                </span>
                                                <span className="text-slate-700 font-medium">
                                                  {deXuat.hoTen}
                                                </span>
                                                {deXuat.kyNangs?.[0] && (
                                                  <span className="text-slate-500">
                                                    Kỹ năng:{" "}
                                                    {
                                                      deXuat.kyNangs[0]
                                                        .tenKyNang
                                                    }
                                                    {" — "}Kinh nghiệm:{" "}
                                                    {deXuat.kyNangs[0]
                                                      .kinhNghiem || "Mới"}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                                          <button
                                            onClick={() =>
                                              openManualAssign(ca.maNgayLamViec)
                                            }
                                            disabled={
                                              loadingShifts ||
                                              submitting ||
                                              !hasCandidates
                                            }
                                            className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
                                          >
                                            Thay đổi
                                          </button>
                                          {!hasCandidates && !loadingShifts && (
                                            <span className="text-[11px] text-rose-500 text-center font-medium">
                                              Không có NV phù hợp
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Hủy lịch */}
                      {activeTab === 2 && (
                        <div className="space-y-5 flex-1 flex flex-col">
                          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex gap-3 items-start">
                            <svg
                              className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <p className="text-[13.5px] text-rose-800 leading-relaxed">
                              Hành động này sẽ{" "}
                              <strong>hủy bỏ toàn bộ đơn hàng</strong>, đồng
                              thời tất cả các ca làm việc chưa hoàn thành của
                              đơn sẽ bị chuyển sang trạng thái Hủy lịch. Vui
                              lòng kiểm tra kỹ trước khi xác nhận.
                            </p>
                          </div>

                          <ReasonTextarea
                            value={huyDonLyDo}
                            onChange={setHuyDonLyDo}
                            error={huyDonError}
                            label="Lý do hủy đơn"
                            placeholder="Nhập lý do chi tiết để báo cáo..."
                            disabled={submitting}
                          />
                          <div className="mt-auto pt-4">
                            <button
                              onClick={handleCancelOrder}
                              disabled={submitting}
                              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[14.5px] font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {submitting
                                ? "Đang xử lý..."
                                : "Xác nhận hủy đơn & Hoàn tiền"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      <ManualAssignModal
        key={selectedShiftForManual?.maNgayLamViec}
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        shift={selectedShiftForManual}
        onAssign={handleManualAssign}
      />

      <ConfirmModal
        isOpen={confirmModal}
        title="Xác nhận thao tác"
        message={confirmMessage}
        confirmText="Xác nhận"
        confirmClass={
          activeTab === 2
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }
        isLoading={submitting}
        onConfirm={confirmAction || (async () => {})}
        onCancel={() => setConfirmModal(false)}
      />
    </div>
  );
}
