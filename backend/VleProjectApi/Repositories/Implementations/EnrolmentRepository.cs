using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Models;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class EnrolmentRepository : IEnrolmentRepository
{
    private readonly VleDbContext _context;

    public EnrolmentRepository(VleDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Enrols a user in a module.
    /// </summary>
    /// <param name="userId">The ID of the user to enrol.</param>
    /// <param name="moduleId">The ID of the module to enrol the user in.</param>
    /// <returns>The enrolment record created.</returns>
    public async Task<Enrolment> EnrolUserInModuleAsync(string userId, Guid moduleId)
    {
        var enrolment = new Enrolment
        {
            UserId = userId,
            ModuleId = moduleId
        };

        _context.Enrolments.Add(enrolment);
        await _context.SaveChangesAsync();
        return enrolment;
    }

    /// <summary>
    /// Retrieves all modules enroled by a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <returns>A list of modules enroled by the user.</returns>
    public async Task<IEnumerable<Module>> GetEnroledModulesByUserIdAsync(string userId)
    {
        return await _context.Enrolments
            .Where(e => e.UserId == userId)
            .Join(_context.Modules,
                  e => e.ModuleId,
                  m => m.ModuleId,
                  (e, m) => m)
            .OrderBy(m => m.ModuleName)
            .ToListAsync();
    }

    /// <summary>
    /// Checks if a user is enroled in a specific module.
    /// </summary>
    /// <param name="userId">The ID of the user to check.</param>
    /// <param name="moduleId">The ID of the module to check.</param>
    /// <returns>The task result contains a boolean value indicating whether the user is enroled in the module.</returns>
    public async Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId)
    {
        return await _context.Enrolments
            .AnyAsync(e => e.UserId == userId && e.ModuleId == moduleId);
    }
}
