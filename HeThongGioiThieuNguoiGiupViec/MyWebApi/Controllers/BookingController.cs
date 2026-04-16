using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyWebApi.Models; // Thay bằng namespace chứa các file Model của bạn

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // TODO: Đổi 'YourDbContext' thành tên DbContext của bạn

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
            // 1. Kiểm tra dữ liệu đầu vào
            if (request == null || request.ChiTietNgayLamViec == null || !request.ChiTietNgayLamViec.Any())
            {
                return BadRequest(new { message = "Dữ liệu đặt lịch không hợp lệ hoặc bị trống." });
            }

            // 2. Bắt đầu Transaction để đảm bảo an toàn dữ liệu
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // =========================================================
                // BƯỚC 1: TẠO ĐƠN ĐẶT (Bảng DonDat)
                // =========================================================
                var donDat = new DonDat
                {
                    MaDon = GenerateId("DD"),
                    MaKhachhang = request.MaKhachHang,
                    MaNhanVien = null, // Thoải mái để null chờ hệ thống phân công
                    DiaChi = request.DiaChiThucHien,
                    GhiChu = request.GhiChu,
                    SoNgay = request.ChiTietNgayLamViec.Count,
                    TongTien = request.TongTien,
                    NgayDat = DateTime.Now // Lưu chính xác ngày giờ khách bấm đặt
                };
                _context.DonDats.Add(donDat);

                // =========================================================
                // BƯỚC 2: TẠO THANH TOÁN (Bảng ThanhToan)
                // =========================================================
                var thanhToan = new ThanhToan
                {
                    MaThanhToan = GenerateId("TT"),
                    MaDon = donDat.MaDon,
                    TrangThaiThanhToan = $"{request.PhuongThucThanhToan} - Chờ xác nhận"
                };
                _context.ThanhToans.Add(thanhToan);

                // =========================================================
                // BƯỚC 3: XỬ LÝ DỊCH VỤ VÀ NGÀY LÀM VIỆC CHI TIẾT
                // =========================================================
                var processedServices = new Dictionary<string, string>();

                foreach (var day in request.ChiTietNgayLamViec)
                {
                    foreach (var svc in day.DichVus)
                    {
                        // A. Xử lý Đơn Đặt Dịch Vụ (Bảng DonDatDichVu)
                        string maDonDatDichVu;

                        // Kiểm tra nếu dịch vụ này chưa được thêm vào đơn
                        if (!processedServices.ContainsKey(svc.MaDichVu))
                        {
                            maDonDatDichVu = GenerateId("DV");
                            var donDatDichVu = new DonDatDichVu
                            {
                                MaDonDatDichVu = maDonDatDichVu,
                                MaDon = donDat.MaDon,
                                MaDichVu = svc.MaDichVu
                            };
                            _context.DonDatDichVus.Add(donDatDichVu);

                            // Lưu vào từ điển để không bị tạo trùng nếu dịch vụ này lặp lại ở ngày khác
                            processedServices[svc.MaDichVu] = maDonDatDichVu;
                        }
                        else
                        {
                            maDonDatDichVu = processedServices[svc.MaDichVu];
                        }

                        // B. Xử lý Ngày Làm Việc (Bảng NgayLamViec)
                        var ngayLamViec = new NgayLamViec
                        {
                            MaNgayLamViec = GenerateId("NL"),
                            MaDonDatDichVu = maDonDatDichVu,
                            MaNguoiGiupViec = null, // Để null chờ xếp lịch
                            NgayLam = DateOnly.FromDateTime(day.NgayThucHien),
                            GioBatDau = TimeOnly.Parse(day.GioBatDau) // Lưu giờ bắt đầu thành công!
                        };
                        _context.NgayLamViecs.Add(ngayLamViec);

                        // C. Xử lý Bảng Nối (DonDatDichVuNgayLamViec)
                        var chiTiet = new DonDatDichVuNgayLamViec
                        {
                            MaDonDatDichVu = maDonDatDichVu,
                            MaNgayLamViec = ngayLamViec.MaNgayLamViec,
                            ThoiGianThucHien = svc.ThoiLuong
                        };
                        _context.DonDatDichVuNgayLamViecs.Add(chiTiet);
                    }
                }

                // =========================================================
                // BƯỚC 4: LƯU VÀO DATABASE
                // =========================================================
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
                // Lỗi bất ngờ -> Hoàn tác toàn bộ!
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi hệ thống khi lưu đơn hàng.",
                    detail = ex.Message,
                    inner = ex.InnerException?.Message // Hữu ích để bạn debug nếu gặp lỗi khóa ngoại
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
        public string GioBatDau { get; set; } = string.Empty; // Sẽ tự động parse sang TimeOnly
        public List<ServiceOrderDto> DichVus { get; set; } = new();
    }

    public class ServiceOrderDto
    {
        public string MaDichVu { get; set; } = null!;
        public int ThoiLuong { get; set; }
        public decimal ThanhTien { get; set; }
    }
}