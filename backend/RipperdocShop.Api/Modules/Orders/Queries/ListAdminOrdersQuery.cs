using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Modules.Orders.Admin;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class AdminOrderFilter
{
    public OrderStatus? Status { get; init; }
    public Guid? UserId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class ListAdminOrdersQuery(ApplicationDbContext dbContext)
{
    public async Task<AdminOrderResponse> ExecuteAsync(AdminOrderFilter filter)
    {
        var query = dbContext.Orders
            .Where(o => filter.Status == null || o.Status == filter.Status)
            .Where(o => filter.UserId == null || o.UserId == filter.UserId);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new AdminOrderResponse
        {
            Orders = orders,
            TotalCount = totalCount, 
            TotalPages = totalPages,
        };
    }
}
