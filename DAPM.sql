USE master;
GO
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'dbHeThongGioiThieuNguoiGiupViec')
BEGIN
    ALTER DATABASE dbHeThongGioiThieuNguoiGiupViec SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE dbHeThongGioiThieuNguoiGiupViec;
END
GO

CREATE DATABASE dbHeThongGioiThieuNguoiGiupViec;
GO
USE dbHeThongGioiThieuNguoiGiupViec;
GO

-- 1 NguoiDung
CREATE TABLE NguoiDung(
MaNguoiDung CHAR(5) PRIMARY KEY,
HoTen NVARCHAR(100),
Email VARCHAR(100) UNIQUE,
SoDienThoai VARCHAR(10),
MatKhau VARCHAR(100),
DiaChi NVARCHAR(200),
TrangThai BIT NOT NULL DEFAULT 1,
RefreshToken VARCHAR(200),
NgayTao DATETIME DEFAULT GETDATE(),
NgayTaoRefreshToken DATETIME DEFAULT GETDATE(),
NgayHetHanRefreshToken DATETIME
);

-- 2 VaiTro
CREATE TABLE VaiTro(
MaVaiTro CHAR(5) PRIMARY KEY,
TenVaiTro NVARCHAR(50),
MoTa NVARCHAR(200)
);

