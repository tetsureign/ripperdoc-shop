using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Carts.Errors;

namespace RipperdocShop.Api.Modules.Carts.Commands;

public class RemoveFromCartCommand(ApplicationDbContext dbContext)
{
    public async Task ExecuteAsync(Guid id, Guid userId)
    {
        var item = await dbContext.CartItems .FindAsync(id);
        if (item == null) throw new CartItemNotFoundException(id);
        
        if (item.UserId != userId) throw new UnauthorizedAccessException("Choom, no touching other chooms' biz");

        dbContext.CartItems.Remove(item);

        await dbContext.SaveChangesAsync();
    }
}
