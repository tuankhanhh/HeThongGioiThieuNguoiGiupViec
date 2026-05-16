//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using MyWebApi.Models; // Thay bằng namespace chứa các file Model của bạn

//namespace MyWebApi.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class BookingController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context; // TODO: Đổi 'YourDbContext' thành tên DbContext của bạn

//        public BookingController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        // Hàm hỗ trợ tự sinh mã VARCHAR(5) cho Database
//        private string GenerateId(string prefix)
//        {
//            int randomNum = new Random().Next(1000, 9999);
//            string id = prefix + randomNum.ToString();
//            return id.Length > 5 ? id.Substring(0, 5) : id;
//        }

//        [HttpPost("Create")]
//        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto request)
//        {
//            if (request == null || request.ChiTietNgayLamViec == null || !request.ChiTietNgayLamViec.Any())
//            {
//                return BadRequest(new { message = "Dữ liệu đặt lịch không hợp lệ hoặc bị trống." });
//            }

//            // Lấy thời gian hiện tại làm mốc
//            DateTime now = DateTime.Now;

//            foreach (var day in request.ChiTietNgayLamViec)
//            {
//                if (!TimeOnly.TryParse(day.GioBatDau, out TimeOnly parsedTime))
//                {
//                    return BadRequest(new { message = $"Định dạng giờ '{day.GioBatDau}' không hợp lệ." });
//                }

//                // =========================================================
//                // CHỈ RÀNG BUỘC 1 TIẾNG NẾU NGÀY THỰC HIỆN LÀ HÔM NAY
//                // =========================================================
//                if (day.NgayThucHien.Date == now.Date)
//                {
//                    // Nối ngày và giờ lại
//                    DateTime scheduledDateTime = day.NgayThucHien.Date.Add(parsedTime.ToTimeSpan());
//                    DateTime minAllowedTime = now.AddHours(1);

//                    if (scheduledDateTime < minAllowedTime)
//                    {
//                        return BadRequest(new
//                        {
//                            success = false,
//                            message = $"Nếu đặt lịch trong ngày hôm nay, vui lòng chọn giờ bắt đầu từ {minAllowedTime:HH:mm} trở đi."
//                        });
//                    }
//                }
//            }

//            // =========================================================
//            // 2. BẮT ĐẦU TRANSACTION ĐỂ ĐẢM BẢO AN TOÀN DỮ LIỆU
//            // =========================================================
//            using var transaction = await _context.Database.BeginTransactionAsync();

//            try
//            {
//                // =========================================================
//                // BƯỚC 1: TẠO ĐƠN ĐẶT (Bảng DonDat)
//                // =========================================================
//                var donDat = new DonDat
//                {
//                    MaDon = GenerateId("DD"),
//                    MaKhachhang = request.MaKhachHang,
//                    MaNhanVien = null, // Thoải mái để null chờ hệ thống phân công
//                    DiaChi = request.DiaChiThucHien,
//                    GhiChu = request.GhiChu,
//                    SoNgay = request.ChiTietNgayLamViec.Count,
//                    TongTien = request.TongTien,
//                    NgayDat = DateTime.Now // Lưu chính xác ngày giờ khách bấm đặt
//                };
//                _context.DonDats.Add(donDat);

//                // =========================================================
//                // BƯỚC 2: TẠO THANH TOÁN (Bảng ThanhToan)
//                // =========================================================
//                var thanhToan = new ThanhToan
//                {
//                    MaThanhToan = GenerateId("TT"),
//                    MaDon = donDat.MaDon,
//                    TrangThaiThanhToan = $"{request.PhuongThucThanhToan} - Chờ xác nhận"
//                };
//                _context.ThanhToans.Add(thanhToan);

//                var lichSuTrangThai = new LichSuTrangThaiDon
//                {
//                    MaLichSu = GenerateId("LS"),
//                    MaDon = donDat.MaDon,
//                    TrangThai = "Chờ xác nhận",
//                    ThoiGianCapNhat = DateTime.Now // Ghi nhận thời điểm tạo đơn
//                };
//                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);
//                // =========================================================
//                // BƯỚC 3: XỬ LÝ DỊCH VỤ VÀ NGÀY LÀM VIỆC CHI TIẾT
//                // =========================================================
//                var processedServices = new Dictionary<string, string>();

