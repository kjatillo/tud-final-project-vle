namespace VleProjectBackgroundJob.Entities;

public class ModulePage
{
    public Guid PageId { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;

    // Navigation Properties
    public Module Module { get; set; }
    public ICollection<ModuleContent> ModuleContents { get; set; } = new List<ModuleContent>();
    public ICollection<ModuleSubmission> ModuleSubmissions { get; set; } = new List<ModuleSubmission>();
}

