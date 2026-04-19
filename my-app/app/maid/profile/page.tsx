"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Avatar,
  Chip,
  OutlinedInput,
  MenuItem,
  FormControl,
  Select,
  Paper,
  Typography,
  Box,
  Divider,
  SelectChangeEvent,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Save,
  ContactPhone,
  Engineering,
  PersonOutline,
} from "@mui/icons-material";

// Khai báo Interface cho dữ liệu Kỹ năng từ API
interface SkillItem {
  id: string;
  title: string;
  desc?: string;
  iconKey?: string;
}

interface WorkerProfile {
  maNguoiDung: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  anhChanDung: string;
  kinhNghiem: string;
  moTaChiTietKinhNghiem: string;
  tenNguoiThan: string;
  sdtnguoiThan: string;
  danhSachKyNang: string[];
}

export default function ProfileUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Thêm state để chứa danh sách kỹ năng từ API
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);

  const [profile, setProfile] = useState<WorkerProfile>({
    maNguoiDung: "",
    hoTen: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
    anhChanDung: "",
    kinhNghiem: "Chưa có kinh nghiệm",
    moTaChiTietKinhNghiem: "",
    tenNguoiThan: "",
    sdtnguoiThan: "",
    danhSachKyNang: [],
  });

  // Gọi đồng thời API Profile và API Skills
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const baseUrl = "https://localhost:7095";

        const [profileRes, skillsRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/maid/profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${baseUrl}/api/KyNang/skills`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (skillsRes.ok) {
          const skillsData: SkillItem[] = await skillsRes.json();
          setSkillsList(skillsData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Lỗi kết nối API:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAllData();
  }, []);

  // --- CẬP NHẬT: Lọc chỉ cho phép nhập số cho trường sdtnguoiThan ---
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "sdtnguoiThan") {
      // Dùng regex thay thế tất cả ký tự không phải số (0-9) thành chuỗi rỗng
      const onlyNums = value.replace(/[^0-9]/g, "");

      // Giới hạn tối đa 10 số (phòng hờ trường hợp người dùng copy-paste chuỗi dài)
      if (onlyNums.length <= 10) {
        setProfile((prev) => ({ ...prev, [name]: onlyNums }));
      }
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setProfile((prev) => ({
      ...prev,
      danhSachKyNang: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleExperienceChange = (event: SelectChangeEvent<string>) => {
    setProfile((prev) => ({ ...prev, kinhNghiem: event.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- CẬP NHẬT: Kiểm tra độ dài trước khi gọi API ---
    if (profile.sdtnguoiThan.length > 0 && profile.sdtnguoiThan.length !== 10) {
      alert("Số điện thoại khẩn cấp phải bao gồm đúng 10 chữ số!");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const payload = {
        TenNguoiThan: profile.tenNguoiThan,
        SdtnguoiThan: profile.sdtnguoiThan,
        KinhNghiem: profile.kinhNghiem,
        MoTaChiTietKinhNghiem: profile.moTaChiTietKinhNghiem,
        DanhSachMaKyNang: profile.danhSachKyNang.map(
          (skill) => skill.split(" - ")[0],
        ),
      };

      const response = await fetch(
        "https://localhost:7095/api/v1/maid/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi cập nhật hồ sơ");
      }

      alert("Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Biến kiểm tra lỗi hiển thị UI cho số điện thoại
  const isPhoneError =
    profile.sdtnguoiThan.length > 0 && profile.sdtnguoiThan.length !== 10;

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid #eceff1",
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header Section */}
        <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fff" }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#000000", mb: 3 }}
          >
            HỒ SƠ CÁ NHÂN
          </Typography>
          <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
            <Avatar
              src={profile.anhChanDung}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid #fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#000000" }}>
            {profile.hoTen}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mã số: {profile.maNguoiDung}
          </Typography>
        </Box>

        <Divider />

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* Section 1: Thông tin cơ bản */}
            <Box>
              <SectionHeader
                icon={<PersonOutline fontSize="small" />}
                title="Thông tin cơ bản"
              />
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    label="Họ và tên"
                    value={profile.hoTen}
                    fullWidth
                    disabled
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Số điện thoại"
                    value={profile.soDienThoai}
                    fullWidth
                    disabled
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    value={profile.email}
                    fullWidth
                    disabled
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Địa chỉ thường trú"
                    value={profile.diaChi}
                    fullWidth
                    disabled
                    sx={disabledFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Kỹ năng & Kinh nghiệm */}
            <Box>
              <SectionHeader
                icon={<Engineering fontSize="small" />}
                title="Kỹ năng & Chuyên môn"
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <FormControl fullWidth>
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, fontWeight: 600, color: "#667085" }}
                  >
                    CÁC KỸ NĂNG CỦA BẠN
                  </Typography>
                  <Select
                    multiple
                    name="danhSachKyNang"
                    value={profile.danhSachKyNang}
                    onChange={handleSkillChange}
                    input={<OutlinedInput sx={{ borderRadius: 3 }} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value.split(" - ")[1] || value}
                            size="small"
                            sx={{
                              borderRadius: 1.5,
                              bgcolor: "#E3F2FD",
                              color: "#0D47A1",
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {skillsList.map((skill) => {
                      const skillString = `${skill.id} - ${skill.title}`;
                      return (
                        <MenuItem key={skill.id} value={skillString}>
                          {skillString}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={inputFieldStyle}>
                  <InputLabel id="kinh-nghiem-label">
                    Thời gian kinh nghiệm
                  </InputLabel>
                  <Select
                    labelId="kinh-nghiem-label"
                    id="kinh-nghiem-select"
                    name="kinhNghiem"
                    value={profile.kinhNghiem}
                    label="Thời gian kinh nghiệm"
                    onChange={handleExperienceChange}
                    displayEmpty
                  >
                    <MenuItem value="Chưa có kinh nghiệm">
                      Chưa có kinh nghiệm
                    </MenuItem>
                    <MenuItem value="Dưới 1 năm">Dưới 1 năm</MenuItem>
                    <MenuItem value="1 - 3 năm">1 - 3 năm</MenuItem>
                    <MenuItem value="3 - 5 năm">3 - 5 năm</MenuItem>
                    <MenuItem value="Trên 5 năm">Trên 5 năm</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Mô tả chi tiết kinh nghiệm"
                  name="moTaChiTietKinhNghiem"
                  value={profile.moTaChiTietKinhNghiem}
                  onChange={handleTextChange}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Mô tả chi tiết các công việc bạn từng làm..."
                  sx={inputFieldStyle}
                />
              </Box>
            </Box>

            {/* Section 3: Liên hệ khẩn cấp */}
            <Box>
              <SectionHeader
                icon={<ContactPhone fontSize="small" />}
                title="Liên hệ khẩn cấp"
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Tên người liên hệ"
                    name="tenNguoiThan"
                    value={profile.tenNguoiThan}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    sx={inputFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {/* --- CẬP NHẬT: Thêm inputProps và error handling --- */}
                  <TextField
                    label="SĐT khẩn cấp"
                    name="sdtnguoiThan"
                    value={profile.sdtnguoiThan}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    sx={inputFieldStyle}
                    // Thay inputProps bằng slotProps.htmlInput
                    slotProps={{
                      htmlInput: {
                        maxLength: 10,
                        inputMode: "numeric" as const,
                      },
                    }}
                    error={isPhoneError}
                    helperText={isPhoneError ? "Vui lòng nhập đủ 10 số" : ""}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Action Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || isPhoneError} // Chặn bấm nếu SĐT đang bị lỗi
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                bgcolor: "#007AFF",
                boxShadow: "0 4px 12px rgba(0, 122, 255, 0.24)",
                "&:hover": { bgcolor: "#0062cc" },
                mt: 2,
              }}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

// Sub-components & Styles
const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
    <Box
      sx={{
        display: "flex",
        color: "#007AFF",
        bgcolor: "#E3F2FD",
        p: 0.8,
        borderRadius: 2,
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1D2939" }}>
      {title}
    </Typography>
  </Box>
);

const disabledFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "#F9FAFB",
    "& fieldset": { borderColor: "#EAECF0" },
  },
  "& .MuiInputLabel-root": { color: "#667085" },
};

const inputFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    "&:hover fieldset": { borderColor: "#007AFF" },
  },
};
