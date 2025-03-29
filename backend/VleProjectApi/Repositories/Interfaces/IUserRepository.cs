using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<ApplicationUser>> GetInstructorsAsync();
}
