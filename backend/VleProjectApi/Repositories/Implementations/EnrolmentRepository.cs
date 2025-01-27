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

    public async Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId)
    {
        return await _context.Enrolments.AnyAsync(e => e.UserId == userId && e.ModuleId == moduleId);
    }
}
