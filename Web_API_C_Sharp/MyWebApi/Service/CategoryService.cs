using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Model;
using MyWebApi.Repository;

namespace MyWebApi.Service
{
    public class CategoryService 
    {
        private readonly ICategoryRepository _categoryRepository;
        
        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public List<CategoryResponse> GetCategories()
        {
            var categories = _categoryRepository.GetCategories();
            return categories.Select(c => new CategoryResponse
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName ?? string.Empty
            }).ToList();
        }

        public CategoryResponse? GetCategory(int id)
        {
            var category = _categoryRepository.GetCategory(id);
            if (category == null)
                return null;

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName ?? string.Empty
            };
        }

        public CategoryResponse? CreateNew(CategoryRequest request)
        {
            var category = new Category
            {
                CategoryName = request.CategoryName
            };

            var createdCategory = _categoryRepository.CreateNew(category);
            if (createdCategory == null)
                return null;

            return new CategoryResponse
            {
                CategoryId = createdCategory.CategoryId,
                CategoryName = createdCategory.CategoryName ?? string.Empty
            };
        }

        public bool UpdateCategory(CategoryRequest request)
        {
            var existingCategory = _categoryRepository.GetCategory(request.CategoryId);
            if (existingCategory == null)
                return false;

            existingCategory.CategoryName = request.CategoryName;
            _categoryRepository.UpdateCategory(existingCategory);
            return true;
        }

        public bool DeleteCategory(int id)
        {
            var existingCategory = _categoryRepository.GetCategory(id);
            if (existingCategory == null)
                return false;

            _categoryRepository.DeleteCategory(id);
            return true;
        }
    }
}
