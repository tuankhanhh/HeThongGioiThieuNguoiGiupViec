
using MyWebApi.Model;


namespace MyWebApi.Repository
{
    public interface ICategoryRepository
    {
        List<Category> GetCategories(); 
        Category? GetCategory(int id);
        Category? CreateNew(Category category);

        void UpdateCategory(Category category);
        void DeleteCategory(int id);
    }
}
