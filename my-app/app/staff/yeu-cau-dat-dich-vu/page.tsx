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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Yêu cầu đặt dịch vụ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và xử lý các yêu cầu từ khách hàng
          </p>
        </div>
        {!loading && !error && (
          <span className="self-start text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {danhSach.length} đơn
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
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
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
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
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
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
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/staff/yeu-cau-dat-dich-vu/${d.maDon}`)
                    }
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {d.hoTenKhachHang}
                        </p>
                        <p className="text-xs text-slate-400">
                          {d.soDienThoai}
                        </p>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate"
                      title={d.diaChi}
                    >
                      {d.diaChi}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(d.ngayDat)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {d.soNgay} ngày
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {formatMoney(d.tongTien)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.trangThaiHienTai} type="don" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/yeu-cau-dat-dich-vu/${d.maDon}`);
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap"
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
