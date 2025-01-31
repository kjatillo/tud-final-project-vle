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
    /// Enrolls a user in a module.
    /// </summary>
    /// <param name="userId">The ID of the user to enroll.</param>
    /// <param name="moduleId">The ID of the module to enroll the user in.</param>
    /// <returns>The enrollment record created.</returns>
    public async Task<Enrolment> EnrolUserInModuleAsync(string userId, Guid moduleId)
    {
        var enrollment = new Enrolment
        {
            UserId = userId,
            ModuleId = moduleId
        };

        _context.Enrolments.Add(enrollment);
        await _context.SaveChangesAsync();
        return enrollment;
    }

    /// <summary>
    /// Checks if a user is enrolled in a specific module.
    /// </summary>
    /// <param name="userId">The ID of the user to check.</param>
    /// <param name="moduleId">The ID of the module to check.</param>
    /// <returns>The task result contains a boolean value indicating whether the user is enrolled in the module.</returns>
    public async Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId)
    {
        return await _context.Enrolments
            .AnyAsync(e => e.UserId == userId && e.ModuleId == moduleId);
    }
}
