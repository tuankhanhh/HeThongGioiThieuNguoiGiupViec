using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace MyWebApi.Model
{
    public class Category
    {
        public int CategoryId { get; set; }

        public string? CategoryName { get; set; }
    
        public virtual ICollection<Product>? Products { get; set; } 

    }
}
