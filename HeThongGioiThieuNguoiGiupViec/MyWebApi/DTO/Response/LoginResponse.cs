namespace MyWebApi.DTO.Response
{
    // DTO response đơn giản - chỉ trả về token và refresh token
    public class LoginResponse
    {
        public string AccessToken { get; set; } // JWT token - hiệu lực 5 phút
        public string RefreshToken { get; set; } // Refresh token - hiệu lực 1 ngày
        public string VaiTro { get; set; }
    }
}
