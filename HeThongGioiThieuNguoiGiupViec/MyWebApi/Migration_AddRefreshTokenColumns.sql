-- Script migration để thêm các cột RefreshToken vào bảng NguoiDung
-- Chạy script này nếu database đã tồn tại nhưng thiếu các cột

USE dbHeThongGioiThieuNguoiGiupViec;
GO

-- Kiểm tra và thêm cột NgayTaoRefreshToken nếu chưa có
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.NguoiDung') 
    AND name = 'NgayTaoRefreshToken'
)
BEGIN
    ALTER TABLE NguoiDung
    ADD NgayTaoRefreshToken DATETIME DEFAULT GETDATE();
    PRINT 'Đã thêm cột NgayTaoRefreshToken';
END
ELSE
BEGIN
    PRINT 'Cột NgayTaoRefreshToken đã tồn tại';
END
GO

-- Kiểm tra và thêm cột NgayHetHanRefreshToken nếu chưa có
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.NguoiDung') 
    AND name = 'NgayHetHanRefreshToken'
)
BEGIN
    ALTER TABLE NguoiDung
    ADD NgayHetHanRefreshToken DATETIME;
    PRINT 'Đã thêm cột NgayHetHanRefreshToken';
END
ELSE
BEGIN
    PRINT 'Cột NgayHetHanRefreshToken đã tồn tại';
END
GO

-- Kiểm tra và thêm cột RefreshToken nếu chưa có
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.NguoiDung') 
    AND name = 'RefreshToken'
)
BEGIN
    ALTER TABLE NguoiDung
    ADD RefreshToken VARCHAR(200);
    PRINT 'Đã thêm cột RefreshToken';
END
ELSE
BEGIN
    PRINT 'Cột RefreshToken đã tồn tại';
END
GO

PRINT 'Migration hoàn tất!';
