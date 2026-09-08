using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Orders.Commands;
using RipperdocShop.Api.Modules.Orders.Queries;
using RipperdocShop.Shared.DTOs.Orders;

namespace RipperdocShop.Api.Modules.Orders.Public;

[Route("api/orders")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class OrdersController(
    PlaceOrderCommand placeOrder,
    ListMyOrdersQuery listMyOrders,
    GetMyOrderDetailsQuery getMyOrderDetails,
    CancelMyOrderCommand cancelMyOrder) : ControllerBase
{
    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Place([FromBody] OrderCreateDto dto)
    {
        var userId = GetUserId();

        return Ok(await placeOrder.ExecuteAsync(userId, dto));
    }
    
    [HttpPost("cancel/{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = GetUserId();

        return Ok(await cancelMyOrder.ExecuteAsync(id, userId));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();

        return Ok(await listMyOrders.ExecuteAsync(userId, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();

        return Ok(await getMyOrderDetails.ExecuteAsync(id, userId));
    }
}
