using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MyWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Controllers
{
    [Route("api")]
    public class KhieuNaiController : Controller
    {
        private readonly ApplicationDbContext _context;

        public KhieuNaiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("complaints")]
        public async Task<IActionResult> GetComplaintHistory()
        {
            // Lấy ID Khách hàng từ Token
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh." });
            }

            // Truy vấn bảng KhieuNai
            var rawComplaints = await _context.KhieuNais
                .Include(k => k.MaDonNavigation) // Lấy thông tin đơn đặt liên quan
                .Where(k => k.MaKhachHang == customerId)
                .OrderByDescending(k => k.ThoiGian) // Mới nhất lên đầu
                .ToListAsync();

            var mappedComplaints = rawComplaints.Select(k => new ComplaintDto
            {
                MaKhieuNai = k.MaKhieuNai,
                MaDon = k.MaDon,
                // Giả sử bảng KhieuNai của bạn có trường NoiDung và PhanHoi (nếu chưa có bạn cần tự map trường tương ứng)
                NoiDung = k.GetType().GetProperty("NoiDung")?.GetValue(k, null)?.ToString() ?? "Không có nội dung",
                PhanHoi = k.GetType().GetProperty("PhanHoi")?.GetValue(k, null)?.ToString() ?? "",
                ThoiGian = k.ThoiGian?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                TrangThai = k.TrangThai ?? "Chưa xử lý"
            }).ToList();

            return Ok(mappedComplaints);
        }

        public class ComplaintDto
        {
            public string MaKhieuNai { get; set; } = null!;
            public string MaDon { get; set; } = null!;
            public string NoiDung { get; set; } = null!;
            public string PhanHoi { get; set; } = null!;
            public string ThoiGian { get; set; } = null!;
            public string TrangThai { get; set; } = null!;
        }
    }
}
