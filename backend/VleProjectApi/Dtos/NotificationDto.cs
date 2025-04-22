namespace VleProjectApi.Dtos;

public class NotificationDto
{
    public Guid NotificationId { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? ModuleId { get; set; }
    public string? ModuleTitle { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string NotificationType { get; set; } = nameof(Enums.NotificationType.Grade);
}
