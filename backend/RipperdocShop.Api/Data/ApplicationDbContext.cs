using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RipperdocShop.Api.Models.Entities;
using RipperdocShop.Api.Models.Identities;
using RipperdocShop.Api.Interceptors;

namespace RipperdocShop.Api.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    TimestampInterceptor timestampInterceptor)
    : IdentityDbContext<AppUser, AppRole, Guid, 
        IdentityUserClaim<Guid>, AppUserRole, IdentityUserLogin<Guid>, 
        IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>(options)
{
    public DbSet<Category> Categories { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductRating> ProductRatings { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<CartItem> CartItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(timestampInterceptor);
        optionsBuilder.UseSnakeCaseNamingConvention();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Rename auto-generated identity tables
        builder.Entity<AppUser>().ToTable("users");
        builder.Entity<AppRole>().ToTable("roles");
        builder.Entity<AppUserRole>()
            .ToTable("user_roles")
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        builder.Entity<AppUserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        builder.Entity<AppUserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens");

        builder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.Slug).IsRequired().HasMaxLength(120);
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
            e.Property(c => c.Description).IsRequired().HasMaxLength(1000);
        });

        builder.Entity<Brand>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.Slug).IsUnique();
            e.Property(b => b.Slug).IsRequired().HasMaxLength(120);
            e.Property(b => b.Name).IsRequired().HasMaxLength(100);
            e.Property(b => b.Description).IsRequired().HasMaxLength(1000);
        });

        builder.Entity<Product>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Slug).IsRequired().HasMaxLength(120);
            e.Property(p => p.Name).IsRequired().HasMaxLength(100);
            e.Property(p => p.Description).IsRequired().HasMaxLength(1000);
            e.Property(p => p.ImageUrl).IsRequired();
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");

            e.HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.Brand)
                .WithMany()
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<ProductRating>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Score).IsRequired();
            e.Property(r => r.Comment).HasMaxLength(3000);
            
            e.HasCheckConstraint(
                "CK_ProductRatings_Score_Range",
                "score >= 1 AND score <= 5"
            );

            e.HasIndex(r => new { r.ProductId, r.UserId })
                .IsUnique();

            e.HasOne(r => r.Product)
                .WithMany()
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Status).IsRequired();
            e.Property(o => o.TotalPrice).HasColumnType("decimal(18,2)");

            e.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<OrderItem>(e =>
        {
            e.HasKey(oi => oi.Id);
            e.Property(oi => oi.Quantity).IsRequired();

            e.HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId);
        });

        builder.Entity<CartItem>(e =>
        {
            e.HasKey(ci => ci.Id);

            e.HasIndex(ci => new { ci.UserId, ci.ProductId }).IsUnique();

            e.HasOne(ci => ci.Product)
                .WithMany()
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ci => ci.User)
                .WithMany()
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AppUser>(e => { e.Property(u => u.IsDisabled).HasDefaultValue(false); });
    }
}
