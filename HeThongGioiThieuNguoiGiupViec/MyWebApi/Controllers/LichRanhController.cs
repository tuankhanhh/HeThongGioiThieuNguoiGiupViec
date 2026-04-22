using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.DTO;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc gửi kèm JWT Token
    public class LichRanhController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LichRanhController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/LichRanh/my-schedule
        [HttpGet("my-schedule")]
        public async Task<IActionResult> GetMySchedule()
        {
            // Lấy MaNguoiDung từ Claim NameIdentifier trong Token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var schedules = await _context.LichRanhs
                .Where(lr => lr.MaNguoiGiupViec == userId)
                .Select(lr => new LichRanhResponse
                {
                    MaLichRanh = lr.MaLichRanh,
                    Ngay = lr.Ngay.ToString("yyyy-MM-dd"),
                    ChiTietCaLam = lr.LichRanhCaLamViecs.Select(lrc => new ChiTietCaLamResponse
                    {
                        MaCaLamViec = lrc.MaCaLamViec,
                        GioBatDau = lrc.MaCaLamViecNavigation.GioBatDau.ToString("HH:mm:ss"),
                        GioKetThuc = lrc.MaCaLamViecNavigation.GioKetThuc.ToString("HH:mm:ss"),
                        GhiChu = lrc.GhiChu
                    }).ToList()
                })
                .ToListAsync();

            return Ok(schedules);
        }

        // POST: api/LichRanh/dang-ky
        [HttpPost("dang-ky")]
        public async Task<IActionResult> TaoLichRanh([FromBody] TaoLichRanhRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var today = DateOnly.FromDateTime(DateTime.Now);

            // 1. Ràng buộc: Đăng ký sau 3 ngày
            if (request.Ngay < today.AddDays(3))
                return BadRequest(new { message = "Bạn chỉ có thể đăng ký lịch rảnh sau 3 ngày kể từ hôm nay." });

            // 2. Ràng buộc: Không trùng ngày
            var exist = await _context.LichRanhs.AnyAsync(x => x.MaNguoiGiupViec == userId && x.Ngay == request.Ngay);
            if (exist)
                return Conflict(new { message = $"Ngày {request.Ngay:dd/MM/yyyy} đã có lịch đăng ký trước đó." });

            // 3. Kiểm tra lồng giờ (nếu đăng ký 2 ca)
            if (request.DanhSachCa.Count == 2)
            {
                var c1 = request.DanhSachCa[0];
                var c2 = request.DanhSachCa[1];
                if (c1.GioBatDau < c2.GioKetThuc && c2.GioBatDau < c1.GioKetThuc)
                    return BadRequest(new { message = "Hai ca làm việc không được lồng thời gian vào nhau." });
            }

            // Bắt đầu giao dịch lưu dữ liệu
            string maLichRanh = "LR" + Guid.NewGuid().ToString().Substring(0, 3).ToUpper();
            var lichRanh = new LichRanh { MaLichRanh = maLichRanh, MaNguoiGiupViec = userId, Ngay = request.Ngay };

            foreach (var caReq in request.DanhSachCa)
            {
                // Tìm ca làm việc có sẵn theo giờ
                var caDb = await _context.CaLamViecs.FirstOrDefaultAsync(c => c.GioBatDau == caReq.GioBatDau && c.GioKetThuc == caReq.GioKetThuc);

                // Nếu chưa có giờ này trong DB thì tạo mới CaLamViec
                if (caDb == null)
                {
                    caDb = new CaLamViec
                    {
                        MaCaLamViec = "CA" + Guid.NewGuid().ToString().Substring(0, 3).ToUpper(),
                        GioBatDau = caReq.GioBatDau,
                        GioKetThuc = caReq.GioKetThuc
                    };
                    _context.CaLamViecs.Add(caDb);
                }

                lichRanh.LichRanhCaLamViecs.Add(new LichRanhCaLamViec
                {
                    MaLichRanh = maLichRanh,
                    MaCaLamViec = caDb.MaCaLamViec,
                    GhiChu = caReq.GhiChu
                });
            }

            _context.LichRanhs.Add(lichRanh);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMySchedule), new { message = "Đăng ký lịch rảnh thành công!" });
        }
        // POST: api/LichRanh/bo-sung-ca/{maLichRanh}
        [HttpPost("bo-sung-ca/{maLichRanh}")]
        public async Task<IActionResult> BoSungCaLamViec(string maLichRanh, [FromBody] ChiTietCaLamRequest newShift)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            // 1. Tìm lịch rảnh hiện tại kèm theo các ca đã đăng ký
            var lichRanh = await _context.LichRanhs
                .Include(lr => lr.LichRanhCaLamViecs)
                .ThenInclude(lrc => lrc.MaCaLamViecNavigation)
                .FirstOrDefaultAsync(lr => lr.MaLichRanh == maLichRanh && lr.MaNguoiGiupViec == userId);

            if (lichRanh == null)
                return NotFound(new { message = "Không tìm thấy thông tin lịch rảnh này." });

            // 2. Ràng buộc thời gian: Đăng ký trước ít nhất 3 ngày
            var today = DateOnly.FromDateTime(DateTime.Now);
            if (lichRanh.Ngay < today.AddDays(3))
                return BadRequest(new { message = "Chỉ có thể bổ sung ca làm việc cho các ngày sau 3 ngày kể từ hôm nay." });

            // 3. Kiểm tra số lượng ca (Tối đa 2 ca/ngày)
            if (lichRanh.LichRanhCaLamViecs.Count >= 2)
                return BadRequest(new { message = "Ngày này đã đăng ký đủ 2 ca (tối đa). Không thể bổ sung thêm." });

            // 4. Kiểm tra độ dài ca mới (Tối thiểu 4 tiếng = 240 phút)
            double durationInMinutes = (newShift.GioKetThuc - newShift.GioBatDau).TotalMinutes;
            if (durationInMinutes < 240)
                return BadRequest(new { message = "Mỗi ca làm việc bổ sung phải kéo dài ít nhất 4 tiếng." });

            // 5. Kiểm tra lồng giờ với ca đã có sẵn
            // Vì Count đang là 1, ta lấy ca đầu tiên để so sánh
            var existingShift = lichRanh.LichRanhCaLamViecs.First().MaCaLamViecNavigation;
            if (newShift.GioBatDau < existingShift.GioKetThuc && existingShift.GioBatDau < newShift.GioKetThuc)
            {
                return BadRequest(new { message = "Thời gian ca mới bị trùng lặp với ca đã đăng ký trước đó." });
            }

            // 6. Xử lý lưu dữ liệu
            // Tìm khung giờ trong hệ thống hoặc tạo mới nếu chưa có
            var caDb = await _context.CaLamViecs
                .FirstOrDefaultAsync(c => c.GioBatDau == newShift.GioBatDau && c.GioKetThuc == newShift.GioKetThuc);

            if (caDb == null)
            {
                caDb = new CaLamViec
                {
                    MaCaLamViec = "CA" + Guid.NewGuid().ToString().Substring(0, 3).ToUpper(),
                    GioBatDau = newShift.GioBatDau,
                    GioKetThuc = newShift.GioKetThuc
                };
                _context.CaLamViecs.Add(caDb);
            }

            // Thêm liên kết vào bảng trung gian
            lichRanh.LichRanhCaLamViecs.Add(new LichRanhCaLamViec
            {
                MaLichRanh = lichRanh.MaLichRanh,
                MaCaLamViec = caDb.MaCaLamViec,
                GhiChu = newShift.GhiChu
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Bổ sung ca làm việc thành công!" });
        }
    }
}