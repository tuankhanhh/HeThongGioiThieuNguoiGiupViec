using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models; // Thay đổi theo Namespace dự án của bạn
using static System.Net.Mime.MediaTypeNames;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThuNhapController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ThuNhapController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("{maThuNhap}/status")]
        public async Task<IActionResult> UpdateIncomeStatus(string maThuNhap, [FromBody] CapNhatTrangThai request)
        {
            // 1. Kiểm tra request hợp lệ
            if (request == null || string.IsNullOrWhiteSpace(request.TrangThai))
            {
                return BadRequest(new { message = "Trạng thái cập nhật không được để trống." });
            }

            // 2. Tìm bản ghi thu nhập trong Database
            var income = await _context.ThuNhapNguoiGiupViecs
                .FirstOrDefaultAsync(t => t.MaThuNhap.Trim() == maThuNhap.Trim());

            if (income == null)
            {
                return NotFound(new { message = $"Không tìm thấy bản ghi thu nhập với mã: {maThuNhap}" });
            }

            // 3. (Tùy chọn) Kiểm tra tính hợp lệ của trạng thái mới gửi lên
            var hople = new[] { "Chờ xác nhận", "Đã xác nhận",  "Đã huy" };
            if (!hople.Contains(request.TrangThai))
            {
                return BadRequest(new { message = $"Trạng thái '{request.TrangThai}' không hợp lệ. Chỉ chấp nhận các trạng thái: {string.Join(", ", hople)}" });
            }

            // 4. Cập nhật trạng thái mới
            income.TrangThai = request.TrangThai;

            // 5. Lưu thay đổi vào Database
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật cơ sở dữ liệu.", error = ex.Message });
            }

            return Ok(new
            {
                message = "Cập nhật trạng thái thu nhập thành công!",
                maThuNhap = income.MaThuNhap.Trim(),
                trangThaiMoi = income.TrangThai
            });
        }

        [Authorize]
        [HttpGet("my-income")]
        public async Task<IActionResult> GetMyIncome()
        {
            try
            {
                var maidId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(maidId))
                {
                    return Unauthorized(new { success = false, message = "Vui lòng đăng nhập." });
                }

                var incomeList = await _context.ThuNhapNguoiGiupViecs
                    .Include(t => t.MaNgayLamViecNavigation)
                        .ThenInclude(n => n.MaDonDatDichVuNavigation)
                            .ThenInclude(d => d.MaDichVuNavigation)
                    .Where(t => t.MaNgayLamViecNavigation.MaNguoiGiupViec == maidId)
                    .OrderByDescending(t => t.ThoiGianTao)
                    .Select(t => new
                    {
                        maThuNhap = t.MaThuNhap.Trim(),
                        soTien = t.SoTien ?? 0,
                        trangThai = t.TrangThai ?? "Chưa xác định",
                        thoiGianTao = t.ThoiGianTao,
                        ngayLam = t.MaNgayLamViecNavigation.NgayLam,
                        tenDichVu = t.MaNgayLamViecNavigation.MaDonDatDichVuNavigation.MaDichVuNavigation.TenDichVu ?? "Dịch vụ"
                    })
                    .ToListAsync();

                // CẬP NHẬT THEO 3 TRẠNG THÁI MỚI
                var daXacNhan = incomeList
                    .Where(i => i.trangThai == "Đã xác nhận")
                    .Sum(i => i.soTien);

                var choXacNhan = incomeList
                    .Where(i => i.trangThai == "Chờ xác nhận")
                    .Sum(i => i.soTien);

                var daHuy = incomeList
                    .Where(i => i.trangThai == "Đã hủy")
                    .Sum(i => i.soTien);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        thongKe = new
                        {
                            daXacNhan = daXacNhan, // Tiền chắc chắn nhận được
                            choXacNhan = choXacNhan, // Tiền đang đợi chốt
                            daHuy = daHuy // Tiền bị mất do hủy ca
                        },
                        danhSach = incomeList
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi tải dữ liệu thu nhập.", detail = ex.Message });
            }
        }
    }
    public class CapNhatTrangThai
    {
        public string TrangThai { get; set; }
    }
}