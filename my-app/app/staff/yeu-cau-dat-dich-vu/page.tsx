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
    fetchData();
  }, [filterStatus]);

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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
            Yêu cầu đặt dịch vụ
          </h1>
          <p className="text-[13.5px] text-slate-500 mt-1">
            Quản lý và xử lý các yêu cầu từ khách hàng
          </p>
        </div>
        {!loading && !error && (
          <span className="self-start mt-1 text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full shrink-0">
            {danhSach.length} đơn
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-slate-100">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
              filterStatus === s
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && <LoadingState />}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchData} />
        )}
        {!loading && !error && danhSach.length === 0 && (
          <EmptyState message="Không có yêu cầu nào phù hợp." />
        )}
        {!loading && !error && danhSach.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Khách hàng",
                    "Địa chỉ",
                    "Ngày đặt",
                    "Số ngày",
                    "Tổng tiền",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {danhSach.map((d) => (
                  <tr
                    key={d.maDon}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(`/staff/yeu-cau-dat-dich-vu/${d.maDon}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[14px] font-semibold text-slate-800">
                          {d.hoTenKhachHang}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                          {d.soDienThoai}
                        </p>
                      </div>
                    </td>
                    <td
                      className="px-5 py-4 text-[13.5px] text-slate-500 max-w-[160px] truncate"
                      title={d.diaChi}
                    >
                      {d.diaChi}
                    </td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500 whitespace-nowrap">
                      {formatDate(d.ngayDat)}
                    </td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500">
                      {d.soNgay} ngày
                    </td>
                    <td className="px-5 py-4 text-[14px] font-semibold text-slate-800">
                      {formatMoney(d.tongTien)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.trangThaiHienTai} type="don" />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/yeu-cau-dat-dich-vu/${d.maDon}`);
                        }}
                        className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-150 whitespace-nowrap cursor-pointer group-hover:shadow-sm"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
