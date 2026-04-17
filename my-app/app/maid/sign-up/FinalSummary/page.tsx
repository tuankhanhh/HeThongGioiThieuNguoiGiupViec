"use client";

import React, { useState, useEffect } from "react";
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

// Component con để hiển thị từng mục thông tin
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

  // State lưu thông tin User từ Token
  const [userInfo, setUserInfo] = useState({ name: "", id: "" });

  // 2. Lấy dữ liệu từ Zustand (Bỏ step1_account đi)
  const { step2_personal, step3_docs, step4_skills, resetForm } =
    useRegistrationStore();

  // 3. Giải mã Token khi trang vừa load
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

        // ClaimTypes.NameIdentifier trong .NET thường generate ra URL dài như dưới đây,
        // hoặc 'nameid', 'sub' tùy vào cấu hình
        const extractedId =
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ] ||
          decodedToken.nameid ||
          decodedToken.sub;

        const extractedName = decodedToken.fullName || decodedToken.name;

        setUserInfo({
          name: extractedName || "Người dùng",
          id: extractedId || "",
        });
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    } else {
      // Nếu không có token, đá văng ra trang login
      alert("Bạn chưa đăng nhập!");
      router.push("/login");
    }
  }, [router]);

  // Xử lý danh sách file hiển thị trên UI
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

  // 4. HÀM XỬ LÝ GỬI API HOÀN THIỆN HỒ SƠ
  const handleSubmit = async () => {
    if (!userInfo.id) {
      alert("Không tìm thấy mã người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc token đã hết hạn.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("MaNguoiGiupViec", userInfo.id);
      formData.append("SoCccd", step2_personal.idCard);
      formData.append("NgaySinh", step2_personal.dob);
      formData.append("GioiTinh", step2_personal.gender);
      formData.append("DiaChi", step2_personal.address);
      formData.append("TenNguoiThan", step2_personal.relativeName);
      formData.append("SdtnguoiThan", step2_personal.relativePhone);
      formData.append("KinhNghiem", String(step4_skills.experienceYears));
      formData.append("MoTaChiTietKinhNghiem", step4_skills.experienceDesc);

      step4_skills.selectedSkills.forEach((skill) => {
        formData.append("DanhSachMaKyNang", skill.id);
      });

      if (step3_docs.cccdFront)
        formData.append("FileAnhCccdmatTruoc", step3_docs.cccdFront);
      if (step3_docs.cccdBack)
        formData.append("FileAnhCccdmatSau", step3_docs.cccdBack);
      if (step3_docs.portrait)
        formData.append("FileAnhChanDung", step3_docs.portrait);
      if (step3_docs.residence)
        formData.append("FileAnhGiayXacNhanCuTru", step3_docs.residence);

      const response = await fetch(
        "https://localhost:7095/api/v1/maid/hoan-thien-ho-so",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const responseText = await response.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("Response không phải JSON:", responseText);
        alert(`HTTP ${response.status}: Máy chủ trả về dữ liệu không hợp lệ.`);
        return;
      }

      if (response.ok && (result as any).success) {
        alert("Gửi hồ sơ thành công!");
        resetForm();
        router.push("/maid/success");
      } else {
        alert("Lỗi: " + ((result as any).message || "Không thể gửi hồ sơ"));
      }
    } catch (error) {
      console.error("Lỗi Network:", error);
      alert("Kết nối máy chủ thất bại.");
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
              <RegistrationStepper activeStep={3} />
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
              {/* === THÔNG TIN CÁ NHÂN & KỸ NĂNG === */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 border border-gray-100 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <PersonOutlineIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Thông tin cá nhân
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <InfoItem label="Họ và tên" value={userInfo.name} />{" "}
                    {/* Dùng state userInfo */}
                    <InfoItem label="Ngày sinh" value={step2_personal.dob} />
                    <InfoItem label="Giới tính" value={step2_personal.gender} />
                    <InfoItem label="Số CCCD" value={step2_personal.idCard} />
                    <InfoItem label="Địa chỉ" value={step2_personal.address} />
                  </div>

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

                <div className="md:col-span-1 bg-[#f4f9f7] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <VerifiedUserOutlinedIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Kỹ năng</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step4_skills.selectedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-white text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-emerald-100"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* === KINH NGHIỆM === */}
              <div className="border border-gray-100 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <WorkOutlineIcon fontSize="small" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Kinh nghiệm
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <InfoItem
                      label="Số năm"
                      value={step4_skills.experienceYears}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Mô tả
                    </p>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                      {step4_skills.experienceDesc || "Chưa có mô tả."}
                    </p>
                  </div>
                </div>
              </div>

              {/* === TÀI LIỆU === */}
              <div className="bg-[#f4f9f7] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <DescriptionOutlinedIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Tài liệu đính kèm
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {uploadedFiles.length > 0 ? (
                    uploadedFiles.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-xl flex items-center gap-2 border border-gray-50"
                      >
                        {doc.type === "image" ? (
                          <InsertPhotoOutlinedIcon className="text-emerald-600" />
                        ) : (
                          <PictureAsPdfOutlinedIcon className="text-emerald-600" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {doc.size}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Chưa tải lên tài liệu nào.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Link href="/maid/sign-up/skills">
                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    className="bg-[#eef2ed] text-gray-800 px-8 py-3 rounded-xl font-bold shadow-none hover:bg-gray-200"
                  >
                    Quay lại
                  </Button>
                </Link>
                <Button
                  variant="contained"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  endIcon={!isSubmitting && <SendIcon />}
                  className={`px-8 py-3 rounded-xl font-bold shadow-md ${
                    isSubmitting
                      ? "bg-emerald-500"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Hoàn tất hồ sơ"
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
