
using Microsoft.AspNetCore.Mvc;
using MyWebApi.DTO.Request;
using MyWebApi.Service;
using MyWebApi.Exceptions;
using MyWebApi.DTO;

namespace MyWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public IActionResult GetCategories()
        {
            var categories = _categoryService.GetCategories();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public IActionResult GetCategory(int id)
        {
            var category = _categoryService.GetCategory(id);
            if (category == null)
            {
                // Throw exception để middleware xử lý
                throw new NotFoundException($"Category with ID {id} not found");
            }
            return Ok(category);
        }
        [HttpPost]
        //[Authorize]
        public IActionResult CreateNew(CategoryRequest request)
        {
            // Validate request
            if (string.IsNullOrEmpty(request.CategoryName))
            {
                throw new ValidationException("Category name is required");
            }

            var category = _categoryService.CreateNew(request);
            if (category == null)
            {
                throw new BusinessException("Failed to create category");
            }

            return StatusCode(StatusCodes.Status201Created, category);
        }

        [HttpPut]
        public IActionResult UpdateCategory(CategoryRequest request)
        {
            // Validate request
            if (request.CategoryId <= 0)
            {
                throw new ValidationException("Invalid category ID");
            }

            if (string.IsNullOrEmpty(request.CategoryName))
            {
                throw new ValidationException("Category name is required");
            }

            var success = _categoryService.UpdateCategory(request);
            if (!success)
            {
                throw new NotFoundException($"Category with ID {request.CategoryId} not found");
            }
            
            var updatedCategory = _categoryService.GetCategory(request.CategoryId);
            return Ok(updatedCategory);
        }

        /// Xóa category theo ID
        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            if (id <= 0)
            {
                throw new ValidationException("Invalid category ID");
            }

            var success = _categoryService.DeleteCategory(id);
            if (!success)
            {
                throw new NotFoundException($"Category with ID {id} not found");
            }

            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
