/**
 * Phân quyền và quản lý đường dẫn theo vai trò người dùng
 */

export const ROUTES = {
  // Public - Ai cũng có thể vào
  PUBLIC: {
    HOME: "/",
    CONTACT: "/contact",
    ABOUT: "/about",
    LIST_SERVICES: "/list-services",
  },

  // Customer - Dành cho khách hàng
  CUSTOMER: {
    SERVICE_TYPE: "/customer/bookings/service-type",
    ADDRESS: "/customer/bookings/address",
    CHOOSE_TIME: "/customer/bookings/choose-time",
    PAYMENT: "/customer/bookings/payment",
    NOTICE: "/customer/bookings/notice",
    PROFILE: "/customer/profile",
    HISTORY: "/customer/history",
    COMPLAINTS: "/customer/complaint",
    LOGIN: "/customer/login",
    REGISTER: "/customer/register",
    PASSWORD: "/customer/password",
  },

  // Staff - Nhân viên văn phòng/điều hành
  STAFF: {
    LOGIN: "/staff/login",
    DASHBOARD: "/staff/dashboard",
    HO_SO_CHO_DUYET: "/staff/ho-so-cho-duyet",
    YEU_CAU_DAT_DICH_VU: "/staff/yeu-cau-dat-dich-vu",
    TAI_KHOAN: "/staff/tai-khoan",
  },

  // Maid - Người giúp việc
  MAID: {
    LOGIN: "/maid/login",
    REGISTER: "/maid/register",
    REGISTER_INFO: "/maid/register/info",
    REGISTER_DOCUMENT: "/maid/register/document",
    REGISTER_SKILL: "/maid/register/skills",
    REGISTER_CONFIRM: "/maid/register/confirm",
    REGISTER_STATUS: "/maid/register/status",
    REGISTER_UPDATE: "/maid/register/updateResume",
    DASHBOARD: "/maid/dashboard",
    SCHEDULE: "/maid/schedule",
    WORK_HISTORY: "/maid/work-history",
    FREE_SCHEDULE: "/maid/freeschedule",
    INCOME: "/maid/income",
    PROFILE: "/maid/profile",
  },

  // Admin - Quản trị viên hệ thống
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    LOGIN: "/admin/sign-in",
    USERS: "/admin/users",
    SERVICES: "/admin/services",
    PROFILES: "/admin/profiles",
    REPORTS: "/admin/reports",
  },
} as const;

export type AppRoutes = typeof ROUTES;
