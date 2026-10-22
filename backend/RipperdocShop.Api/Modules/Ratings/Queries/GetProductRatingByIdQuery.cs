using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Ratings;
using RipperdocShop.Shared.DTOs.Ratings;

namespace RipperdocShop.Api.Modules.Ratings.Queries;

public class GetProductRatingByIdQuery(ApplicationDbContext context)
{
    public async Task<ProductRatingDto?> ExecuteAsync(Guid id)
    {
        var rating = await context.ProductRatings
            .AsNoTracking()
            .Include(r => r.Product)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        return rating.ToDto();
    }
}
