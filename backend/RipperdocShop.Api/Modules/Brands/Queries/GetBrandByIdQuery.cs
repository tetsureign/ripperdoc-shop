using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;

namespace RipperdocShop.Api.Modules.Brands.Queries;

public class GetBrandByIdQuery(ApplicationDbContext context)
{
    public async Task<Brand?> ExecuteAsync(Guid id)
    {
        return await context.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id);
    }
}
