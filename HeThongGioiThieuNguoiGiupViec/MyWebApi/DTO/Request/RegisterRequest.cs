using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    // DTO cho đăng ký user mới
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [StringLength(10, ErrorMessage = "Số điện thoại không được quá 10 ký tự")]
        public string SoDienThoai { get; set; }
        
        [Required(ErrorMessage = "Password là bắt buộc")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password phải từ 6-100 ký tự")]
        public string MatKhau { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "FullName là bắt buộc")]
        [StringLength(100, ErrorMessage = "FullName không được quá 100 ký tự")]
        public string HoTen { get; set; }
    }
}
