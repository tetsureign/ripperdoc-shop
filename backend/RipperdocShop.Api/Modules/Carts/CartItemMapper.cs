using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Products;
using RipperdocShop.Shared.DTOs.Carts;

namespace RipperdocShop.Api.Modules.Carts;

internal static class CartItemMapper
{
    internal static CartItemDto? ToDto(this CartItem? cartItem)
    {
        if (cartItem is null) return null;

        return new CartItemDto
        {
            Id = cartItem.Id,
            Quantity = cartItem.Quantity,
            Product = cartItem.Product.ToDto()!,
            CreatedAt = cartItem.CreatedAt
        };
    }
    
    internal static IEnumerable<CartItemDto> ToDtos(this IEnumerable<CartItem> orders)
    {
        return orders.Select(cartItem => cartItem.ToDto()!);
    }
}
