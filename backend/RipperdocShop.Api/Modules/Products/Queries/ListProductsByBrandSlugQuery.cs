using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Products;
using RipperdocShop.Shared.DTOs.Products;

namespace RipperdocShop.Api.Modules.Products.Queries;

public class ListProductsByBrandSlugQuery(ApplicationDbContext context)
{
    public async Task<PaginatedProductResponse> ExecuteAsync(string slug, bool includeDeleted, int page, int pageSize)
    {
        var query = context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p =>
                p.Brand != null && p.Brand.Slug == slug &&
                (includeDeleted || p.DeletedAt == null) &&
                (includeDeleted || p.Category.DeletedAt == null) &&
                (includeDeleted || p.Brand.DeletedAt == null));

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedProductResponse
        {
            Products = products.ToDtos(),
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
