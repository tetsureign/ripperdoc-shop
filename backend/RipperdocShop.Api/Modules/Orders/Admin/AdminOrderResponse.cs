using RipperdocShop.Api.Models.Entities;

namespace RipperdocShop.Api.Modules.Orders.Admin;

public class AdminOrderResponse
{
    public IEnumerable<Order> Orders { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
