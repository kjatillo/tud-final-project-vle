using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleRepository
{
    Task<Module> CreateModuleAsync(Module module);
    Task<Module> EditModuleAsync(Module module);
    Task<Module?> GetModuleByIdAsync(Guid moduleId);
    Task<IEnumerable<Module>> GetModulesAsync();
    Task DeleteModuleAsync(Guid moduleId);
    Task DeleteEnrolmentsByModuleIdAsync(Guid moduleId);
}
