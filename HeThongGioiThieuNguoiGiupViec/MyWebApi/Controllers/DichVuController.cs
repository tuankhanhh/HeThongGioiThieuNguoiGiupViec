using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/dichvu")]
    [ApiController]
    public class DichVuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DichVuController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/v1/services
        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            try
            {
                // Truy vấn bảng DichVu và nạp kèm các bảng liên quan
                var services = await _context.DichVus
                    .Where(dv => dv.TrangThai == "Đang hoạt động") // Chỉ lấy dịch vụ đang mở
                    .Include(dv => dv.DichVuThanhPhans)
                        .ThenInclude(dvtp => dvtp.MaThanhPhanNavigation) // Lấy tên thành phần từ bảng ThanhPhan
                    .Select(dv => new
                    {
                        id = dv.MaDichVu,
                        title = dv.TenDichVu,
                        description = dv.MoTa,
                        // Format giá tiền sang chuỗi để Frontend hiển thị ngay
                        // 1. Dành cho Trang 1 (hiển thị UI)
                        price = $"Từ {dv.GiaTheoGio:N0}đ/giờ",

                        // 2. Dành cho Trang 2 (tính toán toán học)
                        pricePerHour = dv.GiaTheoGio,
                        image = dv.HinhAnh,
                        popular = dv.PhoBien ?? false,
                        // Chuyển danh sách các thực thể thành mảng string các "features"
                        features = dv.DichVuThanhPhans
                            .Select(tp => tp.MaThanhPhanNavigation.TenThanhPhan)
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách dịch vụ", detail = ex.Message });
            }
        }

        // GET: api/v1/services/DV001
        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(string id)
        {
            var service = await _context.DichVus
                .Include(dv => dv.DichVuThanhPhans)
                    .ThenInclude(dvtp => dvtp.MaThanhPhanNavigation)
                .Where(dv => dv.MaDichVu == id)
                .Select(dv => new {
                    id = dv.MaDichVu,
                    title = dv.TenDichVu,
                    description = dv.MoTa,
                    price = dv.GiaTheoGio,
                    image = dv.HinhAnh,
                    features = dv.DichVuThanhPhans
                        .Select(tp => tp.MaThanhPhanNavigation.TenThanhPhan)
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (service == null) return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(service);
        }
    }
}