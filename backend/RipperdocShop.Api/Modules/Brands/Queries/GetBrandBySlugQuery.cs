using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Shared.DTOs.Brands;

namespace RipperdocShop.Api.Modules.Brands.Queries;

public class GetBrandBySlugQuery(ApplicationDbContext context)
{
    public async Task<BrandDto?> ExecuteAsync(string slug)
    {
        var brand = await context.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Slug == slug);

        return brand.ToDto();
    }
}
