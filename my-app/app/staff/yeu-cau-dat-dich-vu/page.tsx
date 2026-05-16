"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import StatusBadge from "@/components/componentsStaff/StatusBadge";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/componentsStaff/States";

interface DonDat {
  maDon: string;
  maKhachHang: string;
  hoTenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  soNgay: number;
  tongTien: number;
  ngayDat: string;
  ghiChu: string;
  trangThaiHienTai: string;
}

const STATUS_OPTIONS = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang thực hiện",
  "Hoàn thành",
  "Có sự cố",
  "Hủy đơn",
];

export default function DanhSachYeuCauPage() {
  const router = useRouter();
  const [danhSach, setDanhSach] = useState<DonDat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params =
        filterStatus !== "Tất cả"
          ? `?status=${encodeURIComponent(filterStatus)}`
          : "";
      const res = await api.get<any>(`/v1/staff/danh-sach-yeu-cau${params}`);
      setDanhSach(res?.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [filterStatus]);

  const totalPages = Math.ceil(danhSach.length / itemsPerPage);
  const currentList = danhSach.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  const formatMoney = (n: number) =>
    n != null
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(n)
      : "—";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-400" />
            <h1 className="text-[26px] font-bold text-slate-800 tracking-tight">
              Yêu cầu đặt dịch vụ
            </h1>
          </div>
          {!loading && !error && (
            <span className="text-[14px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1 rounded-full shadow-sm">
              {danhSach.length} đơn
            </span>
          )}
        </div>
        <p className="text-[15px] text-slate-500 ml-4">
          Quản lý và xử lý các yêu cầu từ khách hàng
        </p>
      </div>

      {/* Filter tabs */}
      <div className="w-full mb-8">
        <div className="flex bg-slate-100 p-2 rounded-2xl overflow-x-auto w-full shadow-sm border border-slate-200/60 justify-between gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-[14.5px] font-bold transition-all duration-300 whitespace-nowrap cursor-pointer text-center ${
                filterStatus === s
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/50 scale-[1.02]"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Card */}
      <div className="w-full">
        {loading && <LoadingState />}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchData} />
        )}
        {!loading && !error && danhSach.length === 0 && (
          <EmptyState message="Không có yêu cầu nào phù hợp." />
        )}
        {!loading && !error && danhSach.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentList.map((d) => (
              <div
                key={d.maDon}
                onClick={() => router.push(`/staff/yeu-cau-dat-dich-vu/${d.maDon}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Header Card */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                  <div>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold font-mono rounded-md mb-2">
                      {d.maDon}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1" title={d.hoTenKhachHang}>
                      {d.hoTenKhachHang}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {d.soDienThoai}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1">
                    <StatusBadge status={d.trangThaiHienTai} type="don" />
                  </div>
                </div>

                {/* Body Card */}
                <div className="px-5 py-4 flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Ngày đặt</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(d.ngayDat)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Thời lượng</p>
                      <p className="text-sm font-semibold text-slate-700">{d.soNgay} ngày</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Tổng tiền</p>
                      <p className="text-base font-bold text-indigo-600">{formatMoney(d.tongTien)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center group">
                  <span className="text-sm text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">
                    Xem chi tiết yêu cầu
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-colors">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          currentPage === page
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
