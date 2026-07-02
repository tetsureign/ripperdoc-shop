using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Carts.Errors;

namespace RipperdocShop.Api.Modules.Carts.Commands;

public class UpdateCartItemCommand(ApplicationDbContext dbContext)
{
    public async Task<CartItem> ExecuteAsync(Guid id, Guid userId, int quantity)
    {
        var item = await dbContext.CartItems.FindAsync(id);
        if (item == null) throw new CartItemNotFoundException(id);
        
        if (item.UserId != userId) throw new UnauthorizedAccessException("Choom, no touching other chooms' biz");

        item.UpdateQuantity(quantity);

        await dbContext.SaveChangesAsync();
        return item;
    }
}
