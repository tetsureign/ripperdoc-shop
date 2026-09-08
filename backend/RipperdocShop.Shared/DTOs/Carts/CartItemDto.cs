using RipperdocShop.Shared.DTOs.Products;

namespace RipperdocShop.Shared.DTOs.Carts;

public class CartItemDto
{
    public Guid Id { get; set; }
    public int Quantity { get; set; }
    public ProductDto Product { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
