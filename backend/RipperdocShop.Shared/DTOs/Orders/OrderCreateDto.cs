namespace RipperdocShop.Shared.DTOs.Orders;

public class OrderCreateDto
{
    public string? Note { get; set; }
    
    // Don't need them for now. Leaving them here for future use.
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ShippingMethod { get; set; }
    public string? ShippingAddress { get; set; }
    public string? ShippingPhoneNumber { get; set; }
    public string? ShippingEmail { get; set; }
    public string? ShippingNote { get; set; }
    public string? ShippingMethodId { get; set; }
    public string? PaymentMethodId { get; set; }
    public string? Currency { get; set; }
}
