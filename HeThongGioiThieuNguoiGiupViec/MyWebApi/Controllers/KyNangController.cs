using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")] // Đường dẫn sẽ là api/KyNang
    [ApiController]             // Thuộc tính bắt buộc cho Web API
    public class KyNangController : ControllerBase // Dùng ControllerBase cho API (nhẹ hơn Controller)
    {
        private readonly ApplicationDbContext _context;

        // --- BẠN THIẾU ĐOẠN NÀY ---
        public KyNangController(ApplicationDbContext context)
        {
            _context = context;
        }
        // --------------------------

        [HttpGet("skills")]
        public async Task<IActionResult> GetAllSkills()
        {
            try
            {
                // Lấy danh sách từ DB
                var skills = await _context.KyNangs
                    .Select(s => new {
                        id = s.MaKyNang,
                        title = s.TenKyNang,
                        desc = s.MoTa,        // Lấy từ DB
                        iconKey = s.IconName
                    })
                    .ToListAsync();

                if (skills == null || skills.Count == 0)
                {
                    return NotFound(new { message = "Không tìm thấy kỹ năng nào trong hệ thống." });
                }

                return Ok(skills);
            }
            catch (Exception ex)
            {
                // Log lỗi ở đây nếu cần
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy danh sách kỹ năng",
                    detail = ex.Message
                });
            }
        }
    }
}