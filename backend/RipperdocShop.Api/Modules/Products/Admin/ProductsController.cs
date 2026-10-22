using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Products.Commands;
using RipperdocShop.Api.Modules.Products.Queries;
using RipperdocShop.Shared.DTOs;
using RipperdocShop.Shared.DTOs.Products;

namespace RipperdocShop.Api.Modules.Products.Admin;

[Route("api/admin/products")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
public class ProductsController(
    ListAdminProductsQuery listAdminProducts,
    GetProductByIdQuery getProductById,
    CreateProductCommand createProduct,
    UpdateProductCommand updateProduct,
    SetProductFeaturedCommand setProductFeatured,
    RemoveProductFeaturedCommand removeProductFeatured,
    SoftDeleteProductCommand softDeleteProduct,
    RestoreProductCommand restoreProduct,
    DeleteProductPermanentlyCommand deleteProductPermanently) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await listAdminProducts.ExecuteAsync(includeDeleted, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await getProductById.ExecuteAsync(id);
        return product == null
            ? NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Product not found",
                Detail = $"Product with ID {id} does not exist"
            })
            : Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProductCreateDto createDto)
    {
        var product = await createProduct.ExecuteAsync(createDto);
        return CreatedAtAction(nameof(GetById), new { id = product?.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, ProductCreateDto createDto)
    {
        var product = await updateProduct.ExecuteAsync(id, createDto);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Could not update product",
                Detail =
                    $"Product with ID {id}, or Category with ID {createDto.CategoryId}, or Brand with ID {createDto.BrandId} does not exist"
            });
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/feature")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetFeatured(Guid id)
    {
        var product = await setProductFeatured.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Product with ID {id} does not exist"
            });
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/unfeature")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveFeatured(Guid id)
    {
        var product = await removeProductFeatured.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Product with ID {id} does not exist"
            });
        }

        return NoContent();
    }


    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var product = await softDeleteProduct.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Product with ID {id} does not exist"
            });
        }

        return NoContent();
    }


    [HttpPost("{id:guid}/restore")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Restore(Guid id)
    {
        var product = await restoreProduct.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Product with ID {id} does not exist"
            });
        }

        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePermanently(Guid id)
    {
        var product = await deleteProductPermanently.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Product with ID {id} does not exist"
            });
        }

        return NoContent();
    }
}
