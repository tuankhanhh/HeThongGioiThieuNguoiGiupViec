namespace MyWebApi.DTO.Request.Staff
{
    public class TuChoiYeuCauRequest
    {
        /// <summary>
        /// Mã đơn đặt bị từ chối
        /// </summary>
        public string MaDon { get; set; } = null!;

        /// <summary>
        /// Lý do từ chối yêu cầu – bắt buộc
        /// </summary>
        public string LyDoTuChoi { get; set; } = null!;
    }
}
