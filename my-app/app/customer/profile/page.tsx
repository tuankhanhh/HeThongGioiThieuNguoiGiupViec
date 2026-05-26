"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  OutlinedInput,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CircularProgress,
  FormHelperText,
  Snackbar,
  Alert,
} from "@mui/material";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SaveIcon from "@mui/icons-material/Save";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";

import api from "@/services/api";

// Cấu hình Theme Indigo Modern
const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5" }, // Indigo 600
    error: { main: "#ef4444" }, // Red 500
  },
  typography: { fontFamily: "inherit" },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          "& fieldset": { borderColor: "#f3f4f6" },
          "&:hover fieldset": { borderColor: "#4f46e5" },
          "&.Mui-focused fieldset": {
            borderColor: "#4f46e5",
            borderWidth: "1.5px",
          },
          "&.Mui-disabled": {
            backgroundColor: "#f9fafb",
            "& fieldset": { borderColor: "transparent" },
          },
        },
      },
    },
  },
});

interface CustomerProfile {
  hoTen: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
}

export default function CustomerProfilePage() {
  const [isFetching, setIsFetching] = useState(true);

  // ==========================================
  // STATE: THÔNG TIN HỒ SƠ
  // ==========================================
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>({
    hoTen: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
  });
  const [originalProfile, setOriginalProfile] =
    useState<CustomerProfile | null>(null);

  // State chung cho thông báo
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // 1. Fetch dữ liệu khách hàng
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<CustomerProfile>("/Customer/hoso");
        if (response) {
          setProfile({
            hoTen: response.hoTen || "",
            soDienThoai: response.soDienThoai || "",
            email: response.email || "",
            diaChi: response.diaChi || "",
          });
          setOriginalProfile(response);
        }
      } catch (error: any) {
        console.error("Lỗi kết nối API:", error.message);
        setToast({
          open: true,
          message: "Không thể tải dữ liệu hồ sơ.",
          severity: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  // ==========================================
  // HANDLERS: THÔNG TIN HỒ SƠ
  // ==========================================
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "soDienThoai") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10)
        setProfile((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isProfileValid =
    profile.hoTen.trim() !== "" &&
    profile.soDienThoai.length === 10 &&
    profile.diaChi.trim() !== "";

  const isPhoneError =
    profile.soDienThoai.length > 0 && profile.soDienThoai.length < 10;

  const hasProfileChanges = () => {
    if (!originalProfile) return false;
    return (
      profile.hoTen !== originalProfile.hoTen ||
      profile.soDienThoai !== originalProfile.soDienThoai ||
      profile.diaChi !== originalProfile.diaChi
    );
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isProfileValid || !hasProfileChanges()) return;
    setIsProfileLoading(true);

    try {
      await api.put("/Customer/update", {
        hoTen: profile.hoTen,
        soDienThoai: profile.soDienThoai,
        diaChi: profile.diaChi,
      });

      setOriginalProfile({ ...profile });
      setToast({
        open: true,
        message: "Cập nhật thông tin thành công!",
        severity: "success",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Đã xảy ra lỗi khi cập nhật thông tin.",
        severity: "error",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <CircularProgress color="primary" />
        <p className="mt-4 text-indigo-600 font-semibold animate-pulse">
          Đang kết nối dữ liệu khách hàng...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 flex justify-center font-sans items-start">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white text-center">
            <h1 className="text-2xl font-bold md:text-3xl">Quản Lý Hồ Sơ</h1>
            <p className="text-indigo-100 mt-2 text-sm md:text-base">
              Cập nhật thông tin cá nhân liên hệ của bạn
            </p>
          </div>

          <div className="p-6 md:p-12 space-y-12">
            {/* ================= FORM: THÔNG TIN CÁ NHÂN ================= */}
            <form onSubmit={handleProfileSubmit} className="space-y-8">
              <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                <ManageAccountsOutlinedIcon className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">
                  Thông tin cá nhân
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email (Read Only) */}
                <div className="md:col-span-2 opacity-80">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email đăng nhập
                  </label>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={profile.email}
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    }
                  />
                </div>

                {/* Họ Tên */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    required
                    name="hoTen"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={profile.hoTen}
                    onChange={handleProfileChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlineIcon
                          fontSize="small"
                          className="text-indigo-500"
                        />
                      </InputAdornment>
                    }
                  />
                </div>

                {/* Số điện thoại */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    required
                    name="soDienThoai"
                    placeholder="Nhập số điện thoại"
                    value={profile.soDienThoai}
                    onChange={handleProfileChange}
                    error={isPhoneError}
                    inputProps={{ maxLength: 10, inputMode: "numeric" }}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon
                          fontSize="small"
                          className={
                            isPhoneError ? "text-red-500" : "text-indigo-500"
                          }
                        />
                      </InputAdornment>
                    }
                  />
                  {isPhoneError && (
                    <FormHelperText error className="font-medium">
                      Số điện thoại bắt buộc phải đủ 10 chữ số
                    </FormHelperText>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Địa chỉ mặc định <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    name="diaChi"
                    placeholder="Nhập địa chỉ nhà cụ thể..."
                    value={profile.diaChi}
                    onChange={handleProfileChange}
                    startAdornment={
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                      >
                        <LocationOnOutlinedIcon
                          fontSize="small"
                          className="text-indigo-500"
                        />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    isProfileLoading || !isProfileValid || !hasProfileChanges()
                  }
                  startIcon={
                    isProfileLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{
                    textTransform: "none",
                    padding: "0.75rem 2rem",
                    borderRadius: "1rem",
                    fontWeight: "bold",
                    boxShadow: "none",
                  }}
                  className={`${
                    isProfileLoading || !isProfileValid || !hasProfileChanges()
                      ? "bg-slate-200 text-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isProfileLoading ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "1rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
