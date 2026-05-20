"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        name: "Tổng quan",
        path: "/admin/dashboard",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: "Người dùng",
        path: "/admin/users",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        name: "Dịch vụ",
        path: "/admin/services",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        name: "Thành phần DV",
        path: "/admin/service-components",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        name: "Kỹ năng",
        path: "/admin/skills",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        name: "Báo cáo",
        path: "/admin/reports",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/admin/sign-in");
    };

    const currentPage = menuItems.find((m) => m.path === pathname)?.name ?? "Admin";

    return (
        <div className="admin-container" style={{ 
            display: "flex", 
            height: "100vh", 
            background: "#f8fafc", 
            overflow: "hidden",
            fontFamily: "var(--font-inter), sans-serif"
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .admin-sidebar {
                        position: absolute !important;
                        z-index: 100 !important;
                        height: 100vh;
                        transform: translateX(-100%);
                    }
                    .admin-sidebar.open {
                        transform: translateX(0);
                    }
                    .admin-overlay {
                        display: block !important;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 90;
                    }
                    .mobile-toggle { display: block !important; }
                    .desktop-toggle { display: none !important; }
                }
                .mobile-toggle { display: none; }
                .admin-overlay { display: none; }
            `}</style>
            
            {/* Mobile Overlay */}
            <div className={`admin-overlay ${!collapsed ? "open" : ""}`} onClick={() => setCollapsed(true)} style={{ display: collapsed ? "none" : "block" }} />

            {/* ── Sidebar ── */}
            <aside 
                className={`gpu-accelerated admin-sidebar ${!collapsed ? "open" : ""}`}
                style={{
                    width: collapsed ? "70px" : "240px",
                    minWidth: collapsed ? "70px" : "240px",
                    background: "#ffffff",
                    borderRight: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 50,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}>

                {/* Logo */}
                <div style={{
                    height: "64px",
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid #f1f5f9",
                    flexShrink: 0,
                }}>
                    <div style={{
                        width: "32px", height: "32px", flexShrink: 0,
                        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 6px -1px rgb(30 27 75 / 0.3)",
                    }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Homezy</div>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Hệ thống quản trị</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
                    {!collapsed && (
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 12px", margin: 0 }}>
                            Quản lý chính
                        </p>
                    )}

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
                                    padding: collapsed ? "12px" : "10px 14px",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    borderRadius: "10px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: isActive ? "#eff6ff" : "transparent",
                                    color: isActive ? "#2563eb" : "#475569",
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: "14px",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                                        (e.currentTarget as HTMLElement).style.color = "#0f172a";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "#475569";
                                    }
                                }}
                            >
                                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8 }}>{item.icon}</span>
                                {!collapsed && <span>{item.name}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom: user + logout */}
                <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
                    {!collapsed && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 12px", borderRadius: "10px",
                            background: "#f8fafc",
                            marginBottom: "8px",
                        }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                                background: "#1e1b4b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Administrator</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>Admin cấp cao</div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Đăng xuất" : undefined}
                        style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            gap: "10px", padding: collapsed ? "12px" : "10px 14px",
                            borderRadius: "10px", border: "none", cursor: "pointer",
                            background: "transparent", color: "#ef4444",
                            fontSize: "14px", fontWeight: 600,
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>

                <button
                    className="desktop-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: "absolute", top: "50%", right: "-1px",
                        transform: "translateY(-50%)",
                        width: "20px", height: "48px",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderLeft: "none",
                        borderRadius: "0 8px 8px 0",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8",
                        zIndex: 60,
                        boxShadow: "4px 0 6px -1px rgb(0 0 0 / 0.05)",
                    }}
                >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                        style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </aside>

            {/* ── Main ── */}
            <div className="gpu-accelerated" style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* Topbar */}
                <header style={{
                    height: "64px",
                    background: "#fff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="mobile-toggle" onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#64748b", display: "none" }}>Admin</span>
                        <span style={{ fontSize: "14px", color: "#cbd5e1", display: "none" }}>/</span>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>{currentPage}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}>
                            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <div style={{ width: "1px", height: "20px", background: "#e2e8f0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 4px 0 rgb(30 27 75 / 0.2)",
                            }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: "auto", padding: "24px 16px" }}>
                    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}