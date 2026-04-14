namespace MyWebApi.Model
{

    public enum OrderStatus
    {
        Pending = 0,
        Payment = 1,
        Complete = 2,
        Cancelled = -1
    }
    public class Order
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? DeliveryDate { get; set; }

        public string? CustomerName { get; set; }

        public string? ShippingAddress { get; set; }

        public string? PhoneNumber { get; set; }
        public decimal TotalPrice { get; set; } // Đổi từ double thành decimal


        public OrderStatus Status { get; set; }


        public ICollection<OrderDetail> OrderDetails { get; set; }

        public Order()
        {
            OrderDetails = new List<OrderDetail>();
            OrderDate = DateTime.Now;
            Status = OrderStatus.Pending;
        }
    }
}
