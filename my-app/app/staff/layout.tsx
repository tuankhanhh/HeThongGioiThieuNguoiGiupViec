"use client";

import NavigationStaff from "@/components/componentsStaff/NavigationStaff";
import { usePathname } from "next/navigation";

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Không render sidebar ở trang login
  const isAuthPage = pathname === "/staff/login";

  return (
    <div className="min-h-screen flex bg-[#f4f7fe]">
      {!isAuthPage && <NavigationStaff />}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isAuthPage ? "ml-0" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
