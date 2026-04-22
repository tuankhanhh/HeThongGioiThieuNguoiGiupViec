"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Tổng quan",
      path: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Người dùng",
      path: "/admin/users",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Dịch vụ",
      path: "/admin/services",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Báo cáo",
      path: "/admin/reports",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/admin/sign-in");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f2f8", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "72px" : "260px",
          minWidth: collapsed ? "72px" : "260px",
          background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 24px rgba(49, 46, 129, 0.35)",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #818cf8, #c084fc)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(129,140,248,0.4)",
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <h1 style={{ color: "#fff", fontWeight: 700, fontSize: "16px", lineHeight: 1.2, margin: 0 }}>
                HomeCare Admin
              </h1>
              <p style={{ color: "rgba(165,180,252,0.8)", fontSize: "11px", margin: 0, marginTop: "2px" }}>
                Quản trị hệ thống
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            top: "28px",
            right: "-12px",
            width: "24px",
            height: "24px",
            background: "linear-gradient(135deg, #818cf8, #c084fc)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 20,
            transition: "transform 0.3s",
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                title={collapsed ? item.name : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(129,140,248,0.35), rgba(192,132,252,0.2))"
                    : "transparent",
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(129,140,248,0.4)" : "none",
                  color: isActive ? "#c7d2fe" : "rgba(199,210,254,0.6)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "14px",
                  textAlign: "left",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "#e0e7ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(199,210,254,0.6)";
                  }
                }}
              >
                <span style={{ color: isActive ? "#818cf8" : "inherit" }}>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!collapsed && (
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #818cf8, #c084fc)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div style={{ color: "#e0e7ff", fontSize: "13px", fontWeight: 600 }}>Administrator</div>
                <div style={{ color: "rgba(165,180,252,0.7)", fontSize: "11px" }}>Toàn quyền truy cập</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Đăng xuất" : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "rgba(239,68,68,0.12)",
              color: "#fca5a5",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.25)";
              (e.currentTarget as HTMLElement).style.color = "#fecaca";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#fca5a5";
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top Header Bar */}
        <header
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            boxShadow: "0 1px 12px rgba(99,102,241,0.08)",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#6366f1", fontSize: "13px", fontWeight: 500 }}>
              {menuItems.find((m) => m.path === pathname)?.name ?? "Admin"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#1e1b4b", fontSize: "13px", fontWeight: 600 }}>Administrator</div>
              <div style={{ color: "#6b7280", fontSize: "11px" }}>
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
              </div>
            </div>
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #818cf8, #c084fc)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
