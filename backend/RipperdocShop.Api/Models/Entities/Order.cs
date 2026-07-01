using System.ComponentModel.DataAnnotations;
using RipperdocShop.Api.Models.Identities;
using RipperdocShop.Api.Modules.Orders.Errors;
using RipperdocShop.Api.Modules.Orders.Events;

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

    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public decimal TotalPrice { get; private set; }
    public OrderStatus Status { get; private set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid UserId { get; private set; }
    public AppUser User { get; private set; } = null!;
    
    [StringLength(1000)]
    public string Note { get; private set; } = string.Empty;

    private Order()
    {
    }

    public Order(Guid userId, IEnumerable<CartItem> cartItems, string? note)
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
        Note = note ?? string.Empty;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        UserId = userId;

        Raise(new OrderPlacedEvent(Id, UserId, TotalPrice));
    }

    public void Cancel()
    {
        if (Status != OrderStatus.Pending) throw new InvalidOrderStateTransitionException(Id, Status);

        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
        
        Raise(new OrderCancelledEvent(Id, UserId));
    }

    public void Ship()
    {
        if (Status != OrderStatus.Pending) throw new InvalidOrderStateTransitionException(Id, Status);

        Status = OrderStatus.Shipping;
        UpdatedAt = DateTime.UtcNow;
        
        Raise(new OrderShippedEvent(Id));
    }

    public void Complete()
    {
        if (Status != OrderStatus.Shipping) throw new InvalidOrderStateTransitionException(Id, Status);

        Status = OrderStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
        
        Raise(new OrderCompletedEvent(Id));
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
    private void Raise(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
}