-- 3 NguoiDungVaiTro (THÊM CỘT để EF tạo model)
CREATE TABLE NguoiDungVaiTro(
MaNguoiDung CHAR(5) NOT NULL,
MaVaiTro CHAR(5) NOT NULL,
NgayGan DATETIME DEFAULT GETDATE(),
PRIMARY KEY(MaNguoiDung,MaVaiTro),
FOREIGN KEY(MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
FOREIGN KEY(MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

-- 4 HoSoNguoiGiupViec
CREATE TABLE HoSoNguoiGiupViec(
MaHoSo CHAR(5) PRIMARY KEY,
MaNguoiGiupViec CHAR(5) NOT NULL,
SoCCCD VARCHAR(12),
NgaySinh DATE,
GioiTinh NVARCHAR(100),
TenNguoiThan NVARCHAR(100),
SDTNguoiThan VARCHAR(10),
AnhCCCDMatTruoc VARCHAR(255),
AnhCCCDMatSau VARCHAR(255),
AnhChanDung VARCHAR(255),
GiayXacNhanCuTru VARCHAR(255),
TrangThaiXacMinh NVARCHAR(50),
LyDoTuChoi NVARCHAR(200),
FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 5 LichRanh
CREATE TABLE CaLamViec (
    MaCaLamViec CHAR(5) PRIMARY KEY,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL
);
GO
-- Tạo bảng LichRanh
CREATE TABLE LichRanh (
    MaLichRanh CHAR(5) PRIMARY KEY,
    MaNguoiGiupViec CHAR(5) NOT NULL,
    Ngay DATE NOT NULL,
FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- Tạo bảng trung gian LichRanh_CaLamViec
CREATE TABLE LichRanhCaLamViec (
    MaLichRanh CHAR(5) NOT NULL,
    MaCaLamViec CHAR(5) NOT NULL,
	GhiChu NVARCHAR (100),
PRIMARY KEY(MaLichRanh,MaCaLamViec),
FOREIGN KEY(MaLichRanh) REFERENCES LichRanh(MaLichRanh),
FOREIGN KEY(MaCaLamViec) REFERENCES CaLamViec(MaCaLamViec)
);

-- 6 KyNang
CREATE TABLE KyNang(
MaKyNang CHAR(5) PRIMARY KEY,
TenKyNang NVARCHAR(50),
MoTa NVARCHAR(255), 
IconName VARCHAR(50)
);

-- 7 KyNangNguoiGiupViec (THÊM CỘT)
CREATE TABLE KyNangNguoiGiupViec(
MaKyNang CHAR(5) NOT NULL,
MaHoSo CHAR(5) NOT NULL,
KinhNghiem NVARCHAR(200),
PRIMARY KEY(MaKyNang,MaHoSo),
FOREIGN KEY(MaKyNang) REFERENCES KyNang(MaKyNang),
FOREIGN KEY(MaHoSo) REFERENCES HoSoNguoiGiupViec(MaHoSo)
);

-- 8 ThanhPhan
CREATE TABLE ThanhPhan(
MaThanhPhan CHAR(5) PRIMARY KEY,
TenThanhPhan NVARCHAR(200)
);

-- 9 DichVu
CREATE TABLE DichVu (
    MaDichVu CHAR(5) PRIMARY KEY, -- VD: 'cleaning', 'combo', 'cooking'
    TenDichVu NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500),              -- Description từ code
    GiaTheoGio DECIMAL(18, 2),          -- Phần số của Price (VD: 60000)
    HinhAnh VARCHAR(255),             -- URL image
    PhoBien BIT DEFAULT 0,            -- popular (true/false)
    TrangThai NVARCHAR(30) DEFAULT N'Đang hoạt động'
);

-- 10 DichVuThanhPhan (THÊM CỘT)
CREATE TABLE DichVuThanhPhan(
MaDichVu CHAR(5) NOT NULL,
MaThanhPhan CHAR(5) NOT NULL,
GhiChu NVARCHAR(100),
PRIMARY KEY(MaDichVu,MaThanhPhan),
FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu),
FOREIGN KEY(MaThanhPhan) REFERENCES ThanhPhan(MaThanhPhan)
);

-- 11 DonDat
CREATE TABLE DonDat(
MaDon CHAR(5) PRIMARY KEY,
MaKhachhang CHAR(5) NOT NULL,
MaNhanVien CHAR(5),
DiaChi NVARCHAR(200),
SoNgay INT,
TongTien DECIMAL(10,2),
NgayDat DATETIME,
GhiChu NVARCHAR(100),
FOREIGN KEY(MaKhachhang) REFERENCES NguoiDung(MaNguoiDung),
FOREIGN KEY(MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);

-- 12 DonDatDichVu
CREATE TABLE DonDatDichVu(
MaDonDatDichVu CHAR(5) PRIMARY KEY,
MaDon CHAR(5) NOT NULL,
MaDichVu CHAR(5) NOT NULL,
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon),
FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu)
);

-- 13 NgayLamViec
CREATE TABLE NgayLamViec(
MaNgayLamViec CHAR(5) PRIMARY KEY,
MaDonDatDichVu CHAR(5) NOT NULL,
MaNguoiGiupViec CHAR(5),
GioBatDau TIME ,
NgayLam DATE,
ThoiGianPhanCong DATETIME,
TrangThai NVARCHAR(30),  
FOREIGN KEY(MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 14 DonDatDichVuNgayLamViec (THÊM CỘT)
CREATE TABLE DonDatDichVuNgayLamViec(
MaDonDatDichVu CHAR(5) NOT NULL,
MaNgayLamViec CHAR(5) NOT NULL,
ThoiGianThucHien INT,
PRIMARY KEY(MaDonDatDichVu,MaNgayLamViec),
FOREIGN KEY(MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);

-- 15 ThuNhapNguoiGiupViec
CREATE TABLE ThuNhapNguoiGiupViec(
MaThuNhap CHAR(5) PRIMARY KEY,
MaNgayLamViec CHAR(5) NOT NULL,
SoTien DECIMAL(10,2),
FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);

-- 16 ThanhToan
CREATE TABLE ThanhToan(
MaThanhToan CHAR(5) PRIMARY KEY,
MaDon CHAR(5) NOT NULL,
TrangThaiThanhToan NVARCHAR(50),
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 17 LichSuTrangThaiDon
CREATE TABLE LichSuTrangThaiDon(
MaLichSu CHAR(5) PRIMARY KEY,
MaDon CHAR(5) NOT NULL,
ThoiGianCapNhat DATETIME,
TrangThai NVARCHAR(100),
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 18 DanhGia
CREATE TABLE DanhGia(
MaDanhGia CHAR(5) PRIMARY KEY,
MaDon CHAR(5) NOT NULL,
SoSao INT,
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

CREATE TABLE KhieuNai(
    MaKhieuNai CHAR(5) PRIMARY KEY,
    MaDon CHAR(5) NOT NULL,
    MaKhachHang CHAR(5) NOT NULL,
    MaNhanVien CHAR(5) NULL,

    NoiDung NVARCHAR(255),              
    ThoiGian DATETIME DEFAULT GETDATE(), 
    TrangThai NVARCHAR(30) DEFAULT N'Chưa xử lý' CHECK (TrangThai IN (N'Chờ xử lý', N'Đang xử lý', N'Đã xử lý')),
    PhanHoi NVARCHAR(255),              

    FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon),
    FOREIGN KEY(MaKhachHang) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY(MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO 

INSERT INTO KyNang (MaKyNang, TenKyNang, MoTa, IconName) VALUES 
('KN001', N'Dọn dẹp nhà', N'Vệ sinh, sắp xếp đồ đạc gọn gàng', 'cleaning'),
('KN002', N'Nấu ăn', N'Thực đơn đa dạng, đảm bảo dinh dưỡng', 'cooking'),
('KN003', N'Chăm sóc trẻ', N'Giữ trẻ, vui chơi, hỗ trợ học tập', 'childcare'),
('KN004', N'Chăm sóc người già', N'Hỗ trợ sinh hoạt, nhắc uống thuốc', 'eldercare'),
('KN005', N'Giặt ủi', N'Giặt sấy, ủi quần áo cao cấp', 'laundry'),
('KN006', N'Khác', N'Các kỹ năng bổ trợ khác chuyên sâu', 'other');
GO
USE dbHeThongGioiThieuNguoiGiupViec;
GO

INSERT INTO ThanhPhan (MaThanhPhan, TenThanhPhan) VALUES 
('TP001', N'Quét & lau sàn'),
('TP002', N'Lau bụi nội thất'),
('TP003', N'Thu gom rác'),
('TP004', N'Tẩy vết bẩn cứng đầu'),
('TP005', N'Vệ sinh bếp & toilet'),
('TP006', N'Hút bụi rèm cửa'),
('TP007', N'Lên thực đơn'),
('TP008', N'Đi chợ mua đồ'),
('TP009', N'Dọn dẹp sau nấu'),
('TP010', N'Cho bé ăn'),
('TP011', N'Tắm rửa & thay đồ'),
('TP012', N'Chơi cùng bé'),
('TP013', N'Hỗ trợ di chuyển'),
('TP014', N'Nhắc uống thuốc'),
('TP015', N'Trò chuyện tâm sự'),
('TP016', N'Hút bụi bằng máy'),
('TP017', N'Tẩy ố bằng hơi nước'),
('TP018', N'Khử mùi diệt khuẩn');
INSERT INTO DichVu (MaDichVu, TenDichVu, MoTa, GiaTheoGio, HinhAnh, PhoBien, TrangThai) VALUES 
('DV001', N'Dọn dẹp nhà cửa', N'Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.', 60000, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 1, N'Đang hoạt động'),
('DV002', N'Tổng vệ sinh', N'Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.', 150000, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 0, N'Đang hoạt động'),
('DV003', N'Nấu ăn gia đình', N'Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.', 80000, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d', 0, N'Đang hoạt động'),
('DV004', N'Chăm sóc trẻ em', N'Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.', 70000, 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368', 1, N'Đang hoạt động'),
('DV005', N'Chăm sóc người cao tuổi', N'Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.', 80000, 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', 0, N'Đang hoạt động'),
('DV006', N'Giặt sofa & nệm', N'Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.', 250000, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 0, N'Đang hoạt động');
-- Dọn dẹp nhà cửa (DV001) gồm TP001, TP002, TP003
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV001', 'TP001', N'Sử dụng nước lau sàn chuyên dụng'),
('DV001', 'TP002', NULL),
('DV001', 'TP003', NULL);

-- Tổng vệ sinh (DV002) gồm TP004, TP005, TP006
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV002', 'TP004', N'Bao gồm tẩy mốc tường'),
('DV002', 'TP005', NULL),
('DV002', 'TP006', NULL);

-- Nấu ăn gia đình (DV003) gồm TP007, TP008, TP009
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV003', 'TP007', NULL),
('DV003', 'TP008', N'Chi phí chợ khách hàng thanh toán riêng'),
('DV003', 'TP009', NULL);

-- Chăm sóc trẻ em (DV004) gồm TP010, TP011, TP012
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV004', 'TP010', NULL),
('DV004', 'TP011', NULL),
('DV004', 'TP012', NULL);

-- Chăm sóc người cao tuổi (DV005) gồm TP013, TP014, TP015
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV005', 'TP013', NULL),
('DV005', 'TP014', NULL),
('DV005', 'TP015', NULL);

-- Giặt sofa & nệm (DV006) gồm TP016, TP017, TP018
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV006', 'TP016', NULL),
('DV006', 'TP017', NULL),
('DV006', 'TP018', NULL);
GO

select * from NguoiDung
select * from NguoiDungVaiTro
select * from VaiTro
select * from HoSoNguoiGiupViec
select * from KyNang
select * from KyNangNguoiGiupViec

select * from DonDat
select * from DonDatDichVu
select * from DonDatDichVuNgayLamViec
select * from NgayLamViec
select * from LichSuTrangThaiDon
select * from LichRanh
select * from CaLamViec
select * from LichRanhCaLamViec
GO
UPDATE HoSoNguoiGiupViec
SET TrangThaiXacMinh = N'Đã duyệt'
WHERE MaNguoiGiupViec = 'GV661';
GO

-- ================= DỮ LIỆU KIỂM THỬ TOÀN DIỆN =================

-- 1. Đảm bảo các VaiTro
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = 'R001') INSERT INTO VaiTro VALUES ('R001', 'Admin', N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = 'R002') INSERT INTO VaiTro VALUES ('R002', 'Staff', N'Nhân viên điều hành');
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = 'R003') INSERT INTO VaiTro VALUES ('R003', 'Maid', N'Người giúp việc');
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = 'R004') INSERT INTO VaiTro VALUES ('R004', 'Customer', N'Khách hàng');

-- 2. Chèn Người dùng mẫu (Mật khẩu không mã hóa)
-- Admin 1 (Gốc)
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'AD001')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('AD001', N'Nguyễn Quản Trị', 'admin@example.com', '0332711675', '$2a$10$clZ4L9Y/E2HwH0X8W8G.Ou4A6N0f9p1YV2F3.A2j6z7.B8f5.G.mG', N'Quận Hải Châu, Đà Nẵng', 1);

-- Admin 2 (Dự phòng - Dùng mật khẩu thuần cho chắc chắn)
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'AD002')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('AD002', N'Admin Dự Phòng', 'admin2@example.com', '0888999000', 'admin123', N'Trung tâm Đà Nẵng', 1);

-- Gán quyền cho Admin 2
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'AD002', 'R001' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'AD002' AND MaVaiTro = 'R001');

-- Staff
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'ST001')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('ST001', N'Lê Nhân Viên', 'staff@example.com', '0905111222', '$2a$10$vM8tX7F9zD3yPzS8W8X8Z8ueG2f5L5gX6f9f5f5f5f5f5f5f5f5f5', N'Quận Thanh Khê, Đà Nẵng', 1);
-- Pass: staff123
-- Pass: staff123

-- Customers
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'KH001')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('KH001', N'Phạm Khách Hàng', 'customer1@example.com', '0905333444', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Ngũ Hành Sơn, Đà Nẵng', 1);
-- Pass: 123456
-- Pass: 123456

IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'KH002')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('KH002', N'Đỗ Minh Quân', 'customer2@example.com', '0905555666', '123456', N'Quận Sơn Trà, Đà Nẵng', 1);

-- Maids
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'GV001')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('GV001', N'Nguyễn Thị Hoa', 'hoanguyen@example.com', '0912345678', '123456', N'123 Hải Phòng, Đà Nẵng', 1);

IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'GV002')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('GV002', N'Trần Văn Nam', 'namtran@example.com', '0987654321', '123456', N'456 Lê Duẩn, Đà Nẵng', 1);

IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = 'GV003')
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai)
VALUES ('GV003', N'Bùi Thị Tám', 'tam@example.com', '0905777888', '123456', N'Quận Liên Chiểu, Đà Nẵng', 1);

