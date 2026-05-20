"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  Search,
  ReportProblemOutlined,
  SupportAgentOutlined,
  AssignmentOutlined,
  AccessTime,
  CheckCircleOutline,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import api from "@/services/api";
import Link from "next/link";

export interface Complaint {
  maKhieuNai: string;
  maDon: string;
  noiDung: string;
  phanHoi: string;
  thoiGian: string;
  trangThai: string; // "Chờ xử lý", "Đang xử lý", "Đã xử lý", "Từ chối"
}

const TABS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Chờ xử lý", value: "Chờ xử lý" },
  { label: "Đang xử lý", value: "Đang xử lý" },
  { label: "Đã xử lý", value: "Đã xử lý" },
];

export default function ComplaintHistoryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy danh sách khiếu nại
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const response: any = await api.get(`/v1/khieu-nai/allofCus`);
        const data = response?.data || response;
        setComplaints(data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khiếu nại:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Lọc dữ liệu
  let filteredComplaints = [...complaints];

  if (activeTab !== "Tất cả") {
    filteredComplaints = filteredComplaints.filter(
      (c) => c.trangThai === activeTab,
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredComplaints = filteredComplaints.filter(
      (c) =>
        c.maDon.toLowerCase().includes(q) ||
        c.maKhieuNai.toLowerCase().includes(q) ||
        c.noiDung.toLowerCase().includes(q),
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 px-4 md:p-8 rounded-3xl">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white hover:bg-slate-50 rounded-lg transition-all shadow-sm border border-slate-200 cursor-pointer"
          >
            <ArrowBack className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Lịch sử khiếu nại
            </h1>
          </div>
        </div>

        {/* BỘ LỌC VÀ TÌM KIẾM */}
        <div className="mb-6 border-b border-slate-200 pb-4">
          <div className="mb-4 relative max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search sx={{ fontSize: 20 }} />
            </div>
            <input
              type="text"
              placeholder="Tìm theo mã đơn, mã khiếu nại, nội dung..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const count =
                tab.value === "Tất cả"
                  ? complaints.length
                  : complaints.filter((c) => c.trangThai === tab.value).length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer text-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={`ml-1 text-xs ${
                      isActive ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DANH SÁCH KHIẾU NẠI */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <CircularProgress className="text-blue-600" />
            </div>
          ) : filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.maKhieuNai} complaint={complaint} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <ReportProblemOutlined
                  sx={{ fontSize: 32 }}
                  className="text-slate-400"
                />
              </div>
              <p className="text-lg text-slate-700 font-bold">
                Không tìm thấy khiếu nại nào
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Bạn chưa gửi khiếu nại nào hoặc không khớp với bộ lọc.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BỘ CẤU HÌNH TRẠNG THÁI KHIẾU NẠI
const statusConfig = {
  "Chờ xử lý": {
    text: "text-amber-700",
    badge: "border-amber-200 bg-amber-50",
    icon: <AccessTime sx={{ fontSize: 16 }} className="mr-1" />,
  },
  "Đang xử lý": {
    text: "text-blue-700",
    badge: "border-blue-200 bg-blue-50",
    icon: <SupportAgentOutlined sx={{ fontSize: 16 }} className="mr-1" />,
  },
  "Đã xử lý": {
    text: "text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50",
    icon: <CheckCircleOutline sx={{ fontSize: 16 }} className="mr-1" />,
  },
  "Từ chối": {
    text: "text-rose-700",
    badge: "border-rose-200 bg-rose-50",
    icon: <ReportProblemOutlined sx={{ fontSize: 16 }} className="mr-1" />,
  },
};

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const config =
    statusConfig[complaint.trangThai as keyof typeof statusConfig] ||
    statusConfig["Chờ xử lý"];

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Link href={`/customer/history/${complaint.maDon}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:border-blue-300 cursor-pointer">
        {/* HEADER CARD */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <ReportProblemOutlined sx={{ fontSize: 20 }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Mã khiếu nại</p>
              <p className="text-sm font-bold font-mono text-slate-800">
                {complaint.maKhieuNai}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${config.badge} ${config.text}`}
          >
            {config.icon}
            {complaint.trangThai}
          </span>
        </div>

        {/* BODY CARD */}
        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <AssignmentOutlined
                sx={{ fontSize: 18 }}
                className="text-slate-400"
              />
              <span>
                Mã đơn đặt:{" "}
                <strong className="font-mono group-hover:text-blue-600 transition-colors">
                  {complaint.maDon}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 sm:justify-end">
              <AccessTime sx={{ fontSize: 18 }} className="text-slate-400" />
              <span>
                Ngày gửi: <strong>{formatDate(complaint.thoiGian)}</strong>
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
              Nội dung khiếu nại
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {complaint.noiDung}
            </div>
          </div>

          {/* PHẢN HỒI TỪ CSKH (CHỈ HIỂN THỊ KHI CÓ DỮ LIỆU) */}
          {complaint.phanHoi && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold mb-2 flex items-center gap-1.5">
                <SupportAgentOutlined sx={{ fontSize: 16 }} />
                Phản hồi từ bộ phận CSKH
              </p>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                {complaint.phanHoi}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
