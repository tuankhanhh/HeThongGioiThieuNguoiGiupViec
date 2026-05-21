"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import StatusBadge from "@/components/componentsStaff/StatusBadge";
import ReasonTextarea from "@/components/componentsStaff/ReasonTextarea";
import ConfirmModal from "@/components/componentsStaff/ConfirmModal";
import { LoadingState, ErrorState } from "@/components/componentsStaff/States";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NgayLamViec {
  maNgayLamViec: string;
  ngayLam: string;
  gioBatDau: string;
  gioKetThuc?: string;
  trangThai: string;
  maNguoiGiupViec: string | null;
  tenNguoiGiupViec: string | null;
}

interface DichVuItem {
  maDonDatDichVu: string;
  maDichVu: string;
  tenDichVu: string;
  ngayLamViecs: NgayLamViec[];
}

interface DonDetail {
  maDon: string;
  diaChi: string;
  soNgay: number;
  tongTien: number;
  ngayDat: string;
  ghiChu: string;
  trangThaiHienTai: string;
  lichSuTrangThai: { trangThai: string; thoiGianCapNhat: string }[];
  khachHang: { ma: string; hoTen: string; email: string; sdtKhach: string };
  nhanVien: { ma: string; hoTen: string } | null;
  dichVus: DichVuItem[];
  thanhToan: { maThanhToan: string; trangThaiThanhToan: string } | null;
}

interface MaidOption {
  maNguoiGiupViec: string;
  hoTen: string;
  anhChanDung: string | null;
  soDienThoai?: string;
  email?: string;
  danhSachKyNang: string[];
  chiTietKyNang?: {
    maKyNang: string;
    tenKyNang?: string;
    kinhNghiem?: string;
  }[];
  soLichDangCo?: number;
  soSaoDanhGia: number | null;
  tongSoDanhGia: number;
}

// interface GoiYDichVu {
//   maDonDatDichVu: string;
//   maKyNang: string | null;
//   candidates: MaidOption[];
// }

// interface GoiYNgayLamViec {
//   maNgayLamViec: string;
//   maDonDatDichVu: string;
//   tenDichVu: string;
//   ngayLam: string;
//   gioBatDau: string;
//   candidates: MaidOption[];
// }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider sm:w-44 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-base text-slate-800 font-medium break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function formatMoney(n: number) {
  return n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";
}

function formatDate(d: string) {
  return d ? new Date(d).toLocaleDateString("vi-VN") : "—";
}

function formatDateTime(d: string) {
  return d ? new Date(d).toLocaleString("vi-VN") : "—";
}

