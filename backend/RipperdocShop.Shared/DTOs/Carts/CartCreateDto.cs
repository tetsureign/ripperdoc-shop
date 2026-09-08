namespace RipperdocShop.Shared.DTOs.Carts;

public class CartCreateDto
{
    public string ProductSlug { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
