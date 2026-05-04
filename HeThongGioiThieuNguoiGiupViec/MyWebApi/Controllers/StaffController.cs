//using System.Security.Claims;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using MyWebApi.DTO.Request.Staff;
//using MyWebApi.Models;

//namespace MyWebApi.Controllers
//{
//    [Route("api/v1/staff")]
//    [ApiController]
//    [Authorize(Roles = "Staff")]
//    public class StaffController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public StaffController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        // =============================================
//        // 1. HO SO NGUOI GIUP VIEC
//        // =============================================

//        // GET /api/v1/staff/ho-so-cho-duyet
//        [HttpGet("ho-so-cho-duyet")]
//        public async Task<IActionResult> GetHoSoChoDuyet()
//        {
//            try
//            {
//                var danhSach = await _context.HoSoNguoiGiupViecs
//                    .Where(hs => hs.TrangThaiXacMinh == "Chờ duyệt")
//                    .Include(hs => hs.MaNguoiGiupViecNavigation)
//                    .Select(hs => new
//                    {
//                        maHoSo       = hs.MaHoSo,
//                        maNguoiGiupViec = hs.MaNguoiGiupViec,
//                        hoTen        = hs.MaNguoiGiupViecNavigation.HoTen,
//                        email        = hs.MaNguoiGiupViecNavigation.Email,
//                        soDienThoai  = hs.MaNguoiGiupViecNavigation.SoDienThoai,
//                        gioiTinh     = hs.GioiTinh,
//                        ngaySinh     = hs.NgaySinh,
//                        kinhNghiem   = hs.KinhNghiem,
//                        trangThai    = hs.TrangThaiXacMinh
//                    })
//                    .ToListAsync();

//                return Ok(new { success = true, message = "Lay danh sach ho so cho duyet thanh cong.", data = danhSach });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // GET /api/v1/staff/chi-tiet-ho-so/{id}
//        [HttpGet("chi-tiet-ho-so/{id}")]
//        public async Task<IActionResult> GetChiTietHoSo(string id)
//        {
//            try
//            {
//                var hoSo = await _context.HoSoNguoiGiupViecs
//                    .Include(hs => hs.MaNguoiGiupViecNavigation)
//                    .Include(hs => hs.KyNangNguoiGiupViecs)
//                        .ThenInclude(kn => kn.MaKyNangNavigation)
//                    .Where(hs => hs.MaHoSo == id)
//                    .Select(hs => new
//                    {
//                        maHoSo                  = hs.MaHoSo,
//                        maNguoiGiupViec         = hs.MaNguoiGiupViec,
//                        hoTen                   = hs.MaNguoiGiupViecNavigation.HoTen,
//                        email                   = hs.MaNguoiGiupViecNavigation.Email,
//                        soDienThoai             = hs.MaNguoiGiupViecNavigation.SoDienThoai,
//                        diaChi                  = hs.MaNguoiGiupViecNavigation.DiaChi,
//                        soCccd                  = hs.SoCccd,
//                        ngaySinh                = hs.NgaySinh,
//                        gioiTinh                = hs.GioiTinh,
//                        kinhNghiem              = hs.KinhNghiem,
//                        moTaChiTietKinhNghiem   = hs.MoTaChiTietKinhNghiem,
//                        tenNguoiThan            = hs.TenNguoiThan,
//                        sdtNguoiThan            = hs.SdtnguoiThan,
//                        anhCccdmatTruoc         = hs.AnhCccdmatTruoc,
//                        anhCccdmatSau           = hs.AnhCccdmatSau,
//                        anhChanDung             = hs.AnhChanDung,
//                        giayXacNhanCuTru        = hs.GiayXacNhanCuTru,
//                        trangThai               = hs.TrangThaiXacMinh,
//                        lyDoTuChoi              = hs.LyDoTuChoi,
//                        danhSachKyNang          = hs.KyNangNguoiGiupViecs
//                            .Select(kn => new { id = kn.MaKyNang, ten = kn.MaKyNangNavigation.TenKyNang })
//                            .ToList()
//                    })
//                    .FirstOrDefaultAsync();

//                if (hoSo == null)
//                    return NotFound(new { success = false, message = "Khong tim thay ho so." });

