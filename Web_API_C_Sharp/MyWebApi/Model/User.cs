using System.ComponentModel.DataAnnotations;

namespace MyWebApi.Model
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; } // Trong thực tế nên hash password

        [EmailAddress]
        public string? Email { get; set; }
        public string? FullName { get; set; }

        public string? RefreshToken { get; set; }
        // Thêm các field bổ sung
        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation property - 1 User có nhiều UserRole (Many-to-Many với Role)
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
