import Login from "@/components/auth/Login";
import { ROUTES } from "@/lib/routes";
export default function DangNhap() {
  return <Login signUpHref={ROUTES.CUSTOMER.REGISTER} roleType="CUSTOMER" />;
}
