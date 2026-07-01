using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Orders.Errors;

namespace RipperdocShop.Api.Modules.Orders.Commands;

public class CancelOrderCommand(ApplicationDbContext dbContext)
{
    public async Task<Order?> ExecuteAsync(Guid id)
    {
        var order = await dbContext.Orders.FindAsync(id);
        
        if (order == null) throw new OrderNotFoundException(id);
        
        order.Cancel();
        await dbContext.SaveChangesAsync();
        
        var events = order.DomainEvents.ToList();
        order.ClearDomainEvents();
        
        return order;
    }
}
