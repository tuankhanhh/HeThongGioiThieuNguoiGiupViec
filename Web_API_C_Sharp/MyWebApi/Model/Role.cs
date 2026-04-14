using System.ComponentModel.DataAnnotations;

namespace MyWebApi.Model
{
    public class Role
    {
        public int RoleId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; } // Admin, Manager, User, etc.
        
        public string? Description { get; set; }
        
        // Navigation property - 1 Role có nhiều UserRole
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
