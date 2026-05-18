using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Extensions; 
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/v1/hoso")]
    [ApiController]
    [Authorize(Roles = "Maid")]
    public class HoSoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HoSoController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("hoan-thien-ho-so")]
        [Authorize]
        public async Task<IActionResult> HoanThienHoSo([FromForm] HoSoRequest request)
        {
            var userIdFromToken =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("nameid") ??
                User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdFromToken) || userIdFromToken != request.MaNguoiGiupViec)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    success = false,
                    message = "Token không hợp lệ hoặc không khớp người dùng."
                });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var nguoiDung = await _context.NguoiDungs.FindAsync(userIdFromToken);
                if (nguoiDung == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng." });
                }

                if (!string.IsNullOrWhiteSpace(request.DiaChi))
                {
                    nguoiDung.DiaChi = request.DiaChi;
                    _context.NguoiDungs.Update(nguoiDung);
                }

                string pathCccdTruoc = await SaveFileAsync(request.FileAnhCccdmatTruoc);
                string pathCccdSau = await SaveFileAsync(request.FileAnhCccdmatSau);
                string pathChanDung = await SaveFileAsync(request.FileAnhChanDung);
                string pathCuTru = await SaveFileAsync(request.FileAnhGiayXacNhanCuTru);

                // =========================================================================
                // THAY ĐỔI TẠI ĐÂY: Sử dụng phương thức mở rộng sinh mã tự động tuần tự từ DB
                // =========================================================================
                string newMaHoSo = await _context.GenerateIdAsync("HoSoNguoiGiupViec", "MaHoSo", "HS");

                var hoSoMoi = new HoSoNguoiGiupViec
                {
                    MaHoSo = newMaHoSo,
                    MaNguoiGiupViec = userIdFromToken,
                    SoCccd = request.SoCccd,
                    NgaySinh = request.NgaySinh,
                    GioiTinh = request.GioiTinh,
                    TenNguoiThan = request.TenNguoiThan,
                    SdtnguoiThan = request.SdtnguoiThan,
                    AnhCccdmatTruoc = pathCccdTruoc,
                    AnhCccdmatSau = pathCccdSau,
                    AnhChanDung = pathChanDung,
                    GiayXacNhanCuTru = pathCuTru,
                    TrangThaiXacMinh = "Chờ duyệt"
                };

                await _context.HoSoNguoiGiupViecs.AddAsync(hoSoMoi);
                await _context.SaveChangesAsync(); // Lưu ngay để giữ chỗ mã hồ sơ mới

                // Lưu danh sách kỹ năng cùng với kinh nghiệm tương ứng
                if (request.DanhSachKyNang != null && request.DanhSachKyNang.Any())
                {
                    var danhSachKyNang = request.DanhSachKyNang
                        .GroupBy(k => k.MaKyNang)
                        .Select(g => g.First())
                        .Select(k => new KyNangNguoiGiupViec
                        {
                            MaHoSo = newMaHoSo,
                            MaKyNang = k.MaKyNang,
                            KinhNghiem = k.KinhNghiem
                        }).ToList();

                    await _context.KyNangNguoiGiupViecs.AddRangeAsync(danhSachKyNang);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Hoàn tất hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lưu hồ sơ.", detail = ex.Message });
            }
        }

        [HttpGet("ho-so-cua-toi")]
        [Authorize]
        public async Task<IActionResult> GetHoSoCuaToi()
        {
            var userIdFromToken = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                                  User.FindFirstValue("nameid") ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdFromToken))
                return Unauthorized(new { success = false, message = "Token không hợp lệ." });

            try
            {
                var nguoiDung = await _context.NguoiDungs.FindAsync(userIdFromToken);
                if (nguoiDung == null) return NotFound(new { success = false, message = "Không tìm thấy người dùng." });

                var hoSo = await _context.HoSoNguoiGiupViecs.FirstOrDefaultAsync(h => h.MaNguoiGiupViec == userIdFromToken);

                if (hoSo == null)
                {
                    return Ok(new { success = true, hasProfile = false });
                }

                var danhSachKyNang = await _context.KyNangNguoiGiupViecs
                    .Where(kn => kn.MaHoSo == hoSo.MaHoSo)
                    .Join(_context.KyNangs,
                          kn => kn.MaKyNang,
                          k => k.MaKyNang,
                          (kn, k) => new {
                              id = k.MaKyNang,
                              name = k.TenKyNang,
                              experienceYears = kn.KinhNghiem
                          })
                    .ToListAsync();

                var responseData = new
                {
                    ngaySinh = hoSo.NgaySinh,
                    gioiTinh = hoSo.GioiTinh,
                    soCccd = hoSo.SoCccd,
                    diaChi = nguoiDung.DiaChi,
                    tenNguoiThan = hoSo.TenNguoiThan,
                    sdtNguoiThan = hoSo.SdtnguoiThan,
                    anhCccdmatTruoc = hoSo.AnhCccdmatTruoc,
                    anhCccdmatSau = hoSo.AnhCccdmatSau,
                    anhChanDung = hoSo.AnhChanDung,
                    giayXacNhanCuTru = hoSo.GiayXacNhanCuTru,
                    lyDoTuChoi = hoSo.LyDoTuChoi,
                    trangThai = hoSo.TrangThaiXacMinh,
                    danhSachKyNang = danhSachKyNang
                };

                return Ok(new { success = true, hasProfile = true, data = responseData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.InnerException?.Message ?? ex.Message });
            }
        }

        [HttpPost("cap-nhat-ho-so")]
        [Authorize]
        public async Task<IActionResult> CapNhatHoSo([FromForm] HoSoRequest request)
        {
            var userIdFromToken = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                                  User.FindFirstValue("nameid") ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdFromToken) || userIdFromToken != request.MaNguoiGiupViec)
                return StatusCode(StatusCodes.Status403Forbidden, new { success = false, message = "Token không hợp lệ." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var nguoiDung = await _context.NguoiDungs.FindAsync(userIdFromToken);
                if (nguoiDung == null) return NotFound(new { success = false, message = "Không tìm thấy người dùng." });

                var hoSo = await _context.HoSoNguoiGiupViecs.FirstOrDefaultAsync(h => h.MaNguoiGiupViec == userIdFromToken);
                if (hoSo == null) return NotFound(new { success = false, message = "Không tìm thấy hồ sơ để cập nhật." });

                if (!string.IsNullOrWhiteSpace(request.DiaChi))
                {
                    nguoiDung.DiaChi = request.DiaChi;
                    _context.NguoiDungs.Update(nguoiDung);
                }

                hoSo.SoCccd = request.SoCccd;
                hoSo.NgaySinh = request.NgaySinh;
                hoSo.GioiTinh = request.GioiTinh;
                hoSo.TenNguoiThan = request.TenNguoiThan;
                hoSo.SdtnguoiThan = request.SdtnguoiThan;
                hoSo.TrangThaiXacMinh = "Chờ duyệt";
                hoSo.LyDoTuChoi = null;

                if (request.FileAnhCccdmatTruoc != null) hoSo.AnhCccdmatTruoc = await SaveFileAsync(request.FileAnhCccdmatTruoc);
                if (request.FileAnhCccdmatSau != null) hoSo.AnhCccdmatSau = await SaveFileAsync(request.FileAnhCccdmatSau);
                if (request.FileAnhChanDung != null) hoSo.AnhChanDung = await SaveFileAsync(request.FileAnhChanDung);
                if (request.FileAnhGiayXacNhanCuTru != null) hoSo.GiayXacNhanCuTru = await SaveFileAsync(request.FileAnhGiayXacNhanCuTru);

                _context.HoSoNguoiGiupViecs.Update(hoSo);

                if (request.DanhSachKyNang != null && request.DanhSachKyNang.Any())
                {
                    var kyNangCu = await _context.KyNangNguoiGiupViecs.Where(kn => kn.MaHoSo == hoSo.MaHoSo).ToListAsync();
                    _context.KyNangNguoiGiupViecs.RemoveRange(kyNangCu);

                    var danhSachKyNangMoi = request.DanhSachKyNang
                        .GroupBy(k => k.MaKyNang)
                        .Select(g => g.First())
                        .Select(k => new KyNangNguoiGiupViec
                        {
                            MaHoSo = hoSo.MaHoSo,
                            MaKyNang = k.MaKyNang,
                            KinhNghiem = k.KinhNghiem
                        }).ToList();

                    await _context.KyNangNguoiGiupViecs.AddRangeAsync(danhSachKyNangMoi);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Cập nhật hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi cập nhật hồ sơ.", detail = ex.Message });
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetProfileStatus()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var hoSo = await _context.HoSoNguoiGiupViecs.FirstOrDefaultAsync(hs => hs.MaNguoiGiupViec == userId);

            return Ok(new ProfileStatusResponse
            {
                HasProfile = hoSo != null,
                Status = hoSo?.TrangThaiXacMinh
            });
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateMaidProfileRequest request)
        {
            try
            {
                var maNguoiDung = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(maNguoiDung)) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

                var hoSo = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .FirstOrDefaultAsync(hs => hs.MaNguoiGiupViec == maNguoiDung);

                if (hoSo == null) return NotFound(new { message = "Không tìm thấy hồ sơ của bạn. Vui lòng đăng ký hồ sơ trước." });

                hoSo.TenNguoiThan = request.TenNguoiThan ?? hoSo.TenNguoiThan;
                hoSo.SdtnguoiThan = request.SdtnguoiThan ?? hoSo.SdtnguoiThan;

                if (request.DanhSachKyNang != null && request.DanhSachKyNang.Any())
                {
                    var incomingIds = request.DanhSachKyNang.Select(k => k.MaKyNang).ToList();
                    var existingSkillIds = await _context.KyNangs
                        .Where(k => incomingIds.Contains(k.MaKyNang))
                        .Select(k => k.MaKyNang)
                        .ToListAsync();

                    if (existingSkillIds.Count != incomingIds.Distinct().Count())
                        return BadRequest(new { message = "Một hoặc nhiều mã kỹ năng không hợp lệ." });

                    _context.KyNangNguoiGiupViecs.RemoveRange(hoSo.KyNangNguoiGiupViecs);

                    var newSkills = request.DanhSachKyNang
                        .GroupBy(k => k.MaKyNang)
                        .Select(g => g.First())
                        .Select(k => new KyNangNguoiGiupViec
                        {
                            MaHoSo = hoSo.MaHoSo,
                            MaKyNang = k.MaKyNang,
                            KinhNghiem = k.KinhNghiem
                        }).ToList();

                    await _context.KyNangNguoiGiupViecs.AddRangeAsync(newSkills);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống.", details = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var maNguoiDung = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(maNguoiDung)) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

                var userProfile = await _context.NguoiDungs
                    .Where(u => u.MaNguoiDung == maNguoiDung)
                    .Select(u => new
                    {
                        User = u,
                        HoSo = _context.HoSoNguoiGiupViecs.FirstOrDefault(hs => hs.MaNguoiGiupViec == u.MaNguoiDung),
                        KyNangs = _context.KyNangNguoiGiupViecs
                                    .Where(kn => kn.MaHoSo == _context.HoSoNguoiGiupViecs.FirstOrDefault(hs => hs.MaNguoiGiupViec == u.MaNguoiDung).MaHoSo)
                                    .Join(_context.KyNangs,
                                          kn_hs => kn_hs.MaKyNang,
                                          kn => kn.MaKyNang,
                                          (kn_hs, kn) => kn.TenKyNang + " (" + kn_hs.KinhNghiem + ")")
                                    .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (userProfile == null) return NotFound(new { message = "Không tìm thấy người dùng." });

                var response = new MaidProfileResponse
                {
                    MaNguoiDung = userProfile.User.MaNguoiDung,
                    HoTen = userProfile.User.HoTen ?? "",
                    SoDienThoai = userProfile.User.SoDienThoai ?? "",
                    Email = userProfile.User.Email ?? "",
                    DiaChi = userProfile.User.DiaChi ?? "",
                    AnhChanDung = userProfile.HoSo?.AnhChanDung ?? "https://i.pravatar.cc/150?u=" + userProfile.User.MaNguoiDung,
                    TenNguoiThan = userProfile.HoSo?.TenNguoiThan ?? "",
                    SdtnguoiThan = userProfile.HoSo?.SdtnguoiThan ?? "",
                    DanhSachKyNang = userProfile.KyNangs ?? new List<string>()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi lấy thông tin hồ sơ.", details = ex.Message });
            }
        }

        private async Task<string> SaveFileAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0) return string.Empty;

            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

            var safeFileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(fileStream);

            return "/uploads/" + uniqueFileName;
        }
    }
}