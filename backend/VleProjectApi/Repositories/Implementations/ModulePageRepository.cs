using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModulePageRepository : IModulePageRepository
{
    private readonly VleDbContext _context;

    public ModulePageRepository(VleDbContext context)
    {
        _context = context;
    }

    public async Task<ModulePage> AddPageAsync(ModulePage page)
    {
        _context.ModulePages.Add(page);
        await _context.SaveChangesAsync();

        return page;
    }

    public async Task<ModulePage?> GetModulePageById(Guid modulePageId)
    {
        return await _context.ModulePages
            .FirstOrDefaultAsync(p => p.PageId == modulePageId);
    }

    public async Task<IEnumerable<ModulePage>> GetPagesByModuleIdAsync(Guid moduleId)
    {
        return await _context.ModulePages
            .Where(p => p.ModuleId == moduleId)
            .OrderBy(p => p.Title)
            .ToListAsync();
    }
}
