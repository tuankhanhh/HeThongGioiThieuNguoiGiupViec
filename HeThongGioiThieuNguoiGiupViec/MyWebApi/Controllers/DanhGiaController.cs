using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Extensions; 
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("Submit")]
        public async Task<IActionResult> SubmitReview([FromBody] DanhGiaRequest request)
        {
            try
            {
                // 1. Lấy mã người dùng hiện tại
                var maKhachHang = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(maKhachHang))
                {
                    return Unauthorized(new { success = false, message = "Vui lòng đăng nhập." });
                }

                // 2. Tìm đơn đặt & kiểm tra quyền sở hữu
                var order = await _context.DonDats
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DanhGia)
                    .FirstOrDefaultAsync(d => d.MaDon == request.MaDon && d.MaKhachhang == maKhachHang);

                if (order == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt hoặc bạn không có quyền truy cập." });
                }

                // 3. Kiểm tra trạng thái đơn đặt (Chỉ đơn Đã hoàn thành mới được đánh giá)
                var currentStatus = order.LichSuTrangThaiDons
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .Select(l => l.TrangThai)
                    .FirstOrDefault();

                if (currentStatus != "Hoàn thành")
                {
                    return BadRequest(new { success = false, message = "Chỉ có thể đánh giá các đơn dịch vụ đã hoàn thành." });
                }

                // 4. Kiểm tra xem đơn này đã được đánh giá chưa
                if (order.DanhGia.Any())
                {
                    return BadRequest(new { success = false, message = "Đơn dịch vụ này đã được đánh giá rồi." });
                }

                // =========================================================================
                // 5. THAY ĐỔI TẠI ĐÂY: Tạo mã đánh giá tự động tuần tự từ Database (Ví dụ: DG001)
                // =========================================================================
                string newMaDanhGia = await _context.GenerateIdAsync("DanhGia", "MaDanhGia", "DG");

                // 6. Tạo record đánh giá mới
                var newReview = new DanhGium
                {
                    MaDanhGia = newMaDanhGia,
                    MaDon = request.MaDon,
                    SoSao = request.SoSao,
                    NoiDung = request.NoiDung
                };

                _context.DanhGia.Add(newReview);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cảm ơn bạn đã gửi đánh giá!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi gửi đánh giá.", detail = ex.Message });
            }
        }
    }

    public class DanhGiaRequest
    {
        [Required]
        public string MaDon { get; set; } = null!;

        [Range(1, 5, ErrorMessage = "Số sao phải từ 1 đến 5.")]
        public int SoSao { get; set; }

        public string? NoiDung { get; set; }
    }
}