//                foreach (var day in request.ChiTietNgayLamViec)
//                {
//                    foreach (var svc in day.DichVus)
//                    {
//                        // A. Xử lý Đơn Đặt Dịch Vụ (Bảng DonDatDichVu)
//                        string maDonDatDichVu;

//                        // Kiểm tra nếu dịch vụ này chưa được thêm vào đơn
//                        if (!processedServices.ContainsKey(svc.MaDichVu))
//                        {
//                            maDonDatDichVu = GenerateId("DV");
//                            var donDatDichVu = new DonDatDichVu
//                            {
//                                MaDonDatDichVu = maDonDatDichVu,
//                                MaDon = donDat.MaDon,
//                                MaDichVu = svc.MaDichVu
//                            };
//                            _context.DonDatDichVus.Add(donDatDichVu);

//                            // Lưu vào từ điển để không bị tạo trùng nếu dịch vụ này lặp lại ở ngày khác
//                            processedServices[svc.MaDichVu] = maDonDatDichVu;
//                        }
//                        else
//                        {
//                            maDonDatDichVu = processedServices[svc.MaDichVu];
//                        }

//                        // B. Xử lý Ngày Làm Việc (Bảng NgayLamViec)
//                        var ngayLamViec = new NgayLamViec
//                        {
//                            MaNgayLamViec = GenerateId("NL"),
//                            MaDonDatDichVu = maDonDatDichVu,
//                            MaNguoiGiupViec = null, // Để null chờ xếp lịch
//                            NgayLam = DateOnly.FromDateTime(day.NgayThucHien),
//                            GioBatDau = TimeOnly.Parse(day.GioBatDau), // Lưu giờ bắt đầu thành công!
//                            ThoiGianPhanCong = null,
//                            TrangThai = "Chờ phân công"

//                        };
//                        _context.NgayLamViecs.Add(ngayLamViec);

//                        // C. Xử lý Bảng Nối (DonDatDichVuNgayLamViec)
//                        var chiTiet = new DonDatDichVuNgayLamViec
//                        {
//                            MaDonDatDichVu = maDonDatDichVu,
//                            MaNgayLamViec = ngayLamViec.MaNgayLamViec,
//                            ThoiGianThucHien = svc.ThoiLuong
//                        };
//                        _context.DonDatDichVuNgayLamViecs.Add(chiTiet);
//                    }
//                }

//                // =========================================================
//                // BƯỚC 4: LƯU VÀO DATABASE
//                // =========================================================
//                await _context.SaveChangesAsync();
//                await transaction.CommitAsync();

//                return Ok(new
//                {
//                    success = true,
//                    message = "Tạo đơn đặt thành công!",
//                    maDon = donDat.MaDon
//                });
//            }
//            catch (Exception ex)
//            {
//                // Lỗi bất ngờ -> Hoàn tác toàn bộ!
//                await transaction.RollbackAsync();

//                return StatusCode(500, new
//                {
//                    success = false,
//                    message = "Đã xảy ra lỗi hệ thống khi lưu đơn hàng.",
//                    detail = ex.Message,
//                    inner = ex.InnerException?.Message // Hữu ích để bạn debug nếu gặp lỗi khóa ngoại
//                });
//            }
//        }

//        /// <summary>
//        /// Lấy danh sách đơn đặt dịch vụ của khách hàng với lọc theo trạng thái
//        /// </summary>
//        [HttpGet("GetByCustomer/{maKhachHang}")]
//        public async Task<IActionResult> GetBookingsByCustomer(
//            string maKhachHang,
//            [FromQuery] string? status = null,
//            [FromQuery] int page = 1,
//            [FromQuery] int pageSize = 10)
//        {
//            try
//            {
//                // 1. Kiểm tra khách hàng tồn tại trong bảng NguoiDung
//                var customer = await _context.NguoiDungs.FindAsync(maKhachHang);
//                if (customer == null)
//                {
//                    return NotFound(new { success = false, message = "Khách hàng không tồn tại." });
//                }

