namespace MyWebApi.DTO.Request.Staff
{
    /// <summary>
    /// Request phân công người giúp việc cho đơn đặt.
    /// - Trường hợp 1 người: chỉ cần MaDon + MaNguoiGiupViec.
    /// - Trường hợp 2 người: dùng PhanCongTheoDichVu để gán từng người cho từng DonDatDichVu.
    ///   Khi PhanCongTheoDichVu có dữ liệu, MaNguoiGiupViec có thể để trống (null/empty).
    /// </summary>
    public class PhanCongCongViecRequest
    {
        /// <summary>Mã đơn đặt cần phân công.</summary>
        public string MaDon { get; set; } = null!;

        /// <summary>
        /// Mã người giúp việc cho TOÀN BỘ đơn (trường hợp 1 người).
        /// Để trống nếu dùng PhanCongTheoDichVu.
        /// </summary>
        public string? MaNguoiGiupViec { get; set; }

        /// <summary>
        /// Danh sách phân công riêng theo từng DonDatDichVu (trường hợp 2 người).
        /// Nếu null/rỗng thì hệ thống dùng MaNguoiGiupViec cho tất cả.
        /// </summary>
        public List<PhanCongDichVuItem>? PhanCongTheoDichVu { get; set; }

        /// <summary>
        /// Phân công chi tiết theo từng NgayLamViec (trường hợp nhiều ngày, nhiều người).
        /// Ưu tiên cao nhất nếu có dữ liệu, bỏ qua MaNguoiGiupViec và PhanCongTheoDichVu.
        /// </summary>
        public List<PhanCongNgayLamViecItem>? PhanCongTheoNgayLamViec { get; set; }
    }

    /// <summary>Ánh xạ 1 DonDatDichVu -> 1 NguoiGiupViec.</summary>
    public class PhanCongDichVuItem
    {
        /// <summary>Mã DonDatDichVu cần gán.</summary>
        public string MaDonDatDichVu { get; set; } = null!;

        /// <summary>Mã người giúp việc được gán cho DonDatDichVu này.</summary>
        public string MaNguoiGiupViec { get; set; } = null!;
    }

    /// <summary>Ánh xạ 1 NgayLamViec -> 1 NguoiGiupViec.</summary>
    public class PhanCongNgayLamViecItem
    {
        /// <summary>Mã NgayLamViec cần gán.</summary>
        public string MaNgayLamViec { get; set; } = null!;

        /// <summary>Mã người giúp việc được gán cho NgayLamViec này.</summary>
        public string MaNguoiGiupViec { get; set; } = null!;
    }
}
