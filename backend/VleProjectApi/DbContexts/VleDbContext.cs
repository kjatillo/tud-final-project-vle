using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.Models;

namespace VleProjectApi.DbContexts;

public class VleDbContext : IdentityDbContext<ApplicationUser>
{
    public VleDbContext(DbContextOptions<VleDbContext> options) 
        : base(options) { }

    public required DbSet<Module> Modules { get; set; }
}
