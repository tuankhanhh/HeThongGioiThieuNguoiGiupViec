"use client";

import BookingStepper from "@/components/BookingStepper";
import OrderSummary from "@/components/OrderSumary";

export default function PaymentPage() {
  // Giả sử dữ liệu lấy từ Context hoặc trang trước
  const paymentData = {
    bankName: "Techcombank",
    accountNumber: "1903 4567 8901",
    accountHolder: "TRAN DANG TUAN KHANH",
    content: "Thanh toán dịch vụ",
    qrUrl: "/qr-code-placeholder.png", // Thay bằng link QR thật
  };

  return (
    <div className="min-h-screen bg-[#f8fbfb] py-10 px-4 md:px-20 font-sans text-[#2D4646]">
      {/* 1. Stepper ở bước cuối (activeStep = 4) */}
      <BookingStepper activeStep={3} />

      <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-10">
        {/* 2. LEFT: PHƯƠNG THỨC THANH TOÁN */}
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-3 text-[#1A3131]">
            Phương thức thanh toán
          </h1>
          <p className="text-gray-500 mb-8 text-[15px] leading-relaxed">
            Vui lòng chọn phương thức thanh toán phù hợp. Đối với dịch vụ theo
            tháng, chúng tôi chỉ thu trước một phần tiền cọc để đảm bảo lịch
            trình.
          </p>

          {/* Card Thông tin chuyển khoản */}
          <div className="bg-[#f0f7f6] rounded-[24px] p-8 border border-[#e0eceb] flex flex-col md:flex-row gap-8 items-center">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-40 h-40 relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
                <span className="text-[10px] text-gray-400">QR CODE</span>
                {/* <Image src={paymentData.qrUrl} alt="QR Payment" fill className="object-contain" /> */}
              </div>
            </div>

            {/* Chi tiết chuyển khoản */}
            <div className="flex-1 w-full space-y-4">
              <h3 className="text-[#0d7660] font-bold text-lg mb-4">
                Thông tin chuyển khoản
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-bold text-[#1A3131]">
                    {paymentData.bankName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tài khoản:</span>
                  <span className="font-bold text-[#1A3131] tracking-wider">
                    {paymentData.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-bold text-[#1A3131]">
                    {paymentData.accountHolder}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nội dung:</span>
                  <span className="font-bold text-[#0d7660]">
                    {paymentData.content}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 italic pt-2">
                * Hệ thống sẽ tự động xác nhận sau 2-5 phút khi nhận được tiền.
              </p>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: TÓM TẮT ĐƠN HÀNG */}
        <div className="lg:col-span-4 space-y-6">
          <OrderSummary
            duration={8} // 08:00 - 17:00
            startTime="08:00"
            endTime="17:00"
            startDate="Thứ 2 - Thứ 6"
            endDate="Bắt đầu: 24/05"
            numberOfDays={20} // Giả định theo tháng
            totalBasePrice={12500000}
            vat={0} // Trong ảnh ví dụ không thấy nhắc tới VAT riêng
            finalPrice={3750000} // Giá trị tiền cọc cần thanh toán
            nextStepUrl="/customer/list-services/success"
            buttonText="Thanh toán"
          />
        </div>
      </div>
    </div>
  );
}
