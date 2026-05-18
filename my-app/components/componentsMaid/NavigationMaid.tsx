"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AccountCircle,
  CalendarMonth,
  EventNote,
  History,
  Paid,
  Logout,
  Menu,
  Close,
} from "@mui/icons-material";
import { ROUTES } from "@/lib/routes";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // State lưu trữ tên người dùng và trạng thái Sidebar (Mobile)
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Gọi API lấy thông tin người dùng
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response: any = await api.get("/User/me");
        const name = response.hoTen;
        setUserName(name);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Tự động đóng Sidebar trên Mobile mỗi khi chuyển trang
  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    {
      title: "Hồ sơ cá nhân",
      path: ROUTES.MAID.PROFILE,
      icon: <AccountCircle />,
    },
    {
      title: "Lịch rảnh của tôi",
      path: ROUTES.MAID.FREE_SCHEDULE,
      icon: <CalendarMonth />,
    },
    {
      title: "Lịch làm việc",
      path: ROUTES.MAID.SCHEDULE,
      icon: <EventNote />,
    },
    {
      title: "Lịch sử công việc",
      path: ROUTES.MAID.WORK_HISTORY,
      icon: <History />,
    },
    {
      title: "Thu nhập",
      path: ROUTES.MAID.INCOME,
      icon: <Paid />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push(ROUTES.MAID.LOGIN);
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Nút Hamburger cho Mobile (Chỉ hiện trên màn hình nhỏ) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 focus:outline-none"
      >
        <Menu />
      </button>

      {/* Lớp phủ (Overlay) tối màu khi mở Sidebar trên Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Chính */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo / Brand & Nút Close cho Mobile */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-600 tracking-tight">
            Homezy
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Close />
          </button>
        </div>

        {/* Navigation Links */}
        {/* Thêm overflow-y-auto để cuộn mượt mà nếu màn hình quá thấp */}
        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Logout & Profile */}
        <div className="p-4 border-t border-gray-100 space-y-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <Logout className="text-red-400 group-hover:text-red-500" />
            <span className="text-sm font-medium cursor-pointer">
              Đăng xuất
            </span>
          </button>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {getInitials(userName) || "--"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName || "Đang tải..."}
              </p>
              <p className="text-xs text-green-500 font-medium">
                Đang trực tuyến
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