//                return Ok(new { success = true, data = hoSo });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // POST /api/v1/staff/duyet-ho-so
//        [HttpPost("duyet-ho-so")]
//        public async Task<IActionResult> DuyetHoSo([FromBody] DuyetHoSoRequest request)
//        {
//            try
//            {
//                var hoSo = await _context.HoSoNguoiGiupViecs.FindAsync(request.MaHoSo);
//                if (hoSo == null)
//                    return NotFound(new { success = false, message = "Khong tim thay ho so." });

//                if (hoSo.TrangThaiXacMinh != "Chờ duyệt")
//                    return BadRequest(new { success = false, message = "Ho so nay da duoc xu ly truoc do." });

//                hoSo.TrangThaiXacMinh = "Đã duyệt";
//                hoSo.LyDoTuChoi = null;
//                _context.HoSoNguoiGiupViecs.Update(hoSo);
//                await _context.SaveChangesAsync();

//                return Ok(new { success = true, message = "Duyet ho so thanh cong." });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // POST /api/v1/staff/tu-choi-ho-so
//        [HttpPost("tu-choi-ho-so")]
//        public async Task<IActionResult> TuChoiHoSo([FromBody] TuChoiHoSoRequest request)
//        {
//            if (string.IsNullOrWhiteSpace(request.LyDoTuChoi))
//                return BadRequest(new { success = false, message = "Ly do tu choi la bat buoc." });

//            try
//            {
//                var hoSo = await _context.HoSoNguoiGiupViecs.FindAsync(request.MaHoSo);
//                if (hoSo == null)
//                    return NotFound(new { success = false, message = "Khong tim thay ho so." });

//                if (hoSo.TrangThaiXacMinh != "Chờ duyệt")
//                    return BadRequest(new { success = false, message = "Ho so nay da duoc xu ly truoc do." });

//                hoSo.TrangThaiXacMinh = "Từ chối";
//                hoSo.LyDoTuChoi = request.LyDoTuChoi;
//                _context.HoSoNguoiGiupViecs.Update(hoSo);
//                await _context.SaveChangesAsync();

//                return Ok(new { success = true, message = "Tu choi ho so thanh cong." });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // 2. YEU CAU DAT DICH VU
//        // =============================================

//        // GET /api/v1/staff/danh-sach-yeu-cau?status=
//        [HttpGet("danh-sach-yeu-cau")]
//        public async Task<IActionResult> GetDanhSachYeuCau([FromQuery] string? status = null)
//        {
//            try
//            {
//                var query = _context.DonDats
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .Include(d => d.MaKhachhangNavigation)
//                    .AsQueryable();

//                var danhSach = await query
//                    .Select(d => new
//                    {
//                        maDon           = d.MaDon,
//                        maKhachHang     = d.MaKhachhang,
//                        hoTenKhachHang  = d.MaKhachhangNavigation.HoTen,
//                        soDienThoai     = d.MaKhachhangNavigation.SoDienThoai,
//                        diaChi          = d.DiaChi,
//                        soNgay          = d.SoNgay,
//                        tongTien        = d.TongTien,
//                        ngayDat         = d.NgayDat,
//                        ghiChu          = d.GhiChu,
//                        trangThaiHienTai = d.LichSuTrangThaiDons
//                            .OrderByDescending(l => l.ThoiGianCapNhat)
//                            .FirstOrDefault()!.TrangThai
//                    })
//                    .ToListAsync();

//                // Loc theo status neu co
//                var validStatuses = new[] 
//                    { 
//                        "Chờ xác nhận", 
//                        "Đã xác nhận", 
//                        "Đang thực hiện", 
//                        "Hoàn thành", 
//                        "Có sự cố", 
//                        "Hủy đơn" 
//                    };
//                if (!string.IsNullOrEmpty(status))
//                {
//                    danhSach = danhSach
//                        .Where(d => d.trangThaiHienTai == status)
//                        .ToList();
//                }

//                return Ok(new { success = true, message = "Lay danh sach yeu cau thanh cong.", data = danhSach });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // GET /api/v1/staff/chi-tiet-yeu-cau/{id}
//        [HttpGet("chi-tiet-yeu-cau/{id}")]
//        public async Task<IActionResult> GetChiTietYeuCau(string id)
//        {
//            try
//            {
//                var don = await _context.DonDats
//                    .Include(d => d.MaKhachhangNavigation)
//                    .Include(d => d.MaNhanVienNavigation)
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dv => dv.MaDichVuNavigation)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dv => dv.NgayLamViecs)
//                    .Include(d => d.ThanhToans)
//                    .FirstOrDefaultAsync(d => d.MaDon == id);

