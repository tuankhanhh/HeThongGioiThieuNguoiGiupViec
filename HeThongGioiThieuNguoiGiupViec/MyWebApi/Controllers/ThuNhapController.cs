using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models; // Thay đổi theo Namespace dự án của bạn
using System.Threading.Tasks;

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
    }
    public class CapNhatTrangThai
    {
        public string TrangThai { get; set; }
    }
}