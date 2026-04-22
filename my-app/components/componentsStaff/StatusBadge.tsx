// Status badge for hồ sơ (TrangThaiXacMinh)
const HOSO_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  "Chờ duyệt":  { label: "Chờ duyệt",  cls: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  "Đã duyệt":   { label: "Đã duyệt",   cls: "bg-green-100  text-green-700  border border-green-200"  },
  "Từ chối":    { label: "Từ chối",    cls: "bg-red-100    text-red-700    border border-red-200"    },
};

// Status badge for đơn dịch vụ
const DON_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  "Chờ xác nhận":   { label: "Chờ xác nhận",   cls: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  "Đã xác nhận":    { label: "Đã xác nhận",    cls: "bg-blue-100   text-blue-700   border border-blue-200"   },
  "Đang thực hiện": { label: "Đang thực hiện", cls: "bg-indigo-100 text-indigo-700 border border-indigo-200" },
  "Hoàn thành":     { label: "Hoàn thành",     cls: "bg-green-100  text-green-700  border border-green-200"  },
  "Có sự cố":       { label: "Có sự cố",       cls: "bg-orange-100 text-orange-700 border border-orange-200" },
  "Hủy đơn":        { label: "Hủy đơn",        cls: "bg-red-100    text-red-700    border border-red-200"    },
};

interface StatusBadgeProps {
  status: string;
  type?: "hoSo" | "don";
}

export function StatusBadge({ status, type = "don" }: StatusBadgeProps) {
  const map = type === "hoSo" ? HOSO_STATUS_MAP : DON_STATUS_MAP;
  const config = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.cls}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
