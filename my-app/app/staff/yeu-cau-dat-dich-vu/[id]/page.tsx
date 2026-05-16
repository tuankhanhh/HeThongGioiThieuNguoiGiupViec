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
  thanhToan: { MaThanhToan: string; TrangThaiThanhToan: string } | null;
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

interface GoiYDichVu {
  maDonDatDichVu: string;
  maKyNang: string | null;
  candidates: MaidOption[];
}

interface GoiYNgayLamViec {
  maNgayLamViec: string;
  maDonDatDichVu: string;
  tenDichVu: string;
  ngayLam: string;
  gioBatDau: string;
  candidates: MaidOption[];
}

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
      className={`relative flex flex-col rounded-3xl cursor-pointer transition-all min-w-[340px] w-[380px] overflow-hidden snap-center shrink-0 bg-white ${
        checked
          ? "border-2 border-indigo-500 shadow-xl scale-[1.02] ring-4 ring-indigo-50"
          : "border-2 border-slate-100 shadow-md hover:border-indigo-300 hover:shadow-lg"
      }`}
    >
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
        <input
          type="radio"
          name={name}
          value={m.maNguoiGiupViec}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* Large Image Top */}
      <div className="w-full h-[280px] bg-slate-100 relative">
        {m.anhChanDung ? (
          <img
            src={m.anhChanDung}
            alt={m.hoTen}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
            <svg
              className="w-20 h-20 opacity-50"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        {/* Basic Info Box */}
        <div className="p-5 bg-white">
          <h3 className="text-xl font-bold text-slate-800 truncate mb-2">
            {m.hoTen}
          </h3>
          <div className="flex flex-col gap-1.5 text-[14.5px] text-slate-500">
            {m.soDienThoai && (
              <span className="font-medium text-slate-600 flex items-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {m.soDienThoai}
              </span>
            )}
            {m.email && (
              <span className="font-medium text-slate-600 flex items-center gap-2">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {m.email}
              </span>
            )}
          </div>
        </div>

        {/* Rating & Status Box */}
        <div className="px-5 py-3.5 bg-slate-50 border-y border-slate-100 flex items-center justify-between">
          {m.soSaoDanhGia != null ? (
            <span className="flex items-center gap-1.5 text-[14.5px] font-bold text-amber-500">
              ⭐ {m.soSaoDanhGia}{" "}
              <span className="font-medium text-amber-600/70 text-[13px]">
                ({m.tongSoDanhGia} đánh giá)
              </span>
            </span>
          ) : (
            <span className="text-sm text-slate-400 italic">
              Chưa có đánh giá
            </span>
          )}

          {m.soLichDangCo != null && (
            <span
              className={`px-2.5 py-1 rounded-md text-[13px] font-bold border ${
                m.soLichDangCo > 0
                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
              }`}
            >
              {m.soLichDangCo > 0
                ? `${m.soLichDangCo} lịch bận`
                : "Rảnh toàn thời gian"}
            </span>
          )}
        </div>

        {/* Skills Box */}
        <div className="p-5 bg-indigo-50/40 flex-1">
          <p className="text-[12px] font-bold text-indigo-400 mb-3 uppercase tracking-widest">
            Kỹ năng chuyên môn
          </p>
          {m.chiTietKyNang && m.chiTietKyNang.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {m.chiTietKyNang.map((k) => (
                <div
                  key={k.maKyNang}
                  className="flex flex-col bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm transition-colors hover:border-indigo-300"
                >
                  <span className="text-[13.5px] font-bold text-indigo-700">
                    {k.tenKyNang || k.maKyNang}
                  </span>
                  {k.kinhNghiem && (
                    <span className="text-[12.5px] text-slate-500 mt-0.5">
                      {k.kinhNghiem}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : m.danhSachKyNang && m.danhSachKyNang.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {m.danhSachKyNang.map((k) => (
                <span
                  key={k}
                  className="text-[13px] font-medium text-indigo-700 bg-white border border-indigo-100 shadow-sm px-2.5 py-1.5 rounded-lg"
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-slate-400 italic">
              Chưa cập nhật kỹ năng
            </p>
          )}
        </div>
      </div>
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

type ActionMode = "idle" | "rejecting" | "assigning";
type AssignMode = "one" | "multi-service" | "multi-day";

export default function ChiTietYeuCauPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Data
  const [don, setDon] = useState<DonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Maids list (1 person)
  const [maids, setMaids] = useState<MaidOption[]>([]);
  const [maidsLoading, setMaidsLoading] = useState(false);
  const [selectedMaid, setSelectedMaid] = useState("");
  const [maidSearch, setMaidSearch] = useState("");

  // Multi-person assignment (multi-service & multi-day)
  const [goiY2Nguoi, setGoiY2Nguoi] = useState<GoiYDichVu[]>([]);
  const [goiYTheoNgayLamViec, setGoiYTheoNgayLamViec] = useState<
    GoiYNgayLamViec[]
  >([]);
  const [assignMode, setAssignMode] = useState<AssignMode>("one");

  // Selection states (shared structure: id -> maidId)
  const [multiSelection, setMultiSelection] = useState<Record<string, string>>(
    {},
  );
  const [multiSearch, setMultiSearch] = useState<Record<string, string>>({});

  // Action state
  const [actionMode, setActionMode] = useState<ActionMode>("idle");
  const [lyDo, setLyDo] = useState("");
  const [lyDoError, setLyDoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmPhanCong, setConfirmPhanCong] = useState(false);

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
  const fetchMaids = async () => {
    setMaidsLoading(true);
    try {
      const res = await api.get<any>(
        `/v1/staff/danh-sach-nguoi-giup-viec?maDon=${id}`,
      );
      const list: MaidOption[] = (res?.data ?? []).map((m: any) => ({
        maNguoiGiupViec: m.maNguoiGiupViec,
        hoTen: m.hoTen,
        anhChanDung: m.anhChanDung,
        soDienThoai: m.soDienThoai,
        email: m.email,
        danhSachKyNang: m.danhSachKyNang || [],
        chiTietKyNang: m.chiTietKyNang,
        soLichDangCo: m.soLichDangCo,
        soSaoDanhGia: m.soSaoDanhGia,
        tongSoDanhGia: m.tongSoDanhGia || 0,
      }));
      setMaids(list);

      const goiY: GoiYDichVu[] = (res?.goiY2Nguoi ?? []).map((g: any) => ({
        maDonDatDichVu: g.maDonDatDichVu,
        maKyNang: g.maKyNang,
        candidates: (g.candidates ?? []).map((c: any) => ({
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
        })),
      }));
      setGoiY2Nguoi(goiY);

      const goiYNgay: GoiYNgayLamViec[] = (res?.goiYTheoNgayLamViec ?? []).map(
        (g: any) => ({
          maNgayLamViec: g.maNgayLamViec,
          maDonDatDichVu: g.maDonDatDichVu,
          tenDichVu: g.tenDichVu,
          ngayLam: g.ngayLam,
          gioBatDau: g.gioBatDau,
          candidates: (g.candidates ?? []).map((c: any) => ({
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
          })),
        }),
      );
      setGoiYTheoNgayLamViec(goiYNgay);

      // Auto-switch mode based on available data
      const soDichVu = don?.dichVus?.length ?? 0;

      const tongNgayLamViec =
        don?.dichVus?.reduce(
          (total, dv) => total + dv.ngayLamViecs.length,
          0,
        ) ?? 0;

      const laDonNhieuDichVu = soDichVu > 1;
      const laDonNhieuNgay = tongNgayLamViec > 1;

      if (list.length > 0) {
        setAssignMode("one");
      } else if (laDonNhieuDichVu && goiY.length > 0) {
        setAssignMode("multi-service");
      } else if (laDonNhieuNgay && goiYNgay.length > 0) {
        setAssignMode("multi-day");
      } else {
        setAssignMode("one");
      }
    } catch {
      setMaids([]);
      setGoiY2Nguoi([]);
      setGoiYTheoNgayLamViec([]);
    } finally {
      setMaidsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ─── Open assign ───────────────────────────────────────────────────────────
  const handleOpenAssign = () => {
    setActionMode("assigning");
    setSelectedMaid("");
    setMaidSearch("");
    setMultiSelection({});
    setMultiSearch({});
    setActionError(null);
    fetchMaids();
  };

  // ─── Submit assign ─────────────────────────────────────────────────────────
  const handleConfirmAssign = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (assignMode === "one") {
        if (!selectedMaid) {
          setActionError("Vui lòng chọn người giúp việc.");
          setSubmitting(false);
          return;
        }
        await api.post("/v1/staff/phan-cong-cong-viec", {
          MaDon: id,
          MaNguoiGiupViec: selectedMaid,
        });
      } else if (assignMode === "multi-service") {
        // Multi mode
        const entries = Object.entries(multiSelection);
        if (entries.length === 0 || entries.some(([, v]) => !v)) {
          setActionError("Vui lòng chọn người giúp việc cho tất cả dịch vụ.");
          setSubmitting(false);
          return;
        }
        await api.post("/v1/staff/phan-cong-cong-viec", {
          MaDon: id,
          PhanCongTheoDichVu: entries.map(
            ([maDonDatDichVu, maNguoiGiupViec]) => ({
              MaDonDatDichVu: maDonDatDichVu,
              MaNguoiGiupViec: maNguoiGiupViec,
            }),
          ),
        });
      } else if (assignMode === "multi-day") {
        // Multi-day mode
        const entries = Object.entries(multiSelection);
        if (entries.length === 0 || entries.some(([, v]) => !v)) {
          setActionError(
            "Vui lòng chọn người giúp việc cho tất cả ngày làm việc.",
          );
          setSubmitting(false);
          return;
        }
        await api.post("/v1/staff/phan-cong-cong-viec", {
          MaDon: id,
          PhanCongTheoNgayLamViec: entries.map(
            ([maNgayLamViec, maNguoiGiupViec]) => ({
              MaNgayLamViec: maNgayLamViec,
              MaNguoiGiupViec: maNguoiGiupViec,
            }),
          ),
        });
      }
      setSuccessMsg("Phân công công việc thành công!");
      setActionMode("idle");
      setConfirmPhanCong(false);
      fetchData();
    } catch (err: any) {
      setActionError(err?.message ?? "Phân công thất bại.");
      setConfirmPhanCong(false);
    } finally {
      setSubmitting(false);
    }
  };

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

  const filteredMaids =
    maidSearch.trim() === ""
      ? maids
      : maids.filter((m) =>
          m.hoTen.toLowerCase().includes(maidSearch.toLowerCase()),
        );

  // Validation for multi mode
  const isMultiValid =
    assignMode === "multi-service"
      ? (don?.dichVus?.every((dv) => !!multiSelection[dv.maDonDatDichVu]) ??
        false)
      : (don?.dichVus?.every((dv) =>
          dv.ngayLamViecs.every((nlv) => !!multiSelection[nlv.maNgayLamViec]),
        ) ?? false);

  // Get confirm message
  const getConfirmMessage = () => {
    if (assignMode === "one") {
      const name =
        maids.find((m) => m.maNguoiGiupViec === selectedMaid)?.hoTen ??
        selectedMaid;
      return `Phân công đơn ${don?.maDon ?? ""} cho "${name}"?`;
    } else if (assignMode === "multi-service") {
      const parts =
        don?.dichVus?.map((dv) => {
          const maidId = multiSelection[dv.maDonDatDichVu];
          const allCandidates =
            goiY2Nguoi.find((g) => g.maDonDatDichVu === dv.maDonDatDichVu)
              ?.candidates ?? [];
          const name =
            allCandidates.find((c) => c.maNguoiGiupViec === maidId)?.hoTen ??
            maidId;
          return `${dv.tenDichVu} → ${name}`;
        }) ?? [];
      return `Phân công đơn ${don?.maDon ?? ""}:\n${parts.join("\n")}`;
    } else {
      const parts: string[] = [];
      don?.dichVus?.forEach((dv) => {
        dv.ngayLamViecs.forEach((nlv) => {
          const maidId = multiSelection[nlv.maNgayLamViec];
          const allCandidates =
            goiYTheoNgayLamViec.find(
              (g) => g.maNgayLamViec === nlv.maNgayLamViec,
            )?.candidates ?? [];
          const name =
            allCandidates.find((c) => c.maNguoiGiupViec === maidId)?.hoTen ??
            maidId;
          parts.push(`${dv.tenDichVu} (${formatDate(nlv.ngayLam)}) → ${name}`);
        });
      });
      return `Phân công đơn ${don?.maDon ?? ""}:\n${parts.join("\n")}`;
    }
  };

  const soDichVu = don?.dichVus?.length ?? 0;

  const tongNgayLamViec =
    don?.dichVus?.reduce((total, dv) => total + dv.ngayLamViecs.length, 0) ?? 0;

  // Đơn nhiều dịch vụ
  const laDonNhieuDichVu = soDichVu > 1;

  // Đơn nhiều ngày
  const laDonNhieuNgay = tongNgayLamViec > 1;

  // Hiển thị tab "Theo dịch vụ"
  const hienThiTheoDichVu = laDonNhieuDichVu && goiY2Nguoi.length > 0;

  // Hiển thị tab "Theo từng ngày"
  const hienThiTheoNgay = laDonNhieuNgay && goiYTheoNgayLamViec.length > 0;
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
              <InfoRow
                label="Tổng tiền"
                value={
                  <span className="font-bold text-indigo-600 text-[15px]">
                    {formatMoney(don.tongTien)}
                  </span>
                }
              />
              <InfoRow label="Ghi chú" value={don.ghiChu} />
              {don.thanhToan && (
                <InfoRow
                  label="Thanh toán"
                  value={don.thanhToan.TrangThaiThanhToan}
                />
              )}
              {don.nhanVien && (
                <InfoRow
                  label="Nhân viên phụ trách"
                  value={don.nhanVien.hoTen}
                />
              )}
            </div>
          </div>

          {/* Dịch vụ đặt - grouped */}
          {don.dichVus.length > 0 && (
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
                      <span className="text-xs text-slate-400 font-mono">
                        {dv.maDonDatDichVu}
                      </span>
                    </div>
                    {dv.ngayLamViecs.length > 0 && (
                      <div className="space-y-3 pl-2 border-l-2 border-indigo-100">
                        {dv.ngayLamViecs.map((nlv) => (
                          <div
                            key={nlv.maNgayLamViec}
                            className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm text-slate-600"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 -ml-[5px]" />
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
                              className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                                nlv.trangThai === "Đã phân công"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {nlv.trangThai ?? "Chờ phân công"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Xử lý yêu cầu / Phân công
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

              {/* Idle: 2 buttons */}
              {actionMode === "idle" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenAssign}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    📋 Phân công công việc
                  </button>
                  <button
                    onClick={() => setActionMode("rejecting")}
                    className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[14px] font-bold transition-all duration-150 cursor-pointer"
                  >
                    ✗ Từ chối yêu cầu
                  </button>
                </div>
              )}

              {/* Assigning mode */}
              {actionMode === "assigning" && (
                <div className="space-y-4">
                  {/* Toggle: 1 person / multi */}
                  {(hienThiTheoDichVu || hienThiTheoNgay) && (
                    <div>
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-2">
                        <button
                          onClick={() => setAssignMode("one")}
                          className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                            assignMode === "one"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          👤 1 người/Toàn bộ
                        </button>
                        {hienThiTheoDichVu && (
                          <button
                            onClick={() => setAssignMode("multi-service")}
                            className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer border-l border-slate-200 ${
                              assignMode === "multi-service"
                                ? "bg-indigo-600 text-white border-l-transparent"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            👥 Theo dịch vụ
                          </button>
                        )}
                        {hienThiTheoNgay && (
                          <button
                            onClick={() => setAssignMode("multi-day")}
                            className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer border-l border-slate-200 ${
                              assignMode === "multi-day"
                                ? "bg-indigo-600 text-white border-l-transparent"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            📅 Theo từng ngày
                          </button>
                        )}
                      </div>
                      {maids.length === 0 &&
                        goiY2Nguoi.length > 0 &&
                        assignMode === "one" && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[12.5px] flex items-center gap-2">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            Không có người đủ tất cả kỹ năng. Hãy chuyển sang
                            phân công theo từng dịch vụ.
                          </div>
                        )}
                    </div>
                  )}

                  {/* ─── Mode 1: Single person ─── */}
                  {assignMode === "one" && (
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">
                        Chọn người giúp việc{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={maidSearch}
                        onChange={(e) => setMaidSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        className="w-full mb-2 px-3.5 py-2.5 text-[13.5px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-slate-300 transition-colors"
                      />
                      {maidsLoading ? (
                        <p className="text-[13px] text-slate-400 text-center py-5">
                          Đang tải danh sách...
                        </p>
                      ) : filteredMaids.length === 0 ? (
                        <p className="text-[13px] text-slate-400 text-center py-5">
                          Không tìm thấy người giúp việc phù hợp.
                        </p>
                      ) : (
                        <MaidCarousel>
                          {filteredMaids.map((m) => (
                            <MaidCandidateOption
                              key={m.maNguoiGiupViec}
                              m={m}
                              name="maid"
                              checked={selectedMaid === m.maNguoiGiupViec}
                              onChange={() =>
                                setSelectedMaid(m.maNguoiGiupViec)
                              }
                            />
                          ))}
                        </MaidCarousel>
                      )}
                    </div>
                  )}

                  {/* ─── Mode 2: Multi person (per service) ─── */}
                  {assignMode === "multi-service" && (
                    <div className="space-y-4">
                      {maidsLoading ? (
                        <p className="text-[13px] text-slate-400 text-center py-5">
                          Đang tải danh sách...
                        </p>
                      ) : (
                        don.dichVus.map((dv) => {
                          const goiY = goiY2Nguoi.find(
                            (g) => g.maDonDatDichVu === dv.maDonDatDichVu,
                          );
                          const candidates = goiY?.candidates ?? [];
                          const searchVal =
                            multiSearch[dv.maDonDatDichVu] ?? "";
                          const filtered =
                            searchVal.trim() === ""
                              ? candidates
                              : candidates.filter((c) =>
                                  c.hoTen
                                    .toLowerCase()
                                    .includes(searchVal.toLowerCase()),
                                );
                          const selected =
                            multiSelection[dv.maDonDatDichVu] ?? "";

                          return (
                            <div
                              key={dv.maDonDatDichVu}
                              className="border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                                  {dv.tenDichVu}
                                </span>
                                {selected && (
                                  <span className="ml-auto text-sm text-emerald-600 font-bold flex items-center gap-1">
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Đã chọn
                                  </span>
                                )}
                              </div>

                              <input
                                type="text"
                                placeholder="Tìm theo tên..."
                                value={searchVal}
                                onChange={(e) =>
                                  setMultiSearch((prev) => ({
                                    ...prev,
                                    [dv.maDonDatDichVu]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.preventDefault();
                                }}
                                className="w-full mb-2 px-3 py-2 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
                              />

                              {candidates.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-lg border border-slate-100">
                                  Không có ứng viên phù hợp cho dịch vụ này.
                                </p>
                              ) : (
                                <MaidCarousel>
                                  {filtered.map((c) => (
                                    <MaidCandidateOption
                                      key={c.maNguoiGiupViec}
                                      m={c}
                                      name={`maid-${dv.maDonDatDichVu}`}
                                      checked={selected === c.maNguoiGiupViec}
                                      onChange={() =>
                                        setMultiSelection((prev) => ({
                                          ...prev,
                                          [dv.maDonDatDichVu]:
                                            c.maNguoiGiupViec,
                                        }))
                                      }
                                    />
                                  ))}
                                </MaidCarousel>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* ─── Mode 3: Multi person (per day) ─── */}
                  {assignMode === "multi-day" && (
                    <div className="space-y-4">
                      {maidsLoading ? (
                        <p className="text-[13px] text-slate-400 text-center py-5">
                          Đang tải danh sách...
                        </p>
                      ) : (
                        goiYTheoNgayLamViec.map((nlvInfo) => {
                          const candidates = nlvInfo.candidates ?? [];
                          const selected =
                            multiSelection[nlvInfo.maNgayLamViec] ?? "";

                          return (
                            <div
                              key={nlvInfo.maNgayLamViec}
                              className="border border-slate-200 rounded-xl p-4 bg-slate-50/30"
                            >
                              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                                  {nlvInfo.tenDichVu}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                  {formatDate(nlvInfo.ngayLam)}
                                </span>
                                <span className="text-sm font-medium text-slate-500">
                                  ({nlvInfo.gioBatDau})
                                </span>
                                {selected && (
                                  <span className="ml-auto text-sm text-emerald-600 font-bold flex items-center gap-1">
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Đã chọn
                                  </span>
                                )}
                              </div>

                              {candidates.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-lg border border-slate-100">
                                  Không có ứng viên phù hợp cho ngày này.
                                </p>
                              ) : (
                                <MaidCarousel>
                                  {candidates.map((c) => (
                                    <MaidCandidateOption
                                      key={c.maNguoiGiupViec}
                                      m={c}
                                      name={`maid-${nlvInfo.maNgayLamViec}`}
                                      checked={selected === c.maNguoiGiupViec}
                                      onChange={() =>
                                        setMultiSelection((prev) => ({
                                          ...prev,
                                          [nlvInfo.maNgayLamViec]:
                                            c.maNguoiGiupViec,
                                        }))
                                      }
                                    />
                                  ))}
                                </MaidCarousel>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActionMode("idle");
                        setSelectedMaid("");
                        setMultiSelection({});
                        setActionError(null);
                      }}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        if (assignMode === "one" && !selectedMaid) {
                          setActionError("Vui lòng chọn người giúp việc.");
                          return;
                        }
                        if (assignMode !== "one" && !isMultiValid) {
                          setActionError("Vui lòng chọn đủ người giúp việc.");
                          return;
                        }
                        setActionError(null);
                        setConfirmPhanCong(true);
                      }}
                      disabled={
                        submitting ||
                        (assignMode === "one" && !selectedMaid) ||
                        (assignMode !== "one" && !isMultiValid)
                      }
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-all duration-150 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
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
                      {submitting ? "Đang xử lý..." : "Xác nhận phân công"}
                    </button>
                  </div>
                </div>
              )}

              {/* Rejecting */}
              {actionMode === "rejecting" && (
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

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmPhanCong}
        title="Xác nhận phân công"
        message={getConfirmMessage()}
        confirmText="Phân công"
        confirmClass="bg-indigo-600 hover:bg-indigo-700 text-white"
        isLoading={submitting}
        onConfirm={handleConfirmAssign}
        onCancel={() => setConfirmPhanCong(false)}
      />
    </div>
  );
}
