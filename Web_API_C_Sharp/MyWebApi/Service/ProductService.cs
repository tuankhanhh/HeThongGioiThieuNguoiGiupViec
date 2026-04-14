using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyWebApi.DTO;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Model;
using MyWebApi.Repository;

namespace MyWebApi.Service
{
    public class ProductService
    {
        private readonly IMapper _mapper;
        private readonly IProductRepository _productRepository;
        public ProductService(IProductRepository productRepository, IMapper mapper)
        {
            _productRepository = productRepository;
            _mapper = mapper;
        }



        public async Task<PaginatedList<ProductResponse>> SearchAndFilterAsync(
            string? search, double? from, double? to, string? sortBy, int page, int pageSize)
        {
            var query = _productRepository.SearchQueryable(search, from, to, sortBy);

            // Project to DTO as IQueryable (AutoMapper will convert to SELECT ...)
            var projected = _mapper.ProjectTo<ProductResponse>(query);

            // Create async paginated result (executes count + page query)
            var paged = await PaginatedList<ProductResponse>.CreateAsync(projected, page, pageSize);
            return paged;
        }
        public async Task<IEnumerable<ProductResponse>> GetAllAsync()
        {

            var products= await _productRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<ProductResponse>>(products);
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _productRepository.GetByIdAsync(id);
        }
        // Thêm mới
        public async Task<Product> CreateAsync(ProductRequest request)

        {
            var product = _mapper.Map<Product>(request);
            return await _productRepository.CreateAsync(product);
        }
        // Cập nhật
        public async Task<Product?> UpdateAsync(int id, ProductRequest request)
        {
            var product = _mapper.Map<Product>(request);
            product.ProductId = id;
            return await _productRepository.UpdateAsync(product);
        }
        // Xóa
        public async Task<bool> DeleteAsync(int id)
        {
            return await _productRepository.DeleteAsync(id);
        }   
    }
}
