using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    // DTO cho đăng ký user mới
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Username là bắt buộc")]
        [StringLength(50, ErrorMessage = "Username không được quá 50 ký tự")]
        public string UserName { get; set; }
        
        [Required(ErrorMessage = "Password là bắt buộc")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password phải từ 6-100 ký tự")]
        public string Password { get; set; }
        
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }
        
        [Required(ErrorMessage = "FullName là bắt buộc")]
        [StringLength(100, ErrorMessage = "FullName không được quá 100 ký tự")]
        public string FullName { get; set; }
    }
}
