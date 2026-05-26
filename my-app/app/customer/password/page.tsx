"use client";

import React, { useState } from "react";
import {
  Button,
  OutlinedInput,
  InputAdornment,
  IconButton,
  ThemeProvider,
  createTheme,
  CircularProgress,
  FormHelperText,
  Snackbar,
  Alert,
  FormControl,
} from "@mui/material";

// Icons
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import SaveIcon from "@mui/icons-material/Save";

import api from "@/services/api";

// Cấu hình Theme Indigo Modern đồng bộ với Profile
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
        },
      },
    },
  },
});

export default function CustomerChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  // States cho Form
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // States ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Xử lý thay đổi input
  const handleChange =
    (prop: keyof typeof passwords) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords({ ...passwords, [prop]: event.target.value });
    };

  // Toggle hiển thị mật khẩu
  const toggleVisibility = (prop: keyof typeof showPassword) => {
    setShowPassword({ ...showPassword, [prop]: !showPassword[prop] });
  };

  // Validation
  const isLengthValid = passwords.newPassword.length >= 6;
  const isMatchValid = passwords.newPassword === passwords.confirmPassword;
  const isFormFilled =
    passwords.currentPassword &&
    passwords.newPassword &&
    passwords.confirmPassword;
  const isFormValid = isFormFilled && isLengthValid && isMatchValid;

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const payload = {
        MatKhauCu: passwords.currentPassword,
        MatKhauMoi: passwords.newPassword,
      };

      // Đổi endpoint cho phù hợp với API backend của bạn
      await api.put("/Customer/change-password", payload);

      setToast({
        open: true,
        message: "Đổi mật khẩu thành công!",
        severity: "success",
      });

      // Reset form sau khi đổi thành công
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setToast({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 flex justify-center font-sans items-start mt-10">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* HEADER LAYER */}
          <div className="relative p-8 md:p-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <LockResetOutlinedIcon fontSize="large" />
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">Đổi Mật Khẩu</h1>
            <p className="text-indigo-100 mt-2 text-sm md:text-base">
              Bảo mật tài khoản của bạn bằng cách sử dụng mật khẩu mạnh
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            {/* MẬT KHẨU HIỆN TẠI */}
            <FormControl fullWidth variant="outlined">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <OutlinedInput
                type={showPassword.current ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={handleChange("currentPassword")}
                placeholder="Nhập mật khẩu đang sử dụng"
                startAdornment={
                  <InputAdornment position="start">
                    <KeyOutlinedIcon
                      fontSize="small"
                      className="text-indigo-500"
                    />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility("current")}
                      edge="end"
                    >
                      {showPassword.current ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <div className="border-t border-slate-100 my-4"></div>

            {/* MẬT KHẨU MỚI */}
            <FormControl
              fullWidth
              variant="outlined"
              error={passwords.newPassword.length > 0 && !isLengthValid}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <OutlinedInput
                type={showPassword.new ? "text" : "password"}
                value={passwords.newPassword}
                onChange={handleChange("newPassword")}
                placeholder="Nhập mật khẩu mới (Ít nhất 6 ký tự)"
                startAdornment={
                  <InputAdornment position="start">
                    <LockResetOutlinedIcon
                      fontSize="small"
                      className={
                        passwords.newPassword.length > 0 && !isLengthValid
                          ? "text-red-500"
                          : "text-indigo-500"
                      }
                    />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility("new")}
                      edge="end"
                    >
                      {showPassword.new ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {passwords.newPassword.length > 0 && !isLengthValid && (
                <FormHelperText error className="font-medium">
                  Mật khẩu phải có ít nhất 6 ký tự
                </FormHelperText>
              )}
            </FormControl>

            {/* XÁC NHẬN MẬT KHẨU MỚI */}
            <FormControl
              fullWidth
              variant="outlined"
              error={passwords.confirmPassword.length > 0 && !isMatchValid}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <OutlinedInput
                type={showPassword.confirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Nhập lại mật khẩu mới"
                startAdornment={
                  <InputAdornment position="start">
                    <LockResetOutlinedIcon
                      fontSize="small"
                      className={
                        passwords.confirmPassword.length > 0 && !isMatchValid
                          ? "text-red-500"
                          : "text-indigo-500"
                      }
                    />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleVisibility("confirm")}
                      edge="end"
                    >
                      {showPassword.confirm ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {passwords.confirmPassword.length > 0 && !isMatchValid && (
                <FormHelperText error className="font-medium">
                  Mật khẩu xác nhận không khớp
                </FormHelperText>
              )}
            </FormControl>

            {/* NÚT LƯU */}
            <div className="pt-6 flex justify-end">
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !isFormValid}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  padding: "0.75rem 2.5rem",
                  borderRadius: "1rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "none",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { boxShadow: "none" },
                }}
                className={`transition-all ${
                  isLoading || !isFormValid
                    ? "bg-slate-200 text-slate-400"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                }`}
              >
                {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* SNACKBAR THÔNG BÁO */}
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
