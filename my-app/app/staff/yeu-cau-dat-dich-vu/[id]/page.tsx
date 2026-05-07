"use client";

import { useEffect, useState } from "react";
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
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 break-words">{value || "—"}</span>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActionMode = "idle" | "rejecting" | "assigning";

export default function ChiTietYeuCauPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Data
  const [don, setDon] = useState<DonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Maids list for assignment
  const [maids, setMaids] = useState<MaidOption[]>([]);
  const [maidsLoading, setMaidsLoading] = useState(false);
  const [selectedMaid, setSelectedMaid] = useState("");
  const [maidSearch, setMaidSearch] = useState("");

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

  // ─── Fetch maid list for assignment ────────────────────────────────────────
  const fetchMaids = async () => {
    setMaidsLoading(true);
    try {
      // Gọi đúng endpoint mới, truyền maDon để lọc trùng lịch
      const res = await api.get<any>(
        `/v1/staff/danh-sach-nguoi-giup-viec?maDon=${id}`,
      );
      const list: any[] = res?.data ?? [];
      setMaids(
        list.map((m: any) => ({
          maNguoiGiupViec: m.maNguoiGiupViec,
          hoTen: m.hoTen,
        })),
      );
    } catch {
      setMaids([]);
    } finally {
      setMaidsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ─── Assign ────────────────────────────────────────────────────────────────
  const handleOpenAssign = () => {
    setActionMode("assigning");
    setSelectedMaid("");
    setMaidSearch("");
    fetchMaids();
  };

  const handleConfirmAssign = async () => {
    if (!selectedMaid) {
      setActionError("Vui lòng chọn người giúp việc.");
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post("/v1/staff/phan-cong-cong-viec", {
        MaDon: id,
        MaNguoiGiupViec: selectedMaid,
      });
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
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
        Quay lại
      </button>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}

      {!loading && !error && don && (
        <>
          {/* Title */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Chi tiết yêu cầu
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Mã đơn: {don.maDon}
              </p>
            </div>
            <StatusBadge status={don.trangThaiHienTai} type="don" />
          </div>

          {/* Success */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {/* Khách hàng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Thông tin khách hàng
              </h2>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="Họ tên" value={don.khachHang.hoTen} />
              <InfoRow label="Email" value={don.khachHang.email} />
              <InfoRow label="Số điện thoại" value={don.khachHang.sdtKhach} />
            </div>
          </div>

          {/* Đơn đặt */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">
                Thông tin đơn đặt
              </h2>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="Địa chỉ" value={don.diaChi} />
              <InfoRow label="Ngày đặt" value={formatDate(don.ngayDat)} />
              <InfoRow label="Số ngày" value={`${don.soNgay} ngày`} />
              <InfoRow
                label="Tổng tiền"
                value={
                  <span className="font-semibold text-indigo-600">
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

          {/* Dịch vụ */}
          {don.dichVus.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">
                  Dịch vụ đặt
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {don.dichVus.map((dv) => (
                  <div key={dv.maDonDatDichVu} className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800 mb-2">
                      {dv.tenDichVu}
                    </p>
                    {dv.ngayLamViecs.length > 0 && (
                      <div className="space-y-1">
                        {dv.ngayLamViecs.map((nlv) => (
                          <div
                            key={nlv.maNgayLamViec}
                            className="flex items-center gap-2 text-xs text-slate-500"
                          >
                            <span className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
                            <span>{formatDate(nlv.ngayLam)}</span>
                            <span>{nlv.gioBatDau}</span>
                            <span className="ml-auto">{nlv.trangThai}</span>
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
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">
                  Lịch sử trạng thái
                </h2>
              </div>
              <div className="px-5 py-3 space-y-2">
                {don.lichSuTrangThai.map((ls, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
                    <span className="text-sm text-slate-700">
                      {ls.trangThai}
                    </span>
                    <span className="ml-auto text-xs text-slate-400">
                      {formatDateTime(ls.thoiGianCapNhat)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action area */}
          {canAct && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Xử lý yêu cầu
              </h2>

              {actionError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {actionError}
                </div>
              )}

              {/* Idle: show 2 buttons */}
              {actionMode === "idle" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenAssign}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    📋 Phân công công việc
                  </button>
                  <button
                    onClick={() => setActionMode("rejecting")}
                    className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
                  >
                    ✗ Từ chối yêu cầu
                  </button>
                </div>
              )}

              {/* Assigning: pick maid */}
              {actionMode === "assigning" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Chọn người giúp việc{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Tìm theo tên..."
                      value={maidSearch}
                      onChange={(e) => setMaidSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      className="w-full mb-2 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                    {maidsLoading ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Đang tải danh sách...
                      </p>
                    ) : filteredMaids.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Không tìm thấy người giúp việc.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {filteredMaids.map((m) => (
                          <label
                            key={m.maNguoiGiupViec}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                              selectedMaid === m.maNguoiGiupViec
                                ? "bg-indigo-50"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="maid"
                              value={m.maNguoiGiupViec}
                              checked={selectedMaid === m.maNguoiGiupViec}
                              onChange={() =>
                                setSelectedMaid(m.maNguoiGiupViec)
                              }
                              className="accent-indigo-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {m.hoTen}
                              </p>
                              <p className="text-xs text-slate-400">
                                {m.maNguoiGiupViec}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionMode("idle");
                        setSelectedMaid("");
                        setActionError(null);
                      }}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedMaid) {
                          setActionError("Vui lòng chọn người giúp việc.");
                          return;
                        }
                        setActionError(null);
                        setConfirmPhanCong(true);
                      }}
                      disabled={submitting || !selectedMaid}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Xác nhận phân công
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
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleTuChoi}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already handled */}
          {!canAct && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-500 text-center">
              Đơn này đang ở trạng thái <strong>{don.trangThaiHienTai}</strong>{" "}
              — không thể thực hiện thêm thao tác.
            </div>
          )}
        </>
      )}

      {/* Confirm modal: phan cong */}
      <ConfirmModal
        isOpen={confirmPhanCong}
        title="Xác nhận phân công"
        message={`Phân công đơn ${don?.maDon ?? ""} cho "${maids.find((m) => m.maNguoiGiupViec === selectedMaid)?.hoTen ?? selectedMaid}"?`}
        confirmText="Phân công"
        confirmClass="bg-indigo-600 hover:bg-indigo-700 text-white"
        isLoading={submitting}
        onConfirm={handleConfirmAssign}
        onCancel={() => setConfirmPhanCong(false)}
      />
    </div>
  );
}
