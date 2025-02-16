using System.ComponentModel.DataAnnotations;

namespace VleProjectApi.Dtos;

public class UploadLectureNoteDto
{
    [Required]
    public IFormFile? File { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;
}
