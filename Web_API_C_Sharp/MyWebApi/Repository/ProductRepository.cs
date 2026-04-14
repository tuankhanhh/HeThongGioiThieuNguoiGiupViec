using Microsoft.EntityFrameworkCore;
using MyWebApi.Model;

namespace MyWebApi.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly MyDbContext _context;

        public ProductRepository(MyDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả Product
        public IQueryable<Product> SearchQueryable(string? search, double? from, double? to, string? sortBy)
        {
            var products = _context.Products.AsQueryable();
            if (!string.IsNullOrEmpty(search))
            {
                products = products.Where(p => p.ProductName.Contains(search) || p.ProductDescription.Contains(search));
            }

            if (from.HasValue)
            {
                products = products.Where(p => p.Price >= (decimal)from.Value);
            }
            if (to.HasValue)
            {
                products = products.Where(p => p.Price <= (decimal)to.Value);
            }
            //sort
            //default productname
            products=products.OrderBy(p => p.ProductName);
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy)
                {
                    case "productName_asc":
                        products = products.OrderBy(p => p.ProductName);
                        break;
                    case "productName_desc":
                        products = products.OrderByDescending(p => p.ProductName);
                        break;
                    case "price_asc":
                        products = products.OrderBy(p => p.Price);
                        break;
                    case "price_desc":
                        products = products.OrderByDescending(p => p.Price);
                        break;

                }
            }

          


            return  products;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products.ToListAsync();
        }

        // Lấy theo Id
        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        // Thêm mới
        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        // Cập nhật
        public async Task<Product?> UpdateAsync(Product product)
        {
            var existingProduct = await _context.Products.FindAsync(product.ProductId);
            if (existingProduct == null)
            {
                return null;
            }

            existingProduct.ProductId = product.ProductId;
            existingProduct.ProductName = product.ProductName;
            existingProduct.ProductDescription = product.ProductDescription;
            existingProduct.Price = product.Price;
            existingProduct.Discount = product.Discount;
            existingProduct.CategoryId = product.CategoryId;
            _context.Products.Update(existingProduct);
            await _context.SaveChangesAsync();

            return existingProduct;
        }

        // Xóa
        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return false;
            }
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}