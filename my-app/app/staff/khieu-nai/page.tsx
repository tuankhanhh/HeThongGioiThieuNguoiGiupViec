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

interface KhieuNai {
  maKhieuNai: string;
  maDon: string;
  maKhachHang: string;
  hoTenKhachHang: string;
  sdtKhachHang: string;
  maNhanVien: string | null;
  ngayDatDon: string | null;
  trangThai: string;
}

const STATUS_OPTIONS = [
  "Tất cả",
  "Chưa xử lý",
  "Đang xử lý",
  "Đã giải quyết",
];

export default function DanhSachKhieuNaiPage() {
  const router = useRouter();
  const [danhSach, setDanhSach] = useState<KhieuNai[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/v1/staff/danh-sach-khieu-nai");
      let data = res?.data ?? [];
      
      // Client-side filtering
      if (filterStatus !== "Tất cả") {
        data = data.filter((item: KhieuNai) => item.trangThai === filterStatus);
      }
      
      setDanhSach(data);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "Không có dữ liệu";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý khiếu nại
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi và xử lý các phản hồi từ khách hàng
          </p>
        </div>
        {!loading && !error && (
          <span className="self-start text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {danhSach.length} khiếu nại
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
          <EmptyState message="Không có khiếu nại nào phù hợp." />
        )}
        {!loading && !error && danhSach.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Mã KN",
                    "Đơn đặt",
                    "Khách hàng",
                    "Ngày đặt đơn",
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
                    key={d.maKhieuNai}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/staff/khieu-nai/${d.maKhieuNai}`)
                    }
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-indigo-600">
                        {d.maKhieuNai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {d.maDon}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {d.hoTenKhachHang}
                        </p>
                        <p className="text-xs text-slate-400">
                          {d.sdtKhachHang}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(d.ngayDatDon)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.trangThai} type="khieuNai" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/khieu-nai/${d.maKhieuNai}`);
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
