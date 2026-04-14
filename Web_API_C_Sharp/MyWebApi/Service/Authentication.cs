using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Model;

namespace MyWebApi.Service
{
    public interface IAuthenticationService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<LoginResponse> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<bool> AssignRoleToUserAsync(int userId, string roleName);
    }

    public class AuthenticationService : IAuthenticationService
    {
        private readonly MyDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthenticationService(MyDbContext context, ITokenService tokenService, IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }
        
   
        /// Đăng nhập - trả về token và refresh token
    
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // Tìm user theo username
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserName == request.UserName);

            // Kiểm tra user tồn tại, active và verify password hash
            if (user == null || !user.IsActive || !_passwordService.VerifyPassword(request.Password, user.Password))
            {
                throw new UnauthorizedAccessException("Sai tài khoản hoặc mật khẩu");
            }

            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            // Tạo tokens
            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Lưu refresh token vào database
            user.RefreshToken = refreshToken;
            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        /// <summary>
        /// Đăng ký user mới - hash password
        /// </summary>
        public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
        {
            // Kiểm tra username đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.UserName == request.UserName))
            {
                throw new InvalidOperationException("Username đã tồn tại");
            }

            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("Email đã tồn tại");
            }

            // Hash password trước khi lưu
            var hashedPassword = _passwordService.HashPassword(request.Password);

            // Tạo user mới với password đã hash
            var newUser = new User
            {
                UserName = request.UserName,
                Password = hashedPassword, // Lưu password đã hash
                Email = request.Email,
                FullName = request.FullName,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Gán role mặc định "User" cho user mới
            await AssignRoleToUserAsync(newUser.UserId, "User");

            // Tự động login sau khi đăng ký (dùng password gốc chưa hash)
            var loginRequest = new LoginRequest
            {
                UserName = request.UserName,
                Password = request.Password // Password gốc để login
            };

            return await LoginAsync(loginRequest);
        }

        /// <summary>
        /// Refresh token - tạo access token mới từ refresh token
        /// </summary>
        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            // Tìm user có refresh token này
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Refresh token không hợp lệ");
            }

            // Lấy roles và tạo access token mới
            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();
            var newAccessToken = _tokenService.GenerateAccessToken(user, roles);

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = request.RefreshToken // Giữ nguyên refresh token
            };
        }

        /// <summary>
        /// Gán role cho user - chỉ Admin mới được
        /// </summary>
        public async Task<bool> AssignRoleToUserAsync(int userId, string roleName)
        {
            var user = await _context.Users.FindAsync(userId);
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (user == null || role == null)
            {
                return false;
            }

            // Kiểm tra user đã có role này chưa
            if (await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.RoleId))
            {
                return false; // User đã có role này rồi
            }

            // Thêm role cho user
            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = role.RoleId,
                AssignedDate = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
