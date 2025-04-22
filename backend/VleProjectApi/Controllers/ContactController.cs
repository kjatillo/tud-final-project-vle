using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using VleProjectApi.Dtos;
using VleProjectApi.Hubs;
using VleProjectApi.Repositories.Interfaces;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly INotificationRepository _notificationRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public ContactController(
        IEmailService emailService,
        IConfiguration configuration,
        INotificationRepository notificationRepository,
        IHubContext<NotificationHub> hubContext)
    {
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    /// <summary>
    /// Submits a contact form, sends an email to the site admin, and creates notifications for all admin users.
    /// </summary>
    /// <param name="contactDto">The contact form data containing name, email, subject, and message.</param>
    /// <returns>A success message if the contact form is submitted successfully, otherwise an error message.</returns>
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitContactForm(ContactDto contactDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { Status = "Error", Message = "Invalid contact form data." });
        }

        try
        {
            var gmailAddress = _configuration["EmailSettings:GmailUsername"];
            if (string.IsNullOrEmpty(gmailAddress))
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { Status = "Error", Message = "Email service is not properly configured." });
            }

            var emailBody = $"VLE Project - Contact Form Submission\n\n" +
                           $"Name: {contactDto.Name}\n" +
                           $"Email: {contactDto.Email}\n" +
                           $"\n{contactDto.Message}";

            await _emailService.SendEmailAsync(
                gmailAddress,
                $"TUD Y4 Project | {contactDto.Subject}",
                emailBody,
                contactDto.Email);

            var notificationMessage = $"New contact form submission from {contactDto.Name}: {contactDto.Subject}";
            var result = await _notificationRepository.CreateAdminNotificationAsync(notificationMessage);

            if (result)
            {
                await _hubContext.Clients.Group("AdminGroup").SendAsync("ReceiveAdminNotification", notificationMessage);
            }

            return Ok(new { Status = "Success", Message = "Your message has been sent successfully!" });
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = "Failed to send your message. Please try again later." });
        }
    }
}
