"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  OutlinedInput,
  MenuItem,
  InputAdornment,
  ThemeProvider,
  createTheme,
  Select,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  CircularProgress,
  FormHelperText,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WcIcon from "@mui/icons-material/Wc";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import FaceOutlinedIcon from "@mui/icons-material/FaceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import StarsIcon from "@mui/icons-material/Stars";
import WorkIcon from "@mui/icons-material/Work";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ElderlyOutlinedIcon from "@mui/icons-material/ElderlyOutlined";
import IronOutlinedIcon from "@mui/icons-material/IronOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import SaveIcon from "@mui/icons-material/Save";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { api } from "@/services/api";
import { ROUTES } from "@/lib/routes";
import NotificationToast from "@/components/NotificationToast";
const BACKEND_URL = "https://localhost:7095";
const ICON_MAP: Record<string, React.ReactNode> = {
  cleaning: <CleaningServicesOutlinedIcon />,
  cooking: <SoupKitchenOutlinedIcon />,
  childcare: <SentimentSatisfiedAltOutlinedIcon />,
  eldercare: <ElderlyOutlinedIcon />,
  laundry: <IronOutlinedIcon />,
  other: <MoreHorizOutlinedIcon />,
};

type DocField = "cccdFront" | "cccdBack" | "portrait" | "residence";

const theme = createTheme({
  palette: {
    primary: { main: "#047857" },
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#eef2ed",
          borderRadius: "0.5rem",
          "& fieldset": { borderColor: "transparent" },
          "&:hover fieldset": { borderColor: "#047857" },
          "&.Mui-focused fieldset": {
            borderColor: "#047857",
            borderWidth: "1px",
          },
          "&.Mui-error fieldset": {
            borderColor: "#d32f2f",
            borderWidth: "1px",
          },
        },
      },
    },
  },
});

const getImageUrl = (path: string | null | File) => {
  if (!path) return null;

  // Nếu là Object File (người dùng vừa chọn mới), tạo URL blob để xem tạm
  if (path instanceof File) {
    return URL.createObjectURL(path);
  }

  // Nếu đã là một URL đầy đủ (http...) thì giữ nguyên
  if (path.startsWith("http")) return path;

  // Nếu là đường dẫn tương đối từ server (/uploads/...) thì nối với Domain Backend
  return `${BACKEND_URL}${path}`;
};

