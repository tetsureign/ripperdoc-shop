using RipperdocShop.Api.Infrastructure.Errors;
using RipperdocShop.Api.Models.Entities;

namespace RipperdocShop.Api.Modules.Orders.Errors;

public class InvalidOrderStateTransitionException(Guid id, OrderStatus status) : DomainException(
    $"Invalid state transition for order {id}. Previous state: {status}.", StatusCodes.Status409Conflict)
{
}
