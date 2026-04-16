using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request;
using MyWebApi.Models;
using MyWebApi.Service; // Đảm bảo đúng namespace của Service

namespace MyWebApi.Controllers
{
    [Route("api/v1/maid")]
    [ApiController]
    public class MaidController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public MaidController(ApplicationDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterMaid([FromForm] HoSoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Lưu File và lấy URL
                string? cccdFrontUrl = request.CccdFront != null ? await _fileStorage.UploadAsync(request.CccdFront) : null;
                string? cccdBackUrl = request.CccdBack != null ? await _fileStorage.UploadAsync(request.CccdBack) : null;
                string? portraitUrl = request.Portrait != null ? await _fileStorage.UploadAsync(request.Portrait) : null;
                string? residenceUrl = request.Residence != null ? await _fileStorage.UploadAsync(request.Residence) : null;

                // 2. Tạo ID tự động (Đã sửa lỗi query sai bảng)
                string maNguoiDung = await GenerateIdVarchar5("ND", "NguoiDung", "MaNguoiDung");
                string maHoSo = await GenerateIdVarchar5("HS", "HoSoNguoiGiupViec", "MaHoSo");

                // 3. Thêm NguoiDung
                var nguoiDung = new NguoiDung
                {
                    MaNguoiDung = maNguoiDung,
                    HoTen = request.FullName,
                    SoDienThoai = request.Phone,
                    DiaChi = request.Address,
                    TrangThai = true,
                    NgayTao = DateTime.Now,
                    AnhDaiDien = portraitUrl
                };
                _context.NguoiDungs.Add(nguoiDung);

                // 4. Gán Vai Trò VT02 (Người giúp việc)
                var userRole = new NguoiDungVaiTro
                {
                    MaNguoiDung = maNguoiDung,
                    MaVaiTro = "VT02",
                    NgayGan = DateTime.Now
                };
                _context.NguoiDungVaiTros.Add(userRole);

                // 5. Thêm HoSoNguoiGiupViec
                var hoSo = new HoSoNguoiGiupViec
                {
                    MaHoSo = maHoSo,
                    MaNguoiGiupViec = maNguoiDung,
                    SoCccd = request.IdCard,
                    NgaySinh = request.Dob,
                    GioiTinh = request.Gender,
                    KinhNghiem = request.ExperienceYears,
                    MoTaChiTietKinhNghiem = request.ExperienceDesc,
                    TenNguoiThan = request.RelativeName,
                    SdtnguoiThan = request.RelativePhone,
                    AnhCccdmatTruoc = cccdFrontUrl,
                    AnhCccdmatSau = cccdBackUrl,
                    AnhChanDung = portraitUrl,
                    GiayXacNhanCuTru = residenceUrl,
                    TrangThaiXacMinh = "CHỜ DUYỆT"
                };
                _context.HoSoNguoiGiupViecs.Add(hoSo);

                // 6. Xử lý Kỹ năng
                if (!string.IsNullOrEmpty(request.Skills))
                {
                    var skillKeys = JsonSerializer.Deserialize<List<string>>(request.Skills);
                    if (skillKeys != null)
                    {
                        foreach (var key in skillKeys)
                        {
                            _context.KyNangNguoiGiupViecs.Add(new KyNangNguoiGiupViec
                            {
                                MaHoSo = maHoSo,
                                MaKyNang = GetMaKyNangRealId(key),
                                NgayThem = DateTime.Now
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Đăng ký thành công!", maHoSo });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống", detail = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // --- HELPER METHODS ---

        private async Task<string> GenerateIdVarchar5(string prefix, string tableName, string columnName)
        {
            try
            {
                // Thêm "AS [Value]" để EF Core có thể map vào kiểu string
                var lastId = await _context.Database
                    .SqlQueryRaw<string>($"SELECT TOP 1 {columnName} AS [Value] FROM {tableName} ORDER BY {columnName} DESC")
                    .FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(lastId))
                    return prefix + "001";

                // Cắt bỏ phần chữ (prefix), lấy phần số và tăng thêm 1
                // Ví dụ: ND005 -> lấy 005 -> thành 6 -> kết quả ND006
                string numericPart = lastId.Replace(prefix, "");
                if (int.TryParse(numericPart, out int currentNumber))
                {
                    return prefix + (currentNumber + 1).ToString("D3");
                }

                return prefix + "001";
            }
            catch (Exception)
            {
                // Nếu có lỗi (ví dụ bảng chưa có dữ liệu), mặc định trả về 001
                return prefix + "001";
            }
        }

        private string GetMaKyNangRealId(string key)
        {
            return key switch
            {
                "cleaning" => "KN001",
                "cooking" => "KN002",
                "childcare" => "KN003",
                "eldercare" => "KN004",
                "laundry" => "KN005",
                _ => "KN006"
            };
        }
    }
}