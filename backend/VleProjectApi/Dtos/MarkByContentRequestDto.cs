using System.ComponentModel.DataAnnotations;

namespace VleProjectApi.Dtos;

public class MarkByContentRequestDto
{
    [Required]
    public Guid ModuleId { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;
}
