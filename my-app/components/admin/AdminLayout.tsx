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
        <div style={{ display: "flex", height: "100vh", background: "#f5f5f4", overflow: "hidden" }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: collapsed ? "60px" : "224px",
                minWidth: collapsed ? "60px" : "224px",
                background: "#fff",
                borderRight: "0.5px solid #e7e5e4",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.25s ease, min-width 0.25s ease",
                overflow: "hidden",
                position: "relative",
                zIndex: 10,
            }}>

                {/* Logo */}
                <div style={{
                    height: "56px",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderBottom: "0.5px solid #e7e5e4",
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: "28px", height: "28px", flexShrink: 0,
                        background: "#1e1b4b",
                        borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1c1917", letterSpacing: "-0.01em" }}>HomeCare</div>
                            <div style={{ fontSize: "10px", color: "#a8a29e", marginTop: "1px" }}>Admin Panel</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
                    {/* Section label */}
                    {!collapsed && (
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "#a8a29e", letterSpacing: "0.07em", textTransform: "uppercase", padding: "6px 8px 4px", margin: 0 }}>
                            Menu
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
                                    gap: "10px",
                                    padding: collapsed ? "9px" : "8px 10px",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    borderRadius: "7px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: isActive ? "#f0f0fe" : "transparent",
                                    color: isActive ? "#4338ca" : "#57534e",
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: "13px",
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    transition: "background 0.15s, color 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "#f5f5f4";
                                        (e.currentTarget as HTMLElement).style.color = "#1c1917";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "#57534e";
                                    }
                                }}
                            >
                                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                {!collapsed && <span>{item.name}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom: user + logout */}
                <div style={{ padding: "8px", borderTop: "0.5px solid #e7e5e4", flexShrink: 0 }}>
                    {/* User row */}
                    {!collapsed && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "9px",
                            padding: "8px 10px", borderRadius: "7px",
                            marginBottom: "4px",
                        }}>
                            <div style={{
                                width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                                background: "#1e1b4b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: "#1c1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Administrator</div>
                                <div style={{ fontSize: "10px", color: "#a8a29e" }}>Toàn quyền</div>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Đăng xuất" : undefined}
                        style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            gap: "9px", padding: collapsed ? "9px" : "8px 10px",
                            borderRadius: "7px", border: "none", cursor: "pointer",
                            background: "transparent", color: "#dc2626",
                            fontSize: "13px", fontWeight: 500,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>

                {/* Collapse toggle — dọc, gắn sát cạnh phải sidebar */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: "absolute", top: "50%", right: "-1px",
                        transform: "translateY(-50%)",
                        width: "18px", height: "40px",
                        background: "#fff",
                        border: "0.5px solid #e7e5e4",
                        borderLeft: "none",
                        borderRadius: "0 5px 5px 0",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#a8a29e",
                        zIndex: 20,
                        padding: 0,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f4"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                >
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </aside>

            {/* ── Main ── */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* Topbar */}
                <header style={{
                    height: "56px",
                    background: "#fff",
                    borderBottom: "0.5px solid #e7e5e4",
                    padding: "0 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}>
                    {/* Breadcrumb */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#a8a29e" }}>Admin</span>
                        <span style={{ fontSize: "12px", color: "#d6d3d1" }}>/</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#1c1917" }}>{currentPage}</span>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "11px", color: "#a8a29e" }}>
                            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <div style={{ width: "0.5px", height: "16px", background: "#e7e5e4" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                background: "#1e1b4b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1c1917" }}>Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}