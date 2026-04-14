using Microsoft.EntityFrameworkCore;


namespace MyWebApi.Model
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {

        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        //fluent api
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User configuration
            modelBuilder.Entity<User>(u =>
            {
                u.ToTable("Users");
                u.HasKey(u => u.UserId);
                u.Property(u => u.UserId).ValueGeneratedOnAdd();
                u.HasIndex(u => u.UserName).IsUnique();
                u.Property(u => u.UserName).IsRequired().HasMaxLength(50);
                u.Property(u => u.Password).IsRequired().HasMaxLength(255); // Tăng length cho hash password
                u.Property(u => u.Email).IsRequired().HasMaxLength(100);
                u.Property(u => u.FullName).HasMaxLength(100);
                u.Property(u => u.RefreshToken).HasMaxLength(500); // RefreshToken field
            });

            // Role configuration
            modelBuilder.Entity<Role>(r =>
            {
                r.ToTable("Roles");
                r.HasKey(r => r.RoleId);
                r.Property(r => r.RoleId).ValueGeneratedOnAdd();
                r.Property(r => r.RoleName).IsRequired().HasMaxLength(50);
                r.HasIndex(r => r.RoleName).IsUnique(); // Role name phải unique
                r.Property(r => r.Description).HasMaxLength(200);
            });

            // UserRole configuration (Many-to-Many junction table)
            modelBuilder.Entity<UserRole>(ur =>
            {
                ur.ToTable("UserRoles");
                ur.HasKey(ur => new { ur.UserId, ur.RoleId }); // Composite primary key
                
                // Configure relationships
                ur.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                ur.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            // Category configuration
            modelBuilder.Entity<Category>(c =>
            {
                c.ToTable("Categories");
                c.HasKey(c => c.CategoryId);
                c.Property(c => c.CategoryId)
                    .ValueGeneratedOnAdd();
                c.Property(c => c.CategoryName)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            // Product configuration
            modelBuilder.Entity<Product>(p =>
            {
                p.ToTable("Products");
                p.HasKey(p => p.ProductId);
                p.Property(p => p.ProductId)
                    .ValueGeneratedOnAdd(); // <-- đây để tự tăng
                p.Property(p => p.ProductName).IsRequired().HasMaxLength(100);
                p.Property(p => p.ProductDescription).HasMaxLength(500);
                p.Property(p => p.Price)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(0);
                p.Property(p => p.Discount).HasDefaultValue(0);
                // Khóa ngoại
                p.HasOne(p => p.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(p => p.CategoryId)
                    .HasConstraintName("FK_Products_Categories");
            });

            // Order configuration
            modelBuilder.Entity<Order>(o =>
            {
                o.ToTable("Orders");
                o.HasKey(o => o.OrderId);
                o.Property(o => o.OrderId)
                    .ValueGeneratedOnAdd();
                o.Property(o => o.OrderDate)
                    .HasDefaultValueSql("getutcdate()");
                o.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(500);
                o.Property(o => o.CustomerName).HasMaxLength(100);
                o.Property(o => o.PhoneNumber).HasMaxLength(20);
                o.Property(o => o.TotalPrice)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(0);
            });

            // OrderDetail configuration
            modelBuilder.Entity<OrderDetail>(od =>
            {
                od.ToTable("OrderDetails");
                od.HasKey(od => new { od.OrderId, od.ProductId });
                od.Property(od => od.Price)
                    .HasColumnType("decimal(18,2)");
                od.Property(od => od.Quantity)
                    .IsRequired();

                od.HasOne(od => od.Order)
                    .WithMany(o => o.OrderDetails)
                    .HasForeignKey(od => od.OrderId)
                    .HasConstraintName("FK_OrderDetails_Orders");
                od.HasOne(od => od.Product)
                    .WithMany(p => p.OrderDetails)
                    .HasForeignKey(od => od.ProductId)
                    .HasConstraintName("FK_OrderDetails_Products");
            });
        }
    }
}

