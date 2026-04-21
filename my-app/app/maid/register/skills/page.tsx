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
  FormHelperText,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        // TỐI ƯU: Sử dụng api.get thay vì fetch thủ công
        // apiService sẽ tự động xử lý BaseURL, Token và bắt lỗi 401
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
    const isAlreadySelected = currentSkills.some((s: any) => s.id === skill.id);

    const newSkills = isAlreadySelected
      ? currentSkills.filter((s: any) => s.id !== skill.id)
      : [...currentSkills, { id: skill.id, name: skill.title }];

    updateSkills({ selectedSkills: newSkills });

    if (newSkills.length >= 3 && errors.skills) {
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    updateSkills({ experienceYears: e.target.value });

    if (errors.years) {
      setErrors((prev) => ({ ...prev, years: undefined }));
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateSkills({ experienceDesc: e.target.value });
  };

  const handleNextSubmit = () => {
    let isValid = true;
    const newErrors: { skills?: string; years?: string } = {};

    if (step4_skills.selectedSkills.length < 3) {
      newErrors.skills = `Vui lòng chọn ít nhất 3 kỹ năng (đã chọn ${step4_skills.selectedSkills.length}/3).`;
      isValid = false;
    }

    if (!step4_skills.experienceYears) {
      newErrors.years = "Vui lòng chọn số năm kinh nghiệm làm việc.";
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

            {/* PHẦN 1: KỸ NĂNG CỦA BẠN */}
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
                      const isSelected = step4_skills.selectedSkills.some(
                        (s: any) => s.id === skill.id,
                      );
                      const icon = ICON_MAP[skill.iconKey] || (
                        <MoreHorizOutlinedIcon />
                      );

                      return (
                        <div
                          key={skill.id}
                          onClick={() =>
                            toggleSkill({ id: skill.id, title: skill.title })
                          }
                          className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                            isSelected
                              ? "border-emerald-700 bg-white shadow-sm"
                              : errors.skills
                                ? "border-red-200 bg-red-50 hover:bg-red-100"
                                : "border-transparent bg-[#f8faf9] hover:bg-gray-100"
                          }`}
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
                      );
                    })}
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm font-medium mt-3">
                      {errors.skills}
                    </p>
                  )}
                </>
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
                    Số năm kinh nghiệm <span className="text-red-500">*</span>
                  </label>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={!!errors.years}
                  >
                    <Select
                      value={step4_skills.experienceYears}
                      onChange={handleSelectChange}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <span className="text-gray-400">
                          Chọn số năm kinh nghiệm
                        </span>
                      </MenuItem>
                      <MenuItem value="Chưa có kinh nghiệm">
                        Chưa có kinh nghiệm
                      </MenuItem>
                      <MenuItem value="Dưới 1 năm">Dưới 1 năm</MenuItem>
                      <MenuItem value="1 - 3 năm">1 - 3 năm</MenuItem>
                      <MenuItem value="3 - 5 năm">3 - 5 năm</MenuItem>
                      <MenuItem value="Trên 5 năm">Trên 5 năm</MenuItem>
                    </Select>
                    {errors.years && (
                      <FormHelperText>{errors.years}</FormHelperText>
                    )}
                  </FormControl>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mô tả chi tiết kinh nghiệm
                    </label>
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Không bắt buộc
                    </span>
                  </div>
                  <OutlinedInput
                    fullWidth
                    multiline
                    rows={4}
                    value={step4_skills.experienceDesc}
                    onChange={handleTextChange}
                    placeholder="Chia sẻ về các công việc bạn đã từng làm..."
                    className="font-medium text-gray-700 bg-[#eef2ed] rounded-lg [&>fieldset]:border-transparent hover:[&>fieldset]:border-emerald-700 focus-within:[&>fieldset]:border-emerald-700"
                  />
                </div>
              </div>
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
