using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Orders.Errors;

namespace RipperdocShop.Api.Modules.Orders.Commands;

public class CompleteOrderCommand(ApplicationDbContext dbContext, Logger<CompleteOrderCommand> logger)
{
    public async Task<Order?> ExecuteAsync(Guid id)
    {
        var order = await dbContext.Orders.FindAsync(id);

        if (order == null) throw new OrderNotFoundException(id);
        
        order.Complete();
        
        await dbContext.SaveChangesAsync();
        
        var events = order.DomainEvents.ToList();
        order.ClearDomainEvents();
        
        foreach (var e in events)
            logger.LogInformation("Domain event raised: {Event}", e. 
                GetType().Name);
        
        return order;
    }
}
