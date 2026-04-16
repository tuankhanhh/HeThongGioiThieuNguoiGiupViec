using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class HoSoRequest
    {
        // Thông tin NguoiDung
        [Required] public string Phone { get; set; } = null!;
        [Required] public string FullName { get; set; } = null!;
        public string? Address { get; set; }

        // Thông tin HoSoNguoiGiupViec
        public DateOnly? Dob { get; set; } // Map tự động từ "yyyy-MM-dd" của React
        public string? Gender { get; set; }
        public string? IdCard { get; set; }
        public string? RelativeName { get; set; }
        public string? RelativePhone { get; set; }
        public string? ExperienceYears { get; set; }
        public string? ExperienceDesc { get; set; }

        // Kỹ năng (Chuỗi JSON: "[\"cleaning\", \"cooking\"]")
        public string? Skills { get; set; }

        // File upload (Có thể null nếu không bắt buộc)
        public IFormFile? CccdFront { get; set; }
        public IFormFile? CccdBack { get; set; }
        public IFormFile? Portrait { get; set; }
        public IFormFile? Residence { get; set; }
    }
}
