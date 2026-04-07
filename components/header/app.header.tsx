"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const primaryColor = "#009966";
  const secondaryColor = "#000000";

  // Lắng nghe sự kiện cuộn trang để đổi kiểu dáng header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 border-t-4 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-0"
          : "bg-white shadow-sm py-2"
      }`}
      style={{ borderTopColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo - Đã đổi thành Gradient để nổi bật hơn */}
        <Link
          href="/"
          className="text-3xl font-extrabold transition-transform duration-300 hover:scale-105 hover:rotate-1 tracking-tight"
        >
          <span className="bg-gradient-to-r from-[#009966] to-[#00d28c] bg-clip-text text-transparent">
            Homezy
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="hidden md:flex gap-8 font-medium"
          style={{ color: secondaryColor }}
        >
          {[
            { name: "Trang chủ", path: "/" },
            { name: "Dịch vụ", path: "/khachhang/dichvu" },
            { name: "Về chúng tôi", path: "/khachhang/about" },
            { name: "Liên hệ", path: "/khachhang/lienhe" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="relative transition-colors duration-300 py-2 group text-[15px]"
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = secondaryColor)
              }
            >
              {item.name}
              <span
                className="absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-300 w-0 group-hover:w-full"
                style={{ backgroundColor: primaryColor }}
              ></span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-4 items-center">
          <Link
            href="/khachhang/dangky"
            className="px-5 py-2.5 border-2 rounded-xl font-medium hover:scale-105 transition-all duration-300"
            style={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f9f0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Đăng ký
          </Link>

          <Link
            href="/khachhang/dangnhap"
            className="px-5 py-2.5 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,153,102,0.39)] hover:shadow-[0_6px_20px_rgba(0,153,102,0.23)]"
            style={{
              backgroundColor: primaryColor,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#008558")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColor)
            }
          >
            Đăng nhập
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none transition-transform duration-300 p-2 rounded-lg hover:bg-gray-100"
          style={{ color: secondaryColor }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className={`w-7 h-7 transition-transform duration-300 ${isMenuOpen ? "rotate-90 text-[#009966]" : ""}`}
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
        className={`md:hidden bg-white/95 backdrop-blur-lg border-t shadow-xl transition-all duration-500 ease-in-out absolute w-full ${
          isMenuOpen
            ? "max-h-[500px] opacity-100 py-2"
            : "max-h-0 opacity-0 overflow-hidden py-0"
        }`}
      >
        <nav
          className="flex flex-col gap-2 px-6 py-4 font-medium text-lg"
          style={{ color: secondaryColor }}
        >
          {[
            { name: "Trang chủ", path: "/" },
            { name: "Dịch vụ", path: "/khachhang/dichvu" },
            { name: "Về chúng tôi", path: "/khachhang/about" },
            { name: "Liên hệ", path: "/khachhang/lienhe" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = secondaryColor)
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3 px-10 pb-6 pt-2 border-t border-gray-100 mt-2">
          <Link
            href="/login"
            className="px-4 py-3 border-2 rounded-xl transition-all duration-300 text-center font-bold"
            style={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f9f0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Người thuê
          </Link>
          <Link
            href="/worker/register"
            className="px-4 py-3 text-white rounded-xl transition-all duration-300 text-center font-bold shadow-md"
            style={{
              backgroundColor: primaryColor,
            }}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#008558")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColor)
            }
          >
            Người giúp việc
          </Link>
        </div>
      </div>
    </header>
  );
}
