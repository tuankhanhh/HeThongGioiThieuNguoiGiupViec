using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request.Staff;
using MyWebApi.Models;

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
                            maNguoiGiupViec = nlv.MaNguoiGiupViec
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

                // Kiểm tra người giúp việc tồn tại
                var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.MaNguoiGiupViec);
                if (nguoiGiupViec == null)
                    return NotFound(new { success = false, message = "Không tìm thấy người giúp việc." });

                // Cập nhật MaNguoiGiupViec cho tất cả NgayLamViec của đơn
                foreach (var dv in don.DonDatDichVus)
                {
                    foreach (var nlv in dv.NgayLamViecs)
                    {
                        nlv.MaNguoiGiupViec = request.MaNguoiGiupViec;
                        nlv.TrangThai = "Đã phân công";
                        nlv.ThoiGianPhanCong = DateTime.Now;
                    }
                }

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
        // 6. DANH SACH NGUOI GIUP VIEC (de phan cong)
        // =============================================

        // GET /api/v1/staff/danh-sach-nguoi-giup-viec?maDon=DD001
        [HttpGet("danh-sach-nguoi-giup-viec")]
        public async Task<IActionResult> GetDanhSachNguoiGiupViec([FromQuery] string? maDon = null)
        {
            try
            {
                var requiredSkills = new HashSet<string>();
                var lichDon = new List<(DateOnly NgayLam, TimeSpan GioBatDau, TimeSpan GioKetThuc)>();

                if (!string.IsNullOrWhiteSpace(maDon))
                {
                    // ── Bước 1: Phân tích đơn đặt để tìm yêu cầu kỹ năng và khoảng thời gian ──
                    var donDat = await _context.DonDats
                        .Include(d => d.DonDatDichVus)
                            .ThenInclude(dv => dv.MaDichVuNavigation)
                                .ThenInclude(mdv => mdv.DichVuThanhPhans)
                                    .ThenInclude(dvtp => dvtp.MaThanhPhanNavigation)
                        .Include(d => d.DonDatDichVus)
                            .ThenInclude(dv => dv.NgayLamViecs)
                                .ThenInclude(nlv => nlv.DonDatDichVuNgayLamViecs)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(d => d.MaDon == maDon);

                    if (donDat != null)
                    {
                        // Lấy kỹ năng yêu cầu trực tiếp từ dịch vụ (DichVu)
                        var requiredSkillsList = donDat.DonDatDichVus
                            .Where(dv => dv.MaDichVuNavigation != null && !string.IsNullOrWhiteSpace(dv.MaDichVuNavigation.MaKyNang))
                            .Select(dv => dv.MaDichVuNavigation.MaKyNang!)
                            .Distinct()
                            .ToList();

                        foreach (var ks in requiredSkillsList)
                        {
                            requiredSkills.Add(ks);
                        }

                        // Lấy lịch đơn với khoảng thời gian
                        foreach (var dv in donDat.DonDatDichVus)
                        {
                            foreach (var nlv in dv.NgayLamViecs)
                            {
                                if (nlv.NgayLam.HasValue && nlv.GioBatDau.HasValue)
                                {
                                    int duration = nlv.DonDatDichVuNgayLamViecs.FirstOrDefault()?.ThoiGianThucHien ?? 4;
                                    var start = nlv.GioBatDau.Value.ToTimeSpan();
                                    var end = start.Add(TimeSpan.FromMinutes(duration));
                                    lichDon.Add((nlv.NgayLam.Value, start, end));
                                }
                            }
                        }
                    }
                }

                // ── Bước 2: Lấy tất cả người giúp việc hợp lệ ──
                var hoSoDaDuyet = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                        .ThenInclude(nd => nd.NguoiDungVaiTros)
                            .ThenInclude(nv => nv.MaVaiTroNavigation)
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .AsNoTracking()
                    .ToListAsync();

                // ── Bước 3: Lấy tất cả NgayLamViec đang hoạt động để tính trùng lịch và mức độ rảnh ──
                var tatCaNgayLamViec = await _context.NgayLamViecs
                    .Include(nlv => nlv.DonDatDichVuNgayLamViecs)
                    .Where(nlv => nlv.MaNguoiGiupViec != null
                                  && nlv.NgayLam.HasValue
                                  && nlv.GioBatDau.HasValue
                                  && nlv.TrangThai != "Đã hủy")
                    .AsNoTracking()
                    .ToListAsync();

                HashSet<string> biBanLich = new();
                Dictionary<string, int> soLichDangCo = new();

                foreach (var nlv in tatCaNgayLamViec)
                {
                    if (string.IsNullOrEmpty(nlv.MaNguoiGiupViec)) continue;

                    if (!soLichDangCo.ContainsKey(nlv.MaNguoiGiupViec))
                        soLichDangCo[nlv.MaNguoiGiupViec] = 0;
                    soLichDangCo[nlv.MaNguoiGiupViec]++;

                    if (lichDon.Count > 0 && !biBanLich.Contains(nlv.MaNguoiGiupViec))
                    {
                        int duration = nlv.DonDatDichVuNgayLamViecs.FirstOrDefault()?.ThoiGianThucHien ?? 4;
                        var maidStart = nlv.GioBatDau.Value.ToTimeSpan();
                        var maidEnd = maidStart.Add(TimeSpan.FromHours(duration));

                        foreach (var ld in lichDon)
                        {
                            if (ld.NgayLam == nlv.NgayLam.Value)
                            {
                                // Kiem tra overlap thoi gian: start1 < end2 && start2 < end1
                                if (maidStart < ld.GioKetThuc && ld.GioBatDau < maidEnd)
                                {
                                    biBanLich.Add(nlv.MaNguoiGiupViec);
                                    break;
                                }
                            }
                        }
                    }
                }

                // ── Bước 4: Tổng hợp kết quả ──
                var danhSachPhuHop = hoSoDaDuyet
                    .Where(hs =>
                    {
                        // Kiểm tra vai trò Người giúp việc
                        bool coVaiTro = hs.MaNguoiGiupViecNavigation.NguoiDungVaiTros
                            .Any(nv => nv.MaVaiTroNavigation.TenVaiTro == "Maid");

                        // Không được trùng lịch
                        bool khongTrungLich = !biBanLich.Contains(hs.MaNguoiGiupViec);

                        // Phải có tất cả kỹ năng yêu cầu của dịch vụ
                        var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList();
                        bool coKyNangPhuHop = requiredSkills.Count == 0 || requiredSkills.All(rs => maidSkills.Contains(rs));

                        return coVaiTro && khongTrungLich && coKyNangPhuHop;
                    })
                    .Select(hs =>
                    {
                        var maidSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList();
                        int soKyNangPhuHop = requiredSkills.Count(rs => maidSkills.Contains(rs));
                        int soLich = soLichDangCo.ContainsKey(hs.MaNguoiGiupViec) ? soLichDangCo[hs.MaNguoiGiupViec] : 0;

                        return new
                        {
                            maNguoiGiupViec = hs.MaNguoiGiupViec,
                            hoTen = hs.MaNguoiGiupViecNavigation.HoTen,
                            soDienThoai = hs.MaNguoiGiupViecNavigation.SoDienThoai,
                            email = hs.MaNguoiGiupViecNavigation.Email,
                            diaChi = hs.MaNguoiGiupViecNavigation.DiaChi,
                            danhSachKyNang = maidSkills,
                            soKyNangPhuHop = soKyNangPhuHop,
                            soLichDangCo = soLich
                        };
                    })
                    .OrderByDescending(x => x.soKyNangPhuHop) // giảm dần kỹ năng
                    .ThenBy(x => x.soLichDangCo)            // tăng dần mức độ bận rộn (rảnh rỗi ưu tiên)
                    .ThenBy(x => x.maNguoiGiupViec)         // ổn định thứ tự
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = danhSachPhuHop
                });
            }
            catch (Exception ex)
            {
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