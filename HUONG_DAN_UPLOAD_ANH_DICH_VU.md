# HƯỚNG DẪN UPLOAD ẢNH DỊCH VỤ VÀ XUẤT BÁO CÁO EXCEL

## ✅ ĐÃ HOÀN THÀNH

### 1. Upload ảnh dịch vụ
- **Backend**: Đã tạo endpoint `POST /api/dichvu/upload-image` trong `DichVuController.cs`
- **Frontend**: Đã thay thế input URL bằng input file upload với preview ảnh
- **Vị trí**: `my-app/app/admin/services/page.tsx` (dòng ~1240-1290)
- **Tính năng**:
  - Chọn file ảnh từ máy tính
  - Tự động upload lên server
  - Hiển thị preview ảnh đã chọn
  - Thông báo thành công/lỗi bằng toast

### 2. Xuất báo cáo Excel
- **Utility**: Đã tạo `my-app/utils/exportExcel.ts` sử dụng thư viện `xlsx`
- **Frontend**: Đã tích hợp vào trang báo cáo `my-app/app/admin/reports/page.tsx`
- **Tính năng**:
  - Xuất dữ liệu doanh thu theo tháng
  - Tự động điều chỉnh độ rộng cột
  - Định dạng file .xlsx chuẩn
  - Tên file có kèm năm và ngày xuất

### 3. Thay đổi nút "Xóa" thành "Tạm ngừng"
- **Vị trí**: `my-app/app/admin/services/page.tsx`
- **Thay đổi**: 
  - Text button: "Xóa" → "Tạm ngừng"
  - Icon: Trash → Pause circle

## CÁCH SỬ DỤNG

### Upload ảnh dịch vụ:
1. Vào trang "Dịch vụ hệ thống" trong admin
2. Nhấn "Thêm dịch vụ mới" hoặc "Sửa" một dịch vụ
3. Trong form, tìm trường "Hình ảnh dịch vụ"
4. Nhấn "Choose File" và chọn ảnh từ máy
5. Ảnh sẽ tự động upload và hiển thị preview
6. Nhấn "Lưu dịch vụ" để hoàn tất

### Xuất báo cáo Excel:
1. Vào trang "Báo cáo doanh thu" trong admin
2. Chọn năm muốn xuất báo cáo
3. Nhấn nút "Xuất Excel Báo Cáo"
4. File Excel sẽ tự động tải về máy

## CHI TIẾT KỸ THUẬT

### Backend - Upload Endpoint
```csharp
// POST: api/dichvu/upload-image
[HttpPost("upload-image")]
public async Task<IActionResult> UploadImage(IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest(new { message = "Không có file được chọn" });

    var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
    if (!Directory.Exists(uploadFolder))
        Directory.CreateDirectory(uploadFolder);

    var safeFileName = Path.GetFileName(file.FileName);
    var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
    var filePath = Path.Combine(uploadFolder, uniqueFileName);

    using (var fileStream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(fileStream);
    }

    return Ok(new { imageUrl = "/uploads/" + uniqueFileName });
}
```

### Frontend - File Upload Handler
```tsx
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    try {
      const response = await api.post("/dichvu/upload-image", formDataUpload);
      setFormData({ ...formData, hinhAnh: response.imageUrl });
      showAlert("Tải ảnh lên thành công!", "Thành công", "success");
    } catch (error) {
      showAlert("Lỗi khi tải ảnh lên: " + (error as any).message, "Lỗi", "error");
    }
  }}
/>
```

### Excel Export Utility
```typescript
import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Tự động điều chỉnh độ rộng cột
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] || "").length),
    ) + 2,
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

  XLSX.writeFile(
    workbook,
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
```

## KẾT QUẢ
- ✅ Upload ảnh hoạt động với preview
- ✅ Xuất Excel với định dạng đẹp
- ✅ Nút "Tạm ngừng" thay thế "Xóa"
- ✅ Không có lỗi TypeScript
- ✅ Tích hợp toast notifications

## LƯU Ý
- Ảnh được lưu trong thư mục `wwwroot/uploads/` của backend
- Tên file được tạo unique bằng GUID để tránh trùng lặp
- Chỉ chấp nhận file ảnh (image/*)
- File Excel xuất ra định dạng .xlsx chuẩn Microsoft Excel
