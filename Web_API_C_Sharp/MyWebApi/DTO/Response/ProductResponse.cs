


namespace MyWebApi.DTO.Response
{
    public class ProductResponse
    {
       public int ProductId { get; set; }

        public string ProductName { get; set; }
        public string ProductDescription { get; set; }
        public decimal Price { get; set; }
        public byte Discount { get; set; }
        public CategoryResponse? Category { get; set; }
        //public List<OrderDetailDTO> OrderDetails { get; set; }
    }
}