function MaidCandidateOption({
  m,
  name,
  checked,
  onChange,
}: {
  m: MaidOption;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={
        "relative flex flex-col rounded-2xl cursor-pointer transition-all min-w-[280px] max-w-[320px] w-full overflow-hidden shrink-0 bg-white border-2 p-4 " +
        (checked
          ? "border-indigo-600 shadow-md ring-2 ring-indigo-50 bg-indigo-50/10"
          : "border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md hover:bg-slate-50/10")
      }
    >
      <div className="absolute top-4 right-4 z-10">
        <input
          type="radio"
          name={name}
          value={m.maNguoiGiupViec}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 accent-indigo-600 cursor-pointer"
        />
      </div>

      <div className="flex gap-3">
        {/* Rounded Avatar Left */}
        <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm relative">
          {m.anhChanDung ? (
            <img
              src={m.anhChanDung}
              alt={m.hoTen}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-[14px] font-bold text-slate-800 truncate mb-1">
            {m.hoTen}
          </h3>

          <div className="flex flex-col gap-0.5 text-[12px] text-slate-500">
            {m.soDienThoai && (
              <span className="flex items-center gap-1.5 text-slate-600">
                <svg
                  className="w-3.5 h-3.5 text-slate-400 shrink-0"
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
                {m.soDienThoai}
              </span>
            )}
            {m.email && (
              <span className="flex items-center gap-1.5 text-slate-500 truncate">
                <svg
                  className="w-3.5 h-3.5 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {m.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structured skills display rendering tenKyNang and kinhNghiem */}
      {m.chiTietKyNang && m.chiTietKyNang.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-1">
            {m.chiTietKyNang.map((kn) => {
              const textKinhNghiem =
                kn.kinhNghiem && parseInt(kn.kinhNghiem) > 0
                  ? kn.kinhNghiem + " năm"
                  : "";
              return (
                <span
                  key={kn.maKyNang}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50"
                >
                  <span>{kn.tenKyNang || kn.maKyNang}</span>
                  {textKinhNghiem && (
                    <span className="text-[9.5px] opacity-75 font-semibold">
                      • {textKinhNghiem}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </label>
  );
}

function MaidCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white border border-slate-200 shadow-md text-slate-600 hover:text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        type="button"
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

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white border border-slate-200 shadow-md text-slate-600 hover:text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        type="button"
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActionMode = "idle" | "rejecting"; //|  "assigning";
// type AssignMode = "one" | "multi-service" | "multi-day";

export default function ChiTietYeuCauPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Data
  const [don, setDon] = useState<DonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Maids list (1 person)
  // const [maids, setMaids] = useState<MaidOption[]>([]);
  // const [maidsLoading, setMaidsLoading] = useState(false);
  // const [selectedMaid, setSelectedMaid] = useState("");
  // const [maidSearch, setMaidSearch] = useState("");

  // Multi-person assignment (multi-service & multi-day)
  // const [goiY2Nguoi, setGoiY2Nguoi] = useState<GoiYDichVu[]>([]);
  // const [goiYTheoNgayLamViec, setGoiYTheoNgayLamViec] = useState<
  //   GoiYNgayLamViec[]
  // >([]);
  // const [assignMode, setAssignMode] = useState<AssignMode>("one");

  // Selection states (shared structure: id -> maidId)
  // const [multiSelection, setMultiSelection] = useState<Record<string, string>>(
  //   {},
  // );
  // const [multiSearch, setMultiSearch] = useState<Record<string, string>>({});

  // Action state
  const [actionMode, setActionMode] = useState<ActionMode>("idle");
  const [lyDo, setLyDo] = useState("");
  const [lyDoError, setLyDoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // const [confirmPhanCong, setConfirmPhanCong] = useState(false);

  // States for Inline Slot Assignment
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [selectedMaidForSlot, setSelectedMaidForSlot] = useState<string>("");
  const [slotSearch, setSlotSearch] = useState<string>("");
  const [submittingSlot, setSubmittingSlot] = useState<boolean>(false);
  const [slotCandidates, setSlotCandidates] = useState<MaidOption[]>([]);
  const [slotCandidatesLoading, setSlotCandidatesLoading] = useState(false);
  const [confirmingXacNhan, setConfirmingXacNhan] = useState(false);

  const handleSaveSlotAssignment = async (slotId: string) => {
    if (!selectedMaidForSlot) {
      alert("Vui lòng chọn người giúp việc.");
      return;
    }
    setSubmittingSlot(true);
    try {
      await api.post("/v1/staff/doi-nguoi-slot", {
        MaNgayLamViec: slotId,
        MaNguoiGiupViec: selectedMaidForSlot,
      });
      setSuccessMsg("Đổi người giúp việc thành công!");
      setEditingSlotId(null);
      setSelectedMaidForSlot("");
      setSlotSearch("");
      setSlotCandidates([]);
      fetchData();
    } catch (err: any) {
      alert(err?.message ?? "Đổi người thất bại.");
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleXacNhanDon = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post("/v1/staff/xac-nhan-don", { MaDon: id });
      setSuccessMsg("Xác nhận đơn đặt thành công!");
      setConfirmingXacNhan(false);
      fetchData();
    } catch (err: any) {
      setActionError(err?.message ?? "Xác nhận thất bại.");
      setConfirmingXacNhan(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openSlotEdit = async (maNgayLamViec: string, currentMaidId: string) => {
    setEditingSlotId(maNgayLamViec);
    setSelectedMaidForSlot(currentMaidId);
    setSlotSearch("");
    setSlotCandidatesLoading(true);
    try {
      const res = await api.get<any>(
        `/v1/staff/danh-sach-nguoi-giup-viec?maDon=${id}`,
      );
      const mode3Items: any[] = res?.mode3 ?? [];
      const slotItem = mode3Items.find(
        (g: any) => g.maNgayLamViec === maNgayLamViec,
      );
      const candidates: MaidOption[] = (
        (slotItem?.candidates ?? slotItem?.replacementCandidates) ||
        []
      ).map((c: any) => ({
        maNguoiGiupViec: c.maNguoiGiupViec,
        hoTen: c.hoTen,
        anhChanDung: c.anhChanDung,
        soDienThoai: c.soDienThoai,
        email: c.email,
        danhSachKyNang: c.danhSachKyNang || [],
        chiTietKyNang: c.chiTietKyNang,
        soLichDangCo: c.soLichDangCo,
        soSaoDanhGia: c.soSaoDanhGia,
        tongSoDanhGia: c.tongSoDanhGia || 0,
      }));
      setSlotCandidates(candidates);
    } catch {
      setSlotCandidates([]);
    } finally {
      setSlotCandidatesLoading(false);
    }
  };

  // ─── Fetch detail ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/v1/staff/chi-tiet-yeu-cau/${id}`);
      setDon(res?.data ?? null);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải thông tin yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch maid list ───────────────────────────────────────────────────────
  // const fetchMaids = async () => {
  //   setMaidsLoading(true);
  //   try {
  //     const res = await api.get<any>(
  //       `/v1/staff/danh-sach-nguoi-giup-viec?maDon=${id}`,
  //     );

  //     const list: MaidOption[] = (res?.mode1?.replacementCandidates ?? []).map(
  //       (m: any) => ({
  //         maNguoiGiupViec: m.maNguoiGiupViec,
  //         hoTen: m.hoTen,
  //         anhChanDung: m.anhChanDung,
  //         soDienThoai: m.soDienThoai,
  //         email: m.email,
  //         danhSachKyNang: m.danhSachKyNang || [],
  //         chiTietKyNang: m.chiTietKyNang,
  //         soLichDangCo: m.soLichDangCo,
  //         soSaoDanhGia: m.soSaoDanhGia,
  //         tongSoDanhGia: m.tongSoDanhGia || 0,
  //       }),
  //     );
  //     setMaids(list);

  //     const goiY: GoiYDichVu[] = (res?.mode2 ?? []).map((g: any) => ({
  //       maDonDatDichVu: g.maDonDatDichVu,
  //       maKyNang: g.maKyNang ?? null,
  //       candidates: (g.replacementCandidates ?? []).map((c: any) => ({
  //         maNguoiGiupViec: c.maNguoiGiupViec,
  //         hoTen: c.hoTen,
  //         anhChanDung: c.anhChanDung,
  //         soDienThoai: c.soDienThoai,
  //         email: c.email,
  //         danhSachKyNang: c.danhSachKyNang || [],
  //         chiTietKyNang: c.chiTietKyNang,
  //         soLichDangCo: c.soLichDangCo,
  //         soSaoDanhGia: c.soSaoDanhGia,
  //         tongSoDanhGia: c.tongSoDanhGia || 0,
  //       })),
  //     }));
  //     setGoiY2Nguoi(goiY);

  //     const goiYNgay: GoiYNgayLamViec[] = (res?.mode3 ?? []).map((g: any) => ({
  //       maNgayLamViec: g.maNgayLamViec,
  //       maDonDatDichVu: g.maDonDatDichVu,
  //       tenDichVu: g.tenDichVu,
  //       ngayLam: g.ngayLam,
  //       gioBatDau: g.gioBatDau,
  //       candidates: (g.candidates ?? []).map((c: any) => ({
  //         maNguoiGiupViec: c.maNguoiGiupViec,
  //         hoTen: c.hoTen,
  //         anhChanDung: c.anhChanDung,
  //         soDienThoai: c.soDienThoai,
  //         email: c.email,
  //         danhSachKyNang: c.danhSachKyNang || [],
  //         chiTietKyNang: c.chiTietKyNang,
  //         soLichDangCo: c.soLichDangCo,
  //         soSaoDanhGia: c.soSaoDanhGia,
  //         tongSoDanhGia: c.tongSoDanhGia || 0,
  //       })),
  //     }));
  //     setGoiYTheoNgayLamViec(goiYNgay);

  //     // Auto-switch mode based on available data
  //     const soDichVu = don?.dichVus?.length ?? 0;

  //     const tongNgayLamViec =
  //       don?.dichVus?.reduce(
  //         (total, dv) => total + dv.ngayLamViecs.length,
  //         0,
  //       ) ?? 0;

  //     const laDonNhieuDichVu = soDichVu > 1;
  //     const laDonNhieuNgay = tongNgayLamViec > 1;

  //     if (list.length > 0) {
  //       setAssignMode("one");
  //     } else if (laDonNhieuDichVu && goiY.length > 0) {
  //       setAssignMode("multi-service");
  //     } else if (laDonNhieuNgay && goiYNgay.length > 0) {
  //       setAssignMode("multi-day");
  //     } else {
  //       setAssignMode("one");
  //     }
  //   } catch {
  //     setMaids([]);
  //     setGoiY2Nguoi([]);
  //     setGoiYTheoNgayLamViec([]);
  //   } finally {
  //     setMaidsLoading(false);
  //   }
  // };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ─── Open assign ───────────────────────────────────────────────────────────
  // const handleOpenAssign = () => {
  //   setActionMode("assigning");
  //   setSelectedMaid("");
  //   setMaidSearch("");
  //   setMultiSelection({});
  //   setMultiSearch({});
  //   setActionError(null);
  //   fetchMaids();
  // };

  // ─── Submit assign ─────────────────────────────────────────────────────────
  // const handleConfirmAssign = async () => {
  //   setSubmitting(true);
  //   setActionError(null);
  //   try {
  //     if (assignMode === "one") {
  //       if (!selectedMaid) {
  //         setActionError("Vui lòng chọn người giúp việc.");
  //         setSubmitting(false);
  //         return;
  //       }
  //       await api.post("/v1/staff/phan-cong-cong-viec", {
  //         MaDon: id,
  //         MaNguoiGiupViec: selectedMaid,
  //       });
  //     } else if (assignMode === "multi-service") {
  //       // Multi mode
  //       const entries = Object.entries(multiSelection);
  //       if (entries.length === 0 || entries.some(([, v]) => !v)) {
  //         setActionError("Vui lòng chọn người giúp việc cho tất cả dịch vụ.");
  //         setSubmitting(false);
  //         return;
  //       }
  //       await api.post("/v1/staff/phan-cong-cong-viec", {
  //         MaDon: id,
  //         PhanCongTheoDichVu: entries.map(
  //           ([maDonDatDichVu, maNguoiGiupViec]) => ({
  //             MaDonDatDichVu: maDonDatDichVu,
  //             MaNguoiGiupViec: maNguoiGiupViec,
  //           }),
  //         ),
  //       });
  //     } else if (assignMode === "multi-day") {
  //       // Multi-day mode
  //       const entries = Object.entries(multiSelection);
  //       if (entries.length === 0 || entries.some(([, v]) => !v)) {
  //         setActionError(
  //           "Vui lòng chọn người giúp việc cho tất cả ngày làm việc.",
  //         );
  //         setSubmitting(false);
  //         return;
  //       }
  //       await api.post("/v1/staff/phan-cong-cong-viec", {
  //         MaDon: id,
  //         PhanCongTheoNgayLamViec: entries.map(
  //           ([maNgayLamViec, maNguoiGiupViec]) => ({
  //             MaNgayLamViec: maNgayLamViec,
  //             MaNguoiGiupViec: maNguoiGiupViec,
  //           }),
  //         ),
  //       });
  //     }
  //     setSuccessMsg("Phân công công việc thành công!");
  //     setActionMode("idle");
  //     setConfirmPhanCong(false);
  //     fetchData();
  //   } catch (err: any) {
  //     setActionError(err?.message ?? "Phân công thất bại.");
  //     setConfirmPhanCong(false);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // ─── Reject ────────────────────────────────────────────────────────────────
  const handleTuChoi = async () => {
    if (!lyDo.trim()) {
      setLyDoError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setLyDoError("");
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post("/v1/staff/tu-choi-yeu-cau", {
        MaDon: id,
        LyDoTuChoi: lyDo.trim(),
      });
      setSuccessMsg("Đã từ chối yêu cầu dịch vụ.");
      setActionMode("idle");
      setLyDo("");
      fetchData();
    } catch (err: any) {
      setActionError(err?.message ?? "Từ chối thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const canAct = don?.trangThaiHienTai === "Chờ xác nhận";

  // const filteredMaids =
  //   maidSearch.trim() === ""
  //     ? maids
  //     : maids.filter((m) =>
  //         m.hoTen.toLowerCase().includes(maidSearch.toLowerCase()),
  //       );

  // Validation for multi mode
  // const isMultiValid =
  //   assignMode === "multi-service"
  //     ? (don?.dichVus?.every((dv) => !!multiSelection[dv.maDonDatDichVu]) ??
  //       false)
  //     : (don?.dichVus?.every((dv) =>
  //         dv.ngayLamViecs.every((nlv) => !!multiSelection[nlv.maNgayLamViec]),
  //       ) ?? false);

  // Get confirm message
  // const getConfirmMessage = () => {
  //   if (assignMode === "one") {
  //     const name =
  //       maids.find((m) => m.maNguoiGiupViec === selectedMaid)?.hoTen ??
  //       selectedMaid;
  //     return `Phân công đơn ${don?.maDon ?? ""} cho "${name}"?`;
  //   } else if (assignMode === "multi-service") {
  //     const parts =
  //       don?.dichVus?.map((dv) => {
  //         const maidId = multiSelection[dv.maDonDatDichVu];
  //         const allCandidates =
  //           goiY2Nguoi.find((g) => g.maDonDatDichVu === dv.maDonDatDichVu)
  //             ?.candidates ?? [];
  //         const name =
  //           allCandidates.find((c) => c.maNguoiGiupViec === maidId)?.hoTen ??
  //           maidId;
  //         return `${dv.tenDichVu} → ${name}`;
  //       }) ?? [];
  //     return `Phân công đơn ${don?.maDon ?? ""}:\n${parts.join("\n")}`;
  //   } else {
  //     const parts: string[] = [];
  //     don?.dichVus?.forEach((dv) => {
  //       dv.ngayLamViecs.forEach((nlv) => {
  //         const maidId = multiSelection[nlv.maNgayLamViec];
  //         const allCandidates =
  //           goiYTheoNgayLamViec.find(
  //             (g) => g.maNgayLamViec === nlv.maNgayLamViec,
  //           )?.candidates ?? [];
  //         const name =
  //           allCandidates.find((c) => c.maNguoiGiupViec === maidId)?.hoTen ??
  //           maidId;
  //         parts.push(`${dv.tenDichVu} (${formatDate(nlv.ngayLam)}) → ${name}`);
  //       });
  //     });
  //     return `Phân công đơn ${don?.maDon ?? ""}:\n${parts.join("\n")}`;
  //   }
  // };

  const soDichVu = don?.dichVus?.length ?? 0;

  const tongNgayLamViec =
    don?.dichVus?.reduce((total, dv) => total + dv.ngayLamViecs.length, 0) ?? 0;

  // Đơn nhiều dịch vụ
  const laDonNhieuDichVu = soDichVu > 1;

  // Đơn nhiều ngày
  const laDonNhieuNgay = tongNgayLamViec > 1;

  // Hiển thị tab "Theo dịch vụ"
  // const hienThiTheoDichVu = laDonNhieuDichVu && goiY2Nguoi.length > 0;

  // Hiển thị tab "Theo từng ngày"
  // const hienThiTheoNgay = laDonNhieuNgay && goiYTheoNgayLamViec.length > 0;
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer group"
      >
        <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </span>
        Quay lại danh sách
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && don && (
        <>
          {/* Title */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Chi tiết yêu cầu
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                Mã đơn: {don.maDon}
              </p>
            </div>
            <StatusBadge status={don.trangThaiHienTai} type="don" />
          </div>

          {/* Success toast */}
          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13.5px] font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
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

          {/* Khách hàng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-blue-50/40">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h2 className="text-base font-bold text-slate-800">
                Thông tin khách hàng
              </h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Họ tên" value={don.khachHang.hoTen} />
              <InfoRow label="Email" value={don.khachHang.email} />
              <InfoRow label="Số điện thoại" value={don.khachHang.sdtKhach} />
            </div>
          </div>

          {/* Đơn đặt */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-amber-50/40">
              <div className="w-1.5 h-5 rounded-full bg-amber-500" />
              <h2 className="text-base font-bold text-slate-800">
                Thông tin đơn đặt
              </h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow label="Địa chỉ" value={don.diaChi} />
              <InfoRow label="Ngày đặt" value={formatDate(don.ngayDat)} />
              <InfoRow label="Số ngày" value={`${don.soNgay} ngày`} />
              <InfoRow label="Ghi chú" value={don.ghiChu} />
              <InfoRow
                label="Tổng tiền"
                value={
                  <span className="font-bold text-indigo-600 text-[15px]">
                    {formatMoney(don.tongTien)}
                  </span>
                }
              />
              <InfoRow
                label="Thanh toán"
                value={
                  don.thanhToan ? (
                    don.thanhToan.trangThaiThanhToan === "Đã thanh toán" ? (
                      <span className="text-emerald-600 font-bold">
                        Đã thanh toán ({formatMoney(don.tongTien)})
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold">
                        {don.thanhToan.trangThaiThanhToan} (0 ₫)
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      Chưa thanh toán (0 ₫)
                    </span>
                  )
                }
              />
              {don.nhanVien && (
                <InfoRow
                  label="Nhân viên phụ trách"
                  value={don.nhanVien.hoTen}
                />
              )}
            </div>
          </div>

          {/* Dịch vụ đặt - grouped */}
          {/* {don.dichVus.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/40">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-slate-800">
                  Dịch vụ đặt
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {don.dichVus.map((dv) => (
                  <div key={dv.maDonDatDichVu} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-bold">
                        {dv.tenDichVu}
                      </span>
                    </div>
                    {dv.ngayLamViecs.length > 0 && (
                      <div className="space-y-4 pl-2 border-l-2 border-indigo-100">
                        {dv.ngayLamViecs.map((nlv) => {
                          // const nlvInfo = goiYTheoNgayLamViec.find(
                          //   (g) => g.maNgayLamViec === nlv.maNgayLamViec,
                          // );
                          const isEditing = editingSlotId === nlv.maNgayLamViec;
                          return (
                            <div
                              key={nlv.maNgayLamViec}
                              className="py-2 first:pt-0 last:pb-0"
                            >
                              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                  <span className="font-bold text-slate-700">
                                    {formatDate(nlv.ngayLam)}
                                  </span>
                                  <span className="text-slate-500 font-medium">
                                    {nlv.gioBatDau}
                                  </span>
                                </div>

                                {nlv.tenNguoiGiupViec && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    {nlv.tenNguoiGiupViec}
                                  </span>
                                )}

                                <span
                                  className={
                                    "text-xs font-bold px-2.5 py-1 rounded-full " +
                                    (nlv.trangThai === "Đã phân công"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-600")
                                  }
                                >
                                  {nlv.trangThai ?? "Chờ phân công"}
                                </span>

                                {canAct && (
                                  <button
                                    onClick={() => {
                                      if (isEditing) {
                                        setEditingSlotId(null);
                                        setSelectedMaidForSlot("");
                                        setSlotCandidates([]);
                                      } else {
                                        openSlotEdit(
                                          nlv.maNgayLamViec,
                                          nlv.maNguoiGiupViec || "",
                                        );
                                      }
                                    }}
                                    className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-all cursor-pointer"
                                  >
                                    {isEditing
                                      ? "Hủy"
                                      : nlv.tenNguoiGiupViec
                                        ? "Thay đổi"
                                        : "Phân công"}
                                  </button>
                                )}
                              </div> */}

          {/* Inline Edit Panel */}
          {/* {isEditing && (
                                <div className="mt-3 bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-[13px] font-bold text-slate-700">
                                      Đổi người giúp việc —{" "}
                                      {formatDate(nlv.ngayLam)}
                                    </h4>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Tìm ứng viên theo tên..."
                                    value={slotSearch}
                                    onChange={(e) =>
                                      setSlotSearch(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.preventDefault();
                                    }}
                                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
                                  />

                                  {slotCandidatesLoading ? (
                                    <p className="text-[12px] text-slate-400 text-center py-4 bg-white rounded-lg border">
                                      Đang tải ứng viên...
                                    </p>
                                  ) : (
                                    (() => {
                                      const filtered =
                                        slotSearch.trim() === ""
                                          ? slotCandidates
                                          : slotCandidates.filter((c) =>
                                              c.hoTen
                                                .toLowerCase()
                                                .includes(
                                                  slotSearch.toLowerCase(),
                                                ),
                                            );

                                      if (filtered.length === 0) {
                                        return (
                                          <p className="text-[12px] text-slate-400 text-center py-4 bg-white rounded-lg border">
                                            Không có ứng viên phù hợp.
                                          </p>
                                        );
                                      }

                                      return (
                                        <MaidCarousel>
                                          {filtered.map((c) => (
                                            <MaidCandidateOption
                                              key={c.maNguoiGiupViec}
                                              m={c}
                                              name={
                                                "inline-maid-" +
                                                nlv.maNgayLamViec
                                              }
                                              checked={
                                                selectedMaidForSlot ===
                                                c.maNguoiGiupViec
                                              }
                                              onChange={() =>
                                                setSelectedMaidForSlot(
                                                  c.maNguoiGiupViec,
                                                )
                                              }
                                            />
                                          ))}
                                        </MaidCarousel>
                                      );
                                    })()
                                  )}

                                  <div className="flex gap-2 justify-end pt-1">
                                    <button
                                      onClick={() => {
                                        setEditingSlotId(null);
                                        setSelectedMaidForSlot("");
                                        setSlotSearch("");
                                        setSlotCandidates([]);
                                      }}
                                      disabled={submittingSlot}
                                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSaveSlotAssignment(
                                          nlv.maNgayLamViec,
                                        )
                                      }
                                      disabled={
                                        submittingSlot || !selectedMaidForSlot
                                      }
                                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                    >
                                      {submittingSlot && (
                                        <svg
                                          className="animate-spin w-3.5 h-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                          />
                                        </svg>
                                      )}
                                      Lưu thay đổi
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div> */}
          {/* )} */}
          {/* Dịch vụ đặt - Group theo ngày */}
          {don.dichVus.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/40">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-slate-800">
                  Lịch trình thực hiện
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {(() => {
                  // Gom nhóm các ca làm việc theo ngày
                  const groupedByDate = don.dichVus.reduce(
                    (acc, dv) => {
                      dv.ngayLamViecs.forEach((nlv) => {
                        if (!acc[nlv.ngayLam]) acc[nlv.ngayLam] = [];
                        acc[nlv.ngayLam].push({
                          ...nlv,
                          tenDichVu: dv.tenDichVu,
                        });
                      });
                      return acc;
                    },
                    {} as Record<
                      string,
                      (NgayLamViec & { tenDichVu: string })[]
                    >,
                  );

                  const sortedDates = Object.keys(groupedByDate).sort(
                    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                  );

                  return sortedDates.map((dateStr) => (
                    <div key={dateStr} className="p-6 bg-slate-50/30">
                      {/* Tiêu đề ngày */}
                      <div className="flex items-center gap-3 mb-4">
                        <svg
                          className="w-6 h-6 text-indigo-600"
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
                        <h3 className="text-lg font-bold text-slate-900">
                          Ngày thực hiện: {formatDate(dateStr)}
                        </h3>
                      </div>

                      {/* Các ca làm việc trong ngày */}
                      <div className="space-y-4">
                        {groupedByDate[dateStr].map((ca) => {
                          const isEditing = editingSlotId === ca.maNgayLamViec;
                          return (
                            <div
                              key={ca.maNgayLamViec}
                              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden"
                            >
                              <div
                                className={`absolute top-0 left-0 w-1.5 h-full ${ca.trangThai === "Đã phân công" ? "bg-emerald-500" : "bg-amber-500"}`}
                              ></div>

                              <div className="pl-3">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md text-[13.5px] border border-indigo-100">
                                    {ca.tenDichVu}
                                  </span>
                                  <span
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${ca.trangThai === "Đã phân công" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                                  >
                                    {ca.trangThai ?? "Chờ phân công"}
                                  </span>
                                </div>

                                <div className="text-[14px] text-slate-600 mb-3">
                                  <span className="font-semibold text-slate-800">
                                    Thời gian:{" "}
                                  </span>
                                  {ca.gioBatDau} -{" "}
                                  {ca.gioKetThuc || "Chưa xác định"}
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                      </svg>
                                    </div>
                                    <span
                                      className={`text-[14px] ${ca.tenNguoiGiupViec ? "font-bold text-slate-700" : "font-medium text-slate-500 italic"}`}
                                    >
                                      {ca.tenNguoiGiupViec ||
                                        "Hệ thống đang điều phối nhân viên..."}
                                    </span>
                                  </div>

                                  {canAct && (
                                    <button
                                      onClick={() => {
                                        if (isEditing) {
                                          setEditingSlotId(null);
                                          setSelectedMaidForSlot("");
                                          setSlotCandidates([]);
                                        } else {
                                          openSlotEdit(
                                            ca.maNgayLamViec,
                                            ca.maNguoiGiupViec || "",
                                          );
                                        }
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-[13px] font-bold transition-all cursor-pointer"
                                    >
                                      {isEditing
                                        ? "Hủy"
                                        : ca.tenNguoiGiupViec
                                          ? "Thay đổi"
                                          : "Phân công"}
                                    </button>
                                  )}
                                </div>

                                {/* KHUNG CHỌN NHÂN VIÊN (Giữ nguyên logic cũ của bạn) */}
                                {isEditing && (
                                  <div className="mt-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                                    {/* Dán nguyên khối <input> và <MaidCarousel> của bạn ở đây để không làm mất logic */}
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-[13px] font-bold text-slate-700">
                                        Đổi người giúp việc —{" "}
                                        {formatDate(ca.ngayLam)}
                                      </h4>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Tìm ứng viên..."
                                      value={slotSearch}
                                      onChange={(e) =>
                                        setSlotSearch(e.target.value)
                                      }
                                      className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />

                                    {slotCandidatesLoading ? (
                                      <p className="text-[12px] text-slate-400 text-center py-4">
                                        Đang tải...
                                      </p>
                                    ) : (
                                      <MaidCarousel>
                                        {slotCandidates
                                          .filter(
                                            (c) =>
                                              slotSearch.trim() === "" ||
                                              c.hoTen
                                                .toLowerCase()
                                                .includes(
                                                  slotSearch.toLowerCase(),
                                                ),
                                          )
                                          .map((c) => (
                                            <MaidCandidateOption
                                              key={c.maNguoiGiupViec}
                                              m={c}
                                              name={
                                                "inline-maid-" +
                                                ca.maNgayLamViec
                                              }
                                              checked={
                                                selectedMaidForSlot ===
                                                c.maNguoiGiupViec
                                              }
                                              onChange={() =>
                                                setSelectedMaidForSlot(
                                                  c.maNguoiGiupViec,
                                                )
                                              }
                                            />
                                          ))}
                                      </MaidCarousel>
                                    )}
                                    <div className="flex gap-2 justify-end pt-1">
                                      <button
                                        onClick={() => setEditingSlotId(null)}
                                        className="px-3 py-1.5 rounded-lg border text-slate-600 text-xs font-semibold hover:bg-white cursor-pointer"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSaveSlotAssignment(
                                            ca.maNgayLamViec,
                                          )
                                        }
                                        disabled={
                                          submittingSlot || !selectedMaidForSlot
                                        }
                                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                                      >
                                        Lưu thay đổi
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
          {/* Lịch sử trạng thái */}
          {don.lichSuTrangThai.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                <div className="w-1.5 h-5 rounded-full bg-slate-500" />
                <h2 className="text-base font-bold text-slate-800">
                  Lịch sử trạng thái
                </h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                {don.lichSuTrangThai.map((ls, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 pl-2 border-l-2 border-slate-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 -ml-[5px]" />
                    <span className="text-[13.5px] font-semibold text-slate-700">
                      {ls.trangThai}
                    </span>
                    <span className="ml-auto text-[12px] text-slate-400">
                      {formatDateTime(ls.thoiGianCapNhat)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action area */}
          {canAct && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                <h2 className="text-base font-bold text-slate-800">
                  Xử lý yêu cầu
                </h2>
              </div>

              {actionError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
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

              {actionMode === "idle" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingXacNhan(true)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-[14px] font-bold transition-all duration-150 cursor-pointer text-center border border-emerald-200 disabled:opacity-50"
                  >
                    ✓ Xác nhận đặt lịch
                  </button>
                  <button
                    onClick={() => setActionMode("rejecting")}
                    className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-[14px] font-bold transition-all duration-150 cursor-pointer text-center border border-red-200"
                  >
                    ✗ Từ chối yêu cầu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ReasonTextarea
                    value={lyDo}
                    onChange={setLyDo}
                    error={lyDoError}
                    label="Lý do từ chối yêu cầu"
                    placeholder="Nhập lý do từ chối yêu cầu dịch vụ..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionMode("idle");
                        setLyDo("");
                        setLyDoError("");
                        setActionError(null);
                      }}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleTuChoi}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-all duration-150 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                      )}
                      {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already handled */}
          {!canAct && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-[13.5px] text-slate-500 text-center">
              Đơn này đang ở trạng thái{" "}
              <strong className="text-slate-700">{don.trangThaiHienTai}</strong>{" "}
              — không thể thực hiện thêm thao tác.
            </div>
          )}
        </>
      )}
      {/* <ConfirmModal
        isOpen={confirmPhanCong}
        title="Xác nhận phân công"
        message={getConfirmMessage()}
        confirmText="Phân công"
        confirmClass="bg-indigo-600 hover:bg-indigo-700 text-white"
        isLoading={submitting}
        onConfirm={handleConfirmAssign}
        onCancel={() => setConfirmPhanCong(false)}
      /> */}
      <ConfirmModal
        isOpen={confirmingXacNhan}
        title="Xác nhận đặt lịch"
        message={`Bạn có chắc chắn muốn xác nhận đơn ${don?.maDon ?? ""}? Trạng thái sẽ chuyển sang "Đã xác nhận".`}
        confirmText="Xác nhận"
        confirmClass="bg-emerald-600 hover:bg-emerald-700 text-white"
        isLoading={submitting}
        onConfirm={handleXacNhanDon}
        onCancel={() => setConfirmingXacNhan(false)}
      />
    </div>
  );
}
