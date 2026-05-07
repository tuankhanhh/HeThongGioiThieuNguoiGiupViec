interface ReasonTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  rows?: number;
  disabled?: boolean;
}

export default function ReasonTextarea({
  value,
  onChange,
  placeholder = "Nhập lý do...",
  error,
  label = "Lý do từ chối",
  rows = 4,
  disabled = false,
}: ReasonTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
        } text-slate-700 placeholder:text-slate-400`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
