using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Carts.Errors;
using RipperdocShop.Api.Modules.Orders.Errors;

namespace RipperdocShop.Api.Modules.Carts.Commands;

public class UpsertCartItemCommand(ApplicationDbContext dbContext)
{
    public async Task<CartItem> ExecuteAsync(string productSlug, Guid userId, int quantity)
    {
        var product = await dbContext.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Slug == productSlug) ?? throw new ProductNotFoundException(productSlug);
        if (product is not { DeletedAt: null }) throw new ProductNotFoundException(productSlug);

        var existingItem = dbContext.CartItems
            .FirstOrDefault(ci => ci.ProductId == product.Id && ci.UserId == userId);

        if (existingItem is not null)
        {
            existingItem.UpdateQuantity(quantity);
            await dbContext.SaveChangesAsync();
            return existingItem;
        }

        var newItem = new CartItem(product, userId, quantity);
        dbContext.CartItems.Add(newItem);
        await dbContext.SaveChangesAsync();
        return newItem;
    }
}
