
using MyWebApi.Model;

namespace MyWebApi.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly MyDbContext _context;

        public CategoryRepository(MyDbContext context)
        {
            _context = context;
        }

        public List<Category> GetCategories()
        {
            return _context.Categories.ToList();
        }

        public Category? GetCategory(int id)
        {
            return _context.Categories.FirstOrDefault(c => c.CategoryId == id);
        }

        public Category? CreateNew(Category category)
        {
            try
            {
                _context.Categories.Add(category);
                _context.SaveChanges();
                return category;
            }
            catch
            {
                return null;
            }
        }

        public void UpdateCategory(Category category)
        {
            var existingCategory = _context.Categories.FirstOrDefault(c => c.CategoryId == category.CategoryId);
            if (existingCategory != null)
            {
                existingCategory.CategoryName = category.CategoryName;
                _context.SaveChanges();
            }
        }

        public void DeleteCategory(int id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.CategoryId == id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                _context.SaveChanges();
            }
        }
    }
}
