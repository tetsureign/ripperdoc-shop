using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace RipperdocShop.Api.Infrastructure.Errors;

public class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            DomainException domain => (domain.StatusCode, "Domain error"),
            ArgumentOutOfRangeException => (StatusCodes.Status400BadRequest, "Invalid request"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request"),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Invalid operation"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            _ => (StatusCodes.Status500InternalServerError, "Unexpected error")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            var safePath = httpContext.Request.Path.Value?
                .Replace("\r", string.Empty)
                .Replace("\n", string.Empty) ?? string.Empty;

            logger.LogError(
                "Unhandled {ExceptionType} while processing {Path}",
                exception.GetType().Name,
                safePath);
        }

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await JsonSerializer.SerializeAsync(httpContext.Response.Body, problem, cancellationToken: cancellationToken);

        return true;
    }
}
