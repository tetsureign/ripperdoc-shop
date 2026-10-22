using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class GetMyOrderDetailsQuery(ApplicationDbContext dbContext)
{
    public async Task<OrderDto> ExecuteAsync(Guid id, Guid userId)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id) ?? throw new OrderNotFoundException(id);
        if (order.UserId != userId) throw new UnauthorizedAccessException("Choom, no touching other chooms' biz");

        return order.ToDto()!;
    }
}
