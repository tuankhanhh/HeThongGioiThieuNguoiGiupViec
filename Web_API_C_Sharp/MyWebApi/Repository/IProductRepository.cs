using MyWebApi.Model;

namespace MyWebApi.Repository
{
    public interface IProductRepository
    {

        IQueryable<Product> SearchQueryable(string? search, double? from, double? to,string? sortBy );
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<Product?> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);
    }
}
