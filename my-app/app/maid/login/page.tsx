import Login from "@/components/auth/Login";
import Footer from "@/components/footer/app.footer";
import Header from "@/components/header/app.header";
import { ROUTES } from "@/lib/routes";
export default function DangNhap() {
  return (
    <>
      <Header />
      <Login signUpHref={ROUTES.MAID.REGISTER} roleType="MAID" />
      <Footer />
    </>
  );
}
