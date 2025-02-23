using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleFileRepository
{
    Task<ModuleFile> AddModuleFileAsync(ModuleFile moduleFile);
    Task<IEnumerable<ModuleFile>> GetModuleFilesByModuleIdAsync(Guid moduleId);
}
