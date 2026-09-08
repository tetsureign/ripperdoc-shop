using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RipperdocShop.Api.Modules.Orders.Commands;
using RipperdocShop.Api.Modules.Orders.Queries;

namespace RipperdocShop.Api.Modules.Orders.Admin;

[Route("api/admin/orders")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
public class OrdersController(
    CancelOrderCommand cancelOrder,
    CompleteOrderCommand completeOrder,
    ShipOrderCommand shipOrder,
    ListAdminOrdersQuery listOrders,
    GetOrderDetailsQuery getOrderDetails) : ControllerBase
{
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
        => Ok(await cancelOrder.ExecuteAsync(id));


    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteOrder(Guid id)
        => Ok(await completeOrder.ExecuteAsync(id));


    [HttpPost("{id:guid}/ship")]
    public async Task<IActionResult> ShipOrder(Guid id)
        => Ok(await shipOrder.ExecuteAsync(id));


    [HttpGet]
    public async Task<IActionResult> List([FromQuery] AdminOrderFilter filter)
        => Ok(await listOrders.ExecuteAsync(filter));
    
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetails(Guid id)
        => Ok(await getOrderDetails.ExecuteAsync(id));
}
