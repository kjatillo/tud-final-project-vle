using Microsoft.EntityFrameworkCore;
using VleProjectApi.Entities;

namespace VleProjectApi.DbContexts;

public class VleDbContext : DbContext
{
    public VleDbContext(DbContextOptions<VleDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
}
