using Microsoft.AspNetCore.Identity;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserRepository(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    /// <summary>
    /// Retrieves a list of users who are assigned the role of Instructor.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains a collection of ApplicationUser objects who are instructors.</returns>
    public async Task<IEnumerable<ApplicationUser>> GetInstructorsAsync()
    {
        var instructors = await _userManager.GetUsersInRoleAsync(nameof(Role.Instructor));

        return instructors;
    }
}
