namespace VleProjectApi.Dtos;

public class EditModuleDto
{
    public string ModuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
