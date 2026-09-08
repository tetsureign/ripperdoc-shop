namespace RipperdocShop.Shared.DTOs.Orders;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;  
    public string ProductSlug { get; set; } = string.Empty;  
    public string ProductImageUrl { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public string ProductCategory { get; set; } = string.Empty;
    public string? ProductBrand { get; set; } = string.Empty;   
    public decimal ProductPriceSnapshot { get; set; }        
    public int Quantity { get; set; }

}
