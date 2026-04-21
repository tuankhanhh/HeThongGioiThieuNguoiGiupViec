"use client";

import { useEffect, useState, useRef } from "react";
import { motion, Variants, useInView } from "framer-motion";

/* ===================== Count Up ===================== */

interface CountUpNumberProps {
  value: string;
  start: boolean;
}

const CountUpNumber = ({ value, start }: CountUpNumberProps) => {
  const [count, setCount] = useState(0);

  const numMatch = value.match(/[\d,.]+/);
  const numericString = numMatch ? numMatch[0].replace(/,/g, "") : "0";
  const target = Number(numericString) || 0;
  const isFloat = numericString.includes(".");
  const suffix = value.replace(/[\d,.]+/g, "");

  useEffect(() => {
    if (!start) return;

    let frame = 0;
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    const counter = setInterval(() => {
      frame++;

      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      const current = progress * target;

      if (frame >= totalFrames) {
        setCount(target);
        clearInterval(counter);
      } else {
        setCount(current);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [target, start]);

  const displayValue = isFloat
    ? count.toFixed(1)
    : Math.round(count).toLocaleString("en-US");

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
};

/* ===================== Feature Item ===================== */

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const textVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function FeatureItem({
  icon,
  title,
  description,
  highlight,
}: FeatureItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex gap-5 p-6 rounded-2xl bg-white border border-stone-100 
                 hover:shadow-lg hover:border-amber-300 
                 transition-all duration-300 group"
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-50 
                   flex items-center justify-center text-3xl
                   group-hover:bg-amber-100 group-hover:scale-110 
                   transition-all duration-300"
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3 className="font-bold text-stone-800 text-lg mb-2 flex items-center gap-2 flex-wrap">
          {title}

          {highlight && (
            <span
              className="text-sm px-2.5 py-1 rounded-full 
                         bg-emerald-100 text-emerald-700 
                         font-medium whitespace-nowrap"
            >
              {highlight}
            </span>
          )}
        </h3>

        <p className="text-stone-500 text-base leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ===================== Data ===================== */

const features = [
  {
    icon: "🔍",
    title: "Lý lịch tư pháp rõ ràng",
    description:
      "100% người giúp việc được xác minh danh tính và kiểm tra lý lịch trước khi gia nhập hệ thống.",
    highlight: "Đã kiểm chứng",
  },
  {
    icon: "🎓",
    title: "Đào tạo chuyên nghiệp",
    description:
      "Tất cả nhân viên trải qua chương trình đào tạo kỹ năng nghiệp vụ được chuẩn hóa.",
  },
  {
    icon: "🛡️",
    title: "Bảo hiểm đồ đạc",
    description:
      "Mọi thiệt hại về tài sản trong quá trình làm việc đều được bảo hiểm đầy đủ.",
    highlight: "Bảo vệ toàn diện",
  },
  {
    icon: "⏰",
    title: "Hỗ trợ khách hàng 24/7",
    description:
      "Đội ngũ hỗ trợ luôn sẵn sàng giải quyết mọi vấn đề bất kỳ lúc nào bạn cần.",
  },
  {
    icon: "⭐",
    title: "Đánh giá minh bạch",
    description:
      "Hệ thống đánh giá hai chiều giúp đảm bảo chất lượng dịch vụ luôn được duy trì cao.",
  },
  {
    icon: "🔄",
    title: "Đổi người dễ dàng",
    description:
      "Không hài lòng? Chúng tôi sẽ sắp xếp người thay thế miễn phí trong vòng 24 giờ.",
  },
  {
    icon: "💰",
    title: "Giá cả minh bạch",
    description:
      "Không phí ẩn. Bảng giá rõ ràng, thanh toán an toàn qua ứng dụng.",
  },
  {
    icon: "📍",
    title: "Phủ sóng rộng khắp",
    description:
      "Dịch vụ hiện có mặt tại hơn 10 quận/huyện tại TP.Đà Nẵng và đang mở rộng nhanh chóng.",
  },
];

/* ===================== Main Component ===================== */

export default function FeatureGrid() {
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true });
  return (
    <section id="why-us" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={textVariants}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-5 py-2 rounded-full 
                       bg-violet-100 text-violet-700 
                       text-base font-semibold mb-5"
          >
            Cam kết chất lượng
          </span>

          <h2
            className="text-5xl sm:text-6xl 
                       font-bold text-stone-800 mb-6"
          >
            Vì sao chọn <span className="text-amber-500">Homezy ?</span>
          </h2>

          <p
            className="text-stone-500 text-xl 
                       max-w-2xl mx-auto leading-relaxed"
          >
            Chúng tôi đặt sự an toàn và tin tưởng của gia đình bạn lên hàng đầu
            trong mọi hoạt động.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 mb-16 
                     p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2rem] 
                     bg-gradient-to-r from-amber-50 to-orange-50 
                     border border-amber-100"
        >
          {[
            { value: "5,000+", label: "Gia đình tin dùng" },
            { value: "98%", label: "Tỷ lệ hài lòng" },
            { value: "800+", label: "Nhân viên duyệt" }, // Rút gọn chữ một chút cho bản mobile
            { value: "4.9★", label: "Đánh giá" }, // Rút gọn chữ một chút cho bản mobile
          ].map((stat, i) => (
            <div key={i} className="text-center flex flex-col justify-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-500 font-display">
                <CountUpNumber value={stat.value} start={isInView} />
              </p>

              <p className="text-stone-600 text-xs sm:text-sm md:text-base font-medium mt-1 sm:mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => (
            <FeatureItem key={i} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
