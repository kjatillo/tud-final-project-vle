namespace VleProjectBackgroundJob.Jobs.Interfaces;

public interface IAssignmentNotificationJob
{
    Task NotifyStudentsAsync();
}
