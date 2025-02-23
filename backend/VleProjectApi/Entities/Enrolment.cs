namespace VleProjectApi.Entities;

public class Enrolment
{
    public Guid EnrolmentId { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public Guid ModuleId { get; set; } = Guid.Empty;
    public DateTime EnrolmentDate { get; set; } = DateTime.Now;
}
