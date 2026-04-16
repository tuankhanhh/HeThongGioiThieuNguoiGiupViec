"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  ThemeProvider,
  createTheme,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import FaceOutlinedIcon from "@mui/icons-material/FaceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RegistrationStepper from "@/components/componentsMaid/Stepper";
import Link from "next/link";

// 1. Import store Zustand
import { useRegistrationStore } from "@/store/useRegistrationStore";

// Type cho các trường upload (khớp với store)
type DocField = "cccdFront" | "cccdBack" | "portrait" | "residence";

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

export default function DocumentUploadStep() {
  // 2. Lấy dữ liệu và hàm cập nhật từ Store
  const step3_docs = useRegistrationStore((state) => state.step3_docs);
  const updateDocs = useRegistrationStore((state) => state.updateDocs);

  // Giữ previews cục bộ để quản lý bộ nhớ tạm của trình duyệt
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>(
    {},
  );

  // Cleanup: Giải phóng các URL blob khi component unmount
  useEffect(() => {
    return () => {
      Object.values(localPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localPreviews]);

  // Handler xử lý chọn file
  const handleFileChange =
    (field: DocField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];

        // 3. Cập nhật FILE GỐC vào store Zustand
        updateDocs(field, selectedFile);

        // 4. Cập nhật PREVIEW URL cục bộ (chỉ cho ảnh)
        if (selectedFile.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(selectedFile);
          setLocalPreviews((prev) => ({ ...prev, [field]: objectUrl }));
        } else {
          // Reset preview nếu là PDF hoặc file khác
          setLocalPreviews((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      }
    };

  const renderUploadBox = (
    field: DocField,
    title: string,
    icon: React.ReactNode,
    subtext: string,
    isOptional: boolean = false,
  ) => {
    const file = step3_docs[field]; // Đọc file từ store
    const previewUrl = localPreviews[field]; // Đọc preview từ state cục bộ
    const isUploaded = file !== null;
    const isPdf = file?.type === "application/pdf";

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700">
            {title}
          </label>
          {isOptional && (
            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Không bắt buộc
            </span>
          )}
        </div>

        <label
          htmlFor={`upload-${field}`}
          className={`relative flex flex-col items-center justify-center h-[220px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group ${
            isUploaded
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-gray-200 bg-[#f8faf9] hover:bg-gray-50 hover:border-emerald-300"
          }`}
        >
          <input
            id={`upload-${field}`}
            type="file"
            accept="image/jpeg, image/png, application/pdf"
            className="hidden"
            onChange={handleFileChange(field)}
          />

          {previewUrl ? (
            <div className="relative w-full h-full flex justify-center items-center p-2">
              <img
                src={previewUrl}
                alt={`Preview ${title}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm">
                  <EditOutlinedIcon fontSize="small" /> Đổi ảnh khác
                </span>
              </div>
            </div>
          ) : isPdf ? (
            <div className="flex flex-col items-center text-center p-6 w-full h-full justify-center relative">
              <PictureAsPdfOutlinedIcon
                className="text-red-500 mb-3"
                sx={{ fontSize: 48 }}
              />
              <p className="text-emerald-700 font-semibold mb-1">
                Đã tải lên PDF
              </p>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                {file.name}
              </p>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm">
                  <EditOutlinedIcon fontSize="small" /> Đổi file khác
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 transform transition-transform group-hover:scale-105">
              <div className="p-3 rounded-full text-emerald-700 bg-emerald-50 mb-4">
                {icon}
              </div>
              <p className="font-semibold text-emerald-700 mb-1">Chọn file</p>
              <p className="text-xs text-gray-500">{subtext}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                CHƯA TẢI LÊN
              </div>
            </div>
          )}
        </label>
      </div>
    );
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Giấy tờ xác minh
              </h2>
              <p className="text-gray-500">
                Vui lòng tải lên các giấy tờ tùy thân để chúng tôi xác minh danh
                tính và đảm bảo an toàn cho cộng đồng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderUploadBox(
                "cccdFront",
                "CCCD mặt trước",
                <AddAPhotoOutlinedIcon fontSize="medium" />,
                "Định dạng JPG, PNG (Tối đa 5MB)",
              )}
              {renderUploadBox(
                "cccdBack",
                "CCCD mặt sau",
                <AddAPhotoOutlinedIcon fontSize="medium" />,
                "Định dạng JPG, PNG (Tối đa 5MB)",
              )}
              {renderUploadBox(
                "portrait",
                "Ảnh chân dung",
                <FaceOutlinedIcon fontSize="medium" />,
                "Ảnh rõ mặt, không đeo kính râm",
              )}
              {renderUploadBox(
                "residence",
                "Giấy xác nhận cư trú",
                <DescriptionOutlinedIcon fontSize="medium" />,
                "Bản sao công chứng hoặc CT07/CT08",
                true,
              )}
            </div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <Link href="/maid/sign-up/generalinfo">
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-800 shadow-none px-6 py-2.5 normal-case rounded-lg font-semibold"
                >
                  Quay lại
                </Button>
              </Link>
              <Link href="/maid/sign-up/skills">
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
