using Microsoft.AspNetCore.Identity;

namespace VleProjectBackgroundJob.Entities;

public class ApplicationUser : IdentityUser
{
    public string? Name { get; set; }
}
