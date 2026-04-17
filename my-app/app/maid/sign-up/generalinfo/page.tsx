"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  OutlinedInput,
  MenuItem,
  InputAdornment,
  ThemeProvider,
  createTheme,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WcIcon from "@mui/icons-material/Wc";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"; // Import lại Icon Địa chỉ
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RegistrationStepper from "@/components/componentsMaid/Stepper";
import Link from "next/link";

// Import store Zustand
import { useRegistrationStore } from "@/store/useRegistrationStore";

// Custom Theme MUI
const theme = createTheme({
  palette: {
    primary: {
      main: "#047857",
    },
  },
  typography: {
    fontFamily: "inherit",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#eef2ed",
          borderRadius: "0.5rem",
          "& fieldset": {
            borderColor: "transparent",
          },
          "&:hover fieldset": {
            borderColor: "#047857",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#047857",
            borderWidth: "1px",
          },
        },
      },
    },
  },
});

export default function RegistrationForm() {
  const step2_personal = useRegistrationStore((state) => state.step2_personal);
  const updatePersonal = useRegistrationStore((state) => state.updatePersonal);

  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const decodedToken = JSON.parse(jsonPayload);
        const extractedName = decodedToken.fullName || decodedToken.name;

        if (extractedName) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserName(extractedName);
        }
      } catch (error) {
        console.error("Không thể giải mã token:", error);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updatePersonal({ [name]: value } as any);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    updatePersonal({ [name]: value } as any);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <RegistrationStepper activeStep={0} />
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Thông tin cá nhân
              </h2>
              <p className="text-gray-500">
                Vui lòng cung cấp thông tin chính xác để hoàn tất hồ sơ đăng ký.
              </p>
            </div>

            <div className="space-y-6">
              {/* Row 1: Họ tên & Ngày sinh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ tên
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="fullName"
                    value={userName}
                    readOnly
                    placeholder="Đang tải dữ liệu..."
                    className="bg-gray-200 text-gray-600 cursor-not-allowed"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlineIcon className="text-gray-400" />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <OutlinedInput
                    fullWidth
                    type="date"
                    name="dob" // Đảm bảo trùng khớp với Store (hoặc đổi thành ngaySinh)
                    value={step2_personal.dob}
                    onChange={handleInputChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarTodayIcon
                          className="text-gray-500"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>

              {/* Row 2: Giới tính & Số CCCD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      name="gender"
                      value={step2_personal.gender}
                      onChange={handleSelectChange}
                      displayEmpty
                      renderValue={
                        step2_personal.gender !== ""
                          ? undefined
                          : () => (
                              <span className="text-gray-400">
                                Chọn giới tính
                              </span>
                            )
                      }
                      startAdornment={
                        <InputAdornment position="start">
                          <WcIcon className="text-gray-500" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số CCCD
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="idCard"
                    value={step2_personal.idCard}
                    onChange={handleInputChange}
                    placeholder="VD: 012345678912"
                    inputProps={{ maxLength: 12 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>

              {/* THÊM LẠI: Row 3 - Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ hiện tại
                </label>
                <OutlinedInput
                  fullWidth
                  name="address" // Đảm bảo khai báo lại "address" trong Zustand Store
                  value={step2_personal.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ cư trú của bạn (VD: 123 Lê Lợi, Quận 1, TP.HCM)"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon className="text-gray-500" />
                    </InputAdornment>
                  }
                />
              </div>

              {/* Divider */}
              <div className="pt-6 pb-2">
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider border-b pb-2">
                  Thông tin người thân
                </h3>
              </div>

              {/* Row 4: Người thân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người thân
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativeName"
                    value={step2_personal.relativeName}
                    onChange={handleInputChange}
                    placeholder="VD: Nguyễn Văn B"
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại người thân
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativePhone"
                    value={step2_personal.relativePhone}
                    onChange={handleInputChange}
                    placeholder="VD: 0900009991"
                    inputProps={{ maxLength: 10 }}
                    className="[&>fieldset]:border-emerald-300"
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon className="text-emerald-600" />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <div></div>
              <Link href="/maid/sign-up/document">
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-2.5 normal-case rounded-lg font-semibold shadow-md"
                >
                  Tiếp tục
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
