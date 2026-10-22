using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Ratings;
using RipperdocShop.Shared.DTOs.Ratings;

namespace RipperdocShop.Api.Modules.Ratings.Queries;

public class ListProductRatingsByProductSlugQuery(ApplicationDbContext context)
{
    public async Task<PaginatedProductRatingResponse> ExecuteAsync(string slug, bool includeDeleted, int page,
        int pageSize)
    {
        var query = context.ProductRatings
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Product)
            .Where(r => r.Product.Slug == slug)
            .Where(r => includeDeleted || r.DeletedAt == null);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var ratings = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedProductRatingResponse
        {
            Ratings = ratings.ToDtos(),
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
