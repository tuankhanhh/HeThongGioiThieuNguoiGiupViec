
--  dbHeThongGioiThieuNguoiGiupViec  –  PRODUCTION MINI SCRIPT

USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'dbHeThongGioiThieuNguoiGiupViec')
BEGIN
    ALTER DATABASE dbHeThongGioiThieuNguoiGiupViec SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE dbHeThongGioiThieuNguoiGiupViec;
END
GO

CREATE DATABASE dbHeThongGioiThieuNguoiGiupViec
    COLLATE Vietnamese_CI_AS;   -- hỗ trợ tiếng Việt có dấu
GO

USE dbHeThongGioiThieuNguoiGiupViec;
GO

-- ============================================================
--  CÀI ĐẶT: tắt thông báo dòng bị ảnh hưởng
-- ============================================================
SET NOCOUNT ON;
GO

-- ============================================================
-- ██████████████████████████████████████████████████████████
--  PHẦN 0 : TẠO BẢNG (giữ nguyên cấu trúc gốc, thêm
--            NOT NULL / DEFAULT / CHECK ngay khi CREATE)
-- ██████████████████████████████████████████████████████████
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. NguoiDung
-- ──────────────────────────────────────────────────────────
CREATE TABLE NguoiDung (
    MaNguoiDung     VARCHAR(5)      NOT NULL
        CONSTRAINT PK_NguoiDung PRIMARY KEY,
    HoTen           NVARCHAR(100)   NOT NULL,
    Email           VARCHAR(100)    NOT NULL
        CONSTRAINT UQ_NguoiDung_Email UNIQUE,
    SoDienThoai     VARCHAR(10)     NOT NULL,
    MatKhau         VARCHAR(100)    NOT NULL,
    DiaChi          NVARCHAR(200)   NULL,
    TrangThai       BIT             NOT NULL
        CONSTRAINT DF_NguoiDung_TrangThai DEFAULT 1,
    RefreshToken            VARCHAR(200)    NULL,
    NgayTao                 DATETIME        NOT NULL
        CONSTRAINT DF_NguoiDung_NgayTao DEFAULT GETDATE(),
    NgayTaoRefreshToken     DATETIME        --xóa not null
        CONSTRAINT DF_NguoiDung_NgayTaoRefreshToken DEFAULT GETDATE(),
    NgayHetHanRefreshToken  DATETIME        NULL,

    -- Email phải có đúng 1 ký tự '@' và ít nhất 1 '.' sau '@'
    CONSTRAINT CHK_NguoiDung_Email
        CHECK (Email LIKE '%_@_%_.%'),

    -- SoDienThoai đúng 10 chữ số
    CONSTRAINT CHK_NguoiDung_SDT
        CHECK (SoDienThoai LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),

    -- Ngày hết hạn token phải sau ngày tạo token
    CONSTRAINT CHK_NguoiDung_TokenExpiry
        CHECK (NgayHetHanRefreshToken IS NULL
               OR NgayHetHanRefreshToken > NgayTaoRefreshToken)
);
GO

-- ──────────────────────────────────────────────────────────
-- 2. VaiTro
-- ──────────────────────────────────────────────────────────
CREATE TABLE VaiTro (
    MaVaiTro    VARCHAR(5)      NOT NULL
        CONSTRAINT PK_VaiTro PRIMARY KEY,
    TenVaiTro   NVARCHAR(50)    NOT NULL
        CONSTRAINT UQ_VaiTro_Ten UNIQUE,
    MoTa        NVARCHAR(200)   NULL
);
GO

-- ──────────────────────────────────────────────────────────
-- 3. NguoiDungVaiTro
-- ──────────────────────────────────────────────────────────
CREATE TABLE NguoiDungVaiTro (
    MaNguoiDung VARCHAR(5)  NOT NULL,
    MaVaiTro    VARCHAR(5)  NOT NULL,
    NgayGan     DATETIME    NOT NULL
        CONSTRAINT DF_NDVaiTro_NgayGan DEFAULT GETDATE(),

    CONSTRAINT PK_NguoiDungVaiTro PRIMARY KEY (MaNguoiDung, MaVaiTro),
    CONSTRAINT FK_NDVaiTro_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT FK_NDVaiTro_VaiTro
        FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);
GO

