using RipperdocShop.Api.Infrastructure.Errors;

namespace RipperdocShop.Api.Modules.Orders.Errors;

public class EmptyCartException(Guid userId)
    : DomainException($"No items in cart for user {userId}.", StatusCodes.Status400BadRequest)
{
}
