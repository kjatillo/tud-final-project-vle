namespace VleProjectApi.Models;

public class Module
{
    public Guid ModuleId { get; set; } = Guid.NewGuid();
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
}
