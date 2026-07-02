using RipperdocShop.Api.Infrastructure.Errors;

namespace RipperdocShop.Api.Modules.Carts.Errors;

public class ProductNotFoundException(Guid productId)
    : DomainException($"Product {productId} is not found", StatusCodes.Status400BadRequest)
{
}
