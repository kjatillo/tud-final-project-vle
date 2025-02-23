using System.ComponentModel.DataAnnotations;

namespace VleProjectApi.Dtos;

public class AddPageDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
}
