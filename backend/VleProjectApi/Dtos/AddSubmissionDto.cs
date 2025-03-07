namespace VleProjectApi.Dtos;

public class AddSubmissionDto
{
    public IFormFile? File { get; set; }
    public Guid ContentId { get; set; }
    public Guid ModuleId { get; set; }
    public Guid PageId { get; set; }
    public string FileName { get; set; } = string.Empty;
}
