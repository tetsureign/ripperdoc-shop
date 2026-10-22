using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Categories;
using RipperdocShop.Shared.DTOs.Categories;

namespace RipperdocShop.Api.Modules.Categories.Queries;

public class ListCategoriesQuery(ApplicationDbContext context)
{
    public async Task<PaginatedCategoryResponse> ExecuteAsync(bool includeDeleted, int page, int pageSize)
    {
        var query = context.Categories
            .AsNoTracking()
            .Where(c => includeDeleted || c.DeletedAt == null);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var categories = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedCategoryResponse
        {
            Categories = categories.Select(category => category.ToDto()!),
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