//                if (don == null)
//                    return NotFound(new { success = false, message = "Khong tim thay yeu cau." });

//                var result = new
//                {
//                    maDon = don.MaDon,
//                    diaChi = don.DiaChi,
//                    soNgay = don.SoNgay,
//                    tongTien = don.TongTien,
//                    ngayDat = don.NgayDat,
//                    ghiChu = don.GhiChu,
//                    trangThaiHienTai = don.LichSuTrangThaiDons
//                        .OrderByDescending(l => l.ThoiGianCapNhat)
//                        .FirstOrDefault()?.TrangThai,
//                    lichSuTrangThai = don.LichSuTrangThaiDons
//                        .OrderByDescending(l => l.ThoiGianCapNhat)
//                        .Select(l => new { l.TrangThai, l.ThoiGianCapNhat })
//                        .ToList(),
//                    khachHang = new
//                    {
//                        ma       = don.MaKhachhang,
//                        hoTen    = don.MaKhachhangNavigation.HoTen,
//                        email    = don.MaKhachhangNavigation.Email,
//                        sdtKhach = don.MaKhachhangNavigation.SoDienThoai
//                    },
//                    nhanVien = don.MaNhanVienNavigation == null ? null : new
//                    {
//                        ma    = don.MaNhanVien,
//                        hoTen = don.MaNhanVienNavigation.HoTen
//                    },
//                    dichVus = don.DonDatDichVus.Select(dv => new
//                    {
//                        maDonDatDichVu = dv.MaDonDatDichVu,
//                        maDichVu       = dv.MaDichVu,
//                        tenDichVu      = dv.MaDichVuNavigation.TenDichVu,
//                        ngayLamViecs   = dv.NgayLamViecs.Select(nlv => new
//                        {
//                            maNgayLamViec  = nlv.MaNgayLamViec,
//                            ngayLam        = nlv.NgayLam,
//                            gioBatDau      = nlv.GioBatDau,
//                            trangThai      = nlv.TrangThai,
//                            maNguoiGiupViec = nlv.MaNguoiGiupViec
//                        }).ToList()
//                    }).ToList(),
//                    thanhToan = don.ThanhToans.Select(tt => new
//                    {
//                        tt.MaThanhToan,
//                        tt.TrangThaiThanhToan
//                    }).FirstOrDefault()
//                };

//                return Ok(new { success = true, data = result });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // 3. PHAN CONG CONG VIEC
//        // =============================================

//        // POST /api/v1/staff/phan-cong-cong-viec
//        [HttpPost("phan-cong-cong-viec")]
//        public async Task<IActionResult> PhanCongCongViec([FromBody] PhanCongCongViecRequest request)
//        {
//            using var transaction = await _context.Database.BeginTransactionAsync();
//            try
//            {
//                var don = await _context.DonDats
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .Include(d => d.DonDatDichVus)
//                        .ThenInclude(dv => dv.NgayLamViecs)
//                    .FirstOrDefaultAsync(d => d.MaDon == request.MaDon);

//                if (don == null)
//                    return NotFound(new { success = false, message = "Khong tim thay don dat." });
//                var currentStatus = don.LichSuTrangThaiDons
//                    .OrderByDescending(l => l.ThoiGianCapNhat)
//                    .FirstOrDefault()?.TrangThai;

//                if (currentStatus != "Chờ xác nhận")
//                {
//                    return BadRequest(new { 
//                        success = false, 
//                        message = $"Đơn đang ở trạng thái '{currentStatus}', không thể phân công." 
//                    });
//                }

//                // Kiem tra nguoi giup viec ton tai
//                var nguoiGiupViec = await _context.NguoiDungs.FindAsync(request.MaNguoiGiupViec);
//                if (nguoiGiupViec == null)
//                    return NotFound(new { success = false, message = "Khong tim thay nguoi giup viec." });

//                // Cap nhat MaNguoiGiupViec cho tat ca NgayLamViec cua don
//                foreach (var dv in don.DonDatDichVus)
//                {
//                    foreach (var nlv in dv.NgayLamViecs)
//                    {
//                        nlv.MaNguoiGiupViec = request.MaNguoiGiupViec;
//                        nlv.TrangThai = "Đã phân công";
//                        nlv.ThoiGianPhanCong = DateTime.Now;
//                    }
//                }

