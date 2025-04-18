using System.ComponentModel.DataAnnotations.Schema;

namespace VleProjectApi.Entities;

public class Enrolment
{
    public Guid EnrolmentId { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public Guid ModuleId { get; set; } = Guid.Empty;
    public DateTime EnrolmentDate { get; set; } = DateTime.Now;

    // Navigation Properties
    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }

    [ForeignKey("ModuleId")]
    public Module? Module { get; set; }
}
