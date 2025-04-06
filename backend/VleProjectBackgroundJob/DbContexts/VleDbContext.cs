using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VleProjectBackgroundJob.Entities;

namespace VleProjectBackgroundJob.DbContexts;

public class VleDbContext : IdentityDbContext<ApplicationUser>
{
    public VleDbContext(DbContextOptions<VleDbContext> options)
        : base(options) { }

    public required DbSet<Module> Modules { get; set; }
    public required DbSet<Enrolment> Enrolments { get; set; }
    public required DbSet<ModulePage> ModulePages { get; set; }
    public required DbSet<ModuleContent> ModuleContents { get; set; }
    public required DbSet<ModuleSubmission> ModuleSubmissions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Enrolment>()
            .HasKey(e => e.EnrolmentId);

        builder.Entity<Enrolment>()
            .HasIndex(e => new { e.UserId, e.ModuleId })
            .IsUnique();

        builder.Entity<Module>()
            .Property(m => m.Price)
            .HasPrecision(18, 2);

        builder.Entity<ModuleContent>()
            .HasKey(c => c.ContentId);

        builder.Entity<ModulePage>()
            .HasKey(p => p.PageId);

        builder.Entity<ModuleSubmission>()
            .HasKey(ms => ms.SubmissionId);

        builder.Entity<Module>()
            .HasMany(m => m.ModulePages)
            .WithOne(mp => mp.Module)
            .HasForeignKey(mp => mp.ModuleId);

        builder.Entity<ModulePage>()
            .HasMany(mp => mp.ModuleContents)
            .WithOne(mc => mc.ModulePage)
            .HasForeignKey(mc => mc.PageId);

        builder.Entity<ModuleSubmission>()
            .HasOne(ms => ms.ModulePage)
            .WithMany(mp => mp.ModuleSubmissions)
            .HasForeignKey(ms => ms.ContentId);
    }
}
