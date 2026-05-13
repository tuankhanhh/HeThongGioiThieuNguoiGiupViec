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
	ThoiGianTao DATETIME DEFAULT GETDATE(),
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
NoiDung NVARCHAR(255),
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
-- =========================================================================
-- PHẦN 1: DỮ LIỆU TỪ ĐIỂN / DANH MỤC CƠ BẢN (Không phụ thuộc khóa ngoại)
-- =========================================================================

-- 1. Vai Trò
INSERT INTO VaiTro (MaVaiTro, TenVaiTro, MoTa) VALUES 
('VT001', N'Admin', N'Quản trị viên hệ thống'),
('VT002', N'Staff', N'Nhân viên'),
('VT003', N'Customer', N'Khách hàng'),
('VT004', N'Maid', N'Người giúp việc');
GO

-- 2. Kỹ Năng (Đã tích hợp nội dung Update 'Dọn dẹp nhà cửa' vào thẳng Insert)
INSERT INTO KyNang (MaKyNang, TenKyNang, MoTa, IconName) VALUES 
('KN001', N'Dọn dẹp nhà cửa', N'Vệ sinh, sắp xếp đồ đạc gọn gàng', 'cleaning'),
('KN002', N'Nấu ăn', N'Thực đơn đa dạng, đảm bảo dinh dưỡng', 'cooking'),
('KN003', N'Chăm sóc trẻ', N'Giữ trẻ, vui chơi, hỗ trợ học tập', 'childcare'),
('KN004', N'Chăm sóc người già', N'Hỗ trợ sinh hoạt, nhắc uống thuốc', 'eldercare'),
('KN005', N'Giặt ủi', N'Giặt sấy, ủi quần áo cao cấp', 'laundry'),
('KN006', N'Khác', N'Các kỹ năng bổ trợ khác chuyên sâu', 'other');
GO

-- 3. Thành Phần Công Việc
INSERT INTO ThanhPhan (MaThanhPhan, TenThanhPhan) VALUES 
('TP001', N'Quét & lau sàn'),       ('TP002', N'Lau bụi nội thất'),    ('TP003', N'Thu gom rác'),
('TP004', N'Tẩy vết bẩn cứng đầu'), ('TP005', N'Vệ sinh bếp & toilet'),('TP006', N'Hút bụi rèm cửa'),
('TP007', N'Lên thực đơn'),         ('TP008', N'Đi chợ mua đồ'),       ('TP009', N'Dọn dẹp sau nấu'),
('TP010', N'Cho bé ăn'),            ('TP011', N'Tắm rửa & thay đồ'),   ('TP012', N'Chơi cùng bé'),
('TP013', N'Hỗ trợ di chuyển'),     ('TP014', N'Nhắc uống thuốc'),     ('TP015', N'Trò chuyện tâm sự'),
('TP016', N'Hút bụi bằng máy'),     ('TP017', N'Tẩy ố bằng hơi nước'), ('TP018', N'Khử mùi diệt khuẩn');
GO

-- 4. Ca Làm Việc
INSERT INTO CaLamViec (MaCaLamViec, GioBatDau, GioKetThuc) VALUES
('CA001', '08:00', '10:00'),
('CA002', '10:00', '12:00'),
('CA003', '13:00', '15:00'),
('CA004', '15:00', '17:00'),
('CA005', '18:00', '21:00'); -- Ca bổ sung từ dữ liệu test
GO

