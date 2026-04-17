"use client";

import Registration from "@/components/auth/SignUp";

export default function PartnerRegistration() {
  return (
    <Registration
      apiUrl="https://localhost:7095/api/User/registerCustomer"
      urlLogin="/customer/sign-in"
      title="Đăng ký để trải nghiệm dịch vụ tốt nhất của chúng tôi."
      loginSuccessUrl="/customer/sign-in"
    />
  );
}
