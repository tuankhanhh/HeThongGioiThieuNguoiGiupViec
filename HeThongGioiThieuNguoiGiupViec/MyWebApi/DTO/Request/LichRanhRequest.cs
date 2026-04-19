using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class LichRanhRequest
    {
        [Required]
        public DateOnly Ngay { get; set; }

        [Required]
        public TimeOnly GioBatDau { get; set; }

        [Required]
        public TimeOnly GioKetThuc { get; set; }
    }
}