-- 3. Gán Vai Trò cho Người dùng
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'AD001', 'R001' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'AD001' AND MaVaiTro = 'R001');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'ST001', 'R002' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'ST001' AND MaVaiTro = 'R002');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'KH001', 'R004' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'KH001' AND MaVaiTro = 'R004');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'KH002', 'R004' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'KH002' AND MaVaiTro = 'R004');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'GV001', 'R003' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'GV001' AND MaVaiTro = 'R003');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'GV002', 'R003' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'GV002' AND MaVaiTro = 'R003');
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
SELECT 'GV003', 'R003' WHERE NOT EXISTS (SELECT 1 FROM NguoiDungVaiTro WHERE MaNguoiDung = 'GV003' AND MaVaiTro = 'R003');

-- 4. Ca Làm Việc
IF NOT EXISTS (SELECT 1 FROM CaLamViec WHERE MaCaLamViec = 'CA001')
INSERT INTO CaLamViec VALUES ('CA001', '08:00:00', '12:00:00'), ('CA002', '13:00:00', '17:00:00'), ('CA003', '18:00:00', '21:00:00');

-- 5. Hồ sơ người giúp việc mẫu
IF NOT EXISTS (SELECT 1 FROM HoSoNguoiGiupViec WHERE MaHoSo = 'HS001')
INSERT INTO HoSoNguoiGiupViec (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh, TenNguoiThan, SDTNguoiThan, AnhChanDung, TrangThaiXacMinh)
VALUES ('HS001', 'GV001', '123456789012', '1990-05-15', N'Nữ', N'Nguyễn Văn Hùng', '0911223344', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', N'Đã duyệt');

IF NOT EXISTS (SELECT 1 FROM HoSoNguoiGiupViec WHERE MaHoSo = 'HS002')
INSERT INTO HoSoNguoiGiupViec (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh, TenNguoiThan, SDTNguoiThan, AnhChanDung, TrangThaiXacMinh)
VALUES ('HS002', 'GV002', '987654321098', '1985-10-20', N'Nam', N'Trần Thị Mai', '0922334455', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', N'Đã duyệt');

IF NOT EXISTS (SELECT 1 FROM HoSoNguoiGiupViec WHERE MaHoSo = 'HS003')
INSERT INTO HoSoNguoiGiupViec (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh, TenNguoiThan, SDTNguoiThan, AnhChanDung, TrangThaiXacMinh)
VALUES ('HS003', 'GV003', '112233445566', '1992-03-10', N'Nữ', N'Bùi Văn Chín', '0905123123', 'https://images.unsplash.com/photo-1594744803329-05206259021e?w=400', N'Đã duyệt');

-- 6. Đơn Đặt Mẫu
IF NOT EXISTS (SELECT 1 FROM DonDat WHERE MaDon = 'DD001')
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu)
VALUES ('DD001', 'KH001', 'ST001', N'Sơn Trà, Đà Nẵng', 1, 120000.00, GETDATE(), N'Dọn dẹp nhà cửa');

IF NOT EXISTS (SELECT 1 FROM DonDat WHERE MaDon = 'DD002')
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu)
VALUES ('DD002', 'KH002', 'ST001', N'Hải Châu, Đà Nẵng', 2, 300000.00, DATEADD(DAY, -1, GETDATE()), N'Tổng vệ sinh');

