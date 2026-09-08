using RipperdocShop.Api.Infrastructure.Errors;

namespace RipperdocShop.Api.Modules.Carts.Errors;

public class ProductNotFoundException(string product)
    : DomainException($"Product {product} is not found", StatusCodes.Status400BadRequest)
{
}
