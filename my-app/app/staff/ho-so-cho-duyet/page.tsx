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
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight">Kiểm duyệt hồ sơ</h1>
          <p className="text-[13.5px] text-slate-500 mt-1">
            Danh sách hồ sơ người giúp việc đang chờ xét duyệt
          </p>
        </div>
        {!loading && !error && (
          <span className="shrink-0 mt-1 text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
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
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
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
                      className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest"
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
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(`/staff/ho-so-cho-duyet/${hs.maHoSo}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[13px] shrink-0">
                          {hs.hoTen?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-[14px] font-semibold text-slate-800">
                          {hs.hoTen}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500">{hs.email}</td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500">{hs.soDienThoai}</td>
                    <td className="px-5 py-4 text-[13.5px] text-slate-500">{hs.gioiTinh}</td>
                    <td
                      className="px-5 py-4 text-[13.5px] text-slate-500 max-w-[180px] truncate"
                      title={hs.kinhNghiem}
                    >
                      {hs.kinhNghiem ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={hs.trangThai} type="hoSo" />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/ho-so-cho-duyet/${hs.maHoSo}`);
                        }}
                        className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-150 whitespace-nowrap cursor-pointer group-hover:shadow-sm"
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
