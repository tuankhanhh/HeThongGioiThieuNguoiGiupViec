"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface StatsCard {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  iconBg: string;
  icon: React.ReactNode;
}

type HelperCard = {
  maHoSo: string;
  maNguoiGiupViec: string;
  hoTen: string;
  soDienThoai: string;
  gioiTinh: string;
  anhChanDung: string;
  danhSachKyNang: string[];
};

type HelperDetail = {
  maHoSo: string;
  maNguoiGiupViec: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  soCccd: string;
  ngaySinh: string;
  gioiTinh: string;
  tenNguoiThan: string;
  sdtNguoiThan: string;
  anhChanDung: string;
  danhSachKyNang: Array<{
    id: string;
    ten: string;
    kinhNghiem: string;
  }>;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export default function StaffDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    choDuyet: 0,
    choXacNhan: 0,
    daXacNhan: 0,
    huyDon: 0,
  });
  const [helpers, setHelpers] = useState<HelperCard[]>([]);
  const [helperLoading, setHelperLoading] = useState(true);
  const [selectedHelper, setSelectedHelper] = useState<HelperDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        // CHỈ SỬA DÒNG NÀY: Đổi từ <HelperCard[]> thành <ApiResponse<HelperCard[]>>
        const res = await api.get<ApiResponse<HelperCard[]>>(
          "/v1/staff/ho-so-cac-nguoi-giup-viec",
        );

        // Logic lấy res.data được giữ nguyên hoàn toàn
        setHelpers(res.data ?? []);
      } catch (error) {
        console.error("Lỗi load danh sách người giúp việc:", error);
        setHelpers([]);
      } finally {
        setHelperLoading(false);
      }
    };

    fetchHelpers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hoSoRes, donRes] = await Promise.all([
          api.get<any>("/v1/staff/ho-so-cho-duyet"),
          api.get<any>("/v1/staff/danh-sach-yeu-cau"),
        ]);

        const allDon: any[] = donRes?.data ?? [];
        setStats({
          choDuyet: hoSoRes?.data?.length ?? 0,
          choXacNhan: allDon.filter(
            (d) => d.trangThaiHienTai === "Chờ xác nhận",
          ).length,
          daXacNhan: allDon.filter((d) => d.trangThaiHienTai === "Đã xác nhận")
            .length,
          huyDon: allDon.filter((d) => d.trangThaiHienTai === "Hủy đơn").length,
        });
      } catch {
        // Silently fail - staff may not have data yet
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const openHelperDetail = async (maHoSo: string) => {
    try {
      setDetailLoading(true);
      // Đã khai báo rõ kiểu trả về để TypeScript bắt lỗi tốt hơn
      const res = await api.get<ApiResponse<HelperDetail>>(
        `/v1/staff/chi-tiet-ho-so/${maHoSo}`,
      );

      setSelectedHelper(res.data ?? null);
    } catch (error) {
      console.error("Lỗi load chi tiết hồ sơ:", error);
      setSelectedHelper(null);
    } finally {
      setDetailLoading(false);
    }
  };
  const cards: StatsCard[] = [
    {
      label: "Hồ sơ chờ duyệt",
      value: loading ? "..." : stats.choDuyet,
      sub: "Người giúp việc mới",
      color: "from-amber-50 to-orange-50 border-amber-200",
      iconBg: "bg-amber-100",
      icon: (
        <svg
          className="w-5 h-5 text-amber-600"
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
      ),
    },
    {
      label: "Chờ xác nhận",
      value: loading ? "..." : stats.choXacNhan,
      sub: "Cần phân công",
      color: "from-yellow-50 to-amber-50 border-yellow-200",
      iconBg: "bg-yellow-100",
      icon: (
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Đã xác nhận",
      value: loading ? "..." : stats.daXacNhan,
      sub: "Đang tiến hành",
      color: "from-blue-50 to-indigo-50 border-blue-200",
      iconBg: "bg-blue-100",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
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
      ),
    },
    {
      label: "Đơn đã hủy",
      value: loading ? "..." : stats.huyDon,
      sub: "Từ chối hoặc hủy",
      color: "from-red-50 to-rose-50 border-red-200",
      iconBg: "bg-red-100",
      icon: (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const shortcuts = [
    {
      title: "Kiểm duyệt hồ sơ",
      desc: "Xem và xét duyệt hồ sơ người giúp việc đang chờ",
      href: "/staff/ho-so-cho-duyet",
      btnText: "Xem danh sách",
      accent: "border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-white",
      iconBg: "bg-amber-100",
      icon: (
        <svg
          className="w-5 h-5 text-amber-600"
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
      ),
    },
    {
      title: "Yêu cầu dịch vụ",
      desc: "Xem danh sách yêu cầu và phân công người giúp việc",
      href: "/staff/yeu-cau-dat-dich-vu",
      btnText: "Xem danh sách",
      accent: "border-l-indigo-400 bg-gradient-to-r from-indigo-50/50 to-white",
      iconBg: "bg-indigo-100",
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      title: "Khiếu nại",
      desc: "Xem và xử lý khiếu nại từ khách hàng",
      href: "/staff/khieu-nai",
      btnText: "Xem danh sách",
      accent: "border-l-rose-400 bg-gradient-to-r from-rose-50/50 to-white",
      iconBg: "bg-rose-100",
      icon: (
        <svg
          className="w-5 h-5 text-rose-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 4h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
  ];

  const totalPages = Math.ceil(helpers.length / itemsPerPage);
  const currentHelpers = helpers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
          Dashboard
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Tổng quan hoạt động của nhân viên
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}
              >
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-[30px] font-bold text-slate-800 leading-none">
                {card.value}
              </p>
              <p className="text-[12px] font-semibold text-slate-600 mt-1.5">
                {card.label}
              </p>
              {card.sub && (
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-slate-700">Truy cập nhanh</h2>
        <p className="text-[12.5px] text-slate-400 mt-0.5">
          Chuyển đến các mục quản lý chính
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shortcuts.map((s) => (
          <div
            key={s.href}
            className={`${s.accent} rounded-2xl border border-slate-200 border-l-4 p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200 cursor-pointer group`}
            onClick={() => router.push(s.href)}
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}
            >
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-[14px] mb-1">
                {s.title}
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {s.desc}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(s.href);
              }}
              className="self-start text-[12.5px] font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-150 cursor-pointer group-hover:shadow-sm"
            >
              {s.btnText} →
            </button>
          </div>
        ))}
      </div>
      <div className="mt-10 mb-4">
        <h2 className="text-[18px] font-bold text-slate-800">
          Danh sách người giúp việc
        </h2>
        <p className="text-[12.5px] text-slate-500 mt-1">
          Bấm vào từng card để xem thông tin đầy đủ
        </p>
      </div>

      {helperLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="col-span-full text-center py-10 text-slate-500">
            Đang tải danh sách...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {currentHelpers.map((helper) => (
              <div
                key={helper.maHoSo}
                onClick={() => openHelperDetail(helper.maHoSo)}
                className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={
                      `/images/anhnguoigiupviec/${helper.anhChanDung}` ||
                      "/images/anhnguoigiupviec/default.png/"
                    }
                    alt={helper.hoTen}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 mb-3"
                  />

                  <h3 className="text-[14px] font-bold text-slate-800 leading-tight">
                    {helper.hoTen}
                  </h3>

                  <p className="text-[12.5px] text-slate-500 mt-1">
                    {helper.soDienThoai || "—"}
                  </p>

                  <p className="text-[12.5px] text-slate-600 mt-1">
                    {helper.gioiTinh || "—"}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {helper.danhSachKyNang?.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "text-slate-600 hover:bg-slate-100 border-transparent"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau &rarr;
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {selectedHelper && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {detailLoading ? (
              <div className="p-8 text-center text-slate-500">
                Đang tải chi tiết hồ sơ...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-slate-50 p-6 flex items-center justify-center">
                  <img
                    src={selectedHelper.anhChanDung || "/default-avatar.png"}
                    alt={selectedHelper.hoTen}
                    className="w-56 h-56 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                </div>

                <div className="md:col-span-8 p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-[20px] font-bold text-slate-900">
                        Thông tin người giúp việc
                      </h2>
                      <p className="text-[13px] text-slate-500 mt-1">
                        Thông tin đầy đủ của nhân viên được chọn
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedHelper(null)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      label="Mã người dùng"
                      value={selectedHelper.maNguoiGiupViec}
                    />
                    <InfoItem label="Họ tên" value={selectedHelper.hoTen} />
                    <InfoItem
                      label="Số điện thoại"
                      value={selectedHelper.soDienThoai}
                    />
                    <InfoItem label="Email" value={selectedHelper.email} />
                    <InfoItem label="Địa chỉ" value={selectedHelper.diaChi} />
                    <InfoItem label="Số CCCD" value={selectedHelper.soCccd} />
                    <InfoItem
                      label="Ngày sinh"
                      value={selectedHelper.ngaySinh}
                    />
                    <InfoItem
                      label="Giới tính"
                      value={selectedHelper.gioiTinh}
                    />
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <h3 className="text-[14px] font-bold text-indigo-800 mb-3">
                      Thông tin người thân
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        label="Tên người thân"
                        value={selectedHelper.tenNguoiThan}
                      />
                      <InfoItem
                        label="Số điện thoại người thân"
                        value={selectedHelper.sdtNguoiThan}
                      />
                    </div>
                  </div>
                  <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200">
                    <h3 className="text-[14px] font-bold text-slate-800 mb-3">
                      Kỹ năng & Kinh nghiệm
                    </h3>
                    {selectedHelper.danhSachKyNang &&
                    selectedHelper.danhSachKyNang.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {selectedHelper.danhSachKyNang.map((kn) => (
                          <div
                            key={kn.id}
                            className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <span className="text-[13.5px] font-medium text-slate-700">
                              {kn.ten}
                            </span>
                            <span className="text-[12px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                              {kn.kinhNghiem}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-500 italic">
                        Chưa có thông tin kỹ năng
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  function InfoItem({ label, value }: { label: string; value: any }) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
          {label}
        </span>
        <span className="text-[13.5px] font-medium text-slate-800">
          {value || "—"}
        </span>
      </div>
    );
  }
}
