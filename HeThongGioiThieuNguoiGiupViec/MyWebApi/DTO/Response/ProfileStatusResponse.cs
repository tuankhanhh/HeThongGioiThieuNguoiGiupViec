namespace MyWebApi.DTO.Response
{
    public class ProfileStatusResponse
    {
        public bool HasProfile { get; set; }
        public string? Status { get; set; } // "Chờ duyệt", "Đã duyệt", "Từ chối"
    }
}