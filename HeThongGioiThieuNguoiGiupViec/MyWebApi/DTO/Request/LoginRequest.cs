using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class LoginRequest
    {
        [Required]
        public string SoDienThoai { get; set; }

        [Required]
        public string MatKhau { get; set; }

    }
}
