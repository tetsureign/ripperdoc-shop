using RipperdocShop.Api.Models;

namespace RipperdocShop.Api.Modules.Orders.Events;

public record OrderCancelledEvent(Guid OrderId, Guid UserId) : IDomainEvent;
