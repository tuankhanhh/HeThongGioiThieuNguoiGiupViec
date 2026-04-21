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
  FormHelperText,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WcIcon from "@mui/icons-material/Wc";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RegistrationStepper from "@/components/componentsMaid/Stepper";

// Import useRouter để chuyển trang bằng code
import { useRouter } from "next/navigation";

import { useRegistrationStore } from "@/store/useRegistrationStore";
import { ROUTES } from "@/lib/routes";
import { api } from "@/services/api";

const theme = createTheme({
  palette: {
    primary: {
      main: "#047857",
    },
    error: {
      main: "#d32f2f", // Màu đỏ cho lỗi
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
          "&.Mui-error fieldset": {
            borderColor: "#d32f2f", // Viền đỏ khi có lỗi
            borderWidth: "1px",
          },
        },
      },
    },
  },
});

interface UserMeResponse {
  maNguoiDung: string;
  hoTen: string;
  role: string;
}

export default function RegistrationForm() {
  const router = useRouter(); // Khởi tạo router
  const step2_personal = useRegistrationStore((state) => state.step2_personal);
  const updatePersonal = useRegistrationStore((state) => state.updatePersonal);

  const [userName, setUserName] = useState<string>("");
  // State lưu thông báo lỗi
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get<UserMeResponse>("/User/me");
        if (res && res.hoTen) {
          setUserName(res.hoTen);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng:", error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Ràng buộc chỉ cho phép nhập SỐ đối với CCCD và Số điện thoại ngay lúc gõ
    if (
      (name === "idCard" || name === "relativePhone") &&
      value !== "" &&
      !/^\d+$/.test(value)
    ) {
      return;
    }

    updatePersonal({ [name]: value } as any);

    // Xóa cảnh báo lỗi khi người dùng bắt đầu nhập lại trường đó
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    updatePersonal({ [name]: value } as any);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Hàm Validation
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    let isValid = true;

    // --- KIỂM TRA NGÀY SINH VÀ ĐỘ TUỔI ---
    if (!step2_personal.dob) {
      tempErrors.dob = "Vui lòng chọn ngày sinh.";
      isValid = false;
    } else {
      const dobDate = new Date(step2_personal.dob);
      const today = new Date();

      // Tính số tuổi
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();

      // Nếu tháng hiện tại nhỏ hơn tháng sinh, hoặc cùng tháng nhưng ngày hiện tại nhỏ hơn ngày sinh
      // => Tức là chưa tới sinh nhật trong năm nay => Trừ đi 1 tuổi
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        tempErrors.dob = "Bạn phải đủ 18 tuổi để đăng ký.";
        isValid = false;
      }
    }

    if (!step2_personal.gender) {
      tempErrors.gender = "Vui lòng chọn giới tính.";
      isValid = false;
    }

    if (!step2_personal.idCard) {
      tempErrors.idCard = "Vui lòng nhập số CCCD.";
      isValid = false;
    } else if (step2_personal.idCard.length !== 12) {
      tempErrors.idCard = "CCCD phải bao gồm đúng 12 chữ số.";
      isValid = false;
    }

    if (!step2_personal.address || step2_personal.address.trim() === "") {
      tempErrors.address = "Vui lòng nhập địa chỉ cư trú.";
      isValid = false;
    }

    if (
      !step2_personal.relativeName ||
      step2_personal.relativeName.trim() === ""
    ) {
      tempErrors.relativeName = "Vui lòng nhập tên người thân.";
      isValid = false;
    }

    if (!step2_personal.relativePhone) {
      tempErrors.relativePhone = "Vui lòng nhập số điện thoại.";
      isValid = false;
    } else if (step2_personal.relativePhone.length !== 10) {
      tempErrors.relativePhone = "Số điện thoại phải bao gồm đúng 10 chữ số.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Xử lý khi bấm nút "Tiếp tục"
  const handleNextSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Nếu hợp lệ thì mới chuyển trang
      router.push(ROUTES.MAID.REGISTER_DOCUMENT);
    }
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
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    type="date"
                    name="dob"
                    value={step2_personal.dob}
                    onChange={handleInputChange}
                    error={!!errors.dob}
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarTodayIcon
                          className="text-gray-500"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                  />
                  {errors.dob && (
                    <FormHelperText error>{errors.dob}</FormHelperText>
                  )}
                </div>
              </div>

              {/* Row 2: Giới tính & Số CCCD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={!!errors.gender}
                  >
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
                    {errors.gender && (
                      <FormHelperText>{errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="idCard"
                    value={step2_personal.idCard}
                    onChange={handleInputChange}
                    placeholder="VD: 012345678912"
                    inputProps={{ maxLength: 12 }}
                    error={!!errors.idCard}
                    startAdornment={
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                  {errors.idCard && (
                    <FormHelperText error>{errors.idCard}</FormHelperText>
                  )}
                </div>
              </div>

              {/* Row 3 - Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ hiện tại <span className="text-red-500">*</span>
                </label>
                <OutlinedInput
                  fullWidth
                  name="address"
                  value={step2_personal.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ cư trú của bạn (VD: 123 Lê Lợi, Quận 1, TP.HCM)"
                  error={!!errors.address}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon className="text-gray-500" />
                    </InputAdornment>
                  }
                />
                {errors.address && (
                  <FormHelperText error>{errors.address}</FormHelperText>
                )}
              </div>

              <div className="pt-6 pb-2">
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider border-b pb-2">
                  Thông tin người thân
                </h3>
              </div>

              {/* Row 4: Người thân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người thân <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativeName"
                    value={step2_personal.relativeName}
                    onChange={handleInputChange}
                    placeholder="VD: Nguyễn Văn B"
                    error={!!errors.relativeName}
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                  {errors.relativeName && (
                    <FormHelperText error>{errors.relativeName}</FormHelperText>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại người thân{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativePhone"
                    value={step2_personal.relativePhone}
                    onChange={handleInputChange}
                    placeholder="VD: 0900009991"
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.relativePhone}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon
                          className={
                            errors.relativePhone
                              ? "text-red-500"
                              : "text-emerald-600"
                          }
                        />
                      </InputAdornment>
                    }
                  />
                  {errors.relativePhone && (
                    <FormHelperText error>
                      {errors.relativePhone}
                    </FormHelperText>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <div></div>
              {/* Đã xóa <Link> và thay bằng sự kiện onClick cho Button */}
              <Button
                variant="contained"
                onClick={handleNextSubmit}
                endIcon={<ArrowForwardIcon />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-2.5 normal-case rounded-lg font-semibold shadow-md"
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
