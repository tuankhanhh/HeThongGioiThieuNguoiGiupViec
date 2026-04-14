using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Middlewares;
using MyWebApi.Model; 
using MyWebApi.Repository;
using MyWebApi.Service;

var builder = WebApplication.CreateBuilder(args);

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

// Ví dụ kết nối database
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));



// Custom Services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<ITokenService, TokenService>(); // Service tạo JWT token
builder.Services.AddScoped<IPasswordService, PasswordService>(); // Service hash password
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<IProductRepository,ProductRepository>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddAutoMapper(typeof(Program));


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(jwtOptions =>
    {
        jwtOptions.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"] ?? "MyWebApi", // Issuer của JWT token
            
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"] ?? "MyWebApi", // Audience của JWT token
            
            ValidateLifetime = true, // Kiểm tra token có hết hạn không
          
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:SecretKey"])),
            
            ValidateIssuerSigningKey = true, // Xác thực chữ ký của token
            
            ClockSkew = TimeSpan.Zero // Bỏ qua độ lệch thời gian
        };
    });

// ===== CẤU HÌNH AUTHORIZATION POLICIES ưng thì dùng =====
builder.Services.AddAuthorization(options =>
{
    // Policy yêu cầu phải có role Admin
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("Admin"));

    // Policy yêu cầu phải có role Manager hoặc Admin
    options.AddPolicy("RequireManagerOrAdmin", policy =>
        policy.RequireRole("Manager", "Admin"));

    // Policy yêu cầu claim tùy chỉnh
    options.AddPolicy("RequireDepartmentIT", policy =>
        policy.RequireClaim("Department", "IT"));
        
    // Policy kết hợp nhiều điều kiện
    options.AddPolicy("AdminOrManagerWithIT", policy =>
        policy.RequireRole("Admin", "Manager")
              .RequireClaim("Department", "IT"));
              
    // Policy yêu cầu user phải authenticated (đã đăng nhập)
    options.AddPolicy("RequireAuthenticated", policy =>
        policy.RequireAuthenticatedUser());
});
var app = builder.Build();



// ===== ĐĂNG KÝ MIDDLEWARE =====
// Thêm middleware xử lý API response và error handling
// Cách 1: Áp dụng cho tất cả requests (nhưng middleware sẽ tự động bỏ qua Swagger UI và static files)
app.UseApiResponseMiddleware();
// Cách 2: Chỉ áp dụng cho API endpoints cụ thể=
// app.UseApiResponseMiddleware("/api");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
//app.UseSession();

app.MapControllers();


// ===== SEED DATA - Tạo admin user và roles nếu chưa có =====
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
    
    // Tạo roles nếu chưa có
    if (!context.Roles.Any())
    {
        var roles = new[]
        {
            new Role { RoleName = "Admin", Description = "Quản trị viên hệ thống" },
            new Role { RoleName = "Manager", Description = "Quản lý" },
            new Role { RoleName = "User", Description = "Người dùng thông thường" }
        };
        context.Roles.AddRange(roles);
        await context.SaveChangesAsync();
    }
    
    // Tạo admin user nếu chưa có
    if (!context.Users.Any(u => u.UserName == "admin"))
    {
        var hashedPassword = passwordService.HashPassword("admin123");
        var adminUser = new User
        {
            UserName = "admin",
            Password = hashedPassword, // Password đã hash
            Email = "admin@example.com",
            FullName = "System Administrator",
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            RefreshToken = ""
        };
        
        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
        
        // Gán role Admin
        var adminRole = context.Roles.First(r => r.RoleName == "Admin");
        var userRole = new UserRole
        {
            UserId = adminUser.UserId,
            RoleId = adminRole.RoleId,
            AssignedDate = DateTime.UtcNow
        };
        context.UserRoles.Add(userRole);
        await context.SaveChangesAsync();
    }
}

app.Run();

// ===== GHI CHÚ VỀ AUTHORIZATION =====
// ClaimTypes.Name → gán vào token tên đăng nhập (UserName).
// Trong ASP.NET Core, khi bạn truy cập User.Identity.Name, nó sẽ trả về giá trị này.
// Dùng để xác định "đây là user nào".
// ClaimTypes.Email → gán vào token email của user.
//  có thể lấy lại bằng User.FindFirst(ClaimTypes.Email)?.Value.

// Hữu ích khi API cần biết email mà không cần query lại database.
// 1. [Authorize] - Yêu cầu user phải đăng nhập
// 2. [Authorize(Roles = "Admin")] - Yêu cầu user có role Admin
// 3. [Authorize(Roles = "Admin,Manager")] - User có 1 trong 2 role Admin hoặc Manager
// 4. [Authorize(Policy = "RequireAdmin")] - Sử dụng policy đã định nghĩa
// 5. [AllowAnonymous] - Cho phép truy cập không cần đăng nhập (override [Authorize] ở class level)


