using System.ComponentModel.DataAnnotations;

namespace VleProjectApi.Dtos;

public class GradeNotificationRequestDto
{
    [Required]
    public Guid ModuleId { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    public string? ModuleTitle { get; set; }
}
