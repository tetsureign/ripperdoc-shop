namespace RipperdocShop.Shared.DTOs.Orders;

public class PaginatedOrderSummaryResponse
{
    public IEnumerable<OrderSummaryDto> Orders { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
