using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders;

internal static class OrderMapper
{
    internal static OrderDto? ToDto(this Order? order)
    {
        if (order is null) return null;

        return new OrderDto
        {
            Id = order.Id,
            Note = order.Note,
            CreatedAt = order.CreatedAt,
            Status = order.Status.ToString(),
            TotalPrice = order.TotalPrice,
            Items = order.OrderItems.ToDtos().ToList(),
        };
    }

    internal static OrderSummaryDto? ToSummaryDto(this Order? order)
    {
        if (order is null) return null;

        return new OrderSummaryDto
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Status = order.Status.ToString(),
            TotalPrice = order.TotalPrice,
            ItemCount = order.OrderItems.Count
        };
    }

    internal static IEnumerable<OrderDto> ToDtos(this IEnumerable<Order> orders)
    {
        return orders.Select(order => order.ToDto()!);
    }

    internal static IEnumerable<OrderSummaryDto> ToSummaryDtos(this IEnumerable<Order> orders)
    {
        return orders.Select(order => order.ToSummaryDto()!);
    }
}
