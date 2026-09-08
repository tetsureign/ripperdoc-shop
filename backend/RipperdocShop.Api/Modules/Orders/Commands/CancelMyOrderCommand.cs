using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Commands;

public class CancelMyOrderCommand(ApplicationDbContext dbContext, ILogger<CancelMyOrderCommand> logger)
{
    public async Task<OrderDto> ExecuteAsync(Guid id, Guid userId)
    {
        var order = await dbContext.Orders.FindAsync(id);
        
        if (order == null) throw new OrderNotFoundException(id);
        if (order.UserId != userId) throw new UnauthorizedAccessException("Choom, no touching other chooms' biz");
        
        order.Cancel();
        await dbContext.SaveChangesAsync();
        
        var events = order.DomainEvents.ToList();
        order.ClearDomainEvents();
        
        foreach (var e in events)
            logger.LogInformation("Domain event raised: {Event}", e.GetType().Name);
        
        return order.ToDto()!;
    }
}
