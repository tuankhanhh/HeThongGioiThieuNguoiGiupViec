namespace MyWebApi.DTO.Request.Staff
{
    public class CapNhatKhieuNaiRequest
    {
        /// <summary>
        /// Mã khiếu nại cần cập nhật
        /// </summary>
        public string MaKhieuNai { get; set; } = null!;

        /// <summary>
        /// Trạng thái mới: "Chờ xử lý" | "Đang xử lý" | "Đã xử lý"
        /// </summary>
        public string TrangThai { get; set; } = null!;

        /// <summary>
        /// Nội dung phản hồi – bắt buộc khi TrangThai = "Đã xử lý"
        /// </summary>
        public string? NoiDungPhanHoi { get; set; }
    }
}