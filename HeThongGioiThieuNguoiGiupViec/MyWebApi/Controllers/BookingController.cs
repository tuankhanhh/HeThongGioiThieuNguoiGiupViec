using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models; // Thay bằng namespace chứa các file Model của bạn

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

        // Hàm hỗ trợ tự sinh mã VARCHAR(5) cho Database
        private string GenerateId(string prefix)
        {
            int randomNum = new Random().Next(1000, 9999);
            string id = prefix + randomNum.ToString();
            return id.Length > 5 ? id.Substring(0, 5) : id;
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

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // =========================================================
                // BƯỚC 1: TẠO ĐƠN ĐẶT & LỊCH SỬ
                // =========================================================
                var donDat = new DonDat
                {
                    MaDon = GenerateId("DD"),
                    MaKhachhang = request.MaKhachHang,
                    DiaChi = request.DiaChiThucHien,
                    GhiChu = request.GhiChu,
                    SoNgay = request.ChiTietNgayLamViec.Count,
                    TongTien = request.TongTien,
                    NgayDat = DateTime.Now
                };
                _context.DonDats.Add(donDat);

                var thanhToan = new ThanhToan
                {
                    MaThanhToan = GenerateId("TT"),
                    MaDon = donDat.MaDon,
                    //TrangThaiThanhToan = $"{request.PhuongThucThanhToan} - Chờ xác nhận"
                    TrangThaiThanhToan = "Đã thanh toán"
                };
                _context.ThanhToans.Add(thanhToan);

                var lichSuTrangThai = new LichSuTrangThaiDon
                {
                    MaLichSu = GenerateId("LS"),
                    MaDon = donDat.MaDon,
                    TrangThai = "Chờ xác nhận",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);

                var processedServices = new Dictionary<string, string>();

                // =========================================================
                // BƯỚC 2: XỬ LÝ LỊCH LÀM VIỆC & THUẬT TOÁN AUTO-ASSIGN MỚI
                // =========================================================
                foreach (var day in request.ChiTietNgayLamViec)
                {
                    TimeOnly dayStartTime = TimeOnly.Parse(day.GioBatDau);
                    DateOnly targetDate = DateOnly.FromDateTime(day.NgayThucHien);

                    // --- 2.1 Truy xuất nhân viên rảnh cơ bản trong ngày ---

                    // SỬA LỖI: Load chi tiết ca làm việc (LichRanhCaLamViec) để kiểm tra thời gian
                    var rawShifts = await _context.LichRanhCaLamViecs
                        .Include(lrc => lrc.MaLichRanhNavigation)
                        .Include(lrc => lrc.MaCaLamViecNavigation)
                        .Where(lrc => lrc.MaLichRanhNavigation.Ngay == targetDate)
                        .ToListAsync();

                    // Map: Mã Nhân Viên -> Danh sách các khoảng thời gian họ rảnh
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

                    // Lấy danh sách việc đã được phân công trong ngày để loại trừ giờ cấn lịch
                    var jobsInDay = await _context.NgayLamViecs
                        .Where(nlv => nlv.NgayLam == targetDate &&
                                     (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang làm việc" || nlv.TrangThai == "Chờ phân công"))
                        .Select(nlv => new { nlv.MaNguoiGiupViec, nlv.GioBatDau, nlv.GioKetThuc })
                        .ToListAsync();

                    // Lấy kỹ năng của NGV rảnh
                    var hoSoRanh = await _context.HoSoNguoiGiupViecs
                        .Include(hs => hs.KyNangNguoiGiupViecs)
                        .Where(hs => potentialHelpers.Contains(hs.MaNguoiGiupViec))
                        .ToListAsync();
                    var freeHelpersSkillsMap = hoSoRanh.ToDictionary(hs => hs.MaNguoiGiupViec, hs => hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList());

                    // Lấy kỹ năng yêu cầu của từng dịch vụ
                    var requiredServiceIds = day.DichVus.Select(d => d.MaDichVu).ToList();
                    var dichVusYeuCau = await _context.DichVus.Where(dv => requiredServiceIds.Contains(dv.MaDichVu)).ToListAsync();
                    var serviceSkillMap = dichVusYeuCau.ToDictionary(dv => dv.MaDichVu, dv => dv.MaKyNang);

                    // --- 2.2 THUẬT TOÁN PHÂN CÔNG LINH HOẠT (HỖ TRỢ CẢ 3 TRƯỜNG HỢP) ---

                    var helperNextFreeTime = new Dictionary<string, TimeOnly>();
                    var serviceAssignments = new Dictionary<string, (string HelperId, TimeOnly Start, TimeOnly End)>();

                    foreach (var svc in day.DichVus)
                    {
                        string neededSkill = serviceSkillMap.ContainsKey(svc.MaDichVu) ? serviceSkillMap[svc.MaDichVu] : null;
                        string assignedHelperId = null;
                        TimeOnly plannedStartTime = dayStartTime;

                        // 1. ƯU TIÊN 1: Tìm trong số những người ĐÃ ĐƯỢC CHỌN cho đơn này (gom việc - Trường hợp 1 & 2)
                        foreach (var helperId in helperNextFreeTime.Keys)
                        {
                            var skills = freeHelpersSkillsMap.ContainsKey(helperId) ? freeHelpersSkillsMap[helperId] : new List<string>();
                            if (string.IsNullOrEmpty(neededSkill) || skills.Contains(neededSkill))
                            {
                                TimeOnly possibleStartTime = helperNextFreeTime[helperId];
                                TimeOnly possibleEndTime = possibleStartTime.AddHours(svc.ThoiLuong);

                                // ĐIỀU KIỆN MỚI 1: Phải nằm trong Ca làm việc đã đăng ký của người này
                                bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helperId) &&
                                                               helperShiftsMap[helperId].Any(shift =>
                                                                   shift.Start <= possibleStartTime && shift.End >= possibleEndTime);

                                if (!isWithinRegisteredShift) continue;

                                // ĐIỀU KIỆN 2: Không bị trùng lịch với khách khác
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

                        // 2. ƯU TIÊN 2: Nếu người cũ không làm được (thiếu kỹ năng hoặc kẹt lịch), tìm NGƯỜI MỚI (Trường hợp 2 & 3)
                        if (assignedHelperId == null)
                        {
                            foreach (var helper in freeHelpersSkillsMap)
                            {
                                if (helperNextFreeTime.ContainsKey(helper.Key)) continue;

                                if (string.IsNullOrEmpty(neededSkill) || helper.Value.Contains(neededSkill))
                                {
                                    TimeOnly possibleEndTime = dayStartTime.AddHours(svc.ThoiLuong);

                                    // ĐIỀU KIỆN MỚI 1: Phải nằm trong Ca làm việc đã đăng ký
                                    bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helper.Key) &&
                                                                   helperShiftsMap[helper.Key].Any(shift =>
                                                                       shift.Start <= dayStartTime && shift.End >= possibleEndTime);

                                    if (!isWithinRegisteredShift) continue;

                                    // ĐIỀU KIỆN 2: Không bị trùng lịch
                                    bool isBusyWithOthers = jobsInDay.Any(j => j.MaNguoiGiupViec == helper.Key &&
                                                                               j.GioBatDau.HasValue && j.GioKetThuc.HasValue &&
                                                                               j.GioBatDau.Value < possibleEndTime &&
                                                                               j.GioKetThuc.Value > dayStartTime);
                                    if (!isBusyWithOthers)
                                    {
                                        assignedHelperId = helper.Key;
                                        plannedStartTime = dayStartTime; // Người mới làm song song từ giờ bắt đầu
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

                    // --- 2.3 Ghi dữ liệu vào DB dựa trên kết quả phân công ---
                    TimeOnly unassignedFallbackTime = dayStartTime;

                    foreach (var svc in day.DichVus)
                    {
                        // Xử lý DonDatDichVu
                        string maDonDatDichVu;
                        if (!processedServices.ContainsKey(svc.MaDichVu))
                        {
                            maDonDatDichVu = GenerateId("DV");
                            _context.DonDatDichVus.Add(new DonDatDichVu { MaDonDatDichVu = maDonDatDichVu, MaDon = donDat.MaDon, MaDichVu = svc.MaDichVu });
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
                            // Fallback: Chờ phân công (Làm nối tiếp vào fallback time)
                            gioBatDau = unassignedFallbackTime;
                            gioKetThuc = unassignedFallbackTime.AddHours(svc.ThoiLuong);
                            unassignedFallbackTime = gioKetThuc;
                        }

                        // Tạo Ngày Làm Việc
                        var ngayLamViec = new NgayLamViec
                        {
                            MaNgayLamViec = GenerateId("NL"),
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
                    }
                }

                await _context.SaveChangesAsync();
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

                        return new
                        {
                            ngay = nl.NgayLam.HasValue ? nl.NgayLam.Value.ToString("yyyy-MM-dd") : "Chưa xác định",
                            tenDichVu = dd.MaDichVuNavigation?.TenDichVu ?? "Chưa xác định",
                            gioBatDau = nl.GioBatDau.HasValue ? nl.GioBatDau.Value.ToString("HH:mm") : "00:00",
                            gioKetThuc = nl.GioKetThuc.HasValue ? nl.GioKetThuc.Value.ToString("HH:mm") : "Đang cập nhật",
                            trangThai = nl.TrangThai ?? "Chờ phân công",
                            tenNhanVien = nguoiGiupViec?.HoTen,
                            sdtNhanVien = nguoiGiupViec?.SoDienThoai
                        };
                    })
                    .GroupBy(x => x.ngay)
                    .Select(g => new
                    {
                        ngay = g.Key,
                        danhSachCa = g.OrderBy(c => c.gioBatDau).Select(c => new
                        {
                            tenDichVu = c.tenDichVu,
                            gioBatDau = c.gioBatDau,
                            gioKetThuc = c.gioKetThuc,
                            trangThai = c.trangThai,
                            tenNhanVien = c.tenNhanVien,
                            sdtNhanVien = c.sdtNhanVien
                        }).ToList()
                    })
                    .OrderBy(g => g.ngay)
                    .ToList();

                var result = new
                {
                    maDon = order.MaDon,

                    // THAY ĐỔI TẠI ĐÂY: Trả về một mảng danh sách tên dịch vụ thay vì chuỗi join
                    tenDichVu = order.DonDatDichVus.Any()
                        ? order.DonDatDichVus
                            .Select(dd => dd.MaDichVuNavigation?.TenDichVu ?? "Chưa xác định")
                            .Distinct() // Tránh trùng lặp nếu một dịch vụ xuất hiện nhiều lần
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

                // Cập nhật trạng thái "Hủy đơn" theo Constraint
                var lichSuTrangThai = new LichSuTrangThaiDon
                {
                    MaLichSu = GenerateId("LS"),
                    MaDon = maDon,
                    TrangThai = "Hủy đơn",
                    ThoiGianCapNhat = DateTime.Now
                };
                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);

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
            if (request.DanhSachDichVu == null || !request.DanhSachDichVu.Any())
                return BadRequest("Danh sách dịch vụ không được để trống.");

            try
            {
                DateOnly targetDate = DateOnly.FromDateTime(request.NgayDat);
                TimeOnly targetStartTime = TimeOnly.FromTimeSpan(request.ThoiGianBatDau);

                var dsMaDichVu = request.DanhSachDichVu.Select(d => d.MaDichVu).ToList();

                // ==============================================================================
                // BƯỚC 1: PRE-LOAD DỮ LIỆU TỪ DATABASE
                // ==============================================================================
                var dichVusYeuCau = await _context.DichVus
                    .Where(dv => dsMaDichVu.Contains(dv.MaDichVu))
                    .ToListAsync();

                if (dichVusYeuCau.Count != dsMaDichVu.Count)
                    return BadRequest("Một hoặc nhiều dịch vụ không tồn tại trong hệ thống.");

                // 1.1: Lấy danh sách Lịch Rảnh KÈM THEO CA LÀM VIỆC của nhân viên trong ngày đó
                var rawShifts = await _context.LichRanhCaLamViecs
                    .Include(lrc => lrc.MaLichRanhNavigation)
                    .Include(lrc => lrc.MaCaLamViecNavigation)
                    .Where(lrc => lrc.MaLichRanhNavigation.Ngay == targetDate)
                    .ToListAsync();

                // Nhóm lại thành Map: Mã Nhân Viên -> Danh sách các khoảng thời gian (Start, End) họ rảnh
                var helperShiftsMap = rawShifts
                    .GroupBy(lrc => lrc.MaLichRanhNavigation.MaNguoiGiupViec)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(lrc => new 
                        { 
                            Start = lrc.MaCaLamViecNavigation.GioBatDau, // Lấy trực tiếp, không ép kiểu nữa
                            End = lrc.MaCaLamViecNavigation.GioKetThuc     // Lấy trực tiếp, không ép kiểu nữa
                        }).ToList()
                    );

                var potentialHelpers = helperShiftsMap.Keys.ToList();

                // Nếu không có ai đăng ký lịch làm việc vào ngày này
                if (!potentialHelpers.Any())
                    return Ok(new { isAvailable = false, message = "Ngày này hiện chưa có nhân viên nào đăng ký ca làm việc.", suggestedTime = (string?)null });

                // 1.2: Lấy các công việc đã được phân công (để check kẹt lịch)
                var jobsInDay = await _context.NgayLamViecs
                    .Where(nlv => nlv.NgayLam == targetDate &&
                                 (nlv.TrangThai == "Đã phân công" || nlv.TrangThai == "Đang làm việc" || nlv.TrangThai == "Chờ phân công"))
                    .Select(nlv => new { nlv.MaNguoiGiupViec, nlv.GioBatDau, nlv.GioKetThuc })
                    .ToListAsync();

                // 1.3: Lấy Kỹ năng của những người có đăng ký ca làm
                var hoSoRanh = await _context.HoSoNguoiGiupViecs
                    .Include(hs => hs.KyNangNguoiGiupViecs)
                    .Where(hs => potentialHelpers.Contains(hs.MaNguoiGiupViec))
                    .ToListAsync();

                var freeHelpersSkillsMap = hoSoRanh.ToDictionary(
                    hs => hs.MaNguoiGiupViec,
                    hs => hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList());

                // ==============================================================================
                // BƯỚC 2: HÀM MÔ PHỎNG THUẬT TOÁN BẮT CẶP
                // ==============================================================================
                bool IsTimeSlotAvailable(TimeOnly testStartTime)
                {
                    var helperNextFreeTime = new Dictionary<string, TimeOnly>();

                    foreach (var reqSvc in request.DanhSachDichVu)
                    {
                        string neededSkill = dichVusYeuCau.FirstOrDefault(d => d.MaDichVu == reqSvc.MaDichVu)?.MaKyNang;
                        int duration = reqSvc.ThoiLuong;
                        string assignedHelperId = null;

                        // ƯU TIÊN 1: Người cũ trong team làm tiếp
                        foreach (var helperId in helperNextFreeTime.Keys)
                        {
                            var skills = freeHelpersSkillsMap.ContainsKey(helperId) ? freeHelpersSkillsMap[helperId] : new List<string>();
                            if (string.IsNullOrEmpty(neededSkill) || skills.Contains(neededSkill))
                            {
                                TimeOnly possibleStartTime = helperNextFreeTime[helperId];
                                TimeOnly possibleEndTime = possibleStartTime.AddHours(duration);

                                // ĐIỀU KIỆN MỚI 1: Phải nằm trong Ca làm việc đã đăng ký của người này
                                bool isWithinRegisteredShift = helperShiftsMap[helperId].Any(shift =>
                                    shift.Start <= possibleStartTime && shift.End >= possibleEndTime);

                                if (!isWithinRegisteredShift) continue; // Vượt quá ca làm việc -> Bỏ qua

                                // ĐIỀU KIỆN 2: Không bị trùng lịch với khách khác
                                bool isBusyWithOthers = jobsInDay.Any(j => j.MaNguoiGiupViec == helperId &&
                                                                           j.GioBatDau < possibleEndTime &&
                                                                           j.GioKetThuc > possibleStartTime);
                                if (!isBusyWithOthers)
                                {
                                    assignedHelperId = helperId;
                                    helperNextFreeTime[helperId] = possibleEndTime;
                                    break;
                                }
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
                                    TimeOnly possibleEndTime = testStartTime.AddHours(duration);

                                    // ĐIỀU KIỆN MỚI 1: Phải nằm trong Ca làm việc đã đăng ký
                                    bool isWithinRegisteredShift = helperShiftsMap.ContainsKey(helper.Key) &&
                                                                   helperShiftsMap[helper.Key].Any(shift =>
                                                                       shift.Start <= testStartTime && shift.End >= possibleEndTime);

                                    if (!isWithinRegisteredShift) continue;

                                    // ĐIỀU KIỆN 2: Không kẹt lịch
                                    bool isBusyWithOthers = jobsInDay.Any(j => j.MaNguoiGiupViec == helper.Key &&
                                                                               j.GioBatDau < possibleEndTime &&
                                                                               j.GioKetThuc > testStartTime);
                                    if (!isBusyWithOthers)
                                    {
                                        assignedHelperId = helper.Key;
                                        helperNextFreeTime[helper.Key] = possibleEndTime;
                                        break;
                                    }
                                }
                            }
                        }

                        // Nếu có 1 dịch vụ không ai nhận được -> Khung giờ này thất bại
                        if (assignedHelperId == null) return false;
                    }

                    return true;
                }

                // ==============================================================================
                // BƯỚC 3: KIỂM TRA & TÌM GIỜ GỢI Ý
                // ==============================================================================
                if (IsTimeSlotAvailable(targetStartTime))
                {
                    return Ok(new { isAvailable = true, message = "Khung giờ này có thể đặt lịch.", suggestedTime = (string?)null });
                }

                TimeOnly maxEndTime = new TimeOnly(20, 0);
                TimeOnly currentTime = targetStartTime.AddMinutes(30);
                string? suggestedTime = null;

                int maxDurationOfSingleService = request.DanhSachDichVu.Max(d => d.ThoiLuong);

                while (currentTime.AddHours(maxDurationOfSingleService) <= maxEndTime)
                {
                    if (IsTimeSlotAvailable(currentTime))
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
                return StatusCode(500, new { message = "Lỗi server khi xử lý kiểm tra lịch rảnh.", error = ex.Message });
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

        // Thay vì List<string>, ta dùng List object để chứa cả Mã DV và Thời lượng khách chọn
        public List<DichVuYeuCauDto> DanhSachDichVu { get; set; }
    }

    public class DichVuYeuCauDto
    {
        public string MaDichVu { get; set; }
        public int ThoiLuong { get; set; } // Khách chọn bao nhiêu tiếng gửi lên đây
    }
}
