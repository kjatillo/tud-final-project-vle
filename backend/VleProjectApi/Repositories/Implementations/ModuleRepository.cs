using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModuleRepository : IModuleRepository
{
    private readonly VleDbContext _context;

    public ModuleRepository(VleDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Creates a new module.
    /// </summary>
    /// <param name="module">The module to create.</param>
    /// <returns>The task result contains the created module.</returns>
    public async Task<Module> CreateModuleAsync(Module module)
    {
        _context.Modules.Add(module);
        await _context.SaveChangesAsync();

        return module;
    }

    /// <summary>
    /// Updates an existing module.
    /// </summary>
    /// <param name="module">The module to update.</param>
    /// <returns>The task result contains the updated module.</returns>
    public async Task<Module> EditModuleAsync(Module module)
    {
        _context.Modules.Update(module);
        await _context.SaveChangesAsync();

        return module;
    }

    /// <summary>
    /// Retrieves a module by its unique identifier.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module.</param>
    /// <returns>The task result contains the module if found; otherwise, null.</returns>
    public async Task<Module?> GetModuleByIdAsync(Guid moduleId)
    {
        return await _context.Modules
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.ModuleId == moduleId);
    }

    /// <summary>
    /// Retrieves all modules.
    /// </summary>
    /// <returns>The task result contains a list of all modules.</returns>
    public async Task<IEnumerable<Module>> GetModulesAsync()
    {
        return await _context.Modules.OrderBy(m => m.ModuleName).ToListAsync();
    }

    /// <summary>
    /// Retrieves all modules assigned to a specific instructor.
    /// </summary>
    /// <param name="instructorId">The unique identifier of the instructor.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a list of modules assigned to the instructor, ordered by module name.</returns>
    public async Task<IEnumerable<Module>> GetModulesByInstructorIdAsync(string instructorId)
    {
        return await _context.Modules
            .Where(m => m.ModuleInstructor == instructorId)
            .OrderBy(m => m.ModuleName)
            .ToListAsync();
    }

    /// <summary>
    /// Deletes a module by its unique identifier.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module to delete.</param>
    public async Task DeleteModuleAsync(Guid moduleId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module != null)
        {
            _context.Modules.Remove(module);

            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Deletes all enrolments associated with a specific module.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module whose enrolments are to be deleted.</param>
    public async Task DeleteEnrolmentsByModuleIdAsync(Guid moduleId)
    {
        var enrolments = _context.Enrolments.Where(e => e.ModuleId == moduleId);
        _context.Enrolments.RemoveRange(enrolments);

        await _context.SaveChangesAsync();
    }
}
