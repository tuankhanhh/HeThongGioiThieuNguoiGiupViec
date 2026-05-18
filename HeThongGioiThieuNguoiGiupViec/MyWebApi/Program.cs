using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Middlewares;
using MyWebApi.Models;
using MyWebApi.Service;

using BCrypt.Net;

// TRUONG tạo mật khẩu cho nhân viên để test
//Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("123456"));
//
var builder = WebApplication.CreateBuilder(args);
// Đăng ký Background Service chạy ngầm
builder.Services.AddHostedService<IncomeConfirmationWorker>();
// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen(); CŨ
// TRUONG nút authozie test đăng nhập
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "My API", Version = "v1" });

    // 🔥 Thêm Bearer JWT
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
//
builder.Services.AddControllers();

// Ví dụ kết nối database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000") // ✅ chỉ định rõ
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // ✅ hợp lệ
    });
});


// Custom Services
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IAuthService, AuthenticationService>();
builder.Services.AddScoped<ITokenService, TokenService>(); // Service tạo JWT token
builder.Services.AddScoped<IPasswordService, PasswordService>(); // Service hash password
builder.Services.AddAutoMapper(typeof(Program));


// Thay thế khối khai báo cũ bằng khối này
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(jwtOptions =>
{
    jwtOptions.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["AppSettings:Issuer"] ?? "MyWebApi",

        ValidateAudience = true,
        ValidAudience = builder.Configuration["AppSettings:Audience"] ?? "MyWebApi",

        ValidateLifetime = true,

        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:SecretKey"])),

        ClockSkew = TimeSpan.Zero 
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
// Thêm dòng này để server cho phép truy cập tệp trong wwwroot
app.UseStaticFiles();


// ===== ĐĂNG KÝ MIDDLEWARE =====
// Thêm middleware xử lý API response và error handling
// Cách 1: Áp dụng cho tất cả requests (nhưng middleware sẽ tự động bỏ qua Swagger UI và static files)
//app.UseApiResponseMiddleware();
// Cách 2: Chỉ áp dụng cho API endpoints cụ thể=
// app.UseApiResponseMiddleware("/api");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
//app.UseSession();

app.MapControllers();


// ===== SEED DATA - Tạo admin user và roles nếu chưa có =====
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();

    // =======================
    // 2. SEED ADMIN USER
    // =======================
    var adminUser = await context.NguoiDungs
        .FirstOrDefaultAsync(u => u.SoDienThoai == "0332711675");

    if (adminUser == null)
    {
        var hashedPassword = passwordService.HashPassword("admin123");

        adminUser = new NguoiDung
        {
            MaNguoiDung = "ADMIN", // tránh GUID + tránh trùng
            SoDienThoai = "0332711675",
            MatKhau = hashedPassword,
            Email = "admin@gmail.com",
            HoTen = "System Administrator",
            TrangThai = true,
            NgayTao = DateTime.UtcNow,

            RefreshToken = null,
            NgayTaoRefreshToken = null,
            NgayHetHanRefreshToken = null
        };

        context.NguoiDungs.Add(adminUser);
        await context.SaveChangesAsync();
    }

    // =======================
    // 3. GET ROLE SAFE
    // =======================
    var adminRole = await context.VaiTros
        .FirstOrDefaultAsync(r => r.TenVaiTro == "Admin");

    if (adminRole != null)
    {
        var exists = await context.NguoiDungVaiTros.AnyAsync(x =>
            x.MaNguoiDung == adminUser.MaNguoiDung &&
            x.MaVaiTro == adminRole.MaVaiTro);

        if (!exists)
        {
            context.NguoiDungVaiTros.Add(new NguoiDungVaiTro
            {
                MaNguoiDung = adminUser.MaNguoiDung,
                MaVaiTro = adminRole.MaVaiTro,
                NgayGan = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
        }
    }
    // =======================
    // 4. SEED STAFF USER
    // =======================
    var staffUser = await context.NguoiDungs
        .FirstOrDefaultAsync(u => u.SoDienThoai == "1111111111");

    if (staffUser == null)
    {
        var hashedPassword = passwordService.HashPassword("111111");

        staffUser = new NguoiDung
        {
            MaNguoiDung = "NVIEN",
            SoDienThoai = "1111111111",
            MatKhau = hashedPassword,
            Email = "staff@gmail.com",
            HoTen = "Staff Default",
            TrangThai = true,
            NgayTao = DateTime.UtcNow,

            RefreshToken = null,
            NgayTaoRefreshToken = null,
            NgayHetHanRefreshToken = null
        };

        context.NguoiDungs.Add(staffUser);
        await context.SaveChangesAsync();
    }

    // =======================
    // 5. GÁN ROLE STAFF
    // =======================
    var staffRole = await context.VaiTros
        .FirstOrDefaultAsync(r => r.TenVaiTro == "Staff");

    if (staffRole != null)
    {
        var exists = await context.NguoiDungVaiTros.AnyAsync(x =>
            x.MaNguoiDung == staffUser.MaNguoiDung &&
            x.MaVaiTro == staffRole.MaVaiTro);

        if (!exists)
        {
            context.NguoiDungVaiTros.Add(new NguoiDungVaiTro
            {
                MaNguoiDung = staffUser.MaNguoiDung,
                MaVaiTro = staffRole.MaVaiTro,
                NgayGan = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
        }
    }
    // =======================
    // 4. SEED cus
    // =======================
    var customerUser = await context.NguoiDungs
        .FirstOrDefaultAsync(u => u.SoDienThoai == "999999999");

    if (customerUser == null)
    {
        var hashedPassword = passwordService.HashPassword("999999");

        customerUser = new NguoiDung
        {
            MaNguoiDung = "NDUNG",
            SoDienThoai = "999999999",
            MatKhau = hashedPassword,
            Email = "customer@gmail.com",
            HoTen = "Customer Default",
            TrangThai = true,
            NgayTao = DateTime.UtcNow,

            RefreshToken = null,
            NgayTaoRefreshToken = null,
            NgayHetHanRefreshToken = null
        };

        context.NguoiDungs.Add(customerUser);
        await context.SaveChangesAsync();
    }

    // =======================
    // 5. GÁN ROLE cus
    // =======================
    var customerRole = await context.VaiTros
        .FirstOrDefaultAsync(r => r.TenVaiTro == "Customer");

    if (customerRole != null)
    {
        var exists = await context.NguoiDungVaiTros.AnyAsync(x =>
            x.MaNguoiDung == customerUser.MaNguoiDung &&
            x.MaVaiTro == customerRole.MaVaiTro);

        if (!exists)
        {
            context.NguoiDungVaiTros.Add(new NguoiDungVaiTro
            {
                MaNguoiDung = customerUser.MaNguoiDung,
                MaVaiTro = customerRole.MaVaiTro,
                NgayGan = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
        }
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

