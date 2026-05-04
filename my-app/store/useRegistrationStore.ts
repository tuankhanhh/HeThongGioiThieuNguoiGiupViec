import { create } from "zustand";

// 1. Khai báo Type cho toàn bộ dữ liệu hồ sơ
export interface RegistrationState {
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

  // Đưa thẳng Type vào đây, thêm [] để TypeScript hiểu đây là Mảng (Array)
  step4_skills: {
    selectedSkills: {
      id: string;
      name: string;
      experienceYears: string;
    }[];
  };

  // --- ACTIONS ---
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
    // Ép kiểu ngay tại đây để tránh lỗi never[] khi dùng các hàm .map() bên UI
    selectedSkills: [] as RegistrationState["step4_skills"]["selectedSkills"],
  },
};

// 3. Tạo Store
export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

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

  resetForm: () => set(initialState),
}));
