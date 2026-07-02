namespace RipperdocShop.Shared.DTOs.Carts;

public class CartCreateDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}