//                // 2. Query DonDat và Include các bảng liên quan theo Model
//                var query = _context.DonDats
//                    .Where(d => d.MaKhachhang == maKhachHang)
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dd => dd.MaDichVuNavigation) // Đã đổi thành MaDichVuNavigation theo model của bạn
//                    .AsQueryable();

//                // 3. Lọc theo trạng thái hiện hành (trạng thái có thời gian cập nhật mới nhất)
//                if (!string.IsNullOrEmpty(status) && status != "all")
//                {
//                    query = query.Where(d => d.LichSuTrangThaiDons
//                        .OrderByDescending(l => l.ThoiGianCapNhat)
//                        .FirstOrDefault()!.TrangThai == status);
//                }

//                // 4. Sắp xếp theo ngày đặt (mới nhất lên đầu)
//                query = query.OrderByDescending(d => d.NgayDat);

//                // 5. Phân trang
//                var total = await query.CountAsync();

//                var bookings = await query
//                    .Skip((page - 1) * pageSize)
//                    .Take(pageSize)
//                    .Select(d => new
//                    {
//                        maDon = d.MaDon,

//                        // Nối chuỗi tên dịch vụ thông qua MaDichVuNavigation
//                        tenDichVu = d.DonDatDichVus.Any()
//                            ? string.Join(" + ", d.DonDatDichVus.Select(dd => dd.MaDichVuNavigation.TenDichVu))
//                            : "Chưa xác định dịch vụ",

//                        ngayDat = d.NgayDat,

//                        // Trạng thái mới nhất từ LichSuTrangThaiDon
//                        trangThai = d.LichSuTrangThaiDons
//                            .OrderByDescending(l => l.ThoiGianCapNhat)
//                            .Select(l => l.TrangThai)
//                            .FirstOrDefault() ?? "Đang xử lý",

//                        soTien = d.TongTien,

//                        // Logic hiển thị "Thành tiền"
//                        thanhTien = d.LichSuTrangThaiDons.OrderByDescending(l => l.ThoiGianCapNhat).FirstOrDefault()!.TrangThai == "Đã huỷ"
//                            ? 0
//                            : (d.LichSuTrangThaiDons.OrderByDescending(l => l.ThoiGianCapNhat).FirstOrDefault()!.TrangThai == "Đang xử lý"
//                                ? (decimal?)null
//                                : d.TongTien)
//                    })
//                    .ToListAsync();

//                return Ok(new
//                {
//                    success = true,
//                    data = bookings,
//                    pagination = new
//                    {
//                        page,
//                        pageSize,
//                        total,
//                        totalPages = (int)Math.Ceiling((double)total / pageSize)
//                    }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new
//                {
//                    success = false,
//                    message = "Lỗi khi lấy danh sách lịch sử đơn đặt.",
//                    detail = ex.Message
//                });
//            }
//        }

//        /// Lấy chi tiết một đơn đặt dịch vụ
//        [Authorize]
//        [HttpGet("GetOrderDetail/{maDon}")]
//        public async Task<IActionResult> GetOrderDetail(string maDon)
//        {
//            try
//            {
//                var maKhachHang = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(maKhachHang))
//                {
//                    return Unauthorized(new { success = false, message = "Vui lòng đăng nhập." });
//                }

//                var order = await _context.DonDats
//                    .Where(d => d.MaDon == maDon && d.MaKhachhang == maKhachHang)
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dd => dd.MaDichVuNavigation)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dd => dd.DonDatDichVuNgayLamViecs)
//                            .ThenInclude(tg => tg.MaNgayLamViecNavigation)
//                                .ThenInclude(nl => nl.MaNguoiGiupViecNavigation)
//                    .Include(d => d.DanhGia)
//                    .Include(d => d.ThanhToans)
//                    .FirstOrDefaultAsync();

//                if (order == null)
//                {
//                    return NotFound(new { success = false, message = "Không tìm thấy đơn đặt hoặc bạn không có quyền truy cập." });
//                }

