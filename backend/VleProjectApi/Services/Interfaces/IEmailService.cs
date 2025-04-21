namespace VleProjectApi.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, string from);
}
