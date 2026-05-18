using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace MyWebApi.Extensions // Đổi theo namespace của bạn
{
    public static class DbContextExtensions
    {
        public static async Task<string> GenerateIdAsync(
            this DbContext context, // Thêm từ khóa 'this' ở đây
            string tableName,
            string columnName,
            string prefix)
        {
            var bangParam = new SqlParameter("@Bang", tableName);
            var cotParam = new SqlParameter("@Cot", columnName);
            var prefixParam = new SqlParameter("@Prefix", prefix);
            var maMoiParam = new SqlParameter
            {
                ParameterName = "@MaMoi",
                SqlDbType = SqlDbType.Char,
                Size = 5,
                Direction = ParameterDirection.Output
            };

            await context.Database.ExecuteSqlRawAsync(
                "EXEC sp_TaoMaTuDong @Bang, @Cot, @Prefix, @MaMoi OUTPUT",
                bangParam, cotParam, prefixParam, maMoiParam);

            return maMoiParam.Value?.ToString()?.Trim() ?? string.Empty;
        }
    }
}