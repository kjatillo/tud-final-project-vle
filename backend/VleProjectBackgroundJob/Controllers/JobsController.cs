using Hangfire;
using Microsoft.AspNetCore.Mvc;
using VleProjectBackgroundJob.Jobs.Interfaces;

namespace VleProjectBackgroundJob.Controllers;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly IAssignmentNotificationJob _assignmentNotificationJob;

    public JobsController(IAssignmentNotificationJob assignmentNotificationJob)
    {
        _assignmentNotificationJob = assignmentNotificationJob ?? 
            throw new ArgumentNullException(nameof(assignmentNotificationJob));
    }

    /// <summary>
    /// Triggers the assignment notification job to notify students immediately.
    /// </summary>
    /// <returns>An IActionResult indicating the result of the operation.</returns>
    [HttpPost("trigger-assignment-notifications")]
    public async Task<IActionResult> TriggerAssignmentNotifications()
    {
        await _assignmentNotificationJob.NotifyStudentsAsync();

        return Ok("Assignment notification job triggered successfully.");
    }

    /// <summary>
    /// Enqueues the assignment notification job to notify students at a later time.
    /// </summary>
    /// <returns>An IActionResult indicating the result of the operation.</returns>
    [HttpPost("enqueue-assignment-notifications")]
    public IActionResult EnqueueAssignmentNotifications()
    {
        BackgroundJob.Enqueue(() => _assignmentNotificationJob.NotifyStudentsAsync());

        return Ok("Assignment notification job enqueued successfully.");
    }
}
