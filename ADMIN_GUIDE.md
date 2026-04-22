# Hướng dẫn sử dụng chức năng Admin

## Thông tin đăng nhập Admin mặc định

- **Số điện thoại**: 0332711675
- **Mật khẩu**: admin123

## Các chức năng Admin

### 1. Dashboard (Tổng quan)
- URL: `/admin/dashboard`
- Hiển thị thống kê tổng quan:
  - Tổng số người dùng
  - Tổng số người giúp việc
  - Tổng số đơn đặt
  - Tổng doanh thu
  - Số hồ sơ chờ duyệt
  - Số đơn chờ xác nhận

### 2. Quản lý người dùng
- URL: `/admin/users`
- Xem danh sách tất cả người dùng
- Hiển thị thông tin: Họ tên, Email, Vai trò, Trạng thái, Ngày tạo

### 3. Quản lý dịch vụ
- URL: `/admin/services`
- Thêm dịch vụ mới
- Sửa thông tin dịch vụ
- Xóa dịch vụ (chuyển sang trạng thái "Ngừng hoạt động")
- Đánh dấu dịch vụ phổ biến

### 4. Kiểm duyệt hồ sơ
- URL: `/admin/profiles`
- Xem danh sách hồ sơ người giúp việc chờ duyệt
- Xem chi tiết hồ sơ (ảnh CCCD, ảnh chân dung, giấy xác nhận cư trú)
- Duyệt hồ sơ
- Từ chối hồ sơ (kèm lý do)

### 5. Báo cáo thống kê
- URL: `/admin/reports`
- Xem doanh thu theo tháng
- Xem số lượng đơn đặt theo tháng
- Lọc theo năm
- Tính trung bình doanh thu/đơn

## API Endpoints cho Admin

### Thống kê
```
GET /api/admin/statistics
```
Trả về thống kê tổng quan hệ thống

```
GET /api/admin/statistics/revenue?year=2024
```
Trả về doanh thu theo tháng trong năm

### Quản lý dịch vụ
```
GET /api/admin/services
```
Lấy danh sách tất cả dịch vụ

```
POST /api/admin/services
Body: {
  "tenDichVu": "string",
  "moTa": "string",
  "giaTheoGio": number,
  "hinhAnh": "string",
  "phoBien": boolean
}
```
Tạo dịch vụ mới

```
PUT /api/admin/services/{maDichVu}
Body: {
  "tenDichVu": "string",
  "moTa": "string",
  "giaTheoGio": number,
  "hinhAnh": "string",
  "phoBien": boolean
}
```
Cập nhật dịch vụ

```
DELETE /api/admin/services/{maDichVu}
```
Xóa dịch vụ (chuyển sang trạng thái "Ngừng hoạt động")

### Kiểm duyệt hồ sơ
```
GET /api/admin/profiles/pending
```
Lấy danh sách hồ sơ chờ duyệt

```
POST /api/admin/profiles/{maHoSo}/approve
```
Duyệt hồ sơ

```
POST /api/admin/profiles/{maHoSo}/reject
Body: {
  "lyDo": "string"
}
```
Từ chối hồ sơ

### Quản lý người dùng
```
GET /api/user/all
```
Lấy danh sách tất cả người dùng (yêu cầu role Admin)

```
POST /api/user/assign-role
Body: {
  "maNguoiDung": "string",
  "roleName": "string"
}
```
Gán role cho người dùng

## Lưu ý bảo mật

- Tất cả API endpoint admin đều yêu cầu JWT token với role "Admin"
- Token được lưu trong localStorage
- Khi đăng xuất, token sẽ bị xóa
- Nếu token hết hạn hoặc không hợp lệ, người dùng sẽ bị redirect về trang đăng nhập

## Cấu trúc thư mục

### Front-end
```
WEB/my-app/
├── app/
│   └── admin/
│       ├── dashboard/
│       │   └── page.tsx          # Trang tổng quan
│       ├── users/
│       │   └── page.tsx          # Quản lý người dùng
│       ├── services/
│       │   └── page.tsx          # Quản lý dịch vụ
│       ├── profiles/
│       │   └── page.tsx          # Kiểm duyệt hồ sơ
│       ├── reports/
│       │   └── page.tsx          # Báo cáo thống kê
│       └── sign-in/
│           └── page.tsx          # Đăng nhập admin
└── components/
    └── admin/
        └── AdminLayout.tsx       # Layout chung cho admin
```

### Back-end
```
WEB/HeThongGioiThieuNguoiGiupViec/MyWebApi/
└── Controllers/
    ├── AdminController.cs        # Controller xử lý các API admin
    └── UserController.cs         # Controller xử lý user (có API cho admin)
```

## Hướng dẫn chạy

1. Khởi động back-end:
```bash
cd WEB/HeThongGioiThieuNguoiGiupViec/MyWebApi
dotnet run
```

2. Khởi động front-end:
```bash
cd WEB/my-app
npm install
npm run dev
```

3. Truy cập trang admin:
```
http://localhost:3000/admin/sign-in
```

4. Đăng nhập với tài khoản admin mặc định