-- ──────────────────────────────────────────────────────────
-- 4. HoSoNguoiGiupViec
-- ──────────────────────────────────────────────────────────
CREATE TABLE HoSoNguoiGiupViec (
    MaHoSo                  VARCHAR(5)      NOT NULL
        CONSTRAINT PK_HoSo PRIMARY KEY,
    MaNguoiGiupViec         VARCHAR(5)      NOT NULL,
    SoCCCD                  VARCHAR(12)     NOT NULL
        CONSTRAINT UQ_HoSo_CCCD UNIQUE,
    NgaySinh                DATE            NOT NULL,
    GioiTinh                NVARCHAR(10)    NOT NULL,
    KinhNghiem              NVARCHAR(200)   NULL,
    MoTaChiTietKinhNghiem   NVARCHAR(200)   NULL,
    TenNguoiThan            NVARCHAR(100)   NULL,
    SDTNguoiThan            VARCHAR(10)     NULL,
    AnhCCCDMatTruoc         VARCHAR(255)    NULL,
    AnhCCCDMatSau           VARCHAR(255)    NULL,
    AnhChanDung             VARCHAR(255)    NULL,
    GiayXacNhanCuTru        VARCHAR(255)    NULL,
    TrangThaiXacMinh        NVARCHAR(50)    NOT NULL
        CONSTRAINT DF_HoSo_TrangThai DEFAULT N'Chờ duyệt',
    LyDoTuChoi              NVARCHAR(200)   NULL,

    -- CCCD đúng 12 chữ số
    CONSTRAINT CHK_HoSo_CCCD
        CHECK (SoCCCD LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),

    -- Tuổi >= 18: NgaySinh <= GETDATE() - 18 năm
    CONSTRAINT CHK_HoSo_Tuoi
        CHECK (NgaySinh <= DATEADD(YEAR, -18, GETDATE())),

    -- Giới tính hợp lệ
    CONSTRAINT CHK_HoSo_GioiTinh
        CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),

    -- Trạng thái xác minh hợp lệ
    CONSTRAINT CHK_HoSo_TrangThai
        CHECK (TrangThaiXacMinh IN (N'Chờ duyệt', N'Đã duyệt', N'Từ chối')),

    CONSTRAINT FK_HoSo_NguoiDung
        FOREIGN KEY (MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ──────────────────────────────────────────────────────────
-- 5. LichRanh
-- ──────────────────────────────────────────────────────────
CREATE TABLE LichRanh (
    MaLichRanh      VARCHAR(5)  NOT NULL
        CONSTRAINT PK_LichRanh PRIMARY KEY,
    MaNguoiGiupViec VARCHAR(5)  NOT NULL,
    Ngay            DATE        NOT NULL,
    GioBatDau       TIME        NOT NULL,
    GioKetThuc      TIME        NOT NULL,

    -- Giờ bắt đầu < Giờ kết thúc
    CONSTRAINT CHK_LichRanh_Gio
        CHECK (GioBatDau < GioKetThuc),

    -- Không trùng lịch: (MaNguoiGiupViec, Ngay, GioBatDau) là duy nhất
    CONSTRAINT UQ_LichRanh_NguoiNgayGio
        UNIQUE (MaNguoiGiupViec, Ngay, GioBatDau),

    CONSTRAINT FK_LichRanh_NguoiDung
        FOREIGN KEY (MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ──────────────────────────────────────────────────────────
-- 6. KyNang
-- ──────────────────────────────────────────────────────────
CREATE TABLE KyNang (
    MaKyNang    VARCHAR(5)      NOT NULL
        CONSTRAINT PK_KyNang PRIMARY KEY,
    TenKyNang   NVARCHAR(50)    NOT NULL
        CONSTRAINT UQ_KyNang_Ten UNIQUE,
    MoTa        NVARCHAR(255)   NULL,
    IconName    VARCHAR(50)     NULL
);
GO

-- ──────────────────────────────────────────────────────────
-- 7. KyNangNguoiGiupViec
-- ──────────────────────────────────────────────────────────
CREATE TABLE KyNangNguoiGiupViec (
    MaKyNang    VARCHAR(5)  NOT NULL,
    MaHoSo      VARCHAR(5)  NOT NULL,
    NgayThem    DATETIME    NOT NULL
        CONSTRAINT DF_KyNangNGV_NgayThem DEFAULT GETDATE(),

    CONSTRAINT PK_KyNangNGV PRIMARY KEY (MaKyNang, MaHoSo),
    CONSTRAINT FK_KyNangNGV_KyNang
        FOREIGN KEY (MaKyNang) REFERENCES KyNang(MaKyNang),
    CONSTRAINT FK_KyNangNGV_HoSo
        FOREIGN KEY (MaHoSo) REFERENCES HoSoNguoiGiupViec(MaHoSo)
);
GO

-- ──────────────────────────────────────────────────────────
-- 8. ThanhPhan
-- ──────────────────────────────────────────────────────────
CREATE TABLE ThanhPhan (
    MaThanhPhan     VARCHAR(5)      NOT NULL
        CONSTRAINT PK_ThanhPhan PRIMARY KEY,
    TenThanhPhan    NVARCHAR(200)   NOT NULL
        CONSTRAINT UQ_ThanhPhan_Ten UNIQUE
);
GO

-- ──────────────────────────────────────────────────────────
-- 9. DichVu
-- ──────────────────────────────────────────────────────────
CREATE TABLE DichVu (
    MaDichVu    VARCHAR(5)      NOT NULL
        CONSTRAINT PK_DichVu PRIMARY KEY,
    TenDichVu   NVARCHAR(100)   NOT NULL,
    MoTa        NVARCHAR(500)   NULL,
    GiaTheoGio  DECIMAL(18,2)   NOT NULL,
    HinhAnh     VARCHAR(255)    NULL,
    PhoBien     BIT             NOT NULL
        CONSTRAINT DF_DichVu_PhoBien DEFAULT 0,
    TrangThai   NVARCHAR(30)    NOT NULL
        CONSTRAINT DF_DichVu_TrangThai DEFAULT N'Đang hoạt động',

    CONSTRAINT CHK_DichVu_Gia
        CHECK (GiaTheoGio > 0),

    CONSTRAINT CHK_DichVu_TrangThai
        CHECK (TrangThai IN (N'Đang hoạt động', N'Tạm ngưng', N'Ngừng cung cấp'))
);
GO

-- ──────────────────────────────────────────────────────────
-- 10. DichVuThanhPhan
-- ──────────────────────────────────────────────────────────
CREATE TABLE DichVuThanhPhan (
    MaDichVu    VARCHAR(5)      NOT NULL,
    MaThanhPhan VARCHAR(5)      NOT NULL,
    GhiChu      NVARCHAR(100)   NULL,

    CONSTRAINT PK_DichVuThanhPhan PRIMARY KEY (MaDichVu, MaThanhPhan),
    CONSTRAINT FK_DVTP_DichVu
        FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu),
    CONSTRAINT FK_DVTP_ThanhPhan
        FOREIGN KEY (MaThanhPhan) REFERENCES ThanhPhan(MaThanhPhan)
);
GO

-- ──────────────────────────────────────────────────────────
-- 11. DonDat
-- ──────────────────────────────────────────────────────────
CREATE TABLE DonDat (
    MaDon       VARCHAR(5)      NOT NULL
        CONSTRAINT PK_DonDat PRIMARY KEY,
    MaKhachhang VARCHAR(5)      NOT NULL,
    MaNhanVien  VARCHAR(5)      NULL,
    DiaChi      NVARCHAR(200)   NOT NULL,
    SoNgay      INT             NOT NULL,
    TongTien    DECIMAL(10,2)   NOT NULL
        CONSTRAINT DF_DonDat_TongTien DEFAULT 0,
    NgayDat     DATETIME        NOT NULL
        CONSTRAINT DF_DonDat_NgayDat DEFAULT GETDATE(),
    GhiChu      NVARCHAR(100)   NULL,

    CONSTRAINT CHK_DonDat_SoNgay
        CHECK (SoNgay > 0),
    CONSTRAINT CHK_DonDat_TongTien
        CHECK (TongTien >= 0),

    CONSTRAINT FK_DonDat_KhachHang
        FOREIGN KEY (MaKhachhang) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT FK_DonDat_NhanVien
        FOREIGN KEY (MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ──────────────────────────────────────────────────────────
-- 12. DonDatDichVu
-- ──────────────────────────────────────────────────────────
CREATE TABLE DonDatDichVu (
    MaDonDatDichVu  VARCHAR(5)  NOT NULL
        CONSTRAINT PK_DonDatDichVu PRIMARY KEY,
    MaDon           VARCHAR(5)  NOT NULL,
    MaDichVu        VARCHAR(5)  NOT NULL,

    CONSTRAINT FK_DDDV_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon),
    CONSTRAINT FK_DDDV_DichVu
        FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu)
);
GO

-- ──────────────────────────────────────────────────────────
-- 13. NgayLamViec
-- ──────────────────────────────────────────────────────────
CREATE TABLE NgayLamViec (
    MaNgayLamViec   VARCHAR(5)  NOT NULL
        CONSTRAINT PK_NgayLamViec PRIMARY KEY,
    MaDonDatDichVu  VARCHAR(5)  NOT NULL,
    MaNguoiGiupViec VARCHAR(5)  NULL,
    GioBatDau       TIME        NULL,
    NgayLam         DATE        NOT NULL,
    ThoiGianPhanCong DATETIME   NULL,
    TrangThai       NVARCHAR(30) NOT NULL
        CONSTRAINT DF_NLV_TrangThai DEFAULT N'Chờ phân công',

    CONSTRAINT CHK_NgayLamViec_TrangThai
        CHECK (TrangThai IN (N'Chờ phân công', N'Đã phân công', N'Hoàn thành', N'Đã hủy')),

    CONSTRAINT FK_NLV_DonDatDichVu
        FOREIGN KEY (MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
    CONSTRAINT FK_NLV_NguoiGiupViec
        FOREIGN KEY (MaNguoiGiupViec) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ──────────────────────────────────────────────────────────
-- 14. DonDatDichVuNgayLamViec
-- ──────────────────────────────────────────────────────────
CREATE TABLE DonDatDichVuNgayLamViec (
    MaDonDatDichVu  VARCHAR(5)  NOT NULL,
    MaNgayLamViec   VARCHAR(5)  NOT NULL,
    ThoiGianThucHien INT        NOT NULL
        CONSTRAINT DF_DDDVNgay_ThoiGian DEFAULT 0,

    CONSTRAINT PK_DDDVNgay PRIMARY KEY (MaDonDatDichVu, MaNgayLamViec),
    CONSTRAINT CHK_DDDVNgay_ThoiGian
        CHECK (ThoiGianThucHien >= 0),
    CONSTRAINT FK_DDDVNgay_DDDV
        FOREIGN KEY (MaDonDatDichVu) REFERENCES DonDatDichVu(MaDonDatDichVu),
    CONSTRAINT FK_DDDVNgay_NLV
        FOREIGN KEY (MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);
GO

-- ──────────────────────────────────────────────────────────
-- 15. ThuNhapNguoiGiupViec
-- ──────────────────────────────────────────────────────────
CREATE TABLE ThuNhapNguoiGiupViec (
    MaThuNhap       VARCHAR(5)      NOT NULL
        CONSTRAINT PK_ThuNhap PRIMARY KEY,
    MaNgayLamViec   VARCHAR(5)      NOT NULL
        CONSTRAINT UQ_ThuNhap_Ngay UNIQUE,   -- 1 ngày làm = 1 bản thu nhập
    SoTien          DECIMAL(10,2)   NOT NULL
        CONSTRAINT DF_ThuNhap_SoTien DEFAULT 0,

    CONSTRAINT CHK_ThuNhap_SoTien
        CHECK (SoTien >= 0),
    CONSTRAINT FK_ThuNhap_NLV
        FOREIGN KEY (MaNgayLamViec) REFERENCES NgayLamViec(MaNgayLamViec)
);
GO

-- ──────────────────────────────────────────────────────────
-- 16. ThanhToan
-- ──────────────────────────────────────────────────────────
CREATE TABLE ThanhToan (
    MaThanhToan         VARCHAR(5)      NOT NULL
        CONSTRAINT PK_ThanhToan PRIMARY KEY,
    MaDon               VARCHAR(5)      NOT NULL
        CONSTRAINT UQ_ThanhToan_Don UNIQUE,  -- 1 đơn = 1 bản thanh toán
    TrangThaiThanhToan  NVARCHAR(50)    NOT NULL
        CONSTRAINT DF_ThanhToan_TrangThai DEFAULT N'Chưa thanh toán',

    CONSTRAINT CHK_ThanhToan_TrangThai
        CHECK (TrangThaiThanhToan IN (
            N'Chưa thanh toán', N'Đã thanh toán',
            N'Hoàn tiền', N'Thanh toán thất bại')),

    CONSTRAINT FK_ThanhToan_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon)
);
GO

-- ──────────────────────────────────────────────────────────
-- 17. LichSuTrangThaiDon
-- ──────────────────────────────────────────────────────────
CREATE TABLE LichSuTrangThaiDon (
    MaLichSu        VARCHAR(5)      NOT NULL
        CONSTRAINT PK_LichSu PRIMARY KEY,
    MaDon           VARCHAR(5)      NOT NULL,
    ThoiGianCapNhat DATETIME        NOT NULL
        CONSTRAINT DF_LichSu_ThoiGian DEFAULT GETDATE(),
    TrangThai       NVARCHAR(100)   NOT NULL,

    CONSTRAINT FK_LichSu_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon)
);
GO

-- ──────────────────────────────────────────────────────────
-- 18. DanhGia
-- ──────────────────────────────────────────────────────────
CREATE TABLE DanhGia (
    MaDanhGia   VARCHAR(5)  NOT NULL
        CONSTRAINT PK_DanhGia PRIMARY KEY,
    MaDon       VARCHAR(5)  NOT NULL
        CONSTRAINT UQ_DanhGia_Don UNIQUE,   -- 1 đơn = 1 đánh giá
    SoSao       INT         NOT NULL,

    CONSTRAINT CHK_DanhGia_SoSao
        CHECK (SoSao BETWEEN 1 AND 5),

    CONSTRAINT FK_DanhGia_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon)
);
GO
/*
-- ──────────────────────────────────────────────────────────
-- 19. KhieuNai
-- ──────────────────────────────────────────────────────────
CREATE TABLE KhieuNai (
    MaKhieuNai  VARCHAR(5)  NOT NULL
        CONSTRAINT PK_KhieuNai PRIMARY KEY,
    MaDon       VARCHAR(5)  NOT NULL,
    MaKhachHang VARCHAR(5)  NOT NULL,
    MaNhanVien  VARCHAR(5)  NOT NULL,

    CONSTRAINT FK_KhieuNai_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon),
    CONSTRAINT FK_KhieuNai_KhachHang
        FOREIGN KEY (MaKhachHang) REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT FK_KhieuNai_NhanVien
        FOREIGN KEY (MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO
*/
-- ──────────────────────────────────────────────────────────
-- 19. KhieuNai (UPDATED)
-- ──────────────────────────────────────────────────────────
CREATE TABLE KhieuNai (
    MaKhieuNai  VARCHAR(5)  NOT NULL
        CONSTRAINT PK_KhieuNai PRIMARY KEY,

    MaDon       VARCHAR(5)  NOT NULL,
    MaKhachHang VARCHAR(5)  NOT NULL,
    MaNhanVien  VARCHAR(5)  NULL,  -- cho phép NULL khi chưa xử lý

    NoiDung     NVARCHAR(255) NOT NULL,
    ThoiGian    DATETIME NOT NULL
        CONSTRAINT DF_KhieuNai_ThoiGian DEFAULT GETDATE(),

    TrangThai   NVARCHAR(30) NOT NULL
        CONSTRAINT DF_KhieuNai_TrangThai DEFAULT N'Chờ xử lý',

    PhanHoi     NVARCHAR(255) NULL,

    CONSTRAINT CHK_KhieuNai_TrangThai
        CHECK (TrangThai IN (N'Chờ xử lý', N'Đang xử lý', N'Đã xử lý')),

    CONSTRAINT FK_KhieuNai_DonDat
        FOREIGN KEY (MaDon) REFERENCES DonDat(MaDon),

    CONSTRAINT FK_KhieuNai_KhachHang
        FOREIGN KEY (MaKhachHang) REFERENCES NguoiDung(MaNguoiDung),

    CONSTRAINT FK_KhieuNai_NhanVien
        FOREIGN KEY (MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO


-- NguoiDung
CREATE NONCLUSTERED INDEX IX_NguoiDung_Email
    ON NguoiDung(Email);

CREATE NONCLUSTERED INDEX IX_NguoiDung_SoDienThoai
    ON NguoiDung(SoDienThoai);

CREATE NONCLUSTERED INDEX IX_NguoiDung_TrangThai
    ON NguoiDung(TrangThai);

-- HoSoNguoiGiupViec
CREATE NONCLUSTERED INDEX IX_HoSo_MaNguoiGiupViec
    ON HoSoNguoiGiupViec(MaNguoiGiupViec);

CREATE NONCLUSTERED INDEX IX_HoSo_TrangThaiXacMinh
    ON HoSoNguoiGiupViec(TrangThaiXacMinh);

-- DonDat
CREATE NONCLUSTERED INDEX IX_DonDat_MaKhachHang
    ON DonDat(MaKhachhang);

CREATE NONCLUSTERED INDEX IX_DonDat_MaNhanVien
    ON DonDat(MaNhanVien);

CREATE NONCLUSTERED INDEX IX_DonDat_NgayDat
    ON DonDat(NgayDat DESC);

-- DonDatDichVu
CREATE NONCLUSTERED INDEX IX_DDDV_MaDon
    ON DonDatDichVu(MaDon);

CREATE NONCLUSTERED INDEX IX_DDDV_MaDichVu
    ON DonDatDichVu(MaDichVu);

-- NgayLamViec
CREATE NONCLUSTERED INDEX IX_NLV_MaNguoiGiupViec
    ON NgayLamViec(MaNguoiGiupViec);

CREATE NONCLUSTERED INDEX IX_NLV_TrangThai
    ON NgayLamViec(TrangThai);

CREATE NONCLUSTERED INDEX IX_NLV_NgayLam
    ON NgayLamViec(NgayLam DESC);

-- ThanhToan
CREATE NONCLUSTERED INDEX IX_ThanhToan_MaDon
    ON ThanhToan(MaDon);

-- LichSuTrangThaiDon
CREATE NONCLUSTERED INDEX IX_LichSu_MaDon
    ON LichSuTrangThaiDon(MaDon);

-- DanhGia
CREATE NONCLUSTERED INDEX IX_DanhGia_MaDon
    ON DanhGia(MaDon);
GO

-- ──────────────────────────────────────────────────────────
-- KyNang (6 dòng gốc)
-- ──────────────────────────────────────────────────────────
INSERT INTO KyNang (MaKyNang, TenKyNang, MoTa, IconName) VALUES
('KN001', N'Dọn dẹp nhà',       N'Vệ sinh, sắp xếp đồ đạc gọn gàng',              'cleaning'),
('KN002', N'Nấu ăn',            N'Thực đơn đa dạng, đảm bảo dinh dưỡng',           'cooking'),
('KN003', N'Chăm sóc trẻ',      N'Giữ trẻ, vui chơi, hỗ trợ học tập',             'childcare'),
('KN004', N'Chăm sóc người già', N'Hỗ trợ sinh hoạt, nhắc uống thuốc',             'eldercare'),
('KN005', N'Giặt ủi',           N'Giặt sấy, ủi quần áo cao cấp',                   'laundry'),
('KN006', N'Khác',              N'Các kỹ năng bổ trợ khác chuyên sâu',             'other');
GO

-- ──────────────────────────────────────────────────────────
-- ThanhPhan (18 dòng gốc)
-- ──────────────────────────────────────────────────────────
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
GO

-- ──────────────────────────────────────────────────────────
-- DichVu (6 dòng gốc)
-- ──────────────────────────────────────────────────────────
INSERT INTO DichVu (MaDichVu, TenDichVu, MoTa, GiaTheoGio, HinhAnh, PhoBien, TrangThai) VALUES
('DV001', N'Dọn dẹp nhà cửa',
    N'Làm sạch không gian sống, quét bụi, lau sàn và sắp xếp đồ đạc gọn gàng.',
    60000,  'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 1, N'Đang hoạt động'),
('DV002', N'Tổng vệ sinh',
    N'Làm sạch sâu mọi ngóc ngách, phù hợp cho nhà mới chuyển hoặc dịp lễ Tết.',
    150000, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 0, N'Đang hoạt động'),
('DV003', N'Nấu ăn gia đình',
    N'Đi chợ và chuẩn bị những bữa ăn ngon miệng, đảm bảo dinh dưỡng cho gia đình.',
    80000,  'https://images.unsplash.com/photo-1556910103-1c02745aae4d', 0, N'Đang hoạt động'),
('DV004', N'Chăm sóc trẻ em',
    N'Trông nom, chơi đùa và chăm sóc bữa ăn, giấc ngủ cho các bé khi bạn bận rộn.',
    70000,  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368', 1, N'Đang hoạt động'),
('DV005', N'Chăm sóc người cao tuổi',
    N'Hỗ trợ người lớn tuổi trong sinh hoạt hàng ngày với sự tận tâm và kiên nhẫn.',
    80000,  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', 0, N'Đang hoạt động'),
('DV006', N'Giặt sofa & nệm',
    N'Sử dụng máy móc chuyên dụng để hút bụi mịn, khử khuẩn và làm sạch sâu.',
    250000, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 0, N'Đang hoạt động');
GO

-- ──────────────────────────────────────────────────────────
-- DichVuThanhPhan (gốc)
-- ──────────────────────────────────────────────────────────
INSERT INTO DichVuThanhPhan (MaDichVu, MaThanhPhan, GhiChu) VALUES
('DV001','TP001', N'Sử dụng nước lau sàn chuyên dụng'),
('DV001','TP002', NULL),
('DV001','TP003', NULL),
('DV002','TP004', N'Bao gồm tẩy mốc tường'),
('DV002','TP005', NULL),
('DV002','TP006', NULL),
('DV003','TP007', NULL),
('DV003','TP008', N'Chi phí chợ khách hàng thanh toán riêng'),
('DV003','TP009', NULL),
('DV004','TP010', NULL),
('DV004','TP011', NULL),
('DV004','TP012', NULL),
('DV005','TP013', NULL),
('DV005','TP014', NULL),
('DV005','TP015', NULL),
('DV006','TP016', NULL),
('DV006','TP017', NULL),
('DV006','TP018', NULL);
GO


-- ──────────────────────────────────────────────────────────
-- VaiTro  (5 dòng)
-- ──────────────────────────────────────────────────────────
INSERT INTO VaiTro (MaVaiTro, TenVaiTro, MoTa) VALUES
('VT001', N'Quản trị viên', N'Toàn quyền quản lý hệ thống'),
('VT002', N'Nhân viên',     N'Xử lý đơn đặt và phân công'),
('VT003', N'Khách hàng',    N'Đặt dịch vụ và đánh giá'),
('VT004', N'Người giúp việc', N'Nhận và thực hiện công việc'),
('VT005', N'Kế toán',       N'Quản lý thu chi, thanh toán');
GO

-- ──────────────────────────────────────────────────────────
-- NguoiDung  (10 dòng: 2 nhân viên, 3 khách, 5 người giúp việc)
-- Mật khẩu lưu dạng bcrypt hash (mô phỏng)
-- ──────────────────────────────────────────────────────────
INSERT INTO NguoiDung
    (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai,
     NgayTao, NgayTaoRefreshToken, NgayHetHanRefreshToken)
VALUES
-- Quản trị viên / nhân viên
('ND001', N'Nguyễn Văn Quản',
    'admin@helpviec.vn',       '0901234567',
    '$2a$12$admin_hash_placeholder_001',
    N'123 Lê Duẩn, Hải Châu, Đà Nẵng',
    1, '2024-01-01', '2024-01-01', '2025-01-01'),

('ND002', N'Trần Thị Mai',
    'nhanvien01@helpviec.vn',  '0912345678',
    '$2a$12$staff_hash_placeholder_002',
    N'45 Phan Chu Trinh, Hải Châu, Đà Nẵng',
    1, '2024-01-05', '2024-01-05', '2025-01-05'),

-- Khách hàng
('ND003', N'Lê Thị Hoa',
    'hoa.le@gmail.com',        '0933445566',
    '$2a$12$kh_hash_placeholder_003',
    N'88 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng',
    1, '2024-02-10', '2024-02-10', '2025-02-10'),

('ND004', N'Phạm Văn Bình',
    'binh.pham@gmail.com',     '0944556677',
    '$2a$12$kh_hash_placeholder_004',
    N'12 Hoàng Diệu, Hải Châu, Đà Nẵng',
    1, '2024-02-15', '2024-02-15', '2025-02-15'),

('ND005', N'Võ Minh Tuấn',
    'tuan.vo@yahoo.com',       '0955667788',
    '$2a$12$kh_hash_placeholder_005',
    N'77 Trần Phú, Hải Châu, Đà Nẵng',
    1, '2024-03-01', '2024-03-01', '2025-03-01'),

-- Người giúp việc
('ND006', N'Nguyễn Thị Lan',
    'lan.nguyen@helpviec.vn',  '0966778899',
    '$2a$12$ngv_hash_placeholder_006',
    N'99 Ông Ích Khiêm, Thanh Khê, Đà Nẵng',
    1, '2024-01-20', '2024-01-20', '2025-01-20'),

('ND007', N'Trần Văn Hùng',
    'hung.tran@helpviec.vn',   '0977889900',
    '$2a$12$ngv_hash_placeholder_007',
    N'34 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng',
    1, '2024-01-25', '2024-01-25', '2025-01-25'),

('ND008', N'Lê Thị Bích',
    'bich.le@helpviec.vn',     '0988990011',
    '$2a$12$ngv_hash_placeholder_008',
    N'56 Điện Biên Phủ, Thanh Khê, Đà Nẵng',
    1, '2024-02-01', '2024-02-01', '2025-02-01'),

('ND009', N'Phạm Thị Thu',
    'thu.pham@helpviec.vn',    '0999001122',
    '$2a$12$ngv_hash_placeholder_009',
    N'21 Cách Mạng Tháng 8, Cẩm Lệ, Đà Nẵng',
    1, '2024-02-05', '2024-02-05', '2025-02-05'),

('ND010', N'Hoàng Văn Dũng',
    'dung.hoang@helpviec.vn',  '0900112233',
    '$2a$12$ngv_hash_placeholder_010',
    N'67 Hùng Vương, Hải Châu, Đà Nẵng',
    1, '2024-02-08', '2024-02-08', '2025-02-08');
GO

-- ──────────────────────────────────────────────────────────
-- NguoiDungVaiTro
-- ──────────────────────────────────────────────────────────
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro, NgayGan) VALUES
('ND001', 'VT001', '2024-01-01'),   -- admin
('ND002', 'VT002', '2024-01-05'),   -- nhân viên
('ND003', 'VT003', '2024-02-10'),   -- khách
('ND004', 'VT003', '2024-02-15'),   -- khách
('ND005', 'VT003', '2024-03-01'),   -- khách
('ND006', 'VT004', '2024-01-20'),   -- NGV
('ND007', 'VT004', '2024-01-25'),   -- NGV
('ND008', 'VT004', '2024-02-01'),   -- NGV
('ND009', 'VT004', '2024-02-05'),   -- NGV
('ND010', 'VT004', '2024-02-08');   -- NGV
GO

-- ──────────────────────────────────────────────────────────
-- HoSoNguoiGiupViec  (5 người giúp việc)
-- NgaySinh đảm bảo >= 18 tuổi so với GETDATE() (2026)
-- ──────────────────────────────────────────────────────────
INSERT INTO HoSoNguoiGiupViec
    (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh,
     KinhNghiem, MoTaChiTietKinhNghiem,
     TenNguoiThan, SDTNguoiThan,
     TrangThaiXacMinh)
VALUES
('HS001','ND006','038600012345','1990-03-15',N'Nữ',
    N'5 năm',    N'Dọn dẹp nhà, nấu ăn cho gia đình 4 người',
    N'Nguyễn Văn Tâm',  '0901111111', N'Đã duyệt'),

('HS002','ND007','038700023456','1988-07-22',N'Nam',
    N'3 năm',    N'Chăm sóc người cao tuổi tại bệnh viện tư',
    N'Trần Thị Ngọc',   '0902222222', N'Đã duyệt'),

('HS003','ND008','038800034567','1995-11-05',N'Nữ',
    N'2 năm',    N'Giữ trẻ, hỗ trợ học tập cho bé 3–7 tuổi',
    N'Lê Văn Hải',      '0903333333', N'Đã duyệt'),

('HS004','ND009','038900045678','1992-01-30',N'Nữ',
    N'4 năm',    N'Giặt ủi, vệ sinh sofa và nệm chuyên nghiệp',
    N'Phạm Quốc Huy',   '0904444444', N'Đã duyệt'),

('HS005','ND010','039000056789','1985-09-18',N'Nam',
    N'7 năm',    N'Tổng vệ sinh nhà, văn phòng, khách sạn',
    N'Hoàng Thị Liên',  '0905555555', N'Đã duyệt');
GO

-- ──────────────────────────────────────────────────────────
-- KyNangNguoiGiupViec
-- ──────────────────────────────────────────────────────────
INSERT INTO KyNangNguoiGiupViec (MaKyNang, MaHoSo, NgayThem) VALUES
('KN001','HS001','2024-01-21'),  -- Lan: dọn dẹp
('KN002','HS001','2024-01-21'),  -- Lan: nấu ăn
('KN004','HS002','2024-01-26'),  -- Hùng: chăm người già
('KN003','HS003','2024-02-02'),  -- Bích: chăm trẻ
('KN005','HS004','2024-02-06'),  -- Thu: giặt ủi
('KN001','HS005','2024-02-09'),  -- Dũng: dọn dẹp
('KN006','HS005','2024-02-09');  -- Dũng: khác
GO

-- ──────────────────────────────────────────────────────────
-- LichRanh  (mỗi NGV ≥ 1 lịch rảnh)
-- ──────────────────────────────────────────────────────────
INSERT INTO LichRanh (MaLichRanh, MaNguoiGiupViec, Ngay, GioBatDau, GioKetThuc) VALUES
('LR001','ND006','2024-05-06','07:00','12:00'),
('LR002','ND006','2024-05-07','08:00','17:00'),
('LR003','ND007','2024-05-06','13:00','18:00'),
('LR004','ND008','2024-05-08','07:00','11:00'),
('LR005','ND009','2024-05-09','08:00','16:00'),
('LR006','ND010','2024-05-10','07:30','12:30'),
('LR007','ND010','2024-05-11','13:00','17:00');
GO

-- ──────────────────────────────────────────────────────────
-- DonDat  (7 đơn)
-- ──────────────────────────────────────────────────────────
INSERT INTO DonDat (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu) VALUES
('DD001','ND003','ND002',N'88 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng', 3, 540000, '2024-05-01 09:00', N'Giúp dọn nhà trước khi chuyển'),
('DD002','ND003','ND002',N'88 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng', 2, 320000, '2024-05-03 10:30', NULL),
('DD003','ND004','ND002',N'12 Hoàng Diệu, Hải Châu, Đà Nẵng',         5, 700000, '2024-05-05 08:00', N'Nấu ăn cho gia đình 5 người'),
('DD004','ND004','ND002',N'12 Hoàng Diệu, Hải Châu, Đà Nẵng',         1, 250000, '2024-05-07 14:00', N'Tổng vệ sinh cuối tuần'),
('DD005','ND005','ND002',N'77 Trần Phú, Hải Châu, Đà Nẵng',            3, 210000, '2024-05-08 09:00', N'Chăm bé 4 tuổi'),
('DD006','ND003','ND002',N'88 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng', 4, 320000, '2024-05-10 11:00', N'Giặt sofa 2 bộ'),
('DD007','ND005','ND002',N'77 Trần Phú, Hải Châu, Đà Nẵng',            2, 160000, '2024-05-12 08:30', N'Chăm sóc bố bệnh');
GO

-- ──────────────────────────────────────────────────────────
-- DonDatDichVu
-- ──────────────────────────────────────────────────────────
INSERT INTO DonDatDichVu (MaDonDatDichVu, MaDon, MaDichVu) VALUES
('DD101','DD001','DV001'),   -- dọn dẹp nhà
('DD201','DD002','DV003'),   -- nấu ăn
('DD301','DD003','DV003'),   -- nấu ăn gia đình
('DD401','DD004','DV002'),   -- tổng vệ sinh
('DD501','DD005','DV004'),   -- chăm trẻ
('DD601','DD006','DV006'),   -- giặt sofa
('DD701','DD007','DV005');   -- chăm người cao tuổi
GO

-- ──────────────────────────────────────────────────────────
-- NgayLamViec
-- ──────────────────────────────────────────────────────────
INSERT INTO NgayLamViec
    (MaNgayLamViec, MaDonDatDichVu, MaNguoiGiupViec,
     GioBatDau, NgayLam, ThoiGianPhanCong, TrangThai)
VALUES
('NL001','DD101','ND006','07:00','2024-05-06','2024-05-04 10:00', N'Hoàn thành'),
('NL002','DD101','ND006','07:00','2024-05-07','2024-05-04 10:00', N'Hoàn thành'),
('NL003','DD201','ND006','08:00','2024-05-04','2024-05-03 15:00', N'Hoàn thành'),
('NL004','DD301','ND006','08:00','2024-05-06','2024-05-05 09:00', N'Hoàn thành'),
('NL005','DD401','ND010','07:30','2024-05-08','2024-05-07 16:00', N'Hoàn thành'),
('NL006','DD501','ND008','08:00','2024-05-09','2024-05-08 10:00', N'Hoàn thành'),
('NL007','DD601','ND009','08:00','2024-05-11','2024-05-10 12:00', N'Đã phân công'),
('NL008','DD701','ND007','09:00','2024-05-13','2024-05-12 09:00', N'Chờ phân công');
GO

-- ──────────────────────────────────────────────────────────
-- DonDatDichVuNgayLamViec
-- ──────────────────────────────────────────────────────────
INSERT INTO DonDatDichVuNgayLamViec (MaDonDatDichVu, MaNgayLamViec, ThoiGianThucHien) VALUES
('DD101','NL001', 180),
('DD101','NL002', 150),
('DD201','NL003', 120),
('DD301','NL004', 150),
('DD401','NL005', 240),
('DD501','NL006', 480),
('DD601','NL007', 180),
('DD701','NL008', 120);
GO

-- ──────────────────────────────────────────────────────────
-- ThuNhapNguoiGiupViec
-- ──────────────────────────────────────────────────────────
INSERT INTO ThuNhapNguoiGiupViec (MaThuNhap, MaNgayLamViec, SoTien) VALUES
('TN001','NL001', 162000),   -- 60k/h × 3h × 0.9
('TN002','NL002', 135000),
('TN003','NL003', 144000),   -- 80k/h × 2h × 0.9
('TN004','NL004', 144000),
('TN005','NL005', 180000),   -- 150k/h × ~1h × 0.9... (trả theo ca)
('TN006','NL006', 252000),   -- 70k/h × 4h × 0.9
('TN007','NL007', 0),        -- chưa thực hiện
('TN008','NL008', 0);
GO

-- ──────────────────────────────────────────────────────────
-- ThanhToan
-- ──────────────────────────────────────────────────────────
INSERT INTO ThanhToan (MaThanhToan, MaDon, TrangThaiThanhToan) VALUES
('TT001','DD001', N'Đã thanh toán'),
('TT002','DD002', N'Đã thanh toán'),
('TT003','DD003', N'Đã thanh toán'),
('TT004','DD004', N'Đã thanh toán'),
('TT005','DD005', N'Đã thanh toán'),
('TT006','DD006', N'Chưa thanh toán'),
('TT007','DD007', N'Chưa thanh toán');
GO

-- ──────────────────────────────────────────────────────────
-- LichSuTrangThaiDon
-- ──────────────────────────────────────────────────────────
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai) VALUES
('LS001','DD001','2024-05-01 09:00', N'Chờ xác nhận'),
('LS002','DD001','2024-05-01 09:30', N'Đã xác nhận'),
('LS003','DD001','2024-05-07 18:00', N'Hoàn thành'),
('LS004','DD002','2024-05-03 10:30', N'Chờ xác nhận'),
('LS005','DD002','2024-05-03 11:00', N'Đã xác nhận'),
('LS006','DD003','2024-05-05 08:00', N'Chờ xác nhận'),
('LS007','DD003','2024-05-05 08:30', N'Đã xác nhận'),
('LS008','DD004','2024-05-07 14:00', N'Chờ xác nhận'),
('LS009','DD005','2024-05-08 09:00', N'Chờ xác nhận'),
('LS010','DD006','2024-05-10 11:00', N'Chờ xác nhận'),
('LS011','DD007','2024-05-12 08:30', N'Chờ xác nhận');
GO

-- ──────────────────────────────────────────────────────────
-- DanhGia  (chỉ đơn đã hoàn thành)
-- ──────────────────────────────────────────────────────────
INSERT INTO DanhGia (MaDanhGia, MaDon, SoSao) VALUES
('DG001','DD001', 5),
('DG002','DD002', 4),
('DG003','DD003', 5),
('DG004','DD004', 4),
('DG005','DD005', 3);
GO

-- ──────────────────────────────────────────────────────────
-- KhieuNai  (1 khiếu nại mẫu)
-- ──────────────────────────────────────────────────────────
-- ──────────────────────────────────────────────────────────
-- KhieuNai (UPDATED DATA)
-- ──────────────────────────────────────────────────────────
INSERT INTO KhieuNai
    (MaKhieuNai, MaDon, MaKhachHang, MaNhanVien, NoiDung, TrangThai, PhanHoi)
VALUES
('KN001','DD005','ND005',NULL,
    N'Người giúp việc đến trễ 30 phút',
    N'Chờ xử lý', NULL),

('KN002','DD003','ND004','ND002',
    N'Không nấu đúng món đã yêu cầu',
    N'Đang xử lý', NULL),

('KN003','DD001','ND003','ND002',
    N'Dọn dẹp chưa sạch ở khu vực bếp',
    N'Đã xử lý',
    N'Đã nhắc nhở nhân viên và hoàn tiền 10%'),

('KN004','DD004','ND004',NULL,
    N'Tổng vệ sinh chưa kỹ',
    N'Chờ xử lý', NULL),

('KN005','DD002','ND003','ND002',
    N'Chất lượng dịch vụ chưa tốt',
    N'Đã xử lý',
    N'Đã xin lỗi và tặng voucher');
GO

-- ============================================================
-- ██████████████████████████████████████████████████████████
--  PHẦN D : TEST — KIỂM TRA DỮ LIỆU
-- ██████████████████████████████████████████████████████████
-- ============================================================

-- Kiểm tra các bảng master
SELECT * FROM NguoiDung;
SELECT * FROM VaiTro;
SELECT * FROM NguoiDungVaiTro;
SELECT * FROM HoSoNguoiGiupViec;
SELECT * FROM KyNang;
SELECT * FROM KyNangNguoiGiupViec;
SELECT * FROM LichRanh;

-- Kiểm tra dịch vụ
SELECT * FROM DichVu;
SELECT * FROM ThanhPhan;
SELECT * FROM DichVuThanhPhan;

-- Kiểm tra đơn đặt
SELECT * FROM DonDat;
SELECT * FROM DonDatDichVu;
SELECT * FROM NgayLamViec;
SELECT * FROM DonDatDichVuNgayLamViec;
SELECT * FROM ThuNhapNguoiGiupViec;

-- Kiểm tra tài chính & đánh giá
SELECT * FROM ThanhToan;
SELECT * FROM LichSuTrangThaiDon;
SELECT * FROM DanhGia;
SELECT * FROM KhieuNai;

-- ──────────────────────────────────────────────────────────
-- QUERY MẪU: Doanh thu theo dịch vụ
-- ──────────────────────────────────────────────────────────
SELECT
    dv.TenDichVu,
    COUNT(DISTINCT dd.MaDon)        AS SoDon,
    SUM(dd.TongTien)                AS TongDoanhThu
FROM DonDat dd
JOIN DonDatDichVu dddv ON dddv.MaDon = dd.MaDon
JOIN DichVu dv         ON dv.MaDichVu = dddv.MaDichVu
GROUP BY dv.TenDichVu
ORDER BY TongDoanhThu DESC;

-- ──────────────────────────────────────────────────────────
-- QUERY MẪU: Người giúp việc + điểm đánh giá trung bình
-- ──────────────────────────────────────────────────────────
SELECT
    nd.HoTen,
    hs.TrangThaiXacMinh,
    COUNT(nlv.MaNgayLamViec)        AS TongNgayLam,
    SUM(tn.SoTien)                  AS TongThuNhap,
    AVG(CAST(dg.SoSao AS FLOAT))    AS DiemTrungBinh
FROM NguoiDung nd
JOIN HoSoNguoiGiupViec hs ON hs.MaNguoiGiupViec = nd.MaNguoiDung
LEFT JOIN NgayLamViec nlv ON nlv.MaNguoiGiupViec = nd.MaNguoiDung
LEFT JOIN ThuNhapNguoiGiupViec tn ON tn.MaNgayLamViec = nlv.MaNgayLamViec
LEFT JOIN DonDatDichVu dddv ON dddv.MaDonDatDichVu = nlv.MaDonDatDichVu
LEFT JOIN DanhGia dg ON dg.MaDon = dddv.MaDon
GROUP BY nd.HoTen, hs.TrangThaiXacMinh
ORDER BY TongThuNhap DESC;
GO


--test staff
-- 1. NguoiDung mới
INSERT INTO NguoiDung
    (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai,
     NgayTao, NgayTaoRefreshToken, NgayHetHanRefreshToken)
VALUES
('ND011', N'Nguyễn Thị Hạnh',
    'hanh.nguyen@helpviec.vn', '0911002233',
    '$2a$12$test_hash_011',
    N'15 Lê Độ, Hải Châu, Đà Nẵng',
    1, GETDATE(), GETDATE(), NULL),

('ND012', N'Phạm Văn Long',
    'long.pham@helpviec.vn', '0911002234',
    '$2a$12$test_hash_012',
    N'28 Trần Cao Vân, Thanh Khê, Đà Nẵng',
    1, GETDATE(), GETDATE(), NULL);
GO

-- 2. Gán vai trò người giúp việc
INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro, NgayGan) VALUES
('ND011', 'VT004', GETDATE()),
('ND012', 'VT004', GETDATE());
GO

-- 3. Hồ sơ chờ duyệt
INSERT INTO HoSoNguoiGiupViec
    (MaHoSo, MaNguoiGiupViec, SoCCCD, NgaySinh, GioiTinh,
     KinhNghiem, MoTaChiTietKinhNghiem,
     TenNguoiThan, SDTNguoiThan,
     TrangThaiXacMinh, LyDoTuChoi)
VALUES
('HS006', 'ND011', '012345678901', '1993-06-15', N'Nữ',
    N'4 năm', N'Dọn dẹp nhà, nấu ăn gia đình, chăm bé',
    N'Nguyễn Văn Khoa', '0907777777',
    N'Chờ duyệt', NULL),

('HS007', 'ND012', '012345678902', '1990-09-20', N'Nam',
    N'2 năm', N'Vệ sinh nhà cửa, hỗ trợ người cao tuổi',
    N'Trần Thị Mai', '0908888888',
    N'Chờ duyệt', NULL);
GO

-- 4. Gán kỹ năng cho hồ sơ
INSERT INTO KyNangNguoiGiupViec (MaKyNang, MaHoSo, NgayThem) VALUES
('KN001', 'HS006', GETDATE()),
('KN003', 'HS006', GETDATE()),
('KN004', 'HS007', GETDATE());
GO

-- 1. Tạo 2 đơn mới
INSERT INTO DonDat
    (MaDon, MaKhachhang, MaNhanVien, DiaChi, SoNgay, TongTien, NgayDat, GhiChu)
VALUES
('DD008', 'ND003', 'ND002', N'88 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng',
    2, 320000, '2024-05-14 09:00', N'Dùng để test phân công'),

('DD009', 'ND004', 'ND002', N'12 Hoàng Diệu, Hải Châu, Đà Nẵng',
    1, 250000, '2024-05-14 10:00', N'Dùng để test từ chối');
GO

-- 2. Gắn dịch vụ cho đơn
INSERT INTO DonDatDichVu (MaDonDatDichVu, MaDon, MaDichVu) VALUES
('DD801', 'DD008', 'DV001'),
('DD901', 'DD009', 'DV004');
GO

-- 3. Tạo lịch làm việc ban đầu ở trạng thái chờ phân công
INSERT INTO NgayLamViec
    (MaNgayLamViec, MaDonDatDichVu, MaNguoiGiupViec, GioBatDau, NgayLam, ThoiGianPhanCong, TrangThai)
VALUES
('NL009', 'DD801', NULL, NULL, '2024-05-15', NULL, N'Chờ phân công'),
('NL010', 'DD901', NULL, NULL, '2024-05-16', NULL, N'Chờ phân công');
GO

-- 4. Liên kết đơn - ngày làm việc
INSERT INTO DonDatDichVuNgayLamViec (MaDonDatDichVu, MaNgayLamViec, ThoiGianThucHien) VALUES
('DD801', 'NL009', 180),
('DD901', 'NL010', 120);
GO

-- 5. Trạng thái ban đầu của đơn là chờ xác nhận
INSERT INTO LichSuTrangThaiDon (MaLichSu, MaDon, ThoiGianCapNhat, TrangThai) VALUES
('LS012', 'DD008', '2024-05-14 09:00', N'Chờ xác nhận'),
('LS013', 'DD009', '2024-05-14 10:00', N'Chờ xác nhận');
GO

--nhanvien test
INSERT INTO NguoiDung
    (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhau, DiaChi, TrangThai,
     NgayTao, NgayTaoRefreshToken, NgayHetHanRefreshToken)
VALUES
('ND099', N'Test Nhân Viên',
    'test.staff@local.com',
    '0912349999',
    '$2a$11$BDC3Ye8QEPP.ED2dbHcHWuRZbI8J0uE6G51msFxZwvE2BTwLE2NUS',  -- mật khẩu KHÔNG hash
    N'Đà Nẵng',
    1,
    GETDATE(), GETDATE(), NULL);

INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro, NgayGan)
VALUES ('ND099', 'VT002', GETDATE());