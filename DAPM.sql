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
	MaKyNang CHAR(5),
    TenDichVu NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500),              -- Description từ code
    GiaTheoGio DECIMAL(18, 2),          -- Phần số của Price (VD: 60000)
    HinhAnh VARCHAR(255),             -- URL image
    PhoBien BIT DEFAULT 0,            -- popular (true/false)
    TrangThai NVARCHAR(30) DEFAULT N'Đang hoạt động',
	FOREIGN KEY (MaKyNang) REFERENCES KyNang(MaKyNang)
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
INSERT INTO VaiTro (MaVaiTro, TenVaiTro, MoTa)
VALUES 
    ('VT001', N'Admin', N'Quản trị viên hệ thống'),
    ('VT002', N'Staff', N'Nhân viên'),
    ('VT003', N'Customer', N'Khách hàng'),
    ('VT004', N'Maid', N'Người giúp việc');
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
INSERT INTO DichVu (MaDichVu, MaKyNang, TenDichVu, MoTa, GiaTheoGio, HinhAnh, PhoBien, TrangThai) VALUES 
('DV001','KN001', N'Dọn dẹp nhà cửa', N'Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.', 60000, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 1, N'Đang hoạt động'),
('DV002','KN002', N'Tổng vệ sinh', N'Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.', 150000, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 0, N'Đang hoạt động'),
('DV003','KN003', N'Nấu ăn gia đình', N'Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.', 80000, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d', 0, N'Đang hoạt động'),
('DV004','KN004', N'Chăm sóc trẻ em', N'Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.', 70000, 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368', 1, N'Đang hoạt động'),
('DV005','KN005', N'Chăm sóc người cao tuổi', N'Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.', 80000, 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', 0, N'Đang hoạt động'),
('DV006','KN006', N'Giặt sofa & nệm', N'Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.', 250000, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 0, N'Đang hoạt động');
-- Dọn dẹp nhà cửa (DV001) gồm TP001, TP002, TP003
update KyNang
set TenKyNang =N'Dọn dẹp nhà cửa'
where MaKyNang = 'KN001'
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
select * from DichVu
GO
UPDATE HoSoNguoiGiupViec
SET TrangThaiXacMinh = N'Đã duyệt'
WHERE MaNguoiGiupViec = 'GV661';



INSERT INTO NguoiDung (
    MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi
)
VALUES (
    'ND001', 
    N'Nguyễn Thị Lan', 
    'lanmaid@gmail.com', 
    '0912345678', 
    '123456', 
    N'Nha Trang'
);
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro)
VALUES ('ND001', 'VT004');
INSERT INTO HoSoNguoiGiupViec (
    MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh,
    TenNguoiThan, SDTNguoiThan,
    TrangThaiXacMinh
)
VALUES (
    'HS001', 
    'ND001', 
    '079123456789', 
    '1995-05-10', 
    N'Nữ',
    N'Nguyễn Văn A',
    '0987654321',
    N'Đã duyệt'
);
INSERT INTO KyNangNguoiGiupViec (MaKyNang, MaHoSo, KinhNghiem) VALUES
('KN001', 'HS001', N'2 năm kinh nghiệm dọn dẹp'),
('KN002', 'HS001', N'Biết nấu ăn gia đình'),
('KN005', 'HS001', N'Giặt ủi chuyên nghiệp');
INSERT INTO CaLamViec (MaCaLamViec, GioBatDau, GioKetThuc) VALUES
('CA001', '08:00', '10:00'),
('CA002', '10:00', '12:00'),
('CA003', '13:00', '15:00'),
('CA004', '15:00', '17:00');
INSERT INTO LichRanh (MaLichRanh, MaNguoiGiupViec, Ngay) VALUES
('LR001', 'ND001', '2026-05-06'),
('LR002', 'ND001', '2026-05-07'),
('LR003', 'ND001', '2026-05-08');

-- Ngày 06
INSERT INTO LichRanhCaLamViec VALUES
('LR001', 'CA001', N'Rảnh buổi sáng'),
('LR001', 'CA002', N'Rảnh tiếp');

-- Ngày 07
INSERT INTO LichRanhCaLamViec VALUES
('LR002', 'CA003', N'Rảnh buổi chiều'),
('LR002', 'CA004', N'Rảnh chiều muộn');

-- Ngày 08
INSERT INTO LichRanhCaLamViec VALUES
('LR003', 'CA001', NULL),
('LR003', 'CA004', NULL);