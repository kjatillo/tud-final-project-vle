using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.Models;

namespace VleProjectApi.DbContexts;

public class VleDbContext : IdentityDbContext<ApplicationUser>
{
    public VleDbContext(DbContextOptions<VleDbContext> options)
        : base(options) { }

    public required DbSet<Module> Modules { get; set; }
    public required DbSet<Enrolment> Enrolments { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Enrolment>()
            .HasKey(e => e.EnrolmentId);

        builder.Entity<Enrolment>()
            .HasIndex(e => new { e.UserId, e.ModuleId })
            .IsUnique();
    }
}
