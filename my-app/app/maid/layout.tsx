"use client"; // Bắt buộc vì dùng usePathname

import Sidebar from "@/components/componentsMaid/NavigationMaid";
import { ROUTES } from "@/lib/routes";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Kiểm tra xem có phải trang login/register không
  const isAuthPage =
    pathname.includes(ROUTES.MAID.LOGIN) ||
    pathname.includes(ROUTES.MAID.REGISTER);

  return (
    <div className="min-h-screen flex">
      {/* Chỉ hiện Sidebar nếu không phải trang Auth */}
      {!isAuthPage && <Sidebar />}

      <main
        className={`flex-1 transition-all duration-300 min-h-screen ${
          isAuthPage
            ? "ml-0 "
            : // Thay đổi responsive ở dòng dưới:
              "ml-0 md:ml-64 p-4 pt-16 md:p-6"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
