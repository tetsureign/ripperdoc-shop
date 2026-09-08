namespace RipperdocShop.Api.Infrastructure.Errors;

public abstract class DomainException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
