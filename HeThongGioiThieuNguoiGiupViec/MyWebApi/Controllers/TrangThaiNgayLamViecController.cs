using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;
using MyWebApi.Extensions;


namespace MyWebApi.Controllers
{

    [Route("api")]
    public class TrangThaiNgayLamViecController : ControllerBase
    {

        private readonly ApplicationDbContext _context;

        public TrangThaiNgayLamViecController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("job/{maNgayLamViec}/status")]
        public async Task<IActionResult> UpdateJobStatus(string maNgayLamViec, [FromBody] CapNhatTrangThaiDTO request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userRole))
                return Unauthorized();

            var job = await _context.NgayLamViecs
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDonNavigation)
                        .ThenInclude(m => m.LichSuTrangThaiDons)
                .Include(n => n.MaDonDatDichVuNavigation)
                    .ThenInclude(d => d.MaDichVuNavigation)
                .FirstOrDefaultAsync(n => n.MaNgayLamViec == maNgayLamViec);

            if (job == null)
                return NotFound(new { message = "Không tìm thấy công việc hợp lệ." });

            // ==============================================================
            // 1. PHÂN QUYỀN THEO VAI TRÒ
            // ==============================================================
            bool isAdminOrStaff = userRole == "Admin" || userRole == "Staff";
            bool isMaid = userRole == "Maid" && job.MaNguoiGiupViec == userId;
            bool isCustomer = userRole == "Customer" && job.MaDonDatDichVuNavigation.MaDonNavigation.MaKhachhang == userId;

            if (!isAdminOrStaff && !isMaid && !isCustomer)
            {
                return StatusCode(403, new { message = "Bạn không có quyền cập nhật ca làm việc này." });
            }

            // ==============================================================
            // 2. LOGIC KIỂM SOÁT THAO TÁC THEO TỪNG VAI TRÒ
            // ==============================================================
            if (request.TrangThai == "Không đến làm")
            {
                if (job.TrangThai == "Đang làm việc" || job.TrangThai == "Hoàn thành")
                {
                    return BadRequest(new { message = "Người giúp việc đã bắt đầu hoặc hoàn thành ca làm, không thể đánh dấu vắng mặt." });
                }

                if (!isAdminOrStaff && job.NgayLam.HasValue && job.GioBatDau.HasValue)
                {
                    DateTime expectedStartTime = job.NgayLam.Value.ToDateTime(job.GioBatDau.Value);

                    if (DateTime.Now <= expectedStartTime.AddMinutes(15))
                    {
                        return BadRequest(new { message = "Chỉ được đánh dấu 'Không đến làm' sau khi đã quá thời gian bắt đầu 15 phút." });
                    }
                }
            }
            else if (isCustomer)
            {
                return StatusCode(403, new { message = "Khách hàng chỉ được phép cập nhật trạng thái 'Không đến làm'." });
            }

            // ==============================================================
            // 3. KIỂM TRA TRẠNG THÁI TỔNG THỂ CỦA ĐƠN ĐẶT
            // ==============================================================
            var currentOrderStatus = job.MaDonDatDichVuNavigation.MaDonNavigation.LichSuTrangThaiDons
                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                .Select(ls => ls.TrangThai)
                .FirstOrDefault();

            if (currentOrderStatus != "Đã xác nhận" && currentOrderStatus != "Đang thực hiện")
            {
                return BadRequest(new { message = $"Không thể cập nhật công việc vì đơn hàng đang ở trạng thái: {currentOrderStatus}" });
            }

            // ==============================================================
            // 4. CẬP NHẬT TRẠNG THÁI CA LÀM & CÁC BẢNG LIÊN QUAN
            // ==============================================================
            job.TrangThai = request.TrangThai;

            if (request.TrangThai == "Hoàn thành")
            {
                bool isIncomeCreated = await _context.ThuNhapNguoiGiupViecs
                    .AnyAsync(t => t.MaNgayLamViec == maNgayLamViec);

                if (!isIncomeCreated)
                {
                    decimal giaTheoGio = job.MaDonDatDichVuNavigation?.MaDichVuNavigation?.GiaTheoGio ?? 0m;
                    decimal thoiLuong = (decimal)(job.ThoiLuongThucHien ?? 0);
                    decimal tinhTienThuNhap = giaTheoGio * thoiLuong * 0.6m;

                    var thuNhap = new ThuNhapNguoiGiupViec
                    {
                        MaThuNhap = await _context.GenerateIdAsync("ThuNhapNguoiGiupViec", "MaThuNhap", "TN"),
                        MaNgayLamViec = maNgayLamViec,
                        TrangThai = "Chờ xác nhận",
                        SoTien = tinhTienThuNhap,
                        ThoiGianTao = DateTime.Now
                    };

                    _context.ThuNhapNguoiGiupViecs.Add(thuNhap);
                }
            }
            // ---> LOGIC TỰ ĐỘNG TẠO KHIẾU NẠI <---
            else if (request.TrangThai == "Không đến làm")
            {
                // Sử dụng luôn tham số maNgayLamViec của hàm, không khai báo lại
                string maKhachHang = job.MaDonDatDichVuNavigation.MaDonNavigation.MaKhachhang;

                // Kiểm tra xem đã tạo khiếu nại cho ngày làm việc này chưa
                bool daTaoKhieuNai = await _context.KhieuNais
                    .AnyAsync(k => k.MaNgayLamViec == maNgayLamViec && k.NoiDung == "Người giúp việc không đến làm");

                if (!daTaoKhieuNai)
                {
                    var khieuNai = new KhieuNai
                    {
                        MaKhieuNai = await _context.GenerateIdAsync("KhieuNai", "MaKhieuNai", "KN"),
                        MaNgayLamViec = maNgayLamViec, // Dùng biến từ parameter
                        MaKhachHang = maKhachHang,
                        NoiDung = "Người giúp việc không đến làm",
                        ThoiGian = DateTime.Now,
                        TrangThai = "Chờ xử lý"
                    };

                    _context.KhieuNais.Add(khieuNai);
                }
            }

            await _context.SaveChangesAsync();

            // ==============================================================
            // 5. ĐỒNG BỘ TRẠNG THÁI ĐƠN HÀNG TỔNG
            // ==============================================================
            string maDonDat = job.MaDonDatDichVuNavigation.MaDonNavigation.MaDon;
            await SyncOrderStatusAsync(maDonDat);

            return Ok(new { message = "Cập nhật trạng thái thành công!" });
        }

        private async Task SyncOrderStatusAsync(string maDon)
        {
            // 1. Lấy trạng thái hiện tại của đơn đặt
            var lastHistory = await _context.LichSuTrangThaiDons
                .Where(ls => ls.MaDon == maDon)
                .OrderByDescending(ls => ls.ThoiGianCapNhat)
                .FirstOrDefaultAsync();

            string currentStatus = lastHistory?.TrangThai ?? "";

            // Bỏ qua nếu đơn đã bị hủy từ trước 
            if (currentStatus == "Hủy đơn") return;

            // 2. Lấy tất cả Ngày Làm Việc của đơn
            var allNgayLamViecs = await _context.DonDatDichVus
                .Where(dd => dd.MaDon == maDon)
                .SelectMany(dd => dd.NgayLamViecs)
                .ToListAsync();

            if (!allNgayLamViecs.Any()) return;

            string newStatus = currentStatus;

            // 3. CHUẨN BỊ CÁC ĐIỀU KIỆN (Dựa trên 5 quy tắc)

            // Quy tắc 1: Có ít nhất 1 ca "Không đến làm"
            bool hasKhongDenLam = allNgayLamViecs.Any(nl => nl.TrangThai == "Không đến làm");

            // Quy tắc 2: Có ít nhất 1 ca "Đang làm việc"
            bool hasDangLamViec = allNgayLamViecs.Any(nl => nl.TrangThai == "Đang làm việc");

            // Quy tắc 4: Tất cả đều "Hủy lịch"
            bool allHuyLich = allNgayLamViecs.All(nl => nl.TrangThai == "Hủy lịch");

            // Quy tắc 3 & 5 (Gộp chung): Có ít nhất 1 ca "Hoàn thành" VÀ các ca còn lại chỉ là "Hoàn thành" hoặc "Hủy lịch"
            bool hasHoanThanh = allNgayLamViecs.Any(nl => nl.TrangThai == "Hoàn thành");
            bool onlyHoanThanhAndHuyLich = allNgayLamViecs.All(nl => nl.TrangThai == "Hoàn thành" || nl.TrangThai == "Hủy lịch");

            // 4. ÁP DỤNG THỨ TỰ ƯU TIÊN (Từ cao xuống thấp)
            if (hasKhongDenLam)
            {
                // Ưu tiên 1: Có sự cố
                newStatus = "Có sự cố";
            }
            else if (hasDangLamViec)
            {
                // Ưu tiên 2: Đang thực hiện
                newStatus = "Đang thực hiện";
            }
            else if (hasHoanThanh && onlyHoanThanhAndHuyLich)
            {
                // Ưu tiên 3: Hoàn thành 
                newStatus = "Hoàn thành";
            }
            else if (allHuyLich)
            {
                // Ưu tiên 4: Hủy đơn
                newStatus = "Hủy đơn";
            }
            else if (hasHoanThanh)
            {
                // [TÙY CHỌN BỔ SUNG] 
                // Nếu có 1 ca "Hoàn thành", nhưng ca của ngày hôm sau vẫn đang "Chờ phân công" hoặc "Đã phân công"
                // Theo luật của bạn nó sẽ rớt xuống đây. Gán thành "Đang thực hiện" để thể hiện đơn đang chạy dở dang.
                newStatus = "Đang thực hiện";
            }

            // ==============================================================
            // 5. NẾU THAY ĐỔI TRẠNG THÁI -> GHI LỊCH SỬ MỚI
            // ==============================================================
            if (newStatus != currentStatus)
            {
                var newHistory = new LichSuTrangThaiDon
                {
                    MaLichSu = await _context.GenerateIdAsync("LichSuTrangThaiDon", "MaLichSu", "LS"),
                    MaDon = maDon,
                    TrangThai = newStatus,
                    ThoiGianCapNhat = DateTime.Now
                };

                _context.LichSuTrangThaiDons.Add(newHistory);
                await _context.SaveChangesAsync();
            }
        }
    }
    public class CapNhatTrangThaiDTO
    {
        public string TrangThai { get; set; } = null!;
    }
}
