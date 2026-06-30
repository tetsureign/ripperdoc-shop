using Microsoft.CodeAnalysis.CSharp.Syntax;
using RipperdocShop.Api.Models.Identities;

namespace RipperdocShop.Api.Models.Entities;

public class CartItem
{
    public Guid Id { get; private set; }
    public int Quantity { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public Guid UserId { get; private set; }
    public AppUser User { get; private set; } = null!;

    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;

    public CartItem()
    {
    }

    public void Add(Product product, AppUser user, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity),
                "Can't add nuthin' (Quantity must be greater than 0.)");

        Id = Guid.NewGuid();
        Quantity = quantity;
        CreatedAt = DateTime.UtcNow;
        Product = product;
        ProductId = product.Id;
        User = user;
        UserId = user.Id;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity),
                "Can't add nuthin' (Quantity must be greater than 0.)");

        Quantity = quantity;
    }
}
