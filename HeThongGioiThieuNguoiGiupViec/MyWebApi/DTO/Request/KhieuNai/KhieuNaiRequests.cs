namespace MyWebApi.DTO.Request.KhieuNai;

public class YeuCauTaiPhanCongDto
{
    public string maKhieuNai { get; set; } = null!;
    public int thoiGianLuiPhut { get; set; } = 30;
    public List<PhanCongThuCongItem>? danhSachPhanCongThuCong { get; set; }
}

public class YeuCauDoiNguoiThuCongDto
{
    public string maKhieuNai { get; set; } = null!;
    public string maNgayLamViec { get; set; } = null!;
    public string maNguoiGiupViecMoi { get; set; } = null!;
}

public class PhanCongThuCongItem
{
    public string maNgayLamViec { get; set; } = null!;
    public string maNguoiGiupViec { get; set; } = null!;
}
public class YeuCauHuyDonDto
{
    public string maKhieuNai { get; set; } = null!;
    public string noiDungPhanHoi { get; set; } = null!;
}

