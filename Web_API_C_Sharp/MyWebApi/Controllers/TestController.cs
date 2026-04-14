
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Toàn bộ controller yêu cầu phải đăng nhập (có thể override bằng [AllowAnonymous])
    public class TestController : ControllerBase
    {
        public TestController()
        {
        }

       
        /// API Public - Không cần đăng nhập (override [Authorize] ở class level)
        
        [HttpGet("public")]
        [AllowAnonymous] // Override [Authorize] ở class level
        public IActionResult GetPublicData()
        {
            return Ok(new { message = "Đây là API public, ai cũng có thể truy cập!" });
        }

       
        /// API yêu cầu đăng nhập - Sử dụng [Authorize] từ class level
        
        [HttpGet("protected")]
        public IActionResult GetProtectedData()
        {
            // Lấy thông tin user từ JWT claims
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userId = User.FindFirst("UserId")?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            return Ok(new
            {
                message = "Bạn đã đăng nhập thành công!",
                userName = userName,
                userId = userId,
                email = email
            });
        }

       
        /// CÁCH 1: Sử dụng [Authorize(Roles = "...")] 
        /// API chỉ dành cho Admin
        
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")] // Chỉ user có role Admin mới được truy cập
        public IActionResult GetAdminData()
        {
            return Ok(new { message = "Chào mừng Admin! Chỉ Admin mới thấy được thông tin này." });
        }

       
        /// CÁCH 2: Multiple roles với dấu phấy (OR logic)
        /// API dành cho Admin HOẶC Manager
        
        [HttpGet("admin-or-manager")]
        [Authorize(Roles = "Admin,Manager")] // User có role Admin HOẶC Manager
        public IActionResult GetAdminOrManagerData()
        {
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            return Ok(new
            {
                message = "Chào mừng Admin hoặc Manager!",
                yourRoles = roles
            });
        }


        /// CÁCH 3: Sử dụng Policy đã định nghĩa trong Program.cs
        /// API sử dụng policy "RequireAdmin"

        [HttpGet("admin-policy")]
        [Authorize(Policy = "RequireAdmin")] // Sử dụng policy đã định nghĩa
        public IActionResult GetAdminPolicyData()
        {
            return Ok(new { message = "API này sử dụng Policy 'RequireAdmin'" });
        }

       
        /// CÁCH 4: Policy với multiple roles
        /// API sử dụng policy "RequireManagerOrAdmin"
        
        [HttpGet("manager-or-admin-policy")]
        [Authorize(Policy = "RequireManagerOrAdmin")]
        public IActionResult GetManagerOrAdminPolicyData()
        {
            return Ok(new { message = "API này sử dụng Policy 'RequireManagerOrAdmin'" });
        }

       
        /// CÁCH 5: Policy với custom claims
        /// API sử dụng policy "RequireDepartmentIT"
        
        [HttpGet("it-department")]
        [Authorize(Policy = "RequireDepartmentIT")] // Yêu cầu claim Department = "IT"
        public IActionResult GetITDepartmentData()
        {
            var department = User.FindFirst("Department")?.Value;
            return Ok(new
            {
                message = "Chào mừng thành viên phòng IT!",
                department = department
            });
        }

       
        /// CÁCH 6: Kiểm tra authorization trong code (Programmatic Authorization)
        
        [HttpGet("manual-check")]
        public IActionResult GetDataWithManualCheck()
        {
            // Kiểm tra user có đăng nhập không
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized(new { message = "Bạn cần đăng nhập!" });
            }

            // Kiểm tra user có role Admin không
            if (User.IsInRole("Admin"))
            {
                return Ok(new { message = "Bạn là Admin, có quyền truy cập đầy đủ!" });
            }

            // Kiểm tra user có role Manager không
            if (User.IsInRole("Manager"))
            {
                return Ok(new { message = "Bạn là Manager, có quyền truy cập hạn chế!" });
            }

            // Kiểm tra custom claim
            var department = User.FindFirst("Department")?.Value;
            if (department == "IT")
            {
                return Ok(new { message = "Bạn thuộc phòng IT!" });
            }

            // User đã đăng nhập nhưng không có quyền đặc biệt
            return Ok(new { message = "Bạn đã đăng nhập nhưng chỉ có quyền cơ bản!" });
        }

       
        /// CÁCH 7: Multiple authorization attributes (AND logic)
        /// User phải có CÙNG LÚC cả role Admin VÀ claim Department=IT
        
        [HttpGet("admin-and-it")]
        [Authorize(Roles = "Admin")]
        [Authorize(Policy = "RequireDepartmentIT")]
        public IActionResult GetAdminAndITData()
        {
            return Ok(new { message = "Bạn vừa là Admin vừa thuộc phòng IT!" });
        }

       
        /// Lấy thông tin tất cả claims của user hiện tại
        
        [HttpGet("my-claims")]
        public IActionResult GetMyClaims()
        {
            var claims = User.Claims.Select(c => new
            {
                Type = c.Type,
                Value = c.Value
            }).ToList();

            return Ok(new
            {
                message = "Thông tin claims của bạn:",
                claims = claims
            });
        }

       
        /// API test với User role (role thấp nhất)
        
        [HttpGet("user-only")]
        [Authorize(Roles = "User")]
        public IActionResult GetUserData()
        {
            return Ok(new { message = "API này dành cho User role!" });
        }
    }
}
