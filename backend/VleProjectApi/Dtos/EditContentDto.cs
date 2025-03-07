namespace VleProjectApi.Dtos;

public class EditContentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsLink { get; set; }
    public string LinkUrl { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
    public bool IsUpload { get; set; }
    public DateTime? Deadline { get; set; }
}
