namespace VleProjectApi.Entities;

public class ModuleContent
{
    public Guid ContentId { get; set; } = Guid.NewGuid();
    public Guid PageId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public bool IsLink { get; set; }
    public string LinkUrl { get; set; } = string.Empty;
    public bool IsUpload { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime UploadedDate { get; set; } = DateTime.Now;
}
