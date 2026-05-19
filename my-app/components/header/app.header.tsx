"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, tokenStore } from "@/services/api";
import { ROUTES } from "@/lib/routes";

type UserInfo = {
  avatar: string;
  role: string;
  name: string;
};

export const navLinks = [
  { name: "Trang chủ", path: ROUTES.PUBLIC.HOME },
  { name: "Dịch vụ", path: ROUTES.PUBLIC.LIST_SERVICES },
  { name: "Về chúng tôi", path: ROUTES.PUBLIC.ABOUT },
  { name: "Liên hệ", path: ROUTES.PUBLIC.CONTACT },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const avatarRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = tokenStore.getAccessToken();

      if (!token) {
        setUser(null);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const avatar =
          typeof window !== "undefined"
            ? localStorage.getItem("avatar") || "/avatar.png"
            : "/avatar.png";

        const response: any = await api.get("/User/me");

        const userData = response?.data ?? response;

        setUser({
          avatar,
          role: userData?.role || userData?.Role || "",
          name: userData?.hoTen || userData?.HoTen || "Khách hàng",
        });
      } catch {
        tokenStore.clearTokens();
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!openAvatar) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setOpenAvatar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openAvatar]);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenAvatar(false);
  }, [pathname]);

  const handleLogout = useCallback(() => {
    tokenStore.clearTokens();
    setUser(null);
    setOpenAvatar(false);
    setIsMenuOpen(false);
    router.push("/");
  }, [router]);

  const renderAuthContent = (isMobile = false) => {
    if (!isMounted || isCheckingAuth) {
      return null;
    }

    if (!user) {
      return (
        <>
          <Link
            href={ROUTES.CUSTOMER.REGISTER}
            className={`px-5 py-2.5 border-2 border-[#009966] text-[#009966] rounded-xl font-medium hover:bg-[#f0f9f0] ${
              isMobile ? "w-full text-center" : ""
            }`}
          >
            Đăng ký
          </Link>
          <Link
            href={ROUTES.CUSTOMER.LOGIN}
            className={`px-5 py-2.5 bg-[#009966] text-white rounded-xl font-medium shadow-md hover:opacity-90 ${
              isMobile ? "w-full text-center" : ""
            }`}
          >
            Đăng nhập
          </Link>
        </>
      );
    }

    if (isMobile) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#f0f9f0] rounded-xl border border-green-100">
          <img
            src={user.avatar}
            className="w-12 h-12 rounded-full border-2 border-[#009966] object-cover"
            alt="Avatar"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500">Xin chào,</span>
            <span className="font-bold text-[#009966] truncate">
              {user.name}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative" ref={avatarRef}>
        <button
          type="button"
          onClick={() => setOpenAvatar((prev) => !prev)}
          className="block focus:outline-none"
          aria-label="Mở menu tài khoản"
        >
          <img
            src={user.avatar}
            className="w-10 h-10 rounded-full border-2 border-[#009966] cursor-pointer object-cover"
            alt="Avatar"
          />
        </button>

        {openAvatar && (
          <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl rounded-xl border py-2">
            <div className="px-4 py-2 border-b mb-1">
              <p className="text-xs text-gray-500">Xin chào,</p>
              <p className="font-bold text-[#009966] truncate">{user.name}</p>
            </div>

            {user.role === "Customer" && (
              <>
                <Link
                  href={ROUTES.CUSTOMER.HISTORY}
                  className="text-black block px-4 py-3 text-sm font-semibold hover:bg-[#f0f9f0]"
                  onClick={() => setOpenAvatar(false)}
                >
                  Lịch sử đơn hàng
                </Link>
                <Link
                  href={ROUTES.CUSTOMER.COMPLAINTS}
                  className="text-black block px-4 py-3 text-sm font-semibold hover:bg-[#f0f9f0]"
                  onClick={() => setOpenAvatar(false)}
                >
                  Lịch sử khiếu nại
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-medium cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 border-t-4 border-t-[#009966] ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-0"
          : "bg-white shadow-sm py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="text-3xl font-extrabold hover:scale-105 transition-transform"
        >
          <span className="bg-gradient-to-r from-[#009966] to-[#00d28c] bg-clip-text text-transparent">
            Homezy
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 font-medium">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`relative py-2 text-[15px] group ${
                pathname === item.path
                  ? "text-[#009966]"
                  : "text-black hover:text-[#009966]"
              }`}
            >
              {item.name}
              <span
                className={`absolute bottom-0 left-0 h-[3px] bg-[#009966] rounded-full transition-all ${
                  pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* DESKTOP AUTH */}
        <div className="hidden md:flex gap-4 items-center">
          {renderAuthContent(false)}
        </div>

        {/* MOBILE BTN */}
        <button
          className="md:hidden p-2 text-[#009966]"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Mở menu"
        >
          <svg
            className={`w-8 h-8 transition-transform ${
              isMenuOpen ? "rotate-90" : ""
            }`}
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

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`md:hidden bg-white overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-[600px] border-b shadow-lg" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col p-4 gap-1">
          {renderAuthContent(true)}

          {isMounted && user && (
            <div className="mt-2 border-t pt-2">
              {user.role === "Customer" && (
                <Link
                  href={ROUTES.CUSTOMER.HISTORY}
                  className="block px-4 py-3 text-sm font-semibold text-black hover:bg-[#f0f9f0] rounded-xl"
                >
                  Lịch sử đơn hàng
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-medium cursor-pointer rounded-xl"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
