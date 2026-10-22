using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Api.Modules.Products;
using RipperdocShop.Shared.DTOs.Products;

namespace RipperdocShop.Api.Modules.Products.Queries;

public class ListFeaturedProductsQuery(ApplicationDbContext context)
{
    public async Task<IEnumerable<ProductDto>> ExecuteAsync()
    {
        var products = await context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.IsFeatured && p.DeletedAt == null)
            .ToListAsync();

        return products.ToDtos();
    }
}
