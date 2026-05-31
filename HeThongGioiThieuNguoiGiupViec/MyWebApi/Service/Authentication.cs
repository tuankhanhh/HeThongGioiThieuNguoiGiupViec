using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Extensions;
namespace MyWebApi.Service
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<LoginResponse> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> RegisterAsyncMaid(RegisterRequest request);
        Task<LoginResponse> RegisterAsyncStaff(RegisterRequest request);
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

            if (user == null)
            {
                throw new UnauthorizedAccessException("Sai tài khoản hoặc mật khẩu");
            }

            bool isPasswordValid = _passwordService.VerifyPassword(request.MatKhau, user.MatKhau);

            // Kiểm tra mật khẩu trước
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Sai tài khoản hoặc mật khẩu");
            }

            // Kiểm tra trạng thái tài khoản sau khi xác thực mật khẩu thành công
            if (!user.TrangThai)
            {
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa");
            }

            var roles = user.NguoiDungVaiTros
                .Where(ur => ur.MaVaiTroNavigation != null && !string.IsNullOrEmpty(ur.MaVaiTroNavigation.TenVaiTro))
                .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                .ToList();

            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.NgayTaoRefreshToken = DateTime.Now;
            user.NgayHetHanRefreshToken = DateTime.Now.AddDays(7);

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


            string maKhachHangMoi = await _context.GenerateIdAsync("NguoiDung", "MaNguoiDung", "KH");

            var newUser = new NguoiDung
            {
                MaNguoiDung = maKhachHangMoi,
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

            string maMaidMoi = await _context.GenerateIdAsync("NguoiDung", "MaNguoiDung", "GV");

            var newUser = new NguoiDung
            {
                MaNguoiDung = maMaidMoi,
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

        public async Task<LoginResponse> RegisterAsyncStaff(RegisterRequest request)
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

            string maMaidMoi = await _context.GenerateIdAsync("NguoiDung", "MaNguoiDung", "NV");

            var newUser = new NguoiDung
            {
                MaNguoiDung = maMaidMoi,
                MatKhau = hashedPassword,
                HoTen = request.HoTen,
                Email = request.Email,
                SoDienThoai = request.SoDienThoai,
                TrangThai = true,
                NgayTao = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync();

            await AssignRoleToUserAsync(newUser.MaNguoiDung, "Staff");

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

            if (user == null || user.NgayHetHanRefreshToken == null || user.NgayHetHanRefreshToken < DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn");
            }

            if (!user.TrangThai)
            {
                throw new UnauthorizedAccessException("User đã bị khóa");
            }

            var roles = user.NguoiDungVaiTros
                .Where(ur => ur.MaVaiTroNavigation != null && !string.IsNullOrEmpty(ur.MaVaiTroNavigation.TenVaiTro))
                .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                .ToList();

            var newAccessToken = _tokenService.GenerateAccessToken(user, roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.NgayTaoRefreshToken = DateTime.UtcNow;
            user.NgayHetHanRefreshToken = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                VaiTro = roles.FirstOrDefault()
            };
        }

        public async Task<bool> AssignRoleToUserAsync(string maNguoiDung, string roleName)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            var role = await _context.VaiTros
                .FirstOrDefaultAsync(r => r.TenVaiTro == roleName);

            if (user == null || role == null)
                return false;

            // Lấy tất cả vai trò hiện tại của user
            var currentRoles = await _context.NguoiDungVaiTros
                .Where(ur => ur.MaNguoiDung == maNguoiDung)
                .Include(ur => ur.MaVaiTroNavigation)
                .ToListAsync();

            // Xóa tất cả vai trò cũ (trừ Admin để bảo vệ)
            var rolesToRemove = currentRoles
                .Where(ur => ur.MaVaiTroNavigation.TenVaiTro != "Admin")
                .ToList();

            _context.NguoiDungVaiTros.RemoveRange(rolesToRemove);

            // Kiểm tra xem vai trò mới đã tồn tại chưa
            var roleExists = currentRoles.Any(ur => ur.MaVaiTro == role.MaVaiTro);

            // Thêm vai trò mới nếu chưa có
            if (!roleExists)
            {
                var userRole = new NguoiDungVaiTro
                {
                    MaNguoiDung = maNguoiDung,
                    MaVaiTro = role.MaVaiTro,
                    NgayGan = DateTime.UtcNow
                };

                _context.NguoiDungVaiTros.Add(userRole);
            }

            await _context.SaveChangesAsync();

            return true;
        }
    }
}