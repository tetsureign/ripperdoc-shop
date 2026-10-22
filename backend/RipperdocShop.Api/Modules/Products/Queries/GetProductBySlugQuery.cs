using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Products;
using RipperdocShop.Shared.DTOs.Products;

namespace RipperdocShop.Api.Modules.Products.Queries;

public class GetProductBySlugQuery(ApplicationDbContext context)
{
    public async Task<ProductDto?> ExecuteAsync(string slug)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Slug == slug);

        return product.ToDto();
    }
}
