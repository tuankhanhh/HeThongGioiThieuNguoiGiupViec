namespace MyWebApi.DTO.Response
{
    public class MaidProfileResponse
    {
        // Thông tin từ bảng NguoiDung
        public string MaNguoiDung { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;

        // Thông tin từ bảng HoSoNguoiGiupViec
        public string AnhChanDung { get; set; } = string.Empty; // Thay cho Avatar
        public string KinhNghiem { get; set; } = string.Empty;
        public string MoTaChiTietKinhNghiem { get; set; } = string.Empty;
        public string TenNguoiThan { get; set; } = string.Empty; // Thay cho EmergencyContact
        public string SdtnguoiThan { get; set; } = string.Empty; // Thay cho EmergencyPhone

        // Danh sách kỹ năng định dạng "Mã - Tên"
        public List<string> DanhSachKyNang { get; set; } = new List<string>(); // Thay cho Skills
    }
}
