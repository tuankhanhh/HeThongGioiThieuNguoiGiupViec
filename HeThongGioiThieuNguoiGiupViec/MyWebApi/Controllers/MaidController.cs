using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models; // Đảm bảo namespace này khớp với project của bạn
using System.Security.Claims;
using System.Globalization;

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

        // ==========================================================
        // 1. API Lấy Lịch Trình Theo Tháng (Dùng cho trang Lịch Tổng)
        // ==========================================================
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
                        .ThenInclude(m => m.LichSuTrangThaiDons) // Bắt buộc Include bảng lịch sử
                .Where(n => n.MaNguoiGiupViec == maidId
                            && n.NgayLam.HasValue
                            && n.NgayLam.Value.Year == year
                            && n.NgayLam.Value.Month == month
                            && targetStatuses.Contains(n.TrangThai)
                            // Kiểm tra trạng thái mới nhất trong bảng lịch sử
                            && n.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                                .Select(ls => ls.TrangThai)
                                .FirstOrDefault() == "Đã xác nhận")
                .ToListAsync();

            var mappedJobs = rawJobs.Select(n => new NgayLamViec
            {
                MaNgayLamViec = n.MaNgayLamViec,
                Ngay = n.NgayLam.Value.ToString("yyyy-MM-dd"),
                GioBatDau = n.GioBatDau.HasValue ? n.GioBatDau.Value.ToString("HH:mm") : "00:00",
                LoaiDichVu = n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.TenDichVu ?? "Dịch vụ hệ thống",
                DiaChiKhachHang = n.MaDonDatDichVuNavigation?.MaDonNavigation?.DiaChi ?? "Chưa cập nhật địa chỉ",
                TrangThai = n.TrangThai ?? "Chờ phân công",
                ThoiLuongThucHien = n.ThoiLuongThucHien ?? 0
            }).ToList();

            return Ok(mappedJobs);
        }

        // ==========================================================
        // 2. API Lấy Chi Tiết Công Việc Trong 1 Ngày (Dùng khi click vào ngày)
        // ==========================================================
        [HttpGet("schedule/{date}")]
        public async Task<IActionResult> GetDailyJobs(string date)
        {
            var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maidId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh." });
            }

            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
            {
                return BadRequest(new { message = "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd." });
            }

            var validStatuses = new List<string> { "Đã phân công", "Đang làm việc" };

            var rawJobs = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDichVuNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.MaKhachhangNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.LichSuTrangThaiDons) // Bắt buộc Include bảng lịch sử
                .Where(n => n.MaNguoiGiupViec == maidId
                            && n.NgayLam.HasValue
                            && n.NgayLam.Value == parsedDate
                            && validStatuses.Contains(n.TrangThai)
                            // Kiểm tra trạng thái mới nhất trong bảng lịch sử
                            && n.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                                .Select(ls => ls.TrangThai)
                                .FirstOrDefault() == "Đã xác nhận")
                .ToListAsync();

            var mappedJobs = rawJobs.Select(n => new ChiTietNgayLamViec
            {
                MaNgayLamViec = n.MaNgayLamViec,
                MaDon = n.MaDonDatDichVuNavigation?.MaDon ?? "N/A",
                NgayLam = n.NgayLam.Value.ToString("yyyy-MM-dd"),
                GioBatDau = n.GioBatDau.HasValue ? n.GioBatDau.Value.ToString("HH:mm:ss") : "00:00:00",
                GioKetThuc = n.GioKetThuc.HasValue ? n.GioKetThuc.Value.ToString("HH:mm:ss") : "00:00:00",
                ThoiLuongThucHien = n.ThoiLuongThucHien ?? 0,
                TenDichVu = n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.TenDichVu ?? "Dịch vụ hệ thống",
                HoTenKhach = n.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.HoTen ?? "Chưa rõ khách hàng",
                SdtKhach = n.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.SoDienThoai ?? "Chưa có SDT",
                DiaChi = n.MaDonDatDichVuNavigation?.MaDonNavigation?.DiaChi ?? "Chưa cập nhật địa chỉ",
                TongTien = (n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.GiaTheoGio ?? 0m)
                           * (decimal)(n.ThoiLuongThucHien ?? 0)
                           * 0.6m,
                GhiChu = n.MaDonDatDichVuNavigation?.MaDonNavigation?.GhiChu ?? "",
                TrangThai = n.TrangThai ?? "Chờ phân công"
            }).ToList();

            return Ok(mappedJobs);
        }

        // ==========================================================
        // 3. API Lấy Chi Tiết 1 Công Việc
        // ==========================================================
        [HttpGet("job/{maNgayLamViec}")]
        public async Task<IActionResult> GetJobDetail(string maNgayLamViec)
        {
            var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maidId)) return Unauthorized(new { message = "Không tìm thấy thông tin định danh." });

            var rawJob = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDichVuNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.MaKhachhangNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.LichSuTrangThaiDons) // Bắt buộc Include bảng lịch sử
                .Where(n => n.MaNguoiGiupViec == maidId
                            && n.MaNgayLamViec == maNgayLamViec
                            // Kiểm tra trạng thái mới nhất trong bảng lịch sử
                            && n.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                                .Select(ls => ls.TrangThai)
                                .FirstOrDefault() == "Đã xác nhận")
                .FirstOrDefaultAsync();

            if (rawJob == null) return NotFound(new { message = "Không tìm thấy công việc này." });

            var jobDetail = new ChiTietNgayLamViec
            {
                MaNgayLamViec = rawJob.MaNgayLamViec,
                MaDon = rawJob.MaDonDatDichVuNavigation?.MaDon ?? "N/A",
                NgayLam = rawJob.NgayLam.HasValue ? rawJob.NgayLam.Value.ToString("yyyy-MM-dd") : "",
                GioBatDau = rawJob.GioBatDau.HasValue ? rawJob.GioBatDau.Value.ToString("HH:mm:ss") : "00:00:00",
                GioKetThuc = rawJob.GioKetThuc.HasValue ? rawJob.GioKetThuc.Value.ToString("HH:mm:ss") : "00:00:00",
                ThoiLuongThucHien = rawJob.ThoiLuongThucHien ?? 0,
                TenDichVu = rawJob.MaDonDatDichVuNavigation?.MaDichVuNavigation?.TenDichVu ?? "Dịch vụ hệ thống",
                HoTenKhach = rawJob.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.HoTen ?? "Chưa rõ khách hàng",
                SdtKhach = rawJob.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.SoDienThoai ?? "Chưa có SDT",
                DiaChi = rawJob.MaDonDatDichVuNavigation?.MaDonNavigation?.DiaChi ?? "Chưa cập nhật địa chỉ",
                TongTien = (rawJob.MaDonDatDichVuNavigation?.MaDichVuNavigation?.GiaTheoGio ?? 0m)
                           * (decimal)(rawJob.ThoiLuongThucHien ?? 0)
                           * 0.6m,
                GhiChu = rawJob.MaDonDatDichVuNavigation?.MaDonNavigation?.GhiChu ?? "",
                TrangThai = rawJob.TrangThai ?? "Chờ phân công"
            };

            return Ok(jobDetail);
        }

        // ==========================================================
        // 4. API Cập Nhật Trạng Thái Công Việc
        // ==========================================================
        [HttpPut("job/{maNgayLamViec}/status")]
        public async Task<IActionResult> UpdateJobStatus(string maNgayLamViec, [FromBody] UpdateStatusDto request)
        {
            var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maidId)) return Unauthorized();

            var job = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.LichSuTrangThaiDons) // Join thêm để check trạng thái
                .FirstOrDefaultAsync(n => n.MaNguoiGiupViec == maidId
                                          && n.MaNgayLamViec == maNgayLamViec
                                          // Kiểm tra trạng thái mới nhất trong bảng lịch sử
                                          && n.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                                                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                                                .Select(ls => ls.TrangThai)
                                                .FirstOrDefault() == "Đã xác nhận");

            if (job == null) return NotFound(new { message = "Không tìm thấy công việc hợp lệ để cập nhật." });

            job.TrangThai = request.TrangThai;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công!" });
        }

        // ==========================================================
        // 5. API Lấy Toàn Bộ Lịch Sử 
        // ==========================================================
        [HttpGet("history")]
        public async Task<IActionResult> GetAllJobsHistory()
        {
            var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(maidId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh." });
            }

            var rawJobs = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDichVuNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.MaKhachhangNavigation)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.LichSuTrangThaiDons) // Bắt buộc Include bảng lịch sử
                .Where(n => n.MaNguoiGiupViec == maidId
                            && n.NgayLam.HasValue
                            // Kiểm tra trạng thái mới nhất trong bảng lịch sử
                            && n.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                                .Select(ls => ls.TrangThai)
                                .FirstOrDefault() == "Đã xác nhận")
                .OrderByDescending(n => n.NgayLam)
                .ThenByDescending(n => n.GioBatDau)
                .ToListAsync();

            var mappedJobs = rawJobs.Select(n => new ChiTietNgayLamViec
            {
                MaNgayLamViec = n.MaNgayLamViec,
                MaDon = n.MaDonDatDichVuNavigation?.MaDon ?? "N/A",
                NgayLam = n.NgayLam.Value.ToString("yyyy-MM-dd"),
                GioBatDau = n.GioBatDau.HasValue ? n.GioBatDau.Value.ToString("HH:mm:ss") : "00:00:00",
                GioKetThuc = n.GioKetThuc.HasValue ? n.GioKetThuc.Value.ToString("HH:mm:ss") : "00:00:00",
                ThoiLuongThucHien = n.ThoiLuongThucHien ?? 0,
                TenDichVu = n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.TenDichVu ?? "Dịch vụ hệ thống",
                HoTenKhach = n.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.HoTen ?? "Chưa rõ khách hàng",
                SdtKhach = n.MaDonDatDichVuNavigation?.MaDonNavigation?.MaKhachhangNavigation?.SoDienThoai ?? "Chưa có SDT",
                DiaChi = n.MaDonDatDichVuNavigation?.MaDonNavigation?.DiaChi ?? "Chưa cập nhật địa chỉ",
                TongTien = (n.MaDonDatDichVuNavigation?.MaDichVuNavigation?.GiaTheoGio ?? 0m)
                           * (decimal)(n.ThoiLuongThucHien ?? 0)
                           * 0.6m,
                GhiChu = n.MaDonDatDichVuNavigation?.MaDonNavigation?.GhiChu ?? "",
                TrangThai = n.TrangThai ?? "Chờ phân công"
            }).ToList();

            return Ok(mappedJobs);
        }

        // ==========================================================
        // CÁC LỚP DATA TRANSFER OBJECTS (DTOs)
        // ==========================================================
        public class NgayLamViec
        {
            public string MaNgayLamViec { get; set; } = null!;
            public string Ngay { get; set; } = null!;
            public string GioBatDau { get; set; } = null!;
            public string LoaiDichVu { get; set; } = null!;
            public string DiaChiKhachHang { get; set; } = null!;
            public string TrangThai { get; set; } = null!;
            public int ThoiLuongThucHien { get; set; }
        }

        public class ChiTietNgayLamViec
        {
            public string MaNgayLamViec { get; set; } = null!;
            public string MaDon { get; set; } = null!;
            public string NgayLam { get; set; } = null!;
            public string GioBatDau { get; set; } = null!;
            public string GioKetThuc { get; set; } = null!;
            public int ThoiLuongThucHien { get; set; }
            public string TenDichVu { get; set; } = null!;
            public string HoTenKhach { get; set; } = null!;
            public string SdtKhach { get; set; } = null!;
            public string DiaChi { get; set; } = null!;
            public decimal TongTien { get; set; }
            public string GhiChu { get; set; } = null!;
            public string TrangThai { get; set; } = null!;
        }

        public class UpdateStatusDto
        {
            public string TrangThai { get; set; } = null!;
        }
    }
}