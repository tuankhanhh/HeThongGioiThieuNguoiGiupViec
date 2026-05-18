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
                // 1. Phân tích & Kiểm tra biểu mẫu (Validation)
                if (string.IsNullOrWhiteSpace(request.TenDichVu))
                {
                    return BadRequest(new { success = false, message = "Tên dịch vụ không được để trống." });
                }
                if (request.TenDichVu.Length > 100)
                {
                    return BadRequest(new { success = false, message = "Tên dịch vụ vượt quá giới hạn 100 ký tự." });
                }
                if (!string.IsNullOrEmpty(request.MoTa) && request.MoTa.Length > 500)
                {
                    return BadRequest(new { success = false, message = "Mô tả dịch vụ vượt quá giới hạn 500 ký tự." });
                }
                if (!string.IsNullOrEmpty(request.HinhAnh) && request.HinhAnh.Length > 255)
                {
                    return BadRequest(new { success = false, message = "URL hình ảnh vượt quá giới hạn 255 ký tự. Vui lòng sử dụng URL ngắn hơn hoặc link ảnh khác." });
                }

                // 2. Tạo ID dịch vụ đảm bảo KHÔNG trùng lặp trong cơ sở dữ liệu
                string maDichVu = "";
                bool isUnique = false;
                while (!isUnique)
                {
                    maDichVu = GenerateId("DV");
                    isUnique = !await _context.DichVus.AnyAsync(dv => dv.MaDichVu == maDichVu);
                }

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

                // 3. Liên kết Dịch vụ thành phần
                if (request.ThanhPhans != null && request.ThanhPhans.Any())
                {
                    foreach (var tpName in request.ThanhPhans)
                    {
                        if (string.IsNullOrWhiteSpace(tpName)) continue;

                        var thanhPhan = await _context.ThanhPhans.FirstOrDefaultAsync(tp => tp.TenThanhPhan == tpName);
                        if (thanhPhan == null)
                        {
                            string maThanhPhan = "";
                            bool isTpUnique = false;
                            while (!isTpUnique)
                            {
                                maThanhPhan = GenerateId("TP");
                                isTpUnique = !await _context.ThanhPhans.AnyAsync(tp => tp.MaThanhPhan == maThanhPhan);
                            }
                            thanhPhan = new ThanhPhan
                            {
                                MaThanhPhan = maThanhPhan,
                                TenThanhPhan = tpName
                            };
                            _context.ThanhPhans.Add(thanhPhan);
                            await _context.SaveChangesAsync();
                        }

                        var dvtp = new DichVuThanhPhan
                        {
                            MaDichVu = dichVu.MaDichVu,
                            MaThanhPhan = thanhPhan.MaThanhPhan
                        };
                        _context.DichVuThanhPhans.Add(dvtp);
                    }
                    await _context.SaveChangesAsync();
                }

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
                // 1. Phân tích & Kiểm tra biểu mẫu (Validation)
                if (string.IsNullOrWhiteSpace(request.TenDichVu))
                {
                    return BadRequest(new { success = false, message = "Tên dịch vụ không được để trống." });
                }
                if (request.TenDichVu.Length > 100)
                {
                    return BadRequest(new { success = false, message = "Tên dịch vụ vượt quá giới hạn 100 ký tự." });
                }
                if (!string.IsNullOrEmpty(request.MoTa) && request.MoTa.Length > 500)
                {
                    return BadRequest(new { success = false, message = "Mô tả dịch vụ vượt quá giới hạn 500 ký tự." });
                }
                if (!string.IsNullOrEmpty(request.HinhAnh) && request.HinhAnh.Length > 255)
                {
                    return BadRequest(new { success = false, message = "URL hình ảnh vượt quá giới hạn 255 ký tự. Vui lòng sử dụng URL ngắn hơn hoặc link ảnh khác." });
                }

                var dichVu = await _context.DichVus.FindAsync(maDichVu);
                if (dichVu == null)
                    return NotFound(new { success = false, message = "Không tìm thấy dịch vụ" });

                dichVu.TenDichVu = request.TenDichVu;
                dichVu.MoTa = request.MoTa;
                dichVu.GiaTheoGio = request.GiaTheoGio;
                dichVu.HinhAnh = request.HinhAnh;
                dichVu.PhoBien = request.PhoBien;

                await _context.SaveChangesAsync();

                // 2. Cập nhật liên kết Dịch vụ thành phần: Xóa cũ, Thêm mới
                var existingTps = await _context.DichVuThanhPhans.Where(x => x.MaDichVu == maDichVu).ToListAsync();
                if (existingTps.Any())
                {
                    _context.DichVuThanhPhans.RemoveRange(existingTps);
                    await _context.SaveChangesAsync();
                }

                if (request.ThanhPhans != null)
                {
                    foreach (var tpName in request.ThanhPhans)
                    {
                        if (string.IsNullOrWhiteSpace(tpName)) continue;

                        var thanhPhan = await _context.ThanhPhans.FirstOrDefaultAsync(tp => tp.TenThanhPhan == tpName);
                        if (thanhPhan == null)
                        {
                            string maThanhPhan = "";
                            bool isTpUnique = false;
                            while (!isTpUnique)
                            {
                                maThanhPhan = GenerateId("TP");
                                isTpUnique = !await _context.ThanhPhans.AnyAsync(tp => tp.MaThanhPhan == maThanhPhan);
                            }
                            thanhPhan = new ThanhPhan
                            {
                                MaThanhPhan = maThanhPhan,
                                TenThanhPhan = tpName
                            };
                            _context.ThanhPhans.Add(thanhPhan);
                            await _context.SaveChangesAsync();
                        }

                        var dvtp = new DichVuThanhPhan
                        {
                            MaDichVu = maDichVu,
                            MaThanhPhan = thanhPhan.MaThanhPhan
                        };
                        _context.DichVuThanhPhans.Add(dvtp);
                    }
                    await _context.SaveChangesAsync();
                }

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

                // Đồng bộ chính xác với ràng buộc CHK_TrangThaiDichVu trong database
                dichVu.TrangThai = "Ngừng cung cấp";
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
            string id = prefix + randomNum.ToString();
            return id.Length > 5 ? id.Substring(0, 5) : id;
        }

        // ================= QUẢN LÝ NGƯỜI DÙNG =================
        [HttpPost("users/{maNguoiDung}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string maNguoiDung)
        {
            try
            {
                var user = await _context.NguoiDungs
                    .Include(u => u.NguoiDungVaiTros)
                    .ThenInclude(ur => ur.MaVaiTroNavigation)
                    .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung);

                if (user == null)
                    return NotFound(new { success = false, message = "Không tìm thấy người dùng" });

                // Kiểm tra xem người dùng bị khóa có phải là Admin không
                var isAdmin = user.NguoiDungVaiTros.Any(ur => ur.MaVaiTroNavigation.TenVaiTro == "Admin");
                if (isAdmin)
                {
                    return BadRequest(new { success = false, message = "Không thể khóa tài khoản của Quản trị viên khác" });
                }

                user.TrangThai = !user.TrangThai; 
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = user.TrangThai ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
                    trangThai = user.TrangThai
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ================= KIỂM DUYỆT HỒ SƠ =================
        [HttpGet("profiles-pending")]
        public async Task<IActionResult> GetPendingProfiles()
        {
            try
            {
                var profiles = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .Where(hs => hs.TrangThaiXacMinh == "Chờ duyệt")
                    .Select(hs => new
                    {
                        maHoSo = hs.MaHoSo,
                        maNguoiDung = hs.MaNguoiGiupViec,
                        hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                        email = hs.MaNguoiGiupViecNavigation.Email,
                        soCccd = hs.SoCccd,
                        ngaySinh = hs.NgaySinh,
                        gioiTinh = hs.GioiTinh,
                        anhCccdMatTruoc = hs.AnhCccdmatTruoc,
                        anhCccdMatSau = hs.AnhCccdmatSau,
                        anhChanDung = hs.AnhChanDung,
                        giayXacNhanCuTru = hs.GiayXacNhanCuTru,
                        trangThaiXacMinh = hs.TrangThaiXacMinh
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = profiles });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("profiles-approve/{maHoSo}")]
        public async Task<IActionResult> ApproveProfile(string maHoSo)
        {
            try
            {
                var profile = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .FirstOrDefaultAsync(hs => hs.MaHoSo == maHoSo);

                if (profile == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hồ sơ" });

                profile.TrangThaiXacMinh = "Đã duyệt";
                
                // Đảm bảo user có role Maid
                var roleMaid = await _context.VaiTros.FirstOrDefaultAsync(v => v.TenVaiTro == "Maid");
                if (roleMaid != null)
                {
                    var hasRole = await _context.NguoiDungVaiTros
                        .AnyAsync(ur => ur.MaNguoiDung == profile.MaNguoiGiupViec && ur.MaVaiTro == roleMaid.MaVaiTro);
                    
                    if (!hasRole)
                    {
                        _context.NguoiDungVaiTros.Add(new NguoiDungVaiTro
                        {
                            MaNguoiDung = profile.MaNguoiGiupViec,
                            MaVaiTro = roleMaid.MaVaiTro,
                            NgayGan = DateTime.Now
                        });
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Duyệt hồ sơ thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("profiles-reject/{maHoSo}")]
        public async Task<IActionResult> RejectProfile(string maHoSo, [FromBody] RejectRequest request)
        {
            try
            {
                var profile = await _context.HoSoNguoiGiupViecs.FindAsync(maHoSo);
                if (profile == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hồ sơ" });

                profile.TrangThaiXacMinh = "Từ chối";
                profile.LyDoTuChoi = request.LyDo;

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Đã từ chối hồ sơ" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
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
        public List<string> ThanhPhans { get; set; } = new List<string>();
    }

    public class RejectRequest
    {
        public string LyDo { get; set; } = string.Empty;
    }
}


