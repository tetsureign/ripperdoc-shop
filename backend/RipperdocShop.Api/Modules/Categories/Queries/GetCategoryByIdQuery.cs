using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;

namespace RipperdocShop.Api.Modules.Categories.Queries;

public class GetCategoryByIdQuery(ApplicationDbContext context)
{
    public async Task<Category?> ExecuteAsync(Guid id)
    {
        return await context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}
