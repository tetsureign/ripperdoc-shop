using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Carts.Errors;
using RipperdocShop.Shared.DTOs.Carts;

namespace RipperdocShop.Api.Modules.Carts.Queries;

public class GetMyCartQuery(ApplicationDbContext dbContext)
{
    public async Task<IEnumerable<CartItemDto>> ExecuteAsync(Guid userId)
    {
        var myCart = await dbContext.CartItems
            .Include(x => x.Product)
            .ThenInclude(x => x.Category)
            .Include(x => x.Product)
            .ThenInclude(x => x.Brand)
            .Where(x => x.UserId == userId)
            .ToListAsync();
        
        var myCartDto = myCart.ToDtos();

        return myCartDto;
    }
}
