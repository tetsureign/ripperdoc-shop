using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Modules.Ratings.Admin;

namespace RipperdocShop.Api.Modules.Ratings.Queries;

public class ListAdminProductRatingsByProductQuery(ApplicationDbContext context)
{
    public async Task<AdminProductRatingResponse> ExecuteAsync(Guid productId, bool includeDeleted, int page,
        int pageSize)
    {
        var query = context.ProductRatings
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .Where(r => includeDeleted || r.DeletedAt == null);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var ratings = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new AdminProductRatingResponse
        {
            Ratings = ratings,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }
}
