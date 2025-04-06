namespace VleProjectBackgroundJob.Entities;

public class Module
{
    public Guid ModuleId { get; set; } = Guid.NewGuid();
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ModuleInstructor { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public decimal Price { get; set; }

    // Navigation Property
    public ICollection<ModulePage> ModulePages { get; set; } = new List<ModulePage>();
}
