using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Model;
using MyWebApi.Service;
using System.Security.Claims;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IAuthenticationService _authService;

        public UserController(MyDbContext context, IAuthenticationService authService)
        {
            _context = context;
            _authService = authService;
        }

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
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

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
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

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
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize] // Yêu cầu phải đăng nhập
        public async Task<IActionResult> GetProfile()
        {
            //var username = User.Identity.Name; // lấy từ ClaimTypes.Name
            // Lấy username từ JWT token claims
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized(new { message = "Token không hợp lệ" });
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy user" });
            }

            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            return Ok(new
            {
                UserId = user.UserId,
                UserName = user.UserName,
                Email = user.Email,
                FullName = user.FullName,
                Roles = roles,
                IsActive = user.IsActive,
                CreatedDate = user.CreatedDate
            });
        }

        /// Lấy danh sách tất cả users - Chỉ Admin mới được phép
     
        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được gọi
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.UserName,
                    u.Email,
                    u.FullName,
                    u.IsActive,
                    u.CreatedDate,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// Gán role cho user - Chỉ Admin mới được phép
        /// </summary>
        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        {
            try
            {
                var result = await _authService.AssignRoleToUserAsync(request.UserId, request.RoleName);
                if (result)
                {
                    return Ok(new { message = "Gán role thành công" });
                }
                return BadRequest(new { message = "Gán role thất bại" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // DTO cho việc gán role
    public class AssignRoleRequest
    {
        public int UserId { get; set; }
        public string RoleName { get; set; }
    }
}
