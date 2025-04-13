using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleSubmissionRepository
{
    Task<IEnumerable<ModuleContent>> GetAssignmentsByModuleIdAsync(Guid moduleId);
    Task<IEnumerable<ModuleSubmission>> GetSubmissionsByContentIdAsync(Guid contentId);
    Task<IEnumerable<ModuleSubmission>> GetSubmissionsByStudentAndModuleAsync(string userId, Guid moduleId);
    Task<ModuleSubmission?> GetSubmissionByIdAsync(Guid submissionId);
    Task<ModuleSubmission?> GetSubmissionByContentIdAndUserIdAsync(Guid contentId, string userId);
    Task<ModuleSubmission> AddSubmissionAsync(ModuleSubmission submission);
    Task UpdateSubmissionAsync(ModuleSubmission? submission);
    Task DeleteSubmissionAsync(Guid submissionId);
    Task<bool> ContentExistsAsync(Guid contentId);
    Task<IEnumerable<ModuleContent>> GetAllAssignmentsAsync();
    Task<IEnumerable<ModuleSubmission>> GetAllSubmissionsAsync();
    Task<IEnumerable<ModuleSubmission>> GetSubmissionsByModuleIdAsync(Guid moduleId);
}
