import Login from "@/components/auth/Login";
export default function DangNhap() {
  return <Login signUpHref="/customer/sign-up" roleType="CUSTOMER" />;
}
