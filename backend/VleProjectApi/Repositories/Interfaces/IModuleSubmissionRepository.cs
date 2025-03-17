using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleSubmissionRepository
{
    Task<ModuleSubmission?> GetSubmissionByIdAsync(Guid submissionId);
    Task<ModuleSubmission> AddSubmissionAsync(ModuleSubmission submission);
    Task<IEnumerable<ModuleSubmission>> GetSubmissionsByContentIdAsync(Guid contentId);
    Task<ModuleSubmission?> GetSubmissionByContentIdAndUserIdAsync(Guid contentId, string userId);
    Task UpdateSubmissionAsync(ModuleSubmission? submission);
    Task DeleteSubmissionAsync(Guid submissionId);
    Task<bool> ContentExistsAsync(Guid contentId);
}
