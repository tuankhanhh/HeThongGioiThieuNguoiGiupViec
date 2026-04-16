using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Models;

namespace MyWebApi.Service
{
    public interface ITokenService
    {
        string GenerateAccessToken(NguoiDung user, List<string> roles);
        string GenerateRefreshToken();
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateAccessToken(NguoiDung user, List<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var secret = _configuration["AppSettings:SecretKey"];
            var key = Encoding.UTF8.GetBytes(secret);

            var claims = new List<Claim>
            {
                // ID user (quan trọng nhất)
                new Claim(ClaimTypes.NameIdentifier, user.MaNguoiDung),

                // Họ tên
                new Claim(ClaimTypes.Name, user.HoTen ?? ""),

                // Số điện thoại (dùng login)
                new Claim("phone", user.SoDienThoai ?? ""),

                // Hiển thị nhanh cho frontend
                new Claim("fullName", user.HoTen ?? "")
            };

            // Roles
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(5),
                Issuer = _configuration["AppSettings:Issuer"],
                Audience = _configuration["AppSettings:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];

            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
    }
}