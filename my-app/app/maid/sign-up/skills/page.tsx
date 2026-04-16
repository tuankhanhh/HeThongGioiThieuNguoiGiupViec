"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  OutlinedInput,
  MenuItem,
  ThemeProvider,
  createTheme,
  Select,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";

// Icons
import StarsIcon from "@mui/icons-material/Stars";
import WorkIcon from "@mui/icons-material/Work";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ElderlyOutlinedIcon from "@mui/icons-material/ElderlyOutlined";
import IronOutlinedIcon from "@mui/icons-material/IronOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import RegistrationStepper from "@/components/componentsMaid/Stepper";
import { useRegistrationStore } from "@/store/useRegistrationStore";

// 1. ICON MAP: Khớp nối chuỗi IconName từ DB với React Component
const ICON_MAP: Record<string, React.ReactNode> = {
  cleaning: <CleaningServicesOutlinedIcon />,
  cooking: <SoupKitchenOutlinedIcon />,
  childcare: <SentimentSatisfiedAltOutlinedIcon />,
  eldercare: <ElderlyOutlinedIcon />,
  laundry: <IronOutlinedIcon />,
  other: <MoreHorizOutlinedIcon />,
};

const theme = createTheme({
  palette: { primary: { main: "#047857" } },
  typography: { fontFamily: "inherit" },
});

export default function SkillsAndExperienceStep() {
  // 2. State cho dữ liệu từ API
  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const step4_skills = useRegistrationStore((state) => state.step4_skills);
  const updateSkills = useRegistrationStore((state) => state.updateSkills);

  // 3. Gọi API lấy danh sách kỹ năng
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          "https://localhost:7095/api/KyNang/skills",
        );
        if (response.ok) {
          const data = await response.json();
          setDbSkills(data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách kỹ năng từ DB:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (skillId: string) => {
    const currentSkills = step4_skills.selectedSkills;
    const newSkills = currentSkills.includes(skillId)
      ? currentSkills.filter((id) => id !== skillId)
      : [...currentSkills, skillId];
    updateSkills({ selectedSkills: newSkills });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateSkills({ experienceDesc: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    updateSkills({ experienceYears: e.target.value });
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <RegistrationStepper activeStep={3} />
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Kỹ năng và kinh nghiệm
              </h2>
            </div>

            {/* PHẦN 1: KỸ NĂNG CỦA BẠN (Lấy từ DB) */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <StarsIcon className="text-emerald-700" />
                <h3 className="text-xl font-bold text-gray-800">
                  Kỹ năng của bạn
                </h3>
              </div>

              {loading ? (
                <div className="flex justify-center p-10">
                  <CircularProgress size={40} color="primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbSkills.map((skill) => {
                    const isSelected = step4_skills.selectedSkills.includes(
                      skill.id,
                    );
                    // Lấy icon từ Map dựa trên tên DB trả về (iconKey)
                    const icon = ICON_MAP[skill.iconKey] || (
                      <MoreHorizOutlinedIcon />
                    );

                    return (
                      <div
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-emerald-700 bg-white shadow-sm"
                            : "border-transparent bg-[#f8faf9] hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`mt-1 p-2 rounded-lg ${isSelected ? "text-emerald-700" : "text-gray-500 bg-white"}`}
                        >
                          {icon}
                        </div>

                        <div className="flex-1 pr-8">
                          <h4
                            className={`font-bold mb-1 ${isSelected ? "text-emerald-900" : "text-gray-800"}`}
                          >
                            {skill.title}
                          </h4>
                          <p className="text-sm text-gray-500 leading-snug">
                            {skill.desc}
                          </p>
                        </div>

                        <div className="absolute top-4 right-4 pointer-events-none">
                          <Checkbox
                            checked={isSelected}
                            disableRipple
                            className="p-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PHẦN 2: KINH NGHIỆM LÀM VIỆC */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <WorkIcon className="text-emerald-700" />
                <h3 className="text-xl font-bold text-gray-800">
                  Kinh nghiệm làm việc
                </h3>
              </div>

              <div className="space-y-6">
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={step4_skills.experienceYears}
                      onChange={handleSelectChange}
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Mô tả chi tiết kinh nghiệm
                  </label>
                  <OutlinedInput
                    fullWidth
                    multiline
                    rows={4}
                    value={step4_skills.experienceDesc}
                    onChange={handleTextChange}
                    placeholder="Chia sẻ về các công việc bạn đã từng làm..."
                    className="font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <Link href="/maid/sign-up/document">
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-800 shadow-none px-6 py-2.5 normal-case rounded-lg font-semibold"
                >
                  Quay lại
                </Button>
              </Link>

              <Link href="/maid/sign-up/FinalSummary">
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
