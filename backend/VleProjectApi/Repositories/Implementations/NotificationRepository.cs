using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class NotificationRepository : INotificationRepository
{
    private readonly VleDbContext _context;
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public NotificationRepository(
        VleDbContext context,
        IEnrolmentRepository enrolmentRepository,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
    }

    /// <summary>
    /// Retrieves a list of notifications for a specific user, ordered by the most recent creation date.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose notifications are to be retrieved.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a collection of notifications for the specified user.</returns>
    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Creates a new notification in the database.
    /// </summary>
    /// <param name="notification">The notification object to be created.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains the created notification object.
    /// </returns>
    public async Task<Notification> CreateNotificationAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    /// <summary>
    /// Marks a specific notification as read by its unique identifier.
    /// </summary>
    /// <param name="notificationId">The unique identifier of the notification to mark as read.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether the operation was successful. Returns true if the notification was found and marked as read, otherwise false.
    /// </returns>
    public async Task<bool> MarkAsReadAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Marks all notifications as read for a specific user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose notifications are to be marked as read.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether any notifications were marked as read. Returns true if at least one notification was updated, otherwise false.
    /// </returns>
    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (!notifications.Any()) return false;

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes a specific notification from the database by its unique identifier.
    /// </summary>
    /// <param name="notificationId">The unique identifier of the notification to delete.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether the operation was successful. Returns true if the notification was found and deleted, otherwise false.
    /// </returns>
    public async Task<bool> DeleteNotificationAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes all notifications for a specific user from the database.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose notifications are to be deleted.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether any notifications were deleted. Returns true if at least one notification was deleted, otherwise false.
    /// </returns>
    public async Task<bool> DeleteAllNotificationsAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        if (!notifications.Any()) return false;

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Creates notifications for all users enroled in a specific module.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module for which notifications are to be created.</param>
    /// <param name="message">The message content of the notification.</param>
    /// <param name="moduleTitle">The title of the module associated with the notification.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether any notifications were created. Returns true if notifications were created, otherwise false.
    /// </returns>
    public async Task<bool> CreateModuleNotificationsAsync(Guid moduleId, string message, string moduleTitle)
    {
        var enroledUsers = await _enrolmentRepository.GetEnroledUsersByModuleIdAsync(moduleId);
        if (!enroledUsers.Any()) return false;

        foreach (var user in enroledUsers)
        {
            await _context.Notifications.AddAsync(new Notification
            {
                Message = message,
                ModuleId = moduleId,
                ModuleTitle = moduleTitle,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = nameof(NotificationType.Grade)
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Marks a notification as read based on its content, user, and module.
    /// </summary>
    /// <param name="userId">The unique identifier of the user associated with the notification.</param>
    /// <param name="moduleId">The unique identifier of the module associated with the notification.</param>
    /// <param name="message">The message content of the notification to match.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a tuple containing:
    /// - A boolean indicating whether the operation was successful.
    /// - The unique identifier of the notification that was marked as read, or null if no notification was found.
    /// </returns>
    public async Task<(bool Success, Guid? NotificationId)> MarkAsReadByContentAsync(string userId, Guid moduleId, string message)
    {
        var notification = await _context.Notifications
            .Where(n => n.UserId == userId &&
                   n.ModuleId.HasValue && n.ModuleId.Value == moduleId &&
                   n.Message == message &&
                   !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .FirstOrDefaultAsync();

        if (notification == null)
        {
            // Try fuzzy match
            notification = await _context.Notifications
                .Where(n => n.UserId == userId &&
                       n.ModuleId.HasValue && n.ModuleId.Value == moduleId &&
                       (n.Message.ToLower().Contains(message.ToLower()) ||
                       (message.Length > 10 && message.ToLower().Contains(n.Message.ToLower()))) &&
                       !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .FirstOrDefaultAsync();

            if (notification == null)
                return (false, null);
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return (true, notification.NotificationId);
    }

    /// <summary>
    /// Creates notifications for all users with admin role.
    /// </summary>
    /// <param name="message">The message content of the notification.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result is a boolean indicating 
    /// whether any notifications were created. Returns true if notifications were created, otherwise false.
    /// </returns>
    public async Task<bool> CreateAdminNotificationAsync(string message)
    {
        var adminRoleName = Role.Admin.ToString();

        var adminRole = await _roleManager.FindByNameAsync(adminRoleName);
        if (adminRole == null) return false;

        var adminUserIds = await _context.UserRoles
            .Where(ur => ur.RoleId == adminRole.Id)
            .Select(ur => ur.UserId)
            .ToListAsync();

        if (!adminUserIds.Any()) return false;

        foreach (var userId in adminUserIds)
        {
            await _context.Notifications.AddAsync(new Notification
            {
                Message = message,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = nameof(NotificationType.Admin)
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
