using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class EnrolmentRepository : IEnrolmentRepository
{
    private readonly VleDbContext _context;

    public EnrolmentRepository(VleDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
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
            ModuleId = moduleId,
            EnrolmentDate = DateTime.Now
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

    /// <summary>
    /// Gets the total number of enrolments across all modules.
    /// </summary>
    /// <returns>The total number of enrolments.</returns>
    public async Task<int> GetTotalEnrolmentsCountAsync()
    {
        return await _context.Enrolments.CountAsync();
    }

    /// <summary>
    /// Gets the number of enrolments for a specific module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <returns>The number of enrolments for the specified module.</returns>
    public async Task<int> GetModuleEnrolmentsCountAsync(Guid moduleId)
    {
        return await _context.Enrolments
            .CountAsync(e => e.ModuleId == moduleId);
    }

    /// <summary>
    /// Gets the number of enrolments for multiple modules in a single query.
    /// </summary>
    /// <param name="moduleIds">The collection of module IDs to get enrollment counts for.</param>
    /// <returns>A dictionary with module IDs as keys and their enrollment counts as values.</returns>
    public async Task<Dictionary<Guid, int>> GetModuleEnrolmentCountsAsync(IEnumerable<Guid> moduleIds)
    {
        return await _context.Enrolments
            .Where(e => moduleIds.Contains(e.ModuleId))
            .GroupBy(e => e.ModuleId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Count()
            );
    }

    /// <summary>
    /// Gets monthly enrolment trends for a specific year.
    /// </summary>
    /// <param name="year">The year to get trends for. Defaults to current year if not specified.</param>
    /// <returns>A collection of tuples containing month names and enrolment counts.</returns>
    public async Task<IEnumerable<(string Month, int Count)>> GetMonthlyEnrolmentTrendsAsync(int year)
    {
        var enrolments = await _context.Enrolments
            .Where(e => e.EnrolmentDate.Year == year)
            .OrderBy(e => e.EnrolmentDate)
            .ToListAsync();

        return Enum.GetValues<Month>().Select(month => {
            var monthNumber = (int)month + 1;
            var monthlyCount = enrolments.Count(e => e.EnrolmentDate.Month == monthNumber);

            return (Month: month.ToString(), Count: monthlyCount);
        });
    }

    /// <summary>
    /// Retrieves all users enroled in a specific module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to retrieve enrolled users for.</param>
    /// <returns>A list of users who are enroled in the specified module.</returns>
    public async Task<IEnumerable<ApplicationUser>> GetEnroledUsersByModuleIdAsync(Guid moduleId)
    {
        var userIds = await _context.Enrolments
            .Where(e => e.ModuleId == moduleId)
            .Select(e => e.UserId)
            .ToListAsync();

        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();

        return users;
    }
}