//                // Lấy trạng thái hiện tại
//                var currentStatus = order.LichSuTrangThaiDons
//                    .OrderByDescending(l => l.ThoiGianCapNhat)
//                    .Select(l => l.TrangThai)
//                    .FirstOrDefault() ?? "Chờ xác nhận";

//                var mainService = order.DonDatDichVus.FirstOrDefault()?.MaDichVuNavigation;

//                // Lấy thời gian của tất cả các trạng thái
//                var statusTimes = order.LichSuTrangThaiDons
//                    .Where(l => l.TrangThai != null && l.ThoiGianCapNhat != null)
//                    .GroupBy(l => l.TrangThai)
//                    .ToDictionary(
//                        g => g.Key!,
//                        g => g.OrderByDescending(x => x.ThoiGianCapNhat).First().ThoiGianCapNhat!.Value.ToString("HH:mm dd-MM-yyyy")
//                    );

//                var thanhToanDb = order.ThanhToans.FirstOrDefault();
//                var danhGiaDb = order.DanhGia.FirstOrDefault();

//                var ngayLamViecs = order.DonDatDichVus
//                    .SelectMany(dd => dd.DonDatDichVuNgayLamViecs)
//                    .Where(tg => tg.MaNgayLamViecNavigation != null)
//                    .Select(tg =>
//                    {
//                        var nl = tg.MaNgayLamViecNavigation;
//                        var nguoiGiupViec = nl.MaNguoiGiupViecNavigation;
//                        var thoiGian = tg.ThoiGianThucHien ?? 0;

//                        string gioKetThucStr = "Đang cập nhật";

//                        if (nl.GioBatDau.HasValue && thoiGian > 0)
//                        {
//                            gioKetThucStr = nl.GioBatDau.Value.AddHours(thoiGian).ToString("HH:mm");
//                        }

//                        return new
//                        {
//                            ngay = nl.NgayLam.HasValue ? nl.NgayLam.Value.ToString("yyyy-MM-dd") : null,
//                            gioBatDau = nl.GioBatDau.HasValue ? nl.GioBatDau.Value.ToString("HH:mm") : "00:00",
//                            gioKetThuc = gioKetThucStr,
//                            trangThai = nl.TrangThai ?? "Chờ làm việc",

//                            tenNhanVien = nguoiGiupViec?.HoTen,
//                            sdtNhanVien = nguoiGiupViec?.SoDienThoai
//                        };
//                    })
//                    .OrderBy(nl => nl.ngay)
//                    .ToList();

//                var result = new
//                {
//                    maDon = order.MaDon,
//                    tenDichVu = order.DonDatDichVus.Any()
//                        ? string.Join(" + ", order.DonDatDichVus.Select(dd => dd.MaDichVuNavigation.TenDichVu))
//                        : "Chưa xác định",
//                    moTa = mainService?.MoTa ?? "Không có mô tả",
//                    ngayDat = order.NgayDat,
//                    trangThai = currentStatus, // <-- Trả về chính xác "Đã xác nhận", "Hoàn thành", v.v.
//                    soTien = order.TongTien,
//                    thanhTien = currentStatus == "Hủy đơn" ? 0 : (currentStatus == "Chờ xác nhận" ? (decimal?)null : order.TongTien),
//                    diaChi = order.DiaChi,
//                    soNgay = order.SoNgay ?? 1,
//                    ghiChu = order.GhiChu,

//                    ngayLamViec = ngayLamViecs,

//                    danhGia = danhGiaDb != null ? new
//                    {
//                        soSao = danhGiaDb.SoSao ?? 5,
//                        noiDung = danhGiaDb.NoiDung ?? "Không có"
//                    } : null,

//                    thanhToan = new
//                    {
//                        trangThai = thanhToanDb?.TrangThaiThanhToan ?? "Chưa thanh toán",
//                        phuongThuc = "Thanh toán trực tuyến",
//                        ngayThanhToan = order.NgayDat
//                    },

//                    statusTimes = statusTimes // <-- Các key ở đây cũng là "Chờ xác nhận", v.v.
//                };

//                return Ok(new { success = true, data = result });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Lỗi khi lấy chi tiết đơn.", detail = ex.Message });
//            }
//        }

