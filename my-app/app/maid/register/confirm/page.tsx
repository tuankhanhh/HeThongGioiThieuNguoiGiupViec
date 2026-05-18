"use client";

import React, { useState, useEffect, useRef } from "react";
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
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SendIcon from "@mui/icons-material/Send";
import RegistrationStepper from "@/components/componentsMaid/Stepper";

// Import Store và API Service
import { useRegistrationStore } from "@/store/useRegistrationStore";
import { api } from "@/services/api";
import { ROUTES } from "@/lib/routes";

// IMPORT COMPONENT TOAST
import NotificationToast from "@/components/NotificationToast";

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

interface UserMeResponse {
  maNguoiDung: string;
  hoTen: string;
  role: string;
}

export default function FinalSummaryStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", id: "" });

  // 1. BIẾN CỜ CHẶN LỖI NHẢY TRANG
  const isSuccessRef = useRef(false);

  // 2. STATE QUẢN LÝ TOAST
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const { step2_personal, step3_docs, step4_skills, resetForm } =
    useRegistrationStore();

  useEffect(() => {
    // Chặn kiểm tra nếu đã gửi thành công
    if (isSuccessRef.current) return;

    // KIỂM TRA TOÀN VẸN DỮ LIỆU TỪ CÁC BƯỚC TRƯỚC
    const validateDataAndRedirect = () => {
      // Kiểm tra Bước 1: Thông tin cá nhân
      if (
        !step2_personal.dob ||
        !step2_personal.gender ||
        !step2_personal.idCard ||
        !step2_personal.address ||
        !step2_personal.relativeName ||
        !step2_personal.relativePhone
      ) {
        router.push(ROUTES.MAID.REGISTER_INFO);
        return false;
      }

      // Kiểm tra Bước 2: Tài liệu xác minh
      if (
        !step3_docs.cccdFront ||
        !step3_docs.cccdBack ||
        !step3_docs.portrait
      ) {
        router.push(ROUTES.MAID.REGISTER_DOCUMENT);
        return false;
      }

      // Kiểm tra Bước 3: Kỹ năng & Kinh nghiệm (Chỉ kiểm tra mảng kỹ năng)
      if (
        !step4_skills.selectedSkills ||
        step4_skills.selectedSkills.length < 3
      ) {
        router.push(ROUTES.MAID.REGISTER_SKILL);
        return false;
      }

      return true;
    };

    // GỌI API LẤY THÔNG TIN USER NẾU DỮ LIỆU ĐÃ ĐỦ
    if (validateDataAndRedirect()) {
      const fetchUser = async () => {
        try {
          const res = await api.get<UserMeResponse>("/User/me");
          if (res && res.maNguoiDung) {
            setUserInfo({ name: res.hoTen, id: res.maNguoiDung });
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin user:", error);
          showToast("Vui lòng đăng nhập lại để tiếp tục!", "warning");
          setTimeout(() => {
            router.push(ROUTES.MAID.LOGIN);
          }, 2000);
        }
      };

      fetchUser();
    }
  }, [router, step2_personal, step3_docs, step4_skills]);

  // Định nghĩa sẵn các key tài liệu và nhãn dán tiếng Việt cho đẹp
  const docLabels = {
    cccdFront: "CCCD Mặt trước",
    cccdBack: "CCCD Mặt sau",
    portrait: "Ảnh chân dung",
    residence: "Xác nhận cư trú",
  };

  // State để lưu trữ URL hình ảnh preview
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  // Effect để tạo và dọn dẹp URL preview cho hình ảnh
  useEffect(() => {
    const newPreviews: Record<string, string> = {};

    Object.entries(step3_docs).forEach(([key, file]) => {
      if (file instanceof File && file.type.startsWith("image/")) {
        newPreviews[key] = URL.createObjectURL(file);
      }
    });

    setFilePreviews(newPreviews);

    // Cleanup function để tránh memory leak
    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [step3_docs]);

  // Trích xuất và format dữ liệu an toàn
  const uploadedFiles = Object.entries(step3_docs)
    .filter(([key, file]) => {
      const isValidKey = Object.keys(docLabels).includes(key);
      return isValidKey && file !== null && file !== undefined;
    })
    .map(([key, file]: [string, any]) => {
      const isImage = file?.type ? file.type.startsWith("image/") : false;
      const isPdf = file?.type ? file.type.includes("pdf") : false;

      let formattedSize = "Chưa rõ";
      if (file?.size && !isNaN(file.size)) {
        const sizeInBytes = file.size;
        if (sizeInBytes < 1024 * 1024) {
          formattedSize = Math.round(sizeInBytes / 1024) + " KB";
        } else {
          formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + " MB";
        }
      }

      return {
        id: key,
        label: docLabels[key as keyof typeof docLabels],
        name: file?.name || "Tài liệu đã tải lên",
        size: formattedSize,
        type: isImage ? "image" : isPdf ? "pdf" : "other",
        previewUrl: isImage ? filePreviews[key] : null,
      };
    });

  // HÀM SUBMIT SỬ DỤNG API SERVICE
  const handleSubmit = async () => {
    if (!userInfo.id) {
      showToast(
        "Đang tải dữ liệu người dùng, vui lòng thử lại sau giây lát.",
        "info",
      );
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

      // CẬP NHẬT LOGIC GỬI KỸ NĂNG THEO DTO MỚI (Có kèm kinh nghiệm)
      step4_skills.selectedSkills?.forEach((skill, index) => {
        formData.append(`DanhSachKyNang[${index}].MaKyNang`, skill.id);
        formData.append(
          `DanhSachKyNang[${index}].KinhNghiem`,
          skill.experienceYears || "Chưa có kinh nghiệm",
        );
      });

      if (step3_docs.cccdFront)
        formData.append("FileAnhCccdmatTruoc", step3_docs.cccdFront);
      if (step3_docs.cccdBack)
        formData.append("FileAnhCccdmatSau", step3_docs.cccdBack);
      if (step3_docs.portrait)
        formData.append("FileAnhChanDung", step3_docs.portrait);
      if (step3_docs.residence)
        formData.append("FileAnhGiayXacNhanCuTru", step3_docs.residence);

      await api.post("/v1/hoso/hoan-thien-ho-so", formData);

      // Đánh dấu thành công và hiển thị Toast
      isSuccessRef.current = true;
      showToast("Gửi hồ sơ thành công! Đang chuyển trang...", "success");

      // Delay 1.5s để hiện thông báo rồi mới reset form và chuyển trang
      setTimeout(() => {
        resetForm();
        router.push(ROUTES.MAID.REGISTER_STATUS);
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi gửi hồ sơ:", error);
      showToast(
        error.message || "Không thể gửi hồ sơ, vui lòng thử lại.",
        "error",
      );
    } finally {
      if (!isSuccessRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans relative">
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
                {/* Cột Trái: Thông tin cá nhân */}
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
                    <InfoItem label="Họ và tên" value={userInfo.name} />
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

                {/* Cột Phải: Kỹ năng & Kinh nghiệm */}
                <div className="md:col-span-1 bg-[#f4f9f7] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <VerifiedUserOutlinedIcon fontSize="small" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Kỹ năng & Kinh nghiệm
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {step4_skills.selectedSkills?.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col gap-1"
                      >
                        <p className="text-sm font-bold text-emerald-900">
                          {skill.name}
                        </p>
                        <p className="text-xs font-semibold text-gray-500">
                          Kinh nghiệm:{" "}
                          <span className="text-gray-800 font-bold">
                            {skill.experienceYears || "Chưa cập nhật"}
                          </span>
                        </p>
                      </div>
                    ))}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedFiles.length > 0 ? (
                    uploadedFiles.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-xl flex flex-col gap-3 border border-emerald-100 shadow-sm overflow-hidden"
                      >
                        {/* Phần hiển thị hình ảnh hoặc icon */}
                        <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                          {doc.type === "image" && doc.previewUrl ? (
                            <img
                              src={doc.previewUrl}
                              alt={doc.label}
                              className="w-full h-full object-cover"
                            />
                          ) : doc.type === "pdf" ? (
                            <div className="flex flex-col items-center text-red-500">
                              <PictureAsPdfOutlinedIcon fontSize="large" />
                              <span className="text-xs font-bold mt-1 text-gray-500">
                                PDF Document
                              </span>
                            </div>
                          ) : (
                            <DescriptionOutlinedIcon
                              className="text-gray-400"
                              fontSize="large"
                            />
                          )}
                        </div>

                        {/* Phần thông tin file */}
                        <div className="min-w-0 w-full text-center">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {doc.label}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {doc.size}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic col-span-full">
                      Chưa tải lên tài liệu nào.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Link href={ROUTES.MAID.REGISTER_SKILL}>
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

        {/* COMPONENT THÔNG BÁO Ở ĐÂY */}
        <NotificationToast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={handleCloseToast}
          autoHideDuration={3000}
        />
      </div>
    </ThemeProvider>
  );
}
