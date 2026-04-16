"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation"; // Thêm usePathname

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [user, setUser] = useState<{ avatar: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const avatarRef = useRef<HTMLDivElement>(null);

  const primaryColor = "#009966";
  const secondaryColor = "#000000";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const token = localStorage.getItem("accessToken");
    const avatar = localStorage.getItem("avatar");
    if (token) {
      setUser({ avatar: avatar || "/avatar.png" });
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setOpenAvatar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setOpenAvatar(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  // Danh sách menu dùng chung
  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Dịch vụ", path: "/customer/list-services" },
    { name: "Về chúng tôi", path: "/customer/about" },
    { name: "Liên hệ", path: "/customer/contact" },
  ];

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 border-t-4 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-0"
          : "bg-white shadow-sm py-2"
      }`}
      style={{ borderTopColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold hover:scale-105 transition-transform duration-300"
        >
          <span className="bg-gradient-to-r from-[#009966] to-[#00d28c] bg-clip-text text-transparent">
            Homezy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 font-medium">
          {navLinks.map((item) => {
            const isActive = pathname === item.path; // Kiểm tra trang hiện tại
            return (
              <Link
                key={item.name}
                href={item.path}
                className="relative py-2 text-[15px] transition-colors duration-300 group"
                style={{ color: isActive ? primaryColor : secondaryColor }}
              >
                {item.name}
                {/* Gạch chân: luôn hiện nếu isActive, nếu không thì hiện khi hover */}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] transition-all duration-300 rounded-full ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  style={{ backgroundColor: primaryColor }}
                ></span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex gap-4 items-center">
          {isMounted &&
            (!user ? (
              <>
                <Link
                  href="/customer/sign-up"
                  className="px-5 py-2.5 border-2 rounded-xl font-medium transition-all hover:bg-[#f0f9f0]"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Đăng ký
                </Link>
                <Link
                  href="/customer/sign-in"
                  className="px-5 py-2.5 text-white rounded-xl font-medium shadow-md transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Đăng nhập
                </Link>
              </>
            ) : (
              <div className="relative" ref={avatarRef}>
                <img
                  src={user.avatar}
                  className="w-10 h-10 rounded-full border-2 border-[#009966] cursor-pointer object-cover hover:scale-105 transition-all"
                  onClick={() => setOpenAvatar(!openAvatar)}
                  alt="avatar"
                />
                {openAvatar && (
                  <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl rounded-xl border py-2 animate-in fade-in zoom-in duration-200">
                    <Link
                      href="/customer/orders"
                      className={`block px-4 py-3 text-sm font-semibold hover:bg-[#f0f9f0] transition-colors ${pathname === "/customer/orders" ? "text-[#009966]" : "text-black"}`}
                      onClick={() => {
                        setOpenAvatar(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Lịch sử đơn đặt dịch vụ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: isMenuOpen ? primaryColor : secondaryColor }}
        >
          <svg
            className={`w-8 h-8 transition-transform duration-300 ${isMenuOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-[600px] border-b shadow-lg" : "max-h-0"}`}
      >
        <nav className="flex flex-col p-4 gap-1">
          {isMounted && user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#f0f9f0] rounded-xl border border-green-100">
              <img
                src={user.avatar}
                className="w-12 h-12 rounded-full border-2 border-[#009966] object-cover"
                alt="user"
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Xin chào,</span>
                <span className="font-bold text-[#009966]">
                  Thành viên Homezy
                </span>
              </div>
            </div>
          )}

          {navLinks.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? "bg-[#f0f9f0] text-[#009966]" : "text-black hover:bg-gray-50"}`}
                onClick={() => setIsMenuOpen(false)}
                style={{ color: isActive ? primaryColor : secondaryColor }}
              >
                {item.name}
              </Link>
            );
          })}

          {isMounted && user && (
            <Link
              href="/customer/orders"
              className={`px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === "/customer/orders" ? "bg-[#f0f9f0] text-[#009966]" : "text-black hover:bg-gray-50"}`}
              onClick={() => setIsMenuOpen(false)}
              style={{
                color:
                  pathname === "/customer/orders"
                    ? primaryColor
                    : secondaryColor,
              }}
            >
              Lịch sử đơn hàng
            </Link>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            {isMounted &&
              (!user ? (
                <>
                  <Link
                    href="/customer/sign-up"
                    className="w-full py-3.5 border-2 rounded-xl text-center font-bold"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                  <Link
                    href="/customer/sign-in"
                    className="w-full py-3.5 text-white rounded-xl text-center font-bold shadow-md"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100"
                >
                  Đăng xuất
                </button>
              ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
