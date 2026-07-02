using RipperdocShop.Api.Modules.Auth;
using RipperdocShop.Api.Modules.Auth.Commands;
using RipperdocShop.Api.Modules.Auth.Queries;
using RipperdocShop.Api.Modules.Brands.Commands;
using RipperdocShop.Api.Modules.Brands.Queries;
using RipperdocShop.Api.Modules.Categories.Commands;
using RipperdocShop.Api.Modules.Categories.Queries;
using RipperdocShop.Api.Modules.Customers.Queries;
using RipperdocShop.Api.Modules.Images.Commands;
using RipperdocShop.Api.Modules.Orders.Commands;
using RipperdocShop.Api.Modules.Orders.Queries;
using RipperdocShop.Api.Modules.Products.Commands;
using RipperdocShop.Api.Modules.Products.Queries;
using RipperdocShop.Api.Modules.Ratings.Commands;
using RipperdocShop.Api.Modules.Ratings.Queries;

namespace RipperdocShop.Api.Modules;

public static class AppModulesServiceCollectionExtensions
{
    public static IServiceCollection AddAppModules(this IServiceCollection services)
    {
        services.AddScoped<JwtService>();
        services.AddScoped<LoginCommand>();
        services.AddScoped<RegisterCommand>();
        services.AddScoped<LogoutCommand>();
        services.AddScoped<WhoAmIQuery>();

        services.AddScoped<CreateBrandCommand>();
        services.AddScoped<UpdateBrandCommand>();
        services.AddScoped<SoftDeleteBrandCommand>();
        services.AddScoped<RestoreBrandCommand>();
        services.AddScoped<DeleteBrandPermanentlyCommand>();
        services.AddScoped<ListAdminBrandsQuery>();
        services.AddScoped<GetBrandByIdQuery>();
        services.AddScoped<ListBrandsQuery>();
        services.AddScoped<GetBrandBySlugQuery>();

        services.AddScoped<CreateCategoryCommand>();
        services.AddScoped<UpdateCategoryCommand>();
        services.AddScoped<SoftDeleteCategoryCommand>();
        services.AddScoped<RestoreCategoryCommand>();
        services.AddScoped<DeleteCategoryPermanentlyCommand>();
        services.AddScoped<ListAdminCategoriesQuery>();
        services.AddScoped<GetCategoryByIdQuery>();
        services.AddScoped<ListCategoriesQuery>();
        services.AddScoped<GetCategoryBySlugQuery>();

        services.AddScoped<ListAdminCustomersQuery>();
        services.AddScoped<GetUserByIdQuery>();

        services.AddScoped<UploadImageCommand>();

        services.AddScoped<CreateProductCommand>();
        services.AddScoped<UpdateProductCommand>();
        services.AddScoped<SetProductFeaturedCommand>();
        services.AddScoped<RemoveProductFeaturedCommand>();
        services.AddScoped<SoftDeleteProductCommand>();
        services.AddScoped<RestoreProductCommand>();
        services.AddScoped<DeleteProductPermanentlyCommand>();
        services.AddScoped<ListAdminProductsQuery>();
        services.AddScoped<GetProductByIdQuery>();
        services.AddScoped<ListProductsQuery>();
        services.AddScoped<GetProductBySlugQuery>();
        services.AddScoped<ListProductsByCategorySlugQuery>();
        services.AddScoped<ListProductsByBrandSlugQuery>();
        services.AddScoped<ListFeaturedProductsQuery>();

        services.AddScoped<CreateProductRatingCommand>();
        services.AddScoped<UpdateProductRatingCommand>();
        services.AddScoped<SoftDeleteProductRatingCommand>();
        services.AddScoped<RestoreProductRatingCommand>();
        services.AddScoped<DeleteProductRatingPermanentlyCommand>();
        services.AddScoped<GetProductRatingByIdQuery>();
        services.AddScoped<ListProductRatingsByProductSlugQuery>();
        services.AddScoped<ListAdminProductRatingsByProductQuery>();
        services.AddScoped<ListAdminProductRatingsByUserQuery>();

        services.AddScoped<CancelOrderCommand>();
        services.AddScoped<CompleteOrderCommand>();
        services.AddScoped<PlaceOrderCommand>();
        services.AddScoped<ShipOrderCommand>();
        services.AddScoped<GetOrderDetailsQuery>();
        services.AddScoped<ListAdminOrdersQuery>();
        services.AddScoped<ListMyOrdersQuery>();
        services.AddScoped<GetMyOrderDetailsQuery>();
        services.AddScoped<CancelMyOrderCommand>();

        return services;
    }
}
