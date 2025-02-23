namespace VleProjectApi.Dtos;

public class AddContentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
    public string FileType { get; set; } = string.Empty;
    public bool IsLink { get; set; }
    public string LinkUrl { get; set; } = string.Empty;
}
