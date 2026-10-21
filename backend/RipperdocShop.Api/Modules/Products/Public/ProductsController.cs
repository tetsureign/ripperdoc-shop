using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Products.Queries;

namespace RipperdocShop.Api.Modules.Products.Public;

[Route("api/products")]
[ApiController]
public class ProductsController(
    ListProductsQuery listProducts,
    GetProductBySlugQuery getProductBySlug,
    ListProductsByCategorySlugQuery listProductsByCategorySlug,
    ListProductsByBrandSlugQuery listProductsByBrandSlug,
    ListFeaturedProductsQuery listFeaturedProducts) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await listProducts.ExecuteAsync(false, page, pageSize);
        return Ok(response);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var product = await getProductBySlug.ExecuteAsync(slug);
        return product == null
            ? NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Product not found",
                Detail = $"Product with slug {slug} does not exist"
            })
            : Ok(product);
    }

    [HttpGet("category/{slug}")]
    public async Task<IActionResult> GetByCategorySlug(string slug, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await listProductsByCategorySlug.ExecuteAsync(slug, false, page, pageSize);
        return Ok(response);
    }

    [HttpGet("brand/{slug}")]
    public async Task<IActionResult> GetByBrandSlug(string slug, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await listProductsByBrandSlug.ExecuteAsync(slug, false, page, pageSize);

        return Ok(response);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var products = await listFeaturedProducts.ExecuteAsync();
        return !products.Any()
            ? NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "No featured product",
                Detail = "No featured product"
            })
            : Ok(products);
    }
}
