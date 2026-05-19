"use client";

import React, { useState, useEffect } from "react";
import {
  AccountBalanceWallet,
  PendingActions,
  Cancel,
  ReceiptLong,
  CalendarMonth,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import api from "@/services/api";

export default function MaidIncomePage() {
  const [incomeData, setIncomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const response: any = await api.get("/ThuNhap/my-income");

        if (response?.data?.success || response?.success) {
          setIncomeData(response?.data?.data || response?.data);
        } else {
          setError("Không thể tải dữ liệu thu nhập.");
        }
      } catch (err: any) {
        console.error("Lỗi fetch thu nhập:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // CẬP NHẬT MÀU SẮC CHO ĐÚNG 3 TRẠNG THÁI
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            Đã xác nhận
          </span>
        );
      case "Chờ xác nhận":
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            Chờ xác nhận
          </span>
        );
      case "Đã hủy":
        return (
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <CircularProgress className="text-blue-600" />
      </div>
    );
  }

  if (error || !incomeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { thongKe, danhSach } = incomeData;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 rounded-3xl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý thu nhập
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi các khoản doanh thu từ công việc của bạn.
          </p>
        </div>

        {/* THẺ THỐNG KÊ ĐƯỢC CẬP NHẬT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Thu nhập đã xác nhận */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <AccountBalanceWallet fontSize="medium" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Thu nhập đã xác nhận
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(thongKe.daXacNhan)}
              </p>
            </div>
          </div>

          {/* 2. Tiền đang chờ xác nhận */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <PendingActions fontSize="medium" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Đang chờ xác nhận
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(thongKe.choXacNhan)}
              </p>
            </div>
          </div>

          {/* 3. Tiền bị hủy */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Cancel fontSize="medium" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Thu nhập đã hủy
              </p>
              <p className="text-2xl font-bold text-rose-600">
                {formatCurrency(thongKe.daHuy)}
              </p>
            </div>
          </div>
        </div>

        {/* DANH SÁCH CHI TIẾT THU NHẬP */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <ReceiptLong className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">
              Lịch sử giao dịch
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Mã thu nhập</th>
                  <th className="px-6 py-4 font-semibold">
                    Dịch vụ (Ngày làm)
                  </th>
                  <th className="px-6 py-4 font-semibold">Ngày ghi nhận</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {danhSach.length > 0 ? (
                  danhSach.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-600 font-medium">
                        {item.maThuNhap}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.tenDichVu}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                          <CalendarMonth sx={{ fontSize: 14 }} />
                          <span>Ca làm: {formatDate(item.ngayLam)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(item.thoiGianTao)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-right">
                        {/* Nếu trạng thái là "Đã hủy", hiển thị số tiền có gạch ngang và mờ đi */}
                        <span
                          className={
                            item.trangThai === "Đã hủy"
                              ? "line-through text-slate-400"
                              : ""
                          }
                        >
                          {formatCurrency(item.soTien)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.trangThai)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Chưa có dữ liệu thu nhập nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
