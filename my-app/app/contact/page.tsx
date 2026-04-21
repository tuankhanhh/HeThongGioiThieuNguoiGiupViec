"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Header from "@/components/header/app.header";
import { Footer } from "react-day-picker";

// Dữ liệu thông tin liên hệ
const contactInfo = [
  {
    icon: "📍",
    title: "Văn phòng chính",
    detail: "Số 1 Phạm Viết Chánh, Cẩm Lệ, TP. Đà Nẵng",
    color: "text-rose-500",
    bgColor: "bg-rose-100",
  },
  {
    icon: "📞",
    title: "Hotline (24/7)",
    detail: "1900 1234 - 0905 123 456",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    icon: "✉️",
    title: "Email hỗ trợ",
    detail: "ttuankhanh4@gmail.com",
    color: "text-sky-500",
    bgColor: "bg-sky-100",
  },
  {
    icon: "⏰",
    title: "Giờ làm việc",
    detail: "Thứ 2 - Chủ Nhật: 7:00 - 21:00",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100",
  },
];

// Hiệu ứng Framer Motion
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

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Giả lập gửi form API delay 1.5s
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-stone-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4 tracking-wide">
              Liên hệ với chúng tôi
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-800 font-display mb-4">
              Sẵn sàng hỗ trợ bạn <span className="text-amber-500">24/7</span>
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed">
              Bạn có câu hỏi, góp ý hay cần tư vấn dịch vụ? Đừng ngần ngại liên
              hệ, đội ngũ chăm sóc khách hàng của chúng tôi luôn trực chờ để
              giải đáp.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Cột Trái: Thông tin & Bản đồ */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Grid Thông tin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUpVariants}
                    className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${info.bgColor} ${info.color} flex items-center justify-center text-2xl`}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-stone-500 text-sm leading-relaxed">
                        {info.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bản đồ giả lập (Nên thay bằng iframe Google Maps thật) */}
              <motion.div
                variants={fadeUpVariants}
                className="bg-white p-2 rounded-3xl border border-stone-100 shadow-sm"
              >
                <div className="w-full h-64 bg-stone-200 rounded-2xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
                    alt="Bản đồ"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-bold text-stone-800 shadow-lg flex items-center gap-2">
                      <span className="text-amber-500 text-xl">📍</span> Nhấp để
                      xem Google Maps
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Cột Phải: Form Liên Hệ */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-stone-800 font-display mb-6">
                      Gửi lời nhắn cho chúng tôi
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0901 234 567"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Vấn đề cần hỗ trợ
                      </label>
                      <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all appearance-none cursor-pointer">
                        <option value="tu_van">Tư vấn dịch vụ</option>
                        <option value="phan_anh">Phản ánh chất lượng</option>
                        <option value="hop_tac">
                          Hợp tác trở thành đối tác
                        </option>
                        <option value="khac">Vấn đề khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Nội dung chi tiết
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Hãy mô tả chi tiết vấn đề của bạn..."
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-stone-900 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        "Gửi yêu cầu ngay"
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center py-10"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="w-10 h-10 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 font-display mb-2">
                      Gửi thành công!
                    </h3>
                    <p className="text-stone-500 text-base mb-8 max-w-sm">
                      Cảm ơn bạn đã liên hệ. Đội ngũ GiúpViệc Pro sẽ gọi lại cho
                      bạn qua số điện thoại đã cung cấp trong thời gian sớm
                      nhất.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-6 py-2.5 bg-stone-100 text-stone-600 font-bold rounded-full hover:bg-stone-200 transition-colors"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
