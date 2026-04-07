"use client";

import { motion, Variants } from "framer-motion";

// Dữ liệu Giá trị cốt lõi
const coreValues = [
  {
    icon: "❤️",
    title: "Tận tâm phục vụ",
    description:
      "Làm việc bằng cả trái tim, chăm sóc ngôi nhà của khách hàng như chính tổ ấm của mình.",
    bgColor: "bg-rose-50",
    iconBg: "bg-rose-100",
    textColor: "text-rose-600",
  },
  {
    icon: "🛡️",
    title: "An toàn tuyệt đối",
    description:
      "Quy trình xác minh nghiêm ngặt, bảo hiểm toàn diện giúp cả khách hàng và người lao động an tâm.",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    textColor: "text-emerald-600",
  },
  {
    icon: "💎",
    title: "Minh bạch rõ ràng",
    description:
      "Từ giá cả dịch vụ đến đánh giá chất lượng đều được công khai, không có chi phí ẩn.",
    bgColor: "bg-sky-50",
    iconBg: "bg-sky-100",
    textColor: "text-sky-600",
  },
  {
    icon: "🌱",
    title: "Đồng hành phát triển",
    description:
      "Không chỉ là nền tảng đặt lịch, chúng tôi đào tạo và nâng tầm nghề nghiệp cho người giúp việc.",
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-100",
    textColor: "text-amber-600",
  },
];

// Hiệu ứng
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Text Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6 tracking-wide">
                Câu chuyện của chúng tôi
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 font-display leading-tight mb-6">
                Hành trình mang <br />
                <span className="text-amber-500">bình yên</span> đến mọi nhà
              </h1>
              <p className="text-stone-600 text-lg sm:text-xl leading-relaxed mb-8">
                Homezy ra đời với niềm tin mãnh liệt: Việc nhà không nên là gánh
                nặng đánh cắp thời gian của những gia đình hiện đại, và nghề
                giúp việc cần được tôn vinh như một nghề nghiệp chuyên nghiệp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors shadow-lg shadow-stone-800/20">
                  Khám phá dịch vụ
                </button>
                <button className="px-8 py-4 bg-white text-stone-800 border border-stone-200 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 transition-colors">
                  Trở thành đối tác
                </button>
              </div>
            </motion.div>

            {/* Image Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-10"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-auto sm:h-[500px]">
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"
                  alt="Người giúp việc đang vui vẻ dọn dẹp"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 font-display mb-8">
              Sứ mệnh kép của Homezy
            </h2>
            <div className="text-stone-600 text-lg leading-relaxed space-y-6">
              <p>
                Đối với <strong>khách hàng</strong>, chúng tôi giải phóng bạn
                khỏi những công việc nhà không tên. Để sau một ngày dài làm việc
                căng thẳng, khi mở cửa bước vào, thứ đón chờ bạn là một ngôi nhà
                sạch sẽ, thơm tho và mâm cơm ấm cúng. Thời gian của bạn xứng
                đáng được dành cho việc nghỉ ngơi và những người thân yêu.
              </p>
              <p>
                Đối với <strong>người lao động</strong>, chúng tôi mang đến hàng
                ngàn cơ hội việc làm minh bạch, thu nhập ổn định và môi trường
                làm việc được tôn trọng. Chúng tôi đào tạo kỹ năng, trang bị bảo
                hiểm và ứng dụng công nghệ để giúp các cô, các chị tự hào về
                nghề nghiệp của mình.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-stone-800 font-display mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Những nguyên tắc định hình nên mọi quyết định và hành động của đội
              ngũ GiúpViệc Pro.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {coreValues.map((val, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                className={`p-8 rounded-3xl ${val.bgColor} border border-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${val.iconBg} ${val.textColor} flex items-center justify-center text-3xl mb-6 shadow-sm`}
                >
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">
                  {val.title}
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="bg-stone-900 rounded-[3rem] p-10 sm:p-16 relative overflow-hidden"
          >
            {/* Background pattern (optional graphic) */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-stone-800/50 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white font-display mb-6">
                Sẵn sàng trải nghiệm <br className="hidden sm:block" />
                sự khác biệt?
              </h2>
              <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
                Hãy để chúng tôi giúp bạn san sẻ gánh nặng việc nhà. Tải ứng
                dụng hoặc đặt lịch ngay hôm nay!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-8 py-4 bg-amber-500 text-stone-900 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25">
                  Tải ứng dụng ngay
                </button>
                <button className="px-8 py-4 bg-transparent text-white border border-stone-600 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                  Xem tất cả dịch vụ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
