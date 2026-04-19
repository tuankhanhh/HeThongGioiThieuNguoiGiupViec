using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class UpdateMaidProfileRequest
    {
        [StringLength(100)]
        public string? TenNguoiThan { get; set; }

        // Thay đổi tại đây
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Số điện thoại khẩn cấp phải bao gồm đúng 10 chữ số.")]
        public string? SdtnguoiThan { get; set; }

        [StringLength(200)]
        public string? KinhNghiem { get; set; }

        [StringLength(200)]
        public string? MoTaChiTietKinhNghiem { get; set; }

        // Danh sách MaKyNang gửi từ Frontend (VD: ["KN001", "KN002"])
        public List<string> DanhSachMaKyNang { get; set; } = new List<string>();
    }
}