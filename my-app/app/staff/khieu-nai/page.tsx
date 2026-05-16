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

const STATUS_OPTIONS = ["Tất cả", "Chờ xử lý", "Đang xử lý", "Đã xử lý"];

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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
            Quản lý khiếu nại
          </h1>
          <p className="text-[13.5px] text-slate-500 mt-1">
            Theo dõi và xử lý các phản hồi từ khách hàng
          </p>
        </div>
        {!loading && !error && (
          <span className="self-start mt-1 text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full shrink-0">
            {danhSach.length} khiếu nại
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex mb-6 pb-6 border-b border-slate-100">
        <div className="inline-flex bg-slate-200/50 p-1.5 rounded-xl overflow-x-auto w-full md:w-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2 rounded-lg text-[13.5px] font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                filterStatus === s
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
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
                    key={d.maKhieuNai}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(`/staff/khieu-nai/${d.maKhieuNai}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-bold text-indigo-600 font-mono">
                        {d.maKhieuNai}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] text-slate-500 font-mono">
                        {d.maDon}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[14px] font-semibold text-slate-800">
                          {d.hoTenKhachHang}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                          {d.sdtKhachHang}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500 whitespace-nowrap">
                      {formatDate(d.ngayDatDon)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.trangThai} type="khieuNai" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/khieu-nai/${d.maKhieuNai}`);
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
