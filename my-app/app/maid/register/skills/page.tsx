"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  MenuItem,
  ThemeProvider,
  createTheme,
  Select,
  FormControl,
  Checkbox,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Icons
import StarsIcon from "@mui/icons-material/Stars";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ElderlyOutlinedIcon from "@mui/icons-material/ElderlyOutlined";
import IronOutlinedIcon from "@mui/icons-material/IronOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import RegistrationStepper from "@/components/componentsMaid/Stepper";
import {
  useRegistrationStore,
  SkillParams,
} from "@/store/useRegistrationStore";

// IMPORT apiService
import { api } from "@/services/api";
import { ROUTES } from "@/lib/routes";

const ICON_MAP: Record<string, React.ReactNode> = {
  cleaning: <CleaningServicesOutlinedIcon />,
  cooking: <SoupKitchenOutlinedIcon />,
  childcare: <SentimentSatisfiedAltOutlinedIcon />,
  eldercare: <ElderlyOutlinedIcon />,
  laundry: <IronOutlinedIcon />,
  other: <MoreHorizOutlinedIcon />,
};

const theme = createTheme({
  palette: {
    primary: { main: "#047857" },
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
});

export default function SkillsAndExperienceStep() {
  const router = useRouter();

  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState<{ skills?: string; years?: string }>({});

  const step4_skills = useRegistrationStore((state) => state.step4_skills);
  const updateSkills = useRegistrationStore((state) => state.updateSkills);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await api.get<any[]>("/KyNang/getAll");
        if (data) {
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

  const toggleSkill = (skill: { id: string; title: string }) => {
    const currentSkills = step4_skills.selectedSkills;
    const isAlreadySelected = currentSkills.some((s) => s.id === skill.id);

    // Mặc định kinh nghiệm là rỗng khi mới chọn kỹ năng
    const newSkills = isAlreadySelected
      ? currentSkills.filter((s) => s.id !== skill.id)
      : [
          ...currentSkills,
          { id: skill.id, name: skill.title, experienceYears: "" },
        ];

    updateSkills({ selectedSkills: newSkills });

    if (newSkills.length >= 3 && errors.skills) {
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  // Hàm cập nhật riêng số năm kinh nghiệm cho từng kỹ năng
  const updateSkillExperience = (skillId: string, years: string) => {
    const newSkills = step4_skills.selectedSkills.map((s) =>
      s.id === skillId ? { ...s, experienceYears: years } : s,
    );
    updateSkills({ selectedSkills: newSkills });

    if (errors.years) {
      setErrors((prev) => ({ ...prev, years: undefined }));
    }
  };

  const handleNextSubmit = () => {
    let isValid = true;
    const newErrors: { skills?: string; years?: string } = {};

    if (step4_skills.selectedSkills.length < 3) {
      newErrors.skills = `Vui lòng chọn ít nhất 3 kỹ năng (đã chọn ${step4_skills.selectedSkills.length}/3).`;
      isValid = false;
    }

    // Kiểm tra xem có kỹ năng nào đã chọn mà chưa nhập kinh nghiệm không
    const hasMissingExperience = step4_skills.selectedSkills.some(
      (skill) => !skill.experienceYears || skill.experienceYears === "",
    );

    if (hasMissingExperience && step4_skills.selectedSkills.length > 0) {
      newErrors.years =
        "Vui lòng chọn đầy đủ số năm kinh nghiệm cho các kỹ năng đã chọn.";
      isValid = false;
    }

    if (isValid) {
      router.push(ROUTES.MAID.REGISTER_CONFIRM);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <RegistrationStepper activeStep={2} />
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Kỹ năng và kinh nghiệm
              </h2>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <StarsIcon className="text-emerald-700" />
                <h3 className="text-xl font-bold text-gray-800">
                  Kỹ năng của bạn <span className="text-red-500">*</span>
                </h3>
              </div>

              {loading ? (
                <div className="flex justify-center p-10">
                  <CircularProgress size={40} color="primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dbSkills.map((skill) => {
                      const selectedSkillData =
                        step4_skills.selectedSkills.find(
                          (s) => s.id === skill.id,
                        );
                      const isSelected = !!selectedSkillData;
                      const icon = ICON_MAP[skill.iconKey] || (
                        <MoreHorizOutlinedIcon />
                      );
                      const isMissingExp =
                        isSelected &&
                        !selectedSkillData.experienceYears &&
                        errors.years;

                      return (
                        <div
                          key={skill.id}
                          className={`relative rounded-xl transition-all duration-200 border-2 ${
                            isSelected
                              ? "border-emerald-700 bg-white shadow-sm"
                              : errors.skills
                                ? "border-red-200 bg-red-50 hover:bg-red-100"
                                : "border-transparent bg-[#f8faf9] hover:bg-gray-100"
                          }`}
                        >
                          {/* Vùng Click Chọn Kỹ Năng */}
                          <div
                            className="flex items-start gap-4 p-4 cursor-pointer"
                            onClick={() =>
                              toggleSkill({ id: skill.id, title: skill.title })
                            }
                          >
                            <div
                              className={`mt-1 p-2 rounded-lg ${
                                isSelected
                                  ? "text-emerald-700"
                                  : "text-gray-500 bg-white"
                              }`}
                            >
                              {icon}
                            </div>

                            <div className="flex-1 pr-8">
                              <h4
                                className={`font-bold mb-1 ${
                                  isSelected
                                    ? "text-emerald-900"
                                    : "text-gray-800"
                                }`}
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

                          {/* Vùng Chọn Kinh Nghiệm (Chỉ hiện khi đã chọn kỹ năng) */}
                          {isSelected && (
                            <div className="px-4 pb-4 pl-[4.5rem]">
                              <FormControl
                                fullWidth
                                size="small"
                                error={!!isMissingExp}
                              >
                                <Select
                                  value={selectedSkillData.experienceYears}
                                  onChange={(e) =>
                                    updateSkillExperience(
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
                                  <MenuItem value="1 - 3 năm">
                                    1 - 3 năm
                                  </MenuItem>
                                  <MenuItem value="3 - 5 năm">
                                    3 - 5 năm
                                  </MenuItem>
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

                  {/* Hiển thị lỗi tổng quan */}
                  {errors.skills && (
                    <p className="text-red-500 text-sm font-medium mt-3">
                      {errors.skills}
                    </p>
                  )}
                  {errors.years && (
                    <p className="text-red-500 text-sm font-medium mt-3">
                      {errors.years}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <Link href={ROUTES.MAID.REGISTER_DOCUMENT}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-800 shadow-none px-6 py-2.5 normal-case rounded-lg font-semibold"
                >
                  Quay lại
                </Button>
              </Link>

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
