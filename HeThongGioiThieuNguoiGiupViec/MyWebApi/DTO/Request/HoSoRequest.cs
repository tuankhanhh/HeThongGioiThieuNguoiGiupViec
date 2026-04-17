using Microsoft.AspNetCore.Http;

namespace MyWebApi.DTO.Request
{
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

        // Entity của bạn là string
        public string? KinhNghiem { get; set; }

        public string? MoTaChiTietKinhNghiem { get; set; }

        public List<string> DanhSachMaKyNang { get; set; } = new();

        public IFormFile? FileAnhCccdmatTruoc { get; set; }
        public IFormFile? FileAnhCccdmatSau { get; set; }
        public IFormFile? FileAnhChanDung { get; set; }
        public IFormFile? FileAnhGiayXacNhanCuTru { get; set; }
    }
}