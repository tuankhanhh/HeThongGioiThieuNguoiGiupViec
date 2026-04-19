"use client";

import Link from "next/link";

// ─── CompanyInfo ──────────────────────────────────────────────────────────────
function CompanyInfo() {
  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-white font-bold text-lg">
          H
        </div>
        <Link href="/">
          <span className="text-white font-bold text-xl font-display cursor-pointer">
            Homezy
          </span>
        </Link>
      </div>

      <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
        Nền tảng kết nối người giúp việc uy tín hàng đầu tại Việt Nam. An toàn –
        Chuyên nghiệp – Tiện lợi.
      </p>

      {/* Contact details */}
      <div className="space-y-2 text-sm text-stone-400">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Số 1 Phạm Viết Chánh, Cẩm Lệ, Đà Nẵng</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <a
            href="tel:19001234"
            className="hover:text-amber-400 transition-colors"
          >
            0332711675
          </a>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <a
            href="mailto:hello@giupviecpro.vn"
            className="hover:text-amber-400 transition-colors"
          >
            ttuankhanh4@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── FooterLinks ─────────────────────────────────────────────────────────────
interface LinkColumn {
  title: string;
  links: { label: string; href: string }[];
}

const linkColumns: LinkColumn[] = [
  {
    title: "Dịch vụ",
    links: [
      { label: "Dọn nhà", href: "/services/cleaning" },
      { label: "Nấu ăn", href: "/services/cooking" },
      { label: "Chăm sóc trẻ", href: "/services/childcare" },
      { label: "Chăm sóc người già", href: "/services/eldercare" },
    ],
  },
  {
    title: "Homezy",
    links: [
      { label: "Về chúng tôi", href: "/customer/about" },
      { label: "Câu hỏi thường gặp", href: "/faq" },
      { label: "Liên hệ", href: "/customer/contact" },
      { label: "Kênh người giúp việc", href: "/maid/sign-in" },
      { label: "Kênh nhân viên", href: "/staff/sign-in" },
      { label: "Kênh quản trị viên", href: "/admin/sign-in" },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Điều khoản sử dụng", href: "/terms" },
      { label: "Chính sách hoàn tiền", href: "/refund" },
      { label: "Dành cho đối tác", href: "/partner" },
    ],
  },
];

function FooterLinks() {
  return (
    <>
      {linkColumns.map((col) => (
        <div key={col.title}>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
            {col.title}
          </h4>
          <ul className="space-y-2.5">
            {col.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-stone-400 text-sm hover:text-amber-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

// ─── SocialLinks ──────────────────────────────────────────────────────────────
function SocialLinks() {
  const socials = [
    {
      label: "Facebook",
      href: "https://facebook.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      label: "Zalo",
      href: "https://zalo.me",
      icon: <span className="text-xs font-bold leading-none">Zalo</span>,
    },
    {
      label: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
          <polygon
            fill="white"
            points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
          />
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "https://tiktok.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.67a8.16 8.16 0 004.77 1.52V7.75a4.85 4.85 0 01-1-.06z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {socials.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="w-9 h-9 rounded-full bg-stone-700 hover:bg-amber-400 flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
}

// ─── AppDownloadButtons ───────────────────────────────────────────────────────
function AppDownloadButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href="#app-store"
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 transition-colors duration-200"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <div>
          <p className="text-stone-400 text-xs">Tải trên</p>
          <p className="text-white font-semibold text-sm">App Store</p>
        </div>
      </a>
      <a
        href="#google-play"
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 transition-colors duration-200"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
        </svg>
        <div>
          <p className="text-stone-400 text-xs">Tải trên</p>
          <p className="text-white font-semibold text-sm">Google Play</p>
        </div>
      </a>
    </div>
  );
}

// ─── Footer (main export) ─────────────────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900">
      {/* Top section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column - takes 2 columns */}
          <div className="lg:col-span-2">
            <CompanyInfo />

            {/* App download */}
            <div className="mt-6">
              <p className="text-stone-500 text-xs uppercase tracking-widest mb-3 font-semibold">
                Tải ứng dụng
              </p>
              <AppDownloadButtons />
            </div>
          </div>

          {/* Links columns */}
          <FooterLinks />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm text-center sm:text-left">
            © {currentYear} Homezy . Bảo lưu mọi quyền.
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
