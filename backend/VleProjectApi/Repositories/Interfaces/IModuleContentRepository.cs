using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleContentRepository
{
    Task<ModuleContent> AddContentAsync(ModuleContent content);
    Task<IEnumerable<ModuleContent>> GetContentsByPageIdAsync(Guid pageId);
    Task<ModuleContent?> GetContentByIdAsync(Guid contentId);
    Task<ModuleContent> EditContentAsync(ModuleContent content);
    Task DeleteContentAsync(Guid contentId);
    Task<Dictionary<Guid, Guid>> GetModuleIdsByContentIdsAsync(IEnumerable<Guid> contentIds);
}
