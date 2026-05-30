using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data; 
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;
using MyWebApi.Extensions;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
            // Lấy ID người dùng hiện tại từ Token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            // 1. Lấy danh sách lịch rảnh của nhân viên
            var lichRanhs = await _context.LichRanhs
                .Include(lr => lr.LichRanhCaLamViecs)
                    .ThenInclude(lrc => lrc.MaCaLamViecNavigation)
                .Where(lr => lr.MaNguoiGiupViec == userId)
                .ToListAsync();

            // 2. Lấy toàn bộ các công việc khách ĐÃ ĐẶT của nhân viên này
            var trangThaiBan = new List<string> { "Đã phân công", "Đang làm việc", "Hoàn thành", "Không đến làm" };
            var dsNgayLamViec = await _context.NgayLamViecs
                .Where(nlv => nlv.MaNguoiGiupViec == userId && trangThaiBan.Contains(nlv.TrangThai))
                .ToListAsync();

            // 3. Map dữ liệu trả về cho Frontend kèm theo cờ daCoKhachDat
            var result = lichRanhs.Select(lr => new
            {
                maLichRanh = lr.MaLichRanh,
                ngay = lr.Ngay.ToString("yyyy-MM-dd"), // Ép chuẩn format ngày cho React
                chiTietCaLam = lr.LichRanhCaLamViecs.Select(lrc =>
                {
                    var caStartTime = lrc.MaCaLamViecNavigation.GioBatDau;
                    var caEndTime = lrc.MaCaLamViecNavigation.GioKetThuc;

                    // Kiểm tra xem ca làm việc này có bị khách đặt đè lên không
                    bool daCoKhachDat = dsNgayLamViec.Any(nlv =>
                        nlv.NgayLam == lr.Ngay &&
                        nlv.GioBatDau.HasValue && nlv.GioKetThuc.HasValue &&
                        nlv.GioBatDau.Value < caEndTime &&
                        nlv.GioKetThuc.Value > caStartTime
                    );

                    return new
                    {
                        maCaLamViec = lrc.MaCaLamViec,
                        gioBatDau = caStartTime.ToString("HH:mm:ss"),
                        gioKetThuc = caEndTime.ToString("HH:mm:ss"),
                        thoiGianTao = lrc.ThoiGianTao.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        daCoKhachDat = daCoKhachDat
                    };
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpPost("dang-ky")]
        public async Task<IActionResult> TaoLichRanhHangLoat([FromBody] TaoLichRanhHangLoatRequest requestBulk)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            if (requestBulk.DanhSachDangKy == null || requestBulk.DanhSachDangKy.Count == 0)
                return BadRequest(new { message = "Vui lòng chọn ít nhất 1 ngày để đăng ký." });

            var today = DateOnly.FromDateTime(DateTime.Now);

            // BẮT ĐẦU TRANSACTION DUY NHẤT CHO TOÀN BỘ DANH SÁCH
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var request in requestBulk.DanhSachDangKy)
                {
                    // --- 1. KIỂM TRA RÀNG BUỘC CHO TỪNG NGÀY ---
                    if (request.Ngay < today.AddDays(3))
                        return BadRequest(new { message = $"Ngày {request.Ngay:dd/MM/yyyy} không hợp lệ. Chỉ có thể đăng ký sau 3 ngày." });

                    var exist = await _context.LichRanhs.AnyAsync(x => x.MaNguoiGiupViec == userId && x.Ngay == request.Ngay);
                    if (exist)
                        return Conflict(new { message = $"Ngày {request.Ngay:dd/MM/yyyy} đã có lịch đăng ký trước đó." });

                    if (request.DanhSachCa == null || request.DanhSachCa.Count == 0)
                        return BadRequest(new { message = $"Ngày {request.Ngay:dd/MM/yyyy} thiếu ca làm việc." });

                    if (request.DanhSachCa.Count > 2)
                        return BadRequest(new { message = $"Ngày {request.Ngay:dd/MM/yyyy} vượt quá 2 ca làm việc." });

                    foreach (var ca in request.DanhSachCa)
                    {
                        if ((ca.GioKetThuc - ca.GioBatDau).TotalMinutes < 240)
                            return BadRequest(new { message = $"Ngày {request.Ngay:dd/MM/yyyy}: Mỗi ca phải kéo dài ít nhất 4 tiếng." });
                    }

                    if (request.DanhSachCa.Count == 2)
                    {
                        var c1 = request.DanhSachCa[0];
                        var c2 = request.DanhSachCa[1];
                        TimeSpan khoangCachYeuCau = TimeSpan.FromHours(2);

                        if (c1.GioBatDau > c2.GioBatDau)
                        {
                            var temp = c1; c1 = c2; c2 = temp;
                        }

                        if (c1.GioKetThuc.Add(khoangCachYeuCau) > c2.GioBatDau)
                            return BadRequest(new { message = $"Ngày {request.Ngay:dd/MM/yyyy}: Các ca bị trùng hoặc cách nhau dưới 2 tiếng." });
                    }

                    // --- 2. THÊM DỮ LIỆU ---
                    string maLichRanh = await _context.GenerateIdAsync("LichRanh", "MaLichRanh", "LR");

                    var lichRanh = new LichRanh
                    {
                        MaLichRanh = maLichRanh,
                        MaNguoiGiupViec = userId,
                        Ngay = request.Ngay
                    };
                    _context.LichRanhs.Add(lichRanh);
                    await _context.SaveChangesAsync(); // Lưu ngay để GenerateIdAsync lần lặp sau chính xác

                    foreach (var caReq in request.DanhSachCa)
                    {
                        var caDb = await _context.CaLamViecs
                            .FirstOrDefaultAsync(c => c.GioBatDau == caReq.GioBatDau && c.GioKetThuc == caReq.GioKetThuc);

                        if (caDb == null)
                        {
                            caDb = new CaLamViec
                            {
                                MaCaLamViec = await _context.GenerateIdAsync("CaLamViec", "MaCaLamViec", "CA"),
                                GioBatDau = caReq.GioBatDau,
                                GioKetThuc = caReq.GioKetThuc
                            };
                            _context.CaLamViecs.Add(caDb);
                            await _context.SaveChangesAsync();
                        }

                        _context.LichRanhCaLamViecs.Add(new LichRanhCaLamViec
                        {
                            MaLichRanh = maLichRanh,
                            MaCaLamViec = caDb.MaCaLamViec,
                            ThoiGianTao = DateTime.Now
                        });
                    }
                }

                // --- 3. CHỐT TOÀN BỘ THAY ĐỔI ---
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction("GetMySchedule", new { message = $"Đăng ký thành công {requestBulk.DanhSachDangKy.Count} ngày!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống khi đăng ký lịch rảnh.", detail = ex.Message });
            }
        }

        [HttpPost("bo-sung-ca/{maLichRanh}")]
        public async Task<IActionResult> BoSungCaLamViec(string maLichRanh, [FromBody] ChiTietCaLamRequest newShift)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var lichRanh = await _context.LichRanhs
                .Include(lr => lr.LichRanhCaLamViecs)
                .ThenInclude(lrc => lrc.MaCaLamViecNavigation)
                .FirstOrDefaultAsync(lr => lr.MaLichRanh == maLichRanh && lr.MaNguoiGiupViec == userId);

            if (lichRanh == null)
                return NotFound(new { message = "Không tìm thấy thông tin lịch rảnh này." });

            var today = DateOnly.FromDateTime(DateTime.Now);
            if (lichRanh.Ngay < today.AddDays(3))
                return BadRequest(new { message = "Chỉ có thể bổ sung ca làm việc cho các ngày sau 3 ngày kể từ hôm nay." });

            if (lichRanh.LichRanhCaLamViecs.Count >= 2)
                return BadRequest(new { message = "Ngày này đã đăng ký đủ 2 ca (tối đa). Không thể bổ sung thêm." });

            double durationInMinutes = (newShift.GioKetThuc - newShift.GioBatDau).TotalMinutes;
            if (durationInMinutes < 240)
                return BadRequest(new { message = "Mỗi ca làm việc bổ sung phải kéo dài ít nhất 4 tiếng." });

            TimeSpan khoangCachYeuCau = TimeSpan.FromHours(2);
            foreach (var lrc in lichRanh.LichRanhCaLamViecs)
            {
                var existingShift = lrc.MaCaLamViecNavigation;
                bool hopLe = (newShift.GioKetThuc.Add(khoangCachYeuCau) <= existingShift.GioBatDau) ||
                             (newShift.GioBatDau >= existingShift.GioKetThuc.Add(khoangCachYeuCau));

                if (!hopLe)
                    return BadRequest(new { message = "Thời gian ca mới bị trùng hoặc không cách ca đã đăng ký ít nhất 2 tiếng." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var caDb = await _context.CaLamViecs
                    .FirstOrDefaultAsync(c => c.GioBatDau == newShift.GioBatDau && c.GioKetThuc == newShift.GioKetThuc);

                if (caDb == null)
                {
                    caDb = new CaLamViec
                    {
                        MaCaLamViec = await _context.GenerateIdAsync("CaLamViec", "MaCaLamViec", "CA"),
                        GioBatDau = newShift.GioBatDau,
                        GioKetThuc = newShift.GioKetThuc
                    };
                    _context.CaLamViecs.Add(caDb);
                    await _context.SaveChangesAsync(); // Lưu ngay
                }

                lichRanh.LichRanhCaLamViecs.Add(new LichRanhCaLamViec
                {
                    MaLichRanh = lichRanh.MaLichRanh,
                    MaCaLamViec = caDb.MaCaLamViec,
                    ThoiGianTao = DateTime.Now
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Bổ sung ca làm việc thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống khi bổ sung ca.", detail = ex.Message });
            }
        }

        [HttpGet("kiem-tra-huy/{maLichRanh}/{maCaLamViec}")]
        public async Task<IActionResult> KiemTraHuyCa(string maLichRanh, string maCaLamViec)
        {
            var lichRanhCa = await _context.LichRanhCaLamViecs
                .Include(x => x.MaLichRanhNavigation)
                .Include(x => x.MaCaLamViecNavigation)
                .FirstOrDefaultAsync(x => x.MaLichRanh == maLichRanh && x.MaCaLamViec == maCaLamViec);

            if (lichRanhCa == null)
                return NotFound(new { message = "Không tìm thấy ca làm việc này!" });

            // =========================================================================
            // 1. KIỂM TRA CA ĐÃ CÓ KHÁCH ĐẶT CHƯA
            // =========================================================================
            var helperId = lichRanhCa.MaLichRanhNavigation.MaNguoiGiupViec;
            var targetDate = lichRanhCa.MaLichRanhNavigation.Ngay;
            var caStartTime = lichRanhCa.MaCaLamViecNavigation.GioBatDau;
            var caEndTime = lichRanhCa.MaCaLamViecNavigation.GioKetThuc;

            var trangThaiBan = new List<string> { "Đã phân công", "Đang làm việc", "Hoàn thành", "Không đến làm" };

            bool daCoKhachDat = await _context.NgayLamViecs.AnyAsync(nlv =>
                nlv.MaNguoiGiupViec == helperId &&
                nlv.NgayLam == targetDate &&
                trangThaiBan.Contains(nlv.TrangThai) &&
                // Chú ý: Nếu nlv.GioBatDau và nlv.GioKetThuc trong DB của bạn là TimeOnly (không null),
                // bạn có thể xóa luôn .HasValue và .Value ở 3 dòng dưới này nhé!
                nlv.GioBatDau.HasValue && nlv.GioKetThuc.HasValue &&
                nlv.GioBatDau.Value < caEndTime &&
                nlv.GioKetThuc.Value > caStartTime
            );

            if (daCoKhachDat)
            {
                return Ok(new
                {
                    canCancel = false,
                    message = "Khung giờ này đã được khách hàng đặt dịch vụ, bạn không thể hủy!"
                });
            }

            // =========================================================================
            // 2. KIỂM TRA QUY ĐỊNH 15 PHÚT (ĐÃ FIX LỖI TIMESPAN)
            // =========================================================================
            var timeDifference = DateTime.Now - lichRanhCa.ThoiGianTao;
            var minutesDiff = timeDifference.TotalMinutes; // Gọi trực tiếp, không dùng .Value

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


        [HttpDelete("huy-ca/{maLichRanh}/{maCaLamViec}")]
        public async Task<IActionResult> HuyCaLamViec(string maLichRanh, string maCaLamViec)
        {
            var lichRanhCa = await _context.LichRanhCaLamViecs
                .Include(x => x.MaLichRanhNavigation)
                .Include(x => x.MaCaLamViecNavigation)
                .FirstOrDefaultAsync(x => x.MaLichRanh == maLichRanh && x.MaCaLamViec == maCaLamViec);

            if (lichRanhCa == null)
                return NotFound(new { message = "Không tìm thấy ca làm việc này!" });

            // =========================================================================
            // 1. CHẶN XÓA NẾU ĐÃ CÓ KHÁCH ĐẶT
            // =========================================================================
            var helperId = lichRanhCa.MaLichRanhNavigation.MaNguoiGiupViec;
            var targetDate = lichRanhCa.MaLichRanhNavigation.Ngay;
            var caStartTime = lichRanhCa.MaCaLamViecNavigation.GioBatDau;
            var caEndTime = lichRanhCa.MaCaLamViecNavigation.GioKetThuc;

            var trangThaiBan = new List<string> { "Đã phân công", "Đang làm việc", "Hoàn thành", "Không đến làm" };

            bool daCoKhachDat = await _context.NgayLamViecs.AnyAsync(nlv =>
                nlv.MaNguoiGiupViec == helperId &&
                nlv.NgayLam == targetDate &&
                trangThaiBan.Contains(nlv.TrangThai) &&
                nlv.GioBatDau.HasValue && nlv.GioKetThuc.HasValue &&
                nlv.GioBatDau.Value < caEndTime &&
                nlv.GioKetThuc.Value > caStartTime
            );

            if (daCoKhachDat)
            {
                return BadRequest(new { message = "Lỗi: Khung giờ này đã có khách hàng đặt dịch vụ, thao tác hủy bị từ chối!" });
            }

            // =========================================================================
            // 2. CHẶN XÓA NẾU QUÁ 15 PHÚT (ĐÃ FIX LỖI TIMESPAN)
            // =========================================================================
            var timeDifference = DateTime.Now - lichRanhCa.ThoiGianTao;
            if (timeDifference.TotalMinutes > 15) // Gọi trực tiếp, không dùng .Value
                return BadRequest(new { message = "Đã quá 15 phút kể từ lúc đăng ký. Bạn không thể hủy ca này nữa!" });

            // =========================================================================
            // 3. THỰC HIỆN XÓA VÀ LƯU DATABASE
            // =========================================================================
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    _context.LichRanhCaLamViecs.Remove(lichRanhCa);
                    await _context.SaveChangesAsync();

                    // Nếu đây là ca cuối cùng trong ngày, xóa luôn record Lịch rảnh rỗng đó
                    var soCaConLai = await _context.LichRanhCaLamViecs.CountAsync(x => x.MaLichRanh == maLichRanh);

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
    public class TaoLichRanhHangLoatRequest
    {
        public List<TaoLichRanhRequest> DanhSachDangKy { get; set; }
    }
}