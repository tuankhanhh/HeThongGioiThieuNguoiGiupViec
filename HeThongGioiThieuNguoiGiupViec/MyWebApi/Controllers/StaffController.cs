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

                //// Xác định chế độ: 1 người, theo dịch vụ, hay theo ngày
                bool dungTheoNgay = request.PhanCongTheoNgayLamViec != null && request.PhanCongTheoNgayLamViec.Count > 0;
                //bool dung2Nguoi = request.PhanCongTheoDichVu != null && request.PhanCongTheoDichVu.Count > 0;

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
                //else if (dung2Nguoi)
                //{
                //    // Chế độ 2: mỗi DonDatDichVu có người riêng
                //    var mapPhanCong = request.PhanCongTheoDichVu!
                //        .ToDictionary(x => x.MaDonDatDichVu, x => x.MaNguoiGiupViec);

                //    var allMaidIds = mapPhanCong.Values.Distinct().ToList();
                //    foreach (var maidId in allMaidIds)
                //    {
                //        var nguoi = await _context.NguoiDungs.FindAsync(maidId);
                //        if (nguoi == null)
                //            return NotFound(new { success = false, message = $"Không tìm thấy người giúp việc: {maidId}." });
                //    }

                //    var maDDDVtrongDon = don.DonDatDichVus.Select(dv => dv.MaDonDatDichVu).ToHashSet();
                //    foreach (var key in mapPhanCong.Keys)
                //    {
                //        if (!maDDDVtrongDon.Contains(key))
                //            return BadRequest(new { success = false, message = $"MaDonDatDichVu '{key}' không thuộc đơn này." });
                //    }

                //    foreach (var dv in don.DonDatDichVus)
                //    {
                //        if (!mapPhanCong.TryGetValue(dv.MaDonDatDichVu, out var maidIdForDv)) continue;

                //        foreach (var nlv in dv.NgayLamViecs)
                //        {
                //            nlv.MaNguoiGiupViec = maidIdForDv;
                //            nlv.TrangThai = "Đã phân công";
                //            nlv.ThoiGianPhanCong = DateTime.Now;
                //        }
                //    }
                //}
                //else
                //{
                //    // Chế độ 1: gán cùng 1 người cho toàn bộ NgayLamViec
                //    if (string.IsNullOrWhiteSpace(request.MaNguoiGiupViec))
                //        return BadRequest(new { success = false, message = "Cần cung cấp MaNguoiGiupViec, PhanCongTheoDichVu hoặc PhanCongTheoNgayLamViec." });

                //    var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.MaNguoiGiupViec);
                //    if (nguoiGiupViec == null)
                //        return NotFound(new { success = false, message = "Không tìm thấy người giúp việc." });

                //    foreach (var dv in don.DonDatDichVus)
                //    {
                //        foreach (var nlv in dv.NgayLamViecs)
                //        {
                //            nlv.MaNguoiGiupViec = request.MaNguoiGiupViec;
                //            nlv.TrangThai = "Đã phân công";
                //            nlv.ThoiGianPhanCong = DateTime.Now;
                //        }
                //    }
                //}

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
            if (string.IsNullOrWhiteSpace(maDon))
            {
                return BadRequest(new { success = false, message = "Vui lòng cung cấp mã đơn hàng." });
            }

            try
            {
                var thongTinDichVuDon = new List<(string MaDonDatDichVu, string? MaKyNang, List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> Slots)>();
                var tatCaKhungGioDon = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();
                var tuDienKhungGioCaLam = new Dictionary<string, (DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();

                var donDatHienTai = await _context.DonDats
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.MaDichVuNavigation)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.NgayLamViecs)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.MaDon == maDon);

                if (donDatHienTai == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt hàng." });
                }

                var danhSachCaLamViecFlat = donDatHienTai.DonDatDichVus
                    .SelectMany(dv => dv.NgayLamViecs.Select(nlv => new { dv, nlv }))
                    .Where(x => x.nlv.NgayLam.HasValue && x.nlv.GioBatDau.HasValue)
                    .ToList();

                foreach (var phanTu in danhSachCaLamViecFlat)
                {
                    var caLamViec = phanTu.nlv;
                    var ngayLam = caLamViec.NgayLam!.Value;
                    var gioBatDau = caLamViec.GioBatDau!.Value.ToTimeSpan();
                    var gioKetThuc = caLamViec.GioKetThuc.HasValue
                        ? caLamViec.GioKetThuc.Value.ToTimeSpan()
                        : gioBatDau.Add(TimeSpan.FromHours(caLamViec.ThoiLuongThucHien ?? 2));

                    tuDienKhungGioCaLam[caLamViec.MaNgayLamViec] = (ngayLam, gioBatDau, gioKetThuc);
                }

                foreach (var dichVuDonDat in donDatHienTai.DonDatDichVus.OrderBy(x => x.MaDonDatDichVu))
                {
                    var danhSachKhungGioDichVu = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();
                    var maKyNangDichVu = dichVuDonDat.MaDichVuNavigation?.MaKyNang;

                    foreach (var caLamViec in dichVuDonDat.NgayLamViecs)
                    {
                        if (tuDienKhungGioCaLam.TryGetValue(caLamViec.MaNgayLamViec, out var khungGio))
                        {
                            danhSachKhungGioDichVu.Add(khungGio);
                            tatCaKhungGioDon.Add(khungGio);
                        }
                    }

                    thongTinDichVuDon.Add((dichVuDonDat.MaDonDatDichVu, maKyNangDichVu, danhSachKhungGioDichVu));
                }

                var tapHopKyNangYeuCau = thongTinDichVuDon
                    .Where(x => x.MaKyNang != null)
                    .Select(x => x.MaKyNang!)
                    .Distinct()
                    .ToHashSet();

                // Lấy hồ sơ (Gỡ bỏ chọc sâu vào NguoiDungVaiTros để tránh lỗi Null)
                var danhSachHoSoDaDuyet = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                        .ThenInclude(kn => kn.MaKyNangNavigation)
                    .AsNoTracking()
                    .ToListAsync();

                var danhSachCaLamViecDaNhan = await _context.NgayLamViecs
                    .Where(nlv => nlv.MaNguoiGiupViec != null
                                  && nlv.NgayLam.HasValue
                                  && nlv.GioBatDau.HasValue
                                  && (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang thực hiện"))
                    .AsNoTracking()
                    .ToListAsync();

                var soCaLamViecDaNhan = new Dictionary<string, int>();
                var danhSachBanLichMode1 = new HashSet<string>();
                foreach (var caDaNhan in danhSachCaLamViecDaNhan)
                {
                    var maNguoiGiupViecDaNhan = caDaNhan.MaNguoiGiupViec!;

                    if (!soCaLamViecDaNhan.ContainsKey(maNguoiGiupViecDaNhan))
                        soCaLamViecDaNhan[maNguoiGiupViecDaNhan] = 0;

                    soCaLamViecDaNhan[maNguoiGiupViecDaNhan]++;

                    if (tatCaKhungGioDon.Count > 0 && !danhSachBanLichMode1.Contains(maNguoiGiupViecDaNhan) && caDaNhan.GioBatDau.HasValue)
                    {
                        var gioBatDauCaDaNhan = caDaNhan.GioBatDau.Value.ToTimeSpan();
                        var gioKetThucCaDaNhan = caDaNhan.GioKetThuc.HasValue
                            ? caDaNhan.GioKetThuc.Value.ToTimeSpan()
                            : gioBatDauCaDaNhan.Add(TimeSpan.FromHours(caDaNhan.ThoiLuongThucHien ?? 2));

                        foreach (var khungGioYeuCau in tatCaKhungGioDon)
                        {
                            if (khungGioYeuCau.Ngay == caDaNhan.NgayLam!.Value &&
                                khungGioYeuCau.GioBatDau < gioKetThucCaDaNhan &&
                                khungGioYeuCau.GioKetThuc > gioBatDauCaDaNhan)
                            {
                                danhSachBanLichMode1.Add(maNguoiGiupViecDaNhan);
                                break;
                            }
                        }
                    }
                }

                // CẢI TIẾN LỚN NHẤT: Băm lịch rảnh thành Dictionary y hệt BookingController để chống sập API
                var rawShifts = await _context.LichRanhCaLamViecs
                    .Include(lrc => lrc.MaLichRanhNavigation)
                    .Include(lrc => lrc.MaCaLamViecNavigation)
                    .AsNoTracking()
                    .ToListAsync();

                var helperShiftsMap = rawShifts
                    .Where(lrc => lrc.MaLichRanhNavigation != null && lrc.MaCaLamViecNavigation != null)
                    .GroupBy(lrc => lrc.MaLichRanhNavigation.MaNguoiGiupViec)
                    .ToDictionary(
                        g => g.Key,
                        g => g.GroupBy(x => x.MaLichRanhNavigation.Ngay)
                              .ToDictionary(
                                  dayGroup => dayGroup.Key,
                                  dayGroup => dayGroup.Select(x => new
                                  {
                                      Start = x.MaCaLamViecNavigation.GioBatDau.ToTimeSpan(),
                                      End = x.MaCaLamViecNavigation.GioKetThuc.ToTimeSpan()
                                  }).OrderBy(x => x.Start).ToList()
                              )
                    );

                bool CoLichRanhBaoPhu(string maNguoiGiupViec, List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> danhSachKhungGio)
                {
                    if (danhSachKhungGio.Count == 0) return true;
                    if (!helperShiftsMap.ContainsKey(maNguoiGiupViec)) return false;

                    var shiftsOfMaid = helperShiftsMap[maNguoiGiupViec];

                    foreach (var khungGioYeuCau in danhSachKhungGio)
                    {
                        if (!shiftsOfMaid.ContainsKey(khungGioYeuCau.Ngay)) return false;

                        var caRanhTho = shiftsOfMaid[khungGioYeuCau.Ngay];
                        if (caRanhTho.Count == 0) return false;

                        var danhSachCaRanhDaGop = new List<(TimeSpan Start, TimeSpan End)>();
                        var current = caRanhTho[0];
                        TimeSpan gopStart = current.Start;
                        TimeSpan gopEnd = current.End;

                        for (int i = 1; i < caRanhTho.Count; i++)
                        {
                            var next = caRanhTho[i];
                            if (next.Start <= gopEnd)
                            {
                                if (next.End > gopEnd) gopEnd = next.End;
                            }
                            else
                            {
                                danhSachCaRanhDaGop.Add((gopStart, gopEnd));
                                gopStart = next.Start;
                                gopEnd = next.End;
                            }
                        }
                        danhSachCaRanhDaGop.Add((gopStart, gopEnd));

                        bool timThayCaBaoPhu = danhSachCaRanhDaGop.Any(caRanh =>
                            caRanh.Start <= khungGioYeuCau.GioBatDau && caRanh.End >= khungGioYeuCau.GioKetThuc);

                        if (!timThayCaBaoPhu) return false;
                    }
                    return true;
                }

                NguoiGiupViecOptionDto MapSangThongTinNguoiGiupViec(HoSoNguoiGiupViec hoSoCuaNguoiGiupViec, int soLichHienCo)
                {
                    var danhSachTenKyNang = hoSoCuaNguoiGiupViec.KyNangNguoiGiupViecs.Select(k => k.MaKyNangNavigation?.TenKyNang ?? k.MaKyNang).ToList();
                    var danhSachChiTietKyNang = hoSoCuaNguoiGiupViec.KyNangNguoiGiupViecs.Select(k => new ChiTietKyNangDto
                    {
                        maKyNang = k.MaKyNang,
                        tenKyNang = k.MaKyNangNavigation != null ? k.MaKyNangNavigation.TenKyNang : "",
                        kinhNghiem = k.KinhNghiem ?? ""
                    }).ToList();

                    return new NguoiGiupViecOptionDto
                    {
                        maNguoiGiupViec = hoSoCuaNguoiGiupViec.MaNguoiGiupViec,
                        hoTen = hoSoCuaNguoiGiupViec.MaNguoiGiupViecNavigation?.HoTen ?? "Chưa cập nhật",
                        soDienThoai = hoSoCuaNguoiGiupViec.MaNguoiGiupViecNavigation?.SoDienThoai ?? "",
                        email = hoSoCuaNguoiGiupViec.MaNguoiGiupViecNavigation?.Email ?? "",
                        anhChanDung = hoSoCuaNguoiGiupViec.AnhChanDung ?? "",
                        danhSachKyNang = danhSachTenKyNang,
                        chiTietKyNang = danhSachChiTietKyNang,
                        soLichDangCo = soLichHienCo,
                        canReplace = true
                    };
                }

                //// ========================== LỌC MODE 1 ==========================
                //var danhSachUuTienMode1 = danhSachHoSoDaDuyet
                //    .Where(hs =>
                //    {
                //        if (danhSachBanLichMode1.Contains(hs.MaNguoiGiupViec)) return false;

                //        if (tapHopKyNangYeuCau.Count > 0)
                //        {
                //            var tapHopKyNangNguoiGiupViec = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToHashSet();
                //            if (!tapHopKyNangYeuCau.All(rs => tapHopKyNangNguoiGiupViec.Contains(rs))) return false;
                //        }

                //        return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, tatCaKhungGioDon);
                //    })
                //    .Select(hs => MapSangThongTinNguoiGiupViec(hs, soCaLamViecDaNhan.GetValueOrDefault(hs.MaNguoiGiupViec, 0)))
                //    .ToList();

                //string? maNguoiGiupViecDaPhanCongMode1 = null;
                //var dsNguoiDaPhanCong = donDatHienTai.DonDatDichVus.SelectMany(dv => dv.NgayLamViecs).Select(nlv => nlv.MaNguoiGiupViec).Distinct().ToList();
                //if (dsNguoiDaPhanCong.Count == 1 && !string.IsNullOrEmpty(dsNguoiDaPhanCong[0]))
                //{
                //    maNguoiGiupViecDaPhanCongMode1 = dsNguoiDaPhanCong[0];
                //}

                //object? phanCongHienTaiMode1 = null;
                //var danhSachThayTeMode1 = new List<object>();

                //if (maNguoiGiupViecDaPhanCongMode1 != null)
                //{
                //    phanCongHienTaiMode1 = danhSachUuTienMode1.FirstOrDefault(x => x.maNguoiGiupViec == maNguoiGiupViecDaPhanCongMode1);
                //    danhSachThayTeMode1 = danhSachUuTienMode1.Where(x => x.maNguoiGiupViec != maNguoiGiupViecDaPhanCongMode1).Cast<object>().ToList();
                //}
                //else if (danhSachUuTienMode1.Count > 0)
                //{
                //    phanCongHienTaiMode1 = danhSachUuTienMode1[0];
                //    danhSachThayTeMode1 = danhSachUuTienMode1.Skip(1).Cast<object>().ToList();
                //}

                //// ========================== LỌC MODE 2 ==========================
                //var danhSachGoiYTheoDichVu = new List<object>();
                //foreach (var thongTinDichVu in thongTinDichVuDon)
                //{
                //    var danhSachBanLichDichVu = new HashSet<string>();
                //    if (thongTinDichVu.Slots.Count > 0)
                //    {
                //        foreach (var caDaNhan in danhSachCaLamViecDaNhan)
                //        {
                //            if (!caDaNhan.NgayLam.HasValue || !caDaNhan.GioBatDau.HasValue) continue;
                //            var maNguoiGiupViecDaNhan = caDaNhan.MaNguoiGiupViec!;
                //            if (danhSachBanLichDichVu.Contains(maNguoiGiupViecDaNhan)) continue;

                //            var gioBatDauCaDaNhan = caDaNhan.GioBatDau.Value.ToTimeSpan();
                //            var gioKetThucCaDaNhan = caDaNhan.GioKetThuc.HasValue ? caDaNhan.GioKetThuc.Value.ToTimeSpan() : gioBatDauCaDaNhan.Add(TimeSpan.FromHours(caDaNhan.ThoiLuongThucHien ?? 2));

                //            bool laChinhSlotDangXet = thongTinDichVu.Slots.Any(s => s.Ngay == caDaNhan.NgayLam.Value && s.GioBatDau == gioBatDauCaDaNhan && s.GioKetThuc == gioKetThucCaDaNhan);
                //            if (laChinhSlotDangXet) continue;

                //            foreach (var khungGioYeuCau in thongTinDichVu.Slots)
                //            {
                //                if (khungGioYeuCau.Ngay == caDaNhan.NgayLam.Value && khungGioYeuCau.GioBatDau < gioKetThucCaDaNhan && khungGioYeuCau.GioKetThuc > gioBatDauCaDaNhan)
                //                {
                //                    danhSachBanLichDichVu.Add(maNguoiGiupViecDaNhan);
                //                    break;
                //                }
                //            }
                //        }
                //    }

                //    var danhSachUuTienMode2 = danhSachHoSoDaDuyet
                //        .Where(hs =>
                //        {
                //            if (danhSachBanLichDichVu.Contains(hs.MaNguoiGiupViec)) return false;
                //            if (thongTinDichVu.MaKyNang != null && !hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == thongTinDichVu.MaKyNang)) return false;
                //            return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, thongTinDichVu.Slots);
                //        })
                //        .Select(hs => MapSangThongTinNguoiGiupViec(hs, soCaLamViecDaNhan.GetValueOrDefault(hs.MaNguoiGiupViec, 0)))
                //        .ToList();

                //    var banGhiDichVu = donDatHienTai.DonDatDichVus.FirstOrDefault(d => d.MaDonDatDichVu == thongTinDichVu.MaDonDatDichVu);
                //    string? maNguoiGiupViecDaPhanCongMode2 = banGhiDichVu?.NgayLamViecs.Select(nlv => nlv.MaNguoiGiupViec).Distinct().FirstOrDefault();

                //    object? phanCongHienTaiMode2 = null;
                //    var danhSachThayTeMode2 = new List<object>();

                //    if (maNguoiGiupViecDaPhanCongMode2 != null)
                //    {
                //        phanCongHienTaiMode2 = danhSachUuTienMode2.FirstOrDefault(x => x.maNguoiGiupViec == maNguoiGiupViecDaPhanCongMode2);
                //        danhSachThayTeMode2 = danhSachUuTienMode2.Where(x => x.maNguoiGiupViec != maNguoiGiupViecDaPhanCongMode2).Cast<object>().ToList();
                //    }
                //    else if (danhSachUuTienMode2.Count > 0)
                //    {
                //        phanCongHienTaiMode2 = danhSachUuTienMode2[0];
                //        danhSachThayTeMode2 = danhSachUuTienMode2.Skip(1).Cast<object>().ToList();
                //    }

                //    danhSachGoiYTheoDichVu.Add(new { maDonDatDichVu = thongTinDichVu.MaDonDatDichVu, currentAssignment = phanCongHienTaiMode2, replacementCandidates = danhSachThayTeMode2 });
                //}

                // ========================== LỌC MODE 3 ==========================
                var danhSachGoiYTheoNgayLamViec = new List<object>();
                foreach (var capKhungGio in tuDienKhungGioCaLam)
                {
                    var maNgayLamViec = capKhungGio.Key;
                    var khungGioYeuCau = capKhungGio.Value;
                    var danhSachKhungGioDon = new List<(DateOnly Ngay, TimeSpan GioBatDau, TimeSpan GioKetThuc)> { khungGioYeuCau };

                    var dichVuDonDat = donDatHienTai.DonDatDichVus.FirstOrDefault(d => d.NgayLamViecs.Any(n => n.MaNgayLamViec == maNgayLamViec));
                    var maKyNangDichVu = dichVuDonDat?.MaDichVuNavigation?.MaKyNang;

                    var danhSachBanLichNgay = new HashSet<string>();
                    foreach (var caDaNhan in danhSachCaLamViecDaNhan)
                    {
                        var maNguoiGiupViecDaNhan = caDaNhan.MaNguoiGiupViec!;
                        // VẪN GIỮ LOGIC BỎ QUA CA LÀM HIỆN TẠI NHƯ BẠN MUỐN
                        if (caDaNhan.MaNgayLamViec == maNgayLamViec || danhSachBanLichNgay.Contains(maNguoiGiupViecDaNhan) || !caDaNhan.GioBatDau.HasValue) continue;

                        var existingStart = caDaNhan.GioBatDau.Value.ToTimeSpan();
                        var existingEnd = caDaNhan.GioKetThuc.HasValue ? caDaNhan.GioKetThuc.Value.ToTimeSpan() : existingStart.Add(TimeSpan.FromHours(caDaNhan.ThoiLuongThucHien ?? 2));

                        if (khungGioYeuCau.Ngay == caDaNhan.NgayLam!.Value && existingStart < khungGioYeuCau.GioKetThuc && existingEnd > khungGioYeuCau.GioBatDau)
                            danhSachBanLichNgay.Add(maNguoiGiupViecDaNhan);
                    }

                    var danhSachUuTienMode3 = danhSachHoSoDaDuyet
                        .Where(hs =>
                        {
                            if (danhSachBanLichNgay.Contains(hs.MaNguoiGiupViec)) return false;
                            if (maKyNangDichVu != null && !hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == maKyNangDichVu)) return false;
                            return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, danhSachKhungGioDon);
                        })
                        .Select(hs => MapSangThongTinNguoiGiupViec(hs, soCaLamViecDaNhan.GetValueOrDefault(hs.MaNguoiGiupViec, 0)))
                        .ToList();

                    var banGhiNgayLamViec = donDatHienTai.DonDatDichVus.SelectMany(d => d.NgayLamViecs).FirstOrDefault(n => n.MaNgayLamViec == maNgayLamViec);
                    string? maNguoiGiupViecDaPhanCongMode3 = banGhiNgayLamViec?.MaNguoiGiupViec;

                    object? phanCongHienTaiMode3 = null;
                    var danhSachThayTetMode3 = new List<object>();

                    if (maNguoiGiupViecDaPhanCongMode3 != null)
                    {
                        phanCongHienTaiMode3 = danhSachUuTienMode3.FirstOrDefault(x => x.maNguoiGiupViec == maNguoiGiupViecDaPhanCongMode3);
                        danhSachThayTetMode3 = danhSachUuTienMode3.Where(x => x.maNguoiGiupViec != maNguoiGiupViecDaPhanCongMode3).Cast<object>().ToList();
                    }
                    else if (danhSachUuTienMode3.Count > 0)
                    {
                        phanCongHienTaiMode3 = danhSachUuTienMode3[0];
                        danhSachThayTetMode3 = danhSachUuTienMode3.Skip(1).Cast<object>().ToList();
                    }

                    danhSachGoiYTheoNgayLamViec.Add(new
                    {
                        maNgayLamViec = maNgayLamViec,
                        maDonDatDichVu = dichVuDonDat?.MaDonDatDichVu,
                        tenDichVu = dichVuDonDat?.MaDichVuNavigation?.TenDichVu,
                        ngayLam = khungGioYeuCau.Ngay.ToString("yyyy-MM-dd"),
                        gioBatDau = khungGioYeuCau.GioBatDau.ToString(@"hh\:mm"),
                        currentAssignment = phanCongHienTaiMode3,
                        replacementCandidates = danhSachThayTetMode3,
                        candidates = danhSachUuTienMode3
                    });
                }

                return Ok(new
                {
                    success = true,
                    //mode1 = new { currentAssignment = phanCongHienTaiMode1, replacementCandidates = danhSachThayTeMode1 },
                    //mode2 = danhSachGoiYTheoDichVu,
                    mode3 = danhSachGoiYTheoNgayLamViec
                });
            }
            catch (Exception ex)
            {
                // In ra lỗi Console nếu vẫn bị để bạn có thể xem tận gốc trên server
                Console.WriteLine($"[LOI API] GetDanhSachNguoiGiupViec: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }


        // =============================================
        // 5. XAC NHAN DON & DOI NGUOI SLOT
        // =============================================

        // POST /api/v1/staff/xac-nhan-don
        [HttpPost("xac-nhan-don")]
        public async Task<IActionResult> XacNhanDon([FromBody] XacNhanDonRequest request)
        {
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
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Đơn đang ở trạng thái '{currentStatus}', không thể xác nhận."
                    });
                }

                // Gán nhân viên xử lý
                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(maNhanVien))
                {
                    don.MaNhanVien = maNhanVien;
                }

                // Chỉ thêm lịch sử trạng thái, KHÔNG đổi người giúp việc
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

                return Ok(new { success = true, message = "Xác nhận đơn đặt thành công." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // POST /api/v1/staff/doi-nguoi-slot
        [HttpPost("doi-nguoi-slot")]
        public async Task<IActionResult> DoiNguoiSlot([FromBody] DoiNguoiSlotRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Tìm NgayLamViec cần đổi
                var ngayLamViec = await _context.NgayLamViecs
                    .Include(nlv => nlv.MaDonDatDichVuNavigation)
                    .FirstOrDefaultAsync(nlv => nlv.MaNgayLamViec == request.MaNgayLamViec);

                if (ngayLamViec == null)
                    return NotFound(new { success = false, message = "Không tìm thấy ngày làm việc." });

                // Kiểm tra người giúp việc tồn tại
                var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.MaNguoiGiupViec);

                if (nguoiGiupViec == null)
                    return NotFound(new { success = false, message = "Không tìm thấy người giúp việc." });
                if (!ngayLamViec.NgayLam.HasValue || !ngayLamViec.GioBatDau.HasValue)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Slot làm việc không hợp lệ."
                    });
                }

                var gioBatDau = ngayLamViec.GioBatDau.Value.ToTimeSpan();

                var gioKetThuc = ngayLamViec.GioKetThuc.HasValue
                    ? ngayLamViec.GioKetThuc.Value.ToTimeSpan()
                    : (
                        ngayLamViec.ThoiLuongThucHien.HasValue
                        ? gioBatDau.Add(TimeSpan.FromHours(ngayLamViec.ThoiLuongThucHien.Value))
                        : gioBatDau.Add(TimeSpan.FromHours(2))
                    );
                var cacCaCuaNguoiNay = await _context.NgayLamViecs
                    .Where(nlv =>
                        nlv.MaNguoiGiupViec == request.MaNguoiGiupViec
                        && nlv.MaNgayLamViec != request.MaNgayLamViec
                        && nlv.NgayLam == ngayLamViec.NgayLam
                        && nlv.GioBatDau != null
                        && (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang thực hiện")
                    )
                    .ToListAsync();
                bool biTrungLich = cacCaCuaNguoiNay.Any(nlv =>
                {
                    var existingStart = nlv.GioBatDau.Value.ToTimeSpan();
                    var existingEnd = nlv.GioKetThuc.HasValue
                        ? nlv.GioKetThuc.Value.ToTimeSpan()
                        : existingStart.Add(TimeSpan.FromHours(nlv.ThoiLuongThucHien ?? 2));

                    return existingStart < gioKetThuc && existingEnd > gioBatDau;
                });

                if (biTrungLich)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Người giúp việc bị trùng lịch."
                    });
                }
                var maKyNangYeuCau = await _context.DonDatDichVus
                .Where(dv => dv.MaDonDatDichVu == ngayLamViec.MaDonDatDichVu)
                .Select(dv => dv.MaDichVuNavigation.MaKyNang)
                .FirstOrDefaultAsync();

                            if (!string.IsNullOrEmpty(maKyNangYeuCau))
                            {
                    bool coKyNang = await _context.HoSoNguoiGiupViecs
                        .Where(hs => hs.MaNguoiGiupViec == request.MaNguoiGiupViec)
                        .SelectMany(hs => hs.KyNangNguoiGiupViecs)
                        .AnyAsync(kn => kn.MaKyNang == maKyNangYeuCau);

                    if (!coKyNang)
                                {
                                    return BadRequest(new
                                    {
                                        success = false,
                                        message = "Người giúp việc không phù hợp kỹ năng yêu cầu."
                                    });
                                }
                            }
                // Update chỉ 1 row NgayLamViec
                ngayLamViec.MaNguoiGiupViec = request.MaNguoiGiupViec;
                ngayLamViec.TrangThai = "Đã phân công";
                ngayLamViec.ThoiGianPhanCong = DateTime.Now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đổi người giúp việc thành công.",
                    tenNguoiGiupViec = nguoiGiupViec.HoTen
                });
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

    // =============================================
    // DTOs cho Xác nhận đơn & Đổi người slot
    // =============================================

    public class XacNhanDonRequest
    {
        public string MaDon { get; set; } = null!;
    }

    public class DoiNguoiSlotRequest
    {
        public string MaNgayLamViec { get; set; } = null!;
        public string MaNguoiGiupViec { get; set; } = null!;
    }
    public class NguoiGiupViecOptionDto
    {
        public string maNguoiGiupViec { get; set; } = null!;
        public string hoTen { get; set; } = string.Empty;
        public string soDienThoai { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string anhChanDung { get; set; } = string.Empty;
        public List<string> danhSachKyNang { get; set; } = new();
        public List<ChiTietKyNangDto> chiTietKyNang { get; set; } = new();
        public int soLichDangCo { get; set; }
        public bool canReplace { get; set; }
    }

    public class ChiTietKyNangDto
    {
        public string maKyNang { get; set; } = null!;
        public string tenKyNang { get; set; } = string.Empty;
        public string kinhNghiem { get; set; } = string.Empty;
    }
}
