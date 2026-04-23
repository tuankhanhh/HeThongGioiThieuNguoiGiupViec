using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================= QUẢN LÝ DỊCH VỤ =================
        [HttpGet("services")]
        public async Task<IActionResult> GetAllServices()
        {
            var services = await _context.DichVus
                .Include(dv => dv.DichVuThanhPhans)
                    .ThenInclude(dvtp => dvtp.MaThanhPhanNavigation)
                .Select(dv => new
                {
                    maDichVu = dv.MaDichVu,
                    tenDichVu = dv.TenDichVu,
                    moTa = dv.MoTa,
                    giaTheoGio = dv.GiaTheoGio,
                    hinhAnh = dv.HinhAnh,
                    trangThai = dv.TrangThai,
                    phoBien = dv.PhoBien,
                    thanhPhans = dv.DichVuThanhPhans
                        .Select(tp => tp.MaThanhPhanNavigation.TenThanhPhan)
                        .ToList()
                })
                .ToListAsync();

            return Ok(new { success = true, data = services });
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] ServiceRequest request)
        {
            try
            {
                var maDichVu = GenerateId("DV");
                var dichVu = new DichVu
                {
                    MaDichVu = maDichVu,
                    TenDichVu = request.TenDichVu,
                    MoTa = request.MoTa,
                    GiaTheoGio = request.GiaTheoGio,
                    HinhAnh = request.HinhAnh,
                    TrangThai = "Đang hoạt động",
                    PhoBien = request.PhoBien
                };

                _context.DichVus.Add(dichVu);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Tạo dịch vụ thành công", maDichVu });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("services/{maDichVu}")]
        public async Task<IActionResult> UpdateService(string maDichVu, [FromBody] ServiceRequest request)
        {
            try
            {
                var dichVu = await _context.DichVus.FindAsync(maDichVu);
                if (dichVu == null)
                    return NotFound(new { success = false, message = "Không tìm thấy dịch vụ" });

                dichVu.TenDichVu = request.TenDichVu;
                dichVu.MoTa = request.MoTa;
                dichVu.GiaTheoGio = request.GiaTheoGio;
                dichVu.HinhAnh = request.HinhAnh;
                dichVu.PhoBien = request.PhoBien;

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("services/{maDichVu}")]
        public async Task<IActionResult> DeleteService(string maDichVu)
        {
            try
            {
                var dichVu = await _context.DichVus.FindAsync(maDichVu);
                if (dichVu == null)
                    return NotFound(new { success = false, message = "Không tìm thấy dịch vụ" });

                dichVu.TrangThai = "Ngừng hoạt động";
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ================= THỐNG KÊ BÁO CÁO =================
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var totalUsers = await _context.NguoiDungs.CountAsync();
                var totalMaids = await _context.HoSoNguoiGiupViecs.CountAsync();
                var totalBookings = await _context.DonDats.CountAsync();
                var totalRevenue = await _context.DonDats.SumAsync(d => d.TongTien);

                var pendingProfiles = await _context.HoSoNguoiGiupViecs
                    .CountAsync(hs => hs.TrangThaiXacMinh == "Chờ duyệt");

                var pendingBookings = await _context.LichSuTrangThaiDons
                    .Where(ls => ls.TrangThai == "Chờ xác nhận")
                    .Select(ls => ls.MaDon)
                    .Distinct()
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalUsers,
                        totalMaids,
                        totalBookings,
                        totalRevenue,
                        pendingProfiles,
                        pendingBookings
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("statistics/revenue")]
        public async Task<IActionResult> GetRevenueStatistics([FromQuery] int year = 0)
        {
            try
            {
                if (year == 0) year = DateTime.Now.Year;

                var monthlyRevenue = await _context.DonDats
                    .Where(d => d.NgayDat.HasValue && d.NgayDat.Value.Year == year)
                    .GroupBy(d => d.NgayDat.Value.Month)
                    .Select(g => new
                    {
                        month = g.Key,
                        revenue = g.Sum(d => d.TongTien),
                        count = g.Count()
                    })
                    .OrderBy(x => x.month)
                    .ToListAsync();

                return Ok(new { success = true, data = monthlyRevenue });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string GenerateId(string prefix)
        {
            int randomNum = new Random().Next(1000, 9999);
            return prefix + randomNum.ToString();
        }
    }

    // ================= DTO =================
    public class ServiceRequest
    {
        public string TenDichVu { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public decimal GiaTheoGio { get; set; }
        public string HinhAnh { get; set; } = string.Empty;
        public bool PhoBien { get; set; }
    }
}