//                // Ghi lich su trang thai moi
//                string maLichSu = await GenerateMaLichSuAsync();
//                var lichSu = new LichSuTrangThaiDon
//                {
//                    MaLichSu = maLichSu,
//                    MaDon = don.MaDon,
//                    TrangThai = "Đã xác nhận",
//                    ThoiGianCapNhat = DateTime.Now
//                };
//                _context.LichSuTrangThaiDons.Add(lichSu);

//                await _context.SaveChangesAsync();
//                await transaction.CommitAsync();

//                return Ok(new { success = true, message = "Phan cong cong viec thanh cong." });
//            }
//            catch (Exception ex)
//            {
//                await transaction.RollbackAsync();
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // 4. TU CHOI YEU CAU
//        // =============================================

//        // POST /api/v1/staff/tu-choi-yeu-cau
//        [HttpPost("tu-choi-yeu-cau")]
//        public async Task<IActionResult> TuChoiYeuCau([FromBody] TuChoiYeuCauRequest request)
//        {
//            if (string.IsNullOrWhiteSpace(request.LyDoTuChoi))
//                return BadRequest(new { success = false, message = "Ly do tu choi la bat buoc." });

//            using var transaction = await _context.Database.BeginTransactionAsync();
//            try
//            {
//                var don = await _context.DonDats
//                    .Include(d => d.LichSuTrangThaiDons)
//                    .FirstOrDefaultAsync(d => d.MaDon == request.MaDon);

//                if (don == null)
//                    return NotFound(new { success = false, message = "Khong tim thay don dat." });

//                var currentStatus = don.LichSuTrangThaiDons
//                    .OrderByDescending(l => l.ThoiGianCapNhat)
//                    .FirstOrDefault()?.TrangThai;

//                if (currentStatus != "Chờ xác nhận")
//                    return BadRequest(new { success = false, message = $"Don dang o trang thai '{currentStatus}', khong the tu choi." });

//                string maLichSu = await GenerateMaLichSuAsync();
//                var lichSu = new LichSuTrangThaiDon
//                {
//                    MaLichSu = maLichSu,
//                    MaDon = don.MaDon,
//                    TrangThai = "Hủy đơn",
//                    ThoiGianCapNhat = DateTime.Now
//                };
//                _context.LichSuTrangThaiDons.Add(lichSu);

//                await _context.SaveChangesAsync();
//                await transaction.CommitAsync();

//                return Ok(new { 
//                    success = true, 
//                    message = "Từ chối yêu cầu thành công",
//                    lyDo = request.LyDoTuChoi
//                });
//            }
//            catch (Exception ex)
//            {
//                await transaction.RollbackAsync();
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // 5. KHIEU NAI
//        // =============================================

//        // GET /api/v1/staff/danh-sach-khieu-nai
//        [HttpGet("danh-sach-khieu-nai")]
//        public async Task<IActionResult> GetDanhSachKhieuNai()
//        {
//            try
//            {
//                var danhSach = await _context.KhieuNais
//                    .Include(kn => kn.MaKhachHangNavigation)
//                    .Include(kn => kn.MaDonNavigation)
//                    .Select(kn => new
//                    {
//                        maKhieuNai     = kn.MaKhieuNai,
//                        maDon          = kn.MaDon,
//                        maKhachHang    = kn.MaKhachHang,
//                        hoTenKhachHang = kn.MaKhachHangNavigation.HoTen,
//                        sdtKhachHang   = kn.MaKhachHangNavigation.SoDienThoai,
//                        maNhanVien     = kn.MaNhanVien,
//                        ngayDatDon     = kn.MaDonNavigation.NgayDat
//                    })
//                    .ToListAsync();

//                return Ok(new { success = true, message = "Lay danh sach khieu nai thanh cong.", data = danhSach });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // GET /api/v1/staff/chi-tiet-khieu-nai/{id}
//        [HttpGet("chi-tiet-khieu-nai/{id}")]
//        public async Task<IActionResult> GetChiTietKhieuNai(string id)
//        {
//            try
//            {
//                var kn = await _context.KhieuNais
//                    .Include(k => k.MaKhachHangNavigation)
//                    .Include(k => k.MaNhanVienNavigation)
//                    .Include(k => k.MaDonNavigation)
//                        .ThenInclude(d => d.LichSuTrangThaiDons)
//                    .FirstOrDefaultAsync(k => k.MaKhieuNai == id);

//                if (kn == null)
//                    return NotFound(new { success = false, message = "Khong tim thay khieu nai." });

