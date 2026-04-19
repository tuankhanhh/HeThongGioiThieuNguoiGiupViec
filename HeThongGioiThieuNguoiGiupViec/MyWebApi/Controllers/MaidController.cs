using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/v1/maid")]
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
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy người dùng."
                    });
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

                // MaHoSo dài 5 ký tự, ví dụ: HS001, HS123
                string newMaHoSo = await GenerateMaHoSoAsync();

                var hoSoMoi = new HoSoNguoiGiupViec
                {
                    MaHoSo = newMaHoSo,
                    MaNguoiGiupViec = userIdFromToken,
                    SoCccd = request.SoCccd,
                    NgaySinh = request.NgaySinh,
                    GioiTinh = request.GioiTinh,
                    KinhNghiem = request.KinhNghiem,
                    MoTaChiTietKinhNghiem = request.MoTaChiTietKinhNghiem,
                    TenNguoiThan = request.TenNguoiThan,
                    SdtnguoiThan = request.SdtnguoiThan,
                    AnhCccdmatTruoc = pathCccdTruoc,
                    AnhCccdmatSau = pathCccdSau,
                    AnhChanDung = pathChanDung,
                    GiayXacNhanCuTru = pathCuTru,
                    TrangThaiXacMinh = "Chờ duyệt"
                };

                await _context.HoSoNguoiGiupViecs.AddAsync(hoSoMoi);
                await _context.SaveChangesAsync();

                if (request.DanhSachMaKyNang != null && request.DanhSachMaKyNang.Any())
                {
                    var distinctSkills = request.DanhSachMaKyNang.Distinct().ToList();

                    var danhSachKyNang = distinctSkills.Select(maKyNang => new KyNangNguoiGiupViec
                    {
                        MaHoSo = newMaHoSo,
                        MaKyNang = maKyNang,
                        NgayThem = DateTime.Now
                    }).ToList();

                    await _context.KyNangNguoiGiupViecs.AddRangeAsync(danhSachKyNang);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    message = "Hoàn tất hồ sơ thành công!"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lưu hồ sơ.",
                    detail = ex.Message
                });
            }
        }

        private async Task<string> SaveFileAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var safeFileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(fileStream);

            return "/uploads/" + uniqueFileName;
        }

        private async Task<string> GenerateMaHoSoAsync()
        {
            // Sinh mã 5 ký tự: HS001 -> HS999
            // Nếu đã tồn tại thì sinh lại
            string maHoSo;
            do
            {
                maHoSo = "HS" + Random.Shared.Next(100, 1000); // 5 ký tự
            }
            while (await _context.HoSoNguoiGiupViecs.AnyAsync(x => x.MaHoSo == maHoSo));

            return maHoSo;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetProfileStatus()
        {
            // 1. Lấy MaNguoiDung từ trong JWT Token (do middleware của .NET tự giải mã)
            // Lưu ý: ClaimTypes.NameIdentifier hay loại Claim nào tùy thuộc vào cách bạn Generate Token ở API Login
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // 2. Tìm hồ sơ
            var hoSo = await _context.HoSoNguoiGiupViecs
                .FirstOrDefaultAsync(hs => hs.MaNguoiGiupViec == userId);

            // 3. Trả về kết quả
            var response = new ProfileStatusResponse
            {
                HasProfile = hoSo != null,
                Status = hoSo?.TrangThaiXacMinh
            };

            return Ok(response);
        }
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateMaidProfileRequest request)
        {
            try
            {
                // 1. Lấy MaNguoiDung từ JWT Token
                var maNguoiDung = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(maNguoiDung))
                {
                    return Unauthorized(new { message = "Không xác định được danh tính người dùng." });
                }

                // 2. Tìm HoSoNguoiGiupViec dựa trên MaNguoiGiupViec (tức là MaNguoiDung)
                // Phải Include bảng KyNangNguoiGiupViecs để thao tác xóa/thêm
                var hoSo = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .FirstOrDefaultAsync(hs => hs.MaNguoiGiupViec == maNguoiDung);

                if (hoSo == null)
                {
                    return NotFound(new { message = "Không tìm thấy hồ sơ của bạn. Vui lòng đăng ký hồ sơ trước." });
                }

                // 3. Cập nhật các trường thông tin cơ bản
                // Nếu Frontend truyền null, giữ nguyên giá trị cũ trong DB
                hoSo.TenNguoiThan = request.TenNguoiThan ?? hoSo.TenNguoiThan;
                hoSo.SdtnguoiThan = request.SdtnguoiThan ?? hoSo.SdtnguoiThan;
                hoSo.KinhNghiem = request.KinhNghiem ?? hoSo.KinhNghiem;
                hoSo.MoTaChiTietKinhNghiem = request.MoTaChiTietKinhNghiem ?? hoSo.MoTaChiTietKinhNghiem;

                // 4. Cập nhật bảng trung gian KyNangNguoiGiupViec
                if (request.DanhSachMaKyNang != null && request.DanhSachMaKyNang.Any())
                {
                    // Kiểm tra xem các MaKyNang gửi lên có thực sự tồn tại trong bảng KyNang không (tránh lỗi khóa ngoại)
                    var existingSkillIds = await _context.KyNangs
                        .Where(k => request.DanhSachMaKyNang.Contains(k.MaKyNang))
                        .Select(k => k.MaKyNang)
                        .ToListAsync();

                    if (existingSkillIds.Count != request.DanhSachMaKyNang.Count)
                    {
                        return BadRequest(new { message = "Một hoặc nhiều mã kỹ năng không hợp lệ." });
                    }

                    // Xóa toàn bộ liên kết kỹ năng cũ của hồ sơ này
                    _context.KyNangNguoiGiupViecs.RemoveRange(hoSo.KyNangNguoiGiupViecs);

                    // Tạo danh sách liên kết kỹ năng mới
                    var newSkills = request.DanhSachMaKyNang.Select(maKyNang => new KyNangNguoiGiupViec
                    {
                        MaHoSo = hoSo.MaHoSo,
                        MaKyNang = maKyNang,
                        NgayThem = DateTime.Now // Lưu ý: Trong DB bạn set DEFAULT GETDATE() nhưng EF Core nhiều khi bắt gán bằng tay nếu không cấu hình Fluent API kỹ
                    }).ToList();

                    // Thêm mới vào DB
                    await _context.KyNangNguoiGiupViecs.AddRangeAsync(newSkills);
                }

                // 5. Lưu xuống DB
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                // TODO: Ghi log lỗi ex.Message
                return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật hồ sơ.", details = ex.Message });
            }
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                // 1. Lấy MaNguoiDung từ JWT Token
                var maNguoiDung = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(maNguoiDung))
                {
                    return Unauthorized(new { message = "Không xác định được danh tính người dùng." });
                }

                // 2. Truy vấn dữ liệu: Lấy User kèm theo Hồ Sơ và Danh sách Kỹ Năng
                // Lưu ý: Đảm bảo các Navigation Property trong EF Core đã được cấu hình (ví dụ: u.HoSoNguoiGiupViec)
                var userProfile = await _context.NguoiDungs
                    .Where(u => u.MaNguoiDung == maNguoiDung)
                    .Select(u => new
                    {
                        User = u,
                        // Lấy hồ sơ (Vì 1 người dùng - 1 hồ sơ nên dùng FirstOrDefault)
                        HoSo = _context.HoSoNguoiGiupViecs.FirstOrDefault(hs => hs.MaNguoiGiupViec == u.MaNguoiDung),
                        // Lấy danh sách Kỹ năng nối với bảng KyNang để lấy tên
                        KyNangs = _context.KyNangNguoiGiupViecs
                                    .Where(kn => kn.MaHoSo == _context.HoSoNguoiGiupViecs.FirstOrDefault(hs => hs.MaNguoiGiupViec == u.MaNguoiDung).MaHoSo)
                                    .Join(_context.KyNangs,
                                          kn_hs => kn_hs.MaKyNang,
                                          kn => kn.MaKyNang,
                                          (kn_hs, kn) => kn.MaKyNang + " - " + kn.TenKyNang)
                                    .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (userProfile == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng." });
                }

                // 3. Map dữ liệu ra DTO để trả về Frontend
                var response = new MaidProfileResponse
                {
                    MaNguoiDung = userProfile.User.MaNguoiDung,
                    HoTen = userProfile.User.HoTen ?? "",
                    SoDienThoai = userProfile.User.SoDienThoai ?? "",
                    Email = userProfile.User.Email ?? "",
                    DiaChi = userProfile.User.DiaChi ?? "",

                    // Lấy ảnh chân dung từ hồ sơ, nếu không có thì dùng avatar mặc định
                    AnhChanDung = userProfile.HoSo?.AnhChanDung ?? "https://i.pravatar.cc/150?u=" + userProfile.User.MaNguoiDung,

                    KinhNghiem = userProfile.HoSo?.KinhNghiem ?? "Chưa có kinh nghiệm",
                    MoTaChiTietKinhNghiem = userProfile.HoSo?.MoTaChiTietKinhNghiem ?? "",
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
    }
}