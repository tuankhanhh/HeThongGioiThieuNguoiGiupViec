using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;
using MyWebApi.Service;
using System.Security.Claims;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;

        public UserController(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        // ================= LOGIN =================
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ================= REGISTER =================
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("registerMaid")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterMaid(RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsyncMaid(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ================= REFRESH TOKEN =================
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ================= PROFILE =================
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var email = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Token không hợp lệ" });

            var user = await _context.NguoiDungs
                .Include(u => u.NguoiDungVaiTros)
                .ThenInclude(ur => ur.MaVaiTroNavigation)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return NotFound(new { message = "Không tìm thấy user" });

            var roles = user.NguoiDungVaiTros
                .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                .ToList();

            return Ok(new
            {
                MaNguoiDung = user.MaNguoiDung,
                HoTen = user.HoTen,
                Email = user.Email,
                TrangThai = user.TrangThai,
                NgayTao = user.NgayTao,
                Roles = roles
            });
        }

        // ================= GET ALL USERS =================
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.NguoiDungs
                .Include(u => u.NguoiDungVaiTros)
                .ThenInclude(ur => ur.MaVaiTroNavigation)
                .Select(u => new
                {
                    u.MaNguoiDung,
                    u.HoTen,
                    u.Email,
                    u.TrangThai,
                    u.NgayTao,
                    Roles = u.NguoiDungVaiTros
                        .Select(ur => ur.MaVaiTroNavigation.TenVaiTro)
                        .ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        // ================= ASSIGN ROLE =================
        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        {
            try
            {
                var result = await _authService.AssignRoleToUserAsync(request.MaNguoiDung, request.RoleName);

                if (result)
                    return Ok(new { message = "Gán role thành công" });

                return BadRequest(new { message = "Gán role thất bại" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // ================= DTO =================
    public class AssignRoleRequest
    {
        public string MaNguoiDung { get; set; }
        public string RoleName { get; set; }
    }
}