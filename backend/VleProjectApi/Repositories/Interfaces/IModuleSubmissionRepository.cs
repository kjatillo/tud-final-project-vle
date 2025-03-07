using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleSubmissionRepository
{
    Task<ModuleSubmission> AddSubmissionAsync(ModuleSubmission submission);
    Task<IEnumerable<ModuleSubmission>> GetSubmissionsByContentIdAsync(Guid contentId);
    Task<ModuleSubmission?> GetSubmissionByContentIdAndUserIdAsync(Guid contentId, string userId);
    Task DeleteSubmissionAsync(Guid submissionId);
}