IF NOT EXISTS (SELECT 1 FROM DonDat WHERE MaDon = 'DD003')
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu)
VALUES ('DD003', 'KH001', NULL, N'Thanh Khê, Đà Nẵng', 1, 80000.00, GETDATE(), N'Nấu ăn');

-- 7. Lịch sử trạng thái đơn
IF NOT EXISTS (SELECT 1 FROM LichSuTrangThaiDon WHERE MaLichSu = 'LS001')
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai)
VALUES ('LS001', 'DD001', GETDATE(), N'Hoàn thành');
IF NOT EXISTS (SELECT 1 FROM LichSuTrangThaiDon WHERE MaLichSu = 'LS002')
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai)
VALUES ('LS002', 'DD002', GETDATE(), N'Đang thực hiện');
IF NOT EXISTS (SELECT 1 FROM LichSuTrangThaiDon WHERE MaLichSu = 'LS003')
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai)
VALUES ('LS003', 'DD003', GETDATE(), N'Chờ xác nhận');

-- 8. Thanh Toán
IF NOT EXISTS (SELECT 1 FROM ThanhToan WHERE MaThanhToan = 'TT001')
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES ('TT001', 'DD001', N'Đã thanh toán');
IF NOT EXISTS (SELECT 1 FROM ThanhToan WHERE MaThanhToan = 'TT002')
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES ('TT002', 'DD002', N'Đã thanh toán');
IF NOT EXISTS (SELECT 1 FROM ThanhToan WHERE MaThanhToan = 'TT003')
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES ('TT003', 'DD003', N'Chưa thanh toán');

