using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace MyWebApi.DTO.Request
{
    // Class phụ để hứng dữ liệu mảng Kỹ Năng từ Frontend gửi lên
    public class KyNangRequestDto
    {
        public string MaKyNang { get; set; } = null!;
        public string? KinhNghiem { get; set; } // Ví dụ: "1 - 3 năm", "Dưới 1 năm"
    }

    public class HoSoRequest
    {
        public string MaNguoiGiupViec { get; set; } = null!;

        public string? SoCccd { get; set; }

        // DateOnly sẽ bind từ chuỗi yyyy-MM-dd
        public DateOnly? NgaySinh { get; set; }

        public string? GioiTinh { get; set; }

        public string? DiaChi { get; set; }

        public string? TenNguoiThan { get; set; }

        public string? SdtnguoiThan { get; set; }

        // Đã xóa KinhNghiem và MoTaChiTietKinhNghiem chung của hồ sơ

        // Danh sách kỹ năng kèm theo kinh nghiệm riêng biệt cho từng kỹ năng
        public List<KyNangRequestDto> DanhSachKyNang { get; set; } = new();

        public IFormFile? FileAnhCccdmatTruoc { get; set; }
        public IFormFile? FileAnhCccdmatSau { get; set; }
        public IFormFile? FileAnhChanDung { get; set; }
        public IFormFile? FileAnhGiayXacNhanCuTru { get; set; }
    }
}