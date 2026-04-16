namespace MyWebApi.DTO.Request
{
    public class BookingRequestDto
    {
        public string MaKhachHang { get; set; }
        public string DiaChiThucHien { get; set; }
        public string GhiChu { get; set; }
        public decimal TongTien { get; set; }
        public string PhuongThucThanhToan { get; set; }
        public string MaGiaoDich { get; set; }
        public List<DayOrderDto> ChiTietNgayLamViec { get; set; }
    }

    public class DayOrderDto
    {
        public DateTime NgayThucHien { get; set; }
        public string GioBatDau { get; set; }
        public List<ServiceOrderDto> DichVus { get; set; }
    }

    public class ServiceOrderDto
    {
        public string MaDichVu { get; set; }
        public int ThoiLuong { get; set; }
        public decimal ThanhTien { get; set; }
    }
}
