using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

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
                .Include(dv => dv.DichVuKyNangs)
                    .ThenInclude(dvkn => dvkn.MaKyNangNavigation)
                .ToListAsync();

            var skillsMap = await _context.KyNangs.ToDictionaryAsync(k => k.MaKyNang, k => k.TenKyNang);

            var result = services.Select(dv =>
            {
                var kns = dv.DichVuKyNangs
                    .Select(kn => kn.MaKyNangNavigation?.TenKyNang)
                    .Where(name => name != null)
                    .ToList();

                if (!kns.Any() && !string.IsNullOrEmpty(dv.MaKyNang) && skillsMap.TryGetValue(dv.MaKyNang.Trim(), out var skillName))
                {
                    kns.Add(skillName);
                }

                return new
                {
                    maDichVu = dv.MaDichVu.Trim(),
                    tenDichVu = dv.TenDichVu,
                    moTa = dv.MoTa,
                    giaTheoGio = dv.GiaTheoGio,
                    hinhAnh = dv.HinhAnh,
                    trangThai = dv.TrangThai,
                    phoBien = dv.PhoBien,
                    thanhPhans = dv.DichVuThanhPhans
                        .Select(tp => tp.MaThanhPhanNavigation?.TenThanhPhan)
                        .Where(name => name != null)
                        .ToList(),
                    kyNangs = kns
                };
            }).ToList();

            return Ok(new { success = true, data = result });
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] ServiceRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.TenDichVu))
                    return BadRequest(new { success = false, message = "Tên dịch vụ không được để trống." });
                
                string maDichVu = await GenerateSequentialId("DV");

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

                if (request.KyNangs != null && request.KyNangs.Any())
                {
                    var firstKyNang = await _context.KyNangs.FirstOrDefaultAsync(kn => kn.TenKyNang.Trim() == request.KyNangs.First().Trim());
                    if (firstKyNang != null)
                    {
                        dichVu.MaKyNang = firstKyNang.MaKyNang;
                    }
                }

                _context.DichVus.Add(dichVu);
                await _context.SaveChangesAsync();

                if (request.ThanhPhans != null && request.ThanhPhans.Any())
                {
                    foreach (var tpName in request.ThanhPhans)
                    {
                        var thanhPhan = await _context.ThanhPhans.FirstOrDefaultAsync(tp => tp.TenThanhPhan.Trim() == tpName.Trim());
                        if (thanhPhan != null)
                        {
                            _context.DichVuThanhPhans.Add(new DichVuThanhPhan
                            {
                                MaDichVu = dichVu.MaDichVu,
                                MaThanhPhan = thanhPhan.MaThanhPhan
                            });
                        }
                    }
                }
                
                if (request.KyNangs != null && request.KyNangs.Any())
                {
                    foreach (var knName in request.KyNangs)
                    {
                        var kyNang = await _context.KyNangs.FirstOrDefaultAsync(kn => kn.TenKyNang.Trim() == knName.Trim());
                        if (kyNang != null)
                        {
                            _context.DichVuKyNangs.Add(new DichVuKyNang
                            {
                                MaDichVu = dichVu.MaDichVu,
                                MaKyNang = kyNang.MaKyNang
                            });
                        }
                    }
                }
                
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

                if (request.KyNangs != null && request.KyNangs.Any())
                {
                    var firstKyNang = await _context.KyNangs.FirstOrDefaultAsync(kn => kn.TenKyNang.Trim() == request.KyNangs.First().Trim());
                    if (firstKyNang != null)
                    {
                        dichVu.MaKyNang = firstKyNang.MaKyNang;
                    }
                }
                else
                {
                    dichVu.MaKyNang = null;
                }

                var existingTps = await _context.DichVuThanhPhans.Where(x => x.MaDichVu == maDichVu).ToListAsync();
                if (existingTps.Any()) _context.DichVuThanhPhans.RemoveRange(existingTps);
                
                var existingKns = await _context.DichVuKyNangs.Where(x => x.MaDichVu == maDichVu).ToListAsync();
                if (existingKns.Any()) _context.DichVuKyNangs.RemoveRange(existingKns);

                await _context.SaveChangesAsync();

                if (request.ThanhPhans != null)
                {
                    foreach (var tpName in request.ThanhPhans)
                    {
                        var thanhPhan = await _context.ThanhPhans.FirstOrDefaultAsync(tp => tp.TenThanhPhan.Trim() == tpName.Trim());
                        if (thanhPhan != null)
                        {
                            _context.DichVuThanhPhans.Add(new DichVuThanhPhan { MaDichVu = maDichVu, MaThanhPhan = thanhPhan.MaThanhPhan });
                        }
                    }
                }
                
                if (request.KyNangs != null)
                {
                    foreach (var knName in request.KyNangs)
                    {
                        var kyNang = await _context.KyNangs.FirstOrDefaultAsync(kn => kn.TenKyNang.Trim() == knName.Trim());
                        if (kyNang != null)
                        {
                            _context.DichVuKyNangs.Add(new DichVuKyNang { MaDichVu = maDichVu, MaKyNang = kyNang.MaKyNang });
                        }
                    }
                }
                
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
            var dichVu = await _context.DichVus.FindAsync(maDichVu);
            if (dichVu == null) return NotFound(new { success = false, message = "Không tìm thấy dịch vụ" });
            dichVu.TrangThai = "Ngừng cung cấp";
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa dịch vụ thành công" });
        }
        
        // ================= QUẢN LÝ THÀNH PHẦN DỊCH VỤ =================
        [HttpGet("service-components")]
        public async Task<IActionResult> GetServiceComponents()
        {
            var components = await _context.ThanhPhans.Select(t => new { maThanhPhan = t.MaThanhPhan, tenThanhPhan = t.TenThanhPhan }).ToListAsync();
            return Ok(new { success = true, data = components });
        }
        
        [HttpPost("service-components")]
        public async Task<IActionResult> CreateServiceComponent([FromBody] ServiceComponentRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TenThanhPhan)) return BadRequest(new { success = false, message = "Tên không hợp lệ" });
            
            string maThanhPhan = await GenerateSequentialId("TP");
            
            var tp = new ThanhPhan { MaThanhPhan = maThanhPhan, TenThanhPhan = request.TenThanhPhan };
            _context.ThanhPhans.Add(tp);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Thêm thành công", data = new { maThanhPhan = tp.MaThanhPhan, tenThanhPhan = tp.TenThanhPhan } });
        }
        
        [HttpPut("service-components/{id}")]
        public async Task<IActionResult> UpdateServiceComponent(string id, [FromBody] ServiceComponentRequest request)
        {
            var tp = await _context.ThanhPhans.FindAsync(id);
            if (tp == null) return NotFound(new { success = false, message = "Không tìm thấy" });
            tp.TenThanhPhan = request.TenThanhPhan;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật thành công" });
        }
        
        [HttpDelete("service-components/{id}")]
        public async Task<IActionResult> DeleteServiceComponent(string id)
        {
            var tp = await _context.ThanhPhans.FindAsync(id);
            if (tp == null) return NotFound(new { success = false, message = "Không tìm thấy" });
            _context.ThanhPhans.Remove(tp);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa thành công" });
        }
        
        // ================= QUẢN LÝ KỸ NĂNG =================
        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _context.KyNangs.Select(k => new { maKyNang = k.MaKyNang, tenKyNang = k.TenKyNang, moTa = k.MoTa, iconName = k.IconName }).ToListAsync();
            return Ok(new { success = true, data = skills });
        }
        
        [HttpPost("skills")]
        public async Task<IActionResult> CreateSkill([FromBody] SkillRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TenKyNang)) return BadRequest(new { success = false, message = "Tên không hợp lệ" });
            
            string maKyNang = await GenerateSequentialId("KN");
            
            var kn = new KyNang { MaKyNang = maKyNang, TenKyNang = request.TenKyNang, MoTa = request.MoTa, IconName = request.IconName };
            _context.KyNangs.Add(kn);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Thêm thành công", data = new { maKyNang = kn.MaKyNang, tenKyNang = kn.TenKyNang, moTa = kn.MoTa, iconName = kn.IconName } });
        }
        
        [HttpPut("skills/{id}")]
        public async Task<IActionResult> UpdateSkill(string id, [FromBody] SkillRequest request)
        {
            var kn = await _context.KyNangs.FindAsync(id);
            if (kn == null) return NotFound(new { success = false, message = "Không tìm thấy" });
            kn.TenKyNang = request.TenKyNang;
            kn.MoTa = request.MoTa;
            kn.IconName = request.IconName;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật thành công" });
        }
        
        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> DeleteSkill(string id)
        {
            var kn = await _context.KyNangs.FindAsync(id);
            if (kn == null) return NotFound(new { success = false, message = "Không tìm thấy" });
            _context.KyNangs.Remove(kn);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa thành công" });
        }

        private string GenerateId(string prefix)
        {
            int randomNum = new Random().Next(1000, 9999);
            string id = prefix + randomNum.ToString();
            return id.Length > 5 ? id.Substring(0, 5) : id;
        }

        private async Task<string> GenerateSequentialId(string prefix)
        {
            int maxNum = 0;
            if (prefix == "DV")
            {
                var ids = await _context.DichVus.Select(d => d.MaDichVu).ToListAsync();
                foreach (var id in ids)
                {
                    var cleanId = id.Trim();
                    if (cleanId.StartsWith("DV", StringComparison.OrdinalIgnoreCase))
                    {
                        if (int.TryParse(cleanId.Substring(2), out int num))
                        {
                            if (num > maxNum) maxNum = num;
                        }
                    }
                }
            }
            else if (prefix == "TP")
            {
                var ids = await _context.ThanhPhans.Select(t => t.MaThanhPhan).ToListAsync();
                foreach (var id in ids)
                {
                    var cleanId = id.Trim();
                    if (cleanId.StartsWith("TP", StringComparison.OrdinalIgnoreCase))
                    {
                        if (int.TryParse(cleanId.Substring(2), out int num))
                        {
                            if (num > maxNum) maxNum = num;
                        }
                    }
                }
            }
            else if (prefix == "KN")
            {
                var ids = await _context.KyNangs.Select(k => k.MaKyNang).ToListAsync();
                foreach (var id in ids)
                {
                    var cleanId = id.Trim();
                    if (cleanId.StartsWith("KN", StringComparison.OrdinalIgnoreCase))
                    {
                        if (int.TryParse(cleanId.Substring(2), out int num))
                        {
                            if (num > maxNum) maxNum = num;
                        }
                    }
                }
            }

            int nextNum = maxNum + 1;
            string nextId = prefix + nextNum.ToString("D3");
            return nextId;
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

    public class ServiceRequest
    {
        public string TenDichVu { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public decimal GiaTheoGio { get; set; }
        public string HinhAnh { get; set; } = string.Empty;
        public bool PhoBien { get; set; }
        public List<string> ThanhPhans { get; set; } = new List<string>();
        public List<string> KyNangs { get; set; } = new List<string>();
    }

    public class ServiceComponentRequest
    {
        public string TenThanhPhan { get; set; } = string.Empty;
    }
    
    public class SkillRequest
    {
        public string TenKyNang { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
    }
    
    public class RejectRequest
    {
        public string LyDo { get; set; } = string.Empty;
    }
}
