namespace MyWebApi.DTO.Response
{
    // Dữ liệu trả về khi lấy lịch
    public class LichRanhResponse
    {
        public string MaLichRanh { get; set; } = null!;
        public string Ngay { get; set; } = null!; // Format: yyyy-MM-dd
        public List<ChiTietCaLamResponse> ChiTietCaLam { get; set; } = new List<ChiTietCaLamResponse>();
    }

    public class ChiTietCaLamResponse
    {
        public string MaCaLamViec { get; set; }
        public string GioBatDau { get; set; }
        public string GioKetThuc { get; set; }
        
        public DateTime ThoiGianTao { get; set; } 
    }
}