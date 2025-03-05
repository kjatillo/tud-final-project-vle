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

    /// <summary>
    /// Adds a new module page to the database.
    /// </summary>
    /// <param name="page">The module page to add.</param>
    /// <returns>The added module page.</returns>
    public async Task<ModulePage> AddPageAsync(ModulePage page)
    {
        _context.ModulePages.Add(page);
        await _context.SaveChangesAsync();

        return page;
    }

    /// <summary>
    /// Retrieves a module page by its unique identifier.
    /// </summary>
    /// <param name="modulePageId">The unique identifier of the module page.</param>
    /// <returns>The module page if found; otherwise, null.</returns>
    public async Task<ModulePage?> GetModulePageById(Guid modulePageId)
    {
        return await _context.ModulePages
            .FirstOrDefaultAsync(p => p.PageId == modulePageId);
    }

    /// <summary>
    /// Retrieves all module pages associated with a specific module, ordered by their title.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module.</param>
    /// <returns>A list of module pages associated with the specified module.</returns>
    public async Task<IEnumerable<ModulePage>> GetPagesByModuleIdAsync(Guid moduleId)
    {
        return await _context.ModulePages
            .Where(p => p.ModuleId == moduleId)
            .OrderBy(p => p.Title)
            .ToListAsync();
    }
}
