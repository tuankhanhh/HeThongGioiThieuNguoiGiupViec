using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request.Staff;
using MyWebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyWebApi.Controllers
{
    [Route("api/v1/staff")]
    [ApiController]
    [Authorize(Roles = "Staff")]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StaffController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =============================================
        // 1. HO SO NGUOI GIUP VIEC
        // =============================================

        // GET /api/v1/staff/ho-so-cho-duyet
        [HttpGet("ho-so-cho-duyet")]
        public async Task<IActionResult> GetHoSoChoDuyet()
        {
            try
            {
                var danhSach = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Chờ duyệt")
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .Select(hs => new
                    {
                        maHoSo = hs.MaHoSo,
                        maNguoiGiupViec = hs.MaNguoiGiupViec,
                        hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                        email = hs.MaNguoiGiupViecNavigation.Email,
                        soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                        gioiTinh = hs.GioiTinh,
                        ngaySinh = hs.NgaySinh,
                        trangThai = hs.TrangThaiXacMinh
                    })
                    .ToListAsync();

                return Ok(new { success = true, message = "Lấy danh sách hồ sơ chờ duyệt thành công.", data = danhSach });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // GET /api/v1/staff/chi-tiet-ho-so/{id}
        [HttpGet("chi-tiet-ho-so/{id}")]
        public async Task<IActionResult> GetChiTietHoSo(string id)
        {
            try
            {
                var hoSo = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                        .ThenInclude(kn => kn.MaKyNangNavigation)
                    .Where(hs => hs.MaHoSo == id)
                    .Select(hs => new
                    {
                        maHoSo = hs.MaHoSo,
                        maNguoiGiupViec = hs.MaNguoiGiupViec,
                        hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                        email = hs.MaNguoiGiupViecNavigation.Email,
                        soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                        diaChi = hs.MaNguoiGiupViecNavigation.DiaChi,
                        soCccd = hs.SoCccd,
                        ngaySinh = hs.NgaySinh,
                        gioiTinh = hs.GioiTinh,
                        tenNguoiThan = hs.TenNguoiThan,
                        sdtNguoiThan = hs.SdtnguoiThan,
                        anhCccdmatTruoc = hs.AnhCccdmatTruoc,
                        anhCccdmatSau = hs.AnhCccdmatSau,
                        anhChanDung = hs.AnhChanDung,
                        giayXacNhanCuTru = hs.GiayXacNhanCuTru,
                        trangThai = hs.TrangThaiXacMinh,
                        lyDoTuChoi = hs.LyDoTuChoi,
                        danhSachKyNang = hs.KyNangNguoiGiupViecs
                            .Select(kn => new {
                                id = kn.MaKyNang,
                                ten = kn.MaKyNangNavigation.TenKyNang,
                                kinhNghiem = kn.KinhNghiem
                            })
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (hoSo == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hồ sơ." });

                return Ok(new { success = true, data = hoSo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // POST /api/v1/staff/duyet-ho-so
        [HttpPost("duyet-ho-so")]
        public async Task<IActionResult> DuyetHoSo([FromBody] DuyetHoSoRequest request)
        {
            try
            {
                var hoSo = await _context.HoSoNguoiGiupViecs.FindAsync(request.MaHoSo);
                if (hoSo == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hồ sơ." });

                if (hoSo.TrangThaiXacMinh != "Chờ duyệt")
                    return BadRequest(new { success = false, message = "Hồ sơ này đã được xử lý trước đó." });

                hoSo.TrangThaiXacMinh = "Đã duyệt";
                hoSo.LyDoTuChoi = null;
                _context.HoSoNguoiGiupViecs.Update(hoSo);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Duyệt hồ sơ thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // POST /api/v1/staff/tu-choi-ho-so
        [HttpPost("tu-choi-ho-so")]
        public async Task<IActionResult> TuChoiHoSo([FromBody] TuChoiHoSoRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.LyDoTuChoi))
                return BadRequest(new { success = false, message = "Lý do từ chối là bắt buộc." });

            try
            {
                var hoSo = await _context.HoSoNguoiGiupViecs.FindAsync(request.MaHoSo);
                if (hoSo == null)
                    return NotFound(new { success = false, message = "Không tìm thấy hồ sơ." });

                if (hoSo.TrangThaiXacMinh != "Chờ duyệt")
                    return BadRequest(new { success = false, message = "Hồ sơ này đã được xử lý trước đó." });

                hoSo.TrangThaiXacMinh = "Từ chối";
                hoSo.LyDoTuChoi = request.LyDoTuChoi;
                _context.HoSoNguoiGiupViecs.Update(hoSo);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Từ chối hồ sơ thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // =============================================
        // 2. YEU CAU DAT DICH VU
        // =============================================

        // GET /api/v1/staff/danh-sach-yeu-cau?status=
        [HttpGet("danh-sach-yeu-cau")]
        public async Task<IActionResult> GetDanhSachYeuCau([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.DonDats
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.MaKhachhangNavigation)
                    .AsQueryable();

                var danhSach = await query
                    .Select(d => new
                    {
                        maDon = d.MaDon,
                        maKhachHang = d.MaKhachhang,
                        hoTenKhachHang = d.MaKhachhangNavigation.HoTen,
                        soDienThoai = d.MaKhachhangNavigation.SoDienThoai,
                        diaChi = d.DiaChi,
                        soNgay = d.SoNgay,
                        tongTien = d.TongTien,
                        ngayDat = d.NgayDat,
                        ghiChu = d.GhiChu,
                        trangThaiHienTai = d.LichSuTrangThaiDons
                            .OrderByDescending(l => l.ThoiGianCapNhat)
                            .Select(l => l.TrangThai)
                            .FirstOrDefault() ?? "Chờ xác nhận"
                    })
                    .ToListAsync();

                // Lọc theo status nếu có
                if (!string.IsNullOrEmpty(status))
                {
                    danhSach = danhSach
                        .Where(d => d.trangThaiHienTai == status)
                        .ToList();
                }

                return Ok(new { success = true, message = "Lấy danh sách yêu cầu thành công.", data = danhSach });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // GET /api/v1/staff/chi-tiet-yeu-cau/{id}
        [HttpGet("chi-tiet-yeu-cau/{id}")]
        public async Task<IActionResult> GetChiTietYeuCau(string id)
        {
            try
            {
                var don = await _context.DonDats
                    .Include(d => d.MaKhachhangNavigation)
                    .Include(d => d.MaNhanVienNavigation)
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.MaDichVuNavigation)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.NgayLamViecs)
                            .ThenInclude(nlv => nlv.MaNguoiGiupViecNavigation)
                    .Include(d => d.ThanhToans)
                    .FirstOrDefaultAsync(d => d.MaDon == id);

                if (don == null)
                    return NotFound(new { success = false, message = "Không tìm thấy yêu cầu." });

                var result = new
                {
                    maDon = don.MaDon,
                    diaChi = don.DiaChi,
                    soNgay = don.SoNgay,
                    tongTien = don.TongTien,
                    ngayDat = don.NgayDat,
                    ghiChu = don.GhiChu,
                    trangThaiHienTai = don.LichSuTrangThaiDons
                        .OrderByDescending(l => l.ThoiGianCapNhat)
                        .FirstOrDefault()?.TrangThai,
                    lichSuTrangThai = don.LichSuTrangThaiDons
                        .OrderByDescending(l => l.ThoiGianCapNhat)
                        .Select(l => new { l.TrangThai, l.ThoiGianCapNhat })
                        .ToList(),
                    khachHang = new
                    {
                        ma = don.MaKhachhang,
                        hoTen = don.MaKhachhangNavigation.HoTen,
                        email = don.MaKhachhangNavigation.Email,
                        sdtKhach = don.MaKhachhangNavigation.SoDienThoai
                    },
                    nhanVien = don.MaNhanVienNavigation == null ? null : new
                    {
                        ma = don.MaNhanVien,
                        hoTen = don.MaNhanVienNavigation.HoTen
                    },
                    dichVus = don.DonDatDichVus.Select(dv => new
                    {
                        maDonDatDichVu = dv.MaDonDatDichVu,
                        maDichVu = dv.MaDichVu,
                        tenDichVu = dv.MaDichVuNavigation.TenDichVu,
                        ngayLamViecs = dv.NgayLamViecs.Select(nlv => new
                        {
                            maNgayLamViec = nlv.MaNgayLamViec,
                            ngayLam = nlv.NgayLam,
                            gioBatDau = nlv.GioBatDau,
                            trangThai = nlv.TrangThai,
                            maNguoiGiupViec = nlv.MaNguoiGiupViec,
                            tenNguoiGiupViec = nlv.MaNguoiGiupViecNavigation != null
                                ? nlv.MaNguoiGiupViecNavigation.HoTen : null
                        }).ToList()
                    }).ToList(),
                    thanhToan = don.ThanhToans.Select(tt => new
                    {
                        tt.MaThanhToan,
                        tt.TrangThaiThanhToan
                    }).FirstOrDefault()
                };

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // =============================================
        // 3. PHAN CONG CONG VIEC
        // =============================================

        // POST /api/v1/staff/phan-cong-cong-viec
        [HttpPost("phan-cong-cong-viec")]
        public async Task<IActionResult> PhanCongCongViec([FromBody] PhanCongCongViecRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var don = await _context.DonDats
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.NgayLamViecs)
                    .FirstOrDefaultAsync(d => d.MaDon == request.MaDon);

                if (don == null)
                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt." });

                var currentStatus = don.LichSuTrangThaiDons
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .FirstOrDefault()?.TrangThai;

                if (currentStatus != "Chờ xác nhận")
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Đơn đang ở trạng thái '{currentStatus}', không thể phân công."
                    });
                }

                // Lấy mã nhân viên đang đăng nhập
                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(maNhanVien))
                    return Unauthorized(new { success = false, message = "Không xác định được nhân viên." });

                // Xác định chế độ: 1 người, theo dịch vụ, hay theo ngày
                bool dungTheoNgay = request.PhanCongTheoNgayLamViec != null && request.PhanCongTheoNgayLamViec.Count > 0;
                bool dung2Nguoi = request.PhanCongTheoDichVu != null && request.PhanCongTheoDichVu.Count > 0;

                if (dungTheoNgay)
                {
                    // Chế độ 3: ưu tiên cao nhất - mỗi NgayLamViec có người riêng
                    var mapPhanCong = request.PhanCongTheoNgayLamViec!
                        .ToDictionary(x => x.MaNgayLamViec, x => x.MaNguoiGiupViec);

                    var allMaidIds = mapPhanCong.Values.Distinct().ToList();
                    foreach (var maidId in allMaidIds)
                    {
                        var nguoi = await _context.NguoiDungs.FindAsync(maidId);
                        if (nguoi == null)
                            return NotFound(new { success = false, message = $"Không tìm thấy người giúp việc: {maidId}." });
                    }

                    var maNLVtrongDon = don.DonDatDichVus.SelectMany(dv => dv.NgayLamViecs).Select(nlv => nlv.MaNgayLamViec).ToHashSet();
                    foreach (var key in mapPhanCong.Keys)
                    {
                        if (!maNLVtrongDon.Contains(key))
                            return BadRequest(new { success = false, message = $"MaNgayLamViec '{key}' không thuộc đơn này." });
                    }

                    foreach (var dv in don.DonDatDichVus)
                    {
                        foreach (var nlv in dv.NgayLamViecs)
                        {
                            if (!mapPhanCong.TryGetValue(nlv.MaNgayLamViec, out var maidIdForNlv)) continue;

                            nlv.MaNguoiGiupViec = maidIdForNlv;
                            nlv.TrangThai = "Đã phân công";
                            nlv.ThoiGianPhanCong = DateTime.Now;
                        }
                    }
                }
                else if (dung2Nguoi)
                {
                    // Chế độ 2: mỗi DonDatDichVu có người riêng
                    var mapPhanCong = request.PhanCongTheoDichVu!
                        .ToDictionary(x => x.MaDonDatDichVu, x => x.MaNguoiGiupViec);

                    var allMaidIds = mapPhanCong.Values.Distinct().ToList();
                    foreach (var maidId in allMaidIds)
                    {
                        var nguoi = await _context.NguoiDungs.FindAsync(maidId);
                        if (nguoi == null)
                            return NotFound(new { success = false, message = $"Không tìm thấy người giúp việc: {maidId}." });
                    }

                    var maDDDVtrongDon = don.DonDatDichVus.Select(dv => dv.MaDonDatDichVu).ToHashSet();
                    foreach (var key in mapPhanCong.Keys)
                    {
                        if (!maDDDVtrongDon.Contains(key))
                            return BadRequest(new { success = false, message = $"MaDonDatDichVu '{key}' không thuộc đơn này." });
                    }

                    foreach (var dv in don.DonDatDichVus)
                    {
                        if (!mapPhanCong.TryGetValue(dv.MaDonDatDichVu, out var maidIdForDv)) continue;

                        foreach (var nlv in dv.NgayLamViecs)
                        {
                            nlv.MaNguoiGiupViec = maidIdForDv;
                            nlv.TrangThai = "Đã phân công";
                            nlv.ThoiGianPhanCong = DateTime.Now;
                        }
                    }
                }
                else
                {
                    // Chế độ 1: gán cùng 1 người cho toàn bộ NgayLamViec
                    if (string.IsNullOrWhiteSpace(request.MaNguoiGiupViec))
                        return BadRequest(new { success = false, message = "Cần cung cấp MaNguoiGiupViec, PhanCongTheoDichVu hoặc PhanCongTheoNgayLamViec." });

                    var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.MaNguoiGiupViec);
                    if (nguoiGiupViec == null)
                        return NotFound(new { success = false, message = "Không tìm thấy người giúp việc." });

                    foreach (var dv in don.DonDatDichVus)
                    {
                        foreach (var nlv in dv.NgayLamViecs)
                        {
                            nlv.MaNguoiGiupViec = request.MaNguoiGiupViec;
                            nlv.TrangThai = "Đã phân công";
                            nlv.ThoiGianPhanCong = DateTime.Now;
                        }
                    }
                }

                // Gán nhân viên duyệt đơn
                don.MaNhanVien = maNhanVien;

                // Ghi lịch sử trạng thái mới
                string maLichSu = await GenerateMaLichSuAsync();
                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = don.MaDon,
                    TrangThai = "Đã xác nhận",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Phân công công việc thành công." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // =============================================
        // 4. TU CHOI YEU CAU
        // =============================================

        // POST /api/v1/staff/tu-choi-yeu-cau
        [HttpPost("tu-choi-yeu-cau")]
        public async Task<IActionResult> TuChoiYeuCau([FromBody] TuChoiYeuCauRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.LyDoTuChoi))
                return BadRequest(new { success = false, message = "Lý do từ chối là bắt buộc." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var don = await _context.DonDats
                    .Include(d => d.LichSuTrangThaiDons)
                    .FirstOrDefaultAsync(d => d.MaDon == request.MaDon);

                if (don == null)
                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt." });

                var currentStatus = don.LichSuTrangThaiDons
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .FirstOrDefault()?.TrangThai;

                if (currentStatus != "Chờ xác nhận")
                    return BadRequest(new { success = false, message = $"Đơn đang ở trạng thái '{currentStatus}', không thể từ chối." });

                string maLichSu = await GenerateMaLichSuAsync();
                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = don.MaDon,
                    TrangThai = "Hủy đơn",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);

                don.GhiChu = string.IsNullOrEmpty(don.GhiChu) ? $"Lý do hủy: {request.LyDoTuChoi}" : $"{don.GhiChu}\nLý do hủy: {request.LyDoTuChoi}";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    message = "Từ chối yêu cầu thành công",
                    lyDo = request.LyDoTuChoi
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        [HttpGet("danh-sach-nguoi-giup-viec")]
        public async Task<IActionResult> GetDanhSachNguoiGiupViec([FromQuery] string? maDon = null)
        {
            try
            {
                // ================================================================
                // Bước 1: Đọc thông tin đơn và dựng các slot làm việc tuần tự
                // ================================================================
                var donInfo = new List<(string MaDonDatDichVu, string? MaKyNang, List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> Slots)>();
                var allSlotsDon = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();
                var singleSlotsDict = new Dictionary<string, (DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();

                DonDat? donDat = null;

                if (!string.IsNullOrWhiteSpace(maDon))
                {
                    donDat = await _context.DonDats
                        .Include(d => d.DonDatDichVus)
                            .ThenInclude(dv => dv.MaDichVuNavigation)
                        .Include(d => d.DonDatDichVus)
                            .ThenInclude(dv => dv.NgayLamViecs)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(d => d.MaDon == maDon);

                    if (donDat != null)
                    {
                        TimeSpan? GetDuration(NgayLamViec nlv)
                        {
                            if (nlv.ThoiLuongThucHien.HasValue && nlv.ThoiLuongThucHien.Value > 0)
                                return TimeSpan.FromMinutes(nlv.ThoiLuongThucHien.Value);

                            if (nlv.GioBatDau.HasValue && nlv.GioKetThuc.HasValue && nlv.GioKetThuc.Value > nlv.GioBatDau.Value)
                                return nlv.GioKetThuc.Value.ToTimeSpan() - nlv.GioBatDau.Value.ToTimeSpan();

                            return null;
                        }

                        // Lấy tất cả NgayLamViec của toàn bộ đơn
                        var allNlvFlat = donDat.DonDatDichVus
                            .SelectMany(dv => dv.NgayLamViecs.Select(nlv => new { dv, nlv }))
                            .Where(x => x.nlv.NgayLam.HasValue && x.nlv.GioBatDau.HasValue)
                            .ToList();

                        // Nhóm theo ngày để xếp lịch tuần tự
                        var groupedDays = allNlvFlat
                            .GroupBy(x => x.nlv.NgayLam!.Value)
                            .OrderBy(g => g.Key);

                        foreach (var dayGroup in groupedDays)
                        {
                            // Sắp xếp theo giờ bắt đầu ban đầu, sau đó theo mã dịch vụ, mã ngày làm việc
                            var orderedInDay = dayGroup
                                .OrderBy(x => x.nlv.GioBatDau!.Value)
                                .ThenBy(x => x.dv.MaDonDatDichVu)
                                .ThenBy(x => x.nlv.MaNgayLamViec)
                                .ToList();

                            if (orderedInDay.Count == 0) continue;

                            TimeSpan currentTime = orderedInDay[0].nlv.GioBatDau!.Value.ToTimeSpan();

                            foreach (var item in orderedInDay)
                            {
                                var duration = GetDuration(item.nlv);
                                if (duration == null || duration.Value <= TimeSpan.Zero)
                                    continue;

                                var start = currentTime;
                                var end = start.Add(duration.Value);

                                singleSlotsDict[item.nlv.MaNgayLamViec] = (dayGroup.Key, start, end);
                                currentTime = end; // Dịch vụ tiếp theo sẽ bắt đầu khi dịch vụ này kết thúc
                            }
                        }

                        // Gom nhóm lại theo từng dịch vụ
                        foreach (var dv in donDat.DonDatDichVus.OrderBy(x => x.MaDonDatDichVu))
                        {
                            var serviceSlots = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();
                            var maKyNang = dv.MaDichVuNavigation?.MaKyNang;

                            foreach (var nlv in dv.NgayLamViecs)
                            {
                                if (singleSlotsDict.TryGetValue(nlv.MaNgayLamViec, out var slot))
                                {
                                    serviceSlots.Add(slot);
                                    allSlotsDon.Add(slot);
                                }
                            }

                            donInfo.Add((dv.MaDonDatDichVu, maKyNang, serviceSlots));
                        }
                    }
                }

                var allRequiredSkills = donInfo
                    .Where(x => x.MaKyNang != null)
                    .Select(x => x.MaKyNang!)
                    .Distinct()
                    .ToHashSet();

                // ================================================================
                // Bước 2: Lấy dữ liệu hồ sơ, đánh giá, lịch bận, lịch rảnh
                // ================================================================

                // 2.1. Hồ sơ
                var hoSoDaDuyet = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                        .ThenInclude(nd => nd.NguoiDungVaiTros)
                            .ThenInclude(nv => nv.MaVaiTroNavigation)
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                        .ThenInclude(kn => kn.MaKyNangNavigation)
                    .AsNoTracking()
                    .ToListAsync();

                // 2.2. Đánh giá (tính toán số sao và tổng số đánh giá)
                var allRatingsRaw = await _context.DanhGia
                    .Where(dg => dg.SoSao.HasValue)
                    .SelectMany(dg => dg.MaDonNavigation.DonDatDichVus
                        .SelectMany(dv => dv.NgayLamViecs)
                        .Where(nlv => nlv.MaNguoiGiupViec != null)
                        .Select(nlv => new { dg.MaDanhGia, MaidId = nlv.MaNguoiGiupViec, SoSao = dg.SoSao }))
                    .ToListAsync();

                var ratingsData = allRatingsRaw
                    .DistinctBy(x => new { x.MaDanhGia, x.MaidId })
                    .GroupBy(x => x.MaidId)
                    .ToDictionary(g => g.Key!, g => new {
                        TongSoDanhGia = g.Count(),
                        SoSaoDanhGia = Math.Round(g.Average(x => x.SoSao!.Value), 1)
                    });

                // 2.3. Lịch bận
                var tatCaNgayLamViec = await _context.NgayLamViecs
                    .Where(nlv => nlv.MaNguoiGiupViec != null
                                  && nlv.NgayLam.HasValue
                                  && nlv.GioBatDau.HasValue
                                  && nlv.TrangThai != "Đã hủy")
                    .AsNoTracking()
                    .ToListAsync();

                var soLichDangCo = new Dictionary<string, int>();
                var biBanLichAll = new HashSet<string>();

                foreach (var nlv in tatCaNgayLamViec)
                {
                    var maidId = nlv.MaNguoiGiupViec!;

                    if (!soLichDangCo.ContainsKey(maidId))
                        soLichDangCo[maidId] = 0;
                    soLichDangCo[maidId]++;

                    if (allSlotsDon.Count > 0 && !biBanLichAll.Contains(maidId) && nlv.GioBatDau.HasValue)
                    {
                        TimeSpan maidStart = nlv.GioBatDau.Value.ToTimeSpan();
                        TimeSpan maidEnd;

                        if (nlv.GioKetThuc.HasValue)
                            maidEnd = nlv.GioKetThuc.Value.ToTimeSpan();
                        else if (nlv.ThoiLuongThucHien.HasValue && nlv.ThoiLuongThucHien.Value > 0)
                            maidEnd = maidStart.Add(TimeSpan.FromMinutes(nlv.ThoiLuongThucHien.Value));
                        else
                            continue;

                        foreach (var ld in allSlotsDon)
                        {
                            if (ld.Ngay == nlv.NgayLam!.Value && maidStart < ld.GioKetThuc && ld.GioBatDau < maidEnd)
                            {
                                biBanLichAll.Add(maidId);
                                break;
                            }
                        }
                    }
                }

                // 2.4. Lịch rảnh
                var lichRanh = await _context.LichRanhs
                    .Include(lr => lr.LichRanhCaLamViecs)
                        .ThenInclude(lrc => lrc.MaCaLamViecNavigation)
                    .AsNoTracking()
                    .ToListAsync();

                bool CoLichRanhBaoPhu(string maidId, List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> slots)
                {
                    if (slots.Count == 0) return true;

                    foreach (var ld in slots)
                    {
                        var lichTrongNgay = lichRanh
                            .Where(lr => lr.MaNguoiGiupViec == maidId && lr.Ngay == ld.Ngay)
                            .ToList();

                        var caSlots = lichTrongNgay
                            .SelectMany(lr => lr.LichRanhCaLamViecs)
                            .Select(ca => (
                                Start: ca.MaCaLamViecNavigation.GioBatDau.ToTimeSpan(),
                                End: ca.MaCaLamViecNavigation.GioKetThuc.ToTimeSpan()
                            ))
                            .OrderBy(x => x.Start)
                            .ToList();

                        var merged = new List<(TimeSpan Start, TimeSpan End)>();
                        foreach (var slot in caSlots)
                        {
                            if (!merged.Any())
                            {
                                merged.Add(slot);
                            }
                            else
                            {
                                var last = merged[merged.Count - 1];
                                if (slot.Start <= last.End)
                                    merged[merged.Count - 1] = (last.Start, slot.End > last.End ? slot.End : last.End);
                                else
                                    merged.Add(slot);
                            }
                        }

                        bool covered = merged.Any(m => m.Start <= ld.GioBatDau && m.End >= ld.GioKetThuc);
                        if (!covered) return false;
                    }

                    return true;
                }

                bool HopLeCoban(HoSoNguoiGiupViec hs)
                {
                    return hs.MaNguoiGiupViecNavigation?.NguoiDungVaiTros != null
                           && hs.MaNguoiGiupViecNavigation.NguoiDungVaiTros.Any(nv =>
                                nv.MaVaiTroNavigation != null &&
                                nv.MaVaiTroNavigation.TenVaiTro == "Maid");
                }

                // ================================================================
                // Bước 3: Lọc danh sách ứng viên Mode 1 (1 người cho toàn đơn)
                // ================================================================
                var candidates1Nguoi = hoSoDaDuyet
                    .Where(hs =>
                    {
                        if (!HopLeCoban(hs)) return false;
                        if (biBanLichAll.Contains(hs.MaNguoiGiupViec)) return false;

                        var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToHashSet();
                        bool duKyNang = allRequiredSkills.Count == 0
                                        || allRequiredSkills.All(rs => maidSkills.Contains(rs));
                        if (!duKyNang) return false;

                        return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, allSlotsDon);
                    })
                    .Select(hs =>
                    {
                        var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNangNavigation?.TenKyNang ?? k.MaKyNang).ToList();
                        var chiTietKyNang = hs.KyNangNguoiGiupViecs.Select(k => new { k.MaKyNang, TenKyNang = k.MaKyNangNavigation?.TenKyNang, k.KinhNghiem }).ToList();
                        var maidId = hs.MaNguoiGiupViec;
                        var rating = ratingsData.GetValueOrDefault(maidId);
                        var soKyNangPhuHop = allRequiredSkills.Count(rs => hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == rs));

                        return new
                        {
                            maNguoiGiupViec = maidId,
                            hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                            soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                            email = hs.MaNguoiGiupViecNavigation.Email,
                            anhChanDung = hs.AnhChanDung,
                            danhSachKyNang = maidSkills,
                            chiTietKyNang = chiTietKyNang,
                            soSaoDanhGia = rating?.SoSaoDanhGia,
                            tongSoDanhGia = rating?.TongSoDanhGia ?? 0,
                            _soKyNangPhuHop = soKyNangPhuHop,
                            _soLichDangCo = soLichDangCo.GetValueOrDefault(maidId, 0)
                        };
                    })
                    .OrderByDescending(x => x._soKyNangPhuHop)
                    .ThenBy(x => x._soLichDangCo)
                    .ThenByDescending(x => x.soSaoDanhGia ?? 0)
                    .ThenBy(x => x.maNguoiGiupViec)
                    .Select(x => new {
                        x.maNguoiGiupViec,
                        x.hoTen,
                        x.soDienThoai,
                        x.email,
                        x.anhChanDung,
                        x.danhSachKyNang,
                        x.chiTietKyNang,
                        x.soSaoDanhGia,
                        x.tongSoDanhGia
                    })
                    .ToList<object>();

                // ================================================================
                // Bước 4: Lọc danh sách ứng viên Mode 2 (theo dịch vụ)
                // ================================================================
                var goiYTheoDichVu = new List<object>();

                if ((donDat?.DonDatDichVus.Count ?? 0) > 0)
                {
                    foreach (var dvInfo in donInfo)
                    {
                        var biBanLichDv = new HashSet<string>();

                        if (dvInfo.Slots.Count > 0)
                        {
                            foreach (var nlv in tatCaNgayLamViec)
                            {
                                var maidId = nlv.MaNguoiGiupViec!;
                                if (biBanLichDv.Contains(maidId) || !nlv.GioBatDau.HasValue) continue;

                                TimeSpan mS = nlv.GioBatDau.Value.ToTimeSpan();
                                TimeSpan mE = nlv.GioKetThuc.HasValue
                                    ? nlv.GioKetThuc.Value.ToTimeSpan()
                                    : nlv.ThoiLuongThucHien.HasValue
                                        ? mS.Add(TimeSpan.FromMinutes(nlv.ThoiLuongThucHien.Value))
                                        : mS;

                                foreach (var ld in dvInfo.Slots)
                                {
                                    if (ld.Ngay == nlv.NgayLam!.Value && mS < ld.GioKetThuc && ld.GioBatDau < mE)
                                    {
                                        biBanLichDv.Add(maidId);
                                        break;
                                    }
                                }
                            }
                        }

                        var candidatesDv = hoSoDaDuyet
                            .Where(hs =>
                            {
                                if (!HopLeCoban(hs)) return false;
                                if (biBanLichDv.Contains(hs.MaNguoiGiupViec)) return false;

                                if (dvInfo.MaKyNang != null)
                                {
                                    var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToHashSet();
                                    if (!maidSkills.Contains(dvInfo.MaKyNang)) return false;
                                }

                                return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, dvInfo.Slots);
                            })
                            .Select(hs =>
                            {
                                var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNangNavigation?.TenKyNang ?? k.MaKyNang).ToList();
                                var chiTietKyNang = hs.KyNangNguoiGiupViecs.Select(k => new { k.MaKyNang, TenKyNang = k.MaKyNangNavigation?.TenKyNang, k.KinhNghiem }).ToList();
                                var maidId = hs.MaNguoiGiupViec;
                                var rating = ratingsData.GetValueOrDefault(maidId);
                                var soKyNangPhuHop = dvInfo.MaKyNang != null && hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == dvInfo.MaKyNang) ? 1 : 0;

                                return new
                                {
                                    maNguoiGiupViec = maidId,
                                    hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                                    soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                                    email = hs.MaNguoiGiupViecNavigation.Email,
                                    anhChanDung = hs.AnhChanDung,
                                    danhSachKyNang = maidSkills,
                                    chiTietKyNang = chiTietKyNang,
                                    soSaoDanhGia = rating?.SoSaoDanhGia,
                                    tongSoDanhGia = rating?.TongSoDanhGia ?? 0,
                                    _soKyNangPhuHop = soKyNangPhuHop,
                                    _soLichDangCo = soLichDangCo.GetValueOrDefault(maidId, 0)
                                };
                            })
                            .OrderByDescending(x => x._soKyNangPhuHop)
                            .ThenBy(x => x._soLichDangCo)
                            .ThenByDescending(x => x.soSaoDanhGia ?? 0)
                            .ThenBy(x => x.maNguoiGiupViec)
                            .Select(x => new {
                                x.maNguoiGiupViec,
                                x.hoTen,
                                x.soDienThoai,
                                x.email,
                                x.anhChanDung,
                                x.danhSachKyNang,
                                x.chiTietKyNang,
                                x.soSaoDanhGia,
                                x.tongSoDanhGia
                            })
                            .ToList<object>();

                        goiYTheoDichVu.Add(new
                        {
                            maDonDatDichVu = dvInfo.MaDonDatDichVu,
                            candidates = candidatesDv
                        });
                    }
                }

                // ================================================================
                // Bước 5: Lọc danh sách ứng viên Mode 3 (theo ngày làm việc)
                // ================================================================
                var goiYTheoNgayLamViec = new List<object>();

                if (donDat != null && singleSlotsDict.Count > 0)
                {
                    foreach (var kvp in singleSlotsDict)
                    {
                        var maNgayLamViec = kvp.Key;
                        var slot = kvp.Value;
                        var singleSlotList = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> { slot };

                        var dv = donDat.DonDatDichVus.FirstOrDefault(d => d.NgayLamViecs.Any(n => n.MaNgayLamViec == maNgayLamViec));
                        var maKyNang = dv?.MaDichVuNavigation?.MaKyNang;

                        var biBanLichNgay = new HashSet<string>();
                        foreach (var tatCaNlv in tatCaNgayLamViec)
                        {
                            var maidId = tatCaNlv.MaNguoiGiupViec!;
                            if (biBanLichNgay.Contains(maidId) || !tatCaNlv.GioBatDau.HasValue) continue;

                            TimeSpan mS = tatCaNlv.GioBatDau.Value.ToTimeSpan();
                            TimeSpan mE = tatCaNlv.GioKetThuc.HasValue
                                ? tatCaNlv.GioKetThuc.Value.ToTimeSpan()
                                : tatCaNlv.ThoiLuongThucHien.HasValue
                                    ? mS.Add(TimeSpan.FromMinutes(tatCaNlv.ThoiLuongThucHien.Value))
                                    : mS;

                            if (slot.Ngay == tatCaNlv.NgayLam!.Value && mS < slot.GioKetThuc && slot.GioBatDau < mE)
                            {
                                biBanLichNgay.Add(maidId);
                            }
                        }

                        var candidatesNgay = hoSoDaDuyet
                            .Where(hs =>
                            {
                                if (!HopLeCoban(hs)) return false;
                                if (biBanLichNgay.Contains(hs.MaNguoiGiupViec)) return false;

                                if (maKyNang != null)
                                {
                                    var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToHashSet();
                                    if (!maidSkills.Contains(maKyNang)) return false;
                                }

                                return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, singleSlotList);
                            })
                            .Select(hs =>
                            {
                                var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNangNavigation?.TenKyNang ?? k.MaKyNang).ToList();
                                var chiTietKyNang = hs.KyNangNguoiGiupViecs.Select(k => new { k.MaKyNang, TenKyNang = k.MaKyNangNavigation?.TenKyNang, k.KinhNghiem }).ToList();
                                var maidId = hs.MaNguoiGiupViec;
                                var rating = ratingsData.GetValueOrDefault(maidId);
                                var soKyNangPhuHop = maKyNang != null && hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == maKyNang) ? 1 : 0;

                                return new
                                {
                                    maNguoiGiupViec = maidId,
                                    hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                                    soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                                    email = hs.MaNguoiGiupViecNavigation.Email,
                                    anhChanDung = hs.AnhChanDung,
                                    danhSachKyNang = maidSkills,
                                    chiTietKyNang = chiTietKyNang,
                                    soSaoDanhGia = rating?.SoSaoDanhGia,
                                    tongSoDanhGia = rating?.TongSoDanhGia ?? 0,
                                    _soKyNangPhuHop = soKyNangPhuHop,
                                    _soLichDangCo = soLichDangCo.GetValueOrDefault(maidId, 0)
                                };
                            })
                            .OrderByDescending(x => x._soKyNangPhuHop)
                            .ThenBy(x => x._soLichDangCo)
                            .ThenByDescending(x => x.soSaoDanhGia ?? 0)
                            .ThenBy(x => x.maNguoiGiupViec)
                            .Select(x => new {
                                x.maNguoiGiupViec,
                                x.hoTen,
                                x.soDienThoai,
                                x.email,
                                x.anhChanDung,
                                x.danhSachKyNang,
                                x.chiTietKyNang,
                                x.soSaoDanhGia,
                                x.tongSoDanhGia
                            })
                            .ToList<object>();

                        goiYTheoNgayLamViec.Add(new
                        {
                            maNgayLamViec = maNgayLamViec,
                            maDonDatDichVu = dv?.MaDonDatDichVu,
                            tenDichVu = dv?.MaDichVuNavigation?.TenDichVu,
                            ngayLam = slot.Ngay.ToString("yyyy-MM-dd"),
                            gioBatDau = slot.GioBatDau.ToString(@"hh\:mm"),
                            candidates = candidatesNgay
                        });
                    }
                }

                return Ok(new
                {
                    success = true,
                    data = candidates1Nguoi,
                    goiY2Nguoi = goiYTheoDichVu,
                    goiYTheoNgayLamViec = goiYTheoNgayLamViec
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống.",
                    detail = ex.Message
                });
            }
        }

        // =============================================
        // 5. KHIEU NAI
        // =============================================

        // GET /api/v1/staff/danh-sach-khieu-nai
        [HttpGet("danh-sach-khieu-nai")]
        public async Task<IActionResult> GetDanhSachKhieuNai()
        {
            try
            {
                var danhSach = await _context.KhieuNais
                    .Include(kn => kn.MaKhachHangNavigation)
                    .Include(kn => kn.MaDonNavigation)
                    .Select(kn => new
                    {
                        maKhieuNai = kn.MaKhieuNai,
                        maDon = kn.MaDon,
                        maKhachHang = kn.MaKhachHang,
                        hoTenKhachHang = kn.MaKhachHangNavigation.HoTen,
                        sdtKhachHang = kn.MaKhachHangNavigation.SoDienThoai,
                        maNhanVien = kn.MaNhanVien,
                        ngayDatDon = kn.MaDonNavigation.NgayDat,
                        trangThai = kn.TrangThai
                    })
                    .ToListAsync();

                return Ok(new { success = true, message = "Lấy danh sách khiếu nại thành công.", data = danhSach });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // GET /api/v1/staff/chi-tiet-khieu-nai/{id}
        [HttpGet("chi-tiet-khieu-nai/{id}")]
        public async Task<IActionResult> GetChiTietKhieuNai(string id)
        {
            try
            {
                var kn = await _context.KhieuNais
                    .Include(k => k.MaKhachHangNavigation)
                    .Include(k => k.MaNhanVienNavigation)
                    .Include(k => k.MaDonNavigation)
                        .ThenInclude(d => d.LichSuTrangThaiDons)
                    .FirstOrDefaultAsync(k => k.MaKhieuNai == id);

                if (kn == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khiếu nại." });

                var result = new
                {
                    maKhieuNai = kn.MaKhieuNai,
                    maDon = kn.MaDon,
                    noiDung = kn.NoiDung,
                    thoiGian = kn.ThoiGian,
                    trangThai = kn.TrangThai,
                    phanHoi = kn.PhanHoi,
                    maKhachHang = kn.MaKhachHang,
                    hoTenKhachHang = kn.MaKhachHangNavigation.HoTen,
                    emailKhachHang = kn.MaKhachHangNavigation.Email,
                    sdtKhachHang = kn.MaKhachHangNavigation.SoDienThoai,
                    maNhanVien = kn.MaNhanVien,
                    hoTenNhanVien = kn.MaNhanVienNavigation != null ? kn.MaNhanVienNavigation.HoTen : null,
                    thongTinDon = new
                    {
                        ngayDat = kn.MaDonNavigation.NgayDat,
                        tongTien = kn.MaDonNavigation.TongTien,
                        diaChi = kn.MaDonNavigation.DiaChi,
                        trangThaiHienTai = kn.MaDonNavigation.LichSuTrangThaiDons
                            .OrderByDescending(l => l.ThoiGianCapNhat)
                            .FirstOrDefault()?.TrangThai
                    }
                };

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // POST /api/v1/staff/cap-nhat-khieu-nai
        [HttpPost("cap-nhat-khieu-nai")]
        public async Task<IActionResult> CapNhatKhieuNai([FromBody] CapNhatKhieuNaiRequest request)
        {
            var trangThaiHopLe = new[] { "Chưa xử lý", "Đang xử lý", "Đã giải quyết" };
            if (!trangThaiHopLe.Contains(request.TrangThai))
                return BadRequest(new { success = false, message = "Trạng thái không hợp lệ. Cho phép: 'Chưa xử lý', 'Đang xử lý', 'Đã giải quyết'." });

            if (request.TrangThai == "Đã giải quyết" && string.IsNullOrWhiteSpace(request.NoiDungPhanHoi))
                return BadRequest(new { success = false, message = "Nội dung phản hồi là bắt buộc khi trạng thái là 'Đã giải quyết'." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var kn = await _context.KhieuNais
                    .Include(k => k.MaDonNavigation)
                    .FirstOrDefaultAsync(k => k.MaKhieuNai == request.MaKhieuNai);

                if (kn == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khiếu nại." });

                kn.TrangThai = request.TrangThai;
                if (!string.IsNullOrWhiteSpace(request.NoiDungPhanHoi))
                {
                    kn.PhanHoi = request.NoiDungPhanHoi;
                }

                // Ghi nhận trạng thái xử lý khiếu nại vào LichSuTrangThaiDon của đơn liên quan
                string maLichSu = await GenerateMaLichSuAsync();
                string noiDungLichSu = request.TrangThai == "Đã giải quyết"
                    ? $"Khiếu nại {kn.MaKhieuNai} đã giải quyết. Phản hồi: {request.NoiDungPhanHoi}"
                    : $"Khiếu nại {kn.MaKhieuNai}: {request.TrangThai}";

                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = kn.MaDon,
                    TrangThai = noiDungLichSu,
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);

                _context.KhieuNais.Update(kn);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                string thongBao = request.TrangThai switch
                {
                    "Chưa xử lý" => "Đã cập nhật khiếu nại về trạng thái chờ xử lý.",
                    "Đang xử lý" => "Khiếu nại đang được xử lý.",
                    "Đã giải quyết" => "Khiếu nại đã giải quyết thành công.",
                    _ => "Cập nhật khiếu nại thành công."
                };

                return Ok(new { success = true, message = thongBao });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }


        // =============================================
        // HELPER
        // =============================================

        private async Task<string> GenerateMaLichSuAsync()
        {
            string ma;
            do
            {
                ma = "LS" + Random.Shared.Next(100, 1000);
            }
            while (await _context.LichSuTrangThaiDons.AnyAsync(x => x.MaLichSu == ma));
            return ma;
        }
    }
}
