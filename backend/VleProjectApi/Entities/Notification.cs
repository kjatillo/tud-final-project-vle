using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VleProjectApi.Entities;

public class Notification
{
    [Key]
    public Guid NotificationId { get; set; } = Guid.NewGuid();

    [Required]
    public string Message { get; set; } = string.Empty;

    public Guid? ModuleId { get; set; }

    public string? ModuleTitle { get; set; }

    public string? UserId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    public bool IsRead { get; set; } = false;

    public string NotificationType { get; set; } = nameof(Enums.NotificationType.Grade);

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }
}
