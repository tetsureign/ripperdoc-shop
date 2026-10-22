using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace RipperdocShop.Api.Modules;

public static class AppModulesServiceCollectionExtensions
{
    public static IServiceCollection AddAppModules(this IServiceCollection services)
    {
        var assembly = typeof(AppModulesServiceCollectionExtensions).Assembly;

        var handlerTypes = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } &&
                        (t.Name.EndsWith("Command") ||
                         t.Name.EndsWith("Query") ||
                         t.Name.EndsWith("Service")));

        foreach (var type in handlerTypes)
        {
            services.AddScoped(type);
        }

        return services;
    }
}
