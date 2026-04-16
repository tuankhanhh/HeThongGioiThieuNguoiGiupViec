import Login from "@/components/auth/SignIn";
export default function DangNhap() {
  return <Login signUpHref="/customer/sign-up" roleType="CUSTOMER" />;
}
