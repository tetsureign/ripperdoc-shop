using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Data;
using RipperdocShop.Api.Models.Entities;

namespace RipperdocShop.Api.Modules.Products.Queries;

public class GetProductByIdQuery(ApplicationDbContext context)
{
    public async Task<Product?> ExecuteAsync(Guid id)
    {
        return await context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}
