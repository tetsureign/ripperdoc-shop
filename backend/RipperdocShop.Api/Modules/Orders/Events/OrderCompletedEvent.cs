using RipperdocShop.Api.Models;

namespace RipperdocShop.Api.Modules.Orders.Events;

public record OrderCompletedEvent(Guid OrderId) : IDomainEvent;
