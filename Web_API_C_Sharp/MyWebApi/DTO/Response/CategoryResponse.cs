using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Response
{
    public class CategoryResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } 
    }
}
