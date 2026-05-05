using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class UpdateMaidProfileRequest
    {
        [StringLength(100)]
        public string? TenNguoiThan { get; set; }

        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Số điện thoại khẩn cấp phải bao gồm đúng 10 chữ số.")]
        public string? SdtnguoiThan { get; set; }

        // Đã xóa KinhNghiem và MoTaChiTietKinhNghiem chung của hồ sơ

        // Danh sách kỹ năng kèm theo kinh nghiệm riêng biệt cho từng kỹ năng
        // Lưu ý: KyNangRequestDto đã được khai báo chung namespace ở file HoSoRequest.cs nên bạn có thể dùng trực tiếp luôn
        public List<KyNangRequestDto> DanhSachKyNang { get; set; } = new List<KyNangRequestDto>();
    }
}