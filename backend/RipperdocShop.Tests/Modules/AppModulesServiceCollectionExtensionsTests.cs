using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using RipperdocShop.Api.Modules;
using RipperdocShop.Api.Modules.Orders.Commands;
using RipperdocShop.Api.Modules.Orders.Queries;
using RipperdocShop.Api.Modules.Carts.Commands;
using RipperdocShop.Api.Modules.Carts.Queries;

namespace RipperdocShop.Tests.Modules;

public class AppModulesServiceCollectionExtensionsTests
{
    [Fact]
    public void AddAppModules_Registers_All_Commands_Queries_And_Services_As_Scoped()
    {
        var services = new ServiceCollection();

        services.AddAppModules();

        var apiAssembly = typeof(AppModulesServiceCollectionExtensions).Assembly;
        var expectedTypes = apiAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } &&
                        (t.Name.EndsWith("Command") ||
                         t.Name.EndsWith("Query") ||
                         t.Name.EndsWith("Service")))
            .ToList();

        Assert.NotEmpty(expectedTypes);

        foreach (var type in expectedTypes)
        {
            Assert.Contains(services, descriptor =>
                descriptor.ServiceType == type &&
                descriptor.ImplementationType == type &&
                descriptor.Lifetime == ServiceLifetime.Scoped);
        }

        // Explicitly assert key lifecycle & critical types are registered
        AssertScoped<PlaceOrderCommand>(services);
        AssertScoped<ListMyOrdersQuery>(services);
        AssertScoped<UpsertCartItemCommand>(services);
        AssertScoped<GetMyCartQuery>(services);
    }

    private static void AssertScoped<TService>(IServiceCollection services)
    {
        Assert.Contains(services, descriptor =>
            descriptor.ServiceType == typeof(TService) &&
            descriptor.ImplementationType == typeof(TService) &&
            descriptor.Lifetime == ServiceLifetime.Scoped);
    }
}
