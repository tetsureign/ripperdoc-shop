using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Commands;

public class PlaceOrderCommand(ApplicationDbContext dbContext, ILogger<PlaceOrderCommand> logger)
{
    public async Task<Order> ExecuteAsync(Guid userId, OrderCreateDto order)
    {
        var cartItems = await dbContext.CartItems
            .Where(ci => ci.UserId == userId)
            .Include(ci => ci.Product)
            .ThenInclude(p => p.Category)
            .Include(ci => ci.Product)
            .ThenInclude(p => p.Brand)
            .ToListAsync();

        if (cartItems.Count == 0) throw new EmptyCartException(userId);

        var newOrder = new Order(userId, cartItems, order.Note);

        dbContext.CartItems.RemoveRange(cartItems);

        await dbContext.Orders.AddAsync(newOrder);
        await dbContext.SaveChangesAsync();

        var events = newOrder.DomainEvents.ToList();
        newOrder.ClearDomainEvents();

        foreach (var e in events)
            logger.LogInformation("Domain event raised: {Event}", e.GetType().Name);
        
        return newOrder;
    }
}
