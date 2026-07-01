using RipperdocShop.Api.Models;

namespace RipperdocShop.Api.Modules.Orders.Events;

public record OrderPlacedEvent(Guid OrderId, Guid UserId, decimal Total) : IDomainEvent;
