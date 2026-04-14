"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";

// ==========================================
// 1. DATA & INTERFACES
// ==========================================
interface MaidCardProps {
  name: string;
  age: number;
  experience: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  avatar: string;
  location: string;
  isVerified?: boolean;
}

const maids = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    age: 35,
    experience: 8,
    rating: 4.9,
    reviewCount: 127,
    skills: ["Dọn nhà", "Nấu ăn", "Giặt ủi"],
    avatar: "https://i.pravatar.cc/150?img=47",
    location: "Quận 1, TP.HCM",
    isVerified: true,
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    age: 42,
    experience: 12,
    rating: 4.8,
    reviewCount: 203,
    skills: ["Chăm sóc người già", "Nấu ăn", "Y tế cơ bản"],
    avatar: "https://i.pravatar.cc/150?img=48",
    location: "Quận 3, TP.HCM",
    isVerified: true,
  },
  {
    id: 3,
    name: "Lê Thị Hoa",
    age: 29,
    experience: 5,
    rating: 4.7,
    reviewCount: 89,
    skills: ["Chăm sóc trẻ", "Dọn nhà", "Nấu ăn"],
    avatar: "https://i.pravatar.cc/150?img=49",
    location: "Quận 7, TP.HCM",
    isVerified: true,
  },
  {
    id: 4,
    name: "Phạm Thị Thu",
    age: 38,
    experience: 10,
    rating: 4.9,
    reviewCount: 156,
    skills: ["Dọn nhà", "Chăm sóc trẻ", "Mua sắm"],
    avatar: "https://i.pravatar.cc/150?img=50",
    location: "Bình Thạnh, TP.HCM",
    isVerified: true,
  },
  {
    id: 5,
    name: "Võ Thị Hạnh",
    age: 31,
    experience: 6,
    rating: 4.6,
    reviewCount: 74,
    skills: ["Nấu ăn", "Giặt ủi", "Dọn nhà"],
    avatar: "https://i.pravatar.cc/150?img=51",
    location: "Gò Vấp, TP.HCM",
    isVerified: false,
  },
  {
    id: 6,
    name: "Đặng Thị Bích",
    age: 45,
    experience: 15,
    rating: 5.0,
    reviewCount: 312,
    skills: ["Chăm sóc người già", "Chăm sóc trẻ", "Y tế cơ bản"],
    avatar: "https://i.pravatar.cc/150?img=52",
    location: "Tân Bình, TP.HCM",
    isVerified: true,
  },
];

// ==========================================
// 2. ANIMATION VARIANTS (Framer Motion)
// ==========================================
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Các card sẽ hiện ra lần lượt cách nhau 0.15s
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ==========================================
// 3. HELPER COMPONENTS (StarRating & MaidCard)
// ==========================================
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? "text-amber-400"
              : star - rating < 1
                ? "text-amber-300"
                : "text-stone-200"
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

export function MaidCard({
  name,
  age,
  experience,
  rating,
  reviewCount,
  skills,
  avatar,
  location,
  isVerified = false,
}: MaidCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* Cover Background */}
      <div className="h-28 bg-gradient-to-br from-amber-50 to-orange-100 w-full"></div>

      {/* Avatar Area (Dùng -mt-12 để đè lên background) */}
      <div className="flex justify-center -mt-12 relative px-4">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white relative z-10"
          />
          {isVerified && (
            <div className="absolute bottom-0 right-0 z-20 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
              <svg
                className="w-3.5 h-3.5 text-white"
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
          )}
        </div>
      </div>

      {/* Info Area (flex-1 flex flex-col để tự động dàn trải chiều cao) */}
      <div className="p-5 pt-3 text-center flex-1 flex flex-col">
        <h3 className="font-bold text-stone-800 text-lg font-display line-clamp-1">
          {name}
        </h3>
        <p className="text-stone-500 text-sm mt-0.5">
          {age} tuổi • {experience} năm kinh nghiệm
        </p>

        {/* Location */}
        <p className="flex items-center justify-center gap-1 text-stone-400 text-xs mt-2">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{location}</span>
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <StarRating rating={rating} />
          <span className="text-stone-700 font-bold text-sm">
            {rating.toFixed(1)}
          </span>
          <span className="text-stone-400 text-xs">
            ({reviewCount} đánh giá)
          </span>
        </div>

        {/* Skills - Dùng mt-auto để đẩy khu vực này xuống tận cùng đáy Card */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-auto pt-5">
          {skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-stone-50 border border-stone-100 text-stone-600 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN COMPONENT (MaidCarousel)
// ==========================================
export default function MaidCarousel() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(maids.length / itemsPerPage);

  const displayedMaids = maids.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  );

  return (
    <section className="py-24 bg-stone-50 overflow-hidden" id="featured-maids">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Hiệu ứng trượt từ dưới lên khi cuộn tới */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4"
        >
          <div>
            <span className="inline-block px-5 py-2 rounded-full bg-rose-100 text-rose-700 text-base font-semibold mb-5 tracking-wide">
              Hồ sơ tiêu biểu
            </span>
            <h2 className="text-5xl sm:text-6xl font-bold text-stone-800 font-display leading-tight">
              Những người giúp việc
              <br />
              <span className="text-amber-500">được yêu thích nhất</span>
            </h2>
          </div>
        </motion.div>

        {/* Grid - Chứa hiệu ứng stagger (hiện lần lượt) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayedMaids.map((maid) => (
            // Bọc MaidCard trong motion.div để áp dụng hiệu ứng
            <motion.div key={maid.id} variants={cardVariants}>
              <MaidCard {...maid} />
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination dots - Fade in nhẹ nhàng */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mt-12"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-11 h-11 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-500 text-2xl hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i === currentPage
                    ? "bg-amber-400 w-8"
                    : "bg-stone-200 w-3 hover:bg-stone-300"
                }`}
              />
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="w-11 h-11 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-500 text-2xl hover:border-amber-400 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
