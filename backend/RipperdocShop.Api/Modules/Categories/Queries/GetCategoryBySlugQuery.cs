using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Categories;
using RipperdocShop.Shared.DTOs.Categories;

namespace RipperdocShop.Api.Modules.Categories.Queries;

public class GetCategoryBySlugQuery(ApplicationDbContext context)
{
    public async Task<CategoryDto?> ExecuteAsync(string slug)
    {
        var category = await context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug);

        return category.ToDto();
    }
}
