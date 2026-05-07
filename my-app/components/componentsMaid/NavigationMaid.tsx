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
} from "@mui/icons-material";
import { ROUTES } from "@/lib/routes";
import { useEffect, useState } from "react"; // Thêm useState
import { api } from "@/services/api";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // State lưu trữ tên người dùng
  const [userName, setUserName] = useState("");

  // Gọi API /me để lấy thông tin người dùng
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response: any = await api.get("/User/me");
        // Lưu ý: Điều chỉnh 'response.data.name' tuỳ thuộc vào cấu trúc trả về thực tế của API của bạn
        const name = response.hoTen;
        setUserName(name);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Danh sách các mục chính
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

  // Hàm xử lý lấy 2 chữ cái đầu của tên
  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(" ");

    // Nếu tên có từ 2 chữ trở lên (VD: "Nguyễn Văn A" -> "NA")
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    // Nếu tên chỉ có 1 chữ (VD: "Admin" -> "AD")
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-green-600 tracking-tight">
          Homezy
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 px-4 space-y-1">
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
        {/* Nút Đăng xuất */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
        >
          <Logout className="text-red-400 group-hover:text-red-500" />
          <span className="text-sm font-medium cursor-pointer">Đăng xuất</span>
        </button>

        {/* Profile Stub */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {/* Hiển thị 2 chữ cái đầu */}
            {getInitials(userName) || "--"}
          </div>
          <div className="flex-1 min-w-0">
            {/* Hiển thị tên đầy đủ */}
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
  );
};

export default Sidebar;
