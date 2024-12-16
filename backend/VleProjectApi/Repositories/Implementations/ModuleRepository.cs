using VleProjectApi.DbContexts;
using VleProjectApi.Models;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModuleRepository : IModuleRepository
{
    private readonly VleDbContext _context;

    public ModuleRepository(VleDbContext context)
    {
        _context = context;
    }

    public async Task<Module> CreateModuleAsync(Module module)
    {
        _context.Modules.Add(module);
        await _context.SaveChangesAsync();

        return module;
    }
}
