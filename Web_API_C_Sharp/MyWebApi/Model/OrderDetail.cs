namespace MyWebApi.Model
{
    public class OrderDetail
    {
        //public int OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public decimal Price { get; set; } // Đổi từ double thành decimal
        public int Quantity { get; set; }

         


        public  Order Order { get; set; } = null!;
        public  Product Product { get; set; } = null!;
     
    }
}
