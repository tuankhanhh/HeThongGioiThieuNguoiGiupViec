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
MaNguoiDung VARCHAR(5) PRIMARY KEY,
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
MaVaiTro VARCHAR(5) PRIMARY KEY,
TenVaiTro NVARCHAR(50),
MoTa NVARCHAR(200)
);

-- 3 NguoiDungVaiTro (THÊM CỘT để EF tạo model)
CREATE TABLE NguoiDungVaiTro(
MaNguoiDung VARCHAR(5) NOT NULL,
MaVaiTro VARCHAR(5) NOT NULL,
NgayGan DATETIME DEFAULT GETDATE(),
PRIMARY KEY(MaNguoiDung,MaVaiTro),
FOREIGN KEY(MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
FOREIGN KEY(MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

-- 4 HoSoNguoiGiupViec
CREATE TABLE HoSoNguoiGiupViec(
MaHoSo VARCHAR(5) PRIMARY KEY,
MaNguoiGiupViec VARCHAR(5) NOT NULL,
SoCCCD VARCHAR(12),
NgaySinh DATE,
GioiTinh NVARCHAR(100),
KinhNghiem NVARCHAR(200),
MoTaChiTietKinhNghiem NVARCHAR(200),
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
CREATE TABLE LichRanh(
MaLichRanh VARCHAR(5) PRIMARY KEY,
MaNguoiGiupViec VARCHAR(5) NOT NULL,
Ngay DATE,
GioBatDau TIME,
GioKetThuc TIME,
FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 6 KyNang
CREATE TABLE KyNang(
MaKyNang VARCHAR(5) PRIMARY KEY,
TenKyNang NVARCHAR(50),
MoTa NVARCHAR(255), 
IconName VARCHAR(50)
);

-- 7 KyNangNguoiGiupViec (THÊM CỘT)
CREATE TABLE KyNangNguoiGiupViec(
MaKyNang VARCHAR(5) NOT NULL,
MaHoSo VARCHAR(5) NOT NULL,
NgayThem DATETIME DEFAULT GETDATE(),
PRIMARY KEY(MaKyNang,MaHoSo),
FOREIGN KEY(MaKyNang) REFERENCES KyNang(MaKyNang),
FOREIGN KEY(MaHoSo) REFERENCES HoSoNguoiGiupViec(MaHoSo)
);

-- 8 ThanhPhan
CREATE TABLE ThanhPhan(
MaThanhPhan VARCHAR(5) PRIMARY KEY,
TenThanhPhan NVARCHAR(200)
);

-- 9 DichVu
CREATE TABLE DichVu (
    MaDichVu VARCHAR(5) PRIMARY KEY, -- VD: 'cleaning', 'combo', 'cooking'
    TenDichVu NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500),              -- Description từ code
    GiaTheoGio DECIMAL(18, 2),          -- Phần số của Price (VD: 60000)
    HinhAnh VARCHAR(255),             -- URL image
    PhoBien BIT DEFAULT 0,            -- popular (true/false)
    TrangThai NVARCHAR(30) DEFAULT N'Đang hoạt động'
);

-- 10 DichVuThanhPhan (THÊM CỘT)
CREATE TABLE DichVuThanhPhan(
MaDichVu VARCHAR(5) NOT NULL,
MaThanhPhan VARCHAR(5) NOT NULL,
GhiChu NVARCHAR(100),
PRIMARY KEY(MaDichVu,MaThanhPhan),
FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu),
FOREIGN KEY(MaThanhPhan) REFERENCES ThanhPhan(MaThanhPhan)
);

-- 11 DonDat
CREATE TABLE DonDat(
MaDon VARCHAR(5) PRIMARY KEY,
MaKhachhang VARCHAR(5) NOT NULL,
MaNhanVien VARCHAR(5),
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
MaDonDatDichVu VARCHAR(5) PRIMARY KEY,
MaDon VARCHAR(5) NOT NULL,
MaDichVu VARCHAR(5) NOT NULL,
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon),
FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu)
);

-- 13 NgayLamViec
CREATE TABLE NgayLamViec(
MaNgayLamViec VARCHAR(5) PRIMARY KEY,
MaDonDatDichVu VARCHAR(5) NOT NULL,
MaNguoiGiupViec VARCHAR(5),
GioBatDau TIME ,
NgayLam DATE,
ThoiGianPhanCong DATETIME,
TrangThai NVARCHAR(30),  
FOREIGN KEY(MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 14 DonDatDichVuNgayLamViec (THÊM CỘT)
CREATE TABLE DonDatDichVuNgayLamViec(
MaDonDatDichVu VARCHAR(5) NOT NULL,
MaNgayLamViec VARCHAR(5) NOT NULL,
ThoiGianThucHien INT,
PRIMARY KEY(MaDonDatDichVu,MaNgayLamViec),
FOREIGN KEY(MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);

-- 15 ThuNhapNguoiGiupViec
CREATE TABLE ThuNhapNguoiGiupViec(
MaThuNhap VARCHAR(5) PRIMARY KEY,
MaNgayLamViec VARCHAR(5) NOT NULL,
SoTien DECIMAL(10,2),
FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);

-- 16 ThanhToan
CREATE TABLE ThanhToan(
MaThanhToan VARCHAR(5) PRIMARY KEY,
MaDon VARCHAR(5) NOT NULL,
TrangThaiThanhToan NVARCHAR(50),
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 17 LichSuTrangThaiDon
CREATE TABLE LichSuTrangThaiDon(
MaLichSu VARCHAR(5) PRIMARY KEY,
MaDon VARCHAR(5) NOT NULL,
ThoiGianCapNhat DATETIME,
TrangThai NVARCHAR(100),
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 18 DanhGia
CREATE TABLE DanhGia(
MaDanhGia VARCHAR(5) PRIMARY KEY,
MaDon VARCHAR(5) NOT NULL,
SoSao INT,
FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 19 KhieuNai
CREATE TABLE KhieuNai(
MaKhieuNai VARCHAR(5) PRIMARY KEY,
MaDon VARCHAR(5) NOT NULL,
MaKhachHang VARCHAR(5) NOT NULL,
MaNhanVien VARCHAR(5) NOT NULL,
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
GO
UPDATE HoSoNguoiGiupViec
SET TrangThaiXacMinh = N'Đã duyệt'
WHERE MaNguoiGiupViec = '1a5ab';
