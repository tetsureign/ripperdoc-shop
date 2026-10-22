using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Shared.DTOs.Brands;

namespace RipperdocShop.Api.Modules.Brands.Queries;

public class ListBrandsQuery(ApplicationDbContext context)
{
    public async Task<PaginatedBrandResponse> ExecuteAsync(bool includeDeleted, int page, int pageSize)
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

        return new PaginatedBrandResponse
        {
            Brands = brands.Select(brand => brand.ToDto()!),
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
