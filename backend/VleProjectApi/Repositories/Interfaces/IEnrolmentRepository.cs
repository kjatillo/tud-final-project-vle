using VleProjectApi.Models;

namespace VleProjectApi.Repositories.Interfaces;

public interface IEnrolmentRepository
{
    Task<Enrolment> EnrolUserInModuleAsync(string userId, Guid moduleId);
    Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId);
}
