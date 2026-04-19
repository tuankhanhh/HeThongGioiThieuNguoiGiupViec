namespace MyWebApi.DTO.Response
{
    public class LichRanhResponse
    {
        public string MaLichRanh { get; set; }
        public DateOnly? Ngay { get; set; }
        public TimeOnly? GioBatDau { get; set; }
        public TimeOnly? GioKetThuc { get; set; }
    }
}
