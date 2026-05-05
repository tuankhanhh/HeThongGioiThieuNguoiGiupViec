"use client";

import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 1. Hàm tách riêng xử lý VỊ TRÍ (appendDots)
const renderAppendDots = (dots: React.ReactNode) => (
  <div
    style={{
      position: "absolute",
      bottom: "20px",
      width: "100%",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <ul style={{ margin: "0px", padding: "0px" }}> {dots} </ul>
  </div>
);

// 2. Hàm tách riêng xử lý KÍCH THƯỚC (customPaging)
const renderCustomPaging = (i: number) => (
  <div
    style={{
      width: "12px",
      height: "12px",
      backgroundColor: "#ccc",
      borderRadius: "50%",
      margin: "0 4px",
    }}
  />
);

export default function Banner() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    appendDots: renderAppendDots, // <--- Gọi hàm tại đây
    customPaging: renderCustomPaging, // <--- Gọi hàm tại đây
  };

  const banners = [
    {
      image: "/banner1.jpg",
      title: "Giải pháp dọn dẹp nhà cửa thông minh",
      subtitle: "Nhanh chóng - Uy tín - An toàn",
    },
    {
      image: "/banner1.jpg",
      title: "Kết nối người giúp việc chuyên nghiệp",
      subtitle: "Tiết kiệm thời gian cho gia đình bạn",
    },
    {
      image: "/banner1.jpg",
      title: "Dịch vụ giúp việc tận tâm",
      subtitle: "Chăm sóc ngôi nhà của bạn như chính nhà mình",
    },
    {
      image: "/banner1.jpg",
      title: "Dịch vụ giúp việc tận tâm",
      subtitle: "Chăm sóc ngôi nhà của bạn như chính nhà mình",
    },
  ];

  return (
    <Box
      sx={{
        width: "90%",
        height: "600px",
        borderRadius: 7,
        overflow: "hidden",
        margin: "0 auto",
        marginTop: 2,
      }}
    >
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <Box key={index} sx={{ position: "relative", height: "600px" }}>
            {/* Background Image */}
            <Image
              src={banner.image}
              alt="banner"
              fill
              style={{ objectFit: "cover" }}
              priority={index === 0}
            />

            {/* Overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />

            {/* Content */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                textAlign: "center",
                px: 2,
              }}
            >
              {/* Slogan */}
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
                {banner.title}
              </Typography>

              {/* Subtitle */}
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {banner.subtitle}
              </Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