//        /// <summary>
//        /// Hủy đơn đặt (chỉ được phép nếu đơn đang chờ xác nhận)
//        /// </summary>
//        [HttpPost("Cancel/{maDon}")]
//        public async Task<IActionResult> CancelBooking(string maDon)
//        {
//            using var transaction = await _context.Database.BeginTransactionAsync();

//            try
//            {
//                var booking = await _context.DonDats
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .FirstOrDefaultAsync(d => d.MaDon == maDon);

//                if (booking == null)
//                {
//                    return NotFound(new { message = "Đơn đặt không tồn tại." });
//                }

//                // Kiểm tra trạng thái hiện tại
//                var currentStatus = booking.LichSuTrangThaiDons
//                    .OrderByDescending(l => l.ThoiGianCapNhat)
//                    .FirstOrDefault()?.TrangThai;

//                if (currentStatus != "Chờ xác nhận")
//                {
//                    return BadRequest(new
//                    {
//                        success = false,
//                        message = "Chỉ có thể hủy các đơn đang chờ xác nhận."
//                    });
//                }

//                // Thêm bản ghi lịch sử trạng thái mới
//                var lichSuTrangThai = new LichSuTrangThaiDon
//                {
//                    MaLichSu = GenerateId("LS"),
//                    MaDon = maDon,
//                    TrangThai = "Đã hủy",
//                    ThoiGianCapNhat = DateTime.Now
//                };
//                _context.LichSuTrangThaiDons.Add(lichSuTrangThai);

//                await _context.SaveChangesAsync();
//                await transaction.CommitAsync();

//                return Ok(new
//                {
//                    success = true,
//                    message = "Hủy đơn đặt thành công!"
//                });
//            }
//            catch (Exception ex)
//            {
//                await transaction.RollbackAsync();
//                return StatusCode(500, new
//                {
//                    success = false,
//                    message = "Lỗi khi hủy đơn đặt.",
//                    detail = ex.Message
//                });
//            }
//        }

//        /// <summary>
//        /// Lấy danh sách các trạng thái có sẵn
//        /// </summary>
//        [HttpGet("GetStatuses")]
//        public IActionResult GetStatuses()
//        {
//            var statuses = new[]
//            {
//                new { value = "all", label = "Xem tất cả" },
//                new { value = "Chờ xác nhận", label = "Chờ xác nhận" },
//                new { value = "Đã xác nhận", label = "Đã xác nhận" },
//                new { value = "Đang thực hiện", label = "Đang thực hiện" },
//                new { value = "Hoàn thành", label = "Hoàn thành" },
//                new { value = "Hủy đơn", label = "Hủy đơn" }
//            };

//            return Ok(new
//            {
//                success = true,
//                data = statuses
//            });
//        }
//        [HttpPost("kiemtralichranh")]
//        public async Task<IActionResult> KiemTraLichRanh([FromBody] KiemTraLichRanhRequest request)
//        {
//            if (request.ThoiGianThucHien <= 0)
//                return BadRequest("Thời lượng không hợp lệ.");

//            try
//            {
//                DateOnly targetDate = DateOnly.FromDateTime(request.NgayDat);
//                TimeOnly targetStartTime = TimeOnly.FromTimeSpan(request.ThoiGianBatDau);
//                TimeOnly targetEndTime = targetStartTime.AddHours(request.ThoiGianThucHien);

//                // ==============================================================================
//                // BƯỚC 1: Lấy danh sách NGV có lịch rảnh bao trùm khung giờ này
//                // ==============================================================================
//                var potentialHelpers = await _context.LichRanhs
//                    .Where(lr => lr.Ngay == targetDate)
//                    .Where(lr => lr.LichRanhCaLamViecs.Any(lrc =>
//                        lrc.MaCaLamViecNavigation.GioBatDau <= targetStartTime &&
//                        lrc.MaCaLamViecNavigation.GioKetThuc >= targetEndTime))
//                    .Select(lr => lr.MaNguoiGiupViec)
//                    .Distinct()
//                    .ToListAsync();

