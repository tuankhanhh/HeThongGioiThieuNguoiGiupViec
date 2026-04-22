using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class LichRanhRequest
    {
        public DateOnly Ngay { get; set; }
        public TimeSpan GioBatDau { get; set; }
        public TimeSpan GioKetThuc { get; set; }
    }
}
