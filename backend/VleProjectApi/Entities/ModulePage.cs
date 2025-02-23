namespace VleProjectApi.Entities;

public class ModulePage
{
    public Guid PageId { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;

    public ICollection<ModuleContent> Contents { get; set; } = new List<ModuleContent>();
}