//                if (!potentialHelpers.Any())
//                    return Ok(new { isAvailable = false, message = "Rất tiếc, không có nhân viên nào trống lịch vào khung giờ này." });

//                // ==============================================================================
//                // BƯỚC 2: Kiểm tra trùng lịch và tính toán công suất
//                // ==============================================================================
//                var jobsInDay = await _context.NgayLamViecs
//                    .Where(nlv => nlv.NgayLam == targetDate
//                               && (nlv.TrangThai == "Đang hoạt động" || nlv.TrangThai == "Đã phân công" ||
//                                   nlv.TrangThai == "Chờ thực hiện" || nlv.TrangThai == "Chờ phân công" || nlv.TrangThai == "Chưa phân công"))
//                    .Select(nlv => new
//                    {
//                        MaNguoiGiupViec = nlv.MaNguoiGiupViec,
//                        JobStartTime = nlv.GioBatDau,
//                        JobDuration = _context.DonDatDichVuNgayLamViecs
//                                        .Where(d => d.MaNgayLamViec == nlv.MaNgayLamViec)
//                                        .Sum(d => (int?)d.ThoiGianThucHien) ?? 0
//                    })
//                    .ToListAsync();

//                var overlappingJobs = jobsInDay.Where(job =>
//                {
//                    if (job.JobStartTime == null || job.JobDuration <= 0) return false;
//                    TimeOnly jobStart = job.JobStartTime.Value;
//                    TimeOnly jobEnd = jobStart.AddHours(job.JobDuration);
//                    return (jobStart < targetEndTime) && (jobEnd > targetStartTime);
//                }).ToList();

//                // NGV đã kẹt lịch
//                var busyHelpers = overlappingJobs.Where(j => !string.IsNullOrEmpty(j.MaNguoiGiupViec))
//                                                 .Select(j => j.MaNguoiGiupViec).Distinct().ToList();

//                // Đơn đang treo chờ phân công
//                var overlappingPendingJobsCount = overlappingJobs.Count(j => string.IsNullOrEmpty(j.MaNguoiGiupViec));

//                // Lấy ra danh sách NHỮNG NGƯỜI THỰC SỰ RẢNH
//                var actuallyFreeHelpers = potentialHelpers.Except(busyHelpers).ToList();

//                if (actuallyFreeHelpers.Count <= overlappingPendingJobsCount)
//                    return Ok(new { isAvailable = false, message = "Rất tiếc, khung giờ này đang có nhiều người đặt và đã hết nhân sự trống." });

//                // ==============================================================================
//                // BƯỚC 3: Xử lý logic 1 Dịch Vụ -> 1 Kỹ Năng
//                // ==============================================================================
//                if (request.DanhSachMaDichVu != null && request.DanhSachMaDichVu.Any())
//                {
//                    // 3.1 Truy vấn DB lấy thông tin Dịch vụ khách đặt kèm Mã Kỹ Năng tương ứng
//                    var dichVusYeuCau = await _context.DichVus
//                        .Where(dv => request.DanhSachMaDichVu.Contains(dv.MaDichVu))
//                        .Select(dv => new { dv.MaDichVu, dv.TenDichVu, dv.MaKyNang })
//                        .ToListAsync();

//                    var requiredSkillIds = dichVusYeuCau
//                        .Where(dv => !string.IsNullOrEmpty(dv.MaKyNang))
//                        .Select(dv => dv.MaKyNang)
//                        .Distinct()
//                        .ToList();

//                    // 3.2 Lấy hồ sơ (kèm kỹ năng) của những NGV ĐANG RẢNH
//                    var hoSoRanh = await _context.HoSoNguoiGiupViecs
//                        .Include(hs => hs.KyNangNguoiGiupViecs)
//                        .Where(hs => actuallyFreeHelpers.Contains(hs.MaNguoiGiupViec))
//                        .ToListAsync();

//                    bool hasPerfectHelper = false;

//                    // 3.3 Tìm xem có NGV rảnh nào sở hữu ĐỦ tất cả kỹ năng yêu cầu không
//                    foreach (var hs in hoSoRanh)
//                    {
//                        var helperSkills = hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang).ToList();

