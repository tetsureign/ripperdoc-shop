using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class GetOrderDetailsQuery(ApplicationDbContext dbContext)
{
    public async Task<OrderDto> ExecuteAsync(Guid id)
    {
        var orderDto = (await dbContext.Orders.FindAsync(id)).ToDto();
        
        return orderDto ?? throw new OrderNotFoundException(id);
    }
}
