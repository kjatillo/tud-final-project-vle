using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IEnrolmentRepository
{
    Task<Enrolment> EnrolUserInModuleAsync(string userId, Guid moduleId);
    Task<IEnumerable<Module>> GetEnroledModulesByUserIdAsync(string userId);
    Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId);
}
