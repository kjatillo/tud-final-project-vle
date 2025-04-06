using VleProjectBackgroundJob.DbContexts;
using VleProjectBackgroundJob.Jobs.Interfaces;
using VleProjectBackgroundJob.Services.Interfaces;

namespace VleProjectBackgroundJob.Jobs;

public class AssignmentNotificationJob : IAssignmentNotificationJob
{
    private readonly IEmailService _emailService;
    private readonly ILogger<AssignmentNotificationJob> _logger;
    private readonly List<string> _authorisedReceivingEmails;
    private readonly VleDbContext _context;

    public AssignmentNotificationJob(
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AssignmentNotificationJob> logger,
        VleDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _authorisedReceivingEmails = configuration
            .GetSection("AuthorizedReceivingEmails").Get<List<string>>() ?? new List<string>();
    }

    /// <summary>
    /// Notifies students about their assignments that are due tomorrow.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public async Task NotifyStudentsAsync()
    {
        try
        {
            var tomorrow = DateTime.Now.AddDays(1).Date;

            // Get the list of assignments due tomorrow and the students who have not submitted them
            var notifyList = _context.ModuleContents
                .Where(mc => mc.IsUpload && mc.Deadline.HasValue && mc.Deadline.Value.Date == tomorrow)
                .SelectMany(mc => _context.Enrolments
                    .Where(e => e.ModuleId == mc.ModulePage.ModuleId)
                    .Select(e => new
                    {
                        ModuleTitle = mc.ModulePage.Module.ModuleName,
                        Assignment = mc,
                        StudentEmail = e.User.Email,
                        HasSubmitted = _context.ModuleSubmissions
                            .Any(ms => ms.ContentId == mc.ContentId && ms.UserId == e.UserId)
                    }))
                .Where(x => !x.HasSubmitted)
                .ToList();

            foreach (var notification in notifyList)
            {
                if (notification.StudentEmail != null && _authorisedReceivingEmails.Contains(notification.StudentEmail))
                {
                    await _emailService.SendEmailAsync(notification.StudentEmail, $"Assignment Reminder - {notification.ModuleTitle}",
                        $"Your assignment '{notification.Assignment.Title}' is due tomorrow ({notification.Assignment.Deadline:dd MMMM yyyy h:mm tt}). " +
                        $"Please make sure to submit it on time.\n\nKind regards,\nVLE Admin");
                }
                else
                {
                    _logger.LogInformation("Unauthorised email skipped due MailGun service allowed emails limitation.");
                }
            }

            _logger.LogInformation($"({notifyList.Count()}) Assignment notifications sent successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in AssignmentNotificationJob: {ex.Message}");
        }
    }
}
