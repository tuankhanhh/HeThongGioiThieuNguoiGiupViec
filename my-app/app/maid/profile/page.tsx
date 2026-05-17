"use client";

import React, { useState, useEffect } from "react";
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
  CircularProgress,
  FormHelperText,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";

// Icons Thông tin chung
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WcIcon from "@mui/icons-material/Wc";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import SaveIcon from "@mui/icons-material/Save";
import StarsIcon from "@mui/icons-material/Stars";

// Icons Kỹ năng
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ElderlyOutlinedIcon from "@mui/icons-material/ElderlyOutlined";
import IronOutlinedIcon from "@mui/icons-material/IronOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

import api from "@/services/api";

// Map Icon cho các kỹ năng từ DB
const ICON_MAP: Record<string, React.ReactNode> = {
  cleaning: <CleaningServicesOutlinedIcon />,
  cooking: <SoupKitchenOutlinedIcon />,
  childcare: <SentimentSatisfiedAltOutlinedIcon />,
  eldercare: <ElderlyOutlinedIcon />,
  laundry: <IronOutlinedIcon />,
  other: <MoreHorizOutlinedIcon />,
};

// Cấu hình Theme
const theme = createTheme({
  palette: {
    primary: { main: "#047857" },
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8faf9",
          borderRadius: "0.5rem",
          "& fieldset": { borderColor: "#e5e7eb" },
          "&:hover fieldset": { borderColor: "#047857" },
          "&.Mui-focused fieldset": {
            borderColor: "#047857",
            borderWidth: "1px",
          },
          "&.Mui-disabled": {
            backgroundColor: "#f3f4f6",
            "& fieldset": { borderColor: "transparent" },
          },
        },
      },
    },
  },
});

interface SkillItem {
  id: string;
  title: string;
  desc?: string;
  iconKey?: string;
}

// Cập nhật lại Interface theo Backend mới
interface SelectedSkill {
  maKyNang: string;
  kinhNghiem: string;
}

interface WorkerProfile {
  maNguoiDung: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  anhChanDung: string;
  tenNguoiThan: string;
  sdtnguoiThan: string;
  danhSachKyNang: SelectedSkill[]; // Chuyển từ mảng string sang mảng Object
}

