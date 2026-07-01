using RipperdocShop.Api.Models;

namespace RipperdocShop.Api.Modules.Orders.Events;

public record OrderShippedEvent(Guid OrderId) : IDomainEvent;
