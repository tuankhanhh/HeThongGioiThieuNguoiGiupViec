using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LichRanhController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LichRanhController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize] // Bắt buộc phải đăng nhập
        [HttpGet("my-schedule")]
        public async Task<IActionResult> GetMyLichRanh()
        {
            // 1. Lấy mã người dùng từ Token (Claims)
            // "NameIdentifier" thường là nơi chứa ID người dùng khi bạn tạo Token JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Không tìm thấy thông tin định danh trong Token.");
            }

            // 2. Truy vấn lịch của CHÍNH người đó
            var danhSachLich = await _context.LichRanhs
                .Where(l => l.MaNguoiGiupViec == userId) // Dùng ID lấy từ Token
                .OrderByDescending(l => l.Ngay)
                .ThenBy(l => l.GioBatDau)
                .Select(l => new LichRanhResponse
                {
                    MaLichRanh = l.MaLichRanh,
                    Ngay = l.Ngay,
                    GioBatDau = l.GioBatDau,
                    GioKetThuc = l.GioKetThuc
                })
                .ToListAsync();

            if (danhSachLich == null || danhSachLich.Count == 0)
            {
                return NotFound("Bạn chưa đăng ký lịch rảnh nào.");
            }

            return Ok(danhSachLich);
        }
        [HttpPost("dang-ky")]
        public async Task<IActionResult> CreateLichRanh([FromBody] LichRanhRequest request)
        {
            // 1. Lấy MaNguoiDung từ Token (Claim Types thường là NameIdentifier hoặc "Id")
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Không xác định được danh tính người dùng.");
            }

            // 2. Kiểm tra logic thời gian
            if (request.GioBatDau >= request.GioKetThuc)
            {
                return BadRequest("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
            }

            if (request.Ngay < DateOnly.FromDateTime(DateTime.Now))
            {
                return BadRequest("Không thể đăng ký lịch rảnh cho quá khứ.");
            }

            // 3. (Tùy chọn) Kiểm tra xem lịch này đã tồn tại chưa để tránh trùng (Overlap)
            bool isOverlapped = await _context.LichRanhs.AnyAsync(l =>
                l.MaNguoiGiupViec == userId &&
                l.Ngay == request.Ngay &&
                ((request.GioBatDau >= l.GioBatDau && request.GioBatDau < l.GioKetThuc) ||
                 (request.GioKetThuc > l.GioBatDau && request.GioKetThuc <= l.GioKetThuc)));

            if (isOverlapped)
            {
                return BadRequest("Khung giờ này đã bị trùng với lịch rảnh khác của bạn.");
            }

            // 4. Tạo mã MaLichRanh tự động (Vì DB của bạn là VARCHAR(5))
            // Lưu ý: Cách này chỉ dùng cho demo, thực tế nên dùng Identity hoặc Guid
            string newId = "LR" + (await _context.LichRanhs.CountAsync() + 1).ToString("D3");

            var newLich = new LichRanh
            {
                MaLichRanh = newId,
                MaNguoiGiupViec = userId,
                Ngay = request.Ngay,
                GioBatDau = request.GioBatDau,
                GioKetThuc = request.GioKetThuc
            };

            _context.LichRanhs.Add(newLich);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký lịch rảnh thành công", data = newLich });
        }
    }
}