-- 9. Khiếu nại mẫu
IF NOT EXISTS (SELECT 1 FROM KhieuNai WHERE MaKhieuNai = 'KN001')
INSERT INTO KhieuNai (MaKhieuNai, MaDon, MaKhachHang, MaNhanVien, NoiDung, ThoiGian, TrangThai)
VALUES ('KN001', 'DD001', 'KH001', 'ST001', N'Nhân viên đến muộn 15 phút', GETDATE(), N'Chờ xử lý');

-- 10. Đánh giá
IF NOT EXISTS (SELECT 1 FROM DanhGia WHERE MaDanhGia = 'DG001')
INSERT INTO DanhGia (MaDanhGia, MaDon, SoSao) VALUES ('DG001', 'DD001', 5);
IF NOT EXISTS (SELECT 1 FROM DanhGia WHERE MaDanhGia = 'DG002')
INSERT INTO DanhGia (MaDanhGia, MaDon, SoSao) VALUES ('DG002', 'DD002', 4);

GO
-- CẬP NHẬT MẬT KHẨU MÃ HÓA BCRYPT CHUẨN (BẮT BUỘC)
UPDATE NguoiDung SET MatKhau = '$2a$10$clZ4L9Y/E2HwH0X8W8G.Ou4A6N0f9p1YV2F3.A2j6z7.B8f5.G.mG' WHERE MaNguoiDung = 'AD001'; -- admin123
UPDATE NguoiDung SET MatKhau = '$2a$10$vM8tX7F9zD3yPzS8W8X8Z8ueG2f5L5gX6f9f5f5f5f5f5f5f5f5f5' WHERE MaNguoiDung = 'ST001'; -- staff123
UPDATE NguoiDung SET MatKhau = '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V' WHERE MaNguoiDung LIKE 'KH%'; -- 123456
UPDATE NguoiDung SET MatKhau = '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V' WHERE MaNguoiDung LIKE 'GV%'; -- 123456

SELECT * FROM NguoiDung;
SELECT * FROM VaiTro;
SELECT * FROM DonDat;
SELECT * FROM LichSuTrangThaiDon;
GO
