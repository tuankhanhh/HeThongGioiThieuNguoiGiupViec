namespace MyWebApi.DTO.Request.Staff
{
    public class TuChoiHoSoRequest
    {
        /// <summary>
        /// Mã hồ sơ bị từ chối
        /// </summary>
        public string MaHoSo { get; set; } = null!;

        /// <summary>
        /// Lý do từ chối – bắt buộc khi từ chối hồ sơ
        /// </summary>
        public string LyDoTuChoi { get; set; } = null!;
    }
}
