using RipperdocShop.Api.Models.Identities;

namespace RipperdocShop.Api.Models.Entities;

public enum OrderStatus
{
    Pending,
    Shipping,
    Completed,
    Cancelled,
}

public class Order : ITimestampedEntity
{
    public Guid Id { get; private set; }

    private readonly List<OrderItem> _orderItems = [];

    public IReadOnlyList<OrderItem> OrderItems => _orderItems.AsReadOnly();

    public decimal TotalPrice { get; private set; }
    public OrderStatus Status { get; private set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid UserId { get; private set; }
    public AppUser User { get; private set; } = null!;

    public Order()
    {
    }

    public void Place(Guid userId, IEnumerable<CartItem> cartItems)
    {
        ArgumentNullException.ThrowIfNull(cartItems);

        var itemsList = cartItems as IReadOnlyCollection<CartItem> ?? cartItems.ToList();

        var myItems = itemsList.Where(ci => ci.UserId == userId).ToList();

        if (myItems.Count == 0)
            throw new ArgumentException("Adding nothin'?. (Cart is empty)");

        foreach (var cartItem in myItems)
            _orderItems.Add(new OrderItem(cartItem.Product, cartItem.Quantity));


        Id = Guid.NewGuid();
        TotalPrice = myItems.Sum(ci => ci.Product.Price * ci.Quantity);
        Status = OrderStatus.Pending;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        UserId = userId;
    }

    public void Cancel()
    {
        if (Status != OrderStatus.Pending) return;

        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Ship()
    {
        if (Status != OrderStatus.Pending) return;
        
        Status = OrderStatus.Shipping;
    }
    
    public void Complete()
    {
        if (Status != OrderStatus.Shipping) return;
        
        Status = OrderStatus.Completed;
    }
}
