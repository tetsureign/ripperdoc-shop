using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Ratings.Commands;
using RipperdocShop.Api.Modules.Ratings.Queries;

namespace RipperdocShop.Api.Modules.Ratings.Admin;

[Route("api/admin/ratings")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
public class ProductRatingsController(
    ListAdminProductRatingsByProductQuery listRatingsByProduct,
    ListAdminProductRatingsByUserQuery listRatingsByUser,
    SoftDeleteProductRatingCommand softDeleteRating,
    RestoreProductRatingCommand restoreRating) : ControllerBase
{
    [HttpGet("by-product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, [FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await listRatingsByProduct.ExecuteAsync(productId, includeDeleted, page, pageSize);

        return !response.Ratings.Any() ? NotFound(new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Product not found",
            Detail = $"Product with ID {productId} does not exist"
        }) : Ok(response);
    }

    [HttpGet("by-user/{userId:guid}")]
    public async Task<IActionResult> GetByUser(Guid userId, [FromQuery] bool includeDeleted = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await listRatingsByUser.ExecuteAsync(userId, includeDeleted, page, pageSize);

        return !response.Ratings.Any() ? NotFound(new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Product not found",
            Detail = $"Product with ID {userId} does not exist"
        }) : Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var product = await softDeleteRating.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Rating with ID {id} does not exist"
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
        var product = await restoreRating.ExecuteAsync(id);
        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found",
                Detail = $"Rating with ID {id} does not exist"
            });
        }

        return NoContent();
    }
}
