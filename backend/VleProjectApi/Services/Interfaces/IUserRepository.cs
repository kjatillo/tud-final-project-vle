using VleProjectApi.Entities;

namespace VleProjectApi.Services.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetUserAsync(int userId);
    Task AddUserAsync(User user);

    Task<bool> UserExists(int userId);
    Task<bool> SaveChangesAsync();
}
