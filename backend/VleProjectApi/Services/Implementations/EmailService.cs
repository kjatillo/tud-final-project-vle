using System.Net;
using System.Net.Mail;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly string _gmailUsername;
    private readonly string _gmailAppPassword;

    public EmailService(IConfiguration configuration)
    {
        _gmailUsername = configuration["EmailSettings:GmailUsername"] ??
            throw new ArgumentNullException("Gmail username is not configured");
        _gmailAppPassword = configuration["EmailSettings:GmailAppPassword"] ??
            throw new ArgumentNullException("Gmail app password is not configured");
    }

    /// <summary>
    /// Sends an email asynchronously using Gmail SMTP.
    /// </summary>
    /// <param name="to">The recipient's email address.</param>
    /// <param name="subject">The subject of the email.</param>
    /// <param name="body">The body content of the email.</param>
    /// <param name="from">The sender's email address for the reply-to header.</param>
    /// <exception cref="Exception">Thrown when the email fails to send.</exception>
    public async Task SendEmailAsync(string to, string subject, string body, string from)
    {
        var message = new MailMessage
        {
            From = new MailAddress(_gmailUsername),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(to);
        message.ReplyToList.Add(new MailAddress(from));

        using var client = new SmtpClient("smtp.gmail.com")
        {
            Port = 587,
            Credentials = new NetworkCredential(_gmailUsername, _gmailAppPassword),
            EnableSsl = true
        };

        try
        {
            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to send email: {ex.Message}", ex);
        }
    }
}
