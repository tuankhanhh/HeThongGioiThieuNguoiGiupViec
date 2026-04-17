using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;
using Microsoft.EntityFrameworkCore;
namespace MyWebApi.Service
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<LoginResponse> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> RegisterAsyncMaid(RegisterRequest request);
        Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<bool> AssignRoleToUserAsync(string maNguoiDung, string roleName);
    }

    public class AuthenticationService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthenticationService(
            ApplicationDbContext context,
            ITokenService tokenService,
            IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.NguoiDungs
                .Include(u => u.NguoiDungVaiTros)
                .ThenInclude(ur => ur.MaVaiTroNavigation)
                .FirstOrDefaultAsync(u => u.SoDienThoai == request.SoDienThoai);

            if (user == null || !user.TrangThai || !_passwordService.VerifyPassword(request.MatKhau, user.MatKhau))
            {
                throw new UnauthorizedAccessException("Sai tài khoản hoặc mật khẩu");
            }

            var roles = user.NguoiDungVaiTros
                .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                .ToList();

            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                VaiTro = roles.FirstOrDefault()
            };
        }

        public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.NguoiDungs.AnyAsync(u => u.SoDienThoai == request.SoDienThoai))
            {
                throw new InvalidOperationException("SĐT đã tồn tại");
            }
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("Email đã tồn tại");
            }
            var hashedPassword = _passwordService.HashPassword(request.MatKhau);

            var newUser = new NguoiDung
            {
                MaNguoiDung = Guid.NewGuid().ToString().Substring(0, 5),
                MatKhau = hashedPassword,
                HoTen = request.HoTen,
                Email = request.Email,
                SoDienThoai = request.SoDienThoai,
                TrangThai = true,
                NgayTao = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync();

            await AssignRoleToUserAsync(newUser.MaNguoiDung, "Customer");

            return await LoginAsync(new LoginRequest
            {
                SoDienThoai = request.SoDienThoai,
                MatKhau = request.MatKhau
            });
        }

        public async Task<LoginResponse> RegisterAsyncMaid(RegisterRequest request)
        {
            if (await _context.NguoiDungs.AnyAsync(u => u.SoDienThoai == request.SoDienThoai))
            {
                throw new InvalidOperationException("SĐT đã tồn tại");
            }
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("Email đã tồn tại");
            }
            var hashedPassword = _passwordService.HashPassword(request.MatKhau);

            var newUser = new NguoiDung
            {
                MaNguoiDung = Guid.NewGuid().ToString().Substring(0, 5),
                MatKhau = hashedPassword,
                HoTen = request.HoTen,
                Email = request.Email,
                SoDienThoai = request.SoDienThoai,
                TrangThai = true,
                NgayTao = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync();

            await AssignRoleToUserAsync(newUser.MaNguoiDung, "Maid");

            return await LoginAsync(new LoginRequest
            {
                SoDienThoai = request.SoDienThoai,
                MatKhau = request.MatKhau
            });
        }

        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var user = await _context.NguoiDungs
                .Include(u => u.NguoiDungVaiTros)
                .ThenInclude(ur => ur.MaVaiTroNavigation)
                .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Refresh token không hợp lệ");
            }

            var roles = user.NguoiDungVaiTros
                .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                .ToList();

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles);

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = request.RefreshToken
            };
        }

        public async Task<bool> AssignRoleToUserAsync(string maNguoiDung, string roleName)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            var role = await _context.VaiTros
                .FirstOrDefaultAsync(r => r.TenVaiTro == roleName);

            if (user == null || role == null)
                return false;

            if (await _context.NguoiDungVaiTros.AnyAsync(ur =>
                ur.MaNguoiDung == maNguoiDung && ur.MaVaiTro == role.MaVaiTro))
                return false;

            var userRole = new NguoiDungVaiTro
            {
                MaNguoiDung = maNguoiDung,
                MaVaiTro = role.MaVaiTro,
                NgayGan = DateTime.UtcNow
            };

            _context.NguoiDungVaiTros.Add(userRole);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}