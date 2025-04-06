namespace VleProjectBackgroundJob.Entities;

public class Enrolment
{
    public Guid EnrolmentId { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public Guid ModuleId { get; set; } = Guid.Empty;
    public DateTime EnrolmentDate { get; set; } = DateTime.Now;

    // Nagivation Property
    public virtual ApplicationUser User { get; set; }
}

