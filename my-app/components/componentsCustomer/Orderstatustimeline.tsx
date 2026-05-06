"use client";

import React from "react";
import {
  EventNote,
  CheckCircle,
  Build,
  Done,
  Close,
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

interface OrderStatusTimelineProps {
  currentStatus: string;
  statusTimes?: Record<string, string>;
  orderDate?: string;
  completedDate?: string;
  cancelledDate?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  statusTimes = {},
  orderDate,
  completedDate,
  cancelledDate,
}) => {
  const getStatusSequence = () => {
    const normalSequence = [
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang thực hiện",
      "Hoàn thành",
    ];

    if (currentStatus === "Hủy đơn") {
      const cancelIndex =
        normalSequence.indexOf(currentStatus) === -1
          ? 1
          : normalSequence.indexOf(currentStatus);
      return [...normalSequence.slice(0, cancelIndex), "Hủy đơn"];
    }

    return normalSequence;
  };

  const statusSequence = getStatusSequence();
  const currentIndex = statusSequence.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Trạng thái đơn</h2>

      <div className="space-y-0">
        {statusSequence.map((status, index) => {
          const step = STATUS_TIMELINE[status];
          const StatusIcon = step.icon;
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isLast = index === statusSequence.length - 1;

          return (
            <div key={status} className="relative flex gap-5 pb-8 last:pb-0">
              {/* Connector Line (Trục dọc) */}
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-10 bottom-0 w-0.5 -ml-[0.5px] ${
                    isCompleted ? step.dotColor : "bg-slate-200"
                  }`}
                />
              )}

              {/* Status Icon/Dot */}
              <div
                className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 shadow-sm ${
                  isCurrent
                    ? `${step.bgColor} ${step.color} ring-4 ring-offset-1 ${step.bgColor}`
                    : isCompleted
                      ? `${step.bgColor} ${step.color}`
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isCompleted ? (
                  <Done sx={{ fontSize: 20 }} />
                ) : (
                  <StatusIcon sx={{ fontSize: 20 }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div
                  className={`font-semibold text-base ${
                    isCurrent || isCompleted ? step.color : "text-slate-500"
                  }`}
                >
                  {step.label}
                </div>

                {/* Thời gian */}
                {(isCompleted || isCurrent) && statusTimes[status] && (
                  <div className="text-sm text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                    {statusTimes[status]}
                  </div>
                )}

                {/* Badge trạng thái hiện tại */}
                {isCurrent && (
                  <div
                    className={`inline-block mt-2 px-3 py-1 ${step.bgColor} ${step.color} text-xs font-bold rounded-full`}
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
