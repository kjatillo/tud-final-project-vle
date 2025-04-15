using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly VleDbContext _context;

    public UserRepository(UserManager<ApplicationUser> userManager, VleDbContext context)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _context = context ??  throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Retrieves a list of users who are assigned the role of Instructor.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains a collection of ApplicationUser objects who are instructors.</returns>
    public async Task<IEnumerable<ApplicationUser>> GetInstructorsAsync()
    {
        var instructors = await _userManager.GetUsersInRoleAsync(nameof(Role.Instructor));

        return instructors;
    }

    /// <summary>
    /// Retrieves all users enroled in a specific module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <returns>A list of users enroled in the module ordered by the user's last name.</returns>
    public async Task<IEnumerable<ApplicationUser>> GetEnroledUsersByModuleIdAsync(Guid moduleId)
    {
        return await _context.Enrolments
            .Where(e => e.ModuleId == moduleId)
            .Join(_context.Users,
                  e => e.UserId,
                  u => u.Id,
                  (e, u) => u)
            .OrderBy(u => u.LastName)
            .ToListAsync();
    }
}
