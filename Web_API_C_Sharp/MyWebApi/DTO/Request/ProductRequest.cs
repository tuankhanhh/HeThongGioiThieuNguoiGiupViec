namespace MyWebApi.DTO.Request
{
    public class ProductRequest
    {

            public string ProductName { get; set; }
            public string ProductDescription { get; set; }
            public decimal Price { get; set; }
            public byte Discount { get; set; }
            public int CategoryId { get; set; }
            //public List<OrderDetailDTO> OrderDetails { get; set; }
        }
    }
