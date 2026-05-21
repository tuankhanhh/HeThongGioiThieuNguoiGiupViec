using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO.Request.KhieuNai;
using MyWebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MyWebApi.Extensions;

namespace MyWebApi.Controllers
{
    [Route("api/v1/khieu-nai")]
    [ApiController]
    public class KhieuNaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KhieuNaiController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("allofCus")]
        public async Task<IActionResult> GetComplaintHistory()
        {
            // Lấy ID Khách hàng từ Token
            var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin định danh." });
            }

            // Truy vấn bảng KhieuNai
            var rawComplaints = await _context.KhieuNais
                .Include(k => k.MaDonNavigation) // Lấy thông tin đơn đặt liên quan
                .Where(k => k.MaKhachHang == customerId)
                .OrderByDescending(k => k.ThoiGian) // Mới nhất lên đầu
                .ToListAsync();

            var mappedComplaints = rawComplaints.Select(k => new ComplaintDto
            {
                MaKhieuNai = k.MaKhieuNai,
                MaDon = k.MaDon,
                // Giả sử bảng KhieuNai của bạn có trường NoiDung và PhanHoi (nếu chưa có bạn cần tự map trường tương ứng)
                NoiDung = k.GetType().GetProperty("NoiDung")?.GetValue(k, null)?.ToString() ?? "Không có nội dung",
                PhanHoi = k.GetType().GetProperty("PhanHoi")?.GetValue(k, null)?.ToString() ?? "",
                ThoiGian = k.ThoiGian?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                TrangThai = k.TrangThai ?? "Chờ xử lý"
            }).ToList();

            return Ok(mappedComplaints);
        }

        // GET /api/v1/khieu-nai/danh-sach
        [HttpGet("danh-sach")]
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

        // GET /api/v1/khieu-nai/chi-tiet/{id}
        [HttpGet("chi-tiet/{id}")]
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
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy khiếu nại."
                    });
                }

                // Danh sách hồ sơ đã duyệt
                var danhSachHoSoDaDuyet = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
                    .Include(hs => hs.MaNguoiGiupViecNavigation)
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                        .ThenInclude(kn => kn.MaKyNangNavigation)
                    .AsNoTracking()
                    .ToListAsync();

                // Danh sách ca làm việc bị ảnh hưởng
                var caLamViecLoi = _context.NgayLamViecs
                    .Include(n => n.MaDonDatDichVuNavigation)
                        .ThenInclude(dv => dv.MaDichVuNavigation)
                    .Include(n => n.MaNguoiGiupViecNavigation)
                    .Where(n =>
                        n.MaDonDatDichVuNavigation != null &&
                        n.MaDonDatDichVuNavigation.MaDon == kn.MaDon &&
                        //n.TrangThai != "Hoàn thành" &&
                        //n.TrangThai != "Hủy lịch")
                        n.TrangThai == "Không đến làm")
                    .AsEnumerable()
                    .Select(nlv =>
                    {
                        var maNguoiDangLam = nlv.MaNguoiGiupViec;

                        // Gợi ý người mới (tạm thời lấy người đầu tiên phù hợp,
                        // khác người hiện tại)
                        var nguoiDeXuat = danhSachHoSoDaDuyet
                            .FirstOrDefault(hs =>
                                hs.MaNguoiGiupViec != maNguoiDangLam
                            );

                        return new
                        {
                            maNgayLamViec = nlv.MaNgayLamViec,

                            tenDichVu =
                                nlv.MaDonDatDichVuNavigation?.MaDichVuNavigation != null
                                ? nlv.MaDonDatDichVuNavigation.MaDichVuNavigation.TenDichVu
                                : "Không xác định",

                            ngayLam = nlv.NgayLam,

                            gioBatDau = nlv.GioBatDau,

                            gioKetThuc = nlv.GioKetThuc ??
                                (nlv.GioBatDau.HasValue
                                    ? TimeOnly.FromTimeSpan(
                                        nlv.GioBatDau.Value.ToTimeSpan()
                                        .Add(TimeSpan.FromHours(nlv.ThoiLuongThucHien ?? 2)))
                                    : null),

                            maNguoiGiupViec = nlv.MaNguoiGiupViec,

                            tenNguoiGiupViec =
                                nlv.MaNguoiGiupViecNavigation != null
                                ? nlv.MaNguoiGiupViecNavigation.HoTen
                                : null,

                            trangThai = nlv.TrangThai,

                            nguoiDeXuat = nguoiDeXuat == null
                                ? null
                                : new
                                {
                                    maNguoiGiupViec = nguoiDeXuat.MaNguoiGiupViec,

                                    hoTen = nguoiDeXuat.MaNguoiGiupViecNavigation != null
                                        ? nguoiDeXuat.MaNguoiGiupViecNavigation.HoTen
                                        : null,

                                    kyNangs = nguoiDeXuat.KyNangNguoiGiupViecs
                                        .Select(kn => new
                                        {
                                            maKyNang = kn.MaKyNang,
                                            tenKyNang = kn.MaKyNangNavigation != null
                                                ? kn.MaKyNangNavigation.TenKyNang
                                                : null,
                                            kinhNghiem = kn.KinhNghiem
                                        })
                                        .ToList()
                                }
                        };
                    })
                    .ToList();

                var result = new
                {
                    maKhieuNai = kn.MaKhieuNai,
                    maDon = kn.MaDon,
                    noiDung = kn.NoiDung,
                    thoiGian = kn.ThoiGian,
                    trangThai = kn.TrangThai,
                    phanHoi = kn.PhanHoi,

                    maKhachHang = kn.MaKhachHang,
                    hoTenKhachHang = kn.MaKhachHangNavigation?.HoTen,
                    emailKhachHang = kn.MaKhachHangNavigation?.Email,
                    sdtKhachHang = kn.MaKhachHangNavigation?.SoDienThoai,

                    maNhanVien = kn.MaNhanVien,
                    hoTenNhanVien =
                        kn.MaNhanVienNavigation != null
                        ? kn.MaNhanVienNavigation.HoTen
                        : null,

                    thongTinDon = new
                    {
                        ngayDat = kn.MaDonNavigation?.NgayDat,
                        tongTien = kn.MaDonNavigation?.TongTien,
                        diaChi = kn.MaDonNavigation?.DiaChi,

                        trangThaiHienTai = kn.MaDonNavigation?
                            .LichSuTrangThaiDons
                            .OrderByDescending(l => l.ThoiGianCapNhat)
                            .FirstOrDefault()?.TrangThai
                    },

                    caLamViecLoi = caLamViecLoi
                };

                return Ok(new
                {
                    success = true,
                    data = result
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

        // POST /api/v1/khieu-nai/tu-dong-phan-cong-lai
        [HttpPost("tu-dong-phan-cong-lai")]
        public async Task<IActionResult> TuDongPhanCongLai([FromBody] YeuCauTaiPhanCongDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var kn = await _context.KhieuNais
                .Include(k => k.MaDonNavigation)
                    .ThenInclude(d => d.DonDatDichVus)
                        .ThenInclude(dv => dv.MaDichVuNavigation)
                .FirstOrDefaultAsync(k => k.MaKhieuNai == request.maKhieuNai);
                if (kn == null) return NotFound("Không tìm thấy khiếu nại.");

                var donDat = kn.MaDonNavigation;
                var ngayLamViecs = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                .Where(n =>
                    n.MaDonDatDichVuNavigation != null &&
                    n.MaDonDatDichVuNavigation.MaDon == kn.MaDon &&
                    //n.TrangThai != "Hoàn thành" &&
                    //n.TrangThai != "Hủy lịch")
                    n.TrangThai == "Không đến làm")
                .ToListAsync();
                Console.WriteLine($"DEBUG: Tìm thấy {ngayLamViecs.Count} ca làm việc cho đơn {kn.MaDon}");
                if (!ngayLamViecs.Any())
                    return BadRequest(new { success = false, message = "Không có ca làm việc nào có thể lùi lịch." });

                // Lấy danh sách hồ sơ và lịch rảnh
                var danhSachHoSoDaDuyet = await _context.HoSoNguoiGiupViecs
                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .AsNoTracking()
                    .ToListAsync();

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

                var danhSachCaLamViecDaNhan = await _context.NgayLamViecs
                    .Where(nlv => nlv.MaNguoiGiupViec != null
                                  && nlv.NgayLam.HasValue
                                  && nlv.GioBatDau.HasValue
                                  && (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang làm việc"))
                    .AsNoTracking()
                    .ToListAsync();
                var danhSachNguoiHienTai = await _context.NgayLamViecs
                    .Where(n => n.MaNguoiGiupViec != null
                             && _context.DonDatDichVus.Any(dv =>
                                 dv.MaDonDatDichVu == n.MaDonDatDichVu &&
                                 dv.MaDon == kn.MaDon))
                    .Select(n => n.MaNguoiGiupViec!)
                    .Distinct()
                    .ToListAsync();

                bool CoLichRanhBaoPhu(string maNguoiGiupViec, DateOnly ngay, TimeSpan batDau, TimeSpan ketThuc)
                {
                    if (!helperShiftsMap.ContainsKey(maNguoiGiupViec)) return false;
                    var shiftsOfMaid = helperShiftsMap[maNguoiGiupViec];
                    if (!shiftsOfMaid.ContainsKey(ngay)) return false;

                    var caRanhTho = shiftsOfMaid[ngay];
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

                    return danhSachCaRanhDaGop.Any(caRanh =>
                        caRanh.Start <= batDau && caRanh.End >= ketThuc);
                }

                int thanhCongCount = 0;
                int thatBaiCount = 0;

                foreach (var nlv in ngayLamViecs)
                {
                    if (!nlv.GioBatDau.HasValue || !nlv.NgayLam.HasValue) continue;

                    var oldBatDau = nlv.GioBatDau.Value.ToTimeSpan();
                    var thoiLuong = nlv.ThoiLuongThucHien ?? 2;
                    var oldKetThuc = nlv.GioKetThuc.HasValue ? nlv.GioKetThuc.Value.ToTimeSpan() : oldBatDau.Add(TimeSpan.FromHours(thoiLuong));

                    var newBatDau = oldBatDau.Add(TimeSpan.FromMinutes(request.thoiGianLuiPhut));
                    var newKetThuc = oldKetThuc.Add(TimeSpan.FromMinutes(request.thoiGianLuiPhut));

                    // Check day rollover logic (simplified)
                    if (newBatDau.Days > 0 || newKetThuc.Days > 0)
                    {
                        // Exceeds 24 hours, need to add to day, but for now just fallback
                        thatBaiCount++;
                        nlv.TrangThai = "Chờ phân công";
                        nlv.MaNguoiGiupViec = null;
                        nlv.GioBatDau = TimeOnly.FromTimeSpan(newBatDau.Subtract(TimeSpan.FromDays(newBatDau.Days)));
                        nlv.GioKetThuc = TimeOnly.FromTimeSpan(newKetThuc.Subtract(TimeSpan.FromDays(newKetThuc.Days)));
                        continue;
                    }
                    if (donDat == null)
                        return BadRequest(new { success = false, message = "Không tìm thấy đơn đặt dịch vụ của khiếu nại." });

                    if (donDat.DonDatDichVus == null)
                        return BadRequest(new { success = false, message = "DonDatDichVus bị null." });
                    var dv = donDat.DonDatDichVus.FirstOrDefault(d => d.MaDonDatDichVu == nlv.MaDonDatDichVu);
                    var maKyNangYeuCau = dv?.MaDichVuNavigation?.MaKyNang;

                    var danhSachBanLichNgay = new HashSet<string>();
                    foreach (var caDaNhan in danhSachCaLamViecDaNhan)
                    {
                        var maNguoiGiupViecDaNhan = caDaNhan.MaNguoiGiupViec!;
                        if (caDaNhan.MaNgayLamViec == nlv.MaNgayLamViec || danhSachBanLichNgay.Contains(maNguoiGiupViecDaNhan) || !caDaNhan.GioBatDau.HasValue) continue;

                        var existingStart = caDaNhan.GioBatDau.Value.ToTimeSpan();
                        var existingEnd = caDaNhan.GioKetThuc.HasValue ? caDaNhan.GioKetThuc.Value.ToTimeSpan() : existingStart.Add(TimeSpan.FromHours(caDaNhan.ThoiLuongThucHien ?? 2));

                        if (nlv.NgayLam.Value == caDaNhan.NgayLam!.Value && existingStart < newKetThuc && existingEnd > newBatDau)
                            danhSachBanLichNgay.Add(maNguoiGiupViecDaNhan);
                    }
                    // Ưu tiên người đã chọn thủ công
                    var phanCongThuCong = request.danhSachPhanCongThuCong?
                        .FirstOrDefault(p => p.maNgayLamViec == nlv.MaNgayLamViec);
                    if (phanCongThuCong != null)
                    {
                        nlv.MaNguoiGiupViec = phanCongThuCong.maNguoiGiupViec;
                        nlv.TrangThai = "Đã phân công";
                        nlv.ThoiGianPhanCong = DateTime.Now;
                        thanhCongCount++;
                        continue;
                    }

                    var nguoiMoi = danhSachHoSoDaDuyet.FirstOrDefault(hs =>
                    {
                        if (danhSachNguoiHienTai.Contains(hs.MaNguoiGiupViec)) return false;
                        if (danhSachBanLichNgay.Contains(hs.MaNguoiGiupViec)) return false;
                        if (maKyNangYeuCau != null &&
                        (hs.KyNangNguoiGiupViecs == null || !hs.KyNangNguoiGiupViecs.Any(k => k.MaKyNang == maKyNangYeuCau)))
                            return false;
                        return CoLichRanhBaoPhu(hs.MaNguoiGiupViec, nlv.NgayLam.Value, newBatDau, newKetThuc);
                    });

                    nlv.GioBatDau = TimeOnly.FromTimeSpan(newBatDau);
                    nlv.GioKetThuc = TimeOnly.FromTimeSpan(newKetThuc);

                    if (nguoiMoi != null)
                    {
                        nlv.MaNguoiGiupViec = nguoiMoi.MaNguoiGiupViec;
                        nlv.TrangThai = "Đã phân công";
                        nlv.ThoiGianPhanCong = DateTime.Now;
                        thanhCongCount++;
                    }
                    else
                    {
                        nlv.MaNguoiGiupViec = null;
                        nlv.TrangThai = "Chờ phân công";
                        thatBaiCount++;
                    }
                }

                // Cập nhật khiếu nại
                kn.TrangThai = "Đã xử lý";
                kn.PhanHoi = $"Đã lùi lịch {request.thoiGianLuiPhut} phút và tìm lại người. (Thành công: {thanhCongCount}, Thất bại: {thatBaiCount})";

                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(maNhanVien))
                {
                    kn.MaNhanVien = maNhanVien;
                }

                string maLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS");
                Console.WriteLine($"KhieuNai: {kn.MaKhieuNai}, TrangThai: {kn.TrangThai}");
                Console.WriteLine($"MaNhanVien: {kn.MaNhanVien}");
                Console.WriteLine($"PhanHoi: {kn.PhanHoi}");
                Console.WriteLine($"MaDon: {kn.MaDon}");
                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = kn.MaDon,
                    TrangThai = "Đã xác nhận",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);
                Console.WriteLine($"LichSu => MaLichSu: {lichSu.MaLichSu}, MaDon: {lichSu.MaDon}");

                foreach (var entry in _context.ChangeTracker.Entries())
                {
                    Console.WriteLine($"👉 Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Tự động phân công lại hoàn tất.", thanhCong = thanhCongCount, thatBai = thatBaiCount });
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                //return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
                await transaction.RollbackAsync();

                Console.WriteLine("🔥 ERROR: " + ex.Message);

                if (ex.InnerException != null)
                {
                    Console.WriteLine("🔥 INNER: " + ex.InnerException.Message);
                }

                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống.",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        // POST /api/v1/khieu-nai/doi-nguoi-thu-cong
        [HttpPost("doi-nguoi-thu-cong")]
        public async Task<IActionResult> DoiNguoiThuCong([FromBody] YeuCauDoiNguoiThuCongDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var kn = await _context.KhieuNais.FirstOrDefaultAsync(k => k.MaKhieuNai == request.maKhieuNai);
                if (kn == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khiếu nại." });

                var ngayLamViec = await _context.NgayLamViecs
                    .Include(nlv => nlv.MaDonDatDichVuNavigation)
                    .FirstOrDefaultAsync(nlv => nlv.MaNgayLamViec == request.maNgayLamViec);

                if (ngayLamViec == null)
                    return NotFound(new { success = false, message = "Không tìm thấy ca làm việc." });

                var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.maNguoiGiupViecMoi);
                if (nguoiGiupViec == null)
                    return NotFound(new { success = false, message = "Không tìm thấy người giúp việc mới." });

                if (!ngayLamViec.NgayLam.HasValue || !ngayLamViec.GioBatDau.HasValue)
                    return BadRequest(new { success = false, message = "Slot làm việc không hợp lệ." });

                var gioBatDau = ngayLamViec.GioBatDau.Value.ToTimeSpan();
                var gioKetThuc = ngayLamViec.GioKetThuc.HasValue
                    ? ngayLamViec.GioKetThuc.Value.ToTimeSpan()
                    : gioBatDau.Add(TimeSpan.FromHours(ngayLamViec.ThoiLuongThucHien ?? 2));

                var cacCaCuaNguoiNay = await _context.NgayLamViecs
                    .Where(nlv =>
                        nlv.MaNguoiGiupViec == request.maNguoiGiupViecMoi
                        && nlv.MaNgayLamViec != request.maNgayLamViec
                        && nlv.NgayLam == ngayLamViec.NgayLam
                        && nlv.GioBatDau != null
                        && (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang làm việc")
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
                    return BadRequest(new { success = false, message = "Người giúp việc bị trùng lịch." });
                var danhSachNguoiHienTai = await _context.NgayLamViecs
                    .Where(n => n.MaNguoiGiupViec != null
                             && _context.DonDatDichVus.Any(dv =>
                                 dv.MaDonDatDichVu == n.MaDonDatDichVu &&
                                 dv.MaDon == kn.MaDon))
                    .Select(n => n.MaNguoiGiupViec!)
                    .Distinct()
                    .ToListAsync();

                if (danhSachNguoiHienTai.Contains(request.maNguoiGiupViecMoi))
                    return BadRequest(new { success = false, message = "Không thể chỉ định lại người đang làm cho đơn bị khiếu nại." });

                var maKyNangYeuCau = await _context.DonDatDichVus
                    .Where(dv => dv.MaDonDatDichVu == ngayLamViec.MaDonDatDichVu)
                    .Select(dv => dv.MaDichVuNavigation.MaKyNang)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(maKyNangYeuCau))
                {
                    bool coKyNang = await _context.HoSoNguoiGiupViecs
                        .Where(hs => hs.MaNguoiGiupViec == request.maNguoiGiupViecMoi)
                        .SelectMany(hs => hs.KyNangNguoiGiupViecs)
                        .AnyAsync(kn => kn.MaKyNang == maKyNangYeuCau);

                    if (!coKyNang)
                        return BadRequest(new { success = false, message = "Người giúp việc không phù hợp kỹ năng yêu cầu." });
                }

                ngayLamViec.MaNguoiGiupViec = request.maNguoiGiupViecMoi;
                ngayLamViec.TrangThai = "Đã phân công";
                ngayLamViec.ThoiGianPhanCong = DateTime.Now;

                kn.TrangThai = "Đã xử lý";
                kn.PhanHoi = $"Đã đổi người giúp việc thành công. Người mới: {nguoiGiupViec.HoTen}";

                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"User Claim MaNhanVien: {maNhanVien}");
                if (!string.IsNullOrEmpty(maNhanVien))
                    kn.MaNhanVien = maNhanVien;

                string maLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS");
                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = kn.MaDon,
                    TrangThai = "Đã xác nhận",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);
                Console.WriteLine("=== DEBUG BEFORE SAVE ===");

                foreach (var entry in _context.ChangeTracker.Entries())
                {
                    Console.WriteLine($"👉 Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                }
                Console.WriteLine("=== DEBUG BEFORE SAVE ===");

                foreach (var entry in _context.ChangeTracker.Entries())
                {
                    Console.WriteLine($"👉 Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Đổi người giúp việc thủ công thành công.", tenNguoiGiupViec = nguoiGiupViec.HoTen });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

        // POST /api/v1/khieu-nai/huy-don-su-co
        [HttpPost("huy-don-su-co")]
        public async Task<IActionResult> HuyDonSuCo([FromBody] YeuCauHuyDonDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var kn = await _context.KhieuNais
                    .Include(k => k.MaDonNavigation)
                        .ThenInclude(d => d.DonDatDichVus)
                            .ThenInclude(dv => dv.NgayLamViecs)
                    .FirstOrDefaultAsync(k => k.MaKhieuNai == request.maKhieuNai);

                if (kn == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khiếu nại." });

                var donDat = kn.MaDonNavigation;

                // Đổi trạng thái khiếu nại
                kn.TrangThai = "Đã xử lý";
                kn.PhanHoi = $"Đã hủy đơn. Lý do: {request.noiDungPhanHoi}";
                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"User Claim MaNhanVien: {maNhanVien}");
                if (!string.IsNullOrEmpty(maNhanVien))
                    kn.MaNhanVien = maNhanVien;

                // Thêm lịch sử trạng thái hủy đơn
                string maLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS");
                var lichSu = new LichSuTrangThaiDon
                {
                    MaLichSu = maLichSu,
                    MaDon = kn.MaDon,
                    TrangThai = "Hủy đơn",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSu);

                donDat.GhiChu = string.IsNullOrEmpty(donDat.GhiChu) ? $"Lý do hủy (Sự cố): {request.noiDungPhanHoi}" : $"{donDat.GhiChu}\nLý do hủy (Sự cố): {request.noiDungPhanHoi}";

                // Hủy các ca làm việc chưa hoàn thành
                var ngayLamViecs = donDat.DonDatDichVus.SelectMany(dv => dv.NgayLamViecs).Where(n => n.TrangThai != "Hoàn thành");
                foreach (var nlv in ngayLamViecs)
                {
                    nlv.TrangThai = "Hủy lịch";
                }
                Console.WriteLine("=== DEBUG BEFORE SAVE ===");

                foreach (var entry in _context.ChangeTracker.Entries())
                {
                    Console.WriteLine($"👉 Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Đã hủy đơn hàng và các ca làm việc." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }
        // POST /api/v1/khieu-nai/dang-xu-ly/{id}
        [HttpPost("dang-xu-ly/{id}")]
        public async Task<IActionResult> ChuyenTrangThaiDangXuLy(string id)
        {
            try
            {
                var kn = await _context.KhieuNais.FirstOrDefaultAsync(k => k.MaKhieuNai == id);
                if (kn == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khiếu nại." });

                if (kn.TrangThai == "Đã xử lý")
                    return BadRequest(new { success = false, message = "Khiếu nại này đã được xử lý xong." });

                kn.TrangThai = "Đang xử lý";

                // Cập nhật người đang giải quyết nếu có
                var maNhanVien = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(maNhanVien))
                {
                    kn.MaNhanVien = maNhanVien;
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã chuyển trạng thái khiếu nại sang Đang xử lý." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống.", detail = ex.Message });
            }
        }

    }
    public class ComplaintDto
    {
        public string MaKhieuNai { get; set; } = null!;
        public string MaDon { get; set; } = null!;
        public string NoiDung { get; set; } = null!;
        public string PhanHoi { get; set; } = null!;
        public string ThoiGian { get; set; } = null!;
        public string TrangThai { get; set; } = null!;
    }
}

