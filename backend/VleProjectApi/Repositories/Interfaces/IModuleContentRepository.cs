using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleContentRepository
{
    Task<ModuleContent> AddContentAsync(ModuleContent content);
    Task<IEnumerable<ModuleContent>> GetContentsByPageIdAsync(Guid pageId);
}
