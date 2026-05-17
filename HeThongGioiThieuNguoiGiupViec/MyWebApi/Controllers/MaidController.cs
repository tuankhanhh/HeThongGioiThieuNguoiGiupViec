using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;
using System.Security.Claims;

namespace MyWebApi.Controllers
{
    [Route("api/v1/maid")]
    [ApiController]
    [Authorize(Roles = "Maid")]
    public class MaidController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaidController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> GetMonthlySchedule([FromQuery] int year, [FromQuery] int month)
        {
            var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maidId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh của người giúp việc." });
            }

            var targetStatuses = new List<string> { "Đã phân công", "Đang làm việc", "Hủy lịch" };

            var rawJobs = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDichVuNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                .Where(n => n.MaNguoiGiupViec == maidId
                            && n.NgayLam.HasValue
                            && n.NgayLam.Value.Year == year
                            && n.NgayLam.Value.Month == month
                            && targetStatuses.Contains(n.TrangThai))
                .ToListAsync();

            var mappedJobs = rawJobs.Select(n => new JobDto
            {
                MaCongViec = n.MaNgayLamViec,
                Ngay = n.NgayLam.Value.ToString("yyyy-MM-dd"),
                GioBatDau = n.GioBatDau.HasValue ? n.GioBatDau.Value.ToString(@"hh\:mm") : "00:00",
                LoaiDichVu = n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.TenDichVu ?? "Dịch vụ hệ thống",
                DiaChiKhachHang = n.MaDonDatDichVuNavigation?.MaDonNavigation?.DiaChi ?? "Chưa cập nhật địa chỉ",
                TrangThai = n.TrangThai ?? "Chưa rõ"
            }).ToList();

            // Trả thẳng mảng Data thay vì bọc trong đối tượng chứa stats
            return Ok(mappedJobs);
        }
    }

    public class JobDto
    {
        public string MaCongViec { get; set; } = null!;
        public string Ngay { get; set; } = null!;
        public string GioBatDau { get; set; } = null!;
        public string LoaiDichVu { get; set; } = null!;
        public string DiaChiKhachHang { get; set; } = null!;
        public string TrangThai { get; set; } = null!;
    }
}