"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { tokenStore } from "@/services/api";

const menuItems = [
  {
    title: "Dashboard",
    path: "/staff/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: "Kiểm duyệt hồ sơ",
    path: "/staff/ho-so-cho-duyet",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Yêu cầu dịch vụ",
    path: "/staff/yeu-cau-dat-dich-vu",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "Khiếu nại",
    path: "/staff/khieu-nai",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 4h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    title: "Tài khoản",
    path: "/staff/tai-khoan",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function NavigationStaff() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    tokenStore.clearTokens();
    router.push("/staff/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-r from-indigo-600 to-violet-600 border-r border-indigo-500/50 flex flex-col shadow-xl shadow-indigo-900/20 z-40">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-md shrink-0 border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-wide">Homezy</p>
            <p className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider mt-0.5">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-3 text-[11px] font-bold text-indigo-200 uppercase tracking-widest">Menu Chính</p>
        {menuItems.map((item) => {
          const isActive =
            item.path === "/staff/dashboard"
              ? pathname === item.path
              : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group text-sm font-bold cursor-pointer relative overflow-hidden ${
                isActive
                  ? "bg-white text-indigo-700 shadow-md shadow-black/10"
                  : "text-indigo-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`shrink-0 transition-transform duration-300 ${
                  isActive
                    ? "text-indigo-600 scale-110"
                    : "text-indigo-300 group-hover:text-white group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="relative z-10">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 cursor-pointer group"
        >
          <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
