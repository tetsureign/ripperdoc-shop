using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Queries;

public class ListMyOrdersQuery(ApplicationDbContext dbContext)
{
    public async Task<PaginatedOrderSummaryResponse> ExecuteAsync(Guid userId, int page, int pageSize)
    {
        var query = dbContext.Orders
            .Where(o => o.UserId == userId);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedOrderSummaryResponse
        {
            Orders = orders.ToSummaryDtos(),
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
