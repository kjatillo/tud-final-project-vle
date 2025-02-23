namespace VleProjectApi.Entities;

public class ModuleFile
{
    public Guid ModuleFileId { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime UploadedDate { get; set; } = DateTime.Now;

    public Module? Module { get; set; }
}
