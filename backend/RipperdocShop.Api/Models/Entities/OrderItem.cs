using System.ComponentModel.DataAnnotations;

namespace RipperdocShop.Api.Models.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    
    [StringLength(100)]
    public string ProductNameSnapshot { get; private set; } = string.Empty;
    
    [StringLength(120)]
    public string ProductSlugSnapshot { get; private set; } = string.Empty;
    
    [StringLength(1000)]
    public string ProductDescriptionSnapshot { get; private set; } = string.Empty;
    
    [StringLength(2048)]
    public string ProductImageUrlSnapshot { get; private set; } = string.Empty;
    
    [StringLength(100)]
    public string ProductCategorySnapshot { get; private set; } = string.Empty;
    
    [StringLength(100)]
    public string? ProductBrandSnapshot { get; private set; } = string.Empty;
    
    public decimal ProductPriceSnapshot { get; private set; }
    public int Quantity { get; private set; }
    public DateTime CreatedAt { get; private set; }
    
    public Guid OrderId { get; private set; }
    
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    
    private OrderItem() { }

    internal OrderItem(Product product, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "Can't add nuthin' (Quantity must be greater than 0.)");
        
        Id = Guid.NewGuid();
        ProductNameSnapshot = product.Name;
        ProductSlugSnapshot = product.Slug;
        ProductDescriptionSnapshot = product.Description;
        ProductImageUrlSnapshot = product.ImageUrl;
        ProductCategorySnapshot = product.Category.Name;
        ProductBrandSnapshot = product.Brand?.Name;
        ProductPriceSnapshot = product.Price;
        Quantity = quantity;
        CreatedAt = DateTime.UtcNow;
        ProductId = product.Id;
        Product = product;
    }
}
