import Login from "@/components/auth/Login";
import Footer from "@/components/footer/app.footer";
import Header from "@/components/header/app.header";
export default function DangNhap() {
  return (
    <>
      <Header />
      <Login signUpHref="/staff/sign-up" roleType="STAFF" />
      <Footer />
    </>
  );
}
