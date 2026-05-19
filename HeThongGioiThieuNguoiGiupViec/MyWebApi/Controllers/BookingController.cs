using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;
using MyWebApi.Extensions;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Đổi thành DbContext thực tế của bạn

        public BookingController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpPost("Create")]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto request)
        {
            if (request == null || request.ChiTietNgayLamViec == null || !request.ChiTietNgayLamViec.Any())
            {
                return BadRequest(new { message = "Dữ liệu đặt lịch không hợp lệ hoặc bị trống." });
            }

            DateTime now = DateTime.Now;
            foreach (var day in request.ChiTietNgayLamViec)
            {
                if (!TimeOnly.TryParse(day.GioBatDau, out TimeOnly parsedTime))
                    return BadRequest(new { message = $"Định dạng giờ '{day.GioBatDau}' không hợp lệ." });

                if (day.NgayThucHien.Date == now.Date)
                {
                    DateTime scheduledDateTime = day.NgayThucHien.Date.Add(parsedTime.ToTimeSpan());
                    DateTime minAllowedTime = now.AddHours(1);

                    if (scheduledDateTime < minAllowedTime)
                    {
                        return BadRequest(new { success = false, message = $"Nếu đặt lịch trong ngày hôm nay, vui lòng chọn giờ bắt đầu từ {minAllowedTime:HH:mm} trở đi." });
                    }
                }
            }
            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                // =========================================================
                // BƯỚC 1: TẠO ĐƠN ĐẶT & LỊCH SỬ (Lưu cuốn chiếu để cập nhật mã)
                // =========================================================
                string maDonMoi = await _context.GenerateIdAsync("DonDat", "MaDon", "DD");

                var donDat = new DonDat
                {
                    MaDon = maDonMoi,
                    MaKhachhang = request.MaKhachHang,
                    DiaChi = request.DiaChiThucHien,
                    GhiChu = request.GhiChu,
                    SoNgay = request.ChiTietNgayLamViec.Count,
                    TongTien = request.TongTien,
                    NgayDat = DateTime.Now
                };
                _context.DonDats.Add(donDat);
                await _context.SaveChangesAsync(); // LƯU NGAY: Để DB ghi nhận mã DD mới nhất

                var thanhToan = new ThanhToan
                {
                    MaThanhToan = await _context.GenerateIdAsync("ThanhToan", "MaThanhToan", "TT"),
                    MaDon = donDat.MaDon,
                    TrangThaiThanhToan = "Đã thanh toán"
                };
                _context.ThanhToans.Add(thanhToan);
                await _context.SaveChangesAsync(); // LƯU NGAY

                var lichSuTrangThai = new LichSuTrangThaiDon
                {
                    MaLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS"),
                    MaDon = donDat.MaDon,
                    TrangThai = "Chờ xác nhận",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);
                await _context.SaveChangesAsync(); // LƯU NGAY

                var processedServices = new Dictionary<string, string>();

                // =========================================================
                // BƯỚC 2: XỬ LÝ LỊCH LÀM VIỆC & THUẬT TOÁN AUTO-ASSIGN MỚI
                // =========================================================
                foreach (var day in request.ChiTietNgayLamViec)
                {
                    TimeOnly dayStartTime = TimeOnly.Parse(day.GioBatDau);
                    DateOnly targetDate = DateOnly.FromDateTime(day.NgayThucHien);

                    var rawShifts = await _context.LichRanhCaLamViecs
                        .Include(lrc => lrc.MaLichRanhNavigation)
                        .Include(lrc => lrc.MaCaLamViecNavigation)
                        .Where(lrc => lrc.MaLichRanhNavigation.Ngay == targetDate)
                        .ToListAsync();

                    var helperShiftsMap = rawShifts
                        .GroupBy(lrc => lrc.MaLichRanhNavigation.MaNguoiGiupViec)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(lrc => new
                            {
                                Start = lrc.MaCaLamViecNavigation.GioBatDau,
                                End = lrc.MaCaLamViecNavigation.GioKetThuc
                            }).ToList()
                        );

                    var potentialHelpers = helperShiftsMap.Keys.ToList();

                    var trangThaiBan = new List<string> {
    "Đã phân công", "Đã xác nhận", "Đang làm việc",
    "Đang thực hiện", "Chờ phân công", "Chờ xác nhận"
};

                    var jobsInDay = await _context.NgayLamViecs
                        .Where(nlv => nlv.NgayLam == targetDate && trangThaiBan.Contains(nlv.TrangThai))
                        .Select(nlv => new { nlv.MaNguoiGiupViec, nlv.GioBatDau, nlv.GioKetThuc })
                        .ToListAsync();

                    var hoSoRanh = await _context.HoSoNguoiGiupViecs
                                            .Include(hs => hs.KyNangNguoiGiupViecs)
                        .Where(hs => potentialHelpers.Contains(hs.MaNguoiGiupViec))
                        .ToListAsync();
                    var freeHelpersSkillsMap = hoSoRanh.ToDictionary(hs => hs.MaNguoiGiupViec, hs => hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList());

                    var requiredServiceIds = day.DichVus.Select(d => d.MaDichVu).ToList();
                    var dichVusYeuCau = await _context.DichVus.Where(dv => requiredServiceIds.Contains(dv.MaDichVu)).ToListAsync();
                    var serviceSkillMap = dichVusYeuCau.ToDictionary(dv => dv.MaDichVu, dv => dv.MaKyNang);

                    var helperNextFreeTime = new Dictionary<string, TimeOnly>();
                    var serviceAssignments = new Dictionary<string, (string HelperId, TimeOnly Start, TimeOnly End)>();

                    foreach (var svc in day.DichVus)
                    {
                        string neededSkill = serviceSkillMap.ContainsKey(svc.MaDichVu) ? serviceSkillMap[svc.MaDichVu] : null;
                        string assignedHelperId = null;
                        TimeOnly plannedStartTime = dayStartTime;

                        // ƯU TIÊN 1
                        foreach (var helperId in helperNextFreeTime.Keys)
                        {
                            var skills = freeHelpersSkillsMap.ContainsKey(helperId) ? freeHelpersSkillsMap[helperId] : new List<string>();
                            if (string.IsNullOrEmpty(neededSkill) || skills.Contains(neededSkill))
                            {
                                TimeOnly possibleStartTime = helperNextFreeTime[helperId];
                                TimeOnly possibleEndTime = possibleStartTime.AddHours(svc.ThoiLuong);

                                bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helperId) &&
                                                               helperShiftsMap[helperId].Any(shift =>
                                                                   shift.Start <= possibleStartTime && shift.End >= possibleEndTime);

                                if (!isWithinRegisteredShift) continue;

                                bool isBusyWithOthers = jobsInDay.Any(j => j.MaNguoiGiupViec == helperId &&
                                                                           j.GioBatDau.HasValue && j.GioKetThuc.HasValue &&
                                                                           j.GioBatDau.Value < possibleEndTime &&
                                                                           j.GioKetThuc.Value > possibleStartTime);
                                if (!isBusyWithOthers)
                                {
                                    assignedHelperId = helperId;
                                    plannedStartTime = possibleStartTime;
                                    break;
                                }
                            }
                        }

                        // ƯU TIÊN 2
                        if (assignedHelperId == null)
                        {
                            foreach (var helper in freeHelpersSkillsMap)
                            {
                                if (helperNextFreeTime.ContainsKey(helper.Key)) continue;

                                if (string.IsNullOrEmpty(neededSkill) || helper.Value.Contains(neededSkill))
                                {
                                    TimeOnly possibleEndTime = dayStartTime.AddHours(svc.ThoiLuong);

                                    bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helper.Key) &&
                                                                   helperShiftsMap[helper.Key].Any(shift =>
                                                                       shift.Start <= dayStartTime && shift.End >= possibleEndTime);

                                    if (!isWithinRegisteredShift) continue;

                                    bool isBusyWithOthers = jobsInDay.Any(j => j.MaNguoiGiupViec == helper.Key &&
                                                                               j.GioBatDau.HasValue && j.GioKetThuc.HasValue &&
                                                                               j.GioBatDau.Value < possibleEndTime &&
                                                                               j.GioKetThuc.Value > dayStartTime);
                                    if (!isBusyWithOthers)
                                    {
                                        assignedHelperId = helper.Key;
                                        plannedStartTime = dayStartTime;
                                        break;
                                    }
                                }
                            }
                        }

                        if (assignedHelperId != null)
                        {
                            TimeOnly plannedEndTime = plannedStartTime.AddHours(svc.ThoiLuong);
                            serviceAssignments[svc.MaDichVu] = (assignedHelperId, plannedStartTime, plannedEndTime);
                            helperNextFreeTime[assignedHelperId] = plannedEndTime;
                        }
                    }

                    TimeOnly unassignedFallbackTime = dayStartTime;

                    foreach (var svc in day.DichVus)
                    {
                        string maDonDatDichVu;
                        if (!processedServices.ContainsKey(svc.MaDichVu))
                        {
                            maDonDatDichVu = await _context.GenerateIdAsync("DonDatDichVu", "MaDonDatDichVu", "DU");

                            _context.DonDatDichVus.Add(new DonDatDichVu { MaDonDatDichVu = maDonDatDichVu, MaDon = donDat.MaDon, MaDichVu = svc.MaDichVu });
                            await _context.SaveChangesAsync(); // LƯU NGAY: Để lượt lặp sau không bị trùng mã "DU"

                            processedServices[svc.MaDichVu] = maDonDatDichVu;
                        }
                        else
                        {
                            maDonDatDichVu = processedServices[svc.MaDichVu];
                        }

                        string finalHelperId = null;
                        TimeOnly gioBatDau;
                        TimeOnly gioKetThuc;

                        if (serviceAssignments.ContainsKey(svc.MaDichVu))
                        {
                            var assignment = serviceAssignments[svc.MaDichVu];
                            finalHelperId = assignment.HelperId;
                            gioBatDau = assignment.Start;
                            gioKetThuc = assignment.End;
                        }
                        else
                        {
                            gioBatDau = unassignedFallbackTime;
                            gioKetThuc = unassignedFallbackTime.AddHours(svc.ThoiLuong);
                            unassignedFallbackTime = gioKetThuc;
                        }

                        var ngayLamViec = new NgayLamViec
                        {
                            MaNgayLamViec = await _context.GenerateIdAsync("NgayLamViec", "MaNgayLamViec", "NL"),
                            MaDonDatDichVu = maDonDatDichVu,
                            MaNguoiGiupViec = finalHelperId,
                            NgayLam = targetDate,
                            GioBatDau = gioBatDau,
                            GioKetThuc = gioKetThuc,
                            ThoiLuongThucHien = svc.ThoiLuong,
                            ThoiGianPhanCong = finalHelperId != null ? DateTime.Now : null,
                            TrangThai = finalHelperId != null ? "Đã phân công" : "Chờ phân công"
                        };
                        _context.NgayLamViecs.Add(ngayLamViec);
                        await _context.SaveChangesAsync(); // LƯU NGAY: Để lượt lặp sau không bị trùng mã "NL"
                    }
                }

                // Đã lưu cuốn chiếu hết rồi nên không cần _context.SaveChangesAsync() ở đây nữa
                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    message = "Tạo đơn đặt thành công!",
                    maDon = donDat.MaDon
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi hệ thống khi lưu đơn hàng.",
                    detail = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        /// Lấy danh sách đơn đặt dịch vụ của khách hàng
        [HttpGet("GetBookingsByCustomer/{maKhachHang}")]
        public async Task<IActionResult> GetBookingsByCustomer(
            string maKhachHang,
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var customer = await _context.NguoiDungs.FindAsync(maKhachHang);
                if (customer == null)
                {
                    return NotFound(new { success = false, message = "Khách hàng không tồn tại." });
                }

                var query = _context.DonDats
                    .Where(d => d.MaKhachhang == maKhachHang)
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dd => dd.MaDichVuNavigation)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status) && status != "all")
                {
                    query = query.Where(d => d.LichSuTrangThaiDons
                        .OrderByDescending(l => l.ThoiGianCapNhat)
                        .FirstOrDefault()!.TrangThai == status);
                }

                query = query.OrderByDescending(d => d.NgayDat);

                var total = await query.CountAsync();

                var bookings = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(d => new
                    {
                        maDon = d.MaDon,
                        tenDichVu = d.DonDatDichVus.Any()
                            ? string.Join(" + ", d.DonDatDichVus.Select(dd => dd.MaDichVuNavigation.TenDichVu))
                            : "Chưa xác định dịch vụ",
                        ngayDat = d.NgayDat,
                        trangThai = d.LichSuTrangThaiDons
                            .OrderByDescending(l => l.ThoiGianCapNhat)
                            .Select(l => l.TrangThai)
                            .FirstOrDefault() ?? "Chờ xác nhận",
                        soTien = d.TongTien,
                        thanhTien = d.LichSuTrangThaiDons.OrderByDescending(l => l.ThoiGianCapNhat).FirstOrDefault()!.TrangThai == "Hủy đơn"
                            ? 0
                            : (d.LichSuTrangThaiDons.OrderByDescending(l => l.ThoiGianCapNhat).FirstOrDefault()!.TrangThai == "Chờ xác nhận"
                                ? (decimal?)null
                                : d.TongTien)
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = bookings,
                    pagination = new { page, pageSize, total, totalPages = (int)Math.Ceiling((double)total / pageSize) }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi", detail = ex.Message });
            }
        }

        /// Lấy chi tiết một đơn đặt dịch vụ
        [Authorize]
        [HttpGet("GetOrderDetail/{maDon}")]
        public async Task<IActionResult> GetOrderDetail(string maDon)
        {
            try
            {
                var maKhachHang = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(maKhachHang))
                {
                    return Unauthorized(new { success = false, message = "Vui lòng đăng nhập." });
                }

                var order = await _context.DonDats
                    .Where(d => d.MaDon == maDon && d.MaKhachhang == maKhachHang)
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dd => dd.MaDichVuNavigation)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dd => dd.NgayLamViecs)
                            .ThenInclude(nl => nl.MaNguoiGiupViecNavigation)
                    // THÊM INCLUDE: Lấy thêm bảng Thu Nhập liên kết với Ngày Làm Việc
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dd => dd.NgayLamViecs)
                            .ThenInclude(nl => nl.ThuNhapNguoiGiupViecs)
                    .Include(d => d.DanhGia)
                    .Include(d => d.ThanhToans)
                    .FirstOrDefaultAsync();

                if (order == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt hoặc bạn không có quyền." });
                }

                var currentStatus = order.LichSuTrangThaiDons
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .Select(l => l.TrangThai)
                    .FirstOrDefault() ?? "Chờ xác nhận";

                var statusTimes = order.LichSuTrangThaiDons
                    .Where(l => l.TrangThai != null && l.ThoiGianCapNhat != null)
                    .GroupBy(l => l.TrangThai)
                    .ToDictionary(
                        g => g.Key!,
                        g => g.OrderByDescending(x => x.ThoiGianCapNhat).First().ThoiGianCapNhat!.Value.ToString("HH:mm dd-MM-yyyy")
                    );

                var lichSuTrangThai = order.LichSuTrangThaiDons
                    .Where(l => l.ThoiGianCapNhat != null && !string.IsNullOrEmpty(l.TrangThai))
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .Select(l => new
                    {
                        trangThai = l.TrangThai,
                        thoiGian = l.ThoiGianCapNhat!.Value.ToString("HH:mm dd/MM/yyyy")
                    })
                    .ToList();

                var thanhToanDb = order.ThanhToans.FirstOrDefault();
                var danhGiaDb = order.DanhGia.FirstOrDefault();

                var ngayLamViecsGrouped = order.DonDatDichVus
                    .SelectMany(dd => dd.NgayLamViecs.Select(nl => new { NgayLamViec = nl, DonDatDichVu = dd }))
                    .Select(x =>
                    {
                        var nl = x.NgayLamViec;
                        var dd = x.DonDatDichVu;
                        var nguoiGiupViec = nl.MaNguoiGiupViecNavigation;

                        // Lấy bản ghi thu nhập đầu tiên (nếu có) tương ứng với ngày làm việc này
                        var thuNhap = nl.ThuNhapNguoiGiupViecs.FirstOrDefault();

                        return new
                        {
                            // BỔ SUNG: Lấy mã ngày làm việc (Trim để cắt khoảng trắng nếu có)
                            maNgayLamViec = nl.MaNgayLamViec?.Trim(),

                            ngay = nl.NgayLam.HasValue ? nl.NgayLam.Value.ToString("yyyy-MM-dd") : "Chưa xác định",
                            tenDichVu = dd.MaDichVuNavigation?.TenDichVu ?? "Chưa xác định",
                            gioBatDau = nl.GioBatDau.HasValue ? nl.GioBatDau.Value.ToString("HH:mm") : "00:00",
                            gioKetThuc = nl.GioKetThuc.HasValue ? nl.GioKetThuc.Value.ToString("HH:mm") : "Đang cập nhật",
                            trangThai = nl.TrangThai ?? "Chờ phân công",
                            tenNhanVien = nguoiGiupViec?.HoTen,
                            sdtNhanVien = nguoiGiupViec?.SoDienThoai,

                            // Truyền dữ liệu Thu Nhập vào DTO
                            maThuNhap = thuNhap?.MaThuNhap?.Trim(),
                            trangThaiThuNhap = thuNhap?.TrangThai
                        };
                    })
                    .GroupBy(x => x.ngay)
                    .Select(g => new
                    {
                        ngay = g.Key,
                        danhSachCa = g.OrderBy(c => c.gioBatDau).Select(c => new
                        {
                            
                            maNgayLamViec = c.maNgayLamViec,

                            tenDichVu = c.tenDichVu,
                            gioBatDau = c.gioBatDau,
                            gioKetThuc = c.gioKetThuc,
                            trangThai = c.trangThai,
                            tenNhanVien = c.tenNhanVien,
                            sdtNhanVien = c.sdtNhanVien,
                            maThuNhap = c.maThuNhap,
                            trangThaiThuNhap = c.trangThaiThuNhap
                        }).ToList()
                    })
                    .OrderBy(g => g.ngay)
                    .ToList();

                var result = new
                {
                    maDon = order.MaDon,
                    tenDichVu = order.DonDatDichVus.Any()
                        ? order.DonDatDichVus
                            .Select(dd => dd.MaDichVuNavigation?.TenDichVu ?? "Chưa xác định")
                            .Distinct()
                            .ToList()
                        : new List<string> { "Chưa xác định" },
                    ngayDat = order.NgayDat,
                    trangThai = currentStatus,
                    soTien = order.TongTien,
                    thanhTien = currentStatus == "Hủy đơn" ? 0 : (currentStatus == "Chờ xác nhận" ? (decimal?)null : order.TongTien),
                    diaChi = order.DiaChi,
                    soNgay = order.SoNgay ?? 1,
                    ghiChu = order.GhiChu,
                    ngayLamViec = ngayLamViecsGrouped,
                    danhGia = danhGiaDb != null ? new
                    {
                        soSao = danhGiaDb.SoSao ?? 5,
                        noiDung = danhGiaDb.NoiDung ?? "Không có"
                    } : null,
                    thanhToan = new
                    {
                        trangThai = thanhToanDb?.TrangThaiThanhToan ?? "Chưa thanh toán",
                        phuongThuc = "Thanh toán trực tuyến",
                        ngayThanhToan = order.NgayDat
                    },
                    statusTimes = statusTimes,
                    lichSuTrangThai = lichSuTrangThai
                };

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy chi tiết.", detail = ex.Message });
            }
        }

        /// Hủy đơn đặt (chỉ được phép nếu đơn đang chờ xác nhận)
        [HttpPost("CancelBooking/{maDon}")]
        public async Task<IActionResult> CancelBooking(string maDon)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                
                var booking = await _context.DonDats
                    .Include(d => d.LichSuTrangThaiDons)
                    .Include(d => d.DonDatDichVus)
                        .ThenInclude(dd => dd.NgayLamViecs)
                    .FirstOrDefaultAsync(d => d.MaDon == maDon);

                if (booking == null)
                    return NotFound(new { message = "Đơn đặt không tồn tại." });

                var currentStatus = booking.LichSuTrangThaiDons
                    .OrderByDescending(l => l.ThoiGianCapNhat)
                    .FirstOrDefault()?.TrangThai;

                if (currentStatus != "Chờ xác nhận")
                {
                    return BadRequest(new { success = false, message = "Chỉ có thể hủy các đơn đang chờ xác nhận." });
                }

                // =========================================================
                // 1. Cập nhật trạng thái "Hủy đơn" vào lịch sử
                // =========================================================
                var lichSuTrangThai = new LichSuTrangThaiDon
                {
                    // Thay đổi: Sử dụng hàm sinh mã từ Database
                    MaLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS"),
                    MaDon = maDon,
                    TrangThai = "Hủy đơn",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);

                // =========================================================
                // 2. Cập nhật trạng thái "Hủy lịch" cho các ngày làm việc
                // =========================================================
                foreach (var donDatDichVu in booking.DonDatDichVus)
                {
                    foreach (var ngayLam in donDatDichVu.NgayLamViecs)
                    {
                        // Ràng buộc CHECK_TrangThaiNgayLamViec có cho phép giá trị "Hủy lịch"
                        ngayLam.TrangThai = "Hủy lịch";

                        // (Tùy chọn) Gán null cho nhân viên để hệ thống dọn dẹp sạch sẽ hơn
                        ngayLam.MaNguoiGiupViec = null;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Hủy đơn đặt thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Lỗi khi hủy đơn.", detail = ex.Message });
            }
        }

        [HttpGet("GetStatuses")]
        public IActionResult GetStatuses()
        {
            var statuses = new[]
            {
                new { value = "all", label = "Xem tất cả" },
                new { value = "Chờ xác nhận", label = "Chờ xác nhận" },
                new { value = "Đã xác nhận", label = "Đã xác nhận" },
                new { value = "Đang thực hiện", label = "Đang thực hiện" },
                new { value = "Hoàn thành", label = "Hoàn thành" },
                new { value = "Có sự cố", label = "Có sự cố" },
                new { value = "Hủy đơn", label = "Hủy đơn" }
            };

            return Ok(new { success = true, data = statuses });
        }

        [HttpPost("CheckFreeSchedule")]
        public async Task<IActionResult> KiemTraLichRanh([FromBody] KiemTraLichRanhRequest request)
        {
            if (request == null || request.DanhSachDichVu == null || !request.DanhSachDichVu.Any())
                return BadRequest("Danh sách dịch vụ không được để trống.");

            try
            {
                DateOnly targetDate = DateOnly.FromDateTime(request.NgayDat);
                TimeOnly targetStartTime = TimeOnly.FromTimeSpan(request.ThoiGianBatDau);


                var dsMaDichVu = request.DanhSachDichVu.Select(d => d.MaDichVu).ToList();

                // ======================================================================
                // BƯỚC 1: PRE-LOAD DỮ LIỆU TỪ DATABASE
                // ======================================================================
                var dichVusYeuCau = await _context.DichVus
                    .Where(dv => dsMaDichVu.Contains(dv.MaDichVu))
                    .ToListAsync();

                if (dichVusYeuCau.Count != dsMaDichVu.Count)
                    return BadRequest("Một hoặc nhiều dịch vụ không tồn tại trong hệ thống.");

                var rawShifts = await _context.LichRanhCaLamViecs
                    .Include(lrc => lrc.MaLichRanhNavigation)
                    .Include(lrc => lrc.MaCaLamViecNavigation)
                    .Where(lrc => lrc.MaLichRanhNavigation.Ngay == targetDate)
                    .ToListAsync();

                var helperShiftsMap = rawShifts
                    .GroupBy(lrc => lrc.MaLichRanhNavigation.MaNguoiGiupViec)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(lrc => new
                        {
                            Start = lrc.MaCaLamViecNavigation.GioBatDau,
                            End = lrc.MaCaLamViecNavigation.GioKetThuc
                        }).ToList()
                    );

                var potentialHelpers = helperShiftsMap.Keys.ToList();

                if (!potentialHelpers.Any())
                    return Ok(new
                    {
                        isAvailable = false,
                        message = "Ngày này hiện chưa có nhân viên nào đăng ký ca làm việc.",
                        suggestedTime = (string?)null
                    });

                var trangThaiBan = new List<string> { "Đã phân công", "Đang làm việc", "Hoàn thành", "Không đến làm" };

                var jobsInDay = await _context.NgayLamViecs
                    .Include(nlv => nlv.MaDonDatDichVuNavigation)
                    .Where(nlv => nlv.NgayLam == targetDate && trangThaiBan.Contains(nlv.TrangThai))
                    .Select(nlv => new
                    {
                        nlv.MaNguoiGiupViec,
                        nlv.GioBatDau,
                        nlv.GioKetThuc,
                        MaDon = nlv.MaDonDatDichVuNavigation != null ? nlv.MaDonDatDichVuNavigation.MaDon : null
                    })
                    .ToListAsync();

                var hoSoRanh = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .Where(hs => potentialHelpers.Contains(hs.MaNguoiGiupViec))
                    .ToListAsync();

                var freeHelpersSkillsMap = hoSoRanh.ToDictionary(
                    hs => hs.MaNguoiGiupViec,
                    hs => hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList()
                );

                // ======================================================================
                // BƯỚC 2: KIỂM TRA 30 PHÚT GIỮA 2 ĐƠN KHÁC NHAU
                // ======================================================================
                async Task<(bool isValid, string errorMessage)> ValidateHelperTransitionTime(
                    string helperId,
                    TimeOnly newStartTime,
                    TimeOnly newEndTime,
                    string? currentMaDon)
                {
                    const int minimumTransitionMinutes = 30;

                    var helperJobs = jobsInDay
                        .Where(x => x.MaNguoiGiupViec == helperId)
                        .ToList();

                    foreach (var existingJob in helperJobs)
                    {
                        if (!existingJob.GioBatDau.HasValue || !existingJob.GioKetThuc.HasValue)
                            continue;

                        TimeOnly existingStart = existingJob.GioBatDau.Value;
                        TimeOnly existingEnd = existingJob.GioKetThuc.Value;

                        // Cùng đơn hàng: chỉ kiểm tra xung đột thời gian
                        if (!string.IsNullOrEmpty(currentMaDon) && existingJob.MaDon == currentMaDon)
                        {
                            bool hasTimeConflict = newStartTime < existingEnd && newEndTime > existingStart;
                            if (hasTimeConflict)
                            {
                                return (false, $"Công việc của đơn {currentMaDon} bị xung đột thời gian: {existingStart:HH:mm} - {existingEnd:HH:mm}");
                            }
                            continue;
                        }

                        // Khác đơn - công việc mới kết thúc trước
                        if (newEndTime <= existingStart)
                        {
                            TimeSpan gap = existingStart.ToTimeSpan() - newEndTime.ToTimeSpan();
                            if (gap.TotalMinutes < minimumTransitionMinutes)
                            {
                                return (false,
                                    $"Khoảng cách từ công việc này đến công việc khác đơn không đủ 30 phút. " +
                                    $"Công việc này kết thúc lúc {newEndTime:HH:mm}, công việc tiếp theo bắt đầu lúc {existingStart:HH:mm}. " +
                                    $"Chỉ còn {gap.TotalMinutes:F0} phút (cần tối thiểu 30 phút).");
                            }

                            continue;
                        }

                        // Khác đơn - công việc cũ kết thúc trước
                        if (existingEnd <= newStartTime)
                        {
                            TimeSpan gap = newStartTime.ToTimeSpan() - existingEnd.ToTimeSpan();
                            if (gap.TotalMinutes < minimumTransitionMinutes)
                            {
                                return (false,
                                    $"Khoảng cách từ công việc khác đơn đến công việc này không đủ 30 phút. " +
                                    $"Công việc trước kết thúc lúc {existingEnd:HH:mm}, công việc này bắt đầu lúc {newStartTime:HH:mm}. " +
                                    $"Chỉ còn {gap.TotalMinutes:F0} phút (cần tối thiểu 30 phút).");
                            }

                            continue;
                        }

                        // Xung đột thời gian
                        bool hasConflict = newStartTime < existingEnd && newEndTime > existingStart;
                        if (hasConflict)
                        {
                            return (false, $"Công việc này bị xung đột với công việc từ đơn khác: {existingStart:HH:mm} - {existingEnd:HH:mm}");
                        }
                    }

                    return (true, "");
                }

                // ======================================================================
                // BƯỚC 3: HÀM KIỂM TRA 1 KHUNG GIỜ CÓ HỢP LỆ HAY KHÔNG
                // ======================================================================
                async Task<bool> IsTimeSlotAvailable(TimeOnly testStartTime)
                {
                    var helperNextFreeTime = new Dictionary<string, TimeOnly>();

                    foreach (var reqSvc in request.DanhSachDichVu)
                    {
                        string neededSkill = dichVusYeuCau
                            .FirstOrDefault(d => d.MaDichVu == reqSvc.MaDichVu)
                            ?.MaKyNang;

                        int duration = reqSvc.ThoiLuong;
                        string assignedHelperId = null;

                        // ƯU TIÊN 1: Người cũ trong team làm tiếp
                        foreach (var helperId in helperNextFreeTime.Keys.ToList())
                        {
                            var skills = freeHelpersSkillsMap.ContainsKey(helperId)
                                ? freeHelpersSkillsMap[helperId]
                                : new List<string>();

                            if (string.IsNullOrEmpty(neededSkill) || skills.Contains(neededSkill))
                            {
                                TimeOnly possibleStartTime = helperNextFreeTime[helperId];
                                TimeOnly possibleEndTime = possibleStartTime.AddHours(duration);

                                bool isWithinRegisteredShift = helperShiftsMap[helperId].Any(shift =>
                                    shift.Start <= possibleStartTime && shift.End >= possibleEndTime);

                                if (!isWithinRegisteredShift) continue;

                                bool isBusyWithOthers = jobsInDay.Any(j =>
                                    j.MaNguoiGiupViec == helperId &&
                                    j.GioBatDau.HasValue && j.GioKetThuc.HasValue &&
                                    j.GioBatDau.Value < possibleEndTime &&
                                    j.GioKetThuc.Value > possibleStartTime);

                                if (isBusyWithOthers) continue;

                                var (isValid, _) = await ValidateHelperTransitionTime(
                                    helperId,
                                    possibleStartTime,
                                    possibleEndTime,
                                    null);

                                if (!isValid) continue;

                                assignedHelperId = helperId;
                                helperNextFreeTime[helperId] = possibleEndTime;
                                break;
                            }
                        }

                        // ƯU TIÊN 2: Tìm người mới ra làm song song
                        if (assignedHelperId == null)
                        {
                            foreach (var helper in freeHelpersSkillsMap)
                            {
                                if (helperNextFreeTime.ContainsKey(helper.Key)) continue;

                                if (string.IsNullOrEmpty(neededSkill) || helper.Value.Contains(neededSkill))
                                {
                                    TimeOnly possibleStartTime = testStartTime;
                                    TimeOnly possibleEndTime = testStartTime.AddHours(duration);

                                    bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helper.Key) &&
                                                                   helperShiftsMap[helper.Key].Any(shift =>
                                                                       shift.Start <= possibleStartTime &&
                                                                       shift.End >= possibleEndTime);

                                    if (!isWithinRegisteredShift) continue;

                                    bool isBusyWithOthers = jobsInDay.Any(j =>
                                        j.MaNguoiGiupViec == helper.Key &&
                                        j.GioBatDau.HasValue && j.GioKetThuc.HasValue &&
                                        j.GioBatDau.Value < possibleEndTime &&
                                        j.GioKetThuc.Value > possibleStartTime);

                                    if (isBusyWithOthers) continue;

                                    var (isValid, _) = await ValidateHelperTransitionTime(
                                        helper.Key,
                                        possibleStartTime,
                                        possibleEndTime,
                                        null);

                                    if (!isValid) continue;

                                    assignedHelperId = helper.Key;
                                    helperNextFreeTime[helper.Key] = possibleEndTime;
                                    break;
                                }
                            }
                        }

                        if (assignedHelperId == null)
                            return false;
                    }

                    return true;
                }

                // ======================================================================
                // BƯỚC 4: KIỂM TRA & TÌM GIỜ GỢI Ý
                // ======================================================================
                if (await IsTimeSlotAvailable(targetStartTime))
                {
                    return Ok(new
                    {
                        isAvailable = true,
                        message = "Khung giờ này có thể đặt lịch.",
                        suggestedTime = (string?)null
                    });
                }

                TimeOnly maxEndTime = new TimeOnly(20, 0);
                TimeOnly currentTime = targetStartTime.AddMinutes(30);
                string? suggestedTime = null;

                int maxDurationOfSingleService = request.DanhSachDichVu.Max(d => d.ThoiLuong);

                while (currentTime.AddHours(maxDurationOfSingleService) <= maxEndTime)
                {
                    if (await IsTimeSlotAvailable(currentTime))
                    {
                        suggestedTime = currentTime.ToString("HH:mm");
                        break;
                    }

                    currentTime = currentTime.AddMinutes(30);
                }

                return Ok(new
                {
                    isAvailable = false,
                    message = "Khung giờ bạn chọn đã kín lịch hoặc nhân viên không có ca làm việc phù hợp.",
                    suggestedTime = suggestedTime
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi server khi xử lý kiểm tra lịch rảnh.",
                    error = ex.Message
                });
            }
        }

    }

    // =========================================================================
    // DTOs: Các Class hứng dữ liệu JSON từ Frontend Next.js
    // =========================================================================
    public class BookingRequestDto
    {
        public string MaKhachHang { get; set; } = null!;
        public string DiaChiThucHien { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public decimal TongTien { get; set; }
        public string PhuongThucThanhToan { get; set; } = string.Empty;
        public string MaGiaoDich { get; set; } = string.Empty;
        public List<DayOrderDto> ChiTietNgayLamViec { get; set; } = new();
    }

    public class DayOrderDto
    {
        public DateTime NgayThucHien { get; set; }
        public string GioBatDau { get; set; } = string.Empty;
        public List<ServiceOrderDto> DichVus { get; set; } = new();
    }

    public class ServiceOrderDto
    {
        public string MaDichVu { get; set; } = null!;
        public int ThoiLuong { get; set; } // Map trực tiếp sang ThoiLuongThucHien 
        public decimal ThanhTien { get; set; }
    }

    public class KiemTraLichRanhRequest
    {
        public DateTime NgayDat { get; set; }
        public TimeSpan ThoiGianBatDau { get; set; }

        public List<DichVuYeuCauDto> DanhSachDichVu { get; set; }
    }

    public class DichVuYeuCauDto
    {
        public string MaDichVu { get; set; }
        public int ThoiLuong { get; set; } // Khách chọn bao nhiêu tiếng gửi lên đây
    }
}
