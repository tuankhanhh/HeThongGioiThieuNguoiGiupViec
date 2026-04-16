"use client";

import React, { useState } from "react";
import {
  Button,
  ThemeProvider,
  createTheme,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SendIcon from "@mui/icons-material/Send";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import RegistrationStepper from "@/components/componentsMaid/Stepper";

// 1. Import Store
import { useRegistrationStore } from "@/store/useRegistrationStore";

const theme = createTheme({
  palette: {
    primary: {
      main: "#047857",
    },
  },
  typography: {
    fontFamily: "inherit",
  },
});

// Từ điển dịch ID kỹ năng sang Label hiển thị
const SKILL_LABELS: Record<string, string> = {
  cleaning: "Dọn dẹp nhà",
  cooking: "Nấu ăn",
  childcare: "Chăm sóc trẻ",
  eldercare: "Chăm sóc người già",
  laundry: "Giặt ủi",
  other: "Khác",
};

// Component con để hiển thị từng mục thông tin cho gọn code
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="font-bold text-gray-900">
      {value || <span className="text-gray-400 italic">Chưa cập nhật</span>}
    </p>
  </div>
);

export default function FinalSummaryStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Lấy toàn bộ dữ liệu thật từ kho Zustand
  const { step1_phone, step2_personal, step3_docs, step4_skills, resetForm } =
    useRegistrationStore();

  // 3. Xử lý danh sách file động từ state step3_docs
  const uploadedFiles = Object.entries(step3_docs)
    .filter(([_, file]) => file !== null)
    .map(([key, file]) => {
      const f = file as File;
      return {
        id: key,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
        type: f.type.startsWith("image/") ? "image" : "pdf",
      };
    });

  // 4. HÀM XỬ LÝ GỬI API CHÍNH
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Nạp Text Data
      formData.append("phone", step1_phone);
      formData.append("fullName", step2_personal.fullName);
      formData.append("dob", step2_personal.dob);
      formData.append("gender", step2_personal.gender);
      formData.append("idCard", step2_personal.idCard);
      formData.append("address", step2_personal.address);
      formData.append("relativeName", step2_personal.relativeName);
      formData.append("relativePhone", step2_personal.relativePhone);
      formData.append("experienceYears", step4_skills.experienceYears);
      formData.append("experienceDesc", step4_skills.experienceDesc);
      formData.append("skills", JSON.stringify(step4_skills.selectedSkills));

      // Nạp File Data
      if (step3_docs.cccdFront)
        formData.append("cccdFront", step3_docs.cccdFront);
      if (step3_docs.cccdBack) formData.append("cccdBack", step3_docs.cccdBack);
      if (step3_docs.portrait) formData.append("portrait", step3_docs.portrait);
      if (step3_docs.residence)
        formData.append("residence", step3_docs.residence);
      // Gửi API
      const response = await fetch(
        "https://localhost:7095/api/v1/maid/register",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        alert("Gửi hồ sơ thành công! Đang chờ duyệt.");
        resetForm();
        router.push("/maid/success");
      } else {
        const errorData = await response.json();
        alert("Lỗi từ server: " + (errorData.message || "Không thể gửi hồ sơ"));
      }
    } catch (error) {
      console.error("Lỗi Network:", error);
      alert("Mất kết nối đến máy chủ. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <RegistrationStepper activeStep={4} />
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gửi hồ sơ
              </h2>
              <p className="text-gray-500">
                Vui lòng kiểm tra lại tất cả thông tin trước khi hoàn tất đăng
                ký.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* === HÀNG 1: THÔNG TIN CÁ NHÂN & KỸ NĂNG === */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Khối Thông tin cá nhân & Người thân (Chiếm 2 cột) */}
                <div className="md:col-span-2 border border-gray-100 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <PersonOutlineIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Thông tin cá nhân
                    </h3>
                  </div>

                  {/* Lưới thông tin cá nhân */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <InfoItem
                      label="Họ và tên"
                      value={step2_personal.fullName}
                    />
                    <InfoItem label="Số điện thoại" value={step1_phone} />
                    <InfoItem label="Ngày sinh" value={step2_personal.dob} />
                    <InfoItem label="Giới tính" value={step2_personal.gender} />
                    <InfoItem label="Số CCCD" value={step2_personal.idCard} />
                    <InfoItem
                      label="Địa chỉ hiện tại"
                      value={step2_personal.address}
                    />
                  </div>

                  {/* Phân cách Người thân */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">
                      Thông tin người thân
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4">
                      <InfoItem
                        label="Tên người thân"
                        value={step2_personal.relativeName}
                      />
                      <InfoItem
                        label="SĐT người thân"
                        value={step2_personal.relativePhone}
                      />
                    </div>
                  </div>
                </div>

                {/* Khối Kỹ năng (Chiếm 1 cột) */}
                <div className="md:col-span-1 bg-[#f4f9f7] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <VerifiedUserOutlinedIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Kỹ năng</h3>
                  </div>

                  <div className="flex flex-col items-start gap-3">
                    {step4_skills.selectedSkills.length > 0 ? (
                      step4_skills.selectedSkills.map((skillId, index) => (
                        <span
                          key={index}
                          className="bg-white text-emerald-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-emerald-100"
                        >
                          {SKILL_LABELS[skillId] || skillId}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Chưa chọn kỹ năng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* === HÀNG 2: KINH NGHIỆM LÀM VIỆC (MỚI) === */}
              <div className="border border-gray-100 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <WorkOutlineIcon fontSize="small" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Kinh nghiệm làm việc
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <InfoItem
                      label="Số năm kinh nghiệm"
                      value={step4_skills.experienceYears}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Mô tả chi tiết
                    </p>
                    {step4_skills.experienceDesc ? (
                      <p className="text-gray-800 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {step4_skills.experienceDesc}
                      </p>
                    ) : (
                      <span className="text-gray-400 italic">
                        Chưa cập nhật mô tả chi tiết.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* === HÀNG 3: TÀI LIỆU ĐÃ TẢI LÊN === */}
              <div className="bg-[#f4f9f7] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <DescriptionOutlinedIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Tài liệu đã tải lên
                    </h3>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {uploadedFiles.length} tệp tin
                  </span>
                </div>

                {uploadedFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm border border-gray-50 hover:shadow-md transition-shadow cursor-default"
                      >
                        <div className="text-emerald-600">
                          {doc.type === "image" ? (
                            <InsertPhotoOutlinedIcon fontSize="medium" />
                          ) : (
                            <PictureAsPdfOutlinedIcon fontSize="medium" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold text-gray-800 truncate"
                            title={doc.name}
                          >
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {doc.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Chưa có tài liệu nào được tải lên.
                  </p>
                )}
              </div>
            </div>

            {/* === FOOTER / ACTIONS === */}
            <div className="mt-10 flex flex-col items-center">
              <div className="bg-[#f4f9f7] text-emerald-800 px-5 py-2.5 rounded-full flex items-center gap-2 mb-8 border border-emerald-100 text-center">
                <InfoOutlinedIcon fontSize="small" className="flex-shrink-0" />
                <span className="text-sm font-medium">
                  Bằng cách gửi, bạn đồng ý với các Điều khoản & Chính sách của
                  GiúpViệc Pro.
                </span>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <Link href="/maid/sign-up/skills" className="w-full md:w-auto">
                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-[#eef2ed] hover:bg-[#e2e8e0] text-gray-800 shadow-none px-8 py-3 normal-case rounded-xl font-bold text-base"
                  >
                    Quay lại
                  </Button>
                </Link>

                <Button
                  variant="contained"
                  disabled={isSubmitting}
                  endIcon={
                    isSubmitting ? undefined : (
                      <SendIcon
                        sx={{ transform: "rotate(-30deg)", mb: "2px" }}
                      />
                    )
                  }
                  className={`w-full md:w-auto px-8 py-3 normal-case rounded-xl font-bold text-base shadow-md ${
                    isSubmitting
                      ? "bg-emerald-500"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" /> Đang gửi...
                    </span>
                  ) : (
                    "Gửi hồ sơ đăng ký"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
