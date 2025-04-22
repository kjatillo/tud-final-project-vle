using System.ComponentModel.DataAnnotations;

namespace VleProjectApi.Dtos;

public class MarkByContentRequestDto
{
    public Guid? ModuleId { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;
}
