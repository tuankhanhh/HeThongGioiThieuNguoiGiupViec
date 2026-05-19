"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
// ==========================================
// 1. DATA & INTERFACES
// ==========================================
interface StepItemProps {
  step: number;
  icon: string;
  title: string;
  description: string;
  isLast?: boolean;
}

const steps = [
  {
    icon: "📋",
    title: "Đặt lịch dễ dàng",
    description:
      "Chọn dịch vụ, ngày giờ và địa chỉ phù hợp với lịch trình của bạn.",
  },
  {
    icon: "🔍",
    title: "Ghép nối thông minh",
    description:
      "Hệ thống tự động tìm người giúp việc phù hợp nhất trong khu vực của bạn.",
  },
  {
    icon: "✅",
    title: "Xác nhận & Theo dõi",
    description:
      "Nhận thông báo xác nhận và theo dõi trạng thái công việc theo thời gian thực.",
  },
  {
    icon: "💳",
    title: "Hoàn thành & Thanh toán",
    description:
      "Đánh giá dịch vụ và thanh toán an toàn qua ứng dụng sau khi hoàn thành.",
  },
];
// ==========================================
// 2. HELPER COMPONENT (StepItem)
// ==========================================
function StepItem({
  step,
  icon,
  title,
  description,
  isLast = false,
}: StepItemProps) {
  const stepRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stepRef}
      className={`relative flex flex-col items-center text-center group transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gradient-to-r from-amber-300 to-amber-100 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300" />
        </div>
      )}

      {/* Step badge */}
      <div className="relative z-10 mb-5">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center group-hover:border-amber-400 transition-colors duration-300">
          {/* Icon */}
          <span className="text-3xl">{icon}</span>
        </div>
        {/* Step number */}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-md">
          {step}
        </div>
      </div>

      {/* Text */}
      <h3
        className={`font-bold text-stone-800 text-xl mb-2 font-display transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-stone-500 text-base leading-relaxed max-w-[180px] transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

// ==========================================
// 3. MAIN COMPONENT (StepList)
// ==========================================
export default function StepList() {
  const headerRef = useRef<HTMLDivElement>(null);
  const ctaBannerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCtaVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    if (ctaBannerRef.current) {
      observer.observe(ctaBannerRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const router = useRouter();
  //Kiểm tra đăng nhập
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      e.preventDefault(); // chặn Link
      router.push("/customer/sign-in"); // chuyển sang trang đăng nhập
    }
  };
  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4 tracking-wide transition-all duration-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Quy trình đặt dịch vụ
          </span>
          <h2
            className={`text-4xl font-bold text-stone-800 font-display mb-4 transition-all duration-700 delay-150 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Chỉ <span className="text-amber-500">4 bước đơn giản</span>
            <br />
            để có người giúp việc tin cậy
          </h2>
          <p
            className={`text-stone-500 text-lg max-w-lg mx-auto transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Quy trình được tối ưu để bạn có thể đặt lịch trong vòng chưa đến 2
            phút.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {steps.map((step, index) => (
            <StepItem
              key={index}
              step={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* CTA Banner */}
        <div
          ref={ctaBannerRef}
          className={`mt-16 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-700 ${
            isCtaVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div
            className={`transition-all duration-700 delay-200 ${
              isCtaVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-6"
            }`}
          >
            <h3 className="text-2xl font-bold text-white font-display mb-1">
              Sẵn sàng bắt đầu?
            </h3>
            <p className="text-amber-100">
              Hàng nghìn khách hàng đã tin tưởng lựa chọn chúng tôi.
            </p>
          </div>
          <Link
            href={ROUTES.PUBLIC.LIST_SERVICES}
            onClick={handleClick}
            className={`flex-shrink-0 px-8 py-3.5 rounded-2xl bg-white text-amber-600 font-bold text-lg hover:bg-amber-50 transition-all duration-700 delay-300 shadow-lg ${
              isCtaVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-6"
            }`}
          >
            Đặt lịch ngay
          </Link>
        </div>
      </div>
    </section>
  );
}