export default function ProfileUpdatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const BACKEND_URL = "https://localhost:7095"; // Chú ý: Đổi URL nếu server bạn khác

  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [profile, setProfile] = useState<WorkerProfile>({
    maNguoiDung: "",
    hoTen: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
    anhChanDung: "",
    tenNguoiThan: "",
    sdtnguoiThan: "",
    danhSachKyNang: [],
  });

  const [originalProfile, setOriginalProfile] = useState<WorkerProfile | null>(
    null,
  );

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Hàm bóc tách dữ liệu kỹ năng từ chuỗi của C# trả về (Ví dụ: "Dọn dẹp nhà cửa (1 - 3 năm)")
  const parseBackendSkills = (
    backendSkills: any[],
    dbSkills: SkillItem[],
  ): SelectedSkill[] => {
    if (!backendSkills || !Array.isArray(backendSkills)) return [];

    return backendSkills
      .map((item) => {
        if (typeof item === "string") {
          // Tìm xem chuỗi có khớp với kỹ năng nào trong DB không
          const foundSkill = dbSkills.find(
            (s) =>
              item.toLowerCase().includes(s.title.toLowerCase()) ||
              item.includes(s.id),
          );

          // Tách lấy kinh nghiệm nằm trong dấu ngoặc đơn (...)
          const expMatch = item.match(/\(([^)]+)\)/);
          const exp = expMatch ? expMatch[1].trim() : "";

          return {
            maKyNang: foundSkill?.id || "",
            kinhNghiem: exp,
          };
        }
        // Đề phòng trường hợp C# trả về thẳng object luôn
        return {
          maKyNang: item.maKyNang || item.id,
          kinhNghiem: item.kinhNghiem || item.experienceYears || "",
        };
      })
      .filter((s) => s.maKyNang !== ""); // Lọc bỏ những kỹ năng không lấy được ID
  };

  // 1. Fetch Dữ liệu
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileData, skillsData] = await Promise.all([
          api.get<any>("/v1/hoso/profile"),
          api.get<SkillItem[]>("/KyNang/getAll"),
        ]);

        if (skillsData) setSkillsList(skillsData);
        if (profileData && skillsData) {
          const parsedSkills = parseBackendSkills(
            profileData.danhSachKyNang,
            skillsData,
          );

          const mappedProfile: WorkerProfile = {
            maNguoiDung: profileData.maNguoiDung || "",
            hoTen: profileData.hoTen || "",
            soDienThoai: profileData.soDienThoai || "",
            email: profileData.email || "",
            diaChi: profileData.diaChi || "",
            anhChanDung: profileData.anhChanDung || "",
            tenNguoiThan: profileData.tenNguoiThan || "",
            sdtnguoiThan: profileData.sdtnguoiThan || "",
            danhSachKyNang: parsedSkills,
          };

          setProfile(mappedProfile);
          setOriginalProfile(JSON.parse(JSON.stringify(mappedProfile)));
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
    fetchAllData();
  }, []);

  // 2. Handlers Thông tin cơ bản
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "sdtnguoiThan") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10)
        setProfile((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 3. Handlers Kỹ năng & Kinh nghiệm
  const toggleSkill = (skill: SkillItem) => {
    setProfile((prev) => {
      const currentSkills = prev.danhSachKyNang;
      const exists = currentSkills.find((s) => s.maKyNang === skill.id);

      if (exists) {
        return {
          ...prev,
          danhSachKyNang: currentSkills.filter((s) => s.maKyNang !== skill.id),
        };
      } else {
        return {
          ...prev,
          danhSachKyNang: [
            ...currentSkills,
            { maKyNang: skill.id, kinhNghiem: "" },
          ],
        };
      }
    });
  };

  const handleExperienceChange = (skillId: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      danhSachKyNang: prev.danhSachKyNang.map((s) =>
        s.maKyNang === skillId ? { ...s, kinhNghiem: value } : s,
      ),
    }));
  };

  // 4. Logic Validation & Kiểm tra thay đổi
  const isNameValid = profile.tenNguoiThan.trim() !== "";
  const isPhoneValid = profile.sdtnguoiThan.length === 10;

  // Mảng kỹ năng phải có ít nhất 3 cái VÀ tất cả đều phải chọn kinh nghiệm
  const isSkillsLengthValid = profile.danhSachKyNang.length >= 3;
  const isSkillsExpValid = profile.danhSachKyNang.every(
    (s) => s.kinhNghiem && s.kinhNghiem.trim() !== "",
  );
  const isSkillsValid = isSkillsLengthValid && isSkillsExpValid;

  const isFormValid = isNameValid && isPhoneValid && isSkillsValid;
  const isPhoneError = profile.sdtnguoiThan.length > 0 && !isPhoneValid;

  const checkChanges = () => {
    if (!originalProfile) return false;

    const currentData = {
      ten: profile.tenNguoiThan,
      sdt: profile.sdtnguoiThan,
      // Sắp xếp mảng để compare chính xác không bị sai do thứ tự click
      kyNang: [...profile.danhSachKyNang].sort((a, b) =>
        a.maKyNang.localeCompare(b.maKyNang),
      ),
    };

    const originalData = {
      ten: originalProfile.tenNguoiThan,
      sdt: originalProfile.sdtnguoiThan,
      kyNang: [...originalProfile.danhSachKyNang].sort((a, b) =>
        a.maKyNang.localeCompare(b.maKyNang),
      ),
    };

    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  const hasChanges = checkChanges();

  // 5. Submit Update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || !hasChanges) return;
    setIsLoading(true);

    try {
      const payload = {
        TenNguoiThan: profile.tenNguoiThan,
        SdtnguoiThan: profile.sdtnguoiThan,
        // Gửi DanhSachKyNang đúng chuẩn DTO mới
        DanhSachKyNang: profile.danhSachKyNang.map((s) => ({
          MaKyNang: s.maKyNang,
          KinhNghiem: s.kinhNghiem,
        })),
      };

      await api.put("/v1/hoso/update-profile", payload);

      setOriginalProfile(JSON.parse(JSON.stringify(profile)));
      setToast({
        open: true,
        message: "Cập nhật hồ sơ thành công!",
        severity: "success",
      });
    } catch (error: any) {
      console.error(error);
      setToast({
        open: true,
        message: error.message || "Đã xảy ra lỗi khi cập nhật hồ sơ",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <CircularProgress color="success" />
        <p className="mt-4 text-emerald-700 font-bold animate-pulse">
          Đang tải hồ sơ của bạn...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* HEADER PROFILE */}
          <div className="bg-emerald-700 p-8 text-center text-white">
            <div className="inline-block relative mb-4">
              <img
                src={
                  profile.anhChanDung && profile.anhChanDung.startsWith("/")
                    ? `${BACKEND_URL}${profile.anhChanDung}`
                    : profile.anhChanDung || "/avatar.png"
                }
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
              />
            </div>
            <h1 className="text-3xl font-bold">{profile.hoTen}</h1>
            <p className="text-emerald-100 mt-1 font-medium">
              Mã nhân viên: {profile.maNguoiDung}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            {/* SECTION 1: THÔNG TIN CƠ BẢN (CHỈ ĐỌC) */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <PersonOutlineIcon
                  className="text-emerald-700"
                  fontSize="large"
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  Thông tin cơ bản
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 pointer-events-none">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={profile.hoTen}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlineIcon />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={profile.soDienThoai}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={profile.email}
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailOutlinedIcon />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={profile.diaChi}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: KỸ NĂNG & KINH NGHIỆM */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <StarsIcon className="text-emerald-700" fontSize="large" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Kỹ năng & Kinh nghiệm
                </h2>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Chọn ít nhất 3 kỹ năng và cập nhật kinh nghiệm{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillsList.map((skill) => {
                    const selectedSkillData = profile.danhSachKyNang.find(
                      (s) => s.maKyNang === skill.id,
                    );
                    const isSelected = !!selectedSkillData;
                    const isMissingExp =
                      isSelected && !selectedSkillData.kinhNghiem;

                    return (
                      <div
                        key={skill.id}
                        className={`relative rounded-xl transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-emerald-700 bg-white shadow-sm"
                            : !isSkillsValid &&
                                profile.danhSachKyNang.length > 0
                              ? "border-red-200 bg-red-50 hover:bg-red-100"
                              : "border-transparent bg-[#f8faf9] hover:bg-gray-100"
                        }`}
                      >
                        {/* VÙNG CLICK CHỌN KỸ NĂNG */}
                        <div
                          onClick={() => toggleSkill(skill)}
                          className="flex items-start gap-4 p-4 cursor-pointer"
                        >
                          <div
                            className={`mt-1 p-2 rounded-lg ${isSelected ? "text-emerald-700" : "text-gray-500 bg-white"}`}
                          >
                            {ICON_MAP[skill.iconKey || "other"] || (
                              <MoreHorizOutlinedIcon />
                            )}
                          </div>
                          <div className="flex-1 pr-8">
                            <h4
                              className={`font-bold mb-1 ${isSelected ? "text-emerald-900" : "text-gray-800"}`}
                            >
                              {skill.title}
                            </h4>
                            <p className="text-sm text-gray-500 leading-snug">
                              {skill.desc || "Cung cấp dịch vụ chuyên nghiệp"}
                            </p>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            className="absolute top-4 right-4 p-0 pointer-events-none"
                            color="success"
                          />
                        </div>

                        {/* VÙNG CHỌN KINH NGHIỆM */}
                        {isSelected && (
                          <div className="px-4 pb-4 pl-[4.5rem]">
                            <FormControl
                              fullWidth
                              size="small"
                              error={isMissingExp}
                            >
                              <Select
                                value={selectedSkillData.kinhNghiem}
                                onChange={(e) =>
                                  handleExperienceChange(
                                    skill.id,
                                    e.target.value,
                                  )
                                }
                                displayEmpty
                                className="bg-white"
                              >
                                <MenuItem value="" disabled>
                                  <span className="text-gray-400">
                                    Chọn số năm kinh nghiệm
                                  </span>
                                </MenuItem>
                                <MenuItem value="Chưa có kinh nghiệm">
                                  Chưa có kinh nghiệm
                                </MenuItem>
                                <MenuItem value="Dưới 1 năm">
                                  Dưới 1 năm
                                </MenuItem>
                                <MenuItem value="1 - 3 năm">1 - 3 năm</MenuItem>
                                <MenuItem value="3 - 5 năm">3 - 5 năm</MenuItem>
                                <MenuItem value="Trên 5 năm">
                                  Trên 5 năm
                                </MenuItem>
                              </Select>
                              {isMissingExp && (
                                <FormHelperText>
                                  Vui lòng chọn số năm kinh nghiệm
                                </FormHelperText>
                              )}
                            </FormControl>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* HIỂN THỊ LỖI CHUNG */}
                {!isSkillsLengthValid && profile.danhSachKyNang.length > 0 && (
                  <p className="text-red-500 text-sm font-medium mt-3">
                    Vui lòng chọn thêm kỹ năng (cần ít nhất 3).
                  </p>
                )}
                {isSkillsLengthValid && !isSkillsExpValid && (
                  <p className="text-red-500 text-sm font-medium mt-3">
                    Vui lòng cung cấp kinh nghiệm cho tất cả các kỹ năng đã
                    chọn.
                  </p>
                )}
              </div>
            </section>

            {/* SECTION 3: LIÊN HỆ KHẨN CẤP */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <ContactPhoneOutlinedIcon
                  className="text-emerald-700"
                  fontSize="large"
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  Liên hệ khẩn cấp
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người thân <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    required
                    name="tenNguoiThan"
                    value={profile.tenNguoiThan}
                    onChange={handleTextChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại người thân{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    required
                    name="sdtnguoiThan"
                    value={profile.sdtnguoiThan}
                    onChange={handleTextChange}
                    error={isPhoneError}
                    inputProps={{ maxLength: 10, inputMode: "numeric" }}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon
                          className={
                            isPhoneError ? "text-red-500" : "text-emerald-600"
                          }
                        />
                      </InputAdornment>
                    }
                  />
                  {isPhoneError && (
                    <FormHelperText error>
                      Vui lòng nhập đủ 10 số
                    </FormHelperText>
                  )}
                </div>
              </div>
            </section>

            {/* ACTION BUTTON */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !isFormValid || !hasChanges}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                className={`px-10 py-3 rounded-xl font-bold shadow-md text-lg transition-colors ${
                  isLoading || !isFormValid || !hasChanges
                    ? "bg-gray-400"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {isLoading
                  ? "Đang lưu..."
                  : !hasChanges
                    ? "Chưa có thay đổi"
                    : "Cập nhật hồ sơ"}
              </Button>
            </div>
          </form>
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
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
