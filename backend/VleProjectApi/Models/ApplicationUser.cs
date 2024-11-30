using Microsoft.AspNetCore.Identity;

namespace VleProjectApi.Models;

public class ApplicationUser : IdentityUser
{
    public string? Name { get; set; }
}
