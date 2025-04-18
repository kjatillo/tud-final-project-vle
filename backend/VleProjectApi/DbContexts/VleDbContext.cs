using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.Entities;

namespace VleProjectApi.DbContexts;

public class VleDbContext : IdentityDbContext<ApplicationUser>
{
    public VleDbContext(DbContextOptions<VleDbContext> options)
        : base(options) { }

    public required DbSet<Module> Modules { get; set; }
    public required DbSet<Enrolment> Enrolments { get; set; }
    public required DbSet<ModulePage> ModulePages { get; set; }
    public required DbSet<ModuleContent> ModuleContents { get; set; }
    public DbSet<ModuleSubmission> ModuleSubmissions { get; set; }
    public DbSet<Notification> Notifications { get; set; }

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

        builder.Entity<Notification>()
            .HasKey(n => n.NotificationId);
    }
}
