// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, Variants } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { CircularProgress } from "@mui/material";
// import { api } from "@/services/api";
// import Header from "@/components/header/app.header";
// import { ROUTES } from "@/lib/routes";
// import Footer from "@/components/footer/app.footer";

// // 1. Cập nhật Interface (Bỏ trường icon)
// interface ServiceType {
//   id: string;
//   title: string;
//   description: string;
//   price: string;
//   image: string;
//   features: string[];
//   popular?: boolean;
// }

// // Giữ nguyên các hiệu ứng animation của bạn
// const containerVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15 },
//   },
// };

// const itemVariants: Variants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
// };

// const headerVariants: Variants = {
//   hidden: { opacity: 0, y: -20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
// };

// /* ================== Component Thẻ Dịch Vụ ================== */
// function ServiceCard({ service }: { service: ServiceType }) {
//   const router = useRouter();
//   const [isBooking, setIsBooking] = useState(false); // Thêm state này

//   const handleBooking = async () => {
//     if (typeof window === "undefined" || isBooking) return; // Chặn bấm nhiều lần
//     setIsBooking(true); // Bắt đầu loading

//     try {
//       const currentUser = await api.get<any>("/User/me");
//       const userRole = currentUser.role || currentUser.Role;

//       if (userRole !== "Customer") {
//         alert("Chỉ khách hàng mới có thể đặt lịch.");
//         router.push(ROUTES.CUSTOMER.LOGIN);
//         setIsBooking(false); // Tắt loading nếu fail
//         return;
//       }

//       localStorage.setItem("booking_services", JSON.stringify([service.id]));
//       router.push(ROUTES.CUSTOMER.SERVICE_TYPE);
//       // Chuyển trang rồi nên không cần setIsBooking(false) nữa
//     } catch (error: any) {
//       console.error("Xác thực thất bại hoặc lỗi gọi API:", error);
//       setIsBooking(false); // Tắt loading nếu catch lỗi
//     }
//   };

//   return (
//     <motion.div
//       variants={itemVariants}
//       className="group bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
//     >
//       {/* Thumbnail Area */}
//       <div className="relative h-56 overflow-hidden">
//         <img
//           src={`/images/dichvu/${service.image}`}
//           alt={service.title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />

//         {/* PHẦN ĐÃ BỎ ICON: Chỉ giữ lại badge PHỔ BIẾN nếu có */}
//         {service.popular && (
//           <div className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-sm">
//             PHỔ BIẾN
//           </div>
//         )}

//         {/* Price Tag */}
//         <div className="absolute bottom-4 left-4 right-4">
//           <span className="inline-block px-4 py-1.5 bg-amber-400 text-stone-900 font-bold text-sm rounded-full shadow-md">
//             {service.price}
//           </span>
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="p-6 flex flex-col flex-1">
//         <h3 className="text-xl font-bold text-stone-800 font-display mb-2 group-hover:text-amber-600 transition-colors">
//           {service.title}
//         </h3>
//         <p className="text-stone-500 text-sm leading-relaxed mb-5 flex-1">
//           {service.description}
//         </p>

//         {/* Features list */}
//         <ul className="space-y-2 mb-6 border-t border-stone-100 pt-4">
//           {service.features.map((feature, i) => (
//             <li
//               key={i}
//               className="flex items-start gap-2 text-sm text-stone-600"
//             >
//               <svg
//                 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//               <span>{feature}</span>
//             </li>
//           ))}
//         </ul>

//         {/* Action Button */}
//         <button
//           onClick={handleBooking}
//           className="w-full py-3 px-4 bg-stone-50 hover:bg-amber-500 hover:text-white text-stone-700 font-bold rounded-xl border border-stone-200 hover:border-amber-500 transition-all duration-300 mt-auto cursor-pointer disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:border-stone-200"
//         >
//           Đặt dịch vụ
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// /* ================== Main Page Component ================== */
// export default function ServicesPage() {
//   const [services, setServices] = useState<ServiceType[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 2. Gọi API từ Backend C#
//   // 2. Gọi API từ Backend C#
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         // Dùng api.get thay vì fetch thuần. Nó sẽ tự nối NEXT_PUBLIC_API_URL vào
//         // Giả sử api là public (không cần token), apiService vẫn hoạt động bình thường
//         const data = await api.get<ServiceType[]>("/dichvu");
//         setServices(data);
//       } catch (error) {
//         console.error("Lỗi lấy dữ liệu dịch vụ:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-stone-50 pt-24 pb-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Header Section */}
//           <motion.div
//             initial="hidden"
//             animate="visible"
//             variants={headerVariants}
//             className="text-center max-w-2xl mx-auto mb-16"
//           >
//             <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4 tracking-wide">
//               Dịch vụ của chúng tôi
//             </span>
//             <h1 className="text-4xl md:text-5xl font-bold text-stone-800 font-display mb-4">
//               Giải pháp toàn diện cho <br />
//               <span className="text-amber-500">tổ ấm của bạn</span>
//             </h1>
//             <p className="text-stone-500 text-lg leading-relaxed">
//               Dù là dọn dẹp hàng ngày hay chăm sóc người thân, đội ngũ chuyên
//               nghiệp của Homezy luôn sẵn sàng phục vụ với chất lượng tốt nhất.
//             </p>
//           </motion.div>

//           {/* Hiển thị Loading hoặc Grid dữ liệu */}
//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <CircularProgress color="inherit" className="text-amber-500" />
//             </div>
//           ) : (
//             <motion.div
//               variants={containerVariants}
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true, margin: "-50px" }}
//               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
//             >
//               {services.map((service) => (
//                 <ServiceCard key={service.id} service={service} />
//               ))}
//             </motion.div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }
import Header from "@/components/header/app.header";
import Footer from "@/components/footer/app.footer";
import ServicesClient from "@/components/componentsCustomer/ServicesClient";

// Định nghĩa Interface nếu cần tái sử dụng
interface ServiceType {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  features: string[];
  popular?: boolean;
}

// Hàm Fetch Data ở phía Server
async function getServices(): Promise<ServiceType[]> {
  try {
    // Dùng native fetch. Thêm URL đầy đủ.
    // Thêm revalidate để kiểm soát cache (Ví dụ: 60 giây cập nhật 1 lần) hoặc 'no-store' nếu muốn luôn lấy data mới
    const res = await fetch(`${process.env.API_URL}/dichvu`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Lỗi khi fetch danh sách dịch vụ");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return []; // Trả về mảng rỗng nếu lỗi để không crash app
  }
}

/* ================== Main Page Component (Server Component) ================== */
export default async function ServicesPage() {
  // Gọi API ở server trước khi render HTML gửi về client
  const services = await getServices();

  return (
    <>
      <Header />

      {/* Truyền data đã fetch xuống Client Component */}
      <ServicesClient services={services} />

      <Footer />
    </>
  );
}
