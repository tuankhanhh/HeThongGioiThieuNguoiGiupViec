namespace MyWebApi.DTO.Request.Staff
{
    public class PhanCongCongViecRequest
    {
        /// <summary>
        /// Mã đơn đặt cần phân công
        /// </summary>
        public string MaDon { get; set; } = null!;

        /// <summary>
        /// Mã người giúp việc được phân công thực hiện đơn
        /// </summary>
        public string MaNguoiGiupViec { get; set; } = null!;
    }
}
