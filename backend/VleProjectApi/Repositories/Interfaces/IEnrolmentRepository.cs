using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IEnrolmentRepository
{
    Task<Enrolment> EnrolUserInModuleAsync(string userId, Guid moduleId);
    Task<IEnumerable<Module>> GetEnroledModulesByUserIdAsync(string userId);
    Task<bool> IsUserEnroledInModuleAsync(string userId, Guid moduleId);
    Task<int> GetTotalEnrolmentsCountAsync();
    Task<int> GetModuleEnrolmentsCountAsync(Guid moduleId);
    Task<IEnumerable<(string Month, int Count)>> GetMonthlyEnrolmentTrendsAsync(int year);
    Task<Dictionary<Guid, int>> GetModuleEnrolmentCountsAsync(IEnumerable<Guid> moduleIds);
}
