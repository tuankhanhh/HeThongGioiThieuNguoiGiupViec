// Status badge for hồ sơ (TrangThaiXacMinh)
const HOSO_STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  "Chờ duyệt":  { label: "Chờ duyệt",  cls: "bg-amber-50 text-amber-700 border border-amber-200",  dot: "bg-amber-400" },
  "Đã duyệt":   { label: "Đã duyệt",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "Từ chối":    { label: "Từ chối",    cls: "bg-red-50 text-red-700 border border-red-200",    dot: "bg-red-500" },
};

// Status badge for đơn dịch vụ
const DON_STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  "Chờ xác nhận":   { label: "Chờ xác nhận",   cls: "bg-amber-50 text-amber-700 border border-amber-200",     dot: "bg-amber-400" },
  "Đã xác nhận":    { label: "Đã xác nhận",    cls: "bg-blue-50 text-blue-700 border border-blue-200",        dot: "bg-blue-500" },
  "Đang thực hiện": { label: "Đang thực hiện", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200",  dot: "bg-indigo-500" },
  "Hoàn thành":     { label: "Hoàn thành",     cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "Có sự cố":       { label: "Có sự cố",       cls: "bg-orange-50 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
  "Hủy đơn":        { label: "Hủy đơn",        cls: "bg-red-50 text-red-700 border border-red-200",          dot: "bg-red-400" },
};

// Status badge for khiếu nại
const KHIEUNAI_STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  "Chưa xử lý":    { label: "Chưa xử lý",    cls: "bg-red-50 text-red-700 border border-red-200",           dot: "bg-red-400" },
  "Đang xử lý":    { label: "Đang xử lý",    cls: "bg-amber-50 text-amber-700 border border-amber-200",     dot: "bg-amber-400" },
  "Đã giải quyết": { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
};

interface StatusBadgeProps {
  status: string;
  type?: "hoSo" | "don" | "khieuNai";
}

export function StatusBadge({ status, type = "don" }: StatusBadgeProps) {
  const map = type === "hoSo" ? HOSO_STATUS_MAP : type === "khieuNai" ? KHIEUNAI_STATUS_MAP : DON_STATUS_MAP;
  const config = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold tracking-wide ${config.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default StatusBadge;