export default function UpdateProfilePage() {
  const router = useRouter();

  // STATES CHUNG
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>(
    "Hồ sơ của bạn có một số thông tin chưa hợp lệ. Vui lòng kiểm tra và cập nhật lại.",
  );

  const [userInfo, setUserInfo] = useState({ name: "", id: "" });
  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // STATE THÔNG BÁO
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // STATE DỮ LIỆU FORM
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    idCard: "",
    address: "",
    relativeName: "",
    relativePhone: "",
    experienceYears: "",
    experienceDesc: "",
    selectedSkills: [] as any[],
  });

  // STATE TÀI LIỆU: Có thể chứa URL (string từ DB) hoặc File (do user chọn mới)
  const [docs, setDocs] = useState<Record<DocField, File | string | null>>({
    cccdFront: null,
    cccdBack: null,
    portrait: null,
    residence: null,
  });

  // URL để preview ảnh (cả ảnh cũ từ DB và ảnh mới tạo từ File)
  const [previews, setPreviews] = useState<Record<DocField, string | null>>({
    cccdFront: null,
    cccdBack: null,
    portrait: null,
    residence: null,
  });

  // FETCH DỮ LIỆU KHỞI TẠO
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Lấy thông tin User (để lấy name và ID)
        const userRes = await api.get<any>("/User/me");
        if (userRes) {
          setUserInfo({ name: userRes.hoTen, id: userRes.maNguoiDung });
        }

        // 2. Lấy danh sách tổng hợp tất cả kỹ năng từ DB (để hiển thị lựa chọn)
        const skillsRes = await api.get<any[]>("/KyNang/getAll");
        if (skillsRes) setDbSkills(skillsRes);

        // 3. Gọi API thực tế lấy chi tiết hồ sơ cũ
        const profileRes = await api.get<any>("/v1/maid/ho-so-cua-toi");

        // API trả về format: { success: true, hasProfile: true, data: { ... } }
        if (profileRes && profileRes.hasProfile && profileRes.data) {
          const profileData = profileRes.data;

          // Đổ dữ liệu text vào formData
          // Lưu ý quan trọng: Format ngày sinh (dob) HTML <input type="date"> yêu cầu chuẩn "YYYY-MM-DD"
          // Nếu backend trả về "2026-04-21T00:00:00", ta cần cắt lấy 10 ký tự đầu.
          const formattedDob = profileData.ngaySinh
            ? profileData.ngaySinh.substring(0, 10)
            : "";

          setFormData({
            dob: formattedDob,
            gender: profileData.gioiTinh || "",
            idCard: profileData.soCccd || "",
            address: profileData.diaChi || "",
            relativeName: profileData.tenNguoiThan || "",
            relativePhone: profileData.sdtNguoiThan || "",
            experienceYears: profileData.kinhNghiem || "",
            experienceDesc: profileData.moTaChiTietKinhNghiem || "",
            selectedSkills: profileData.danhSachKyNang || [],
          });

          // Đổ dữ liệu file (URLs) vào State docs và previews
          setDocs({
            cccdFront: profileData.anhCccdmatTruoc,
            cccdBack: profileData.anhCccdmatSau,
            portrait: profileData.anhChanDung,
            residence: profileData.giayXacNhanCuTru,
          });

          // Đổ dữ liệu file (URLs) vào State previews với đường dẫn đầy đủ
          setPreviews({
            cccdFront: profileData.anhCccdmatTruoc
              ? `${BACKEND_URL}${profileData.anhCccdmatTruoc}`
              : null,
            cccdBack: profileData.anhCccdmatSau
              ? `${BACKEND_URL}${profileData.anhCccdmatSau}`
              : null,
            portrait: profileData.anhChanDung
              ? `${BACKEND_URL}${profileData.anhChanDung}`
              : null,
            residence: profileData.giayXacNhanCuTru
              ? `${BACKEND_URL}${profileData.giayXacNhanCuTru}`
              : null,
          });

          // Hiển thị lý do từ chối nếu có
          if (profileData.lyDoTuChoi) {
            setRejectReason(profileData.lyDoTuChoi);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        setToast({
          open: true,
          message: "Không thể tải dữ liệu hồ sơ. Vui lòng thử lại sau.",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // XỬ LÝ THAY ĐỔI TEXT VÀ SELECT
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (
      (name === "idCard" || name === "relativePhone") &&
      value !== "" &&
      !/^\d+$/.test(value)
    )
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    if (errors[name as string])
      setErrors((prev) => ({ ...prev, [name as string]: "" }));
  };

  // XỬ LÝ THAY ĐỔI KỸ NĂNG
  const toggleSkill = (skill: { id: string; title: string }) => {
    const currentSkills = formData.selectedSkills;
    const isAlreadySelected = currentSkills.some((s: any) => s.id === skill.id);
    const newSkills = isAlreadySelected
      ? currentSkills.filter((s: any) => s.id !== skill.id)
      : [...currentSkills, { id: skill.id, name: skill.title }];

    setFormData((prev) => ({ ...prev, selectedSkills: newSkills }));
    if (newSkills.length >= 3 && errors.skills)
      setErrors((prev) => ({ ...prev, skills: "" }));
  };

  // XỬ LÝ UPLOAD FILE MỚI
  const handleFileChange =
    (field: DocField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        const allowedTypes =
          field === "residence"
            ? ["image/jpeg", "image/png", "application/pdf"]
            : ["image/jpeg", "image/png"];

        if (!allowedTypes.includes(selectedFile.type)) {
          setErrors((prev) => ({
            ...prev,
            [field]:
              field === "residence"
                ? "Chỉ nhận JPG, PNG, PDF."
                : "Chỉ nhận JPG, PNG.",
          }));
          e.target.value = "";
          return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            [field]: `File quá lớn (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Tối đa 5MB.`,
          }));
          e.target.value = "";
          return;
        }

        // Xóa URL object cũ nếu có để tránh rò rỉ bộ nhớ (chỉ xóa nếu nó là blob url)
        if (previews[field] && previews[field]?.startsWith("blob:"))
          URL.revokeObjectURL(previews[field]!);

        // Cập nhật File mới
        setDocs((prev) => ({ ...prev, [field]: selectedFile }));

        // Tạo Preview cho File mới
        // Cập nhật Previews khi chọn file mới
        if (selectedFile.type.startsWith("image/")) {
          setPreviews((prev) => ({
            ...prev,
            [field]: URL.createObjectURL(selectedFile), // Đây là blob:http... nên browser hiển thị được ngay
          }));
        } else {
          // Nếu là PDF thì gán preview thành kiểu nhận diện (hoặc null tùy logic hiển thị)
          setPreviews((prev) => ({ ...prev, [field]: "pdf_document" }));
        }

        if (errors[field])
          setErrors((prev) => {
            const newE = { ...prev };
            delete newE[field];
            return newE;
          });
      }
    };

  // VALIDATION & SUBMIT
  const handleUpdateSubmit = async () => {
    const tempErrors: Record<string, string> = {};
    let isValid = true;

    // Validate Thông tin text
    if (!formData.dob) {
      tempErrors.dob = "Chọn ngày sinh.";
      isValid = false;
    }
    if (!formData.gender) {
      tempErrors.gender = "Chọn giới tính.";
      isValid = false;
    }
    if (!formData.idCard || formData.idCard.length !== 12) {
      tempErrors.idCard = "CCCD phải đúng 12 số.";
      isValid = false;
    }
    if (!formData.address) {
      tempErrors.address = "Nhập địa chỉ.";
      isValid = false;
    }
    if (!formData.relativeName) {
      tempErrors.relativeName = "Nhập tên người thân.";
      isValid = false;
    }
    if (!formData.relativePhone || formData.relativePhone.length !== 10) {
      tempErrors.relativePhone = "SĐT phải đúng 10 số.";
      isValid = false;
    }

    // Validate File (Yêu cầu phải có file cũ dạng string URL hoặc file mới dạng Object File)
    if (!docs.cccdFront) {
      tempErrors.cccdFront = "Bắt buộc.";
      isValid = false;
    }
    if (!docs.cccdBack) {
      tempErrors.cccdBack = "Bắt buộc.";
      isValid = false;
    }
    if (!docs.portrait) {
      tempErrors.portrait = "Bắt buộc.";
      isValid = false;
    }

    // Validate Kỹ năng & Kinh nghiệm
    if (formData.selectedSkills.length < 3) {
      tempErrors.skills = "Chọn ít nhất 3 kỹ năng.";
      isValid = false;
    }
    if (!formData.experienceYears) {
      tempErrors.years = "Chọn số năm kinh nghiệm.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(tempErrors);
      setToast({
        open: true,
        message: "Vui lòng kiểm tra lại các trường báo đỏ.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Thông tin cơ bản
      submitData.append("MaNguoiGiupViec", userInfo.id);
      submitData.append("SoCccd", formData.idCard);
      submitData.append("NgaySinh", formData.dob);
      submitData.append("GioiTinh", formData.gender);
      submitData.append("DiaChi", formData.address);
      submitData.append("TenNguoiThan", formData.relativeName);
      submitData.append("SdtnguoiThan", formData.relativePhone);
      submitData.append("KinhNghiem", formData.experienceYears);
      submitData.append("MoTaChiTietKinhNghiem", formData.experienceDesc);

      // Kỹ năng
      formData.selectedSkills.forEach((skill) => {
        submitData.append("DanhSachMaKyNang", skill.id);
      });

      // LƯU Ý QUAN TRỌNG VỀ FILE:
      // Chỉ gửi đi (append) những file người dùng VỪA CHỌN MỚI (chúng là Object thuộc lớp File).
      // Những ảnh cũ (chỉ là chuỗi string URL trả về từ DB) sẽ KHÔNG được append.
      // Backend C# sẽ tự hiểu: Nếu request.FileAnhCccdmatTruoc là null -> Giữ nguyên ảnh cũ.
      if (docs.cccdFront instanceof File)
        submitData.append("FileAnhCccdmatTruoc", docs.cccdFront);
      if (docs.cccdBack instanceof File)
        submitData.append("FileAnhCccdmatSau", docs.cccdBack);
      if (docs.portrait instanceof File)
        submitData.append("FileAnhChanDung", docs.portrait);
      if (docs.residence instanceof File)
        submitData.append("FileAnhGiayXacNhanCuTru", docs.residence);

      // GỌI API CẬP NHẬT
      await api.post("/v1/maid/cap-nhat-ho-so", submitData);

      setToast({
        open: true,
        message: "Cập nhật hồ sơ thành công! Đang chuyển hướng...",
        severity: "success",
      });

      // Chuyển hướng về trang chờ duyệt sau khi thành công
      setTimeout(() => router.push(ROUTES.MAID.REGISTER_STATUS), 1500);
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      setToast({
        open: true,
        message: error.message || "Cập nhật thất bại. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadBox = (
    field: DocField,
    title: string,
    icon: React.ReactNode,
    subtext: string,
    isOptional: boolean = false,
  ) => {
    const previewUrl = previews[field];
    const isUploaded = !!docs[field];
    const isPdf =
      previewUrl === "pdf_document" ||
      (typeof docs[field] === "string" &&
        (docs[field] as string).includes(".pdf"));
    const hasError = !!errors[field];

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700">
            {title} {!isOptional && <span className="text-red-500">*</span>}
          </label>
        </div>
        <label
          htmlFor={`upload-${field}`}
          className={`relative flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group ${
            hasError
              ? "border-red-400 bg-red-50"
              : isUploaded
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-gray-200 bg-[#f8faf9]"
          }`}
        >
          <input
            id={`upload-${field}`}
            type="file"
            className="hidden"
            accept={
              field === "residence"
                ? "image/jpeg, image/png, application/pdf"
                : "image/jpeg, image/png"
            }
            onChange={handleFileChange(field)}
          />
          {previewUrl && !isPdf ? (
            <div className="relative w-full h-full flex justify-center items-center p-2">
              <img
                src={previewUrl}
                alt={`Preview`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm">
                  <EditOutlinedIcon fontSize="small" /> Đổi ảnh mới
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
                Tài liệu PDF
              </p>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm">
                  <EditOutlinedIcon fontSize="small" /> Đổi file mới
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
            </div>
          )}
        </label>
        {hasError && (
          <p className="text-sm text-red-500 font-medium">{errors[field]}</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <CircularProgress color="success" />
        <p className="mt-4 text-emerald-700 font-bold animate-pulse">
          Đang tải hồ sơ của bạn...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center font-sans">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* BANNER THÔNG BÁO TỪ CHỐI */}
          <div className="p-6 bg-red-50 border-b border-red-100">
            <Alert
              icon={<WarningAmberIcon fontSize="inherit" />}
              severity="error"
              sx={{ backgroundColor: "transparent", p: 0 }}
            >
              <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                Hồ sơ cần được cập nhật
              </AlertTitle>
              <span className="text-gray-800 leading-relaxed">
                {rejectReason}
              </span>
            </Alert>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* SECTION 1: THÔNG TIN CÁ NHÂN */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <PersonOutlineIcon
                  className="text-emerald-700"
                  fontSize="large"
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  Thông tin cá nhân
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ tên
                  </label>
                  <OutlinedInput
                    fullWidth
                    value={userInfo.name}
                    readOnly
                    className="bg-gray-200 text-gray-600"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonOutlineIcon className="text-gray-400" />
                      </InputAdornment>
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    error={!!errors.dob}
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarTodayIcon
                          className="text-gray-500"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                  />
                  {errors.dob && (
                    <FormHelperText error>{errors.dob}</FormHelperText>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <FormControl fullWidth error={!!errors.gender}>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      displayEmpty
                      startAdornment={
                        <InputAdornment position="start">
                          <WcIcon className="text-gray-500" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                    {errors.gender && (
                      <FormHelperText>{errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 12 }}
                    error={!!errors.idCard}
                    startAdornment={
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                  {errors.idCard && (
                    <FormHelperText error>{errors.idCard}</FormHelperText>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ hiện tại <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                  {errors.address && (
                    <FormHelperText error>{errors.address}</FormHelperText>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người thân <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativeName"
                    value={formData.relativeName}
                    onChange={handleInputChange}
                    error={!!errors.relativeName}
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon className="text-gray-500" />
                      </InputAdornment>
                    }
                  />
                  {errors.relativeName && (
                    <FormHelperText error>{errors.relativeName}</FormHelperText>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SĐT người thân <span className="text-red-500">*</span>
                  </label>
                  <OutlinedInput
                    fullWidth
                    name="relativePhone"
                    value={formData.relativePhone}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.relativePhone}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon className="text-emerald-600" />
                      </InputAdornment>
                    }
                  />
                  {errors.relativePhone && (
                    <FormHelperText error>
                      {errors.relativePhone}
                    </FormHelperText>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: GIẤY TỜ XÁC MINH */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <DescriptionOutlinedIcon
                  className="text-emerald-700"
                  fontSize="large"
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  Giấy tờ xác minh
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderUploadBox(
                  "cccdFront",
                  "CCCD mặt trước",
                  <AddAPhotoOutlinedIcon fontSize="medium" />,
                  "Định dạng JPG, PNG",
                )}
                {renderUploadBox(
                  "cccdBack",
                  "CCCD mặt sau",
                  <AddAPhotoOutlinedIcon fontSize="medium" />,
                  "Định dạng JPG, PNG",
                )}
                {renderUploadBox(
                  "portrait",
                  "Ảnh chân dung",
                  <FaceOutlinedIcon fontSize="medium" />,
                  "Ảnh rõ mặt",
                )}
                {renderUploadBox(
                  "residence",
                  "Xác nhận cư trú",
                  <DescriptionOutlinedIcon fontSize="medium" />,
                  "Tùy chọn",
                  true,
                )}
              </div>
            </section>

            {/* SECTION 3: KỸ NĂNG & KINH NGHIỆM */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b pb-3">
                <StarsIcon className="text-emerald-700" fontSize="large" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Kỹ năng & Kinh nghiệm
                </h2>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Chọn ít nhất 3 kỹ năng <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbSkills.map((skill) => {
                    const isSelected = formData.selectedSkills.some(
                      (s: any) => s.id === skill.id,
                    );
                    return (
                      <div
                        key={skill.id}
                        onClick={() =>
                          toggleSkill({ id: skill.id, title: skill.title })
                        }
                        className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected ? "border-emerald-700 bg-white" : errors.skills ? "border-red-200 bg-red-50" : "border-transparent bg-[#f8faf9]"}`}
                      >
                        <div
                          className={`mt-1 p-2 rounded-lg ${isSelected ? "text-emerald-700" : "text-gray-500 bg-white"}`}
                        >
                          {ICON_MAP[skill.iconKey] || <MoreHorizOutlinedIcon />}
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
                        <Checkbox
                          checked={isSelected}
                          className="absolute top-4 right-4 p-0 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
                {errors.skills && (
                  <p className="text-red-500 text-sm font-medium mt-3">
                    {errors.skills}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số năm kinh nghiệm <span className="text-red-500">*</span>
                  </label>
                  <FormControl fullWidth error={!!errors.years}>
                    <Select
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleSelectChange}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <span className="text-gray-400">Chọn số năm</span>
                      </MenuItem>
                      <MenuItem value="Chưa có kinh nghiệm">
                        Chưa có kinh nghiệm
                      </MenuItem>
                      <MenuItem value="Dưới 1 năm">Dưới 1 năm</MenuItem>
                      <MenuItem value="1 - 3 năm">1 - 3 năm</MenuItem>
                      <MenuItem value="Trên 5 năm">Trên 5 năm</MenuItem>
                    </Select>
                    {errors.years && (
                      <FormHelperText>{errors.years}</FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <OutlinedInput
                    fullWidth
                    multiline
                    rows={4}
                    name="experienceDesc"
                    value={formData.experienceDesc}
                    onChange={handleInputChange}
                    placeholder="Chia sẻ thêm về kinh nghiệm..."
                  />
                </div>
              </div>
            </section>

            {/* BUTTON SUBMIT */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <Button
                variant="contained"
                onClick={handleUpdateSubmit}
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                className={`px-8 py-3 rounded-xl font-bold shadow-md text-lg ${isSubmitting ? "bg-emerald-500" : "bg-emerald-700 hover:bg-emerald-800 text-white"}`}
              >
                {isSubmitting ? "Đang xử lý..." : "Gửi lại hồ sơ"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <NotificationToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={(e, r) =>
          r !== "clickaway" && setToast((p) => ({ ...p, open: false }))
        }
      />
    </ThemeProvider>
  );
}
