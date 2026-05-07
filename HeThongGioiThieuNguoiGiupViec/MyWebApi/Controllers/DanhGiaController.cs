using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models; // Sửa lại namespace theo project của bạn

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Sửa MyDbContext thành DbContext của bạn

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTO nhận dữ liệu từ React


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
                    .Include(d => d.DanhGia) // EF tự sinh là DanhGia hoặc DanhGiums
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

                // 5. Tạo mã đánh giá tự động (Ví dụ: DG001) vì MaDanhGia là CHAR(5)
                var lastReview = await _context.DanhGia // Tên Dbset của bạn (có thể là DanhGias hoặc DanhGiums)
                    .OrderByDescending(d => d.MaDanhGia)
                    .FirstOrDefaultAsync();

                string newMaDanhGia = "DG001";
                if (lastReview != null && lastReview.MaDanhGia.StartsWith("DG"))
                {
                    if (int.TryParse(lastReview.MaDanhGia.Substring(2), out int lastId))
                    {
                        newMaDanhGia = $"DG{(lastId + 1):D3}";
                    }
                }

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

        // Nhận lời nhận xét từ UI (Nếu sau này DB có cột NhanXet thì dùng)
        public string? NoiDung { get; set; }
    }
}