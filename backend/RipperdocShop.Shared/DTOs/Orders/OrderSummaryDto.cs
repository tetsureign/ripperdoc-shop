namespace RipperdocShop.Shared.DTOs.Orders;

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}
