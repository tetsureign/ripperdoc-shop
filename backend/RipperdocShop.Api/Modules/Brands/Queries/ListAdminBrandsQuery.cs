using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Brands.Admin;

namespace RipperdocShop.Api.Modules.Brands.Queries;

public class ListAdminBrandsQuery(ApplicationDbContext context)
{
    public async Task<AdminBrandResponse> ExecuteAsync(bool includeDeleted, int page, int pageSize)
    {
        var query = context.Brands
            .AsNoTracking()
            .Where(b => includeDeleted || b.DeletedAt == null);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var brands = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new AdminBrandResponse
        {
            Brands = brands,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
