using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Carts.Errors;
using RipperdocShop.Api.Modules.Orders.Errors;

namespace RipperdocShop.Api.Modules.Carts.Commands;

public class UpsertCartItemCommand(ApplicationDbContext dbContext)
{
    public async Task<CartItem> ExecuteAsync(Guid productId, Guid userId, int quantity)
    {
        var existingItem = dbContext.CartItems
            .FirstOrDefault(ci => ci.ProductId == productId && ci.UserId == userId);

        if (existingItem is not null)
        {
            existingItem.UpdateQuantity(quantity);
            await dbContext.SaveChangesAsync();
            return existingItem;
        }
        
        var product = await dbContext.Products.FindAsync(productId) ?? throw new ProductNotFoundException(productId);  
        var newItem = new CartItem(product, userId, quantity);       
        dbContext.CartItems.Add(newItem);
        await dbContext.SaveChangesAsync();
        return newItem;

    }
}
