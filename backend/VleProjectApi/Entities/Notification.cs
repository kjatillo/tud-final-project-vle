using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VleProjectApi.Entities;

public class Notification
{
    [Key]
    public Guid NotificationId { get; set; } = Guid.NewGuid();

    [Required]
    public string Message { get; set; } = string.Empty;

    [Required]
    public Guid ModuleId { get; set; }

    public string ModuleTitle { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;
    [Required]
    public DateTime CreatedAt { get; set; }

    public bool IsRead { get; set; } = false;
    
    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }
}