-- 5. Dịch Vụ & Dịch Vụ Thành Phần
INSERT INTO DichVu (MaDichVu, MaKyNang, TenDichVu, MoTa, GiaTheoGio, HinhAnh, PhoBien, TrangThai) VALUES 
('DV001','KN001', N'Dọn dẹp nhà cửa', N'Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.', 60000, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 1, N'Đang hoạt động'),
('DV002','KN002', N'Tổng vệ sinh', N'Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.', 150000, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 0, N'Đang hoạt động'),
('DV003','KN003', N'Nấu ăn gia đình', N'Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.', 80000, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d', 0, N'Đang hoạt động'),
('DV004','KN004', N'Chăm sóc trẻ em', N'Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.', 70000, 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368', 1, N'Đang hoạt động'),
('DV005','KN005', N'Chăm sóc người cao tuổi', N'Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.', 80000, 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', 0, N'Đang hoạt động'),
('DV006','KN006', N'Giặt sofa & nệm', N'Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.', 250000, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 0, N'Đang hoạt động');

INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV001', 'TP001', N'Sử dụng nước lau sàn chuyên dụng'), ('DV001', 'TP002', NULL), ('DV001', 'TP003', NULL),
('DV002', 'TP004', N'Bao gồm tẩy mốc tường'),          ('DV002', 'TP005', NULL), ('DV002', 'TP006', NULL),
('DV003', 'TP007', NULL),                              ('DV003', 'TP008', N'Chi phí chợ khách hàng thanh toán riêng'), ('DV003', 'TP009', NULL),
('DV004', 'TP010', NULL),                              ('DV004', 'TP011', NULL), ('DV004', 'TP012', NULL),
('DV005', 'TP013', NULL),                              ('DV005', 'TP014', NULL), ('DV005', 'TP015', NULL),
('DV006', 'TP016', NULL),                              ('DV006', 'TP017', NULL), ('DV006', 'TP018', NULL);
GO

-- =========================================================================
-- PHẦN 2: DỮ LIỆU NGƯỜI DÙNG & VAI TRÒ
-- Ghi chú: Đã thay thế toàn bộ mật khẩu bằng chuỗi mã hóa Bcrypt
-- =========================================================================

-- 1. Người Dùng
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai, NgayTao) VALUES
-- Admin & Staff
('AD001', N'Admin Hệ Thống', 'admin@example.com', '0900000000', '$2a$10$clZ4L9Y/E2HwH0X8W8G.Ou4A6N0f9p1YV2F3.A2j6z7.B8f5.G.mG', N'Đà Nẵng', 1, GETDATE()),
('ST001', N'Lê Nhân Viên', 'staff@example.com', '0905111222', '$2a$10$vM8tX7F9zD3yPzS8W8X8Z8ueG2f5L5gX6f9f5f5f5f5f5f5f5f5f5', N'Quận Thanh Khê, Đà Nẵng', 1,GETDATE()),

-- Khách Hàng (Mật khẩu: 123456)
('ND010', N'Khách hàng A', 'nd010@gmail.com', '0909000010', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Đà Nẵng', 1, GETDATE()),
('ND011', N'Khách hàng B', 'nd011@gmail.com', '0909000011', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Đà Nẵng', 1, GETDATE()),
('KH001', N'Phạm Khách Hàng', 'customer1@example.com', '0905333444', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Ngũ Hành Sơn, Đà Nẵng', 1, GETDATE()),
('KH002', N'Đỗ Minh Quân', 'customer2@example.com', '0905555666', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Sơn Trà, Đà Nẵng', 1, GETDATE()),

-- Người Giúp Việc (Mật khẩu: 123456)
('ND001', N'Nguyễn Thị Lan', 'lanmaid@gmail.com', '0912345678', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Nha Trang', 1, GETDATE()),
('ND012', N'Lê Thị Mai', 'nd012@gmail.com', '0909000012', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Hải Châu, Đà Nẵng', 1, GETDATE()),
('ND013', N'Phạm Thị Hoa', 'nd013@gmail.com', '0909000013', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Sơn Trà, Đà Nẵng', 1, GETDATE()),
('ND014', N'Võ Thị Hạnh', 'nd014@gmail.com', '0909000014', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Thanh Khê, Đà Nẵng', 1, GETDATE()),
('GV001', N'Nguyễn Thị Hoa', 'hoanguyen@example.com', '0912345678', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'123 Hải Phòng, Đà Nẵng', 1, GETDATE()),
('GV002', N'Trần Văn Nam', 'namtran@example.com', '0987654321', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'456 Lê Duẩn, Đà Nẵng', 1, GETDATE()),
('GV003', N'Bùi Thị Tám', 'tam@example.com', '0905777888', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Liên Chiểu, Đà Nẵng', 1, GETDATE());
GO

-- 2. Gán Vai Trò (Đã chuẩn hóa mã vai trò: VT001=Admin, VT002=Staff, VT003=Khách, VT004=Giúp việc)
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro, NgayGan) VALUES
('AD001', 'VT001', GETDATE()),
('ST001', 'VT002', GETDATE()),
('ND010', 'VT003', GETDATE()), ('ND011', 'VT003', GETDATE()),
('KH001', 'VT003', GETDATE()), ('KH002', 'VT003', GETDATE()),
('ND001', 'VT004', GETDATE()), ('ND012', 'VT004', GETDATE()), 
('ND013', 'VT004', GETDATE()), ('ND014', 'VT004', GETDATE()),
('GV001', 'VT004', GETDATE()), ('GV002', 'VT004', GETDATE()), ('GV003', 'VT004', GETDATE());
GO

-- =========================================================================
-- PHẦN 3: HỒ SƠ & KỸ NĂNG NGƯỜI GIÚP VIỆC
-- =========================================================================

-- 1. Hồ Sơ (Đã sửa lỗi trùng lặp mã HS001 trong kịch bản gốc)
INSERT INTO HoSoNguoiGiupViec (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh, TenNguoiThan, SDTNguoiThan, TrangThaiXacMinh, AnhChanDung) VALUES
('HS001', 'ND001', '079123456789', '1995-05-10', N'Nữ', N'Nguyễn Văn A', '0987654321', N'Đã duyệt', NULL),
('HS010', 'ND012', '012345678910', '1995-04-12', N'Nữ', N'Nguyễn Văn A', '0901000010', N'Đã duyệt', 'https://example.com/avatar_10.jpg'),
('HS011', 'ND013', '012345678911', '1992-08-20', N'Nữ', N'Lê Văn B', '0901000011', N'Chờ duyệt', 'https://example.com/avatar_11.jpg'),
('HS012', 'ND014', '012345678912', '1998-02-14', N'Nữ', N'Phạm Văn C', '0901000012', N'Đã duyệt', 'https://example.com/avatar_12.jpg'),
('HS021', 'GV001', '123456789012', '1990-05-15', N'Nữ', N'Nguyễn Văn Hùng', '0911223344', N'Đã duyệt', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'),
('HS022', 'GV002', '987654321098', '1985-10-20', N'Nam', N'Trần Thị Mai', '0922334455', N'Đã duyệt', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'),
('HS023', 'GV003', '112233445566', '1992-03-10', N'Nữ', N'Bùi Văn Chín', '0905123123', N'Chờ duyệt', 'https://images.unsplash.com/photo-1594744803329-05206259021e?w=400');
GO

-- 2. Kỹ Năng Người Giúp Việc
INSERT INTO KyNangNguoiGiupViec (MaKyNang, MaHoSo, KinhNghiem) VALUES
('KN001', 'HS001', N'2 năm kinh nghiệm dọn dẹp'), ('KN002', 'HS001', N'Biết nấu ăn gia đình'), ('KN005', 'HS001', N'Giặt ủi chuyên nghiệp'),
('KN001', 'HS010', N'3 năm'), ('KN002', 'HS010', N'2 năm'), ('KN003', 'HS010', N'1 năm'),
('KN001', 'HS011', N'4 năm'), ('KN005', 'HS011', N'1 năm'), ('KN004', 'HS011', N'2 năm'),
('KN003', 'HS012', N'6 tháng'), ('KN004', 'HS012', N'1 năm');
GO

-- =========================================================================
-- PHẦN 4: LỊCH RẢNH VÀ ĐƠN ĐẶT DỊCH VỤ
-- =========================================================================

-- 1. Lịch Rảnh & Chi tiết lịch rảnh
INSERT INTO LichRanh (MaLichRanh, MaNguoiGiupViec, Ngay) VALUES
('LR001', 'ND001', '2026-05-06'), ('LR002', 'ND001', '2026-05-07'), ('LR003', 'ND001', '2026-05-08'),
('LR100', 'ND012', '2026-05-10'), ('LR101', 'ND013', '2026-05-10'), ('LR102', 'ND001', '2026-05-10'),
('LR103', 'ND012', '2026-05-10'), ('LR104', 'ND012', '2026-05-11'), ('LR105', 'ND013', '2026-05-11'),
('LR106', 'ND001', '2026-05-11'), ('LR107', 'ND013', '2026-05-11'), ('LR200', 'ND012', '2026-05-12'),
('LR201', 'ND001', '2026-05-12');

INSERT INTO LichRanhCaLamViec (MaLichRanh, MaCaLamViec, GhiChu) VALUES
('LR100', 'CA001', N'08-10'), ('LR100', 'CA002', N'10-12'),
('LR101', 'CA001', N'08-10'), ('LR101', 'CA002', N'10-12'),
('LR102', 'CA001', N'08-10'), ('LR102', 'CA002', N'10-12'),
('LR103', 'CA001', N'08-10'), ('LR103', 'CA002', N'10-12'),
('LR104', 'CA003', N'13-15'), ('LR104', 'CA004', N'15-17'),
('LR105', 'CA003', N'13-15'), ('LR105', 'CA004', N'15-17'),
('LR106', 'CA003', N'13-15'), ('LR106', 'CA004', N'15-17'),
('LR107', 'CA003', N'13-15'), ('LR107', 'CA004', N'15-17'),
('LR200', 'CA003', N'13-15'), ('LR200', 'CA004', N'15-17'),
('LR201', 'CA003', N'13-15'), ('LR201', 'CA004', N'15-17');
GO

-- 2. Đơn Đặt
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu) VALUES
('DD010', 'ND010', NULL, N'123 Lê Duẩn, Hải Châu, Đà Nẵng', 1, 180000, '2026-05-05 10:00:00', N'Nhà nhiều bụi, cần dọn dẹp kỹ'),
('DD011', 'ND010', NULL, N'123 Lê Duẩn, Hải Châu, Đà Nẵng', 2, 300000, '2026-05-05 11:00:00', N'Có trẻ nhỏ, ưu tiên người chăm trẻ'),
('DD012', 'ND011', NULL, N'45 Trần Phú, Hải Châu, Đà Nẵng', 1, 240000, '2026-05-06 09:00:00', N'Cần nấu ăn và phụ bếp'),
('DD013', 'ND011', NULL, N'78 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng', 1, 160000, '2026-05-06 14:00:00', N'Có người lớn tuổi cần hỗ trợ'),
('DD020', 'ND010', NULL, N'99 Nguyễn Văn Linh, Đà Nẵng', 1, 300000, GETDATE(), N'Đơn test 2 dịch vụ'),
('DD001', 'KH001', 'ST001', N'Sơn Trà, Đà Nẵng', 1, 120000, GETDATE(), N'Dọn dẹp nhà cửa'),
('DD002', 'KH002', 'ST001', N'Hải Châu, Đà Nẵng', 2, 300000, DATEADD(DAY, -1, GETDATE()), N'Tổng vệ sinh'),
('DD003', 'KH001', NULL, N'Thanh Khê, Đà Nẵng', 1, 80000, GETDATE(), N'Nấu ăn');
GO

-- 3. Đơn Đặt - Dịch Vụ
INSERT INTO DonDatDichVu (MaDonDatDichVu, MaDon, MaDichVu) VALUES
('DDV10', 'DD010', 'DV001'),
('DDV11', 'DD011', 'DV004'),
('DDV12', 'DD012', 'DV003'),
('DDV13', 'DD013', 'DV005'),
('DDV20', 'DD020', 'DV001'), 
('DDV21', 'DD020', 'DV003');
GO

-- 4. Ngày Làm Việc & Chi tiết
INSERT INTO NgayLamViec (MaNgayLamViec, MaDonDatDichVu, MaNguoiGiupViec, GioBatDau, NgayLam, ThoiGianPhanCong, TrangThai) VALUES
('NLV10', 'DDV10', NULL, '08:00:00', '2026-05-10', NULL, N'Chờ phân công'),
('NLV11', 'DDV11', NULL, '09:00:00', '2026-05-10', NULL, N'Chờ phân công'),
('NLV12', 'DDV12', NULL, '13:00:00', '2026-05-11', NULL, N'Chờ phân công'),
('NLV13', 'DDV13', NULL, '14:00:00', '2026-05-11', NULL, N'Chờ phân công'),
('NLV20', 'DDV20', NULL, '13:00:00', '2026-05-12', NULL, N'Chờ phân công'),
('NLV21', 'DDV21', NULL, '13:00:00', '2026-05-12', NULL, N'Chờ phân công'),
('NLV90', 'DDV10', 'ND012', '08:00:00', '2026-05-10', GETDATE(), N'Đã phân công'),
('NLV91', 'DDV12', 'ND013', '14:00:00', '2026-05-11', GETDATE(), N'Đã phân công');

INSERT INTO DonDatDichVuNgayLamViec (MaDonDatDichVu, MaNgayLamViec, ThoiGianThucHien) VALUES
('DDV10', 'NLV10', 240), ('DDV11', 'NLV11', 180),
('DDV12', 'NLV12', 180), ('DDV13', 'NLV13', 120),
('DDV10', 'NLV90', 240), ('DDV12', 'NLV91', 180),
('DDV20', 'NLV20', 60),  ('DDV21', 'NLV21', 120);
GO

-- =========================================================================
-- PHẦN 5: LỊCH SỬ, THANH TOÁN, KHIẾU NẠI & ĐÁNH GIÁ
-- =========================================================================

-- 1. Lịch Sử Trạng Thái Đơn
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai) VALUES
('LS010', 'DD010', '2026-05-05 10:00:00', N'Chờ xác nhận'),
('LS011', 'DD011', '2026-05-05 11:00:00', N'Chờ xác nhận'),
('LS012', 'DD012', '2026-05-06 09:00:00', N'Chờ xác nhận'),
('LS013', 'DD013', '2026-05-06 14:00:00', N'Chờ xác nhận'),
('LS014', 'DD020', '2026-05-07 16:00:00', N'Chờ xác nhận'),
('LS001', 'DD001', GETDATE(), N'Hoàn thành'),
('LS002', 'DD002', GETDATE(), N'Đang thực hiện'),
('LS003', 'DD003', GETDATE(), N'Chờ xác nhận');
GO

-- 2. Thanh Toán
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES
('TT010', 'DD010', N'Chưa thanh toán'), ('TT011', 'DD011', N'Đã thanh toán'),
('TT012', 'DD012', N'Chưa thanh toán'), ('TT013', 'DD013', N'Chưa thanh toán'),
('TT001', 'DD001', N'Đã thanh toán'),   ('TT002', 'DD002', N'Đã thanh toán'),
('TT003', 'DD003', N'Chưa thanh toán');
GO

-- 3. Khiếu Nại & Đánh Giá
INSERT INTO KhieuNai (MaKhieuNai, MaDon, MaKhachHang, MaNhanVien, NoiDung, ThoiGian, TrangThai) VALUES 
('KN001', 'DD001', 'KH001', 'ST001', N'Nhân viên đến muộn 15 phút', GETDATE(), N'Chờ xử lý');

INSERT INTO DanhGia (MaDanhGia, MaDon, SoSao) VALUES 
('DG001', 'DD001', 5), ('DG002', 'DD002', 4);
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
