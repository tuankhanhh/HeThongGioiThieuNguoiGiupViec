"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";

interface Review {
  id: number;
  content: string;
  rating: number;
  customerName: string;
  customerAvatar: string;
  serviceType: string;
  date: string;
  location: string;
}

const reviews: Review[] = [
  {
    id: 1,
    content:
      "Chị Lan làm việc rất cẩn thận và chuyên nghiệp. Nhà tôi sạch bóng sau mỗi lần chị đến. Điều tôi thích nhất là chị luôn đúng giờ và không cần nhắc nhở gì cả. Sẽ tiếp tục đặt dài hạn!",
    rating: 5,
    customerName: "Nguyễn Minh Châu",
    customerAvatar: "https://i.pravatar.cc/150?img=1",
    serviceType: "Dọn nhà định kỳ",
    date: "2 ngày trước",
    location: "Quận 1",
  },
  {
    id: 2,
    content:
      "Tìm được chị giúp việc chăm ba mẹ già thật sự khó, nhưng qua GiúpViệc Pro tôi rất hài lòng. Chị ấy kiên nhẫn, tận tâm và hiểu cách chăm sóc người cao tuổi.",
    rating: 5,
    customerName: "Trần Quang Hùng",
    customerAvatar: "https://i.pravatar.cc/150?img=2",
    serviceType: "Chăm sóc người già",
    date: "1 tuần trước",
    location: "Quận 7",
  },
  {
    id: 3,
    content:
      "App dễ dùng, đặt lịch nhanh. Chị nấu ăn ngon đúng gu gia đình, con tôi rất thích. Giá cả hợp lý, không có phí ẩn.",
    rating: 5,
    customerName: "Lê Thị Phương",
    customerAvatar: "https://i.pravatar.cc/150?img=3",
    serviceType: "Nấu ăn",
    date: "3 ngày trước",
    location: "Bình Thạnh",
  },
  {
    id: 4,
    content:
      "Hệ thống kiểm tra lý lịch rất kỹ cho tôi yên tâm. Chị trông bé rất chu đáo, bé cũng thích chị.",
    rating: 4.8,
    customerName: "Võ Thị Kim Anh",
    customerAvatar: "https://i.pravatar.cc/150?img=4",
    serviceType: "Chăm sóc trẻ",
    date: "5 ngày trước",
    location: "Quận 3",
  },
  {
    id: 5,
    content:
      "Đặt lịch dọn nhà tổng vệ sinh trước tết, chị đến đúng giờ, làm việc rất nhiệt tình.",
    rating: 4.9,
    customerName: "Phạm Đức Tài",
    customerAvatar: "https://i.pravatar.cc/150?img=5",
    serviceType: "Vệ sinh tổng thể",
    date: "2 tuần trước",
    location: "Tân Bình",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-amber-400" : "text-stone-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm h-full flex flex-col"
    >
      <p className="text-stone-600 text-base leading-relaxed flex-1 mb-5">
        {review.content}
      </p>

      <div className="flex items-center justify-between mb-5">
        <StarRating rating={Math.floor(review.rating)} />
        <span className="text-sm px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
          {review.serviceType}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
        <img
          src={review.customerAvatar}
          alt={review.customerName}
          className="w-11 h-11 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-stone-800 text-base">
            {review.customerName}
          </p>
          <p className="text-stone-400 text-sm">
            {review.location} · {review.date}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReviewSlider() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % reviews.length);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const visibleReviews = [
    reviews[current % reviews.length],
    reviews[(current + 1) % reviews.length],
    reviews[(current + 2) % reviews.length],
  ];

  return (
    <section className="py-24 bg-stone-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-sky-100 text-sky-700 text-base font-semibold mb-5">
            Khách hàng nói gì?
          </span>

          <h2 className="text-5xl font-bold text-stone-800 mb-4">
            Hàng nghìn gia đình
            <br />
            <span className="text-amber-500">đã tin tưởng chúng tôi</span>
          </h2>

          <p className="text-stone-500 text-xl max-w-xl mx-auto">
            Những đánh giá thực tế từ khách hàng đã trải nghiệm dịch vụ.
          </p>
        </motion.div>

        {/* Slider - Đã thêm key={current} */}
        <motion.div
          key={current}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:grid grid-cols-3 gap-6"
        >
          {visibleReviews.map((review) => (
            // Đã đổi key={i} thành key={review.id}
            <ReviewCard key={review.id} review={review} />
          ))}
        </motion.div>

        {/* Mobile - Thêm motion.div và key={current} để có hiệu ứng mượt */}
        <motion.div
          key={`mobile-${current}`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:hidden"
        >
          <ReviewCard review={reviews[current]} />
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full border border-stone-200 hover:border-amber-400 transition-colors"
          >
            ←
          </button>

          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-amber-400 w-8"
                    : "bg-stone-200 w-3 hover:bg-stone-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-11 h-11 rounded-full border border-stone-200 hover:border-amber-400 transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
