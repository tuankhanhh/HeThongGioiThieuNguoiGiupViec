import { create } from "zustand";

interface SkillParams {
  id: string;
  name: string;
}

// 1. Khai báo Type cho toàn bộ dữ liệu hồ sơ
interface RegistrationState {
  step2_personal: {
    dob: string;
    gender: string;
    idCard: string;
    address: string;
    relativeName: string;
    relativePhone: string;
  };

  step3_docs: {
    cccdFront: File | null;
    cccdBack: File | null;
    portrait: File | null;
    residence: File | null;
  };

  step4_skills: {
    selectedSkills: SkillParams[];
    experienceYears: string;
    experienceDesc: string;
  };

  // --- ACTIONS (Hàm cập nhật dữ liệu) ---
  updatePersonal: (data: Partial<RegistrationState["step2_personal"]>) => void;
  updateDocs: (
    field: keyof RegistrationState["step3_docs"],
    file: File | null,
  ) => void;
  updateSkills: (data: Partial<RegistrationState["step4_skills"]>) => void;
  resetForm: () => void;
}

// 2. Giá trị mặc định ban đầu
const initialState = {
  step2_personal: {
    dob: "",
    gender: "",
    idCard: "",
    address: "",
    relativeName: "",
    relativePhone: "",
  },
  step3_docs: {
    cccdFront: null,
    cccdBack: null,
    portrait: null,
    residence: null,
  },
  step4_skills: {
    selectedSkills: [],
    experienceYears: "",
    experienceDesc: "",
  },
};

// 3. Tạo Store
export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

  // Cập nhật thông tin tài khoản Bước 1

  // Dùng toán tử spread (...) để gộp dữ liệu mới vào dữ liệu cũ
  updatePersonal: (data) =>
    set((state) => ({
      step2_personal: { ...state.step2_personal, ...data },
    })),

  updateDocs: (field, file) =>
    set((state) => ({
      step3_docs: { ...state.step3_docs, [field]: file },
    })),

  updateSkills: (data) =>
    set((state) => ({
      step4_skills: { ...state.step4_skills, ...data },
    })),

  // Hàm xóa sạch dữ liệu (dùng khi submit thành công)
  resetForm: () => set(initialState),
}));
