"use client";

import React, { useState, useEffect } from "react";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import FaceOutlinedIcon from "@mui/icons-material/FaceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RegistrationStepper from "@/components/componentsMaid/Stepper";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

import { useRegistrationStore } from "@/store/useRegistrationStore";
import { ROUTES } from "@/lib/routes";

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
  const router = useRouter();
  const step3_docs = useRegistrationStore((state) => state.step3_docs);
  const updateDocs = useRegistrationStore((state) => state.updateDocs);

  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>(
    {},
  );
  // State quản lý lỗi hiển thị
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialPreviews: Record<string, string> = {};
    let hasFiles = false;

    (Object.keys(step3_docs) as DocField[]).forEach((key) => {
      const file = step3_docs[key];
      if (file && file.type.startsWith("image/")) {
        initialPreviews[key] = URL.createObjectURL(file);
        hasFiles = true;
      }
    });

    if (hasFiles) {
      //eslint-disable-next-line react-hooks/exhaustive-deps
      setLocalPreviews(initialPreviews);
    }

    return () => {
      Object.values(initialPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [step3_docs]);

  // const handleFileChange =
  //   (field: DocField) => (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (e.target.files && e.target.files.length > 0) {
  //       const selectedFile = e.target.files[0];

  //       const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  //       if (selectedFile.size > MAX_FILE_SIZE) {
  //         alert(
  //           `File ${selectedFile.name} vượt quá 5MB. Vui lòng chọn file nhỏ hơn!`,
  //         );
  //         e.target.value = "";
  //         return;
  //       }

  //       updateDocs(field, selectedFile);

  //       // Xóa thông báo lỗi của trường này (nếu có) khi người dùng upload thành công
  //       if (errors[field]) {
  //         setErrors((prev) => {
  //           const newErrors = { ...prev };
  //           delete newErrors[field];
  //           return newErrors;
  //         });
  //       }

  //       if (selectedFile.type.startsWith("image/")) {
  //         const objectUrl = URL.createObjectURL(selectedFile);
  //         setLocalPreviews((prev) => {
  //           if (prev[field]) URL.revokeObjectURL(prev[field]);
  //           return { ...prev, [field]: objectUrl };
  //         });
  //       } else {
  //         setLocalPreviews((prev) => {
  //           const next = { ...prev };
  //           if (next[field]) URL.revokeObjectURL(next[field]);
  //           delete next[field];
  //           return next;
  //         });
  //       }
  //     }
  //   };
  const handleFileChange =
    (field: DocField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];

        // 1. KIỂM TRA ĐỊNH DẠNG FILE
        // Lưu ý: Trường "residence" (giấy cư trú) thường cho phép cả PDF,
        // nhưng nếu bạn muốn cấm toàn bộ PDF thì xóa 'application/pdf' đi nhé.
        const allowedTypes =
          field === "residence"
            ? ["image/jpeg", "image/png", "application/pdf"]
            : ["image/jpeg", "image/png"];

        if (!allowedTypes.includes(selectedFile.type)) {
          setErrors((prev) => ({
            ...prev,
            [field]:
              field === "residence"
                ? "Vui lòng chọn file định dạng JPG, PNG hoặc PDF."
                : "Vui lòng chỉ tải lên ảnh định dạng JPG hoặc PNG.",
          }));
          e.target.value = ""; // Dọn dẹp input
          return; // Dừng lại không cho upload
        }

        // 2. KIỂM TRA DUNG LƯỢNG FILE (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (selectedFile.size > MAX_FILE_SIZE) {
          setErrors((prev) => ({
            ...prev,
            [field]: `File quá lớn. Vui lòng chọn file dưới 5MB (File hiện tại: ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB)`,
          }));
          e.target.value = "";
          return;
        }

        // 3. LƯU FILE VÀO ZUSTAND STORE
        updateDocs(field, selectedFile);

        // 4. XÓA LỖI KHI UPLOAD THÀNH CÔNG
        if (errors[field]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }

        // 5. TẠO PREVIEW ẢNH
        if (selectedFile.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(selectedFile);
          setLocalPreviews((prev) => {
            if (prev[field]) URL.revokeObjectURL(prev[field]);
            return { ...prev, [field]: objectUrl };
          });
        } else {
          setLocalPreviews((prev) => {
            const next = { ...prev };
            if (next[field]) URL.revokeObjectURL(next[field]);
            delete next[field];
            return next;
          });
        }
      }
    };
  // Hàm Validation kiểm tra khi bấm "Tiếp tục"
  const handleNextSubmit = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!step3_docs.cccdFront) {
      newErrors.cccdFront = "Vui lòng tải lên CCCD mặt trước";
      isValid = false;
    }
    if (!step3_docs.cccdBack) {
      newErrors.cccdBack = "Vui lòng tải lên CCCD mặt sau";
      isValid = false;
    }
    if (!step3_docs.portrait) {
      newErrors.portrait = "Vui lòng tải lên ảnh chân dung";
      isValid = false;
    }

    if (isValid) {
      router.push(ROUTES.MAID.REGISTER_SKILL); // Chuyển sang bước tiếp theo nếu hợp lệ
    } else {
      setErrors(newErrors);
    }
  };

  const renderUploadBox = (
    field: DocField,
    title: string,
    icon: React.ReactNode,
    subtext: string,
    isOptional: boolean = false,
  ) => {
    const file = step3_docs[field];
    const previewUrl = localPreviews[field];
    const isUploaded = file !== null && file !== undefined;
    const isPdf = file?.type === "application/pdf";
    const hasError = !!errors[field]; // Kiểm tra xem box này có đang bị lỗi hay không

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700">
            {title} {!isOptional && <span className="text-red-500">*</span>}
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
            hasError
              ? "border-red-400 bg-red-50 hover:bg-red-100" // Đổi viền và nền sang đỏ nếu có lỗi
              : isUploaded
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-gray-200 bg-[#f8faf9] hover:bg-gray-50 hover:border-emerald-300"
          }`}
        >
          <input
            id={`upload-${field}`}
            type="file"
            // Thay đổi accept linh hoạt: cccd, portrait chỉ ảnh; residence thêm pdf
            accept={
              field === "residence"
                ? "image/jpeg, image/png, application/pdf"
                : "image/jpeg, image/png"
            }
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
              <div
                className={`p-3 rounded-full mb-4 ${hasError ? "text-red-500 bg-red-100" : "text-emerald-700 bg-emerald-50"}`}
              >
                {icon}
              </div>
              <p
                className={`font-semibold mb-1 ${hasError ? "text-red-600" : "text-emerald-700"}`}
              >
                Chọn file
              </p>
              <p className="text-xs text-gray-500">{subtext}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                CHƯA TẢI LÊN
              </div>
            </div>
          )}
        </label>
        {/* Hiển thị dòng text đỏ báo lỗi ở dưới box */}
        {hasError && (
          <p className="text-sm text-red-500 font-medium">{errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-12">
              <RegistrationStepper activeStep={1} />
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
              <Link href={ROUTES.MAID.REGISTER_INFO}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-800 shadow-none px-6 py-2.5 normal-case rounded-lg font-semibold"
                >
                  Quay lại
                </Button>
              </Link>

              {/* Đã gỡ bỏ thẻ <Link> ở đây và thêm onClick validation */}
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
