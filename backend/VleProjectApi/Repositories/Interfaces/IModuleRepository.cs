using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleRepository
{
    Task<Module> CreateModuleAsync(Module module);
    Task<Module> EditModuleAsync(Module module);
    Task<Module?> GetModuleByIdAsync(Guid moduleId);
    Task<IEnumerable<Module>> GetAllModulesAsync();
    Task DeleteModuleAsync(Guid id);
    Task DeleteEnrolmentsByModuleIdAsync(Guid moduleId);
}
