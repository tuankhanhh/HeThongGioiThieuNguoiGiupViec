"use client";

import Link from "next/link";
import { ReactNode, useRef, useState, useEffect } from "react";

// ==========================================
// 1. DATA & INTERFACES
// ==========================================
interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

interface ServiceListProps {
  limit?: number;
}

const services = [
  {
    id: 1,
    icon: "🏠",
    title: "Dọn nhà",
    description:
      "Vệ sinh toàn bộ không gian sống sạch sẽ, gọn gàng theo tiêu chuẩn chuyên nghiệp.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: 2,
    icon: "🍳",
    title: "Nấu ăn",
    description:
      "Chế biến các món ăn ngon, đảm bảo dinh dưỡng phù hợp với khẩu vị gia đình bạn.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 3,
    icon: "👶",
    title: "Chăm sóc trẻ",
    description:
      "Trông coi, chơi cùng và hỗ trợ phát triển cho trẻ từ sơ sinh đến 12 tuổi.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    id: 4,
    icon: "👴",
    title: "Chăm sóc người già",
    description:
      "Hỗ trợ người cao tuổi sinh hoạt hằng ngày, uống thuốc và các nhu cầu y tế cơ bản.",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    id: 5,
    icon: "👕",
    title: "Giặt ủi",
    description:
      "Giặt sạch, phơi và ủi phẳng quần áo, chăn màn đúng kỹ thuật bảo quản vải.",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  {
    id: 6,
    icon: "🛒",
    title: "Mua sắm & Nội trợ",
    description:
      "Đi chợ, mua thực phẩm tươi ngon và quản lý chi tiêu hợp lý cho gia đình.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: 7,
    icon: "🐾",
    title: "Chăm sóc thú cưng",
    description:
      "Tắm rửa, cho ăn và chăm sóc sức khỏe cho các thú cưng của gia đình bạn.",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    id: 8,
    icon: "🌿",
    title: "Chăm sóc cây cảnh",
    description:
      "Tưới nước, bón phân và cắt tỉa cây xanh trong nhà và sân vườn của bạn.",
    color: "text-lime-600",
    bgColor: "bg-lime-50",
  },
];

// ==========================================
// 2. HELPER COMPONENT (ServiceCard)
// ==========================================
function ServiceCard({
  icon,
  title,
  description,
  color,
  bgColor,
  onClick,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className={`group relative flex flex-col items-start p-6 rounded-2xl border border-stone-100 bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left w-full overflow-hidden ${
        isVisible ? "animate-slideInUp" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Decorative blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${bgColor}`}
      />

      {/* Icon */}
      <div
        className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${bgColor}`}
      >
        <span className={`text-2xl ${color}`}>{icon}</span>
      </div>

      {/* Content */}
      <h3
        className={`relative z-10 font-bold text-stone-800 text-xl mb-2 font-display transition-all duration-700 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {title}
      </h3>
      <p
        className={`relative z-10 text-stone-500 text-base leading-relaxed transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {description}
      </p>

      {/* Arrow */}
      <div
        className={`relative z-10 mt-4 flex items-center gap-1 text-sm font-semibold ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer`}
      >
        Xem thêm
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}

// ==========================================
// 3. MAIN COMPONENT (ServiceList)
// ==========================================
export default function ServiceList({ limit }: ServiceListProps) {
  const displayed = limit ? services.slice(0, limit) : services;
  const headerRef = useRef<HTMLDivElement>(null);
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
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-stone-50" id="services">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-14">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4 tracking-wide transition-all duration-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Dịch vụ của chúng tôi
          </span>
          <h2
            className={`text-4xl font-bold text-stone-800 font-display mb-4 transition-all duration-700 delay-150 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Mọi nhu cầu gia đình,
            <br />
            <span className="text-amber-500">chúng tôi lo trọn vẹn</span>
          </h2>
          <p
            className={`text-stone-500 text-lg max-w-xl mx-auto transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Đa dạng dịch vụ được cung cấp bởi đội ngũ giúp việc được đào tạo bài
            bản và kiểm tra lý lịch kỹ càng.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayed.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
              bgColor={service.bgColor}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/customer/list-services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-stone-300 text-stone-600 font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors duration-200"
          >
            Xem tất cả dịch vụ
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
