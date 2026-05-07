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
      <label className="block text-[13px] font-semibold text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30"
            : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-slate-300"
        } text-slate-700 placeholder:text-slate-400 leading-relaxed`}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
