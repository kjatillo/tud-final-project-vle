using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModulePageRepository
{
    Task<ModulePage> AddPageAsync(ModulePage page);
    Task<ModulePage?> GetModulePageById(Guid modulePageId);
    Task<IEnumerable<ModulePage>> GetPagesByModuleIdAsync(Guid moduleId);
    Task<ModulePage> EditPageAsync(ModulePage page);
    Task DeletePageAsync(Guid pageId);
}
