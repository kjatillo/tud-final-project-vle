using VleProjectApi.DbContexts;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModuleFileRepository : IModuleFileRepository
{
    private readonly VleDbContext _context;

    public ModuleFileRepository(VleDbContext context)
    {
        _context = context;
    }

    public async Task<ModuleFile> AddModuleFileAsync(ModuleFile moduleFile)
    {
        _context.ModuleFiles.Add(moduleFile);
        await _context.SaveChangesAsync();

        return moduleFile;
    }

    public async Task<IEnumerable<ModuleFile>> GetModuleFilesByModuleIdAsync(Guid moduleId)
    {
        return await _context.ModuleFiles
            .Where(f => f.ModuleId == moduleId)
            .OrderBy(f => f.FileName)
            .ToListAsync();
    }
}
