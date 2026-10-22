using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Products.Admin;

namespace RipperdocShop.Api.Modules.Products.Queries;

public class ListAdminProductsQuery(ApplicationDbContext context)
{
    public async Task<AdminProductResponse> ExecuteAsync(bool includeDeleted, int page, int pageSize)
    {
        var query = context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p =>
                (includeDeleted || p.DeletedAt == null) &&
                (includeDeleted || p.Category.DeletedAt == null) &&
                (p.Brand == null || includeDeleted || p.Brand.DeletedAt == null));

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new AdminProductResponse
        {
            Products = products,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
