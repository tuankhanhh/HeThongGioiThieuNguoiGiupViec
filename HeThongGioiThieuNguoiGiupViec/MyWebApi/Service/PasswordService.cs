using System.Security.Cryptography;
using System.Text;

namespace MyWebApi.Service
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }

    public class PasswordService : IPasswordService
    {
    
        /// Hash password sử dụng BCrypt - an toàn và chuẩn
     
        public string HashPassword(string password)
        {
            // Sử dụng BCrypt để hash password với salt tự động
            return BCrypt.Net.BCrypt.HashPassword(password);
        }


        /// Verify password với hash - kiểm tra mật khẩu có đúng không
        public bool VerifyPassword(string password, string hashedPassword)
        {
            // BCrypt tự động xử lý salt và verify
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
