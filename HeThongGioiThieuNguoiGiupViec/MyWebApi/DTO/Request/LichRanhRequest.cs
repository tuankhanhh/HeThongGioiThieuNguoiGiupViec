using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class TaoLichRanhRequest
    {
        [Required]
        public DateOnly Ngay { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 ca làm việc.")]
        [MaxLength(2, ErrorMessage = "Tối đa 2 ca làm việc mỗi ngày.")]
        public List<ChiTietCaLamRequest> DanhSachCa { get; set; } = new List<ChiTietCaLamRequest>();
    }

    public class ChiTietCaLamRequest
    {
        [Required]
        public TimeOnly GioBatDau { get; set; }
        [Required]
        public TimeOnly GioKetThuc { get; set; }
    }
}