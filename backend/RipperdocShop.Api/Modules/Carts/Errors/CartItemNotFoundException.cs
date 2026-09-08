using RipperdocShop.Api.Infrastructure.Errors;

namespace RipperdocShop.Api.Modules.Carts.Errors;

public class CartItemNotFoundException(Guid id)
    : DomainException($"Cart item {id} is not found", StatusCodes.Status400BadRequest)
{
    
}
