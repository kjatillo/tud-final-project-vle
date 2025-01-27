using VleProjectApi.Models;

namespace VleProjectApi.Repositories.Interfaces;

public interface IModuleRepository
{
    Task<Module> CreateModuleAsync(Module module);
    Task<Module?> GetModuleByIdAsync(Guid moduleId);
}
