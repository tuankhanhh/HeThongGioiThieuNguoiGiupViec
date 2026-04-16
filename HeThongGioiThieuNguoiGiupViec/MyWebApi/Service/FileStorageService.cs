using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MyWebApi.Service
{
    public interface IFileStorageService
    {
        Task<string?> UploadAsync(IFormFile file);
    }

    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;

        public LocalFileStorageService(IWebHostEnvironment env) => _env = env;

        public async Task<string?> UploadAsync(IFormFile file)
        {
            if (file == null || file.Length == 0) return null;

            try
            {
                // 1. Xác định đường dẫn đến thư mục wwwroot/uploads
                // Đề phòng trường hợp WebRootPath bị null (thường gặp ở một số template API)
                string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadFolder = Path.Combine(webRootPath, "uploads");

                // 2. TỰ ĐỘNG TẠO thư mục nếu chưa có (Rất quan trọng!)
                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                // 3. Tạo tên file duy nhất (Dùng GUID + Phần mở rộng gốc)
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadFolder, fileName);

                // 4. Lưu file vật lý
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 5. Trả về đường dẫn tương đối để lưu vào DB (Next.js sẽ gọi qua link này)
                return $"/uploads/{fileName}";
            }
            catch (Exception ex)
            {
                // Bạn có thể log lỗi ở đây nếu cần
                Console.WriteLine($"Lỗi upload file: {ex.Message}");
                return null;
            }
        }
    }
}