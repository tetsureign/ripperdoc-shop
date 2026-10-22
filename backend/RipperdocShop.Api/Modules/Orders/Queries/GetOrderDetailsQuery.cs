using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class GetOrderDetailsQuery(ApplicationDbContext dbContext)
{
    public async Task<OrderDto> ExecuteAsync(Guid id)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order.ToDto() ?? throw new OrderNotFoundException(id);
    }
}
