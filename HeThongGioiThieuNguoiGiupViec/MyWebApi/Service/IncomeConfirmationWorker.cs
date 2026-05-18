
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;

namespace MyWebApi.Service
{
    public class IncomeConfirmationWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public IncomeConfirmationWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Vòng lặp chạy liên tục chừng nào server còn hoạt động
            while (!stoppingToken.IsCancellationRequested)
            {
                // Tạo Scope để lấy ApplicationDbContext (vì DbContext là Scoped Service)
                using (var scope = _scopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    // Tính mốc thời gian cách đây 1 giờ
                    var thresholdTime = DateTime.Now.AddHours(-1);

                    // Lấy ra các bản ghi thỏa mãn điều kiện
                    var pendingIncomes = await context.ThuNhapNguoiGiupViecs
                        .Where(t => t.TrangThai == "Chờ xác nhận"
                                 && t.ThoiGianTao != null
                                 && t.ThoiGianTao <= thresholdTime)
                        .ToListAsync(stoppingToken);

                    if (pendingIncomes.Any())
                    {
                        foreach (var income in pendingIncomes)
                        {
                            income.TrangThai = "Đã xác nhận";
                        }

                        await context.SaveChangesAsync(stoppingToken);
                    }
                }

                // Cho worker "ngủ" 5 phút trước khi quét lại để không làm nặng Database
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}