//                        bool canDoEverything = requiredSkillIds.All(req => helperSkills.Contains(req));

//                        if (canDoEverything)
//                        {
//                            hasPerfectHelper = true;
//                            break;
//                        }
//                    }

//                    // ==============================================================================
//                    // BƯỚC 4: Báo lỗi chính xác TÊN DỊCH VỤ nếu thiếu nhân sự có chuyên môn
//                    // ==============================================================================
//                    if (!hasPerfectHelper)
//                    {
//                        // Gom tất cả kỹ năng mà đội ngũ rảnh rỗi hiện có
//                        var allSkillsFromFreeHelpers = hoSoRanh
//                            .SelectMany(hs => hs.KyNangNguoiGiupViecs.Select(k => k.MaKyNang))
//                            .Distinct()
//                            .ToList();

//                        // Tìm ra Mã Kỹ Năng nào khách cần mà NGV rảnh KHÔNG CÓ
//                        var missingSkillIds = requiredSkillIds.Except(allSkillsFromFreeHelpers).ToList();

//                        if (missingSkillIds.Any())
//                        {
//                            // Map từ Mã Kỹ Năng thiếu ngược ra Tên Dịch Vụ
//                            var missingServiceNames = dichVusYeuCau
//                                .Where(dv => missingSkillIds.Contains(dv.MaKyNang))
//                                .Select(dv => dv.TenDichVu)
//                                .ToList();

//                            string names = string.Join(", ", missingServiceNames);
//                            return Ok(new
//                            {
//                                isAvailable = false,
//                                message = $"Có nhân viên rảnh, nhưng hệ thống đang thiếu nhân sự có chuyên môn để nhận gói: {names}. Vui lòng chọn giờ khác."
//                            });
//                        }
//                        else
//                        {
//                            // Trường hợp éo le: Các nhân viên rảnh gộp lại thì đủ kỹ năng, nhưng KHÔNG CÓ AI sở hữu TẤT CẢ cùng lúc
//                            return Ok(new
//                            {
//                                isAvailable = false,
//                                message = "Có nhân viên rảnh, nhưng không có cá nhân nào sở hữu CÙNG LÚC tất cả kỹ năng để nhận trọn gói đơn hàng này. Vui lòng tách đơn."
//                            });
//                        }
//                    }
//                }

//                return Ok(new { isAvailable = true, message = "Có nhân viên rảnh và đáp ứng đủ kỹ năng." });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, "Lỗi server khi xử lý kiểm tra lịch rảnh: " + ex.Message);
//            }
//        }
//    }


//    // =========================================================================
//    // DTOs: Các Class hứng dữ liệu JSON từ Frontend Next.js
//    // =========================================================================
//    public class BookingRequestDto
//    {
//        public string MaKhachHang { get; set; } = null!;
//        public string DiaChiThucHien { get; set; } = string.Empty;
//        public string GhiChu { get; set; } = string.Empty;
//        public decimal TongTien { get; set; }
//        public string PhuongThucThanhToan { get; set; } = string.Empty;
//        public string MaGiaoDich { get; set; } = string.Empty;
//        public List<DayOrderDto> ChiTietNgayLamViec { get; set; } = new();
//    }

//    public class DayOrderDto
//    {
//        public DateTime NgayThucHien { get; set; }
//        public string GioBatDau { get; set; } = string.Empty; // Sẽ tự động parse sang TimeOnly
//        public List<ServiceOrderDto> DichVus { get; set; } = new();
//    }

//    public class ServiceOrderDto
//    {
//        public string MaDichVu { get; set; } = null!;
//        public int ThoiLuong { get; set; }
//        public decimal ThanhTien { get; set; }
//    }
//    //DTO kiểm tra lịch rãnh
//    // DTO nhận dữ liệu từ React gửi lên
//    public class KiemTraLichRanhRequest
//    {
//        public DateTime NgayDat { get; set; }
//        public TimeSpan ThoiGianBatDau { get; set; }
//        public int ThoiGianThucHien { get; set; }
//        public List<string> DanhSachMaDichVu { get; set; } // Sửa tên biến này cho chuẩn nghiệp vụ
//    }
//}