//                var result = new
//                {
//                    maKhieuNai     = kn.MaKhieuNai,
//                    maDon          = kn.MaDon,
//                    maKhachHang    = kn.MaKhachHang,
//                    hoTenKhachHang = kn.MaKhachHangNavigation.HoTen,
//                    emailKhachHang = kn.MaKhachHangNavigation.Email,
//                    sdtKhachHang   = kn.MaKhachHangNavigation.SoDienThoai,
//                    maNhanVien     = kn.MaNhanVien,
//                    hoTenNhanVien  = kn.MaNhanVienNavigation?.HoTen,
//                    thongTinDon = new
//                    {
//                        ngayDat  = kn.MaDonNavigation.NgayDat,
//                        tongTien = kn.MaDonNavigation.TongTien,
//                        diaChi   = kn.MaDonNavigation.DiaChi,
//                        trangThaiHienTai = kn.MaDonNavigation.LichSuTrangThaiDons
//                            .OrderByDescending(l => l.ThoiGianCapNhat)
//                            .FirstOrDefault()?.TrangThai
//                    }
//                };

//                return Ok(new { success = true, data = result });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // POST /api/v1/staff/cap-nhat-khieu-nai
//        [HttpPost("cap-nhat-khieu-nai")]
//        public async Task<IActionResult> CapNhatKhieuNai([FromBody] CapNhatKhieuNaiRequest request)
//        {
//            var trangThaiHopLe = new[] { "Chua xu ly", "Dang xu ly", "Da giai quyet" };
//            if (!trangThaiHopLe.Contains(request.TrangThai))
//                return BadRequest(new { success = false, message = "Trang thai khong hop le. Cho phep: 'Chua xu ly', 'Dang xu ly', 'Da giai quyet'." });

//            if (request.TrangThai == "Da giai quyet" && string.IsNullOrWhiteSpace(request.NoiDungPhanHoi))
//                return BadRequest(new { success = false, message = "Noi dung phan hoi la bat buoc khi trang thai la 'Da giai quyet'." });

//            using var transaction = await _context.Database.BeginTransactionAsync();
//            try
//            {
//                var kn = await _context.KhieuNais
//                    .Include(k => k.MaDonNavigation)
//                    .FirstOrDefaultAsync(k => k.MaKhieuNai == request.MaKhieuNai);

//                if (kn == null)
//                    return NotFound(new { success = false, message = "Khong tim thay khieu nai." });

//                // Ghi nhan trang thai xu ly khieu nai vao LichSuTrangThaiDon cua don lien quan
//                string maLichSu = await GenerateMaLichSuAsync();
//                string noiDungLichSu = request.TrangThai == "Da giai quyet"
//                    ? $"Khieu nai {kn.MaKhieuNai} da giai quyet. Phan hoi: {request.NoiDungPhanHoi}"
//                    : $"Khieu nai {kn.MaKhieuNai}: {request.TrangThai}";

//                var lichSu = new LichSuTrangThaiDon
//                {
//                    MaLichSu = maLichSu,
//                    MaDon = kn.MaDon,
//                    TrangThai = noiDungLichSu,
//                    ThoiGianCapNhat = DateTime.Now
//                };
//                _context.LichSuTrangThaiDons.Add(lichSu);

//                await _context.SaveChangesAsync();
//                await transaction.CommitAsync();

//                string thongBao = request.TrangThai switch
//                {
//                    "Chua xu ly"   => "Da cap nhat khieu nai ve trang thai chua xu ly.",
//                    "Dang xu ly"   => "Khieu nai dang duoc xu ly.",
//                    "Da giai quyet" => "Khieu nai da giai quyet thanh cong.",
//                    _              => "Cap nhat khieu nai thanh cong."
//                };

//                return Ok(new { success = true, message = thongBao });
//            }
//            catch (Exception ex)
//            {
//                await transaction.RollbackAsync();
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // 6. DANH SACH NGUOI GIUP VIEC (de phan cong)
//        // =============================================

//        // GET /api/v1/staff/danh-sach-nguoi-giup-viec?maDon=DD001
//        [HttpGet("danh-sach-nguoi-giup-viec")]
//        public async Task<IActionResult> GetDanhSachNguoiGiupViec([FromQuery] string? maDon = null)
//        {
//            try
//            {
//                // ── Buoc 1: Lay danh sach (NgayLam, GioBatDau) cua don can phan cong ──
//                List<(DateOnly NgayLam, TimeOnly GioBatDau)> lichDon = new();

