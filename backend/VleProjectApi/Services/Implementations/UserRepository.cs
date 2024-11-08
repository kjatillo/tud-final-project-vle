using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Services.Implementations;

public class UserRepository : IUserRepository
{
    private readonly VleDbContext _context;

    public UserRepository(VleDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Retrieves all users from the database, ordered by their last name.
    /// </summary>
    /// <returns>An IEnumerable of User objects.</returns>
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        try
        {
            return await _context.Users.OrderBy(u => u.LastName).ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while retrieving all users.", ex);
        }
    }

    /// <summary>
    /// Retrieves a user from the database by their user ID.
    /// </summary>
    /// <param name="userId">The ID of the user to retrieve.</param>
    /// <returns>A User object if found otherwise null.</returns>
    public async Task<User?> GetUserAsync(int userId)
    {
        try
        {
            return await _context.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
        }
        catch (Exception ex) 
        {
            throw new Exception(
                $"An error occurred while retrieving the user with ID: {userId}.", ex);
        }
    }

    /// <summary>
    /// Adds a new user to the database context.
    /// </summary>
    /// <param name="user">The user object to add.</param>
    public async Task AddUserAsync(User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        try
        {
            await _context.Users.AddAsync(user);
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while adding the user.", ex);
        }
    }

    /// <summary>
    /// Checks if a user exists in the database by their user ID.
    /// </summary>
    /// <param name="userId">The ID of the user to check.</param>
    /// <returns>A boolean true if the user exists otherwise false.</returns>
    public async Task<bool> UserExists(int userId)
    {
        try
        {
            return await _context.Users.AnyAsync(u => u.Id == userId);
        }
        catch(Exception ex)
        {
            throw new Exception(
                $"An error occurred while checking if the user with ID: {userId} exists.", ex);
        }
    }

    /// <summary>
    /// Saves all changes made in this context to the database.
    /// </summary>
    /// <returns>A boolean indicating whether the changes were successfully saved.</returns>
    public async Task<bool> SaveChangesAsync()
    {
        try
        {
            return await _context.SaveChangesAsync() > 0;
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while saving changes to the database.", ex);
        }
    }
}
