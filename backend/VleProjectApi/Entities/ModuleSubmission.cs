namespace VleProjectApi.Entities;

public class ModuleSubmission
{
    public Guid SubmissionId { get; set; } = Guid.NewGuid();
    public Guid ContentId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateTime SubmittedDate { get; set; }
    public double? Grade { get; set; }
    public string? Feedback { get; set; }
}
