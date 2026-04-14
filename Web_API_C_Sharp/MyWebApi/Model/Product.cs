using System.ComponentModel.DataAnnotations.Schema;


namespace MyWebApi.Model
{
    public class Product
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductDescription { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public byte Discount { get; set; } // giảm giá 

        public int? CategoryId { get; set; } // Khóa ngoại đến Category
        public Category? Category { get; set; }


        public ICollection<OrderDetail> OrderDetails { get; set; }


        public Product()
        {
            OrderDetails = new HashSet<OrderDetail>();
        }
    }
}
