using Microsoft.AspNetCore.Identity;

namespace RipperdocShop.Api.Models.Identities;

public class AppUserRole : IdentityUserRole<Guid>
{
    public required AppUser User { get; set; }
    public required AppRole Role { get; set; }
}
