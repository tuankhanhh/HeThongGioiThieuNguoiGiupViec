"use client";

import Registration from "@/components/auth/SignUp";

// Nhớ sửa lại đường dẫn import component SharedRegistration cho đúng với cấu trúc dự án của bạn

export default function PartnerRegistration() {
  return (
    <Registration
      apiUrl="https://localhost:7095/api/User/registerMaid"
      urlLogin="/maid/sign-in"
      title="Đăng ký để trở thành đối tác của chúng tôi."
      loginSuccessUrl="/maid/sign-in"
    />
  );
}
