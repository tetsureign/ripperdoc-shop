using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class GetOrderDetailsQuery(ApplicationDbContext dbContext)
{
    public async Task<OrderDto?> ExecuteAsync(Guid id)
    {
        var order = await dbContext.Orders.FindAsync(id);
        
        return order.ToDto();
    }
}
