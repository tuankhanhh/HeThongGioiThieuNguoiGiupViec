using Microsoft.AspNetCore.Mvc;
using MyWebApi.DTO;
using MyWebApi.DTO.Request;
using MyWebApi.DTO.Response;
using MyWebApi.Service;

namespace MyWebApi.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductController(ProductService productService)
        {
            _productService = productService;
        }


        // GET: api/v1/Product
        [HttpGet]
        public async Task<ActionResult<PaginatedList<ProductResponse>>> GetAll(string? search,double? from, double ?to, string? sortBy, int page =1, int pageSize=10 )
        {
            var products = await _productService.SearchAndFilterAsync(search,from, to, sortBy, page, pageSize);
            return Ok(products); // trả về IEnumerable<ProductResponse>
        }

        

        // GET: api/v1/Product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(product);
        }

        // POST: api/v1/Product
        [HttpPost]
        public async Task<IActionResult> Create( ProductRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdProduct = await _productService.CreateAsync(request);
            return Ok(createdProduct); 
        }

        // PUT: api/v1/Product/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

       

            var updatedProduct = await _productService.UpdateAsync( id,request);
            if (updatedProduct == null)
                return NotFound(new { message = "Product not found" });

            return Ok(updatedProduct);
        }

        // DELETE: api/v1/Product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productService.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Product not found" });

            return NoContent();
        }
    }
}
