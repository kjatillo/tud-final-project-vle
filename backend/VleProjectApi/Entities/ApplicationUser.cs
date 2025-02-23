using Microsoft.AspNetCore.Identity;

namespace VleProjectApi.Entities;

public class ApplicationUser : IdentityUser
{
    public string? Name { get; set; }
}
