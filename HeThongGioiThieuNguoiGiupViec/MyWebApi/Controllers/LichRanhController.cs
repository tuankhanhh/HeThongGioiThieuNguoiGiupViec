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
            // 1. Lấy MaNguoiDung từ Token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });
            }

            // 2. Kiểm tra logic thời gian cơ bản
            if (request.GioBatDau >= request.GioKetThuc)
            {
                return BadRequest(new { message = "Giờ bắt đầu phải nhỏ hơn giờ kết thúc." });
            }

            // 3. Bảo vệ Business Rule (Đồng bộ với Frontend)
            var today = DateOnly.FromDateTime(DateTime.Now);
            var minDate = today.AddDays(3);

            if (request.Ngay < minDate)
            {
                return BadRequest(new { message = "Chỉ có thể đăng ký lịch rảnh trước ít nhất 3 ngày." });
            }

            // Kiểm tra giới hạn 2 ca/ngày
            var caTrongNgay = await _context.LichRanhs
                .CountAsync(l => l.MaNguoiGiupViec == userId && l.Ngay == request.Ngay);

            if (caTrongNgay >= 2)
            {
                return BadRequest(new { message = "Bạn chỉ được đăng ký tối đa 2 ca làm việc trong một ngày." });
            }

            // 4. Thuật toán kiểm tra Overlap tối ưu
            bool isOverlapped = await _context.LichRanhs.AnyAsync(l =>
                l.MaNguoiGiupViec == userId &&
                l.Ngay == request.Ngay &&
                (request.GioBatDau < l.GioKetThuc && request.GioKetThuc > l.GioBatDau) // Công thức vàng check overlap
            );

            if (isOverlapped)
            {
                return BadRequest(new { message = "Khung giờ này đã bị trùng với lịch rảnh khác của bạn." });
            }

            // 5. Khắc phục lỗi sinh ID
            // Tìm mã lớn nhất hiện tại có tiền tố "LR", ví dụ "LR015" -> cắt lấy số 15
            var maxIdStr = await _context.LichRanhs
                .Where(l => l.MaLichRanh.StartsWith("LR"))
                .MaxAsync(l => l.MaLichRanh);

            int nextNumber = 1;
            if (!string.IsNullOrEmpty(maxIdStr) && maxIdStr.Length > 2)
            {
                if (int.TryParse(maxIdStr.Substring(2), out int currentMax))
                {
                    nextNumber = currentMax + 1;
                }
            }
            string newId = $"LR{nextNumber:D3}";

            // 6. Lưu dữ liệu
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
