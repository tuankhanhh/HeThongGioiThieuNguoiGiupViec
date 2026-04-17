using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MyWebApi.DTO.Request;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/v1/maid")]
    [ApiController]
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
    }
}