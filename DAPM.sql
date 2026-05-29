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

-- =========================================================================
-- PHẦN 1: KHỞI TẠO CẤU TRÚC BẢNG (DDL)
-- =========================================================================

-- 1. NguoiDung
CREATE TABLE NguoiDung (
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

-- 2. VaiTro
CREATE TABLE VaiTro (
    MaVaiTro CHAR(5) PRIMARY KEY,
    TenVaiTro NVARCHAR(50),
    MoTa NVARCHAR(200)
);

-- 3. NguoiDungVaiTro
CREATE TABLE NguoiDungVaiTro (
    MaNguoiDung CHAR(5) NOT NULL,
    MaVaiTro CHAR(5) NOT NULL,
    NgayGan DATETIME DEFAULT GETDATE(),
    PRIMARY KEY(MaNguoiDung, MaVaiTro),
    FOREIGN KEY(MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY(MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

-- 4. HoSoNguoiGiupViec
CREATE TABLE HoSoNguoiGiupViec (
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

-- 5. CaLamViec
CREATE TABLE CaLamViec (
    MaCaLamViec CHAR(5) PRIMARY KEY,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL
);

-- 6. LichRanh
CREATE TABLE LichRanh (
    MaLichRanh CHAR(5) PRIMARY KEY,
    MaNguoiGiupViec CHAR(5) NOT NULL,
    Ngay DATE NOT NULL,
    FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 7. LichRanhCaLamViec
CREATE TABLE LichRanhCaLamViec (
    MaLichRanh CHAR(5) NOT NULL,
    MaCaLamViec CHAR(5) NOT NULL,
    ThoiGianTao DATETIME DEFAULT GETDATE(),
    PRIMARY KEY(MaLichRanh, MaCaLamViec),
    FOREIGN KEY(MaLichRanh) REFERENCES LichRanh(MaLichRanh),
    FOREIGN KEY(MaCaLamViec) REFERENCES CaLamViec(MaCaLamViec)
);

-- 8. KyNang
CREATE TABLE KyNang (
    MaKyNang CHAR(5) PRIMARY KEY,
    TenKyNang NVARCHAR(50),
    MoTa NVARCHAR(255), 
    IconName VARCHAR(50)
);

-- 9. KyNangNguoiGiupViec
CREATE TABLE KyNangNguoiGiupViec (
    MaKyNang CHAR(5) NOT NULL,
    MaHoSo CHAR(5) NOT NULL,
    KinhNghiem NVARCHAR(200),
    PRIMARY KEY(MaKyNang, MaHoSo),
    FOREIGN KEY(MaKyNang) REFERENCES KyNang(MaKyNang),
    FOREIGN KEY(MaHoSo) REFERENCES HoSoNguoiGiupViec(MaHoSo)
);

-- 10. ThanhPhan
CREATE TABLE ThanhPhan (
    MaThanhPhan CHAR(5) PRIMARY KEY,
    TenThanhPhan NVARCHAR(200)
);

-- 11. DichVu
CREATE TABLE DichVu (
    MaDichVu CHAR(5) PRIMARY KEY,
    MaKyNang CHAR(5),
    TenDichVu NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500),
    GiaTheoGio DECIMAL(18, 2),
    HinhAnh VARCHAR(255),
    PhoBien BIT DEFAULT 0,
    TrangThai NVARCHAR(30) DEFAULT N'Đang hoạt động',
    FOREIGN KEY (MaKyNang) REFERENCES KyNang(MaKyNang)
);

-- 12. DichVuThanhPhan
CREATE TABLE DichVuThanhPhan (
    MaDichVu CHAR(5) NOT NULL,
    MaThanhPhan CHAR(5) NOT NULL,
    GhiChu NVARCHAR(100),
    PRIMARY KEY(MaDichVu, MaThanhPhan),
    FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu),
    FOREIGN KEY(MaThanhPhan) REFERENCES ThanhPhan(MaThanhPhan)
);

-- 13. DonDat
CREATE TABLE DonDat (
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

-- 14. DonDatDichVu
CREATE TABLE DonDatDichVu (
    MaDonDatDichVu CHAR(5) PRIMARY KEY,
    MaDon CHAR(5) NOT NULL,
    MaDichVu CHAR(5) NOT NULL,
    FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon),
    FOREIGN KEY(MaDichVu) REFERENCES DichVu(MaDichVu)
);

-- 15. NgayLamViec
CREATE TABLE NgayLamViec (
    MaNgayLamViec CHAR(5) PRIMARY KEY,
    MaDonDatDichVu CHAR(5) NOT NULL,
    MaNguoiGiupViec CHAR(5),
    NgayLam DATE,
    GioBatDau TIME,
    GioKetThuc TIME,
    ThoiLuongThucHien INT,
    ThoiGianPhanCong DATETIME,
    TrangThai NVARCHAR(30),  
    FOREIGN KEY(MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
    FOREIGN KEY(MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);

-- 16. ThuNhapNguoiGiupViec
CREATE TABLE ThuNhapNguoiGiupViec (
    MaThuNhap CHAR(5) PRIMARY KEY,
    MaNgayLamViec CHAR(5) NOT NULL,
    SoTien DECIMAL(10,2),
	TrangThai NVARCHAR(30), 
	ThoiGianTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);
-- 17. ThanhToan
CREATE TABLE ThanhToan (
    MaThanhToan CHAR(5) PRIMARY KEY,
    MaDon CHAR(5) NOT NULL,
    TrangThaiThanhToan NVARCHAR(50),
    FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 18. LichSuTrangThaiDon
CREATE TABLE LichSuTrangThaiDon (
    MaLichSu CHAR(5) PRIMARY KEY,
    MaDon CHAR(5) NOT NULL,
    ThoiGianCapNhat DATETIME,
    TrangThai NVARCHAR(100),
    FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 19. DanhGia
CREATE TABLE DanhGia (
    MaDanhGia CHAR(5) PRIMARY KEY,
    MaDon CHAR(5) NOT NULL,
    SoSao INT,
    NoiDung NVARCHAR(255),
    FOREIGN KEY(MaDon) REFERENCES DonDat(MaDon)
);

-- 20. KhieuNai
CREATE TABLE KhieuNai (
    MaKhieuNai CHAR(5) PRIMARY KEY,
    MaNgayLamViec CHAR(5) NOT NULL,
    MaKhachHang CHAR(5) NOT NULL,
    MaNhanVien CHAR(5) NULL,
    NoiDung NVARCHAR(255),              
    ThoiGian DATETIME DEFAULT GETDATE(), 
    TrangThai NVARCHAR(30) DEFAULT N'Chờ xử lý',
    PhanHoi NVARCHAR(255),              
    FOREIGN KEY(MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec),
    FOREIGN KEY(MaKhachHang) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY(MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO 

-- =========================================================================
-- PHẦN 2: TẠO RÀNG BUỘC (CONSTRAINTS)
-- =========================================================================

ALTER TABLE LichSuTrangThaiDon ADD CONSTRAINT CHK_TrangThaiDon CHECK (TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đang thực hiện', N'Hoàn thành', N'Có sự cố', N'Hủy đơn'));
ALTER TABLE NgayLamViec ADD CONSTRAINT CHK_TrangThaiNgayLamViec CHECK (TrangThai IN (N'Chờ phân công', N'Đã phân công', N'Đang làm việc', N'Hoàn thành', N'Không đến làm', N'Hủy lịch'));
ALTER TABLE DichVu ADD CONSTRAINT CHK_TrangThaiDichVu CHECK (TrangThai IN (N'Đang hoạt động', N'Tạm ngưng', N'Ngừng cung cấp'));
ALTER TABLE KhieuNai ADD CONSTRAINT CHK_TrangThaiKhieuNai CHECK (TrangThai IN (N'Chờ xử lý', N'Đang xử lý', N'Đã xử lý'));
ALTER TABLE HoSoNguoiGiupViec ADD CONSTRAINT CHK_TrangThaiHoSoXacMinh CHECK (TrangThaiXacMinh IN (N'Chờ duyệt', N'Đã duyệt', N'Từ chối'));
ALTER TABLE CaLamViec ADD CONSTRAINT UQ_CaLamViec_Gio UNIQUE (GioBatDau, GioKetThuc);
ALTER TABLE ThuNhapNguoiGiupViec ADD CONSTRAINT CK_TrangThaiThuNhap CHECK (TrangThai IN (N'Chờ xác nhận',N'Đã xác nhận',N'Đã hủy'));

GO

-- =========================================================================
-- PHẦN 3: THÊM DỮ LIỆU (DML) - ĐÃ CHUẨN HÓA PREFIX VÀ ID (TĂNG TỪ 001)
-- =========================================================================

-- 1. VaiTro (Mặc định bắt đầu từ VT)
INSERT INTO VaiTro (MaVaiTro, TenVaiTro, MoTa) VALUES 
('VT001', N'Admin', N'Quản trị viên hệ thống'),
('VT002', N'Staff', N'Nhân viên'),
('VT003', N'Customer', N'Khách hàng'),
('VT004', N'Maid', N'Người giúp việc');

-- 2. KyNang (Tiền tố: KN)
INSERT INTO KyNang (MaKyNang, TenKyNang, MoTa, IconName) VALUES 
('KN001', N'Dọn dẹp nhà cửa', N'Vệ sinh, lau dọn, sắp xếp nhà cửa gọn gàng', 'cleaning'),
('KN002', N'Tổng vệ sinh', N'Làm sạch chuyên sâu toàn bộ không gian sống', 'deep_cleaning'),
('KN003', N'Nấu ăn gia đình', N'Chuẩn bị bữa ăn gia đình, đảm bảo dinh dưỡng', 'cooking'),
('KN004', N'Chăm sóc trẻ em', N'Trông trẻ, hỗ trợ ăn uống, học tập và vui chơi', 'childcare'),
('KN005', N'Chăm sóc người cao tuổi', N'Hỗ trợ sinh hoạt và chăm sóc người lớn tuổi', 'eldercare'),
('KN006', N'Giặt sofa và nệm', N'Vệ sinh sofa, nệm và khử khuẩn chuyên sâu', 'sofa_cleaning');

-- 3. ThanhPhan (Tiền tố: TP)
INSERT INTO ThanhPhan (MaThanhPhan, TenThanhPhan) VALUES 
('TP001', N'Quét & lau sàn'),       ('TP002', N'Lau bụi nội thất'),    ('TP003', N'Thu gom rác'),
('TP004', N'Tẩy vết bẩn cứng đầu'), ('TP005', N'Vệ sinh bếp & toilet'),('TP006', N'Hút bụi rèm cửa'),
('TP007', N'Lên thực đơn'),         ('TP008', N'Đi chợ mua đồ'),       ('TP009', N'Dọn dẹp sau nấu'),
('TP010', N'Cho bé ăn'),            ('TP011', N'Tắm rửa & thay đồ'),   ('TP012', N'Chơi cùng bé'),
('TP013', N'Hỗ trợ di chuyển'),     ('TP014', N'Nhắc uống thuốc'),     ('TP015', N'Trò chuyện tâm sự'),
('TP016', N'Hút bụi bằng máy'),     ('TP017', N'Tẩy ố bằng hơi nước'), ('TP018', N'Khử mùi diệt khuẩn');

-- 4. CaLamViec (Tiền tố: CA)
INSERT INTO CaLamViec (MaCaLamViec, GioBatDau, GioKetThuc) VALUES
('CA001', '08:00', '10:00'),
('CA002', '10:00', '12:00'),
('CA003', '13:00', '15:00'),
('CA004', '15:00', '17:00'),
('CA005', '18:00', '21:00'),
('CA006', '08:00', '14:00'),
('CA007', '14:00', '20:00'),
('CA008', '07:00', '13:00');

-- 5. DichVu (Tiền tố: DV)
INSERT INTO DichVu (MaDichVu, MaKyNang, TenDichVu, MoTa, GiaTheoGio, HinhAnh, PhoBien, TrangThai) VALUES 
('DV001','KN001', N'Dọn dẹp nhà cửa', N'Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.', 60000, 'dondepnhacua.png', 1, N'Đang hoạt động'),
('DV002','KN002', N'Tổng vệ sinh', N'Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.', 150000, 'tongvesinh.png', 0, N'Đang hoạt động'),
('DV003','KN003', N'Nấu ăn gia đình', N'Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.', 80000, 'nauan.png', 0, N'Đang hoạt động'),
('DV004','KN004', N'Chăm sóc trẻ em', N'Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.', 70000, 'chamsoctreem.png', 1, N'Đang hoạt động'),
('DV005','KN005', N'Chăm sóc người cao tuổi', N'Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.', 80000, 'chamsocnguoigia.png', 0, N'Đang hoạt động'),
('DV006','KN006', N'Giặt sofa & nệm', N'Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.', 250000, 'giatnem.png', 0, N'Đang hoạt động');

-- 6. DichVuThanhPhan
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES 
('DV001', 'TP001', N'Sử dụng nước lau sàn chuyên dụng'), ('DV001', 'TP002', NULL), ('DV001', 'TP003', NULL),
('DV002', 'TP004', N'Bao gồm tẩy mốc tường'),            ('DV002', 'TP005', NULL), ('DV002', 'TP006', NULL),
('DV003', 'TP007', NULL),                              ('DV003', 'TP008', N'Chi phí chợ khách hàng thanh toán riêng'), ('DV003', 'TP009', NULL),
('DV004', 'TP010', NULL),                              ('DV004', 'TP011', NULL), ('DV004', 'TP012', NULL),
('DV005', 'TP013', NULL),                              ('DV005', 'TP014', NULL), ('DV005', 'TP015', NULL),
('DV006', 'TP016', NULL),                              ('DV006', 'TP017', NULL), ('DV006', 'TP018', NULL);

-- 7. NguoiDung (Tiền tố theo vai trò: AD, NV, KH, GV)
INSERT INTO NguoiDung (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai, NgayTao) VALUES
('AD001', N'Admin Hệ Thống', 'admin@example.com', '0900000000', '$2a$10$clZ4L9Y/E2HwH0X8W8G.Ou4A6N0f9p1YV2F3.A2j6z7.B8f5.G.mG', N'Đà Nẵng', 1, GETDATE()),
('NV001', N'Lê Nhân Viên', 'staff@example.com', '0905111222', '$2a$10$vM8tX7F9zD3yPzS8W8X8Z8ueG2f5L5gX6f9f5f5f5f5f5f5f5f5f5', N'Quận Thanh Khê, Đà Nẵng', 1,GETDATE()),
('KH001', N'Khách hàng A', 'nd010@gmail.com', '0909000010', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Đà Nẵng', 1, GETDATE()),
('KH002', N'Khách hàng B', 'nd011@gmail.com', '0909000011', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Đà Nẵng', 1, GETDATE()),
('KH003', N'Phạm Khách Hàng', 'customer1@example.com', '0905333444', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Ngũ Hành Sơn, Đà Nẵng', 1, GETDATE()),
('KH004', N'Đỗ Minh Quân', 'customer2@example.com', '0905555666', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Sơn Trà, Đà Nẵng', 1, GETDATE()),
('GV001', N'Nguyễn Thị Lan', 'lanmaid@gmail.com', '2222222222', '$2a$11$/lqmXkq1sP9rn9D55z7NvuuTiU9g7ljzq3M/E7Pe4jGRhJLFvFKde', N'Nha Trang', 1, GETDATE()),
('GV002', N'Lê Thị Mai', 'nd012@gmail.com', '0909000012', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Hải Châu, Đà Nẵng', 1, GETDATE()),
('GV003', N'Phạm Thị Hoa', 'nd013@gmail.com', '0909000013', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Sơn Trà, Đà Nẵng', 1, GETDATE()),
('GV004', N'Võ Thị Hạnh', 'nd014@gmail.com', '0909000014', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Thanh Khê, Đà Nẵng', 1, GETDATE()),
('GV005', N'Nguyễn Thị Hoa', 'hoanguyen@example.com', '0912345678', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'123 Hải Phòng, Đà Nẵng', 1, GETDATE()),
('GV006', N'Trần Văn Nam', 'namtran@example.com', '0987654321', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'456 Lê Duẩn, Đà Nẵng', 1, GETDATE()),
('GV007', N'Bùi Thị Tám', 'tam@example.com', '0905777888', '$2a$10$P1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V1V', N'Quận Liên Chiểu, Đà Nẵng', 1, GETDATE());

-- 8. NguoiDungVaiTro
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro, NgayGan) VALUES
('AD001', 'VT001', GETDATE()), ('NV001', 'VT002', GETDATE()),
('KH001', 'VT003', GETDATE()), ('KH002', 'VT003', GETDATE()),
('KH003', 'VT003', GETDATE()), ('KH004', 'VT003', GETDATE()),
('GV001', 'VT004', GETDATE()), ('GV002', 'VT004', GETDATE()), 
('GV003', 'VT004', GETDATE()), ('GV004', 'VT004', GETDATE()),
('GV005', 'VT004', GETDATE()), ('GV006', 'VT004', GETDATE()), 
('GV007', 'VT004', GETDATE());

-- 9. HoSoNguoiGiupViec (Tiền tố: HS)
INSERT INTO HoSoNguoiGiupViec (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh, TenNguoiThan, SDTNguoiThan, TrangThaiXacMinh, AnhChanDung) VALUES
('HS001', 'GV001', '079123456789', '1995-05-10', N'Nữ', N'Nguyễn Văn A', '0987654321', N'Đã duyệt', NULL),
('HS002', 'GV002', '012345678910', '1995-04-12', N'Nữ', N'Nguyễn Văn A', '0901000010', N'Đã duyệt', NULL),
('HS003', 'GV003', '012345678911', '1992-08-20', N'Nữ', N'Lê Văn B', '0901000011', N'Đã duyệt', NULL),
('HS004', 'GV004', '012345678912', '1998-02-14', N'Nữ', N'Phạm Văn C', '0901000012', N'Đã duyệt', NULL),
('HS005', 'GV005', '123456789012', '1990-05-15', N'Nữ', N'Nguyễn Văn Hùng', '0911223344', N'Đã duyệt', NULL),
('HS006', 'GV006', '987654321098', '1985-10-20', N'Nam', N'Trần Thị Mai', '0922334455', N'Đã duyệt', NULL),
('HS007', 'GV007', '112233445566', '1992-03-10', N'Nữ', N'Bùi Văn Chín', '0905123123', N'Đã duyệt', NULL);

-- 10. KyNangNguoiGiupViec (Mã KN và Mã HS đã chuẩn hóa)
INSERT INTO KyNangNguoiGiupViec (MaKyNang, MaHoSo, KinhNghiem) VALUES
('KN001', 'HS001', N'2 năm kinh nghiệm dọn dẹp'), ('KN002', 'HS001', N'Biết nấu ăn gia đình'), ('KN005', 'HS001', N'Giặt ủi chuyên nghiệp'),
('KN001', 'HS002', N'3 năm'), ('KN002', 'HS002', N'2 năm'), ('KN003', 'HS002', N'1 năm'),
('KN001', 'HS003', N'4 năm'), ('KN005', 'HS003', N'1 năm'), ('KN004', 'HS003', N'2 năm'),
('KN003', 'HS004', N'6 tháng'), ('KN004', 'HS004', N'1 năm'),
('KN001', 'HS005', N'2 năm dọn dẹp'), ('KN002', 'HS005', N'1 năm nấu ăn'), 
('KN001', 'HS006', N'3 năm dọn dẹp'), ('KN005', 'HS007', N'1 năm giặt ủi');

-- 11. LichRanh (Tiền tố: LR)
INSERT INTO LichRanh (MaLichRanh, MaNguoiGiupViec, Ngay) VALUES
('LR001', 'GV001', DATEADD(DAY, 1, CAST(GETDATE() AS DATE))),
('LR002', 'GV002', DATEADD(DAY, 1, CAST(GETDATE() AS DATE))),
('LR003', 'GV003', DATEADD(DAY, 1, CAST(GETDATE() AS DATE))),
('LR004', 'GV001', DATEADD(DAY, 2, CAST(GETDATE() AS DATE))),
('LR005', 'GV002', DATEADD(DAY, 2, CAST(GETDATE() AS DATE))),
('LR006', 'GV003', DATEADD(DAY, 2, CAST(GETDATE() AS DATE))),
('LR007', 'GV004', DATEADD(DAY, 1, CAST(GETDATE() AS DATE))),
('LR008', 'GV004', DATEADD(DAY, 3, CAST(GETDATE() AS DATE))),
('LR009', 'GV002', '2026-06-20'), 
('LR010', 'GV001', '2026-06-21'),
('LR011', 'GV002', '2026-06-22'), 
('LR012', 'GV003', '2026-06-22'),
('LR013', 'GV002', '2026-06-23'), 
('LR014', 'GV002', '2026-06-24'),
('LR015', 'GV003', '2026-06-24'), 
('LR016', 'GV002', '2026-06-25'),
('LR017', 'GV003', '2026-06-25');

-- 12. LichRanhCaLamViec (Mã LR và CA đã chuẩn hóa)
INSERT INTO LichRanhCaLamViec (MaLichRanh, MaCaLamViec) VALUES
('LR001', 'CA001'), ('LR001', 'CA002'),
('LR002', 'CA001'), ('LR002', 'CA002'),
('LR003', 'CA001'), ('LR003', 'CA002'),
('LR004', 'CA006'), ('LR005', 'CA006'), 
('LR006', 'CA006'), ('LR007', 'CA008'), 
('LR008', 'CA007'), ('LR009', 'CA001'), 
('LR010', 'CA001'), ('LR011', 'CA001'), 
('LR012', 'CA001'), ('LR013', 'CA001'), 
('LR014', 'CA001'), ('LR015', 'CA001'), 
('LR016', 'CA001'), ('LR017', 'CA001');

-- 13. DonDat (Tiền tố: DD)
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu) VALUES
('DD001', 'KH001', NULL, N'123 Lê Duẩn, Hải Châu, Đà Nẵng', 1, 180000, '2026-05-05 10:00:00', N'Nhà nhiều bụi, cần dọn dẹp kỹ'),
('DD002', 'KH001', NULL, N'123 Lê Duẩn, Hải Châu, Đà Nẵng', 2, 300000, '2026-05-05 11:00:00', N'Có trẻ nhỏ, ưu tiên người chăm trẻ'),
('DD003', 'KH002', NULL, N'45 Trần Phú, Hải Châu, Đà Nẵng', 1, 240000, '2026-05-06 09:00:00', N'Cần nấu ăn và phụ bếp'),
('DD004', 'KH002', NULL, N'78 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng', 1, 160000, '2026-05-06 14:00:00', N'Có người lớn tuổi cần hỗ trợ'),
('DD005', 'KH001', NULL, N'99 Nguyễn Văn Linh, Đà Nẵng', 1, 300000, GETDATE(), N'Đơn test 2 dịch vụ'),
('DD006', 'KH003', 'NV001', N'Sơn Trà, Đà Nẵng', 1, 120000, GETDATE(), N'Dọn dẹp nhà cửa'),
('DD007', 'KH004', 'NV001', N'Hải Châu, Đà Nẵng', 2, 300000, DATEADD(DAY, -1, GETDATE()), N'Tổng vệ sinh'),
('DD008', 'KH003', NULL, N'Thanh Khê, Đà Nẵng', 1, 80000, GETDATE(), N'Nấu ăn'),
('DD009', 'KH001', NULL, N'Test 1 ngày 1 DV', 1, 120000, GETDATE(), NULL),
('DD010', 'KH001', NULL, N'Test 1 ngày 2 DV - 1 người', 1, 200000, GETDATE(), NULL),
('DD011', 'KH001', NULL, N'Test 1 ngày 2 DV - 2 người', 1, 220000, GETDATE(), NULL),
('DD012', 'KH001', NULL, N'Test nhiều ngày 1 DV', 2, 240000, GETDATE(), NULL),
('DD013', 'KH001', NULL, N'Test nhiều ngày 2 DV', 2, 420000, GETDATE(), NULL);

-- 14. DonDatDichVu (Tiền tố: DU)
INSERT INTO DonDatDichVu (MaDonDatDichVu, MaDon, MaDichVu) VALUES
('DU001', 'DD001', 'DV001'), ('DU002', 'DD002', 'DV004'),
('DU003', 'DD003', 'DV003'), ('DU004', 'DD004', 'DV005'),
('DU005', 'DD005', 'DV001'), ('DU006', 'DD005', 'DV003'),
('DU007', 'DD009', 'DV001'), ('DU008', 'DD010', 'DV001'), 
('DU009', 'DD010', 'DV003'), ('DU010', 'DD011', 'DV001'), 
('DU011', 'DD011', 'DV005'), ('DU012', 'DD012', 'DV001'), 
('DU013', 'DD013', 'DV003'), ('DU014', 'DD013', 'DV005');

-- 15. NgayLamViec (Tiền tố: NL)
INSERT INTO NgayLamViec (MaNgayLamViec, MaDonDatDichVu, MaNguoiGiupViec, NgayLam, GioBatDau, GioKetThuc, ThoiLuongThucHien, ThoiGianPhanCong, TrangThai) VALUES
('NL001', 'DU007', NULL, '2026-06-20', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL002', 'DU008', NULL, '2026-06-21', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL003', 'DU009', NULL, '2026-06-21', '10:00', '12:00', 2, NULL, N'Chờ phân công'),
('NL004', 'DU010', NULL, '2026-06-22', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL005', 'DU011', NULL, '2026-06-22', '10:00', '12:00', 2, NULL, N'Chờ phân công'),
('NL006', 'DU012', NULL, '2026-06-23', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL007', 'DU012', NULL, '2026-06-24', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL008', 'DU013', NULL, '2026-06-24', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL009', 'DU014', NULL, '2026-06-24', '10:00', '12:00', 2, NULL, N'Chờ phân công'),
('NL010', 'DU013', NULL, '2026-06-25', '08:00', '10:00', 2, NULL, N'Chờ phân công'),
('NL011', 'DU014', NULL, '2026-06-25', '10:00', '12:00', 2, NULL, N'Chờ phân công');

-- 16. ThanhToan (Tiền tố: TT)
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES
('TT001', 'DD001', N'Chưa thanh toán'), ('TT002', 'DD002', N'Đã thanh toán'),
('TT003', 'DD003', N'Chưa thanh toán'), ('TT004', 'DD004', N'Chưa thanh toán'),
('TT005', 'DD006', N'Đã thanh toán'),   ('TT006', 'DD007', N'Đã thanh toán'),
('TT007', 'DD008', N'Chưa thanh toán');

-- 17. LichSuTrangThaiDon (Tiền tố: LS)
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai) VALUES
('LS001', 'DD001', '2026-05-05 10:00:00', N'Chờ xác nhận'),
('LS002', 'DD002', '2026-05-05 11:00:00', N'Chờ xác nhận'),
('LS003', 'DD003', '2026-05-06 09:00:00', N'Chờ xác nhận'),
('LS004', 'DD004', '2026-05-06 14:00:00', N'Chờ xác nhận'),
('LS005', 'DD005', '2026-05-07 16:00:00', N'Chờ xác nhận'),
('LS006', 'DD006', GETDATE(), N'Hoàn thành'),
('LS007', 'DD007', GETDATE(), N'Đang thực hiện'),
('LS008', 'DD008', GETDATE(), N'Chờ xác nhận'),
('LS009', 'DD009', GETDATE(), N'Chờ xác nhận'),
('LS010', 'DD010', GETDATE(), N'Chờ xác nhận'),
('LS011', 'DD011', GETDATE(), N'Chờ xác nhận'),
('LS012', 'DD012', GETDATE(), N'Chờ xác nhận'),
('LS013', 'DD013', GETDATE(), N'Chờ xác nhận');

-- 18. DanhGia (Tiền tố: DG)
INSERT INTO DanhGia (MaDanhGia, MaDon, SoSao) VALUES 
('DG001', 'DD006', 5), ('DG002', 'DD007', 4);

-- 19. KhieuNai (Tiền tố: KN001 hoặc theo mã hóa khác. Giữ nguyên KN001 như cũ do khác bảng)
INSERT INTO KhieuNai (MaKhieuNai, MaNgayLamViec, MaKhachHang, MaNhanVien, NoiDung, ThoiGian, TrangThai) VALUES 
('KN001', 'NL001', 'KH003', 'NV001', N'Nhân viên đến muộn 15 phút', GETDATE(), N'Chờ xử lý');
GO
-- Hàm
CREATE PROCEDURE sp_TaoMaTuDong
    @Bang NVARCHAR(100),
    @Cot NVARCHAR(100),
    @Prefix CHAR(2),
    @MaMoi CHAR(5) OUTPUT -- Trả về mã mới qua tham số OUTPUT
AS
BEGIN
    DECLARE @So INT;
    DECLARE @SQL NVARCHAR(MAX);

    -- Chuẩn bị câu lệnh Dynamic SQL
    SET @SQL = '
        SELECT @SoOUT = ISNULL(MAX(CAST(RIGHT(' + @Cot + ',3) AS INT)), 0) + 1
        FROM ' + @Bang + '
        WHERE ' + @Cot + ' LIKE ''' + @Prefix + '%''
    ';

    -- Thực thi SQL động để lấy số tiếp theo
    EXEC sp_executesql 
        @SQL,
        N'@SoOUT INT OUTPUT',
        @SoOUT = @So OUTPUT;

    -- Định dạng mã mới và gán vào biến OUTPUT
    SET @MaMoi = @Prefix + RIGHT('000' + CAST(@So AS VARCHAR(3)), 3);
END;
GO
-- =========================================================================
-- KIỂM TRA LẠI DỮ LIỆU
-- =========================================================================
SELECT * FROM NguoiDung;
SELECT * FROM VaiTro;
SELECT * FROM NguoiDungVaiTro;
SELECT * FROM HoSoNguoiGiupViec;
SELECT * FROM KyNang;
SELECT * FROM KyNangNguoiGiupViec;

SELECT * FROM CaLamViec;
SELECT * FROM LichRanh;
SELECT * FROM LichRanhCaLamViec;

SELECT * FROM ThanhPhan;
SELECT * FROM DichVuThanhPhan;
SELECT * FROM DichVu;
SELECT * FROM DonDat;
SELECT * FROM DonDatDichVu;
SELECT * FROM NgayLamViec;

SELECT * FROM ThuNhapNguoiGiupViec;
SELECT * FROM ThanhToan;
SELECT * FROM LichSuTrangThaiDon;
SELECT * FROM KhieuNai;
GO
/*
Insert into LichSuTrangThaiDon
values ('LS015','DD014',GETDATE(),N'Đã xác nhận')

-- Thay 'NL012' bằng Mã Ngày Làm Việc bạn đang muốn test
UPDATE NgayLamViec
SET 
    -- 1. Cập nhật ngày làm việc thành ngày hôm nay
    NgayLam = GETDATE(),
    
    -- 2. Cập nhật giờ bắt đầu lùi lại 30 phút so với lúc bạn chạy lệnh này
    GioBatDau = CAST(DATEADD(MINUTE, -30, GETDATE()) AS TIME),
	GioKetThuc = CAST(DATEADD(MINUTE, ThoiLuongThucHien + 30, GETDATE()) AS TIME),
    
    -- 3. Đảm bảo trạng thái đang là "Đã phân công" để Frontend hiện nút
    TrangThai = N'Đã phân công'
	WHERE MaNgayLamViec = 'NL012';

INSERT INTO KhieuNai (
    MaKhieuNai,
    MaDon,
    MaKhachHang,
    MaNhanVien,
    NoiDung,
    TrangThai,
    PhanHoi
)
VALUES (
    'KN002',
    'DD001',         
    'NDUNG',
    NULL,
    N'Người giúp việc đến trễ hơn thời gian đã hẹn.',
    N'Chờ xử lý',
    NULL
);
*/


--TRƯỜNG THÊM TEST--

--Ngày 24.05.2026
--Dọn dẹp nhà cửa  2h (có người thay thế) -- Phân công lại cho Trần Văn Nam trước khi xác nhận đơn đặt
---để ca giặt sofa không có người thay thế
-- Giặt sofa 2h (không có người thay thế)
INSERT INTO LichRanh (MaLichRanh, MaNguoiGiupViec, Ngay) VALUES
('LR018', 'GV001', '2026-05-24'),
('LR019', 'GV004', '2026-05-24'),
('LR020', 'GV005', '2026-05-24'),
('LR021', 'GV006', '2026-05-24'),
('LR022', 'GV007', '2026-05-24');
GO
INSERT INTO LichRanhCaLamViec (MaLichRanh, MaCaLamViec) VALUES
('LR018', 'CA001'),
('LR018', 'CA002'),

('LR019', 'CA003'),

('LR020', 'CA001'),
('LR020', 'CA002'),

('LR021', 'CA001'),

('LR022', 'CA004');
GO

INSERT INTO KyNangNguoiGiupViec
(MaKyNang, MaHoSo, KinhNghiem)
VALUES
('KN006', 'HS005', N'2 năm giặt sofa'),
('KN006', 'HS006', N'1 năm vệ sinh nệm');
/*
INSERT INTO KhieuNai
(MaKhieuNai, MaNgayLamViec, MaKhachHang, MaNhanVien, NoiDung, ThoiGian, TrangThai)
VALUES
('KN002', 'NL012', 'NDUNG', 'NV001',
 N'Người giúp việc đến muộn và làm việc không đúng yêu cầu',
 GETDATE(),
 N'Chờ xử lý');

INSERT INTO KhieuNai
(MaKhieuNai, MaNgayLamViec, MaKhachHang, MaNhanVien, NoiDung, ThoiGian, TrangThai)
VALUES
('KN003', 'NL013', 'NDUNG', 'NV001',
 N'Người giúp việc báo hủy sát giờ, cần hỗ trợ thay thế',
 GETDATE(),
 N'Chờ xử lý');
GO
*/