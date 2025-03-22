namespace VleProjectApi.Entities;

public class ModulePage
{
    public Guid PageId { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
}
