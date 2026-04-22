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

interface HoSo {
  maHoSo: string;
  maNguoiGiupViec: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  gioiTinh: string;
  ngaySinh: string;
  kinhNghiem: string;
  trangThai: string;
}

export default function HoSoChoDuyetPage() {
  const router = useRouter();
  const [danhSach, setDanhSach] = useState<HoSo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/v1/staff/ho-so-cho-duyet");
      setDanhSach(res?.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Kiểm duyệt hồ sơ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách hồ sơ người giúp việc đang chờ xét duyệt
          </p>
        </div>
        {!loading && !error && (
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {danhSach.length} hồ sơ
          </span>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && <LoadingState />}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchData} />
        )}
        {!loading && !error && danhSach.length === 0 && (
          <EmptyState message="Hiện không có hồ sơ nào đang chờ duyệt." />
        )}
        {!loading && !error && danhSach.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Họ tên",
                    "Email",
                    "Số điện thoại",
                    "Giới tính",
                    "Kinh nghiệm",
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
                {danhSach.map((hs) => (
                  <tr
                    key={hs.maHoSo}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/staff/ho-so-cho-duyet/${hs.maHoSo}`)
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {hs.hoTen?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {hs.hoTen}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {hs.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {hs.soDienThoai}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {hs.gioiTinh}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-slate-600 max-w-[180px] truncate"
                      title={hs.kinhNghiem}
                    >
                      {hs.kinhNghiem ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={hs.trangThai} type="hoSo" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/ho-so-cho-duyet/${hs.maHoSo}`);
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                      >
                        Xem chi tiết
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
