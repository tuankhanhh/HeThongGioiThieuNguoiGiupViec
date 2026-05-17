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

                        // THÊM DÒNG NÀY ĐỂ FRONTEND LẤY ĐƯỢC GIỜ TẠO CA
                        ThoiGianTao = lrc.ThoiGianTao

                    }).ToList()
                })
                .ToListAsync();

            return Ok(schedules);
        }

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

            // 3. Ràng buộc về số lượng và thời gian ca làm việc
            if (request.DanhSachCa == null || request.DanhSachCa.Count == 0)
                return BadRequest(new { message = "Vui lòng chọn ít nhất 1 ca làm việc." });

            if (request.DanhSachCa.Count > 2)
                return BadRequest(new { message = "Mỗi ngày chỉ được đăng ký tối đa 2 ca làm việc." });

            foreach (var ca in request.DanhSachCa)
            {
                if ((ca.GioKetThuc - ca.GioBatDau).TotalMinutes < 240)
                    return BadRequest(new { message = "Mỗi ca làm việc phải kéo dài ít nhất 4 tiếng." });
            }

            // 4. Kiểm tra khoảng cách và lồng giờ (nếu đăng ký 2 ca)
            if (request.DanhSachCa.Count == 2)
            {
                var c1 = request.DanhSachCa[0];
                var c2 = request.DanhSachCa[1];
                TimeSpan khoangCachYeuCau = TimeSpan.FromHours(2);

                // Sắp xếp để c1 luôn là ca bắt đầu trước
                if (c1.GioBatDau > c2.GioBatDau)
                {
                    var temp = c1;
                    c1 = c2;
                    c2 = temp;
                }

                if (c1.GioKetThuc.Add(khoangCachYeuCau) > c2.GioBatDau)
                {
                    return BadRequest(new { message = "Hai ca làm việc bị trùng hoặc không cách nhau ít nhất 2 tiếng." });
                }
            }

            // 5. Bắt đầu giao dịch lưu dữ liệu
            string maLichRanh = "LR" + Guid.NewGuid().ToString().Substring(0, 3).ToUpper();

            var lichRanh = new LichRanh
            {
                MaLichRanh = maLichRanh,
                MaNguoiGiupViec = userId,
                Ngay = request.Ngay,
                LichRanhCaLamViecs = new List<LichRanhCaLamViec>()
            };

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
                    ThoiGianTao = DateTime.Now
                });
            }

            _context.LichRanhs.Add(lichRanh);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMySchedule), new { message = "Đăng ký lịch rảnh thành công!" });
        }

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

            // 5. Kiểm tra lồng giờ và khoảng cách 2 tiếng với các ca đã có sẵn
            TimeSpan khoangCachYeuCau = TimeSpan.FromHours(2);

            foreach (var lrc in lichRanh.LichRanhCaLamViecs)
            {
                var existingShift = lrc.MaCaLamViecNavigation;

                bool hopLe = (newShift.GioKetThuc.Add(khoangCachYeuCau) <= existingShift.GioBatDau) ||
                             (newShift.GioBatDau >= existingShift.GioKetThuc.Add(khoangCachYeuCau));

                if (!hopLe)
                {
                    return BadRequest(new { message = "Thời gian ca mới bị trùng hoặc không cách ca đã đăng ký ít nhất 2 tiếng." });
                }
            }

            // 6. Xử lý lưu dữ liệu
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

            lichRanh.LichRanhCaLamViecs.Add(new LichRanhCaLamViec
            {
                MaLichRanh = lichRanh.MaLichRanh,
                MaCaLamViec = caDb.MaCaLamViec,
                ThoiGianTao = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Bổ sung ca làm việc thành công!" });
        }

        // GET: api/LichRanh/kiem-tra-huy/{maLichRanh}/{maCaLamViec}
        [HttpGet("kiem-tra-huy/{maLichRanh}/{maCaLamViec}")]
        public async Task<IActionResult> KiemTraHuyCa(string maLichRanh, string maCaLamViec)
        {
            var caLamViec = await _context.LichRanhCaLamViecs
                .FirstOrDefaultAsync(x => x.MaLichRanh == maLichRanh && x.MaCaLamViec == maCaLamViec);

            if (caLamViec == null)
            {
                return NotFound(new { message = "Không tìm thấy ca làm việc này!" });
            }

            // Tính khoảng cách thời gian từ lúc tạo đến hiện tại
            var timeDifference = DateTime.Now - caLamViec.ThoiGianTao;
            var minutesDiff = timeDifference.TotalMinutes;

            if (minutesDiff <= 15)
            {
                return Ok(new
                {
                    canCancel = true,
                    minutesLeft = Math.Floor(15 - minutesDiff),
                    message = "Ca này vẫn có thể hủy."
                });
            }
            else
            {
                return Ok(new
                {
                    canCancel = false,
                    message = "Đã quá 15 phút, không thể hủy ca này."
                });
            }
        }

        // DELETE: api/LichRanh/huy-ca/{maLichRanh}/{maCaLamViec}
        [HttpDelete("huy-ca/{maLichRanh}/{maCaLamViec}")]
        public async Task<IActionResult> HuyCaLamViec(string maLichRanh, string maCaLamViec)
        {
            var caLamViec = await _context.LichRanhCaLamViecs
                .FirstOrDefaultAsync(x => x.MaLichRanh == maLichRanh && x.MaCaLamViec == maCaLamViec);

            if (caLamViec == null)
            {
                return NotFound(new { message = "Không tìm thấy ca làm việc này!" });
            }

            var timeDifference = DateTime.Now - caLamViec.ThoiGianTao;
            if (timeDifference.TotalMinutes > 15)
            {
                return BadRequest(new { message = "Đã quá 15 phút kể từ lúc đăng ký. Bạn không thể hủy ca này nữa!" });
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Xóa ca làm việc trong bảng trung gian (LichRanhCaLamViec)
                    _context.LichRanhCaLamViecs.Remove(caLamViec);
                    await _context.SaveChangesAsync();

                    // Cleanup: Kiểm tra xem Lịch rảnh của ngày đó còn ca nào không?
                    var soCaConLai = await _context.LichRanhCaLamViecs
                        .CountAsync(x => x.MaLichRanh == maLichRanh);

                    // Nếu không còn ca nào, xóa luôn ngày đó khỏi bảng LichRanh để dọn rác
                    if (soCaConLai == 0)
                    {
                        var lichRanh = await _context.LichRanhs.FindAsync(maLichRanh);
                        if (lichRanh != null)
                        {
                            _context.LichRanhs.Remove(lichRanh);
                            await _context.SaveChangesAsync();
                        }
                    }

                    await transaction.CommitAsync();

                    return Ok(new { message = "Đã hủy (xóa) ca làm việc thành công!" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Lỗi hệ thống trong quá trình hủy ca!", details = ex.Message });
                }
            }
        }
    }
}