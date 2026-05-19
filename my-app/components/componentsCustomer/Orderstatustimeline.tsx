"use client";

import React from "react";
import {
  EventNote,
  CheckCircle,
  Build,
  Done,
  Close,
  Update,
  ReportProblem, // BỔ SUNG: Import icon cho "Có sự cố"
} from "@mui/icons-material";

interface StatusStep {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  dotColor: string;
}

const STATUS_TIMELINE: Record<string, StatusStep> = {
  "Chờ xác nhận": {
    key: "waiting",
    label: "Chờ xác nhận",
    icon: EventNote,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    dotColor: "bg-amber-500",
  },
  "Đã xác nhận": {
    key: "confirmed",
    label: "Đã xác nhận",
    icon: CheckCircle,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    dotColor: "bg-blue-500",
  },
  "Đang thực hiện": {
    key: "processing",
    label: "Đang thực hiện",
    icon: Build,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    dotColor: "bg-purple-500",
  },
  // BỔ SUNG: Cấu hình trạng thái "Có sự cố"
  "Có sự cố": {
    key: "issue",
    label: "Có sự cố",
    icon: ReportProblem,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    dotColor: "bg-orange-500",
  },
  "Hoàn thành": {
    key: "completed",
    label: "Hoàn thành",
    icon: Done,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    dotColor: "bg-emerald-500",
  },
  "Hủy đơn": {
    key: "cancelled",
    label: "Hủy đơn",
    icon: Close,
    color: "text-red-700",
    bgColor: "bg-red-50",
    dotColor: "bg-red-500",
  },
};

const DEFAULT_STEP_CONFIG: Omit<StatusStep, "label" | "key"> = {
  icon: Update,
  color: "text-slate-700",
  bgColor: "bg-slate-100",
  dotColor: "bg-slate-400",
};

interface OrderStatusTimelineProps {
  currentStatus: string;
  statusTimes?: Record<string, string>;
  lichSuTrangThai?: { trangThai: string; thoiGian: string }[];
  orderDate?: string;
  completedDate?: string;
  cancelledDate?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  statusTimes = {},
  lichSuTrangThai = [],
}) => {
  const hasHistory = lichSuTrangThai && lichSuTrangThai.length > 0;

  let renderItems: { status: string; time: string | null }[] = [];
  let currentIndex = 0;

  if (hasHistory) {
    const reversedHistory = [...lichSuTrangThai].reverse();
    renderItems = reversedHistory.map((h) => ({
      status: h.trangThai,
      time: h.thoiGian,
    }));
    currentIndex = renderItems.length - 1;
  } else {
    const normalSequence = [
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang thực hiện",
      "Hoàn thành",
    ];

    let statusSequence = normalSequence;

    // BỔ SUNG: Xử lý fallback cho cả "Hủy đơn" và "Có sự cố"
    if (currentStatus === "Hủy đơn" || currentStatus === "Có sự cố") {
      // Thông thường "Hủy đơn" hoặc "Có sự cố" diễn ra sau khi đã đặt đơn (có thể sau "Đã xác nhận" hoặc "Đang thực hiện")
      // Nếu không có lịch sử cụ thể, ta cắt chuỗi ở bước 2 (Đã xác nhận) và gắn trạng thái hiện tại vào cuối
      statusSequence = [...normalSequence.slice(0, 2), currentStatus];
    }

    currentIndex = statusSequence.indexOf(currentStatus);
    renderItems = statusSequence.map((s) => ({
      status: s,
      time: statusTimes[s] || null,
    }));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 py-4 px-6 w-full overflow-hidden">
      <h2 className="text-base font-bold text-slate-900 mb-4">
        Lịch sử trạng thái
      </h2>

      <div className="flex flex-row items-start justify-between w-full overflow-x-auto pt-2 pb-2 scrollbar-thin">
        {renderItems.map((item, index) => {
          const stepConfig = STATUS_TIMELINE[item.status] || {
            ...DEFAULT_STEP_CONFIG,
            label: item.status,
            key: `custom-${index}`,
          };

          const displayLabel =
            STATUS_TIMELINE[item.status]?.label || item.status;
          const StatusIcon = stepConfig.icon;

          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isLast = index === renderItems.length - 1;

          return (
            <div
              key={`${item.status}-${index}`}
              className="relative flex flex-col items-center flex-1 min-w-[90px] text-center"
            >
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 z-0 ${
                    isCompleted ? stepConfig.dotColor : "bg-slate-200"
                  }`}
                />
              )}

              {/* Status Icon Container */}
              <div
                className={`relative flex-shrink-0 w-10 h-10 aspect-square rounded-full flex items-center justify-center font-semibold z-10 shadow-sm transition-all duration-300 ${
                  isCurrent
                    ? `${stepConfig.bgColor} ${stepConfig.color} ring-4 ring-offset-2 ring-white`
                    : isCompleted
                      ? `${stepConfig.bgColor} ${stepConfig.color}`
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isCompleted ? (
                  <Done sx={{ fontSize: 20 }} />
                ) : (
                  <StatusIcon sx={{ fontSize: 20 }} />
                )}
              </div>

              {/* Content Wrapper */}
              <div className="mt-2.5 flex flex-col items-center px-1 z-10">
                <div
                  className={`font-semibold text-sm tracking-wide ${
                    isCurrent || isCompleted
                      ? stepConfig.color
                      : "text-slate-500"
                  }`}
                >
                  {displayLabel}
                </div>

                {item.time && (
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium whitespace-nowrap">
                    {item.time}
                  </div>
                )}

                {isCurrent && (
                  <div
                    className={`inline-block mt-1 px-2 py-0.5 ${stepConfig.bgColor} ${stepConfig.color} text-[10px] font-bold rounded-full whitespace-nowrap border border-current/10`}
                  >
                    Trạng thái hiện tại
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
