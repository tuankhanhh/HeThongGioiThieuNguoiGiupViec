"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

// Định nghĩa kiểu dữ liệu cho Dịch vụ
interface ServiceType {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  icon: string;
  features: string[];
  popular?: boolean;
}

// Dữ liệu mẫu các dịch vụ
const services: ServiceType[] = [
  {
    id: "cleaning-regular",
    title: "Dọn dẹp nhà cửa",
    description:
      "Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.",
    price: "Từ 60.000đ/giờ",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
    icon: "✨",
    features: ["Quét & lau sàn", "Lau bụi nội thất", "Thu gom rác"],
    popular: true,
  },
  {
    id: "cleaning-deep",
    title: "Tổng vệ sinh",
    description:
      "Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.",
    price: "Từ 150.000đ/giờ",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
    icon: "🧽",
    features: [
      "Tẩy vết bẩn cứng đầu",
      "Vệ sinh bếp & toilet",
      "Hút bụi rèm cửa",
    ],
  },
  {
    id: "cooking",
    title: "Nấu ăn gia đình",
    description:
      "Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.",
    price: "Từ 80.000đ/giờ",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
    icon: "🍳",
    features: ["Lên thực đơn", "Đi chợ mua đồ", "Dọn dẹp sau nấu"],
  },
  {
    id: "childcare",
    title: "Chăm sóc trẻ em",
    description:
      "Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.",
    price: "Từ 70.000đ/giờ",
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    icon: "🧸",
    features: ["Cho bé ăn", "Tắm rửa & thay đồ", "Chơi cùng bé"],
    popular: true,
  },
  {
    id: "elderly-care",
    title: "Chăm sóc người cao tuổi",
    description:
      "Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.",
    price: "Từ 80.000đ/giờ",
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop",
    icon: "❤️",
    features: ["Hỗ trợ di chuyển", "Nhắc uống thuốc", "Trò chuyện tâm sự"],
  },
  {
    id: "sofa-cleaning",
    title: "Giặt sofa & nệm",
    description:
      "Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.",
    price: "Từ 250.000đ/sản phẩm",
    image:
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop",
    icon: "🛋️",
    features: ["Hút bụi bằng máy", "Tẩy ố bằng hơi nước", "Khử mùi diệt khuẩn"],
  },
];

// Hiệu ứng animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/* ================== Component Thẻ Dịch Vụ ================== */
function ServiceCard({ service }: { service: ServiceType }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Thumbnail Area */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-xl shadow-sm">
            {service.icon}
          </div>
        </div>
        {service.popular && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-sm">
            PHỔ BIẾN
          </div>
        )}

        {/* Price Tag (Nằm đè lên hình) */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-4 py-1.5 bg-amber-400 text-stone-900 font-bold text-sm rounded-full shadow-md">
            {service.price}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-stone-800 font-display mb-2 group-hover:text-amber-600 transition-colors">
          {service.title}
        </h3>
        <p className="text-stone-500 text-sm leading-relaxed mb-5 flex-1">
          {service.description}
        </p>

        {/* Features list */}
        <ul className="space-y-2 mb-6 border-t border-stone-100 pt-4">
          {service.features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-stone-600"
            >
              <svg
                className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <Link href="/customer/list-services/service-type">
          <button className="w-full py-3 px-4 bg-stone-50 hover:bg-amber-500 hover:text-white text-stone-700 font-bold rounded-xl border border-stone-200 hover:border-amber-500 transition-all duration-300 mt-auto">
            Đặt dịch vụ
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ================== Main Page Component ================== */
export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4 tracking-wide">
            Dịch vụ của chúng tôi
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-800 font-display mb-4">
            Giải pháp toàn diện cho <br />
            <span className="text-amber-500">tổ ấm của bạn</span>
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            Dù là dọn dẹp hàng ngày hay chăm sóc người thân, đội ngũ chuyên
            nghiệp của Homezy luôn sẵn sàng phục vụ với chất lượng tốt nhất.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
