using RipperdocShop.Api.Infrastructure.Errors;

namespace RipperdocShop.Api.Modules.Orders.Errors;

public class OrderNotFoundException(Guid id)
    : DomainException($"Order {id} is not found", StatusCodes.Status404NotFound)
{
}
