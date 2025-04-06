using System.Text;
using VleProjectBackgroundJob.Services.Interfaces;

namespace VleProjectBackgroundJob.Services;

public class EmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _domain;
    private readonly string _senderEmail;

    public EmailService(IConfiguration configuration)
    {
        _apiKey = configuration["MailgunSettings:ApiKey"];
        _domain = configuration["MailgunSettings:Domain"];
        _senderEmail = configuration["MailgunSettings:SenderEmail"];
    }

    /// <summary>
    /// Sends an email asynchronously using the Mailgun API.
    /// </summary>
    /// <param name="to">The recipient's email address.</param>
    /// <param name="subject">The subject of the email.</param>
    /// <param name="body">The body content of the email.</param>
    /// <exception cref="Exception">Thrown when the email fails to send.</exception>
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", "Basic " +
            Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{_apiKey}")));

        var form = new MultipartFormDataContent
        {
            { new StringContent(_senderEmail), "from" },
            { new StringContent(to), "to" },
            { new StringContent(subject), "subject" },
            { new StringContent(body), "text" }
        };

        var response = await client.PostAsync($"https://api.mailgun.net/v3/{_domain}/messages", form);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to send email. Status Code: {response.StatusCode}, " +
                $"Response: {await response.Content.ReadAsStringAsync()}");
        }
    }
}
