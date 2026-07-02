using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Carts.Commands;
using RipperdocShop.Api.Modules.Carts.Queries;
using RipperdocShop.Shared.DTOs.Carts;

namespace RipperdocShop.Api.Modules.Carts.Public;

[ApiController]
[Route("api/carts")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class CartsController(
    UpsertCartItemCommand upsertCartItem,
    RemoveFromCartCommand removeFromCart,
    UpdateCartItemCommand updateCartItem,
    GetMyCartQuery getMyCart) : ControllerBase
{
    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> AddItem([FromBody] CartCreateDto dto)
        => Ok(await upsertCartItem.ExecuteAsync(dto.ProductId, GetUserId(), dto.Quantity));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id)
    {
        await removeFromCart.ExecuteAsync(id, GetUserId());
        return NoContent();
    }

    [HttpPost("{id:guid}/quantity")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] int quantity)
        => Ok(await updateCartItem.ExecuteAsync(id, GetUserId(), quantity));

    [HttpGet]
    public async Task<IActionResult> GetMyCart()
        => Ok(await getMyCart.ExecuteAsync(GetUserId()));
}
