using VleProjectApi.Entities;

namespace VleProjectApi.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
    Task<Notification> CreateNotificationAsync(Notification notification);
    Task<bool> MarkAsReadAsync(Guid notificationId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(Guid notificationId);
    Task<bool> DeleteAllNotificationsAsync(string userId);
    Task<bool> CreateModuleNotificationsAsync(Guid moduleId, string message, string moduleTitle);
    Task<bool> CreateAdminNotificationAsync(string message);
    Task<(bool Success, Guid? NotificationId)> MarkAsReadByContentAsync(string userId, Guid moduleId, string message);
}
