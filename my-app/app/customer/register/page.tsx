"use client";

import Registration from "@/components/auth/Register";
import { ROUTES } from "@/lib/routes";

export default function PartnerRegistration() {
  return (
    <Registration
      apiUrl="https://localhost:7095/api/User/register"
      urlLogin={ROUTES.CUSTOMER.LOGIN}
      title="Đăng ký để trải nghiệm dịch vụ tốt nhất của chúng tôi."
      loginSuccessUrl={ROUTES.CUSTOMER.LOGIN}
    />
  );
}
