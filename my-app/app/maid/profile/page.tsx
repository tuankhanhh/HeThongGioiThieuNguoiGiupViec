"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Sử dụng Grid2 cho MUI v6 tối ưu hơn
import {
  Save,
  ContactPhone,
  Engineering,
  PersonOutline,
} from "@mui/icons-material";

const SKILLS_LIST = [
  "Nấu ăn",
  "Chăm sóc trẻ em",
  "Chăm sóc người già",
  "Dọn dẹp nhà cửa",
  "Giặt ủi",
  "Chăm sóc thú cưng",
  "Sửa chữa điện nước cơ bản",
];

interface WorkerProfile {
  avatar: string;
  workerId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  skills: string[];
  experience: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export default function ProfileUpdate() {
  const [profile, setProfile] = useState<WorkerProfile>({
    avatar: "https://i.pravatar.cc/150?u=giupviecpro",
    workerId: "GV999",
    fullName: "Nguyễn Thị Tuyết Mai",
    phone: "0901 234 567",
    email: "tuyetmai.worker@gmail.com",
    address: "48 Cao Thắng, Quận Hải Châu, Đà Nẵng",
    skills: ["Dọn dẹp nhà cửa", "Nấu ăn"],
    experience:
      "3 năm giúp việc gia đình tại chung cư, có chứng chỉ nấu ăn cơ bản.",
    emergencyContact: "Trần Văn Hùng",
    emergencyPhone: "0988 777 666",
  });

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setProfile((prev) => ({
      ...prev,
      skills: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit Data:", profile);
    alert("Cập nhật thông tin thành công!");
  };

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
            sx={{
              fontWeight: 700,
              color: "#000000",
              mb: 3,
            }}
          >
            HỒ SƠ CÁ NHÂN
          </Typography>
          {/* Avatar Section */}
          <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
            <Avatar
              src={profile.avatar}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid #fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#000000" }}>
            {profile.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mã số: {profile.workerId}
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
            {/* Section 1: Thông tin cơ bản (Read-only) */}
            <Box>
              <SectionHeader
                icon={<PersonOutline fontSize="small" />}
                title="Thông tin cơ bản"
              />
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    label="Họ và tên"
                    value={profile.fullName}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Số điện thoại"
                    value={profile.phone}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    value={profile.email}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={disabledFieldStyle}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Địa chỉ thường trú"
                    value={profile.address}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={disabledFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Kỹ năng & Kinh nghiệm (Editable) */}
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
                    name="skills"
                    value={profile.skills}
                    onChange={handleSkillChange}
                    input={<OutlinedInput sx={{ borderRadius: 3 }} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
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
                    {SKILLS_LIST.map((skill) => (
                      <MenuItem key={skill} value={skill}>
                        {skill}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Kinh nghiệm làm việc"
                  name="experience"
                  value={profile.experience}
                  onChange={handleTextChange}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Mô tả kinh nghiệm của bạn..."
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
                    name="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    sx={inputFieldStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="SĐT khẩn cấp"
                    name="emergencyPhone"
                    value={profile.emergencyPhone}
                    onChange={handleTextChange}
                    fullWidth
                    required
                    sx={inputFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Action Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<Save />}
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
              Cập nhật hồ sơ
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

// Sub-component cho Header các mục
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

// Styles cho các input
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
