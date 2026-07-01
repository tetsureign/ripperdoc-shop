using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders;

internal static class OrderItemMapper
{
    internal static OrderItemDto? ToDto(this OrderItem? orderItem)
    {
        if (orderItem is null) return null;

        return new OrderItemDto
        {
            Id = orderItem.Id,
            ProductId = orderItem.ProductId,
            ProductName = orderItem.ProductNameSnapshot,
            ProductSlug = orderItem.ProductSlugSnapshot,
            ProductImageUrl = orderItem.ProductImageUrlSnapshot,
            ProductDescription = orderItem.ProductDescriptionSnapshot,
            ProductCategory = orderItem.ProductCategorySnapshot,
            ProductBrand = orderItem.ProductBrandSnapshot,
            ProductPriceSnapshot = orderItem.ProductPriceSnapshot,
            Quantity = orderItem.Quantity,
        };
    }
    
    internal static IEnumerable<OrderItemDto> ToDtos(this IEnumerable<OrderItem> orderItems)
    {
        return orderItems.Select(orderItem => orderItem.ToDto()!);
    }
    
}
