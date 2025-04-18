using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Hubs;
using VleProjectApi.Repositories.Interfaces;
using VleProjectApi.Dtos;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public NotificationsController(
        INotificationRepository notificationRepository,
        IModuleRepository moduleRepository,
        IEnrolmentRepository enrolmentRepository,
        IHubContext<NotificationHub> hubContext,
        UserManager<ApplicationUser> userManager)
    {
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Retrieves all notifications for the currently logged-in user.
    /// </summary>
    /// <returns>A list of notifications or an unauthorized response if the user is not logged in.</returns>
    [HttpGet]
    public async Task<IActionResult> GetUserNotifications()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var notifications = await _notificationRepository.GetUserNotificationsAsync(user.Id);

        return Ok(notifications);
    }

    /// <summary>
    /// Marks a specific notification as read for the logged-in user.
    /// </summary>
    /// <param name="notificationId">The unique ID of the notification to mark as read.</param>
    /// <returns>A success message or an error if the notification is not found.</returns>
    [HttpPost("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await _notificationRepository.MarkAsReadAsync(notificationId);
        if (!result)
        {
            return NotFound("Notification not found");
        }

        return Ok(new { Status = "Success", Message = "Notification marked as read" });
    }

    /// <summary>
    /// Marks all notifications as read for the logged-in user.
    /// </summary>
    /// <returns>A success message after marking all notifications as read.</returns>
    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await _notificationRepository.MarkAllAsReadAsync(user.Id);

        return Ok(new { Status = "Success", Message = "All notifications marked as read" });
    }

    /// <summary>
    /// Marks a notification as read based on its content and module for the logged-in user.
    /// </summary>
    /// <param name="request">The request containing the module ID and message to identify the notification.</param>
    /// <returns>A success message or an error if the notification is not found.</returns>
    [HttpPost("mark-by-content")]
    public async Task<IActionResult> MarkAsReadByContent([FromBody] MarkByContentRequestDto request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await _notificationRepository.MarkAsReadByContentAsync(user.Id, request.ModuleId, request.Message);
        if (!result.Success)
        {
            return NotFound(new { Status = "Error", Message = "Notification not found" });
        }

        return Ok(new
        {
            Status = "Success",
            Message = "Notification marked as read by content"
        });
    }

    /// <summary>
    /// Deletes a specific notification for the logged-in user.
    /// </summary>
    /// <param name="notificationId">The unique ID of the notification to delete.</param>
    /// <returns>A success message or an error if the notification is not found.</returns>
    [HttpDelete("{notificationId}")]
    public async Task<IActionResult> DeleteNotification(Guid notificationId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await _notificationRepository.DeleteNotificationAsync(notificationId);
        if (!result)
        {
            return NotFound("Notification not found");
        }

        return Ok(new { Status = "Success", Message = "Notification deleted successfully" });
    }

    /// <summary>
    /// Deletes all notifications for the logged-in user.
    /// </summary>
    /// <returns>A success message after deleting all notifications.</returns>
    [HttpDelete]
    public async Task<IActionResult> DeleteAllNotifications()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await _notificationRepository.DeleteAllNotificationsAsync(user.Id);
        return Ok(new { Status = "Success", Message = "All notifications deleted successfully" });
    }

    /// <summary>
    /// Sends a grade notification to all students enrolled in a specific module.
    /// </summary>
    /// <param name="request">The request containing the module ID, message, and optional module title.</param>
    /// <returns>A success message or an error if the module does not exist or has no enrolled students.</returns>
    [HttpPost("send-grade-notification")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> SendGradeNotification([FromBody] GradeNotificationRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Message))
        {
            return BadRequest(new { Status = "Error", Message = "Message is required" });
        }

        var moduleExists = await _moduleRepository.ModuleExistsAsync(request.ModuleId);
        if (!moduleExists)
        {
            return BadRequest(new { Status = "Error", Message = $"Module with ID {request.ModuleId} does not exist" });
        }

        var enrollmentCount = await _enrolmentRepository.GetModuleEnrolmentsCountAsync(request.ModuleId);
        if (enrollmentCount == 0)
        {
            return BadRequest(new { Status = "Error", Message = $"No students enrolled in module with ID {request.ModuleId}" });
        }

        var result = await _notificationRepository.CreateModuleNotificationsAsync(
            request.ModuleId,
            request.Message,
            request.ModuleTitle ?? "Module");

        if (!result)
        {
            return BadRequest(new { Status = "Error", Message = "Failed to create notifications. Check server logs for details." });
        }

        await _hubContext.Clients.Group($"module-{request.ModuleId}")
            .SendAsync("ReceiveGradeNotification", request.Message, request.ModuleId, request.ModuleTitle ?? "Module");

        return Ok(new { Status = "Success", Message = "Notifications sent successfully" });
    }
}