//                if (!string.IsNullOrWhiteSpace(maDon))
//                {
//                    lichDon = await _context.NgayLamViecs
//                        .Where(nlv => nlv.MaDonDatDichVuNavigation.MaDon == maDon
//                                      && nlv.NgayLam.HasValue
//                                      && nlv.GioBatDau.HasValue)
//                        .Select(nlv => new
//                        {
//                            nlv.NgayLam,
//                            nlv.GioBatDau
//                        })
//                        .AsNoTracking()
//                        .ToListAsync()
//                        .ContinueWith(t => t.Result
//                            .Select(x => (x.NgayLam!.Value, x.GioBatDau!.Value))
//                            .ToList());
//                }

//                // ── Buoc 2: Lay tat ca nguoi giup viec hop le ──
//                //    - Co ho so TrangThaiXacMinh = "Da duyet"
//                //    - Co vai tro "Nguoi giup viec"
//                var hoSoDaDuyet = await _context.HoSoNguoiGiupViecs
//                    .Where(hs => hs.TrangThaiXacMinh == "Đã duyệt")
//                    .Include(hs => hs.MaNguoiGiupViecNavigation)
//                        .ThenInclude(nd => nd.NguoiDungVaiTros)
//                            .ThenInclude(nv => nv.MaVaiTroNavigation)
//                    .AsNoTracking()
//                    .ToListAsync();

//                // ── Buoc 3: Lay danh sach id nguoi co lich trung ──
//                HashSet<string> biBanLich = new();

//                if (lichDon.Count > 0)
//                {
//                    // Lay tat ca NgayLamViec con hieu luc (khong phai Huy)
//                    // cua tat ca nguoi giup viec, roi loc tren memory
//                    var tatCaNgayLamViec = await _context.NgayLamViecs
//                        .Where(nlv => nlv.MaNguoiGiupViec != null
//                                      && nlv.NgayLam.HasValue
//                                      && nlv.GioBatDau.HasValue
//                                      && nlv.TrangThai != "Đã hủy")
//                        .Select(nlv => new
//                        {
//                            nlv.MaNguoiGiupViec,
//                            nlv.NgayLam,
//                            nlv.GioBatDau
//                        })
//                        .AsNoTracking()
//                        .ToListAsync();

//                    biBanLich = tatCaNgayLamViec
//                        .Where(nlv => lichDon.Any(ld =>
//                            ld.NgayLam == nlv.NgayLam!.Value &&
//                            ld.GioBatDau == nlv.GioBatDau!.Value))
//                        .Select(nlv => nlv.MaNguoiGiupViec!)
//                        .ToHashSet();
//                }

//                // ── Buoc 4: Tong hop ket qua ──
//                var ketQua = hoSoDaDuyet
//                    .Where(hs =>
//                    {
//                        // Kiem tra co vai tro Nguoi giup viec
//                        bool coVaiTro = hs.MaNguoiGiupViecNavigation.NguoiDungVaiTros
//                            .Any(nv => nv.MaVaiTroNavigation.TenVaiTro == "Người giúp việc");

//                        // Kiem tra khong bi ban lich
//                        bool khongTrungLich = !biBanLich.Contains(hs.MaNguoiGiupViec);

//                        return coVaiTro && khongTrungLich;
//                    })
//                    .Select(hs => new
//                    {
//                        maNguoiGiupViec = hs.MaNguoiGiupViec,
//                        hoTen           = hs.MaNguoiGiupViecNavigation.HoTen,
//                        kinhNghiem      = hs.KinhNghiem,
//                        danhSachKyNang  = hs.KyNangNguoiGiupViecs
//                            .Select(kn => kn.MaKyNang)
//                            .ToList()
//                    })
//                    .ToList();

//                return Ok(new
//                {
//                    success = true,
//                    data    = ketQua
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { success = false, message = "Loi he thong.", detail = ex.Message });
//            }
//        }

//        // =============================================
//        // HELPER
//        // =============================================


//        private async Task<string> GenerateMaLichSuAsync()
//        {
//            string ma;
//            do
//            {
//                ma = "LS" + Random.Shared.Next(100, 1000);
//            }
//            while (await _context.LichSuTrangThaiDons.AnyAsync(x => x.MaLichSu == ma));
//            return ma;
//        }
//    }
//}
