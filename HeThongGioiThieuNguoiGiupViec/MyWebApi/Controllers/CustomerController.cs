using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;
using MyWebApi.Service;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordService _passwordService;

        public CustomerController(ApplicationDbContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        [HttpGet("hoso")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Vui lòng đăng nhập lại." });

            var user = await _context.NguoiDungs
                .Where(u => u.MaNguoiDung == userId)
                .Select(u => new HoSoNguoiDungDTO
                {
                    HoTen = u.HoTen,
                    Email = u.Email, // Email thường không cho sửa trực tiếp ở đây
                    SoDienThoai = u.SoDienThoai,
                    DiaChi = u.DiaChi
                }).FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            return Ok(user);
        }

        // API cập nhật hồ sơ
        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] CapNhatHoSoDTO request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Vui lòng đăng nhập lại." });

            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Validate cơ bản
            if (string.IsNullOrWhiteSpace(request.HoTen))
                return BadRequest(new { message = "Họ tên không được để trống." });

            if (string.IsNullOrWhiteSpace(request.SoDienThoai) || request.SoDienThoai.Length > 10)
                return BadRequest(new { message = "Số điện thoại không hợp lệ." });

            // Cập nhật thông tin
            user.HoTen = request.HoTen;
            user.SoDienThoai = request.SoDienThoai;
            user.DiaChi = request.DiaChi;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật hồ sơ thành công!" });
        }

        [HttpGet("address")]
        [Authorize]
        public async Task<IActionResult> GetUserAddress()
        {
            // 1. Lấy ID Khách hàng từ Token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh. Vui lòng đăng nhập lại." });
            }

            // 2. Truy vấn chỉ lấy cột DiaChi từ bảng NguoiDung
            var user = await _context.NguoiDungs
                .Where(u => u.MaNguoiDung == userId)
                .Select(u => new { u.DiaChi })
                .FirstOrDefaultAsync();

            // 3. Kiểm tra xem người dùng có tồn tại không
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin người dùng trong hệ thống." });
            }

            // 4. Trả về kết quả (nếu DiaChi null trong DB thì trả về chuỗi rỗng)
            return Ok(new
            {
                diaChi = user.DiaChi ?? ""
            });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] DoiMatKhauDTO request)
        {
            // Lấy ID người dùng từ Token đăng nhập
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Vui lòng đăng nhập lại." });

            // Tìm người dùng trong database
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.MaNguoiDung == userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // 3. SỬ DỤNG SERVICE ĐỂ KIỂM TRA MẬT KHẨU CŨ
            // Gọi hàm VerifyPassword(mật_khẩu_nhập_vào, mật_khẩu_đã_hash_trong_DB)
            if (!_passwordService.VerifyPassword(request.MatKhauCu, user.MatKhau))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
            }

            // Kiểm tra độ dài mật khẩu mới
            if (string.IsNullOrWhiteSpace(request.MatKhauMoi) || request.MatKhauMoi.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
            }

            // 4. SỬ DỤNG SERVICE ĐỂ HASH MẬT KHẨU MỚI TRƯỚC KHI LƯU VÀO DB
            user.MatKhau = _passwordService.HashPassword(request.MatKhauMoi);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
    }
    public class CapNhatHoSoDTO
    {
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChi { get; set; }
    }

    public class HoSoNguoiDungDTO
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChi { get; set; }
    }
    public class DoiMatKhauDTO
    {
        public string MatKhauCu { get; set; }
        public string MatKhauMoi { get; set; }
    }
}
